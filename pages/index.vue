<template>
  <view class="content">
    <image class="logo" :src="randomAvatar" @click="getRandomAvatar"></image>
    <view class="text-area">
      <text class="title">Powered & Designed By fx67ll</text>
    </view>
  </view>
</template>

<script>
import { getAvatar } from "@/api/system/user";
export default {
  data() {
    return {
      randomAvatar: getApp().globalData.config.appInfo.logo,
    };
  },
  onLoad() {
    this.getRandomAvatar();
  },
  methods: {
    getRandomAvatar() {
      getAvatar("fx67ll").then((res) => {
        if (res?.avatar) {
          this.randomAvatar = "data:image/gif;base64," + res.avatar;
        }
      });
    },
  },
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
