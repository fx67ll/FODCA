<template>
  <view class="fx67ll-note-box">
    <z-paging-mini ref="paging" back-to-top-bottom="166rpx" :auto-show-back-to-top="true" v-model="noteList"
      @query="queryNoteList">
      <view slot="top">
        <v-tabs class="nav-tab-box nav-tab-box-four" v-model="tabCurrentIndex" v-if="isShowTabFilter"
          :isNeedHiddenBtn="true" :isShowTabNow="isShowTabFilter" :tabs="tabDataList" :scroll="false" :lineScale="0.3"
          @hideTab="handleTabHide" @change="handleTabChange"></v-tabs>
      </view>
      <uni-swipe-action>
        <view class="fx67ll-note-item" v-for="item in noteList" :key="item.noteId">
          <uni-swipe-action-item :left-options="leftActionOptions" :right-options="rightActionOptions"
            @click="(e) => handleActionClick(e, item)">
            <uni-section :title="item.updateTime || item.createTime" type="line">
              <uni-list :border="true">
                <uni-list-item ellipsis="3" :title="item.noteContent" />
              </uni-list>
            </uni-section>
          </uni-swipe-action-item>
        </view>
      </uni-swipe-action>
    </z-paging-mini>
    <noteDrawer :isShowNoteDrawer="isShowViewDrawer" :isAdd="false" :isView="true" :noteInfo="viewNoteInfo"
      @hideDrawer="setIsShowDrawer" @reloadNoteList="queryNoteList" />
    <noteDrawer :isShowNoteDrawer="isShowEditDrawer" :isAdd="false" :isView="false" :noteInfo="editNoteInfo"
      @hideDrawer="setIsShowDrawer" @reloadNoteList="queryNoteList" />
    <noteDrawer ref="addNoteDrawer" :isShowNoteDrawer="isShowAddDrawer" :isAdd="true" :isView="false"
      @hideDrawer="setIsShowDrawer" />
    <uni-fab ref="fab" v-if="!isShowAddDrawer && !isShowEditDrawer&& !isShowViewDrawer" :pattern="fabConfig.pattern"
      :content="fabConfig.content" :horizontal="fabConfig.horizontal" :vertical="fabConfig.vertical"
      :direction="fabConfig.direction" @trigger="handleFabTrigger" />
  </view>
</template>

<script>
import noteDrawer from "@/pages/note/component/noteDrawer.vue";

import { listNoteLog, delNoteLog } from "@/api/note/log";

import { diffTimeStrFromNow } from "@/utils/index";
import { showConfirm } from "@/utils/common";

import uniListChat from "@/uni_modules/uni-list/components/uni-list-chat/uni-list-chat.vue";
import vTabs from "@/uni_modules/v-tabs/v-tabs.vue";

import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

export default {
  components: { uniListChat, noteDrawer, vTabs },
  data() {
    return {
      userName: this.$store.state.user.name,
      noteList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginUpdateTime: null,
        endUpdateTime: null,
        createBy: this.$store.state.user.name,
      },
      leftActionOptions: [
        {
          text: "预览富文本信息",
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
      // Drawer组件相关参数
      isShowAddDrawer: false,
      isShowEditDrawer: false,
      isShowViewDrawer: false,
      editNoteInfo: {},
      viewNoteInfo: {},
      // 二级功能入口配置
      fabConfig: {
        title: "uni-fab",
        directionStr: "垂直",
        horizontal: "right",
        vertical: "bottom",
        direction: "horizontal",
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
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=23",
            selectedIconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=23",
            text: "快速筛选",
            active: false,
          },
          {
            iconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=18",
            selectedIconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=18",
            text: "新增备忘",
            active: false,
          },
        ],
      },
      // 是否显示快速筛选
      isShowTabFilter: false,
      // 快速筛选当前激活索引
      tabCurrentIndex: 0,
      // 快速筛选类型
      tabDataList: ["全部", "本月", "本周"],
    };
  },
  onShow() {
    this.queryNoteList();
  },
  methods: {
    queryNoteList(pageNum, pageSize) {
      const self = this;

      if (!pageNum || !pageSize) {
        return;
      }

      // uni.showLoading({
      //   title: "查询数据中...",
      // });

      this.queryParams = {
        ...self.queryParams,
        pageNum,
        pageSize,
        createBy: self.userName,
      };

      listNoteLog(self.queryParams)
        .then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              self.$refs.paging.complete(res.rows);
            } else {
              self.$refs.paging.complete([]);
            }
          } else {
            uni.showToast({
              title: "查询历史备忘记录失败！",
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
    // 关闭修改备忘记录抽屉
    editNoteLogInfo(noteInfo) {
      this.editNoteInfo = { ...noteInfo };
      this.isShowEditDrawer = true;
    },
    // 关闭修改备忘记录抽屉
    viewNoteLogInfo(noteInfo) {
      this.viewNoteInfo = { ...noteInfo };
      this.isShowViewDrawer = true;
    },
    // 关闭修改备忘记录抽屉
    setIsShowDrawer(val) {
      // 关闭弹窗
      this.isShowAddDrawer = val;
      this.isShowEditDrawer = val;
      this.isShowViewDrawer = val;
      // 重置富文本编辑器内容
      this.$refs.addNoteDrawer.clearEditorContent();
      // 重新加载列表
      this.queryNoteList();
      this.$refs.paging.reload();
    },
    // 删除备忘记录
    deleteNote(noteId) {
      const self = this;
      delNoteLog(noteId).then((res) => {
        if (res?.code === 200) {
          self.queryNoteList();
          self.$refs.paging.reload();
          uni.showToast({
            title: "历史备忘记录删除成功！",
            icon: "none",
            duration: 1998,
          });
        } else {
          uni.showToast({
            title: "历史备忘记录删除失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    // 侧滑菜单事件
    handleActionClick(e, record) {
      const self = this;
      if (e?.position === "right" && e?.index === 1) {
        this.isView = false;
        this.editNoteLogInfo(record);
      }
      if (e?.position === "right" && e?.index === 2) {
        showConfirm(
          `删除后数据无法恢复，请确认是否删除备忘记录时间为：${record?.updateTime || record?.createTime} 的历史备忘记录？`,
          "警告"
        ).then((res) => {
          if (res?.confirm && record?.noteId) {
            if (diffTimeStrFromNow(record?.createTime) <= -48) {
              uni.showToast({
                title: "记录创建时间已超过48小时，不允许删除操作！有需要请联系管理员~",
                icon: "none",
                duration: 1998,
              });
            } else {
              self.deleteNote(record.noteId);
            }
          }
        });
      }
      if (e?.position === "left" && e?.index === 0) {
        this.isView = true;
        this.viewNoteLogInfo(record);
      }
    },
    // 二级菜单按钮点击
    handleFabTrigger(e) {
      if (e?.index === 0) {
        this.isShowTabFilter = true;
      }
      if (e?.index === 1) {
        this.isView = false;
        this.isShowAddDrawer = true;
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
          createBy: this.userName,
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
          createBy: this.userName,
        };
      }
      if (index !== 0) {
        this.queryNoteList();
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
        createBy: this.userName,
      };
      this.queryNoteList();
      this.$refs.paging.reload();
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
