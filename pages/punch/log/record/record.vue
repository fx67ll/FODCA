<template>
  <view class="fx67ll-punch-box">
    <view
      v-if="!isShowAddDrawer"
      id="fx67ll-wx-punch-chart"
      class="fx67ll-chart-punch"
      :style="{ marginTop: `${getChartMarginTop}` }"
    >
      <qiun-data-charts type="arcbar" :opts="chartOpts" :chartData="chartData" />
    </view>
    <view class="fx67ll-txt-target" v-if="!isShowAddDrawer">
      <span>{{ punchWorkHours }}</span>
      <span>/</span>
      <span>{{ targetWorkHours }}</span>
    </view>
    <view class="fx67ll-punch-btn" v-if="!isShowAddDrawer">
      <button class="fx67ll-btn-record" type="primary" @click="showPunchDrawerForAddLog">
        记录打卡时间
      </button>
      <uni-icons
        class="fx67ll-btn-history"
        type="medal-filled"
        :size="32"
        @click="goToHistoryLogList"
      ></uni-icons>
    </view>
    <punchDrawer
      :isShowPunchDrawer="isShowAddDrawer"
      :isAdd="true"
      @hideDrawer="setIsShowDrawer"
    />
  </view>
</template>

<script>
import punchDrawer from "@/pages/punch/component/punchDrawer.vue";

import { getWorkTotalTime } from "@/api/punch/log";
import { getInfo } from "@/api/login";

import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

export default {
  components: {
    punchDrawer,
  },
  data() {
    return {
      punchWorkHours: 0,
      targetWorkHours: 300000,
      chartData: {
        series: [
          {
            name: "本月工时进度",
            color: "#2ecc71",
            data: 0,
          },
        ],
      },
      //您可以通过修改 config-ucharts.js 文件中下标为 ['bar'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
      chartOpts: {
        title: {
          name: "0%",
          fontSize: 35,
          color: "#2ecc71",
          offsetY: -8,
        },
        subtitle: {
          name: "本月工时进度",
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
      // Drawer组件相关参数
      isShowAddDrawer: false,
    };
  },
  onReady() {
    this.queryPunchLogTotalTime();
  },
  computed: {
    getChartMarginTop() {
      return `${(uni.getSystemInfoSync().windowHeight - 400) / 2}px`;
    },
  },
  methods: {
    // 查询打卡工时统计
    queryPunchLogTotalTime() {
      const self = this;

      const weekDays = self.queryWeekdaysCount();
      this.targetWorkHours = weekDays * 8.5;

      getInfo().then((res) => {
        const user = res?.user;
        const username =
          user == null || user.userName == "" || user.userName == null
            ? ""
            : user.userName;

        const queryParams = {
          pageNum: 1,
          pageSize: 999999999,
        };

        if (username === "fx67ll") {
          queryParams.updateBy = username;
        }

        getWorkTotalTime(queryParams).then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              console.log(res?.rows);
              const punchData = res?.rows[0];
              self.punchWorkHours = punchData?.totalWorkHours.toFixed(1);
              self.chartData.series[0].data = (
                punchData?.totalWorkHours / self.targetWorkHours
              ).toFixed(3);
              self.chartOpts.title.name = `${(
                (self.punchWorkHours / self.targetWorkHours) *
                100
              ).toFixed(1)}%`;
              self.chartData.series[0].name = `${moment().month() + 1}月工时进度`;
              self.chartOpts.subtitle.name = `${moment().month() + 1}月工时进度`;
            } else {
              uni.showToast({
                title: "暂无工时统计数据！",
                icon: "none",
                duration: 1998,
              });
            }
          } else {
            uni.showToast({
              title: "工时统计查询失败！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      });
    },
    // 查询某年某月的工作日数量
    queryWeekdaysCount() {
      const year = moment().year();
      const month = moment().month() + 1;
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      let count = 0;
      for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
        if (day.getDay() !== 0 && day.getDay() !== 6) {
          count++;
        }
      }
      // console.log(`在${year}年${month}月共有${count}个工作日。`);
      return count;
    },
    // 打开新增打卡记录抽屉
    showPunchDrawerForAddLog() {
      this.isShowAddDrawer = true;
    },
    // 关闭新增打卡记录抽屉
    setIsShowDrawer(val) {
      this.isShowAddDrawer = val;
    },
    // 查看历史打卡记录列表
    goToHistoryLogList() {
      this.$tab.navigateTo("/pages/punch/log/index/index");
    },
  },
};
</script>

<style lang="less">
@import url("./record.less");
</style>
