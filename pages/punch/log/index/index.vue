<template>
  <view class="fx67ll-extra-box">
    <z-paging-mini
      ref="paging"
      back-to-top-bottom="30rpx"
      :auto-show-back-to-top="true"
      v-model="punchList"
      @query="queryPunchList"
    >
      <uni-swipe-action>
        <view class="fx67ll-extra-item" v-for="item in punchList" :key="item.punchId">
          <uni-swipe-action-item
            :right-options="actionOptions"
            @click="(e) => handleActionClick(e, item)"
          >
            <uni-section :title="item.updateTime.substring(0, 10)" type="line">
              <uni-list :border="true">
                <uni-list-chat
                  :avatar="
                    'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=' + 6
                  "
                  :title="item.updateTime"
                  :note="item.punchRemark || '暂无打卡备注'"
                >
                  <template v-slot:default>
                    <view>
                      <text
                        :class="{
                          'fx67ll-extra-badge': true,
                          'fx67ll-extra-badge-success': item.punchType === '1',
                          'fx67ll-extra-badge-fail': item.punchType === '2',
                          'fx67ll-extra-badge-normal':
                            !item.punchType || item.punchType === '3',
                        }"
                        >{{
                          item.punchType === "1"
                            ? "上班打卡"
                            : item.punchType === "2"
                            ? "下班打卡"
                            : "异常记录，请联系管理员"
                        }}
                      </text>
                    </view>
                  </template>
                </uni-list-chat>
              </uni-list>
            </uni-section>
          </uni-swipe-action-item>
        </view>
      </uni-swipe-action>
    </z-paging-mini>
    <punchDrawer
      :isShowPunchDrawer="isShowEditDrawer"
      :isAdd="false"
      :punchInfo="editPunchInfo"
      @hideDrawer="setIsShowDrawer"
      @reloadPunchList="queryPunchList"
    />
  </view>
</template>

<script>
import punchDrawer from "@/pages/punch/component/punchDrawer.vue";

import { getPunchLogList, delPunchLog } from "@/api/punch/log";

import { diffTimeStrFromNow } from "@/utils/index";
import { showConfirm } from "@/utils/common";

import uniListChat from "@/uni_modules/uni-list/components/uni-list-chat/uni-list-chat.vue";

// import moment from "@/node_modules/moment";
// import "@/node_modules/moment/locale/zh-cn";

export default {
  components: { uniListChat, punchDrawer },
  data() {
    return {
      punchList: [],
      actionOptions: [
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
      // Drawer组件相关参数
      isShowEditDrawer: false,
      editPunchInfo: {},
    };
  },
  methods: {
    // formatDataByDate() {
    //   // 创建一个空对象来存储聚合后的数据
    //   const aggregatedData = {};
    //   // 遍历原始数据
    //   originalData.forEach((item) => {
    //     // 提取日期部分
    //     const date = item.updateTime.substring(0, 10);
    //     // 如果在聚合数据中不存在以该日期为键的对象，则创建一个空数组
    //     if (!aggregatedData[date]) {
    //       aggregatedData[date] = [];
    //     }
    //     // 将当前数据项添加到以该日期为键的数组中
    //     aggregatedData[date].push(item);
    //   });
    //   // 转换聚合数据对象为数组
    //   const result = Object.keys(aggregatedData).map((date) => ({
    //     date,
    //     data: aggregatedData[date],
    //   }));
    //   // 打印看下数据
    //   console.log(result);
    // },
    queryPunchList(pageNum, pageSize) {
      const self = this;

      // const beginDayIndex = pageNum * pageSize + 1;
      // const endDayIndex = (pageNum - 1) * pageSize - 1;
      // const beginUpdateTime = moment().subtract(beginDayIndex, "days").format("YYYY-MM-DD");
      // const endUpdateTime = moment()
      //   .subtract(endDayIndex, "days")
      //   .format("YYYY-MM-DD");

      const queryParams = {
        pageNum,
        pageSize,
        // beginUpdateTime,
        // endUpdateTime,
      };

      // console.log(
      //   pageNum,
      //   pageSize,
      //   beginDayIndex,
      //   endDayIndex,
      //   beginUpdateTime,
      //   endUpdateTime
      // );

      getPunchLogList(queryParams)
        .then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              self.$refs.paging.complete(res.rows);
            } else {
              self.$refs.paging.complete([]);
            }
          } else {
            uni.showToast({
              title: "查询历史打卡记录失败！",
              icon: "none",
              duration: 1998,
            });
            self.$refs.paging.complete(false);
          }
        })
        .catch((res) => {
          self.$refs.paging.complete(false);
        });
    },
    // 关闭修改打卡记录抽屉
    editPunchLogInfo(punchInfo) {
      this.editPunchInfo = { ...punchInfo };
      this.isShowEditDrawer = true;
    },
    // 关闭修改打卡记录抽屉
    setIsShowDrawer(val) {
      this.isShowEditDrawer = val;
    },
    deletePunch(punchId) {
      const self = this;
      delPunchLog(punchId).then((res) => {
        if (res?.code === 200) {
          // self.queryPunchList();
          self.$refs.paging.reload();
          uni.showToast({
            title: "历史打卡记录删除成功！",
            icon: "none",
            duration: 1998,
          });
        } else {
          uni.showToast({
            title: "历史打卡记录删除失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    handleActionClick(e, record) {
      const self = this;
      if (e?.index === 1) {
        this.editPunchLogInfo(record);
      }
      if (e?.index === 2) {
        showConfirm(
          `删除后数据无法恢复，请确认是否删除打卡时间为：${record?.updateTime} 的历史打卡记录？`,
          "警告"
        ).then((res) => {
          if (res?.confirm && record?.punchId) {
            if (diffTimeStrFromNow(record?.createTime) <= -48) {
              uni.showToast({
                title: "记录创建时间已超过48小时，不允许删除操作！有需要请联系管理员~",
                icon: "none",
                duration: 1998,
              });
            } else {
              self.deletePunch(record.punchId);
            }
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
