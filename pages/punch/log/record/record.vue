<template>
  <view class="fx67ll-punch-box">
    <view
      v-if="!isShowDrawer"
      id="fx67ll-wx-punch-chart"
      class="fx67ll-chart-punch"
      :style="{ marginTop: `${getChartMarginTop}` }"
    >
      <qiun-data-charts type="arcbar" :opts="opts" :chartData="chartData" />
    </view>
    <view class="fx67ll-txt-target" v-if="!isShowDrawer">
      <span>{{ nowMoney }}</span>
      <span>/</span>
      <span>300000</span>
    </view>
    <view class="fx67ll-punch-btn" v-if="!isShowDrawer">
      <button class="fx67ll-btn-record" type="primary" @click="showPunchDrawerForAddLog">
        记录打卡时间
      </button>
      <uni-icons
        class="fx67ll-btn-history"
        type="wallet"
        :size="32"
        @click="goToHistoryLogList"
      ></uni-icons>
    </view>
    <zb-drawer
      mode="bottom"
      :title="drawerTitle"
      :wrapperClosable="false"
      :visible.sync="isShowDrawer"
      :radius="true"
      :height="drawerHeight"
      :before-close="handleDrawerClose"
    >
      <view class="fx67ll-punch-drawer">
        <view class="fx67ll-punch-item">
          <view class="fx67ll-punch-item-title">打卡类型</view>
          <view class="fx67ll-punch-item-picker">
            <picker
              @change="punchTypeChange"
              :value="punchTypeIndex"
              :range="punchTypeArr"
            >
              <view class="fx67ll-punch-item-text">{{
                punchTypeArr[punchTypeIndex]
              }}</view>
            </picker>
          </view>
        </view>
        <view class="fx67ll-punch-item">
          <view class="fx67ll-punch-item-title">打卡日期</view>
          <view class="fx67ll-punch-item-picker">
            <picker
              mode="date"
              :value="punchDate"
              :start="startPunchDate"
              :end="endPunchDate"
              @change="punchDateChange"
            >
              <view class="fx67ll-punch-item-text">{{ punchDate }}</view>
            </picker>
          </view>
        </view>
        <view class="fx67ll-punch-item">
          <view class="fx67ll-punch-item-title">打卡时间</view>
          <view class="fx67ll-punch-item-picker">
            <picker
              mode="time"
              :value="punchTime"
              start="00:00"
              end="23:59"
              @change="punchTimeChange"
            >
              <view class="fx67ll-punch-item-text">{{ punchTime }}</view>
            </picker>
          </view>
        </view>
        <button class="fx67ll-btn-add" type="primary" @click="addPunchLog">
          新增打卡记录
        </button>
      </view>
    </zb-drawer>
  </view>
</template>

<script>
import { getExtraList } from "@/api/dortmund/extra";
import { addPunchLog } from "@/api/punch/log";

import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

export default {
  data() {
    const currentDate = this.getPunchDate({
      format: true,
    });
    return {
      nowMoney: 0,
      targetMoney: 300000,
      chartData: {
        series: [
          {
            name: "本月累计工时",
            color: "#2ecc71",
            data: 0,
          },
        ],
      },
      //您可以通过修改 config-ucharts.js 文件中下标为 ['bar'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
      opts: {
        title: {
          name: "0%",
          fontSize: 35,
          color: "#2ecc71",
        },
        subtitle: {
          name: "本月累计工时",
          fontSize: 25,
          color: "#999999",
        },
        extra: {
          arcbar: {
            type: "circle",
            width: 23,
            backgroundColor: "#E9E9E9",
            startAngle: 1.5,
            endAngle: 0.25,
            gap: 2,
          },
        },
      },
      // 定时器对象
      timer: null,
      // Drawer组件相关参数
      isShowDrawer: false,
      drawerHeight: "350px",
      drawerTitle: moment().format("YYYY-MM-DD hh:mm:ss dddd"),
      // 选择器组件相关参数
      punchTypeArr: ["上班打卡", "下班打卡"],
      punchTypeIndex: 0,
      punchDate: currentDate,
      punchTime: moment().format("HH:mm"),
    };
  },
  onReady() {
    this.getDefaultPunchType();
    this.queryPunchLogList();
  },
  onLoad() {
    // moment初始汉化
    moment.locale("zh-cn");
    // 显示当前时间
    this.showNowTime();
  },
  onUnload() {
    // 销毁时清除定时器
    clearInterval(this.timer);
    this.timer = null;
  },
  computed: {
    getChartMarginTop() {
      return `${(uni.getSystemInfoSync().windowHeight - 400) / 2}px`;
    },
    startPunchDate() {
      return this.getPunchDate("start");
    },
    endPunchDate() {
      return this.getPunchDate("end");
    },
  },
  methods: {
    // 显示当前时间
    showNowTime() {
      const self = this;
      this.timer = setInterval(() => {
        self.drawerTitle = moment().format("YYYY-MM-DD hh:mm:ss dddd");
      }, 1000);
    },
    // 查询打卡记录列表
    queryPunchLogList() {
      const self = this;
      const queryParams = {
        pageNum: 1,
        pageSize: 1,
      };
      getExtraList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0 && res.rows[0]?.extraMoney) {
            self.nowMoney = res.rows[0]?.extraMoney;
            const targetPercent = parseFloat(res.rows[0].extraMoney) / 300000;
            self.chartData.series[0].data = targetPercent.toFixed(4);
            self.opts.title.name = `${(targetPercent * 100).toFixed(2)}%`;
          } else {
            uni.showToast({
              title: "暂无外快盈亏记录数据！",
              icon: "none",
              duration: 1998,
            });
          }
        } else {
          uni.showToast({
            title: "查询外快盈亏记录失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    // 打开新增打卡记录抽屉
    showPunchDrawerForAddLog() {
      this.isShowDrawer = true;
    },
    // 查看历史打卡记录列表
    goToHistoryLogList() {
      this.$tab.navigateTo("/pages/punch/log/index/index");
    },
    // 切换打卡类型
    punchTypeChange: function (e) {
      console.log("picker发送选择改变，携带值为", e.detail.value);
      this.punchTypeIndex = e.detail.value;
    },
    // 获取默认打卡类型
    getDefaultPunchType() {
      const currentTime = moment();
      const noon = moment().hour(12).minute(0).second(0);
      if (currentTime.isBefore(noon)) {
        this.punchTypeIndex = 0;
      } else {
        this.punchTypeIndex = 1;
      }
    },
    // 切换打卡日期
    punchDateChange: function (e) {
      this.punchDate = e.detail.value;
    },
    // 切换打卡时间
    punchTimeChange: function (e) {
      this.punchTime = e.detail.value;
    },
    // 获取打卡日期
    getPunchDate(type) {
      const date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();

      if (type === "start") {
        year = year - 60;
      } else if (type === "end") {
        year = year + 2;
      }
      month = month > 9 ? month : "0" + month;
      day = day > 9 ? day : "0" + day;
      return `${year}-${month}-${day}`;
    },
    // 新增打卡记录
    addPunchLog() {
      const self = this;
      const addParams = {
        punchType: (parseInt(self.punchTypeIndex, 10) + 1).toString(),
        updateTime: `${self.punchDate} ${self.punchTime}:${moment().format("ss")}`,
        punchRemark: "",
      };
      addPunchLog(addParams).then((res) => {
        self.isNetworkLoading = false;
        if (res?.code === 200) {
          self.isShowDrawer = false;
          uni.showToast({
            title: "打卡时间记录成功！",
            icon: "none",
            duration: 1998,
          });
        } else {
          uni.showToast({
            title: "打卡时间记录失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
  },
};
</script>

<style lang="less">
@import url("./record.less");
</style>
