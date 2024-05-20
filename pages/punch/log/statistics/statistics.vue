<template>
  <view class="fx67ll-statistics-box">
    <view class="fx67ll-statistics-item" v-if="lostLogList && lostLogList.length > 0">
      <uni-section title="当月缺卡记录" type="line">
        <uni-list>
          <uni-list-item
            v-for="item in lostLogList"
            :key="item.key"
            :title="item.punchDay"
            :rightText="item.lostPunchType"
          />
        </uni-list>
      </uni-section>
    </view>
    <view class="fx67ll-statistics-item" v-if="lostLogList && lostLogList.length > 0">
      <uni-section title="上月缺卡记录" type="line">
        <uni-list>
          <uni-list-item
            v-for="item in lostLogList"
            :key="item.key"
            :title="item.punchDay"
            :rightText="item.lostPunchType"
          />
        </uni-list>
      </uni-section>
    </view>
    <view class="no-data" v-if="!lostLogList || lostLogList.length === 0">
      <img src="/static/images/no-data.png" />
    </view>
  </view>
</template>

<script>
import { getPunchLostLog } from "@/api/punch/log";
import { getInfo } from "@/api/login";

import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

export default {
  data() {
    return {
      lostLogList: [],
    };
  },
  onShow() {
    this.getPunchLostLog();
  },
  methods: {
    // 查询缺卡记录列表
    getPunchLostLog() {
      const self = this;

      uni.showLoading({
        title: "查询数据中...",
      });

      getInfo()
        .then((res) => {
          const user = res?.user;
          const username =
            user == null || user.userName == "" || user.userName == null
              ? ""
              : user.userName;

          const queryParams = {
            pageNum: 1,
            pageSize: 999999999,
            punchMonth: moment().format("YYYY-MM"),
          };

          if (username === "fx67ll") {
            queryParams.updateBy = username;
          }

          getPunchLostLog(queryParams)
            .then((res) => {
              if (res?.code === 200) {
                if (res?.rows && res?.rows?.length > 0) {
                  self.lostLogList = res.rows.map((item, index) => {
                    const tmpObj = {
                      ...item,
                      key: index,
                    };
                    return tmpObj;
                  });
                }
              }
            })
            .finally(() => {
              uni.hideLoading();
            });
        })
        .catch((error) => {
          console.log("queryPunchLogTotalTime 方法中的 getInfo 接口异常：", error);
          self.isPunchLoading = false;
          uni.hideLoading();
        });
    },
  },
};
</script>

<style lang="less">
@import url("./statistics.less");
</style>
