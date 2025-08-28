<template>
  <view class="fx67ll-statistics-box">
    <view v-if="
      (nowAvgLogList && nowAvgLogList.length > 0) ||
      (nowLostLogList && nowLostLogList.length > 0) ||
      (prevLostLogList && prevLostLogList.length > 0)
    ">
      <view class="fx67ll-statistics-item">
        <uni-section title="本月均工时" type="line">
          <uni-list v-if="nowAvgLogList && nowAvgLogList.length > 0">
            <uni-list-item v-for="item in nowAvgLogList" :key="item.key" :title="item.title" :rightText="item.text" />
          </uni-list>
        </uni-section>
        <uni-list v-if="!nowAvgLogList || nowAvgLogList.length === 0">
          <uni-list-item title="暂无当月均工时数据！ (*｀皿´*)ﾉ " />
        </uni-list>
      </view>
      <view class="fx67ll-statistics-item">
        <uni-section title="当月缺卡记录" type="line">
          <uni-list v-if="nowLostLogList && nowLostLogList.length > 0">
            <uni-list-item v-for="item in nowLostLogList" :key="item.key" :title="item.punchDay"
              :rightText="item.lostPunchType" />
          </uni-list>
        </uni-section>
        <uni-list v-if="!nowLostLogList || nowLostLogList.length === 0">
          <uni-list-item title="恭喜你~ 本月暂无缺卡记录！(*^▽^*)" />
        </uni-list>
      </view>
      <view class="fx67ll-statistics-item">
        <uni-section title="上月缺卡记录" type="line">
          <uni-list v-if="prevLostLogList && prevLostLogList.length > 0">
            <uni-list-item v-for="item in prevLostLogList" :key="item.key" :title="item.punchDay"
              :rightText="item.lostPunchType" />
          </uni-list>
          <uni-list v-if="!prevLostLogList || prevLostLogList.length === 0">
            <uni-list-item title="恭喜你~ 上月暂无缺卡记录！(*^▽^*)" />
          </uni-list>
        </uni-section>
      </view>
    </view>
    <view class="no-data" :class="{
      'fade-show': !lostLogLoading,
    }" v-if="
      (!nowLostLogList || nowLostLogList.length === 0) &&
      (!prevLostLogList || prevLostLogList.length === 0) &&
      !lostLogLoading
    ">
      <img src="/static/images/no-data.png" />
    </view>
  </view>
</template>

<script>
import { getPunchLostLog, getWorkTotalTime } from "@/api/punch/log";
import { getInfo } from "@/api/login";

import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

export default {
  data() {
    return {
      nowAvgLogList: [],
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

          self.queryPunchLogTotalTime(nowQueryParams);
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
    // 查询打卡工时统计
    queryPunchLogTotalTime(queryParams) {
      const self = this;
      getWorkTotalTime(queryParams)
        .then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              const totalData = res?.rows[0];
              self.nowAvgLogList = [
                {
                  key: 1,
                  title: "当月总工时 (小时)",
                  text: totalData?.totalWorkHours || 0,
                },
                {
                  key: 2,
                  title: "当月已打卡天数",
                  text: totalData?.totalPunchDays || 0,
                },
                {
                  key: 2,
                  title: "当月缺卡天数",
                  text: totalData?.totalPunchDays && totalData?.totalWorkDays ? totalData?.totalPunchDays - totalData?.totalWorkDays : 0,
                },
                {
                  key: 2,
                  title: "当月日均工时 (小时)",
                  text: totalData?.workHoursPerDay ? totalData?.workHoursPerDay.toFixed(2) : 0,
                },
                {
                  key: 2,
                  title: "当月净日均工时 (小时)",
                  text: totalData?.totalWorkHours && totalData?.totalPunchDays ? (totalData?.totalWorkHours / totalData?.totalPunchDays).toFixed(2) : 0,
                },
              ];
            }
          } else {
            uni.showToast({
              title: "当月均工时统计查询失败！",
              icon: "none",
              duration: 1998,
            });
          }
        })
        .finally(() => {
          uni.hideLoading();
          self.isPunchLoading = false;
        });
    },
  },
};
</script>

<style lang="less">
@import url("./statistics.less");
</style>
