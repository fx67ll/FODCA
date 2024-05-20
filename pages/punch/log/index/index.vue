<template>
  <view class="fx67ll-extra-box">
    <z-paging-mini
      ref="paging"
      back-to-top-bottom="30rpx"
      :auto-show-back-to-top="true"
      v-model="punchList"
      @query="queryPunchList"
    >
      <view slot="top">
        <v-tabs
          class="nav-tab-box nav-tab-box-four"
          v-model="tabCurrentIndex"
          v-if="isShowTabFilter"
          :isNeedHiddenBtn="true"
          :isShowTabNow="isShowTabFilter"
          :tabs="tabDataList"
          :scroll="false"
          :lineScale="0.3"
          @hideTab="handleTabHide"
          @change="handleTabChange"
        ></v-tabs>
      </view>
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
    <uni-fab
      ref="fab"
      :pattern="fabConfig.pattern"
      :content="fabConfig.content"
      :horizontal="fabConfig.horizontal"
      :vertical="fabConfig.vertical"
      :direction="fabConfig.direction"
      @trigger="handleFabTrigger"
    />
  </view>
</template>

<script>
import punchDrawer from "@/pages/punch/component/punchDrawer.vue";

import { getPunchLogList, delPunchLog } from "@/api/punch/log";

import { diffTimeStrFromNow } from "@/utils/index";
import { showConfirm } from "@/utils/common";

import uniListChat from "@/uni_modules/uni-list/components/uni-list-chat/uni-list-chat.vue";
import vTabs from "@/uni_modules/v-tabs/v-tabs.vue";

import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

export default {
  components: { uniListChat, punchDrawer, vTabs },
  data() {
    return {
      punchList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginUpdateTime: null,
        endUpdateTime: null,
      },
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
      // 二级功能入口配置
      fabConfig: {
        title: "uni-fab",
        directionStr: "垂直",
        horizontal: "left",
        vertical: "bottom",
        direction: "vertical",
        pattern: {
          icon: "gear",
          color: "#7A7E83",
          backgroundColor: "#ffffff",
          selectedColor: "#7A7E83",
          buttonColor: "#2ecc71",
          iconColor: "#ffffff",
        },
        is_color_type: false,
        content: [
          {
            iconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=44",
            selectedIconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=44",
            text: "缺卡统计",
            active: false,
          },
          {
            iconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=23",
            selectedIconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=23",
            text: "快速筛选",
            active: false,
          },
        ],
      },
      // 是否显示快速筛选
      isShowTabFilter: false,
      // 快速筛选当前激活索引
      tabCurrentIndex: 0,
      // 快速筛选类型
      tabDataList: ["全部", "本月", "本周", "上班卡", "下班卡"],
    };
  },
  onShow() {
    this.queryPunchList();
  },
  methods: {
    queryPunchList(pageNum, pageSize) {
      const self = this;

      if (!pageNum || !pageSize) {
        return;
      }

      // uni.showLoading({
      //   title: "查询数据中...",
      // });

      this.queryParams = { ...self.queryParams, pageNum, pageSize };

      getPunchLogList(self.queryParams)
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
      // .finally(() => {
      //   uni.hideLoading();
      // });
    },
    // 关闭修改打卡记录抽屉
    editPunchLogInfo(punchInfo) {
      this.editPunchInfo = { ...punchInfo };
      this.isShowEditDrawer = true;
    },
    // 关闭修改打卡记录抽屉
    setIsShowDrawer(val) {
      this.isShowEditDrawer = val;
      this.queryPunchList();
      this.$refs.paging.reload();
    },
    // 删除打卡记录
    deletePunch(punchId) {
      const self = this;
      delPunchLog(punchId).then((res) => {
        if (res?.code === 200) {
          self.queryPunchList();
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
    // 侧滑菜单事件
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
    // 二级菜单按钮点击
    handleFabTrigger(e) {
      if (e?.index === 0) {
        this.$tab.navigateTo("/pages/punch/log/statistics/statistics");
      }
      if (e?.index === 1) {
        this.isShowTabFilter = true;
      }
      this.$refs.fab.close();
    },
    // tab关闭
    handleTabHide(isHide) {
      this.isShowTabFilter = isHide;
      this.$refs.fab.close();
      this.resetSearchFilter();
    },
    // tab切换，快速筛选
    handleTabChange(index) {
      const formatStr = "yyyy-MM-DD";
      if (index === 0) {
        this.resetSearchFilter();
      }
      if (index === 1) {
        const startOfMonth = moment().startOf("month").format(formatStr);
        const endOfMonth = moment().endOf("month").format(formatStr);
        this.queryParams = {
          pageNum: 1,
          pageSize: 10,
          beginUpdateTime: startOfMonth,
          endUpdateTime: endOfMonth,
        };
      }
      if (index === 2) {
        const startOfWeek = moment().startOf("week").format(formatStr);
        const endOfWeek = moment().endOf("week").format(formatStr);
        this.queryParams = {
          pageNum: 1,
          pageSize: 10,
          beginUpdateTime: startOfWeek,
          endUpdateTime: endOfWeek,
        };
      }
      if (index === 3) {
        this.queryParams = {
          pageNum: 1,
          pageSize: 10,
          punchType: "1",
        };
      }
      if (index === 4) {
        this.queryParams = {
          pageNum: 1,
          pageSize: 10,
          punchType: "2",
        };
      }
      if (index !== 0) {
        this.queryPunchList();
        this.$refs.paging.reload();
      }
    },
    resetSearchFilter() {
      this.tabCurrentIndex = 0;
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        beginUpdateTime: null,
        endUpdateTime: null,
      };
      this.queryPunchList();
      this.$refs.paging.reload();
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
