<template>
  <view class="fx67ll-chart-box">
    <!-- #ifdef H5 -->
    <view class="fx67ll-chart-item"
      ><qiun-data-charts type="bar" :opts="opts" :chartData="chartData" />
    </view>
    <!-- #endif  -->
    <!-- #ifdef MP-WEIXIN -->
    <view
      id="fx67ll-wx-extra-chart"
      class="fx67ll-chart-item"
      :style="{ height: `${wxDomHeight}`, paddingBottom: '44rpx' }"
      ><qiun-data-charts type="bar" :opts="opts" :chartData="chartData" />
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import { getExtraList } from "@/api/fx67ll/dortmund/extra";
export default {
  data() {
    return {
      chartData: {},
      //您可以通过修改 config-ucharts.js 文件中下标为 ['bar'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
      opts: {
        color: [
          "#1890FF",
          "#91CB74",
          "#FAC858",
          "#EE6666",
          "#73C0DE",
          "#3CA272",
          "#FC8452",
          "#9A60B4",
          "#ea7ccc",
        ],
        padding: [5, 40, 0, 5],
        enableScroll: false,
        legend: {},
        xAxis: {
          boundaryGap: "justify",
          disableGrid: false,
          min: 0,
          axisLine: false,
          max: 40,
        },
        yAxis: {},
        extra: {
          bar: {
            type: "group",
            width: 20,
            meterBorde: 1,
            meterFillColor: "#FFFFFF",
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            linearType: "custom",
            barBorderCircle: true,
            seriesGap: 2,
            categoryGap: 2,
          },
        },
      },
      wxDomHeight: "",
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
          if (res?.rows && res?.rows?.length > 0) {
            self.countChartHeight(res.rows);
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
    countChartHeight(chartDataList) {
      const length = chartDataList.length;
      // #ifdef H5
      if (length <= 9) {
        document.getElementsByClassName("fx67ll-chart-item")[0].style.height =
          "calc(100vh - 44rpx)";
      } else {
        document.getElementsByClassName("fx67ll-chart-item")[0].style.height = `${
          100 * length
        }px`;
      }
      // #endif
      // #ifdef MP-WEIXIN
      if (length <= 9) {
        this.wxDomHeight = "calc(100vh - 44rpx)";
      } else {
        this.wxDomHeight = `${100 * length}px`;
      }
      // #endif
      this.formatChartData(chartDataList);
    },
    formatChartData(list) {
      const cateList = [];
      const seriesList = [];
      const targetList = [];
      const seedList = [];
      list.forEach((item) => {
        cateList.push(item?.createTime?.substr(0, 10));
        seriesList.push(parseFloat(item?.extraMoney || 0));
        const targetMoney =
          parseInt(item?.targetMoney || 0) + parseInt(item?.seedMoney || 0);
        targetList.push(targetMoney);
        seedList.push(item?.seedMoney);
      });
      const chartOption = {
        categories: cateList,
        series: [
          {
            name: "小目标",
            data: targetList,
          },
          {
            name: "交易余额",
            data: seriesList,
          },
          {
            name: "本金",
            data: seedList,
          },
        ],
        yAxis: {
          min: 0,
        },
      };
      this.chartData = JSON.parse(JSON.stringify(chartOption));
    },
  },
};
</script>

<style lang="less">
@import url("./chart.less");
</style>
