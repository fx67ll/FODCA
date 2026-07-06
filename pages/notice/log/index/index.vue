<template>
  <view class="fx67ll-notice-box">
    <z-paging-mini ref="paging" back-to-top-bottom="166rpx" :auto-show-back-to-top="true" v-model="noticeList"
      @query="queryNoticeList">
      <!-- 筛选栏：点快速筛选后显示，初始化隐藏 -->
      <!-- 外层 slot 容器始终保留，保证 z-paging 顶部布局稳定；内层用 v-if 控制显隐 -->
      <view slot="top">
        <view class="filter-bar" v-if="isShowFilter">
          <view class="filter-search" @click="openTitleSearch">
            <uni-icons type="search" size="28rpx" color="#909399"></uni-icons>
            <text class="filter-search-text">{{ queryParams.noticeTitle || '搜索公告标题' }}</text>
          </view>
          <view class="filter-item">
            <picker mode="selector" :range="typeFilterOptions" range-key="text" :value="typeFilterIndex"
              @change="handleTypeFilterChange">
              <view class="filter-picker">
                <text class="filter-picker-text">{{ currentTypeFilterText }}</text>
                <uni-icons type="bottom" size="24rpx" color="#909399"></uni-icons>
              </view>
            </picker>
          </view>
          <view class="filter-reset" @click="handleReset">
            <text class="reset-icon">↻</text>
            <text class="reset-text">重置</text>
          </view>
          <view class="filter-close" @click="handleCloseFilter">
            <!-- <uni-icons type="close" size="32rpx" color="#909399"></uni-icons> -->
            <uni-icons type="close" size="32rpx" color="#ff4d4f"></uni-icons>
          </view>
        </view>
      </view>
      <view class="notice-list" v-if="noticeList.length > 0">
        <uni-swipe-action>
          <view class="notice-item-wrap" v-for="item in noticeList" :key="item.noticeId">
            <uni-swipe-action-item :right-options="isAdmin ? adminActionOptions : []"
              @click="(e) => handleActionClick(e, item)">
              <view class="notice-item" @click="openNoticeDetail(item)">
                <view class="notice-item-header">
                  <view class="notice-type-tag" :class="'type-' + item.noticeType">{{ typeText(item.noticeType) }}
                  </view>
                  <view class="notice-item-title">{{ item.noticeTitle }}</view>
                  <view v-if="isAdmin" class="notice-status-tag" :class="'status-' + item.status">{{
                    statusText(item.status) }}</view>
                </view>
                <view class="notice-item-content">{{ stripContent(item.noticeContent) }}</view>
                <view class="notice-item-footer">
                  <view class="notice-item-author">发布者：{{ item.createBy || '系统' }}</view>
                  <view class="notice-item-time">{{ formatTime(item.createTime) }}</view>
                </view>
              </view>
            </uni-swipe-action-item>
          </view>
        </uni-swipe-action>
      </view>
    </z-paging-mini>

    <!-- 管理员悬浮按钮：弹出快速筛选 + 新增记录 -->
    <uni-fab v-if="isAdmin" ref="fab" :pattern="fabConfig.pattern" :content="fabConfig.content"
      :horizontal="fabConfig.horizontal" :vertical="fabConfig.vertical" :direction="fabConfig.direction"
      @trigger="handleFabTrigger"></uni-fab>

    <!-- 公告详情弹窗 -->
    <view class="notice-detail-mask" v-show="showDetail" @click="closeDetail"></view>
    <view class="notice-detail-popup" :class="{ show: showDetail }">
      <view class="popup-drag-bar"></view>
      <view class="popup-header">
        <text class="popup-title">公告详情</text>
        <view class="popup-close" @click="closeDetail">
          <uni-icons type="close" size="40rpx" color="#909399"></uni-icons>
        </view>
      </view>
      <view class="popup-content">
        <view v-if="!isLoading" class="notice-detail">
          <!-- 标题区 -->
          <view class="notice-detail-title-wrap">
            <view class="notice-type-tag" :class="'type-' + detailData.noticeType">{{ typeText(detailData.noticeType) }}
            </view>
            <text class="notice-detail-title">{{ detailData.noticeTitle }}</text>
          </view>
          <!-- 信息区：纵向列表 -->
          <view class="notice-detail-info">
            <view class="info-row">
              <text class="info-label">发布者</text>
              <text class="info-value">{{ detailData.createBy || '系统' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">发布时间</text>
              <text class="info-value">{{ formatTime(detailData.createTime) }}</text>
            </view>
            <view class="info-row" v-if="isAdmin">
              <text class="info-label">状态</text>
              <text class="info-value" :class="'status-text-' + detailData.status">{{ statusText(detailData.status)
                }}</text>
            </view>
          </view>
          <!-- 正文 -->
          <view class="notice-detail-body">
            <rich-text :nodes="detailData.noticeContent || ''" class="notice-detail-content"></rich-text>
          </view>
        </view>
        <view v-else class="loading-text">
          <uni-icons type="spinner-cycle" size="40rpx" color="#2ecc71"></uni-icons>
          <text class="loading-msg">{{ loadingText }}</text>
        </view>
      </view>
      <!-- 管理员操作按钮 -->
      <view v-if="isAdmin && !isLoading" class="popup-footer">
        <view class="popup-btn popup-btn-edit" @click.stop="handleEdit">
          <uni-icons type="compose" size="32rpx" color="#2ecc71"></uni-icons>
          <text>编辑</text>
        </view>
        <view class="popup-btn popup-btn-delete" @click.stop="handleDelete">
          <uni-icons type="trash" size="32rpx" color="#ff4d4f"></uni-icons>
          <text>删除</text>
        </view>
      </view>
    </view>

    <!-- 公告标题搜索弹窗 -->
    <view class="title-search-mask" v-show="showTitleSearch" @click="closeTitleSearch"></view>
    <view class="title-search-popup" :class="{ show: showTitleSearch }">
      <view class="title-search-header">
        <text class="title-search-title">搜索公告标题</text>
        <view class="title-search-close" @click="closeTitleSearch">
          <uni-icons type="close" size="36rpx" color="#909399"></uni-icons>
        </view>
      </view>
      <view class="title-search-body">
        <view class="title-search-input-wrap">
          <input v-if="showTitleSearch" class="title-search-input" v-model="titleSearchInput" type="text"
            placeholder="请输入公告标题" :maxlength="50" confirm-type="search" @confirm="confirmTitleSearch" />
          <view v-if="titleSearchInput" class="title-search-input-clear" @click="clearTitleInput">
            <uni-icons type="clear" size="32rpx" color="#c0c4cc"></uni-icons>
          </view>
        </view>
      </view>
      <view class="title-search-footer">
        <view class="title-search-btn title-search-btn-close" @click="closeTitleSearch">关闭</view>
        <view class="title-search-btn title-search-btn-confirm" @click="confirmTitleSearch">搜索</view>
      </view>
    </view>
  </view>
</template>

<script>
import { listNoticeLog, getNoticeLog, listNoticeLogForApp, delNoticeLogForApp } from '@/api/fx67ll/notice/log';
import { showConfirm } from '@/utils/common';

export default {
  data() {
    return {
      noticeList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: undefined,
        noticeType: undefined,
      },
      // 当前登录用户
      userName: this.$store.state.user.name,
      // 公告类型字典（与后端 sys_notice_type 对应：1通知 2公告）
      typeDict: [
        { value: '1', label: '通知' },
        { value: '2', label: '公告' },
      ],
      // 公告状态字典（0正常/上架 1停用/下架）
      statusDict: [
        { value: '0', label: '正常' },
        { value: '1', label: '停用' },
      ],
      // 筛选：类型（'' 表示全部）
      typeFilter: '',
      typeFilterOptions: [
        { value: '', text: '全部类型' },
        { value: '1', text: '通知' },
        { value: '2', text: '公告' },
      ],
      // 公告标题搜索弹窗
      showTitleSearch: false,
      titleSearchInput: '',
      // 是否显示筛选区域（初始化隐藏，点快速筛选后显示）
      isShowFilter: false,
      // 侧滑菜单：右侧取消/修改/删除（仅管理员），文案与颜色与备忘录一致
      adminActionOptions: [
        { text: '取消', style: { backgroundColor: '#4096ff' } },
        { text: '修改', style: { backgroundColor: '#2ecc71' } },
        { text: '删除', style: { backgroundColor: '#ff4d4f' } },
      ],
      // FAB 配置
      fabConfig: {
        horizontal: 'right',
        vertical: 'bottom',
        direction: 'horizontal',
        pattern: {
          icon: 'color',
          color: '#7A7E83',
          backgroundColor: '#ffffff',
          selectedColor: '#7A7E83',
          buttonColor: '#2ecc71',
          iconColor: '#ffffff',
        },
        content: [
          {
            iconPath: 'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=23',
            selectedIconPath: 'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=23',
            text: '快速筛选',
            active: false,
          },
          {
            iconPath: 'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=18',
            selectedIconPath: 'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=18',
            text: '新增记录',
            active: false,
          },
        ],
      },
      // 详情弹窗
      showDetail: false,
      isLoading: false,
      loadingText: '加载中...',
      detailTimeout: null,
      detailData: {},
    };
  },
  computed: {
    // 是否为超级管理员 fx67ll
    isAdmin() {
      return this.userName && this.userName === 'fx67ll';
    },
    // 类型筛选当前选中项在选项数组中的索引
    typeFilterIndex() {
      const idx = this.typeFilterOptions.findIndex((d) => d.value === this.typeFilter);
      return idx > -1 ? idx : 0;
    },
    // 类型筛选当前展示文字
    currentTypeFilterText() {
      const cur = this.typeFilterOptions.find((d) => d.value === this.typeFilter);
      return cur ? cur.text : '全部类型';
    },
  },
  onShow() {
    this.queryNoticeList();
  },
  methods: {
    // 查询公告列表（管理员看所有状态，普通用户仅看已上架）
    queryNoticeList(pageNum, pageSize) {
      const self = this;
      if (!pageNum || !pageSize) {
        return;
      }
      this.queryParams = {
        ...self.queryParams,
        pageNum,
        pageSize,
      };
      const requestFn = self.isAdmin ? listNoticeLogForApp : listNoticeLog;
      requestFn(self.queryParams)
        .then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows.length > 0) {
              self.$refs.paging.complete(res.rows);
            } else {
              self.$refs.paging.complete([]);
            }
          } else {
            uni.showToast({ title: '查询公告失败！', icon: 'none', duration: 1998 });
            self.$refs.paging.complete(false);
          }
        })
        .catch(() => {
          self.$refs.paging.complete(false);
        });
    },
    // 类型筛选变化（picker 弹出选择）
    handleTypeFilterChange(e) {
      const idx = e?.detail?.value;
      const picked = this.typeFilterOptions[idx];
      this.typeFilter = picked ? picked.value : '';
      this.queryParams.noticeType = this.typeFilter || undefined;
      this.refreshList();
    },
    // 打开公告标题搜索弹窗，回填当前关键词
    openTitleSearch() {
      this.titleSearchInput = this.queryParams.noticeTitle || '';
      this.showTitleSearch = true;
    },
    // 关闭公告标题搜索弹窗
    closeTitleSearch() {
      this.showTitleSearch = false;
    },
    // 确认搜索公告标题
    confirmTitleSearch() {
      const keyword = (this.titleSearchInput || '').trim();
      this.queryParams.noticeTitle = keyword || undefined;
      this.showTitleSearch = false;
      this.refreshList();
    },
    // 清空输入框内容（不关闭弹窗、不清已生效的搜索条件）
    clearTitleInput() {
      this.titleSearchInput = '';
    },
    // 重置筛选
    handleReset() {
      this.typeFilter = '';
      this.titleSearchInput = '';
      this.queryParams.noticeType = undefined;
      this.queryParams.noticeTitle = undefined;
      this.refreshList();
    },
    // 关闭筛选区域：重置所有搜索条件并隐藏，回到全部数据
    handleCloseFilter() {
      this.isShowFilter = false;
      this.$refs.fab && this.$refs.fab.close();
      // 清空条件并刷新列表（复用重置逻辑）
      this.typeFilter = '';
      this.titleSearchInput = '';
      this.queryParams.noticeType = undefined;
      this.queryParams.noticeTitle = undefined;
      this.refreshList();
    },
    // 刷新列表
    refreshList() {
      this.queryNoticeList();
      this.$refs.paging.reload();
    },
    // FAB 二级菜单点击：0=快速筛选 1=新增记录
    handleFabTrigger(e) {
      if (e?.index === 0) {
        this.isShowFilter = true;
      }
      if (e?.index === 1) {
        this.$tab.navigateTo('/pages/notice/log/edit/edit?noticeId=');
      }
      this.$refs.fab && this.$refs.fab.close();
    },
    // 侧滑菜单点击：右侧0=取消(收起) 1=修改 2=删除
    handleActionClick(e, record) {
      if (e?.position === 'right' && e?.index === 1) {
        this.$tab.navigateTo('/pages/notice/log/edit/edit?noticeId=' + (record?.noticeId || ''));
      }
      if (e?.position === 'right' && e?.index === 2) {
        this.handleDeleteRecord(record);
      }
    },
    // 侧滑删除公告
    handleDeleteRecord(record) {
      const self = this;
      if (!record?.noticeId) return;
      showConfirm(
        `删除后数据无法恢复，请确认是否删除公告：${record?.noticeTitle}？`,
        '警告'
      ).then((res) => {
        if (res?.confirm && record?.noticeId) {
          delNoticeLogForApp(record.noticeId).then((res) => {
            if (res?.code === 200) {
              uni.showToast({ title: '删除成功！', icon: 'none', duration: 1998 });
              self.refreshList();
            } else {
              uni.showToast({ title: '删除失败，请联系管理员！', icon: 'none', duration: 1998 });
            }
          });
        }
      });
    },
    // 跳转编辑页
    handleEdit() {
      const noticeId = this.detailData?.noticeId || '';
      this.closeDetail();
      this.$tab.navigateTo('/pages/notice/log/edit/edit?noticeId=' + noticeId);
    },
    // 删除公告
    handleDelete() {
      const self = this;
      const record = { ...this.detailData };
      if (!record?.noticeId) return;
      // 先关闭详情弹窗，避免遮挡确认框
      this.closeDetail();
      setTimeout(() => {
        showConfirm(
          `删除后数据无法恢复，请确认是否删除公告：${record?.noticeTitle}？`,
          '警告'
        ).then((res) => {
          if (res?.confirm && record?.noticeId) {
            delNoticeLogForApp(record.noticeId).then((res) => {
              if (res?.code === 200) {
                uni.showToast({ title: '删除成功！', icon: 'none', duration: 1998 });
                self.refreshList();
              } else {
                uni.showToast({ title: '删除失败，请联系管理员！', icon: 'none', duration: 1998 });
              }
            });
          }
        });
      }, 50);
    },
    // 打开公告详情弹窗
    async openNoticeDetail(row) {
      if (this.isLoading) return;
      this.isLoading = true;
      this.loadingText = '加载中...';
      this.detailData = { ...row };
      this.showDetail = true;

      this.detailTimeout = setTimeout(() => {
        this.loadingText = '请求超时，请重试';
        this.isLoading = false;
      }, 10000);

      try {
        const res = await getNoticeLog(row.noticeId);
        if (res?.code === 200 && res?.data) {
          this.detailData = res.data;
        } else {
          this.loadingText = '加载失败，请重试';
          uni.showToast({ title: '获取详情失败', icon: 'none', duration: 2000 });
        }
      } catch (err) {
        console.error('获取公告详情失败：', err);
        this.loadingText = '加载失败，请重试';
        uni.showToast({ title: '获取详情失败', icon: 'none', duration: 2000 });
      } finally {
        if (this.detailTimeout) {
          clearTimeout(this.detailTimeout);
          this.detailTimeout = null;
        }
        this.isLoading = false;
      }
    },
    // 关闭详情弹窗
    closeDetail() {
      this.showDetail = false;
      if (this.detailTimeout) {
        clearTimeout(this.detailTimeout);
        this.detailTimeout = null;
      }
      setTimeout(() => {
        this.detailData = {};
        this.loadingText = '加载中...';
      }, 300);
    },
    // 类型文本
    typeText(noticeType) {
      const dict = this.typeDict.find((d) => d.value === noticeType);
      return dict ? dict.label : '公告';
    },
    // 状态文本
    statusText(status) {
      const dict = this.statusDict.find((d) => d.value === status);
      return dict ? dict.label : '';
    },
    // 列表预览内容：去标签 + 截断
    stripContent(html) {
      if (!html) return '暂无内容';
      const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      return text.length > 60 ? text.substring(0, 60) + '...' : text;
    },
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      return String(time).replace('T', ' ').substring(0, 16);
    },
  },
};
</script>

<style lang="less">
@import url('@/static/style/mixin.less');

.fx67ll-notice-box {
  min-height: 100vh;
  background-color: #f5f6f7;

  // 筛选栏：一行布局
  .filter-bar {
    display: flex;
    align-items: center;
    background-color: #ffffff;
    padding: 16rpx 24rpx;
    border-bottom: 1rpx solid #f0f2f5;

    // 公告标题搜索触发按钮
    .filter-search {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      height: 64rpx;
      padding: 0 20rpx;
      margin-right: 16rpx;
      border-radius: 8rpx;
      background-color: #f5f6f7;
      box-sizing: border-box;

      .filter-search-text {
        flex: 1;
        min-width: 0;
        margin-left: 10rpx;
        font-size: 26rpx;
        color: #909399;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &:active {
        background-color: #eef0f2;
      }
    }

    .filter-item {
      flex: 1;
      min-width: 0;
      margin-right: 16rpx;

      .filter-picker {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64rpx;
        padding: 0 20rpx;
        border-radius: 8rpx;
        background-color: #f5f6f7;
        box-sizing: border-box;

        .filter-picker-text {
          flex: 1;
          min-width: 0;
          font-size: 26rpx;
          color: #303133;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 8rpx;
        }
      }
    }

    .filter-reset {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 12rpx 20rpx;
      border-radius: 8rpx;
      background-color: #f5f6f7;

      .reset-icon {
        font-size: 28rpx;
        color: #2ecc71;
        margin-right: 6rpx;
      }

      .reset-text {
        font-size: 24rpx;
        color: #606266;
      }

      &:active {
        background-color: #eef0f2;
      }
    }

    .filter-close {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56rpx;
      height: 56rpx;
      margin-left: 12rpx;
      border-radius: 8rpx;
      background-color: #f5f6f7;

      &:active {
        background-color: #eef0f2;
      }
    }
  }

  .notice-list {
    padding: 30rpx;
  }

  .notice-item-wrap {
    margin-bottom: 30rpx;
    border-radius: 12rpx;
    overflow: hidden;
  }

  .notice-item {
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 20rpx rgba(46, 204, 113, 0.15);
    }

    .notice-item-header {
      display: flex;
      align-items: center;
      margin-bottom: 18rpx;
    }

    .notice-type-tag {
      flex-shrink: 0;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      color: #ffffff;
      margin-right: 18rpx;

      &.type-1 {
        background-color: #ff9900;
      }

      &.type-2 {
        background-color: #2ecc71;
      }
    }

    .notice-status-tag {
      flex-shrink: 0;
      padding: 2rpx 12rpx;
      border-radius: 16rpx;
      font-size: 20rpx;
      margin-left: auto;

      &.status-0 {
        color: #2ecc71;
        background-color: rgba(46, 204, 113, 0.12);
      }

      &.status-1 {
        color: #909399;
        background-color: rgba(144, 147, 153, 0.12);
      }
    }

    .notice-item-title {
      flex: 1;
      font-size: 30rpx;
      font-weight: 600;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notice-item-content {
      font-size: 26rpx;
      color: #606266;
      line-height: 1.7;
      margin-bottom: 20rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notice-item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 22rpx;
      color: #909399;
    }
  }
}

// 详情弹窗
.notice-detail-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.notice-detail-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f7f8f9;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  height: 85vh;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.notice-detail-popup.show {
  transform: translateY(0);
}

.popup-drag-bar {
  width: 80rpx;
  height: 8rpx;
  background-color: #dcdfe6;
  border-radius: 4rpx;
  margin: 20rpx auto 0;
  flex-shrink: 0;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  flex-shrink: 0;

  .popup-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1f2d3d;
  }

  .popup-close {
    padding: 8rpx;

    &:active {
      opacity: 0.6;
    }
  }
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 32rpx 32rpx;
  -webkit-overflow-scrolling: touch;
  position: relative;
  box-sizing: border-box;

  .loading-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;

    .loading-msg {
      margin-top: 16rpx;
      color: #909399;
      font-size: 26rpx;
    }
  }
}

.notice-detail {
  width: 100%;
}

// 标题区
.notice-detail-title-wrap {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .notice-type-tag {
    flex-shrink: 0;
    padding: 6rpx 18rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    color: #ffffff;
    margin-right: 20rpx;

    &.type-1 {
      background-color: #ff9900;
    }

    &.type-2 {
      background-color: #2ecc71;
    }
  }

  .notice-detail-title {
    flex: 1;
    font-size: 38rpx;
    font-weight: 600;
    color: #1f2d3d;
    line-height: 1.4;
  }
}

// 信息区：纵向列表
.notice-detail-info {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 8rpx 32rpx;
  margin-bottom: 24rpx;

  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f2f5;

    &:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 26rpx;
      color: #909399;
      flex-shrink: 0;
    }

    .info-value {
      font-size: 26rpx;
      color: #303133;
      font-weight: 500;
      text-align: right;
      margin-left: 24rpx;
      word-break: break-all;

      &.status-text-0 {
        color: #2ecc71;
      }

      &.status-text-1 {
        color: #909399;
      }
    }
  }
}

// 正文区
.notice-detail-body {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  // 防止内容（长串/图片）撑破容器宽度
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: break-word;
}

.notice-detail-content {
  font-size: 28rpx;
  color: #303133;
  line-height: 1.8;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;

  // rich-text 内的图片宽度自适应，避免横向溢出
  /deep/ img,
  /deep/ image {
    max-width: 100% !important;
    height: auto !important;
  }
}

// 管理员操作按钮
.popup-footer {
  display: flex;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f2f5;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.popup-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  padding: 20rpx 0;
  border-radius: 12rpx;

  text {
    margin-left: 8rpx;
  }

  &.popup-btn-edit {
    color: #2ecc71;
    background-color: rgba(46, 204, 113, 0.1);
    margin-right: 20rpx;

    &:active {
      background-color: rgba(46, 204, 113, 0.2);
    }
  }

  &.popup-btn-delete {
    color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.1);

    &:active {
      background-color: rgba(255, 77, 79, 0.2);
    }
  }
}

// 公告标题搜索弹窗
.title-search-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.title-search-popup {
  position: fixed;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  z-index: 1002;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease;

  &.show {
    opacity: 1;
    visibility: visible;
  }

  .title-search-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32rpx 24rpx 16rpx;

    .title-search-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #303133;
    }

    .title-search-close {
      position: absolute;
      right: 16rpx;
      top: 50%;
      transform: translateY(-50%);
      padding: 8rpx;

      &:active {
        opacity: 0.6;
      }
    }
  }

  .title-search-body {
    padding: 8rpx 32rpx 24rpx;

    .title-search-input-wrap {
      position: relative;
      width: 100%;
    }

    .title-search-input {
      width: 100%;
      height: 80rpx;
      padding: 0 64rpx 0 24rpx;
      font-size: 28rpx;
      color: #303133;
      background-color: #f5f6f7;
      border-radius: 12rpx;
      box-sizing: border-box;
    }

    .title-search-input-clear {
      position: absolute;
      right: 16rpx;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40rpx;
      height: 40rpx;

      &:active {
        opacity: 0.6;
      }
    }
  }

  .title-search-footer {
    display: flex;
    border-top: 1rpx solid #f0f2f5;

    .title-search-btn {
      flex: 1;
      text-align: center;
      font-size: 30rpx;
      padding: 24rpx 0;

      &:active {
        background-color: #f5f6f7;
      }
    }

    .title-search-btn-close {
      color: #909399;
      border-right: 1rpx solid #f0f2f5;
    }

    .title-search-btn-confirm {
      color: #2ecc71;
      font-weight: 600;
    }
  }
}
</style>
