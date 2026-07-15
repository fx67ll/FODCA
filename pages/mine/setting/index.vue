<template>
  <view class="setting-container" :style="{ height: `${windowHeight}px` }">
    <view class="menu-list">
      <view class="list-cell list-cell-arrow" @click="handleToServerStatus">
        <view class="menu-item-box">
          <view class="iconfont icon-code menu-icon"></view>
          <view>系统状态</view>
        </view>
      </view>
      <view class="list-cell list-cell-arrow" @click="handleToNotice">
        <view class="menu-item-box">
          <view class="iconfont icon-service menu-icon"></view>
          <view>通知公告</view>
        </view>
      </view>
      <view class="list-cell list-cell-arrow" v-if="userName && userName !== 'user'" @click="handleToPwd">
        <view class="menu-item-box">
          <view class="iconfont icon-password menu-icon"></view>
          <view>修改密码</view>
        </view>
      </view>
      <view class="list-cell list-cell-arrow" @click="handleToUpgrade">
        <view class="menu-item-box">
          <view class="iconfont icon-refresh menu-icon"></view>
          <view>检查更新</view>
        </view>
      </view>
      <view class="list-cell list-cell-arrow" @click="handleCleanTmp">
        <view class="menu-item-box">
          <view class="iconfont icon-clean menu-icon"></view>
          <view>清理缓存</view>
        </view>
      </view>
    </view>
    <view class="cu-list menu">
      <view class="cu-item item-box">
        <view class="content text-center" @click="handleLogout">
          <text class="text-black">退出登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { openAdaptiveWindow } from "@/utils/browser.js";

export default {
  data() {
    return {
      // 当前登录用户信息
      userName: this.$store.state.user.name,
      windowHeight: uni.getSystemInfoSync().windowHeight,
    };
  },
  methods: {
    handleToServerStatus() {
      openAdaptiveWindow("/pages/server/status/index", this.$tab.navigateTo);
    },
    handleToNotice() {
      this.$tab.navigateTo("/pages/notice/log/index/index");
    },
    handleToPwd() {
      this.$tab.navigateTo("/pages/mine/pwd/index");
    },
    handleToUpgrade() {
      this.$modal.showToast("检查更新功能模块建设中~");
    },
    handleCleanTmp() {
      this.$modal.showToast("清理缓存功能模块建设中~");
    },
    handleLogout() {
      this.$modal.confirm("确定注销并退出系统吗？").then(() => {
        this.$store.dispatch("LogOut").then(() => {
          this.$tab.reLaunch("/pages/index");
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f8f8f8;
}

.item-box {
  background-color: #ffffff;
  margin: 30rpx;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10rpx;
  border-radius: 8rpx;
  color: #303133;
  font-size: 32rpx;
}
</style>
