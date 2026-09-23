<template>
  <view class="fx67ll-reservation-box">
    <!-- 全局遮罩层：仅手动刷新与提交预约时展示，页面初始化与切换日期不展示 -->
    <view v-if="loading || isManualRefreshing" class="loading-mask">
      <view class="loading-content">
        <view v-if="isManualRefreshing" class="loading-spin">
          <uni-icons type="refresh" color="#2ecc71" size="28"></uni-icons>
        </view>
        <text class="loading-text">{{ isManualRefreshing ? "正在刷新..." : "加载数据中..." }}</text>
      </view>
    </view>

    <!-- 麻将室介绍入口：点击后底部抽屉展示介绍富文本 -->
    <view class="room-intro-entry" @click="openRoomDrawer">
      <view class="room-intro-entry-left">
        <uni-icons type="shop" color="#2ecc71" size="20"></uni-icons>
        <text class="room-intro-entry-title">麻将室介绍</text>
      </view>
      <view class="room-intro-entry-right">
        <text class="room-intro-entry-tip">预约前先了解一下</text>
        <uni-icons type="arrowright" color="#c0c4cc" size="14"></uni-icons>
      </view>
    </view>

    <!-- 预约时段组件容器：左右留白与麻将室介绍入口容器对齐，等待初始查询完成后再渲染子组件 -->
    <view class="pretty-times-wrapper">
      <prettyTimes v-if="isDataLoaded" ref="prettyTimes" :showOvernight="appointConfig.showOvernight"
        :beginTime="appointConfig.allowBeginTime" :endTime="appointConfig.allowEndTime"
        :timeInterval="appointConfig.allowTimeInterval" :appointTime="appointConfig.appointTime" :isSection="true"
        :disableTimeSlot="appointConfig.disableTimeSlot" :myAppointTimeSlot="appointConfig.myAppointTimeSlot"
        :formParams="formParams" @change="handleTimeChange" @date-change="handleDateChange"
        @ready="handleComponentReady" @overnight-change="handleOvernightChange">
      </prettyTimes>
    </view>

    <!-- 底部操作按钮容器（放入文档流，适配安全区域） -->
    <view class="submit-btn-container">
      <!-- 手动刷新按钮：黄底白字文字按钮（与提交按钮同构，无描边），点击后重新查询当日预约数据 -->
      <view class="refresh-btn" :class="{ 'refresh-btn-loading': isManualRefreshing }" @click="handleManualRefresh">
        <view :class="['refresh-btn-icon', isManualRefreshing ? 'refresh-btn-spinning' : '']">
          <uni-icons type="refresh" color="#ffffff" size="16"></uni-icons>
        </view>
        <text>{{ isManualRefreshing ? "刷新中" : "刷新" }}</text>
      </view>
      <button class="submit-btn" @click="handleSubmitReservation">
        <view class="submit-btn-icon">
          <uni-icons type="checkmarkempty" color="#ffffff" size="16"></uni-icons>
        </view>
        <text>提交预约</text>
      </button>
    </view>

    <!-- 麻将室介绍抽屉 -->
    <roomDrawer :isShowRoomDrawer="isShowRoomDrawer" @hideDrawer="closeRoomDrawer" />

    <!-- 提交预约二次确认弹窗 -->
    <submitConfirmPopup :isShow="isShowSubmitConfirm" :timeRange="reservationTimeText" @close="closeSubmitConfirm"
      @confirm="confirmSubmitReservation" />
  </view>
</template>

<script>
// 预约时段选择组件，已移除组件内置的确认预约按钮，提交入口仅保留页面底部的提交预约按钮
import prettyTimes from "@/pages/mahjong/component/pretty-times/pretty-times.vue";
import roomDrawer from "@/pages/mahjong/component/roomDrawer.vue";
import submitConfirmPopup from "@/pages/mahjong/component/submitConfirmPopup.vue";
import { listMahjongReservationLog, addMahjongReservationLog } from "@/api/fx67ll/mahjong/log"

// 日期时间处理

import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

// 引入underscore库用于防抖
import _ from "@/node_modules/underscore";

export default {
  components: { prettyTimes, roomDrawer, submitConfirmPopup },
  data() {
    return {
      appointConfig: {
        showOvernight: true,
        allowBeginTime: "10:00:00",
        allowEndTime: "22:00:00",
        allowTimeInterval: 1,
        appointTime: [],
        disableTimeSlot: [],
        myAppointTimeSlot: []
      },
      logList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 999,
        mahjongRoomId: 1,
        reservationDate: '',
        reservationStatus: '',
        isNeedAll: true,
      },
      formParams: {
        mahjongRoomId: 1,
        reservationStartTime: null,
        reservationEndTime: null,
        reservationStatus: null,
      },
      nowDateInfo: {},
      isOvernightSelected: false,  // 标记是否选择了包夜
      // 防抖函数实例
      debouncedSubmitReservation: null,
      // 提交预约时的加载状态（控制全局遮罩展示）
      loading: false,
      // 是否正在手动刷新（控制刷新按钮图标旋转与全局遮罩展示）
      isManualRefreshing: false,
      // 首次进入页面时onLoad已完成当日数据查询，onShow需跳过一次避免重复请求
      needSkipFirstOnShow: true,
      // 标记初始查询是否完成
      isDataLoaded: false,
      // 是否显示麻将室介绍抽屉
      isShowRoomDrawer: false,
      // 是否显示提交预约二次确认弹窗
      isShowSubmitConfirm: false,
      // 提交确认弹窗中展示的预约时间段文本
      reservationTimeText: ""
    };
  },
  onShow() {
    // 首次进入时onLoad的initData已完成当日数据查询，跳过本次onShow避免重复请求；再次回到页面时刷新当日预约
    if (this.needSkipFirstOnShow) {
      this.needSkipFirstOnShow = false;
      return;
    }
    this.handleDateChange(this.nowDateInfo);
  },
  onLoad() {
    // 1. 初始化当日日期（与组件返回的 selectedDate 格式一致：YYYY-MM-DD）
    const today = moment().format('YYYY-MM-DD');
    const todayWeek = moment().format('dddd'); // 获取星期（如 "Monday"，可按需转换为 "周一"）
    // 2. 初始化 nowDateInfo（匹配 handleDateChange 所需的参数结构）
    this.nowDateInfo = {
      selectedDate: today,
      selectedWeek: todayWeek, // 转换为中文星期（见步骤3的工具方法）
      activeIndex: 0 // 当日在日期列表中的索引（默认第1个）
    };
    // 3. 初始化查询参数（使用当日日期）
    this.queryParams.reservationDate = today.replace(/-/g, ""); // 转为后端需要的 YYYYMMDD 格式
    this.queryParams.pageNum = 1;
    this.queryParams.pageSize = 999;

    // 4. 初始化防抖函数
    this.debouncedSubmitReservation = _.debounce(this._realHandleSubmitReservation, 500, true);

    // 5. 首次加载数据：请求完成后再标记数据加载完成
    this.initData();
  },
  methods: {
    // 打开麻将室介绍抽屉
    openRoomDrawer() {
      this.isShowRoomDrawer = true;
    },
    // 关闭麻将室介绍抽屉
    closeRoomDrawer() {
      this.isShowRoomDrawer = false;
    },
    // 初始化数据方法，等待首次查询完成（初始化不展示全局加载动画）
    async initData() {
      try {
        // 等待查询请求完成
        await this.queryReservationList();
        // 请求完成后，标记数据加载完成，渲染子组件
        this.isDataLoaded = true;
      } catch (error) {
        // 异常处理：即使有请求失败，也标记加载完成，避免页面卡死
        this.isDataLoaded = true;
        this.clearLogList();
        uni.showToast({
          title: "初始化数据失败！",
          icon: "none",
          duration: 1998,
        });
      }
    },

    // 子组件渲染完成后，同步初始日期到父组件 nowDateInfo
    handleComponentReady() {
      // 子组件的 dateArr 是生成的日期列表，取第一个（默认选中的当日）
      const initDate = this?.$refs?.prettyTimes?.dateArr?.[0] || null;
      if (initDate) {
        this.nowDateInfo = {
          selectedDate: initDate.date,
          selectedWeek: initDate.week,
          activeIndex: 0
        };
      }
    },
    clearLogList() {
      this.logList = [];
      this.appointConfig.disableTimeSlot = [];
      this.appointConfig.myAppointTimeSlot = [];
    },
    // 查询预约历史记录 - 返回Promise（单次查询返回当日全部记录，我的预约时段由前端按用户名筛选，避免进入页面时重复请求）
    queryReservationList() {
      const self = this;

      this.queryParams.pageNum = 1;
      this.queryParams.pageSize = 999;
      this.queryParams.isNeedAll = true;

      // 返回Promise，便于外部等待
      return new Promise((resolve, reject) => {
        listMahjongReservationLog(self.queryParams)
          .then((res) => {
            if (res?.code === 200) {
              if (res?.rows && res?.rows?.length > 0) {
                self.logList = res?.rows || [];
                const myUserName = self.$store.state.user.name;
                const allTimeSlot = [];
                const myTimeSlot = [];
                // 一次遍历同时生成全部禁用时段与我的预约时段
                (res?.rows || [])
                  // 第一步：过滤出 reservationStatus 等于 '0' 的数据
                  ?.filter(item => item.reservationStatus === '0')
                  // 第二步：对过滤后的数据处理时间，生成时间段
                  ?.forEach(item => {
                    const startTime = moment(item.reservationStartTime).format('YYYY-MM-DD HH:mm:ss');
                    let endTime = moment(item.reservationEndTime);
                    const currentTime = moment();
                    // 如果结束时间晚于当前时间前1小时，则调整为当前时间前1小时
                    if (endTime.isAfter(currentTime.subtract(1, 'hours'))) {
                      endTime = endTime.subtract(1, 'hours');
                    }
                    const timeSlot = [startTime, endTime.format('YYYY-MM-DD HH:mm:ss')];
                    allTimeSlot.push(timeSlot);
                    // 记录携带的用户名与当前登录用户名一致时，视为我的预约
                    if (item.userName && item.userName === myUserName) {
                      myTimeSlot.push(timeSlot);
                    }
                  });

                self.appointConfig.disableTimeSlot = allTimeSlot;
                self.appointConfig.myAppointTimeSlot = myTimeSlot;
              } else {
                self.clearLogList();
              }
              resolve(res);
            } else {
              self.clearLogList();
              uni.showToast({
                title: "查询预约订单记录失败！",
                icon: "none",
                duration: 1998,
              });
              resolve(res); // 即使失败也resolve，让调用方能继续执行
            }
          })
          .catch((res) => {
            self.clearLogList();
            reject(res);
          });
      });
    },
    // 包夜变化事件处理
    handleOvernightChange(overnightData) {
      if (overnightData) {
        this.isOvernightSelected = true;
        this.formParams.reservationStartTime = overnightData.start;
        this.formParams.reservationEndTime = moment(overnightData.end).subtract(1, 'h').format('YYYY-MM-DD HH:mm:ss');
      } else {
        this.isOvernightSelected = false;
        this.formParams.reservationStartTime = null;
        this.formParams.reservationEndTime = null;
      }
    },
    // 时间范围点击监听
    handleTimeChange(timeArr) {
      const self = this;

      // 选择普通时间时，取消包夜标记
      this.isOvernightSelected = false;

      let startTime = timeArr?.beginTime || '';
      let endTime = timeArr?.endTime || '';

      this.formParams = {
        ...self.formParams,
        reservationStartTime: startTime,
        reservationEndTime: endTime,
      }
    },
    // 日期切换监听
    handleDateChange(dateInfo) {
      this.nowDateInfo = dateInfo;
      // console.log('当前选中的日期：',dateInfo.selectedDate);
      // console.log('当前选中的星期：', dateInfo.selectedWeek);
      // console.log('选中日期的索引：', dateInfo.activeIndex);
      const dateStr = dateInfo?.selectedDate?.replace(/-/g, "") || '';
      this.queryParams.reservationDate = dateStr;

      // 日期切换时静默刷新当日预约数据，不展示全局加载动画
      this.queryReservationList().catch(() => { });
    },
    // 手动刷新当日预约数据（导航栏右侧刷新按钮触发）
    handleManualRefresh() {
      // 刷新过程中不重复触发
      if (this.isManualRefreshing) {
        return;
      }
      this.isManualRefreshing = true;
      // 加载动画最短展示时长，防止接口响应过快导致动画闪烁
      const minShowDuration = 800;
      const startStamp = Date.now();
      this.queryReservationList()
        .catch(() => { })
        .then(() => {
          // 请求完成后补足最短展示时长再关闭加载动画
          const remainDuration = minShowDuration - (Date.now() - startStamp);
          setTimeout(() => {
            this.isManualRefreshing = false;
          }, Math.max(remainDuration, 0));
        });
    },
    // 提交预约 - 添加防抖处理
    handleSubmitReservation() {
      // 调用防抖函数
      this.debouncedSubmitReservation();
    },

    // 实际的提交预约逻辑（原handleSubmitReservation方法内容）
    _realHandleSubmitReservation() {
      // 如果已经通过包夜提交事件处理，则不再重复处理
      if (this.isOvernightSelected && this.formParams.reservationStartTime && this.formParams.reservationEndTime) {
        this.showSubmitConfirm();
        return;
      }

      this.formParams.mahjongRoomId = 1;
      this.formParams.reservationStatus = 0;

      // 检查时间是否为空
      if (!this.formParams.reservationStartTime || !this.formParams.reservationEndTime) {
        uni.showToast({
          title: "请选择完整的预约时间段！",
          icon: "none",
          duration: 1998,
        });
        return; // 阻止提交
      }

      // 处理时间逻辑
      const start = moment(this.formParams.reservationStartTime);
      const end = moment(this.formParams.reservationEndTime);

      // 如果开始时间晚于结束时间，则自动对调
      if (start.isAfter(end)) {
        // 交换时间值
        [this.formParams.reservationStartTime, this.formParams.reservationEndTime] =
          [this.formParams.reservationEndTime, this.formParams.reservationStartTime];
      }

      this.showSubmitConfirm();
    },
    // 打开提交预约二次确认弹窗
    showSubmitConfirm() {
      this.reservationTimeText = this.buildReservationTimeText();
      this.isShowSubmitConfirm = true;
    },
    // 组装预约时间段展示文本
    buildReservationTimeText() {
      const start = this.formParams.reservationStartTime;
      const end = this.formParams.reservationEndTime;
      if (this.isOvernightSelected) {
        return `${moment(start).format('YYYY-MM-DD')} 23:00 ~ 次日10:00（包夜）`;
      }
      return `${moment(start).format('YYYY-MM-DD HH:mm')} ~ ${moment(end).format('HH:mm')}`;
    },
    // 取消提交预约
    closeSubmitConfirm() {
      this.isShowSubmitConfirm = false;
    },
    // 确认提交预约
    confirmSubmitReservation() {
      this.isShowSubmitConfirm = false;
      this.submitReservation();
    },
    // 统一的提交方法
    submitReservation() {
      const self = this;
      // 提交预约时显示加载状态
      this.loading = true;
      this.formParams.reservationEndTime = moment(self.formParams.reservationEndTime).add(1, 'h').format('YYYY-MM-DD HH:mm:ss');
      addMahjongReservationLog(self.formParams)
        .then((res) => {
          if (res?.code === 200) {
            // 提交成功后刷新数据
            this.queryReservationList()
              .then(() => {
                // 重置表单
                this.formParams.reservationStartTime = null;
                this.formParams.reservationEndTime = null;
                this.isOvernightSelected = false;

                uni.showToast({
                  title: "提交预约订单成功！",
                  icon: "none",
                  duration: 1998,
                });
              })
              .catch(() => { });
          } else {
            uni.showToast({
              title: "提交预约订单失败！",
              icon: "none",
              duration: 1998,
            });
            // 提交失败后刷新当前预约记录
            this.queryReservationList().catch(() => { });
          }
        })
        .catch((res) => {
          uni.showToast({
            title: "提交预约订单失败！",
            icon: "none",
            duration: 1998,
          });
          // 提交失败后刷新当前预约记录
          this.queryReservationList().catch(() => { });
        })
        .finally(() => {
          // 提交完成（成功/失败）后隐藏加载状态
          this.loading = false;
          // 通过ref获取组件实例，调用清除方法
          this.$refs.prettyTimes.clearSelected();
        });
    }
  },
};
</script>

<style lang="scss">
page {
  background-color: #ffffff;
  padding-bottom: 220rpx;
  box-sizing: border-box;
}

.fx67ll-reservation-box {
  /* 确保容器占满页面，按钮自然下沉到文档流底部 */
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 预约时段组件容器：左右留白与麻将室介绍入口容器对齐，视觉统一 */
.pretty-times-wrapper {
  margin: 20rpx 30rpx 0;
}

/* 麻将室介绍入口 */
.room-intro-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20rpx 30rpx 0;
  padding: 26rpx 30rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.12) 0%, rgba(46, 204, 113, 0.04) 100%);
  border: 1rpx solid rgba(46, 204, 113, 0.25);
  transition: all 0.25s ease;

  &:active {
    transform: scale(0.98);
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.2) 0%, rgba(46, 204, 113, 0.08) 100%);
  }

  .room-intro-entry-left {
    display: flex;
    align-items: center;

    .room-intro-entry-title {
      margin-left: 12rpx;
      font-size: 30rpx;
      font-weight: bold;
      color: #1e8449;
    }
  }

  .room-intro-entry-right {
    display: flex;
    align-items: center;

    .room-intro-entry-tip {
      margin-right: 8rpx;
      font-size: 24rpx;
      color: #909399;
    }
  }
}

/* 手动刷新按钮：黄底白字文字按钮，与提交按钮（绿底白字）同构无描边，语义黄色与主题绿区分主次 */
.refresh-btn {
  width: 168rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: #e6a23c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #ffffff;
  transition: all 0.25s ease;

  &:active {
    background-color: #cf9236;
    transform: scale(0.95);
  }

  &.refresh-btn-loading {
    opacity: 0.75;
  }

  .refresh-btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8rpx;
  }

  .refresh-btn-spinning {
    animation: fx67ll-refresh-rotate 1s linear infinite;
  }
}

/* 刷新图标旋转动画 */
@keyframes fx67ll-refresh-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 底部操作按钮容器（放入文档流，通过margin-top自动填充剩余空间） */
.submit-btn-container {
  width: 100%;
  padding: 20rpx 30rpx;
  padding-bottom: 220rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

/* 提交按钮样式 */
.submit-btn {
  flex: 1;
  margin: 0 0 0 20rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2ecc71;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 40rpx; // 圆角样式
  transition: all 0.25s ease;

  &:active {
    background-color: #1e8449;
    transform: scale(0.95);
  }

  .submit-btn-icon {
    display: flex;
    align-items: center;
    margin-right: 8rpx;
  }
}

/* 全局遮罩层样式 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  background-color: #ffffff;
  padding: 40rpx 60rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 手动刷新时遮罩内的旋转图标 */
.loading-spin {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  animation: fx67ll-refresh-rotate 1s linear infinite;
}

.loading-text {
  font-size: 32rpx;
  color: #333333;
}
</style>
