<template>
  <view class="fx67ll-statistics-box">
    <view v-if="logTotalList && logTotalList.length > 0">
      <qiun-data-charts type="pie" :opts="chartOpts" :chartData="chartData" />
    </view>
    <view v-if="logTotalList && logTotalList.length > 0">
      <view class="fx67ll-statistics-item" :key="item.key" v-for="item in logTotalList">
        <uni-section :title="item.lotteryType" type="line">
          <uni-list>
            <uni-list-item title="中奖金额" :rightText="`￥${item.totalWinningAmount}`" />
            <uni-list-item title="总花费金额" :rightText="`￥${item.totalNumbers * 2}`" />
            <uni-list-item title="中奖期数" :rightText="item.winningTickets" />
            <uni-list-item title="总购买期数" :rightText="item.totalTickets" />
            <uni-list-item title="总购买注数" :rightText="item.totalNumbers" />
          </uni-list>
        </uni-section>
      </view>
    </view>
    <view
      class="no-data"
      :class="{
        'fade-show': !logTotalLoading,
      }"
      v-if="(!logTotalList || logTotalList.length === 0) && !logTotalLoading"
    >
      <img src="/static/images/no-data.png" />
    </view>
  </view>
</template>

<script>
import { listTotalReward } from "@/api/lottery/log";

export default {
  data() {
    return {
      logTotalList: [],
      logTotalLoading: false,
      chartOpts: {
        legend: {
          fontSize: 16,
          itemGap: 20,
        },
        color: ["#91CB74", "#EE6666"],
        padding: [5, 5, 5, 5],
        enableScroll: false,
        extra: {
          pie: {
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: true,
            borderWidth: 3,
            borderColor: "#FFFFFF",
          },
        },
      },
      chartData: {
        series: [
          {
            data: [
              {
                name: `已中奖`,
                value: 0,
                // labelText: `已中奖:${parseFloat((0 / 100) * 100).toFixed(2)}%`,
              },
              {
                name: "未中奖",
                value: 0,
                // labelText: `未中奖:${parseFloat((0 / 100) * 100).toFixed(2)}%`,
              },
            ],
          },
        ],
      },
    };
  },
  onLoad() {
    this.getTotalReward();
  },
  methods: {
    // 查询历史号码中奖金额统计
    getTotalReward() {
      const self = this;

      this.logTotalLoading = true;
      uni.showLoading({
        title: "查询数据中...",
      });

      this.logTotalList = [];
      listTotalReward()
        .then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              self.logTotalList = res.rows.map((item, index) => {
                const tmpObj = {
                  ...item,
                  key: index,
                };
                return tmpObj;
              });
              self.logTotalList.splice(0, 0, self.logTotalList.splice(-1)[0]);
              if (res?.rows?.length === 3) {
                self.chartData.series = [
                  {
                    data: [
                      {
                        name: `已中奖`,
                        value: parseInt(res?.rows[2]?.totalWinningAmount || 0),
                      },
                      {
                        name: "未中奖",
                        value: parseInt(
                          (res?.rows[2]?.totalNumbers || 0) * 2 -
                            (res?.rows[2]?.totalWinningAmount || 0)
                        ),
                      },
                    ],
                  },
                ];
              }
            } else {
              uni.showToast({
                title: "暂无更多数据！",
                icon: "none",
                duration: 1998,
              });
            }
          } else {
            uni.showToast({
              title: "查询历史统计记录失败！",
              icon: "none",
              duration: 1998,
            });
          }
        })
        .finally(() => {
          uni.hideLoading();
          self.logTotalLoading = false;
        });
    },
  },
};
</script>

<style lang="less">
@import url("./statistics.less");
</style>
