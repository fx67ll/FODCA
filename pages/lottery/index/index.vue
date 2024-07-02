<template>
  <view class="fx67ll-tools-box">
    <view class="fx67ll-btn-box">
      <view class="fx67ll-btn-item fx67ll-btn-item-two">
        <button
          class="fx67ll-btn-default"
          type="default"
          @click="getLuckyNumber"
          :disabled="isNetworkLoading || countLoading || isDrawLoading"
        >
          获取今日随机号码
        </button>
        <uni-icons
          class="fx67ll-btn-icon"
          type="gear-filled"
          :size="iconSize"
          @click="editLuckySetting"
          v-if="!isNetworkLoading && !countLoading && !isDrawLoading"
        ></uni-icons>
        <uni-icons
          class="fx67ll-btn-loading"
          type="spinner-cycle"
          :size="iconSize"
          v-if="isNetworkLoading || countLoading || isDrawLoading"
        ></uni-icons>
      </view>
      <!-- 只允许超级管理员fx67ll使用图片上传自动分析的功能，后续视情况开放 -->
      <view
        class="fx67ll-btn-item fx67ll-btn-item-two"
        v-if="userName && userName === 'fx67ll'"
      >
        <button
          class="fx67ll-btn-default"
          type="default"
          @click="pickImportLuckyImg"
          :disabled="isNetworkLoading || countLoading || isDrawLoading"
        >
          <span v-if="parseInt(pictureUploadNumber) === 0 && !isNetworkLoading"
            >上传照片自动分析</span
          >
          <span v-if="parseInt(pictureUploadNumber) === 0 && isNetworkLoading"
            >正在努力上传中...</span
          >
          <span v-if="parseInt(pictureUploadNumber) !== 0"
            >上传进度:{{ pictureUploadNumber }}%, 正在解析数据中...</span
          >
        </button>
        <uni-icons
          class="fx67ll-btn-icon"
          type="camera-filled"
          :size="iconSize"
          @click="useCamera"
          v-if="!isNetworkLoading && !countLoading && !isDrawLoading"
        ></uni-icons>
        <uni-icons
          class="fx67ll-btn-loading"
          type="spinner-cycle"
          :size="iconSize"
          v-if="isNetworkLoading || countLoading || isDrawLoading"
        ></uni-icons>
      </view>
      <view class="fx67ll-btn-item" v-if="!isDrawLoading">
        <button
          class="fx67ll-btn-default"
          type="warn"
          :disabled="isNetworkLoading"
          @click="fakeDrawLottery(true)"
        >
          {{ drawLotteryText }}
        </button>
      </view>
      <view class="fx67ll-btn-item fx67ll-btn-item-two" v-if="isDrawLoading">
        <button
          class="fx67ll-btn-default"
          type="warn"
          @click="fakeDrawLottery(true)"
          :disabled="isDrawLoading"
        >
          {{ drawLotteryText }}
        </button>
        <uni-icons
          class="fx67ll-btn-icon"
          type="minus"
          :size="iconSize"
          @click="stopDrawLottery"
        ></uni-icons>
      </view>
      <view class="fx67ll-btn-item">
        <button
          class="fx67ll-btn-default"
          type="warn"
          @click="getTodayLucky"
          :disabled="isNetworkLoading || countLoading || isDrawLoading"
        >
          {{
            !countLoading
              ? isDrawLoading
                ? "正在摇奖中，无法计算运势~"
                : "点击看看今天运势如何"
              : `正在为您计算今日运势：${luckyRandomProgrss}%`
          }}
        </button>
      </view>
    </view>
    <view class="fx67ll-lucky-box" v-if="settingInfo.todayLuckyNumber">
      <view class="fx67ll-lucky-bumber">{{
        todayWeek === "5" ? "0" : settingInfo.todayLuckyNumber
      }}</view>
      <view class="fx67ll-lucky-title" @click="handleToLogHistory">今日随机幸运数字</view>
    </view>

    <!-- 页面底部抽屉 -->
    <zb-drawer
      mode="bottom"
      :title="drawerTitle"
      :wrapperClosable="false"
      :visible.sync="isShowDrawer"
      :radius="true"
      :height="drawerHeight"
      :before-close="handleDrawerClose"
    >
      <view v-if="showType === 'luckyNumber'">
        <view id="luckyNumberText" class="fx67ll-number-box">
          <view
            class="fx67ll-number-item"
            v-for="item in luckyNumberList"
            :key="item.timeStamp"
          >
            <span v-for="itemFirst in item.lotteryNumberFirst" :key="itemFirst.key">{{
              itemFirst.num
            }}</span>
            -
            <span v-for="itemSecond in item.lotteryNumberSecond" :key="itemSecond.key">{{
              itemSecond.num
            }}</span>
          </view>
        </view>

        <!-- #ifdef H5 -->
        <view class="fx67ll-drawer-btn-box h5">
          <button class="fx67ll-btn-copy" type="primary" @click="copyLuckyNumber">
            拷贝至剪切板
          </button>
          <button
            class="fx67ll-btn-submit"
            :loading="isNetworkLoading"
            :disabled="isNetworkLoading"
            @click="uploadLuckyNumberDebounce"
          >
            保存到云端
          </button>
        </view>
        <!-- #endif -->

        <!-- #ifdef MP-WEIXIN -->
        <view class="fx67ll-drawer-btn-box">
          <button class="fx67ll-btn-copy" type="primary" @click="copyLuckyNumber">
            拷贝至剪切板
          </button>
          <button
            class="fx67ll-btn-submit"
            :loading="isNetworkLoading"
            :disabled="isNetworkLoading"
            @click="uploadLuckyNumberDebounce"
          >
            保存到云端
          </button>
        </view>
        <!-- #endif -->
      </view>

      <scroll-view
        scroll-y="true"
        class="fx67ll-drawer-img"
        v-if="showType === 'luckyPhoto'"
      >
        <view class="fx67ll-drawer-tip"
          >请注意！每次的分析结果数据不会保存到云端，关闭当前弹窗后将无法再次获取历史识别结果~</view
        >
        <view class="fx67ll-ocr-lottery">
          <view class="fx67ll-drawer-title" v-if="!ocrTagList || ocrTagList.length < 1"
            >本次OCR未识别到文字！</view
          >

          <view class="fx67ll-ocr-btn">
            <button
              type="warn"
              v-if="
                ocrTagList &&
                ocrTagList.length > 0 &&
                ocrTagCheckList &&
                ocrTagCheckList.length > 0
              "
              @click="copyCheckTagText"
            >
              拷贝选中的文字至剪切板
            </button>
          </view>

          <view
            class="fx67ll-drawer-title"
            v-if="
              ocrTagList &&
              ocrTagList.length > 0 &&
              ocrTagCheckList &&
              ocrTagCheckList.length === 0
            "
            >尝试点击识别结果中你需要的的文字分块吧！</view
          >
          <view
            class="fx67ll-drawer-title"
            v-if="
              ocrTagList &&
              ocrTagList.length > 0 &&
              ocrTagCheckList &&
              ocrTagCheckList.length > 0
            "
            >您已选中以下识别结果:</view
          >
          <view class="fx67ll-ocr-result" v-if="ocrTagList && ocrTagList.length > 0">
            <span
              v-for="(item, index) in ocrTagList"
              :key="item.timeStamp"
              :class="{
                'fx67ll-ocr-tag': item.isCheck,
                'fx67ll-ocr-tag-choose': item.isCheck,
              }"
              @click="changeTagStatus(index)"
              ><text v-if="item.isCheck">{{ item.words || "--" }}</text>
            </span>
          </view>

          <view class="fx67ll-drawer-title" v-if="ocrTagList && ocrTagList.length > 0"
            >本次百度OCR识别的结果:</view
          >
          <view class="fx67ll-ocr-result" v-if="ocrTagList && ocrTagList.length > 0">
            <span
              v-for="(item, index) in ocrTagList"
              :key="item.timeStamp"
              :class="{ 'fx67ll-ocr-tag': true, 'fx67ll-ocr-tag-check': item.isCheck }"
              @click="changeTagStatus(index)"
              >{{ item.words || "--" }}
            </span>
          </view>
        </view>

        <view class="fx67ll-ocr-lottery">
          <view class="fx67ll-drawer-title">本次百度OCR识别的照片:</view>
          <!-- <img
            :src="lotteryTicketArr[0]"
            @click="previewImportImg"
            :style="{ width: `${ocrImgDomWidth}` }"
          /> -->
          <image mode="widthFix" :src="lotteryTicketArr[0]" @click="previewImportImg" />
        </view>
      </scroll-view>

      <view class="fx67ll-drawer-setting" v-if="showType === 'luckySetting'">
        <view class="fx67ll-setting-item">
          <span>需要随机输出的注数</span>
          <uni-number-box
            :min="getMinCount"
            :max="getMaxCount"
            v-model="settingInfo.luckyCount"
            @change="luckyCountChange"
          ></uni-number-box>
        </view>
        <view class="fx67ll-setting-item">
          <span>是否允许出现重复串号</span>
          <switch
            class="fx67ll-setting-switch"
            :checked="settingInfo.isNeedRepeat"
            @change="isNeedRepeatChange"
          />
        </view>
        <view class="fx67ll-setting-item">
          <span>当日幸运数字是否要包含在内</span>
          <switch
            class="fx67ll-setting-switch"
            :checked="settingInfo.isNeedLuckyNumber"
            @change="isNeedLuckyNumberChange"
          />
        </view>
        <view class="fx67ll-setting-item">
          <span>当日是否仅允许生成一次随机</span>
          <switch
            class="fx67ll-setting-switch"
            :checked="settingInfo.isOnlyFirstToday"
            @change="isOnlyFirstTodayChange"
          />
        </view>
        <view class="fx67ll-setting-item">
          <span>是否需要总结过往高频中奖号码</span>
          <switch
            class="fx67ll-setting-switch"
            :checked="settingInfo.isNeedAddPastRewardNumber"
            @change="isNeedAddPastChange"
          />
        </view>
        <view class="fx67ll-setting-item" v-if="settingInfo.isNeedAddPastRewardNumber">
          <span>需要总结的过往期数</span>
          <uni-number-box
            :min="1"
            :max="1023"
            v-model="settingInfo.pastCheckCount"
            @change="pastCheckCountChange"
          ></uni-number-box>
        </view>
        <view class="fx67ll-setting-tip">
          Tip-1：修改其他设置会重置
          <text>"当日是否仅允许生成一次随机"</text> 设置，请手动重新配置即可
        </view>
        <view class="fx67ll-setting-tip">
          Tip-2：摇奖设置会自动保存到本地，本地缓存会有丢失风险，请按需保存到云端
        </view>
        <!-- #ifdef H5 -->
        <button
          class="fx67ll-btn-save fx67ll-btn-save-h5"
          type="primary"
          :loading="isNetworkLoading"
          @click="saveLuckySettingDebounce(false)"
        >
          保存设置到云端
        </button>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <button
          class="fx67ll-btn-save"
          type="primary"
          :loading="isNetworkLoading"
          @click="saveLuckySettingDebounce(false)"
        >
          保存设置到云端
        </button>
        <!-- #endif -->
      </view>
    </zb-drawer>
  </view>
</template>

<script>
// 官方组件库
import uniIcons from "@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue";
import uniNumberBox from "@/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue";

// underscores函数库
import _ from "@/node_modules/underscore";

// 日期时间处理
import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

// 各种工具类
import {
  quickSort,
  decryptString,
  mapLotteryNumberType,
  sortNumberByFrequency,
  sortNumberByAscending,
  isTwoOrThreeDaysAfterWithSameYearCheck,
} from "@/utils/index";
import { showConfirm } from "@/utils/common";
import { getToken } from "@/utils/auth";

// lottery相关api
import {
  getSetting,
  updateSetting,
  addSetting,
  getChaseNumberSetting,
} from "@/api/lottery/setting";
import { getLogList, addLog } from "@/api/lottery/log";

// 获取加密配置
import { getSecretConfig } from "@/api/secret/key.js";
import { getCryptoSaltKey } from "@/neverUploadToGithub";

export default {
  components: {
    uniIcons,
    uniNumberBox,
  },
  data() {
    return {
      // 当前登录用户信息
      userName: this.$store.state.user.name,
      // 当前配置信息云端ID
      settingInfoId: null,
      // 按钮图标大小
      iconSize: 32,
      // 定时器对象
      timer: null,
      // 今日星期几
      todayWeek: moment().format("E"),
      // todayWeek: '4',
      // 今日彩票编号
      todayDateCode: null,
      // Drawer组件相关参数
      isShowDrawer: false,
      drawerHeight: "75%",
      drawerType: 0,
      drawerTitle: moment().format("YYYY-MM-DD hh:mm:ss dddd"),
      showType: "",
      // SSQ红蓝球
      luckyNumberRed: [],
      luckyNumberBlue: [],
      // DLT前后区
      luckyNumberFront: [],
      luckyNumberBack: [],
      // 今日随机号码
      luckyNumberList: [],
      // SSQ固定追号配置，后期开放自定义固定追号
      luckyNumberSSQ: {
        timeStamp: new Date().getTime(),
        lotteryNumberFirst: [1, 4, 5, 8, 10, 23],
        lotteryNumberSecond: [5],
      },
      // DLT固定追号配置，后期开放自定义固定追号
      luckyNumberDLT: {
        timeStamp: new Date().getTime(),
        lotteryNumberFirst: [4, 7, 8, 10, 23],
        lotteryNumberSecond: [4, 9],
      },
      // 需要拷贝到剪切板的内容
      copyTextContent: "",
      // 照片数组
      lotteryTicketArr: [],
      idImgArrBack: [],
      // 设置相关参数
      settingInfo: {
        // 输出注数
        luckyCount: 2,
        // 是否允许重复
        isNeedRepeat: false,
        // 当日是否只允许出现一注随机号码，打开开关后需要缓存当前第一注
        isOnlyFirstToday: true,
        firstRandomDate: null,
        localLuckyNumberList: [],
        // 当日幸运数字是否必须出现在当日随机号码中
        isNeedLuckyNumber: true,
        todayLuckyNumber: null,
        luckyNumberDate: null,
        // 每天只允许点击一次是否幸运，并且判断当日点击后计算是否完成，未完成就退出下次进入允许重新点击
        firstLuckyDate: null,
        isCheckLuckyOver: false,
        todayLuckyText: null,
        luckyClickTotal: 0,
        // 模拟摇奖，包括中奖耗时，暂停摇奖，继续摇奖，以及中奖号码
        drawLotteryTimeHistory: 0,
        isGetBigReward: false,
        bigRewardNumber: null,
        // 是否需要追加一注过往中奖号码出现的高频数字，以及需要查询过往多少期
        isNeedAddPastRewardNumber: false,
        pastCheckCount: 1023,
      },
      // 幸运进度条
      luckyRandomProgrss: 0,
      // 达成幸运百分百的次数
      luckyProgrssCount: 0,
      // 计算是否幸运的定时器
      luckyTimer: null,
      // 是否正在运算
      countLoading: false,
      // 计时开始
      countStartTime: null,
      // 模拟摇奖的定时器
      fakeDrawTimer: null,
      // 模拟摇奖计时
      drawLotteryText: "模拟摇奖",
      // 是否正在模拟
      isDrawLoading: false,
      // 模拟摇奖计时
      drawLotteryTime: 0,
      // 调用接口的加载标识
      isNetworkLoading: false,
      // 图片上传百分比
      pictureUploadNumber: 0,
      // 百度OCR分析之后的结果列表
      ocrTagList: [],
      // 百度OCR分析之后的结果选中的列表
      ocrTagCheckList: [],
      // 百度OCR识别的图片宽度，使用uniapp的image组件的mode="fixWidth"属性即可，不再需要自动计算
      // ocrImgDomWidth: "",
    };
  },
  computed: {
    getMinCount() {
      if (this.settingInfo.isNeedAddPastRewardNumber) {
        return 3;
      }
      return 2;
    },
    getMaxCount() {
      if (this.settingInfo.isNeedAddPastRewardNumber) {
        return 4;
      }
      return 5;
    },
  },
  watch: {
    isShowDrawer: {
      handler(newValue, oldValue) {
        if (!newValue && this.drawerType > 0) {
          // #ifdef MP-WEIXIN
          this.initCacheSetting();
          // #endif
        }
      },
      deep: true, // 深度监测对象的变化
      immediate: true, // 立即执行监测器函数
    },
  },
  onLoad() {
    // moment初始汉化
    moment.locale("zh-cn");
    // 初始化随机号码
    this.initLuckyNumber();
    // 初始化缓存设置
    this.initCacheSetting();
    // 显示当前时间
    this.showNowTime();
    // 初始化最近官方彩票编号
    this.initLastLotteryDateCode();
  },
  // onShow() {
  //   // // 设置图片显示宽度，使用uniapp的image组件的mode="fixWidth"属性即可，不再需要自动计算
  //   // this.ocrImgDomWidth = `${uni.getWindowInfo()?.windowWidth - 30}px`;
  // },
  onHide() {
    // 增加一下保存的频率
    this.saveLuckySettingDebounce(true);
    // 退出页面时清理所有定时器
    this.clearAllTimer();
  },
  onUnload() {
    // 页面销毁时清理所有定时器
    this.clearAllTimer();
  },
  methods: {
    // 清理所有定时器
    clearAllTimer() {
      // 销毁时清除定时器
      clearInterval(this.timer);
      clearTimeout(this.luckyTimer);
      clearTimeout(this.fakeDrawTimer);
      this.timer = null;
      this.luckyTimer = null;
      this.fakeDrawTimer = null;
      // 隐藏时停止计时
      if (this.isDrawLoading) {
        this.stopDrawLottery();
      }
    },
    // 保存设置到服务端
    // noToast，默认不用传，传true表示不会提示保存成功或失败的信息，传false表示正常提示
    saveLuckySetting(isNoNeedToast) {
      const self = this;
      this.isNetworkLoading = true;
      if (this.settingInfoId) {
        const updateParams = {
          settingId: this.settingInfoId,
          lotterySetting: JSON.stringify(this.settingInfo),
        };
        updateSetting(updateParams).then((res) => {
          self.showSavingToast(
            res?.code,
            !isNoNeedToast,
            "摇奖设置已成功新增到云端~",
            "摇奖设置保存新增到云端失败，请联系管理员！",
            false
          );
        });
      } else {
        const addParams = {
          lotterySetting: JSON.stringify(this.settingInfo),
        };
        addSetting(addParams).then((res) => {
          self.showSavingToast(
            res?.code,
            !isNoNeedToast,
            "摇奖设置已成功保存到云端~",
            "摇奖设置保存修改到云端失败，请联系管理员！",
            true
          );
        });
      }
    },
    // 保存设置到服务端 - 防抖处理
    saveLuckySettingDebounce: _.debounce(function (isNoNeedToast) {
      this.saveLuckySetting(isNoNeedToast);
    }, 233),
    // 调用新增或修改接口之后的统一处理
    showSavingToast(resCode, isNeedTip, successTip, failTip, isNeedQuerySettingId) {
      const self = this;
      if (resCode === 200) {
        if (isNeedTip && successTip) {
          uni.showToast({
            title: successTip,
            icon: "none",
            duration: 1998,
          });
        }
        if (isNeedQuerySettingId) {
          getSetting().then((res) => {
            if (res?.code === 200 && res?.data) {
              self.settingInfoId = res?.data?.settingId;
            }
          });
        }
      } else {
        if (isNeedTip && failTip) {
          uni.showToast({
            title: failTip,
            icon: "none",
            duration: 1998,
          });
        }
      }
      if (isNeedTip) {
        this.drawerType = 0;
        this.isShowDrawer = false;
      }
      this.isNetworkLoading = false;
    },
    // 本地缓存摇奖设置
    saveLuckySettingLocal() {
      // 保存到服务端
      this.saveLuckySettingDebounce(true);

      // #ifdef H5
      localStorage.setItem("settingInfo", JSON.stringify(this.settingInfo));
      // #endif

      // 微信端不支持localStorage
      // #ifdef MP-WEIXIN
      wx.setStorage({
        key: "settingInfo",
        data: JSON.stringify(this.settingInfo),
      });
      // #endif
    },
    // 从服务端初始化之前的摇奖设置
    initCacheSetting() {
      const self = this;
      this.$modal.loading("加载配置中，请耐心等待...");
      this.isNetworkLoading = true;
      getSetting().then((res) => {
        if (res?.code === 200 && res?.data) {
          this.settingInfoId = res?.data?.settingId;
          const lotterySetting = res?.data?.lotterySetting;
          const settingInfo = JSON.parse(lotterySetting) || {};
          if (_.has(settingInfo, "firstRandomDate")) {
            self.settingInfo = {
              ...settingInfo,
            };
            // 如果打开了只允许一注随机则需要重新渲染当日的随机号码
            if (
              self.settingInfo.isOnlyFirstToday &&
              self.settingInfo.firstRandomDate === moment().format("YYYY-MM-DD")
            ) {
              self.luckyNumberList = self.settingInfo.localLuckyNumberList;
            }
            // 初始化完缓存配置项后初始化今日幸运数字
            self.initTodayLuckyNumber(settingInfo.luckyNumberDate);
            // 初始化模拟摇奖配置
            self.initDrawLottery();
          } else {
            // 初始化完缓存配置项后初始化今日幸运数字
            self.initTodayLuckyNumber(null);
          }
        } else {
          // 如果云端摇奖设置获取失败，则自动加载本地摇奖设置，并默认没有保存过摇奖设置
          this.settingInfoId = null;
          this.initCacheSettingLocal();
          uni.showToast({
            title: "获取云端摇奖设置失败！已为您自动加载本地摇奖设置~",
            icon: "none",
            duration: 1998,
          });
        }
        self.$modal.closeLoading();
        self.isNetworkLoading = false;
      });
    },
    // 从本地缓存里初始化之前的摇奖设置
    initCacheSettingLocal() {
      const self = this;
      // #ifdef H5
      if (localStorage.getItem("settingInfo")) {
        let settingInfo = JSON.parse(localStorage.getItem("settingInfo"));
        this.settingInfo = {
          ...settingInfo,
        };
        // 如果打开了只允许一注随机则需要重新渲染当日的随机号码
        if (
          this.settingInfo.isOnlyFirstToday &&
          this.settingInfo.firstRandomDate === moment().format("YYYY-MM-DD")
        ) {
          this.luckyNumberList = this.settingInfo.localLuckyNumberList;
        }
        // 初始化完缓存配置项后初始化今日幸运数字
        this.initTodayLuckyNumber(settingInfo.luckyNumberDate);
        // 初始化模拟摇奖配置
        this.initDrawLottery();
      } else {
        // 初始化完缓存配置项后初始化今日幸运数字
        this.initTodayLuckyNumber(null);
      }
      // #endif

      // 微信端不支持localStorage
      // #ifdef MP-WEIXIN
      wx.getStorage({
        key: "settingInfo",
        success: function (res) {
          let settingInfo = JSON.parse(res.data);
          self.settingInfo = {
            ...settingInfo,
          };
          // 如果打开了只允许一注随机则需要重新渲染当日的随机号码
          if (
            self.settingInfo.isOnlyFirstToday &&
            self.settingInfo.firstRandomDate === moment().format("YYYY-MM-DD")
          ) {
            self.luckyNumberList = self.settingInfo.localLuckyNumberList;
          }
          // 初始化完缓存配置项后初始化今日幸运数字
          self.initTodayLuckyNumber(settingInfo.luckyNumberDate);
          // 初始化模拟摇奖配置
          self.initDrawLottery();
        },
        fail: function () {
          // 如果第一次进入没有缓存配置，仍然需要生成当日幸运数字
          self.initTodayLuckyNumber(null);
        },
      });
      // #endif
    },
    // 从服务端初始化最近一条同类型记录的期号
    initLastLotteryDateCode() {
      const self = this;
      this.todayDateCode = null;
      const queryParams = {
        pageNum: 1,
        pageSize: 1,
        numberType: mapLotteryNumberType(this.todayWeek),
      };
      getLogList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            const latestDate = res?.rows[0]?.createTime || "";
            const latestDateFormat = moment(latestDate)?.format("YYYY-MM-DD") || "";
            const nowDateFormat = moment()?.format("YYYY-MM-DD") || "";
            // console.log("queryLastLotteryID", latestDateFormat, nowDateFormat);
            if (
              latestDate &&
              latestDateFormat &&
              nowDateFormat &&
              isTwoOrThreeDaysAfterWithSameYearCheck(latestDateFormat, nowDateFormat)
            ) {
              const latestOfficialDateCode = res?.rows[0]?.dateCode || "";
              // console.log("latestOfficialDateCode", res?.rows[0]?.dateCode);
              self.todayDateCode = latestOfficialDateCode
                ? parseInt(latestOfficialDateCode) + 1
                : null;
              // console.log("todayDateCode", self.todayDateCode);
            }
          }
        }
      });
    },
    // #ifdef H5
    // 关闭摇奖设置弹窗时需重新加载之前保存的设置
    // 这里的回调微信会直接报错，H5正常，所以微信采用watch函数来监听弹窗显示隐藏的变化来重新加载数据
    handleDrawerClose() {
      this.initCacheSetting();
      this.isShowDrawer = false;
    },
    // #endif
    // 显示今日随机号码
    async getLuckyNumber() {
      if (this.todayWeek === "5") {
        uni.showToast({
          title: "非常抱歉，今天是星期五，不提供随机号码选择~",
          icon: "none",
          duration: 1998,
        });
      } else {
        this.showType = "luckyNumber";
        // 是否允许再次生成随机号码
        if (this.checkIsOnlyFirstTodayConfig()) {
          let chasingNumObjTmp = null;
          let pastNumObjTmp = null;
          // 后期也是在这里处理追号的查询，目前是只有超管可以配置追号
          if (this.userName && this.userName === "fx67ll") {
            chasingNumObjTmp = await this.queryDailyChasingNumber();
          }
          // 如果打开了需要统计过往开奖号码中的高频数字的开关，则先处理并返回统计的一注再继续往下处理
          if (this.settingInfo.isNeedAddPastRewardNumber) {
            pastNumObjTmp = await this.searchPastNumberFilterByFrequency();
          }
          // console.log("chasingNumObjTmp, pastNumObjTmp", chasingNumObjTmp, pastNumObjTmp);
          this.packageRandomList(chasingNumObjTmp, pastNumObjTmp);
          this.settingInfo.firstRandomDate = moment().format("YYYY-MM-DD");
          this.saveLuckySettingLocal();
        }
        // #ifdef H5
        this.drawerHeight = `${170 + this.settingInfo.luckyCount * 30 + 50}px`;
        // #endif
        // #ifdef MP-WEIXIN
        this.drawerHeight = `${200 + this.settingInfo.luckyCount * 30}px`;
        // #endif
        this.drawerType = 0;
        this.isShowDrawer = true;
      }
    },
    // 查询过往指定期数的中奖号码，并将数据处理成纯数字数组，使用工具类提取出现频率最高的数字
    async searchPastNumberFilterByFrequency() {
      const queryParams = {
        pageNum: 1,
        pageSize: this.settingInfo.pastCheckCount || 23,
        numberType: mapLotteryNumberType(this.todayWeek),
      };
      const pastData = await getLogList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            let frontResultArr = [];
            let backResultArr = [];
            res.rows.forEach((item) => {
              if (item?.winningNumber) {
                const arrFirTmp = item?.winningNumber?.split("-");
                const arrSecTmp = arrFirTmp[0]?.split(",");
                frontResultArr = [...frontResultArr, ...arrSecTmp];
                const arrThiTmp = arrFirTmp[1]?.split(",");
                backResultArr = [...backResultArr, ...arrThiTmp];
              }
            });
            if (frontResultArr && backResultArr) {
              if (
                mapLotteryNumberType(this.todayWeek) === "1" &&
                frontResultArr.length > 4 &&
                backResultArr.length > 1
              ) {
                const resultTmpObjDLT = {
                  timeStamp: new Date().getTime(),
                  lotteryNumberFirst: sortNumberByAscending(
                    sortNumberByFrequency(frontResultArr, 5)
                  ),
                  lotteryNumberSecond: sortNumberByAscending(
                    sortNumberByFrequency(backResultArr, 2)
                  ),
                };
                return resultTmpObjDLT;
              }
              if (
                mapLotteryNumberType(this.todayWeek) === "2" &&
                frontResultArr.length > 5 &&
                backResultArr.length > 0
              ) {
                const resultTmpObjSSQ = {
                  timeStamp: new Date().getTime(),
                  lotteryNumberFirst: sortNumberByAscending(
                    sortNumberByFrequency(frontResultArr, 6)
                  ),
                  lotteryNumberSecond: sortNumberByAscending(
                    sortNumberByFrequency(backResultArr, 1)
                  ),
                };
                return resultTmpObjSSQ;
              }
              // #ifdef H5
              uni.showToast({
                title:
                  "历史中奖号码数据为空，过往高频中奖号码生成失败！已为您自动补充一注随机号码~",
                icon: "none",
                duration: 1998,
              });
              // #endif
              // #ifdef MP-WEIXIN
              uni.showToast({
                title: "过往高频中奖号码生成失败！",
                icon: "none",
                duration: 1998,
              });
              // #endif
              return null;
            } else {
              return null;
            }
          } else {
            // #ifdef H5
            uni.showToast({
              title:
                "历史号码数据为空，过往高频中奖号码生成失败！已为您自动补充一注随机号码~",
              icon: "none",
              duration: 1998,
            });
            // #endif
            // #ifdef MP-WEIXIN
            uni.showToast({
              title: "过往高频中奖号码生成失败！",
              icon: "none",
              duration: 1998,
            });
            // #endif
            return null;
          }
        } else {
          // #ifdef H5
          uni.showToast({
            title:
              "历史号码数据接口异常，过往高频中奖号码生成失败！已为您自动补充一注随机号码~",
            icon: "none",
            duration: 1998,
          });
          // #endif
          // #ifdef MP-WEIXIN
          uni.showToast({
            title: "过往高频中奖号码生成失败！",
            icon: "none",
            duration: 1998,
          });
          // #endif
          return null;
        }
      });
      return pastData || null;
    },
    // 查询每日追号的配置
    async queryDailyChasingNumber() {
      const queryParams = {
        weekType: parseInt(this.todayWeek),
        numberType: parseInt(mapLotteryNumberType(this.todayWeek)),
      };
      const chasingNumber = await getChaseNumberSetting(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            if (res?.rows[0]?.chaseNumber) {
              const arrFir = res?.rows[0]?.chaseNumber?.split("-");
              if (arrFir && arrFir.length > 1) {
                const numFirTmp = (arrFir[0]?.split(",") || []).map((item) =>
                  item ? parseInt(item) : ""
                );
                const numSecTmp = (arrFir[0]?.split(",") || []).map((item) =>
                  item ? parseInt(item) : ""
                );
                const resultChasingNumberTmpObj = {
                  timeStamp: new Date().getTime(),
                  lotteryNumberFirst: numFirTmp,
                  lotteryNumberSecond: numSecTmp,
                };
                // console.log("resultChasingNumberTmpObj", resultChasingNumberTmpObj);
                return resultChasingNumberTmpObj;
              }
              return null;
            }
            return null;
          } else {
            uni.showToast({
              title: "每日追号配置查询为空！",
              icon: "none",
              duration: 1998,
            });
            return null;
          }
        } else {
          uni.showToast({
            title: "每日追号配置查询失败！",
            icon: "none",
            duration: 1998,
          });
          return null;
        }
      });
      return chasingNumber || null;
    },
    // 判断当日是否只允许出现一注随机号码的配置是否生效
    // 先判断，是否配置了只显示当日第一注随机号码，则不再重复生成随机号码
    // 再判断，如果配了只生成随机一注，则再判断当天是否生成过
    checkIsOnlyFirstTodayConfig() {
      if (this.settingInfo.isOnlyFirstToday) {
        if (this.settingInfo.firstRandomDate !== moment().format("YYYY-MM-DD")) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },
    // 从奖池中摇奖
    rollNumber(luckyList, numberList, count) {
      let tempLucky = [...luckyList];
      let tempNumber = [...numberList];
      let randomIndex = Math.floor(Math.random() * tempNumber.length);
      tempLucky.push(tempNumber[randomIndex]);
      tempLucky = quickSort(tempLucky);
      tempNumber.splice(randomIndex, 1);
      count--;
      if (count > 0) {
        return this.rollNumber(tempLucky, tempNumber, count);
      } else {
        let checkResArr = this.checkSameNumber(tempLucky);
        if (checkResArr && checkResArr.length !== 0) {
          return tempLucky;
        } else {
          if (tempLucky.length === 6) {
            return this.rollNumber([], this.luckyNumberRed, tempLucky.length);
          }
          if (tempLucky.length === 1) {
            return this.rollNumber([], this.luckyNumberBlue, tempLucky.length);
          }
          if (tempLucky.length === 5) {
            return this.rollNumber([], this.luckyNumberFront, tempLucky.length);
          }
          if (tempLucky.length === 2) {
            return this.rollNumber([], this.luckyNumberBack, tempLucky.length);
          }
        }
      }
    },
    // 检查后半区是否有重复号码
    checkSameNumber(numberList) {
      let isSameNumber = false;
      let tempList = [...numberList];
      if (!this.settingInfo.isNeedRepeat) {
        for (var i = 0; i < this.luckyNumberList.length; i++) {
          // #ifdef H5
          if (
            _.isEqual(tempList, this.luckyNumberList[i].lotteryNumberFirst) ||
            _.isEqual(tempList, this.luckyNumberList[i].lotteryNumberSecond)
          ) {
            isSameNumber = true;
          }
          // #endif
          // #ifdef MP-WEIXIN
          if (_.isEqual(tempList, [this.luckyNumberList[i].lotteryNumberSecond[0].num])) {
            isSameNumber = true;
          }
          // #endif
        }
      }
      if (isSameNumber) {
        return [];
      } else {
        return tempList;
      }
    },
    // 组装今日随机号码
    packageRandomList(chasingNumber, pastHighFreNumber) {
      this.luckyNumberList = [];
      let randomInitLength = this.settingInfo.luckyCount;

      if (this.userName && this.userName === "fx67ll") {
        randomInitLength =
          this.settingInfo.isNeedAddPastRewardNumber && pastHighFreNumber
            ? this.settingInfo.luckyCount - 2
            : this.settingInfo.luckyCount - 1;
      } else {
        randomInitLength =
          this.settingInfo.isNeedAddPastRewardNumber && pastHighFreNumber
            ? this.settingInfo.luckyCount - 1
            : this.settingInfo.luckyCount;
      }

      if (mapLotteryNumberType(this.todayWeek) === "1") {
        if (this.userName && this.userName === "fx67ll") {
          if (
            chasingNumber?.lotteryNumberFirst?.length === 5 &&
            chasingNumber?.lotteryNumberSecond?.length === 2
          ) {
            this.luckyNumberList.push(this.packageTempObjForWX(chasingNumber));
          } else {
            this.luckyNumberList.push(this.packageTempObjForWX(this.luckyNumberDLT));
          }
        }

        if (pastHighFreNumber) {
          this.luckyNumberList.push(this.packageTempObjForWX(pastHighFreNumber));
        }

        for (var i = 0; i < randomInitLength; i++) {
          this.luckyNumberList.push(
            this.packageTempObjForWX(this.packageTempObj("DLT", i))
          );
        }
      }
      if (mapLotteryNumberType(this.todayWeek) === "2") {
        if (this.userName && this.userName === "fx67ll") {
          if (
            chasingNumber?.lotteryNumberFirst?.length === 6 &&
            chasingNumber?.lotteryNumberSecond?.length === 1
          ) {
            this.luckyNumberList.push(this.packageTempObjForWX(chasingNumber));
          } else {
            this.luckyNumberList.push(this.packageTempObjForWX(this.luckyNumberSSQ));
          }
        }

        if (pastHighFreNumber) {
          this.luckyNumberList.push(this.packageTempObjForWX(pastHighFreNumber));
        }

        for (var i = 0; i < randomInitLength; i++) {
          this.luckyNumberList.push(
            this.packageTempObjForWX(this.packageTempObj("SSQ", i))
          );
        }
      }
      // 如果打开了只允许一注随机则需要缓存当日的随机号码
      if (this.settingInfo.isOnlyFirstToday) {
        this.settingInfo.localLuckyNumberList = this.luckyNumberList;
        this.saveLuckySettingLocal();
      }
      // 如果打开了需要包含当日幸运数字就需要重新摇号
      if (!this.checkHasTodayLuckyNumber()) {
        this.packageRandomList(chasingNumber, pastHighFreNumber);
      }
    },
    // 判断是否包含当日的幸运数字
    checkHasTodayLuckyNumber() {
      const self = this;
      if (this.settingInfo.isNeedLuckyNumber) {
        let hasTodayLuckyNumber = false;
        this.luckyNumberList.forEach(function (item) {
          item.lotteryNumberFirst.forEach(function (ita) {
            if (
              JSON.stringify(ita.num) ===
              JSON.stringify(self.settingInfo.todayLuckyNumber)
            ) {
              hasTodayLuckyNumber = true;
            }
          });
          item.lotteryNumberSecond.forEach(function (itb) {
            if (
              JSON.stringify(itb.num) ===
              JSON.stringify(self.settingInfo.todayLuckyNumber)
            ) {
              hasTodayLuckyNumber = true;
            }
          });
        });
        return hasTodayLuckyNumber;
      } else {
        return true;
      }
    },
    // 本来是特供微信处理包装单条随机号码，微信小程序不支持key使用表达式，包装一下再渲染
    // 目前为统一处理成微信小程序支持的数据结构
    packageTempObjForWX(numberObj) {
      let tempFirst = [];
      let tempSecond = [];
      let tempObj = {
        ...numberObj,
      };
      _.each(tempObj.lotteryNumberFirst, function (ita, ina) {
        let temObj = {
          num: ita,
          key: Math.random() * ita + ina,
        };
        tempFirst.push(temObj);
      });
      _.each(tempObj.lotteryNumberSecond, function (itb, inb) {
        let temObj = {
          num: itb,
          key: Math.random() * itb + inb,
        };
        tempSecond.push(temObj);
      });
      tempObj.lotteryNumberFirst = tempFirst;
      tempObj.lotteryNumberSecond = tempSecond;
      return tempObj;
    },
    // 包装单条随机号码
    packageTempObj(type, mix) {
      let objTemp = {
        timeStamp: new Date().getTime() + mix,
        lotteryNumberFirst: [],
        lotteryNumberSecond: [],
      };
      if (type === "DLT") {
        objTemp.lotteryNumberFirst = this.rollNumber([], this.luckyNumberFront, 5);
        objTemp.lotteryNumberSecond = this.rollNumber([], this.luckyNumberBack, 2);
      }
      if (type === "SSQ") {
        objTemp.lotteryNumberFirst = this.rollNumber([], this.luckyNumberRed, 6);
        objTemp.lotteryNumberSecond = this.rollNumber([], this.luckyNumberBlue, 1);
      }
      return objTemp;
    },
    // 统一处理提示是否需要操作完关闭弹窗
    isNeedCloseDrawer(successTip) {
      const self = this;
      showConfirm(`${successTip}，是否需要为您关闭抽屉？`).then((res) => {
        if (res?.confirm) {
          self.drawerType = 0;
          self.isShowDrawer = false;
        }
      });
    },
    // 处理上传号码记录
    handleUplaodTodayNumber(todayNumber) {
      const self = this;
      const fixNumList = [];
      if (this.userName && this.userName === "fx67ll") {
        fixNumList.push({ ...this.luckyNumberList[0] });
      }
      let todayNumType = "";
      if (["1", "3", "6"].includes(this.todayWeek)) {
        todayNumType = "1";
      }
      if (["2", "4", "7"].includes(this.todayWeek)) {
        todayNumType = "2";
      }
      this.isNetworkLoading = true;
      const addParams = {
        recordNumber: todayNumber,
        chaseNumber:
          fixNumList.length > 0 ? this.formatNumberListForUpload(fixNumList) : "",
        numberType: todayNumType,
        weekType: this.todayWeek,
        hasMorePurchases: "N",
        dateCode: this.todayDateCode,
      };
      addLog(addParams).then((res) => {
        self.isNetworkLoading = false;
        if (res?.code === 200) {
          self.isNeedCloseDrawer("号码记录已经成功保存到云端");
        } else {
          uni.showToast({
            title: "号码记录保存失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    // 上传当前生成的随机号码
    uploadLuckyNumber() {
      const self = this;
      if (this.luckyNumberList && this.luckyNumberList.length > 0) {
        const buyingNumList = this.luckyNumberList.filter((item, index) => index > 0);
        const todayNumber = this.formatNumberListForUpload(
          self.userName && self.userName === "fx67ll"
            ? buyingNumList
            : self.luckyNumberList
        );
        const queryParams = {
          pageNum: 1,
          pageSize: 1,
          recordNumber: todayNumber,
        };
        getLogList(queryParams).then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              showConfirm("查询到相同随机号码记录，是否需要再次上传该号码记录？").then(
                (res) => {
                  if (res?.confirm) {
                    self.handleUplaodTodayNumber(todayNumber);
                  }
                }
              );
            } else {
              self.handleUplaodTodayNumber(todayNumber);
            }
          } else {
            uni.showToast({
              title: "查询历史号码记录失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      } else {
        uni.showToast({
          title: "请先点击获取今日随机号码~",
          icon: "none",
          duration: 1998,
        });
      }
    },
    // 上传当前生成的随机号码 - 防抖处理
    uploadLuckyNumberDebounce: _.debounce(function () {
      this.uploadLuckyNumber();
    }, 233),
    // 保存到云端的号码记录需要重新处理下
    formatNumberListForUpload(list) {
      let textResult = "";
      _.each(list, (item, key) => {
        _.each(item?.lotteryNumberFirst, (ita, kya) => {
          if (kya !== item.lotteryNumberFirst.length - 1) {
            textResult = textResult.concat(`${ita?.num},`);
          } else {
            textResult = textResult.concat(`${ita?.num}-`);
          }
        });
        _.each(item?.lotteryNumberSecond, (itb, kyb) => {
          if (kyb !== item.lotteryNumberSecond.length - 1) {
            textResult = textResult.concat(`${itb?.num},`);
          } else {
            textResult = textResult.concat(`${itb?.num}`);
          }
        });
        if (key !== list.length - 1) {
          textResult = textResult.concat("/");
        }
      });
      return textResult;
    },
    // 复制给发给彩票店老板的内容
    copyLuckyNumber() {
      const self = this;
      let luckyTitle = "";
      // let luckyFooter = '\n 老板号码别打错了哈，谢谢~';
      let luckyFooter = "";
      let luckyContent = null;

      // #ifdef H5
      // luckyContent = document
      //   .getElementById("luckyNumberText")
      //   .innerHTML.replace(/(<\/?span.*?>)/g, " ")
      //   .replace(/<\/?view.*?>/gi, "\n");
      // #endif
      // #ifdef MP-WEIXIN
      // luckyContent = this.packageContextForWX();
      // #endif

      // 上面H5的实现方式有点问题，统一使用小程序的处理方式即可
      luckyContent = this.packageContextForWX();

      if (mapLotteryNumberType(this.todayWeek) === "1") {
        luckyTitle = " 老板买" + this.settingInfo.luckyCount + "注自选号码大乐透\n";
        this.copyTextContent = luckyTitle + luckyContent + luckyFooter;
      }
      if (mapLotteryNumberType(this.todayWeek) === "2") {
        luckyTitle = " 老板买" + this.settingInfo.luckyCount + "注自选号码双色球\n";
        this.copyTextContent = luckyTitle + luckyContent + luckyFooter;
      }
      uni.setClipboardData({
        data: self.copyTextContent,
        showToast: false, // 仅支持 App (3.2.13+)、H5 (3.2.13+)
        success: function (res) {
          // #ifdef H5
          // 微信不支持关闭复制成功提示所以暂时只支持H5
          self.isNeedCloseDrawer("已为您成功复制到剪切板");
          // #endif
          console.log("uni.setClipboardData - success: " + JSON.stringify(res));
        },
        fail: function (err) {
          uni.showToast({
            title: "卧槽复制失败了！请联系管理员处理! ",
            icon: "none",
            duration: 1998,
          });
          console.error("uni.setClipboardData - fail: " + JSON.stringify(err));
        },
      });
    },
    // 微信小程序不支持直接操作dom
    packageContextForWX() {
      const self = this;
      let context = "";
      _.each(this.luckyNumberList, function (item, index) {
        let singleContextFirst = "";
        let singleContextSecond = "";
        _.each(item.lotteryNumberFirst, function (ita, ina) {
          singleContextFirst = singleContextFirst.concat(
            ina === 0 ? ` ` : "",
            `${JSON.stringify(ita.num)}  `
          );
        });
        _.each(item.lotteryNumberSecond, function (itb, inb) {
          singleContextSecond = singleContextSecond.concat(
            inb === 0 ? ` ` : "",
            `${JSON.stringify(itb.num)}  `
          );
        });
        context = context.concat(
          index === 0 ? "\n" : "",
          `${singleContextFirst}- ${singleContextSecond}`,
          "\n",
          index + 1 !== self.luckyNumberList.length ? "\n" : ""
        );
      });
      return context;
    },
    // 初始化随机号码
    initLuckyNumber() {
      if (mapLotteryNumberType(this.todayWeek) === "1") {
        this.initDLT();
      }
      if (mapLotteryNumberType(this.todayWeek) === "2") {
        this.initSSQ();
      }
      // test
      this.initSSQ();
    },
    // 初始化SSQ的奖池初始号码
    initSSQ() {
      this.luckyNumberRed = [];
      this.luckyNumberBlue = [];
      for (var i = 0; i < 33; i++) {
        this.luckyNumberRed.push(i + 1);
      }
      for (var i = 0; i < 16; i++) {
        this.luckyNumberBlue.push(i + 1);
      }
    },
    // 初始化DLT的奖池初始号码
    initDLT() {
      this.luckyNumberFront = [];
      this.luckyNumberBack = [];
      for (var i = 0; i < 35; i++) {
        this.luckyNumberFront.push(i + 1);
      }
      for (var i = 0; i < 12; i++) {
        this.luckyNumberBack.push(i + 1);
      }
    },
    // 显示当前时间
    showNowTime() {
      const self = this;
      this.timer = setInterval(() => {
        self.drawerTitle = moment().format("YYYY-MM-DD hh:mm:ss dddd");
      }, 1000);
    },
    // 获取今日幸运数字
    // Math.random()*(m-n)+n -->> 生成 [ n, m ) 范围内的随机数（大于等于n，小于m）
    initTodayLuckyNumber(luckyNumberDate) {
      if (!luckyNumberDate || luckyNumberDate !== moment().format("YYYY-MM-DD")) {
        this.settingInfo.luckyNumberDate = moment().format("YYYY-MM-DD");
        if (mapLotteryNumberType(this.todayWeek) === "1") {
          this.settingInfo.todayLuckyNumber = Math.floor(Math.random() * (36 - 1) + 1);
        }
        if (mapLotteryNumberType(this.todayWeek) === "2") {
          this.settingInfo.todayLuckyNumber = Math.floor(Math.random() * (34 - 1) + 1);
        }
      } else if (this.todayWeek === "5") {
        this.settingInfo.todayLuckyNumber = "0";
      }
      this.saveLuckySettingLocal();
    },
    // 打开摇奖设置
    editLuckySetting() {
      this.showType = "luckySetting";
      // #ifdef H5
      this.drawerHeight = "460px";
      // #endif
      // #ifdef MP-WEIXIN
      this.drawerHeight = "490px";
      // #endif
      this.drawerType += 1;
      this.isShowDrawer = true;
    },
    // 监听注数监听
    luckyCountChange(e) {
      this.settingInfo.luckyCount = e;
      // this.saveLuckySettingLocal();
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 监听是否允许重复
    isNeedRepeatChange(e) {
      this.settingInfo.isNeedRepeat = e.detail.value;
      // this.saveLuckySettingLocal();
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 监听当日是否只允许出现一注随机号码
    isOnlyFirstTodayChange(e) {
      this.settingInfo.isOnlyFirstToday = e.detail.value;
      this.settingInfo.localLuckyNumberList = this.luckyNumberList;
      // this.saveLuckySettingLocal();
      if (!e.detail.value) {
        this.settingInfo.firstRandomDate = null;
        this.settingInfo.localLuckyNumberList = [];
        // this.saveLuckySettingLocal();
      }
    },
    // 其他设置修改需要重置当日只允许出现一注随机号码
    resetIsOnlyFirstToday() {
      this.isOnlyFirstTodayChange({
        detail: {
          value: false,
        },
      });
    },
    // 监听当日幸运数字是否必须出现在当日随机号码中
    isNeedLuckyNumberChange(e) {
      this.settingInfo.isNeedLuckyNumber = e.detail.value;
      // this.saveLuckySettingLocal();
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 监听是否需要追加一注过往中奖号码出现的高频数字
    isNeedAddPastChange(e) {
      this.settingInfo.isNeedAddPastRewardNumber = e.detail.value;
      if (e.detail.value) {
        if (this.settingInfo.luckyCount < 5) {
          this.settingInfo.luckyCount = this.settingInfo.luckyCount + 1;
        }
      } else {
        if (this.settingInfo.luckyCount > 2) {
          this.settingInfo.luckyCount = this.settingInfo.luckyCount - 1;
        }
      }
      // this.saveLuckySettingLocal();
    },
    // 监听需要查询过往多少期
    pastCheckCountChange(e) {
      this.settingInfo.pastCheckCount = e;
      // this.saveLuckySettingLocal();
    },
    // 图片上传结束后需要还原加载状态
    afterPicUploadFinished() {
      this.isNetworkLoading = false;
      this.pictureUploadNumber = 0;
    },
    // 拷贝选中的识别结果文字字块
    copyCheckTagText() {
      const self = this;
      let copyResTxt = "";
      this.ocrTagCheckList.forEach((item, index) => {
        if (item?.isCheck) {
          if (index === self.ocrTagCheckList.length - 1) {
            copyResTxt = copyResTxt.concat(item?.words);
          } else {
            copyResTxt = copyResTxt.concat(item?.words + ",");
          }
        }
      });
      console.log("copyResTxt", copyResTxt);
      uni.setClipboardData({
        data: copyResTxt,
        showToast: false, // 仅支持 App (3.2.13+)、H5 (3.2.13+)
        success: function (res) {
          // #ifdef H5
          // 微信不支持关闭复制成功提示所以暂时只支持H5
          uni.showToast({
            title: "已为您成功复制到剪切板! ",
            icon: "none",
            duration: 1998,
          });
          // #endif
          console.log("uni.setClipboardData - success: " + JSON.stringify(res));
        },
        fail: function (err) {
          uni.showToast({
            title: "卧槽复制失败了！请联系管理员处理! ",
            icon: "none",
            duration: 1998,
          });
          console.error("uni.setClipboardData - fail: " + JSON.stringify(err));
        },
      });
    },
    // 修改识别结果的tag状态
    changeTagStatus(tagIndex) {
      const self = this;
      this.ocrTagList[tagIndex].isCheck = !this.ocrTagList[tagIndex].isCheck;
      this.ocrTagCheckList = [];
      this.ocrTagList.forEach((item) => {
        if (item?.isCheck) {
          self.ocrTagCheckList.push({ ...item });
        }
      });
    },
    // OCR识别成功之后打开弹窗显示识别的图片
    afterBaiduOcrSuccess(baiduOcrFileUrl) {
      // 设置OCR识别弹窗显示的识别图片
      this.lotteryTicketArr = [];
      this.lotteryTicketArr.push(baiduOcrFileUrl);
      // 清除弹窗标题的定时器
      clearInterval(this.timer);
      this.timer = null;
      this.drawerTitle = "待处理分析结果";
      // 打开弹窗
      this.showType = "luckyPhoto";
      this.drawerHeight = "80%";
      this.drawerType = 0;
      this.isShowDrawer = true;
    },
    // 百度OCR结果返回之后的回调
    ocrResultCallBack(ocrCallBackRes, baiduOcrFileUrl) {
      console.log("ocrCallBackRes", ocrCallBackRes);
      // 关闭加载状态
      this.afterPicUploadFinished();
      // 存储分析结果
      if (
        ocrCallBackRes?.data?.words_result &&
        ocrCallBackRes?.data?.words_result.length > 0
      ) {
        const corTempList = [];
        const ocrResList = ocrCallBackRes?.data?.words_result;
        ocrResList.forEach((item, index) => {
          corTempList.push({
            words: item?.words,
            isCheck: false,
            timeStamp: new Date().getTime() + index,
          });
        });
        this.ocrTagList = [...corTempList];
      } else {
        this.ocrTagList = [];
        this.ocrTagCheckList = [];
        uni.showToast({
          title: "百度OCR识别结果为空，请联系管理员！",
          icon: "none",
          duration: 1998,
        });
      }
      this.afterBaiduOcrSuccess(baiduOcrFileUrl);
    },
    // 使用百度OCR分析，注意！！！百度OCR识别需要先获取鉴权信息~
    analysisByBaiduOcr(ocrPubKey, ocrSecKey, fileCloudUrl) {
      const self = this;
      uni
        .request({
          method: "POST",
          timeout: 102344,
          // #ifdef H5
          url: "/baiduOcrAuth",
          // #endif
          // #ifdef MP-WEIXIN
          url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${ocrPubKey}&client_secret=${ocrSecKey}`,
          // #endif
          dataType: "json",
        })
        .then((baiduOcrAuthRes) => {
          // console.log("baiduOcrAuthRes", baiduOcrAuthRes);
          if (
            baiduOcrAuthRes &&
            baiduOcrAuthRes.length > 1 &&
            baiduOcrAuthRes[1]?.data?.access_token
          ) {
            uni.request({
              method: "POST",
              timeout: 102344,
              // #ifdef H5
              url: "/baiduOcr",
              // #endif
              // #ifdef MP-WEIXIN
              url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${baiduOcrAuthRes[1]?.data?.access_token}`,
              // #endif
              data: {
                url: fileCloudUrl,
              },
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              dataType: "json",
              success: function (baiduOcrRes) {
                // console.log("baiduOcrRes", baiduOcrRes);
                self.ocrResultCallBack(baiduOcrRes, fileCloudUrl);
              },
              fail: (err) => {
                uni.showToast({
                  title: "百度OCR识别接口调用失败，请联系管理员！",
                  icon: "none",
                  duration: 1998,
                });
                console.error("百度OCR识别接口调用失败: " + JSON.stringify(err));
                self.afterPicUploadFinished();
              },
              complete: (res) => {
                console.log("百度OCR识别接口调用完成: " + JSON.stringify(res));
              },
            });
          } else {
            uni.showToast({
              title: "百度OCR鉴权接口调用失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
            self.afterPicUploadFinished();
          }
        })
        .catch((err) => {
          self.afterPicUploadFinished();
        });
    },
    // 获取百度OCR分析必须的配置
    qryBaiduOcrConfig(fileCloudUrl) {
      const self = this;
      getSecretConfig({ secretKey: "ocrPubKey" }).then((res) => {
        if (res && res?.rows && res?.rows.length > 0 && res?.code === 200) {
          const ocrPubKey = decryptString(res.rows[0].secretValue, getCryptoSaltKey());
          getSecretConfig({ secretKey: "ocrSecKey" }).then((res) => {
            if (res && res?.rows && res?.rows.length > 0 && res?.code === 200) {
              const ocrSecKey = decryptString(
                res.rows[0].secretValue,
                getCryptoSaltKey()
              );
              self.analysisByBaiduOcr(ocrPubKey, ocrSecKey, fileCloudUrl);
            } else {
              uni.showToast({
                title: "查询百度OCR分析配置项SecretKey失败！",
                icon: "none",
                duration: 1998,
              });
            }
          });
        } else {
          uni.showToast({
            title: "查询百度OCR分析配置项PublicKey失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    // 上传图片到uniCloud，目前是改为使用若依的上传接口
    uploadPicForBaiDuOcr(fileList) {
      const self = this;
      this.isNetworkLoading = true;
      // uniCloud.uploadFile({
      //   // #ifdef H5
      //   filePath: fileList[0].path,
      //   cloudPath: fileList[0].name,
      //   // #endif
      //   // #ifdef MP-WEIXIN
      //   filePath: fileList[0].tempFilePath,
      //   cloudPath: moment().format("YYYY-MM-DD hh:mm:ss"),
      //   // #endif
      //   // 后续添加进度条功能，先用百分比代替
      //   onUploadProgress: function (progressEvent) {
      //     const percentLoadingPercent = Math.round(
      //       (progressEvent.loaded * 100) / progressEvent.total
      //     );
      //     self.pictureUploadNumber = parseInt(percentLoadingPercent);
      //   },
      //   success: (uploadFileRes) => {
      //     // console.log("uploadFileRes", uploadFileRes);
      //     if (uploadFileRes && uploadFileRes?.success && uploadFileRes?.fileID) {
      //       self.qryBaiduOcrConfig(uploadFileRes?.fileID);
      //     } else {
      //       self.afterPicUploadFinished();
      //     }
      //   },
      //   fail: (err) => {
      //     uni.showToast({
      //       title: "uniCloud图片上传接口调用失败，请联系管理员！",
      //       icon: "none",
      //       duration: 1998,
      //     });
      //     console.error("uniCloud图片上传接口调用失败: " + JSON.stringify(err));
      //     self.afterPicUploadFinished();
      //   },
      //   complete: (res) => {
      //     console.log("uniCloud图片上传接口调用完成: " + JSON.stringify(res));
      //   },
      // });
      uni.uploadFile({
        url: "https://vip.fx67ll.com/vip-api/common/upload", //仅为示例，非真实的接口地址
        // #ifdef H5
        filePath: fileList[0].path,
        // #endif
        // #ifdef MP-WEIXIN
        filePath: fileList[0].tempFilePath,
        // #endif
        name: "file",
        header: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
        success: (uploadFileRes) => {
          // console.log("uploadFileRes", uploadFileRes);
          if (uploadFileRes && uploadFileRes?.statusCode === 200 && uploadFileRes?.data) {
            const uploadFileResData = JSON.parse(uploadFileRes?.data);
            // console.log("uploadFileResData", uploadFileResData);
            if (uploadFileResData?.code === 200 && uploadFileResData?.url) {
              self.qryBaiduOcrConfig(uploadFileResData?.url);
            }
          } else {
            self.afterPicUploadFinished();
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "uniCloud图片上传接口调用失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
          console.error("uniCloud图片上传接口调用失败: " + JSON.stringify(err));
          self.afterPicUploadFinished();
        },
        complete: (res) => {
          console.log("uniCloud图片上传接口调用完成: " + JSON.stringify(res));
        },
      });
    },
    // 本地选取照片上传之后统一处理的回调
    pickLocalPhotoCallBack(type, pickCallBackRes) {
      // 成功回调
      if (type === 0) {
        // 如果返回的图片列表数据正常则继续执行百度OCR分析的流程
        if (pickCallBackRes && pickCallBackRes.length > 0) {
          // console.log("chooseImageRes", pickCallBackRes);
          this.uploadPicForBaiDuOcr(pickCallBackRes);
        } else {
          uni.showToast({
            title: "相册选择接口返回数据异常，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
      }
      // 失败回调
      if (type === 1) {
        if (pickCallBackRes?.errMsg !== "chooseMedia:fail cancel") {
          uni.showToast({
            title: "相册选择接口调用失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
        console.error("相册选择接口调用失败: " + JSON.stringify(pickCallBackRes));
      }
      // 完成回调，不管失败还是成功打印参数，方便后期查看错误调试
      if (type === 2) {
        console.log("相册选择接口调用完成: " + JSON.stringify(pickCallBackRes));
      }
    },
    // 选取需要上传的图片
    pickImportLuckyImg() {
      const self = this;
      // #ifdef H5
      uni.chooseImage({
        /** 关于count参数的官方说明
						count 值在 H5 平台的表现，基于浏览器本身的规范。目前测试的结果来看，只能限制单选/多选，并不能限制数量。
						并且，在实际的手机浏览器很少有能够支持多选的。 **/
        count: 1,
        sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有，仅支持App、微信小程序、支付宝小程序、百度小程序
        sourceType: ["album", "camera"], // album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
        // 成功则返回图片的本地文件路径列表 tempFilePaths
        success: function (chooseImageRes) {
          self.pickLocalPhotoCallBack(0, chooseImageRes?.tempFiles || null);
        },
        // 接口调用失败的回调函数，小程序、App
        fail: function (err) {
          self.pickLocalPhotoCallBack(1, err);
        },
        // 接口调用结束的回调函数（调用成功、失败都会执行），全平台
        complete: function (res) {
          self.pickLocalPhotoCallBack(2, res);
        },
      });
      // #endif
      // 官方文档地址：https://developers.weixin.qq.com/miniprogram/dev/api/media/video/wx.chooseMedia.html
      // #ifdef MP-WEIXIN
      wx.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sourceType: ["album"],
        // sizeType	Array.<string>	['original', 'compressed']	否	仅对 mediaType 为 image 时有效，是否压缩所选文件
        sizeType: ["original", "compressed"],
        camera: "back",
        success(chooseImageRes) {
          self.pickLocalPhotoCallBack(0, chooseImageRes?.tempFiles || null);
        },
        fail(err) {
          self.pickLocalPhotoCallBack(1, err);
        },
        complete(res) {
          self.pickLocalPhotoCallBack(2, res);
        },
      });
      // #endif
    },
    // 使用摄像头扫码
    useCamera() {
      const self = this;
      // #ifdef H5
      uni.showToast({
        title: "H5拍照识别功能开发中！目前仅支持微信小程序拍照识别！",
        icon: "none",
        duration: 1998,
      });
      // #endif
      // #ifdef MP-WEIXIN
      wx.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sourceType: ["camera"],
        sizeType: ["original", "compressed"],
        camera: "back",
        success(chooseImageRes) {
          self.pickLocalPhotoCallBack(0, chooseImageRes?.tempFiles || null);
        },
        fail(err) {
          self.pickLocalPhotoCallBack(1, err);
        },
        complete(res) {
          self.pickLocalPhotoCallBack(2, res);
        },
      });
      // #endif
    },
    // 预览上传图片
    previewImportImg(type) {
      const self = this;
      uni.previewImage({
        urls: [self.lotteryTicketArr[0]],
        longPressActions: {
          success: function (data) {
            // console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
          },
          fail: function (err) {
            // console.error(err.errMsg);
          },
        },
      });
    },
    // 计时用工具函数
    // start: 时间差开始
    // end: 时间差结束
    // getType: 需要的时间差类型，参考moment.duration对象get方法所能获取的到的，一般有：milliseconds、seconds、minutes、hours、days、months、years
    getTimeDuration(start, end, getType) {
      const duration = moment.duration(
        moment(parseInt(end)).diff(moment(parseInt(start)))
      );
      return duration.get(getType);
    },
    // 判断当日是否计算过是否幸运
    checkIsCountLucky() {
      if (this.settingInfo.firstLuckyDate !== moment().format("YYYY-MM-DD")) {
        return true;
      } else {
        if (this.settingInfo.isCheckLuckyOver) {
          return false;
        }
        return true;
      }
    },
    // 今天是幸运日吗
    isLuckyDay(isFirst, progress) {
      const total = 888;
      let nowProgress = progress;
      this.countLoading = true;
      if (isFirst) {
        this.countStartTime = moment().format("X");
      } else {
        const nowTime = moment().format("X");
        console.log(
          "当前计算已耗时：",
          this.getTimeDuration(this.countStartTime, nowTime, "milliseconds")
        );
      }
      const self = this;
      const randomTempNum = Math.random() * (1 - 0) + 0;
      nowProgress += randomTempNum;
      this.luckyRandomProgrss = Math.floor((nowProgress / total) * 100);
      this.luckyProgrssCount += 1;
      console.log(`当前计算进度：${this.luckyRandomProgrss}%`);
      if (nowProgress > total) {
        if (this.luckyProgrssCount % 2 === 0) {
          const luckyText = "今天你真的很幸运！";
          this.settingInfo.todayLuckyText = luckyText;
          uni.showToast({
            title: luckyText,
            icon: "none",
            duration: 1998,
          });
        } else {
          const luckyText = "哎呀今天不太走运，明天再试试吧！";
          this.settingInfo.todayLuckyText = luckyText;
          uni.showToast({
            title: luckyText,
            icon: "none",
            duration: 1998,
          });
        }
        this.luckyRandomProgrss = 0;
        this.luckyProgrssCount = 0;
        this.countLoading = false;
        this.settingInfo.isCheckLuckyOver = true;
        this.saveLuckySettingLocal();
      } else {
        this.luckyTimer = setTimeout(function () {
          self.isLuckyDay(false, nowProgress);
        }, 1);
      }
    },
    // 获取今日运势
    getTodayLucky() {
      if (this.todayWeek === "5") {
        uni.showToast({
          title: "非常抱歉，今天是星期五，无法获取今日运势~",
          icon: "none",
          duration: 1998,
        });
      } else {
        const self = this;
        if (this.checkIsCountLucky()) {
          this.settingInfo.luckyClickTotal = 0;
          this.saveLuckySettingLocal();
          this.isLuckyDay(true, 0);
          this.settingInfo.firstLuckyDate = moment().format("YYYY-MM-DD");
        } else {
          if (this.settingInfo.luckyClickTotal < 8) {
            this.settingInfo.luckyClickTotal += 1;
            const firstShowDuration = 2888;
            uni.showToast({
              title: `今天已经计算过了，${this.settingInfo.todayLuckyText}`,
              icon: "none",
              duration: firstShowDuration,
            });
            // setTimeout(function() {
            // 	if (self.settingInfo.todayLuckyText) {
            // 		uni.showToast({
            // 			title: self.settingInfo.todayLuckyText,
            // 			icon: 'none',
            // 			duration: 1998
            // 		});
            // 	}
            // }, firstShowDuration + 100);
          } else {
            // 触发彩蛋同时禁用点击
            this.countLoading = true;
            // 重复点击达到8次后，触发彩蛋，允许重新计算当日是否幸运
            const firstShowDuration = 1998;
            uni.showToast({
              title: "恭喜你触发彩蛋，重新计算今日运势！",
              icon: "none",
              duration: firstShowDuration,
            });
            this.settingInfo.firstLuckyDate = null;
            this.settingInfo.isCheckLuckyOver = false;
            this.settingInfo.todayLuckyText = null;
            this.settingInfo.luckyClickTotal = 0;
            this.saveLuckySettingLocal();
            setTimeout(function () {
              self.getTodayLucky();
            }, firstShowDuration + 100);
          }
          this.saveLuckySettingLocal();
        }
      }
    },
    // 跳转到历史号码记录列表的隐藏快捷方式
    handleToLogHistory() {
      this.$tab.navigateTo("/pages/lottery/log/index/index");
    },
    // 计时用工具函数，获取时分秒文字
    // start: 时间差开始
    // end: 时间差结束
    getTimeDurationText(totalSeconds) {
      const currentTime = moment.duration(totalSeconds, "seconds");
      return moment({
        h: currentTime.hours(),
        m: currentTime.minutes(),
        s: currentTime.seconds(),
      }).format("HH:mm:ss");
    },
    // 模拟摇奖
    fakeDrawLottery(isFirst) {
      if (this.todayWeek === "5") {
        uni.showToast({
          title: "非常抱歉，今天是星期五，不提供模拟摇奖~",
          icon: "none",
          duration: 1998,
        });
      } else {
        const self = this;
        // 记录开始摇奖状态
        this.isDrawLoading = true;
        // 判断是否事第一次点击
        if (isFirst) {
          this.countStartTime = moment().format("X");
          this.drawLotteryTime = this.settingInfo.drawLotteryTimeHistory;
        } else {
          const nowTime = moment().format("X");
          this.drawLotteryTime =
            this.settingInfo.drawLotteryTimeHistory +
            this.getTimeDuration(this.countStartTime, nowTime, "milliseconds");
          console.log("摇奖总耗时：", this.drawLotteryTime, "秒");
          this.drawLotteryText = `模拟摇奖中，已耗时：${this.getTimeDurationText(
            this.drawLotteryTime
          )}`;
        }
        // 模拟摇奖，并判断是否中奖
        this.settingInfo.luckyCount = 2;
        this.settingInfo.isOnlyFirstToday = false;

        // 第一次摇号
        this.packageRandomList();
        const yourNumberTempList = [];
        this.luckyNumberList[1].lotteryNumberFirst.forEach((item) => {
          yourNumberTempList.push(item.num);
        });
        this.luckyNumberList[1].lotteryNumberSecond.forEach((item) => {
          yourNumberTempList.push(item.num);
        });
        const yourNumber = yourNumberTempList.join(",");

        // 第二次摇号
        this.packageRandomList();
        const rightNumberTempList = [];
        this.luckyNumberList[1].lotteryNumberFirst.forEach((item) => {
          rightNumberTempList.push(item.num);
        });
        this.luckyNumberList[1].lotteryNumberSecond.forEach((item) => {
          rightNumberTempList.push(item.num);
        });
        const rightNumber = rightNumberTempList.join(",");

        const isWin = _.isEqual(yourNumber, rightNumber);
        console.log(`${yourNumber}\n${rightNumber}\n是否中奖：${isWin}`);
        // 若中奖，结束递归摇奖
        if (isWin) {
          // 中奖了停止摇奖状态
          this.isDrawLoading = false;
          // 记录中奖状态和号码
          console.log("今日模拟中奖号码：", rightNumber);
          this.settingInfo.bigRewardNumber = rightNumber;
          this.settingInfo.isGetBigReward = true;
          this.saveLuckySettingLocal();
        } else {
          clearTimeout(this.fakeDrawTimer);
          this.fakeDrawTimer = null;

          // #ifdef H5
          const drawGapH5 = 1;
          this.fakeDrawTimer = setTimeout(function () {
            self.fakeDrawLottery(false);
          }, drawGapH5);
          // #endif

          // #ifdef MP-WEIXIN
          const drawGapWX = 88;
          this.fakeDrawTimer = setTimeout(function () {
            self.fakeDrawLottery(false);
          }, drawGapWX);
          // #endif
        }
      }
    },
    // 停止计时
    stopDrawLottery() {
      const self = this;
      this.isDrawLoading = false;
      const drawLotteryTimeTemp = this.drawLotteryTime;
      // #ifdef H5
      this.initCacheSettingLocal();
      this.drawLotteryText = `继续摇奖，已耗时：${this.getTimeDurationText(
        drawLotteryTimeTemp
      )}`;
      this.settingInfo.drawLotteryTimeHistory = drawLotteryTimeTemp;
      // #endif
      // #ifdef MP-WEIXIN
      // 微信回调有延时，这里直接拷贝 `this.initCacheSettingLocal()` 方法过来
      wx.getStorage({
        key: "settingInfo",
        success: function (res) {
          let settingInfo = JSON.parse(res.data);
          self.settingInfo = {
            ...settingInfo,
          };
          // 如果打开了只允许一注随机则需要重新渲染当日的随机号码
          if (
            self.settingInfo.isOnlyFirstToday &&
            self.settingInfo.firstRandomDate === moment().format("YYYY-MM-DD")
          ) {
            self.luckyNumberList = self.settingInfo.localLuckyNumberList;
          }
          // 初始化完缓存配置项后初始化今日幸运数字
          self.initTodayLuckyNumber(settingInfo.luckyNumberDate);
          // 初始化模拟摇奖配置
          self.initDrawLottery();
          // 微信回调有延时，这里还原配置后保存计时
          self.drawLotteryText = `继续摇奖，已耗时：${self.getTimeDurationText(
            drawLotteryTimeTemp
          )}`;
          self.settingInfo.drawLotteryTimeHistory = drawLotteryTimeTemp;
        },
        fail: function () {
          // 如果第一次进入没有缓存配置，仍然需要生成当日幸运数字
          self.initTodayLuckyNumber(null);
        },
      });
      // #endif
      this.saveLuckySettingLocal();
      clearTimeout(this.fakeDrawTimer);
      this.fakeDrawTimer = null;
    },
    // 初始化摇奖状态
    initDrawLottery() {
      if (
        !this.settingInfo.isGetBigReward &&
        this.settingInfo.drawLotteryTimeHistory > 0
      ) {
        this.drawLotteryText = `继续摇奖，已耗时：${this.getTimeDurationText(
          this.settingInfo.drawLotteryTimeHistory
        )}`;
      } else {
        if (this.settingInfo.isGetBigReward) {
          this.drawLotteryText = `已中奖，中奖号码是：${this.settingInfo.bigRewardNumber}`;
          this.settingInfo.drawLotteryTimeHistory = 0;
        } else {
          this.drawLotteryText = "模拟摇奖";
        }
      }
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
