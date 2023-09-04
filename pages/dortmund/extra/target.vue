<template>
  <view class="fx67ll-chart-box">
    <view id="fx67ll-wx-extra-chart" class="fx67ll-chart-target">
      <qiun-data-charts type="arcbar" :opts="opts" :chartData="chartData" />
    </view>
    <view class="fx67ll-txt-target">
      <span>{{ nowMoney }}</span>
      <span>/</span>
      <span>300000</span>
    </view>
  </view>
</template>

<script>
import { getExtraList } from "@/api/dortmund/extra";
export default {
  data() {
    return {
      nowMoney: 0,
      targetMoney: 300000,
      chartData: {
        series: [
          {
            name: "小目标已完成",
            color: "#2ecc71",
            data: 0,
          },
        ],
      },
      //您可以通过修改 config-ucharts.js 文件中下标为 ['bar'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
      opts: {
        title: {
          name: "0.27%",
          fontSize: 35,
          color: "#2ecc71",
        },
        subtitle: {
          name: "小目标已完成",
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
    };
  },
  onReady() {
    this.queryExtraList();
  },
  methods: {
    queryExtraList() {
      const self = this;
      const queryParams = {
        pageNum: 1,
        pageSize: 99999999,
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
  },
};
</script>

<style lang="less">
@import url("./target.less");
</style>
