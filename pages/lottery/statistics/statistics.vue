<template>
  <view class="fx67ll-statistics-box">
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
    <view class="no-data" v-if="!logTotalList || logTotalList.length === 0">
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
    };
  },
  onLoad() {
    this.getTotalReward();
  },
  methods: {
    // 查询历史号码中奖金额统计
    getTotalReward() {
      const self = this;

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
        });
    },
  },
};
</script>

<style lang="less">
@import url("./statistics.less");
</style>
