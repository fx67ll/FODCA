<template>
  <view class="content">
    <image class="logo" :src="randomAvatar" @click="getRandomAvatarDebounce"></image>
    <view class="text-area" @click="quickPunchNow">
      <text class="title">Powered & Designed By fx67ll</text>
    </view>
    <punchDrawer
      :isShowPunchDrawer="isShowAddDrawer"
      :isAdd="true"
      @hideDrawer="setIsShowDrawer"
    />
  </view>
</template>

<script>
import { getAvatar } from "@/api/system/user";

import _ from "@/node_modules/underscore";

import punchDrawer from "@/pages/punch/component/punchDrawer.vue";

export default {
  components: { punchDrawer },
  data() {
    return {
      userName: this.$store.state.user.name,
      randomAvatar: "https://test.fx67ll.com/fx67ll-img-collection/fx67ll.jpg",
      isShowAddDrawer: false,
    };
  },
  onLoad() {
    this.getRandomAvatarDebounce();
  },
  methods: {
    getRandomAvatarDebounce: _.debounce(function () {
      this.getRandomAvatar();
    }, 233),
    getRandomAvatar() {
      const self = this;
      getAvatar("fx67ll").then((res) => {
        if (res?.avatar) {
          self.randomAvatar = "data:image/gif;base64," + res.avatar;
        } else {
          self.randomAvatar = getApp().globalData.config.appInfo.logo;
        }
      });
    },
    setIsShowDrawer(val) {
      this.isShowAddDrawer = val;
    },
    quickPunchNow() {
      if (this.userName && ["fx67ll", "gnlll"].includes(this.userName)) {
        if (this.userName === "gnlll") {
          // gnlll 保留打卡弹窗打开逻辑
          this.isShowAddDrawer = true;
        } else if (this.userName === "fx67ll") {
          // fx67ll 超管：改为跳转日常通勤地图（打卡弹窗逻辑暂时隐藏，后续可能放开）
          this.openDailyCommute();
        }
      }
    },
    // 跳转日常通勤地图（外部链接，参考状态面板打开逻辑）
    openDailyCommute() {
      const url = "https://map.fx67ll.com/daily";
      // #ifdef H5
      try {
        const newTab = window.open(url, "_blank");
        if (!newTab) {
          // 拦截时降级：当前页打开
          window.location.href = url;
        }
      } catch (e) {
        uni.showToast({ title: "浏览器禁止打开新标签", icon: "none" });
      }
      // #endif
      // #ifndef H5
      this.$tab.navigateTo(`/pages/common/webview/index?title=日常通勤&url=${url}`);
      // #endif
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
  margin-top: 400rpx;
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
