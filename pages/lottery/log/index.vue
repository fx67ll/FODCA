<template>
  <view class="fx67ll-log-box">
    <z-paging-mini ref="paging" v-model="logList" @query="queryLogList">
      <uni-swipe-action>
        <view class="fx67ll-log-item" v-for="item in logList" :key="item.logKey">
          <uni-swipe-action-item
            :left-options="leftActionOptions"
            :right-options="rightActionOptions"
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
                  </uni-list-chat>
                </view>

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
                        {{ ita.updateTime }}
                      </view>
                      <view>
                        <uni-badge :text="ita.winText" :custom-style="badgeCustomStyle" />
                      </view>
                    </template>
                  </uni-list-chat>
                </view>

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
                  </uni-list-chat>
                </view>

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
                    <template v-slot:default>
                      <view :style="{ fontSize: '12px', color: '#999' }">
                        {{ itb.updateTime }}
                      </view>
                      <view>
                        <uni-badge :text="itb.winText" :custom-style="badgeCustomStyle" />
                      </view>
                    </template>
                  </uni-list-chat>
                </view>

                <view v-if="item.winFlag === 'Y'">
                  <uni-list-chat
                    v-for="itb in item.winningList"
                    :key="itb.numKey"
                    avatar="https://vip.fx67ll.com/vip-api/getRandomAvatar?isNeedMoreMosaic=N"
                    :title="itb.title"
                    :note="itb.winningNumber"
                  >
                    <template v-slot:default>
                      <view :style="{ fontSize: '12px', color: '#999' }">
                        {{ itb.updateTime }}
                      </view>
                      <view>
                        <uni-badge
                          :text="itb.winText"
                          :custom-style="badgeCustomStyleWin"
                        />
                      </view>
                    </template>
                  </uni-list-chat>
                </view>
              </uni-list>
            </uni-section>
          </uni-swipe-action-item>
        </view>
      </uni-swipe-action>
    </z-paging-mini>
  </view>
</template>

<script>
import { getLogList, delLog } from "@/api/lottery/log";
import { diffTimeStrFromNow } from "@/utils/index";
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
      badgeCustomStyleWin: {
        backgroundColor: "#ffa940",
        zoom: 1.2,
        position: "relative",
        left: "14rpx",
        top: "4rpx",
        padding: "0 14rpx",
      },
      leftActionOptions: [
        {
          text: "拷贝至剪切板",
          style: {
            backgroundColor: "#ffa940",
          },
        },
      ],
      rightActionOptions: [
        {
          text: "取消",
          style: {
            backgroundColor: "#4096ff",
          },
        },
        {
          text: "修改",
          style: {
            backgroundColor: "#2ecc71",
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
    // 请勿直接调用queryLogList方法！不过貌似z-paging的reload的方法初始化也不需要调用
    // this.queryLogList();
    // this.$refs.paging.reload();
  },
  methods: {
    // 获取log数据
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
              // 将请求的结果数组传递给z-paging
              self.$refs.paging.complete(self.formatLogList(res.rows));
            } else {
              // uni.showToast({
              //   title: "暂无更多数据！",
              //   icon: "none",
              //   duration: 1998,
              // });
              self.$refs.paging.complete([]);
            }
          } else {
            uni.showToast({
              title: "查询历史号码记录失败！",
              icon: "none",
              duration: 1998,
            });
            self.$refs.paging.complete(false);
          }
        })
        .catch((res) => {
          // 如果请求失败写this.$refs.paging.complete(false);
          // 注意，每次都需要在catch中写这句话很麻烦，z-paging提供了方案可以全局统一处理
          // 在底层的网络请求抛出异常时，写uni.$emit('z-paging-error-emit');即可
          self.$refs.paging.complete(false);
        });
    },
    // 整理log数据适配显示
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
          winningList: [],
          weekType: item?.weekType,
        };
        const cl = item?.chaseNumber?.split("/") || [];
        const rl = item?.recordNumber?.split("/") || [];
        const wl = item?.winningNumber?.split("/") || [];
        if (cl.length > 0) {
          cl.forEach((ita) => {
            tmpObj.chaseList.push({
              numKey: new Date().getTime() + self.getRandomIndex(),
              title: "固定追号",
              updateTime: self.subStrUpdateTime(item?.createTime) || "暂无数据",
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
              updateTime: self.subStrUpdateTime(item?.updateTime) || "暂无数据",
              recordNumber: itb || "暂无数据",
              imgRandom: self.getImgRandomByWeekType(item?.weekType),
              winText: self.getWinText(winFlag, item?.winningPrice),
            });
          });
        }
        if (wl.length > 0) {
          wl.forEach((itc) => {
            tmpObj.winningList.push({
              numKey: new Date().getTime() + self.getRandomIndex(),
              title: "当日开奖号码",
              updateTime: "☆(￣▽￣)/$:*",
              winningNumber: itc || "暂无数据",
              imgRandom: self.getImgRandomByWeekType(item?.weekType),
              winText: "恭喜今日中奖",
            });
          });
        }
        listResult.push({ ...tmpObj });
      });
      return listResult;
    },
    // 根据当前星期几来获取标题
    getTitleByWeekType(type) {
      if (["1", "3", "6"].includes(type?.toString())) {
        return "随机大乐透";
      } else if (["2", "4", "7"].includes(type?.toString())) {
        return "随机双色球";
      } else {
        return "异常数据";
      }
    },
    // 截取更新时间
    subStrUpdateTime(time) {
      if (time && time.length === 19) {
        return time.substring(2, 16);
      } else {
        return null;
      }
    },
    // 根据当前星期几来获取随机马赛克图片
    getImgRandomByWeekType(type) {
      if (["1", "3", "6"].includes(type?.toString())) {
        return 6;
      } else if (["2", "4", "7"].includes(type?.toString())) {
        return 7;
      } else {
        return 5;
      }
    },
    // 格式化是否中奖信息
    getWinText(flag, price) {
      if (flag === "Y" && parseInt(price) > 0) {
        return `中奖${price}元`;
      } else {
        return "未中奖";
      }
    },
    // 获取1-1023范围的随机整数
    getRandomIndex() {
      return Math.floor(Math.random() * 1023) + 1;
    },
    // 删除log接口调用
    deleteLog(id) {
      const self = this;
      delLog(id).then((res) => {
        if (res?.code === 200) {
          // self.queryLogList();
          self.$refs.paging.reload();
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
    // 删除log强制提示
    checkDelLog(logDelItem) {
      const self = this;
      showConfirm(
        `删除后数据无法恢复，请确认是否删除创建时间为：${logDelItem?.createTime} 的历史号码记录？`,
        "警告"
      ).then((res) => {
        if (res?.confirm && logDelItem?.logId) {
          if (diffTimeStrFromNow(logDelItem?.createTime) <= -24) {
            uni.showToast({
              title: "记录创建时间已超过24小时，不允许删除操作！",
              icon: "none",
              duration: 1998,
            });
          } else {
            self.deleteLog(logDelItem.logId);
          }
        }
      });
    },
    // 格式化需要拷贝到剪切板的文字数据
    formatCopyContent(copyDataList, listKey) {
      const txtResList = [];
      copyDataList.forEach((itemA) => {
        let txtRes = "";
        if (itemA[listKey]) {
          const tmpListAlpha = itemA[listKey].split("-");
          if (tmpListAlpha && tmpListAlpha.length > 0) {
            tmpListAlpha.forEach((itemB, indexB) => {
              const tmpListBeta = itemB.split(",");
              if (indexB === 0) {
                tmpListBeta.forEach((itemC, indexC) => {
                  if (indexC !== tmpListBeta.length - 1) {
                    txtRes = txtRes.concat(`${itemC}  `);
                  } else {
                    txtRes = txtRes.concat(`${itemC} - `);
                  }
                });
              }
              if (indexB === 1) {
                tmpListBeta.forEach((itemD, indexD) => {
                  if (indexD !== tmpListBeta.length - 1) {
                    txtRes = txtRes.concat(`${itemD}  `);
                  } else {
                    txtRes = txtRes.concat(`${itemD}`);
                  }
                });
              }
            });
            txtResList.push(txtRes);
          }
        } else {
          console.error("待处理的数组key不存在！");
        }
      });
      return txtResList;
    },
    // 拼接处理需要返回的字符串
    concatTxtList(txtList) {
      let concatResTxt = "";
      txtList.forEach((item, index) => {
        if (index !== txtList.length - 1) {
          // #ifdef H5
          concatResTxt = concatResTxt.concat(` ${item} `, "\n");
          // #endif
          // #ifdef MP-WEIXIN
          concatResTxt = concatResTxt.concat(` ${item} `, "\r\n", "\r\n");
          // #endif
        } else {
          concatResTxt = concatResTxt.concat(` ${item} `);
        }
      });
      return concatResTxt;
    },
    // 拷贝至剪切板
    copyLuckyNumber(logCopyItem) {
      const self = this;

      // 接受log参数
      const tdWeek = logCopyItem?.weekType.toString();
      const chList = logCopyItem?.chaseList;
      const reList = logCopyItem?.recordList;
      const luckyCount = chList.length + reList.length;

      // 处理追号和买的号
      let copyContentList = [];
      if (chList && chList.length > 0) {
        copyContentList = copyContentList.concat(
          this.formatCopyContent(chList, "chaseNumber")
        );
      }
      if (reList && reList.length > 0) {
        copyContentList = copyContentList.concat(
          this.formatCopyContent(reList, "recordNumber")
        );
      }
      const copyContentBody = this.concatTxtList(copyContentList);

      // 拼接标题和主体
      let copyContentTxt = "";
      if (tdWeek === "1" || tdWeek === "3" || tdWeek === "6") {
        // #ifdef H5
        const copyContentTitleH5 = " 老板买" + luckyCount + "注自选号码大乐透 \n";
        copyContentTxt = copyContentTitleH5 + copyContentBody;
        // #endif
        // #ifdef MP-WEIXIN
        const copyContentTitleWX = " 老板买" + luckyCount + "注自选号码大乐透 \r\n \r\n";
        copyContentTxt = copyContentTitleWX + copyContentBody;
        // #endif
      }
      if (tdWeek === "2" || tdWeek === "4" || tdWeek === "7") {
        // #ifdef H5
        const copyContentTitleH5 = " 老板买" + luckyCount + "注自选号码双色球 \n";
        copyContentTxt = copyContentTitleH5 + copyContentBody;
        // #endif
        // #ifdef MP-WEIXIN
        const copyContentTitleWX = " 老板买" + luckyCount + "注自选号码双色球 \r\n \r\n";
        copyContentTxt = copyContentTitleWX + copyContentBody;
        // #endif
      }

      // 处理剪切板函数
      uni.setClipboardData({
        data: copyContentTxt,
        showToast: false, // 仅支持 App (3.2.13+)、H5 (3.2.13+)
        success: function (res) {
          console.log("uni.setClipboardData - success: " + JSON.stringify(res));
          // #ifdef H5
          // 微信不支持关闭复制成功提示所以暂时只支持H5
          self.isNeedCloseDrawer("已为您成功复制到剪切板");
          // #endif
        },
        fail: function (err) {
          uni.showToast({
            title: "卧槽复制失败了！请联系管理员处理! ",
            icon: "none",
            duration: 1998,
          });
          console.error("uni.setClipboardData - fail: " + JSON.stringify(err));
        },
      });
    },
    // 修改号码历史记录详情
    editLogInfo(logId) {
      this.$tab.navigateTo(`/pages/lottery/log/edit?lotteryId=${logId}`);
    },
    // 侧滑组件事件处理
    handleActionClick(e, record) {
      if (e?.position === "right" && e?.index === 2) {
        this.checkDelLog(record);
      }
      if (e?.position === "right" && e?.index === 1) {
        this.editLogInfo(record?.logId);
      }
      if (e?.position === "left" && e?.index === 0) {
        this.copyLuckyNumber(record);
      }
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
