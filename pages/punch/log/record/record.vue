<template>
  <view class="fx67ll-punch-box">
    <view
      v-if="!isShowAddDrawer"
      id="fx67ll-wx-punch-chart"
      class="fx67ll-chart-punch"
      :style="{ marginTop: `${getChartMarginTop}` }"
    >
      <qiun-data-charts type="arcbar" :opts="opts" :chartData="chartData" />
    </view>
    <view class="fx67ll-txt-target" v-if="!isShowAddDrawer">
      <span>{{ nowMoney }}</span>
      <span>/</span>
      <span>300000</span>
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
import punchDrawer from "../../component/punchDrawer.vue";

import { getExtraList } from "@/api/dortmund/extra";

export default {
  components: {
    punchDrawer,
  },
  data() {
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
      // Drawer组件相关参数
      isShowAddDrawer: false,
    };
  },
  onReady() {
    this.queryPunchLogList();
  },
  computed: {
    getChartMarginTop() {
      return `${(uni.getSystemInfoSync().windowHeight - 400) / 2}px`;
    },
  },
  methods: {
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
