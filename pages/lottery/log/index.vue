<template>
  <view class="fx67ll-log-box">
    <view class="fx67ll-log-item" v-for="item in logList" :key="item.logId">
      <uni-swipe-action-item
        :right-options="actionOptions"
        @click="(e) => handleActionClick(e, item.createTime)"
      >
        <uni-section :title="item.createTime" type="line">
          <uni-list :border="true">
            <uni-list-chat
              v-for="ita in item.chaseList"
              :key="ita.numId"
              :title="ita.title"
              avatar="https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5"
              :note="ita.chaseNumber"
              :time="ita.updateTime"
              :badge-text="ita.winText"
            ></uni-list-chat>
            <uni-list-chat
              v-for="itb in item.recordList"
              :key="itb.numId"
              :title="itb.title"
              :avatar="
                'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=' +
                itb.imgRandom
              "
              :note="itb.recordNumber"
              :time="itb.updateTime"
              :badge-text="itb.winText"
            ></uni-list-chat>
          </uni-list>
        </uni-section>
      </uni-swipe-action-item>
    </view>
  </view>
</template>

<script>
import { getLogList } from "@/api/lottery/log";
import { showConfirm } from "@/utils/common";
export default {
  data() {
    return {
      logList: [],
      badgeCustomStyle: {
        backgroundColor: "#2ecc71",
        zoom: 1.2,
        position: "relative",
        left: "14rpx",
        top: "4rpx",
        padding: "0 14rpx",
      },
      actionOptions: [
        {
          text: "取消",
          style: {
            backgroundColor: "#4096ff",
          },
        },
        {
          text: "删除",
          style: {
            backgroundColor: "#ff4d4f",
          },
        },
      ],
    };
  },
  onLoad() {
    this.queryLogList();
  },
  methods: {
    queryLogList() {
      const self = this;
      const queryParams = {
        pageNum: 1,
        pageSize: 1023,
      };
      getLogList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            // console.log("queryLogList", res.rows);
            self.logList = self.formatLogList(res.rows);
            // console.log("formatLogList", self.logList);
          } else {
            uni.showToast({
              title: "暂无数据！",
              icon: "none",
              duration: 1998,
            });
          }
        } else {
          uni.showToast({
            title: "查询历史号码记录失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    formatLogList(list) {
      const self = this;
      const listResult = [];
      list.forEach((item) => {
        const tmpObj = {
          logId: item?.logId || new Date().getTime() + self.getRandomIndex(),
          createTime: item?.createTime || "暂无数据",
          chaseList: [],
          recordList: [],
        };
        const cl = item?.chaseNumber?.split("/") || [];
        const rl = item?.recordNumber?.split("/") || [];
        const winFlag = item?.isWin || "N";
        if (cl.length > 0) {
          cl.forEach((ita) => {
            tmpObj.chaseList.push({
              numId: new Date().getTime() + self.getRandomIndex(),
              title: "固定追号",
              updateTime: item?.updateTime || item?.createTime || "暂无数据",
              chaseNumber: ita || "暂无数据",
              isWin: winFlag,
              winText: self.getWinText(winFlag, item?.winningPrice),
            });
          });
        }
        if (rl.length > 0) {
          rl.forEach((itb) => {
            tmpObj.recordList.push({
              numId: new Date().getTime() + self.getRandomIndex(),
              title: self.getTitleByWeekType(item?.weekType),
              updateTime: item?.updateTime || item?.createTime || "暂无数据",
              recordNumber: itb || "暂无数据",
              imgRandom: self.getImgRandomByWeekType(item?.weekType),
              isWin: winFlag,
              winText: self.getWinText(winFlag, item?.winningPrice),
            });
          });
        }
        listResult.push({ ...tmpObj });
      });
      return listResult;
    },
    getTitleByWeekType(type) {
      if (["1", "3", "6"].includes(type?.toString())) {
        return "随机大乐透";
      } else if (["2", "3", "7"].includes(type?.toString())) {
        return "随机双色球";
      } else {
        return "异常数据";
      }
    },
    getImgRandomByWeekType(type) {
      if (["1", "3", "6"].includes(type?.toString())) {
        return 6;
      } else if (["2", "3", "7"].includes(type?.toString())) {
        return 7;
      } else {
        return 5;
      }
    },
    getWinText(flag, price) {
      if (flag === "Y" && parseInt(price) > 0) {
        return `中奖${price}元`;
      } else {
        return "未中奖";
      }
    },
    getRandomIndex() {
      return Math.floor(Math.random() * 1023) + 1;
    },
    deleteLog() {},
    handleActionClick(e, time) {
      if (e?.index === 1) {
        showConfirm(
          `删除后数据无法恢复，请确认是否删除创建时间为：${time} 的历史号码记录？`,
          "警告"
        ).then((res) => {
          if (res?.confirm) {
            console.log("handleActionClick", e, time);
          }
        });
      }
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
