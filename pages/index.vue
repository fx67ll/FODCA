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
        this.isShowAddDrawer = true;
      }
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
