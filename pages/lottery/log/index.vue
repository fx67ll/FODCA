<template>
  <view class="fx67ll-log-box">
    <z-paging-mini ref="paging" v-model="logList" @query="queryLogList">
      <view class="fx67ll-log-item" v-for="item in logList" :key="item.logKey">
        <uni-swipe-action-item
          :right-options="actionOptions"
          @click="(e) => handleActionClick(e, item)"
        >
          <uni-section :title="item.createTime" type="line">
            <uni-list :border="true">
              <view v-if="item.winFlag !== 'Y'">
                <uni-list-chat
                  v-for="ita in item.chaseList"
                  :key="ita.numKey"
                  avatar="https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5"
                  :title="ita.title"
                  :note="ita.chaseNumber"
                  :time="ita.updateTime"
                  :badge-text="ita.winText"
                >
                </uni-list-chat
              ></view>

              <view v-if="item.winFlag === 'Y'">
                <uni-list-chat
                  v-for="ita in item.chaseList"
                  :key="ita.numKey"
                  avatar="https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5"
                  :title="ita.title"
                  :note="ita.chaseNumber"
                >
                  <template v-slot:default>
                    <view :style="{ fontSize: '12px', color: '#999' }">
                      {{ itb.updateTime }}
                    </view>
                    <view>
                      <uni-badge :text="itb.winText" :custom-style="badgeCustomStyle" />
                    </view>
                  </template> </uni-list-chat
              ></view>

              <view v-if="item.winFlag !== 'Y'">
                <uni-list-chat
                  v-for="itb in item.recordList"
                  :key="itb.numKey"
                  :avatar="
                    'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=' +
                    itb.imgRandom
                  "
                  :title="itb.title"
                  :note="itb.recordNumber"
                  :time="itb.updateTime"
                  :badge-text="itb.winText"
                >
                </uni-list-chat
              ></view>

              <view v-if="item.winFlag === 'Y'">
                <uni-list-chat
                  v-for="itb in item.recordList"
                  :key="itb.numKey"
                  :avatar="
                    'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=' +
                    itb.imgRandom
                  "
                  :title="itb.title"
                  :note="itb.recordNumber"
                >
                  <template v-slot:default v-if="itb.winFlag">
                    <view :style="{ fontSize: '12px', color: '#999' }">
                      {{ itb.updateTime }}
                    </view>
                    <view>
                      <uni-badge :text="itb.winText" :custom-style="badgeCustomStyle" />
                    </view>
                  </template> </uni-list-chat
              ></view>
            </uni-list>
          </uni-section>
        </uni-swipe-action-item>
      </view>
    </z-paging-mini>
  </view>
</template>

<script>
import { getLogList, delLog } from "@/api/lottery/log";
import { showConfirm } from "@/utils/common";
import uniListChat from "@/uni_modules/uni-list/components/uni-list-chat/uni-list-chat.vue";
export default {
  components: { uniListChat },
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
    // this.queryLogList();
    // 请勿直接调用queryLogList方法！！
    // this.$refs.paging.reload();
  },
  methods: {
    queryLogList(pageNum, pageSize) {
      const self = this;
      const queryParams = {
        pageNum,
        pageSize,
      };
      getLogList(queryParams)
        .then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              // console.log("queryLogList", res.rows);
              // self.logList = self.formatLogList(res.rows);
              // console.log("formatLogList", self.logList);
              // 将请求的结果数组传递给z-paging
              self.$refs.paging.complete(self.formatLogList(res.rows));
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
        })
        .catch((res) => {
          // 如果请求失败写this.$refs.paging.complete(false);
          // 注意，每次都需要在catch中写这句话很麻烦，z-paging提供了方案可以全局统一处理
          // 在底层的网络请求抛出异常时，写uni.$emit('z-paging-error-emit');即可
          self.$refs.paging.complete(false);
        });
    },
    formatLogList(list) {
      const self = this;
      const listResult = [];
      list.forEach((item) => {
        const winFlag = item?.isWin || "N";
        const tmpObj = {
          logId: item?.lotteryId,
          logKey: new Date().getTime() + self.getRandomIndex(),
          createTime: item?.createTime || "暂无数据",
          winFlag,
          chaseList: [],
          recordList: [],
        };
        const cl = item?.chaseNumber?.split("/") || [];
        const rl = item?.recordNumber?.split("/") || [];
        if (cl.length > 0) {
          cl.forEach((ita) => {
            tmpObj.chaseList.push({
              numKey: new Date().getTime() + self.getRandomIndex(),
              title: "固定追号",
              updateTime:
                self.spliceUpdateTime(item?.updateTime) ||
                self.spliceUpdateTime(item?.createTime) ||
                "暂无数据",
              chaseNumber: ita || "暂无数据",
              winText: self.getWinText(winFlag, item?.winningPrice),
            });
          });
        }
        if (rl.length > 0) {
          rl.forEach((itb) => {
            tmpObj.recordList.push({
              numKey: new Date().getTime() + self.getRandomIndex(),
              title: self.getTitleByWeekType(item?.weekType),
              updateTime:
                self.spliceUpdateTime(item?.updateTime) ||
                self.spliceUpdateTime(item?.createTime) ||
                "暂无数据",
              recordNumber: itb || "暂无数据",
              imgRandom: self.getImgRandomByWeekType(item?.weekType),
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
      } else if (["2", "4", "7"].includes(type?.toString())) {
        return "随机双色球";
      } else {
        return "异常数据";
      }
    },
    spliceUpdateTime(time) {
      if (time && time.length === 19) {
        return time.substring(2, 16);
      } else {
        return null;
      }
    },
    getImgRandomByWeekType(type) {
      if (["1", "3", "6"].includes(type?.toString())) {
        return 6;
      } else if (["2", "4", "7"].includes(type?.toString())) {
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
    deleteLog(id) {
      const self = this;
      delLog(id).then((res) => {
        if (res?.code === 200) {
          self.queryLogList();
          uni.showToast({
            title: "历史号码记录删除成功！",
            icon: "none",
            duration: 1998,
          });
        } else {
          uni.showToast({
            title: "历史号码记录删除失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    handleActionClick(e, record) {
      const self = this;
      if (e?.index === 1) {
        showConfirm(
          `删除后数据无法恢复，请确认是否删除创建时间为：${record?.createTime} 的历史号码记录？`,
          "警告"
        ).then((res) => {
          if (res?.confirm && record?.logId) {
            // console.log("handleActionClick", e, record);
            self.deleteLog(record.logId);
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
