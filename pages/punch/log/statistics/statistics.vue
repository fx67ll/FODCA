<template>
  <view class="fx67ll-statistics-box">
    <view
      v-if="
        (nowLostLogList && nowLostLogList.length > 0) ||
        (prevLostLogList && prevLostLogList.length > 0)
      "
    >
      <view class="fx67ll-statistics-item">
        <uni-section title="当月缺卡记录" type="line">
          <uni-list v-if="nowLostLogList && nowLostLogList.length > 0">
            <uni-list-item
              v-for="item in nowLostLogList"
              :key="item.key"
              :title="item.punchDay"
              :rightText="item.lostPunchType"
            />
          </uni-list>
        </uni-section>
        <uni-list v-if="!nowLostLogList || nowLostLogList.length === 0">
          <uni-list-item title="恭喜你~ 本月暂无缺卡记录！(*^▽^*)" />
        </uni-list>
      </view>
      <view class="fx67ll-statistics-item">
        <uni-section title="上月缺卡记录" type="line">
          <uni-list v-if="prevLostLogList && prevLostLogList.length > 0">
            <uni-list-item
              v-for="item in prevLostLogList"
              :key="item.key"
              :title="item.punchDay"
              :rightText="item.lostPunchType"
            />
          </uni-list>
          <uni-list v-if="!prevLostLogList || prevLostLogList.length === 0">
            <uni-list-item title="恭喜你~ 上月暂无缺卡记录！(*^▽^*)" />
          </uni-list>
        </uni-section> </view
    ></view>
    <view
      class="no-data"
      :class="{
        'fade-show': !lostLogLoading,
      }"
      v-if="
        (!nowLostLogList || nowLostLogList.length === 0) &&
        (!prevLostLogList || prevLostLogList.length === 0) &&
        !lostLogLoading
      "
    >
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
      nowLostLogList: [],
      prevLostLogList: [],
      lostLogLoading: false,
    };
  },
  onShow() {
    this.initPunchLostLog();
  },
  methods: {
    // 初始化查询参数
    initPunchLostLog() {
      const self = this;

      this.lostLogLoading = true;
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

          const nowQueryParams = {
            pageNum: 1,
            pageSize: 999999999,
            punchMonth: moment().format("YYYY-MM"),
          };

          const prevQueryParams = {
            pageNum: 1,
            pageSize: 999999999,
            punchMonth: moment().subtract(1, "months").format("YYYY-MM"),
          };

          if (username === "fx67ll") {
            nowQueryParams.updateBy = username;
            prevQueryParams.updateBy = username;
          }

          self.qryPunchLostLog(nowQueryParams, 1);
          self.qryPunchLostLog(prevQueryParams, 2);
        })
        .catch((error) => {
          console.log("queryPunchLogTotalTime 方法中的 getInfo 接口异常：", error);
          uni.hideLoading();
          self.lostLogLoading = false;
        });
    },
    // 查询缺卡记录列表
    qryPunchLostLog(queryParams, type) {
      const self = this;
      getPunchLostLog(queryParams)
        .then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              const resList = res.rows.map((item, index) => {
                const tmpObj = {
                  ...item,
                  key: index,
                };
                return tmpObj;
              });
              if (type === 1) {
                self.nowLostLogList = [...resList];
              }
              if (type === 2) {
                self.prevLostLogList = [...resList];
              }
            }
          }
        })
        .finally(() => {
          uni.hideLoading();
          self.lostLogLoading = false;
        });
    },
  },
};
</script>

<style lang="less">
@import url("./statistics.less");
</style>
