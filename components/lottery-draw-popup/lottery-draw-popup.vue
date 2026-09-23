<template>
  <view class="lottery-draw-popup-mask" v-if="isShow" @click="handleMaskClick">
    <view class="lottery-draw-popup-card" @click.stop>
      <view class="lottery-draw-popup-close" @click="close">
        <text class="lottery-draw-popup-close-icon">×</text>
      </view>

      <view class="lottery-draw-popup-title" @click="scrollToLatestLog">{{ title }}</view>
      <view class="lottery-draw-popup-status" :class="{ 'is-win': isWin, 'is-running': isRunning }">
        {{ statusText }}
      </view>

      <view class="lottery-draw-popup-time" v-if="timeText">
        <text class="lottery-draw-popup-time-label">累计耗时：</text>
        <text class="lottery-draw-popup-time-value">{{ timeText }}</text>
      </view>

      <view class="lottery-draw-popup-target" v-if="targetText">
        <text class="lottery-draw-popup-target-label">目标中奖号码：</text>
        <text class="lottery-draw-popup-target-number">{{ targetText }}</text>
      </view>

      <view class="lottery-draw-popup-scroll-wrap">
        <scroll-view scroll-y="true" class="lottery-draw-popup-content" :scroll-top="logScrollTopProp"
          scroll-with-animation @scroll="handleLogScroll">
          <view class="lottery-draw-popup-log-list" v-if="reversedLogs.length">
            <view class="lottery-draw-popup-log" v-for="(item, index) in reversedLogs" :key="logs.length - index">
              <text class="lottery-draw-popup-log-index">{{ logs.length - index }}</text>
              <text class="lottery-draw-popup-log-text">{{ item }}</text>
            </view>
          </view>
          <view class="lottery-draw-popup-empty" v-else>暂无模拟摇奖过程信息</view>
        </scroll-view>
        <view class="lottery-draw-popup-scroll-top-btn" hover-class="is-pressed" :hover-start-time="0"
          :hover-stay-time="80" :class="{ 'is-hidden': !logScrollable }" @click="scrollToLatestLog">
          <text class="lottery-draw-popup-scroll-top-icon">↑</text>
        </view>
      </view>

      <view class="lottery-draw-popup-footer">
        <view class="lottery-draw-popup-btn close" @click="close">关闭</view>
        <view class="lottery-draw-popup-btn" :class="{ 'is-stop': isRunning }" v-if="!isWin" @click="handleFooterClick">{{ footerBtnText }}</view>
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
      default: "模拟摇奖",
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
    timeText: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      // 用户停止滚动后延时回顶的定时器
      logScrollResetTimer: null,
      // 最近一次滚动位置，归零表示已在顶部可直接看到最新消息
      logScrollTop: 0,
      // 绑定给scroll-view的scroll-top值，交替设置保证重复归零也能触发滚动
      logScrollTopProp: 0,
      // 滚动区内容是否可滚动，仅可滚动时展示回顶悬浮按钮
      logScrollable: false,
      // 内容可滚动检测的节流定时器
      logScrollableCheckTimer: null,
    };
  },
  computed: {
    // 倒序展示模拟摇奖过程信息，最新消息固定在最上方，无需手动下滑查看
    reversedLogs() {
      return (this.logs || []).slice().reverse();
    },
    // 右侧按钮文案：模拟中为停止，停止后为继续，中奖结束后隐藏
    footerBtnText() {
      return this.isRunning ? "停止摇奖" : "继续摇奖";
    },
  },
  watch: {
    // 模拟开始后若用户仍停留在下方，同样延时回顶保证能看到最新消息
    isRunning(val) {
      if (!val) {
        this.clearLogScrollResetTimer();
      } else if (this.logScrollTop > 0) {
        this.scheduleLogScrollReset();
      }
    },
    // 消息变化时节流检测滚动区内容是否超出视口，决定回顶悬浮按钮的展示
    reversedLogs(val) {
      if (!val || val.length === 0) {
        this.logScrollable = false;
      }
      this.scheduleLogScrollableCheck();
    },
  },
  beforeDestroy() {
    this.clearLogScrollResetTimer();
    this.clearLogScrollableCheckTimer();
  },
  methods: {
    // 模拟中用户滚动查看历史消息后，3秒无滚动自动回到顶部继续展示最新消息
    handleLogScroll(event) {
      this.logScrollTop = event?.detail?.scrollTop || 0;
      if (this.logScrollTop <= 0 || !this.isRunning) {
        this.clearLogScrollResetTimer();
        return;
      }
      this.scheduleLogScrollReset();
    },
    scheduleLogScrollReset() {
      this.clearLogScrollResetTimer();
      this.logScrollResetTimer = setTimeout(() => {
        this.logScrollResetTimer = null;
        if (this.logScrollTop > 0) {
          this.logScrollTopProp = this.logScrollTopProp > 0 ? 0 : 0.1;
        }
      }, 3000);
    },
    clearLogScrollResetTimer() {
      if (this.logScrollResetTimer) {
        clearTimeout(this.logScrollResetTimer);
        this.logScrollResetTimer = null;
      }
    },
    // 消息高频追加时节流检测，避免频繁查询节点尺寸
    scheduleLogScrollableCheck() {
      if (this.logScrollableCheckTimer) {
        return;
      }
      this.logScrollableCheckTimer = setTimeout(() => {
        this.logScrollableCheckTimer = null;
        this.checkLogScrollable();
      }, 300);
    },
    // 检测滚动区内容高度是否超过视口高度，仅可滚动时展示回顶悬浮按钮
    checkLogScrollable() {
      const query = uni.createSelectorQuery().in(this);
      query.select(".lottery-draw-popup-content").boundingClientRect();
      query.select(".lottery-draw-popup-log-list").boundingClientRect();
      query.exec((res) => {
        const viewportRect = res && res[0];
        const listRect = res && res[1];
        this.logScrollable = !!(viewportRect && listRect && listRect.height > viewportRect.height + 2);
      });
    },
    clearLogScrollableCheckTimer() {
      if (this.logScrollableCheckTimer) {
        clearTimeout(this.logScrollableCheckTimer);
        this.logScrollableCheckTimer = null;
      }
    },
    // 点击标题立即回到顶部查看最新消息
    scrollToLatestLog() {
      this.clearLogScrollResetTimer();
      this.logScrollTopProp = this.logScrollTopProp > 0 ? 0 : 0.1;
    },
    // 点击遮罩仅在非模拟中关闭弹窗，模拟中误触遮罩不结束模拟
    handleMaskClick() {
      if (this.isRunning) {
        return;
      }
      this.close();
    },
    handleFooterClick() {
      if (this.isRunning) {
        this.$emit("stop");
        return;
      }
      this.$emit("resume");
    },
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

.lottery-draw-popup-time {
  margin-bottom: 18rpx;
  line-height: 1.5;
}

.lottery-draw-popup-time-label {
  color: #909399;
  font-size: 24rpx;
}

.lottery-draw-popup-time-value {
  color: #667085;
  font-size: 26rpx;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
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

.lottery-draw-popup-scroll-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
}

.lottery-draw-popup-content {
  height: 100%;
  padding: 4rpx 4rpx 0;
  box-sizing: border-box;
}

.lottery-draw-popup-scroll-top-btn {
  position: absolute;
  right: 20rpx;
  bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.16);
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
}

.lottery-draw-popup-scroll-top-btn.is-pressed {
  transform: scale(0.85);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

.lottery-draw-popup-scroll-top-btn.is-hidden {
  opacity: 0;
  transform: scale(0.6);
  pointer-events: none;
}

.lottery-draw-popup-scroll-top-icon {
  color: #667085;
  font-size: 34rpx;
  font-weight: 600;
  line-height: 1;
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
  display: flex;
  align-items: center;
  padding-top: 20rpx;
  margin-top: 16rpx;
  border-top: 1rpx solid #f0f2f5;
}

.lottery-draw-popup-btn {
  flex: 1;
  padding: 16rpx 0;
  color: #ffffff;
  background-color: #2ecc71;
  border-radius: 8rpx;
  font-size: 28rpx;
  text-align: center;
}

.lottery-draw-popup-btn.close {
  flex: none;
  width: 180rpx;
  margin-right: 20rpx;
  background-color: #ff5a5f;
}

.lottery-draw-popup-btn.is-stop {
  background-color: #e6a23c;
}
</style>
