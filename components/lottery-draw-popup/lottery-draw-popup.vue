<template>
  <view class="lottery-draw-popup-mask" v-if="isShow" @click="close">
    <view class="lottery-draw-popup-card" @click.stop>
      <view class="lottery-draw-popup-close" @click="close">
        <text class="lottery-draw-popup-close-icon">×</text>
      </view>

      <view class="lottery-draw-popup-title">{{ title }}</view>
      <view class="lottery-draw-popup-status" :class="{ 'is-win': isWin, 'is-running': isRunning }">
        {{ statusText }}
      </view>

      <view class="lottery-draw-popup-target" v-if="targetText">
        <text class="lottery-draw-popup-target-label">目标中奖号码：</text>
        <text class="lottery-draw-popup-target-number">{{ targetText }}</text>
      </view>

      <scroll-view scroll-y="true" class="lottery-draw-popup-content">
        <view v-if="logs && logs.length">
          <view class="lottery-draw-popup-log" v-for="(item, index) in logs" :key="index">
            <text class="lottery-draw-popup-log-index">{{ index + 1 }}</text>
            <text class="lottery-draw-popup-log-text">{{ item }}</text>
          </view>
        </view>
        <view class="lottery-draw-popup-empty" v-else>暂无模拟摇奖过程信息</view>
      </scroll-view>

      <view class="lottery-draw-popup-footer">
        <view class="lottery-draw-popup-btn" @click="close">关闭</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "LotteryDrawPopup",
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "模拟摇奖过程",
    },
    statusText: {
      type: String,
      default: "准备中",
    },
    targetText: {
      type: String,
      default: "",
    },
    logs: {
      type: Array,
      default: () => [],
    },
    isWin: {
      type: Boolean,
      default: false,
    },
    isRunning: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="less">
.lottery-draw-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.lottery-draw-popup-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 86%;
  max-width: 680rpx;
  height: 76vh;
  padding: 40rpx 32rpx 28rpx;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
}

.lottery-draw-popup-close {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lottery-draw-popup-close-icon {
  color: #a0a5ad;
  font-size: 44rpx;
  line-height: 1;
}

.lottery-draw-popup-title {
  padding-right: 48rpx;
  margin-bottom: 14rpx;
  color: #303133;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.4;
}

.lottery-draw-popup-status {
  margin-bottom: 18rpx;
  color: #909399;
  font-size: 26rpx;
  line-height: 1.5;
}

.lottery-draw-popup-status.is-running {
  color: #e6a23c;
}

.lottery-draw-popup-status.is-win {
  color: #2ecc71;
  font-weight: 600;
}

.lottery-draw-popup-target {
  padding: 18rpx 20rpx;
  margin-bottom: 18rpx;
  background-color: #f7fbf8;
  border: 1rpx solid rgba(46, 204, 113, 0.24);
  border-radius: 12rpx;
  line-height: 1.6;
}

.lottery-draw-popup-target-label {
  color: #667085;
  font-size: 24rpx;
}

.lottery-draw-popup-target-number {
  color: #2ecc71;
  font-size: 28rpx;
  font-weight: 600;
  word-break: break-all;
}

.lottery-draw-popup-content {
  flex: 1;
  min-height: 0;
  padding: 4rpx 4rpx 0;
  box-sizing: border-box;
}

.lottery-draw-popup-log {
  display: flex;
  align-items: flex-start;
  margin-bottom: 18rpx;
  line-height: 1.65;
}

.lottery-draw-popup-log-index {
  flex-shrink: 0;
  width: 48rpx;
  padding-top: 2rpx;
  color: #b4b8bf;
  font-size: 22rpx;
}

.lottery-draw-popup-log-text {
  flex: 1;
  color: #444851;
  font-size: 25rpx;
  word-break: break-all;
}

.lottery-draw-popup-empty {
  padding: 80rpx 0;
  color: #b4b8bf;
  font-size: 26rpx;
  text-align: center;
}

.lottery-draw-popup-footer {
  flex-shrink: 0;
  padding-top: 20rpx;
  margin-top: 16rpx;
  border-top: 1rpx solid #f0f2f5;
}

.lottery-draw-popup-btn {
  padding: 16rpx 0;
  color: #ffffff;
  background-color: #2ecc71;
  border-radius: 8rpx;
  font-size: 28rpx;
  text-align: center;
}
</style>
