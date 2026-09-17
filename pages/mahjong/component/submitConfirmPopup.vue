<template>
  <view class="confirm-popup-mask" v-if="isShow" @click="close">
    <view class="confirm-popup-card" @click.stop>
      <!-- 关闭按钮 -->
      <view class="confirm-popup-close" @click="close">
        <text class="close-icon">×</text>
      </view>

      <!-- 标题 -->
      <view class="confirm-popup-title">预约确认</view>

      <!-- 预约时间段 -->
      <view class="confirm-popup-time-box" v-if="timeRange">
        <text>{{ timeRange }}</text>
      </view>

      <!-- 提示内容 -->
      <view class="confirm-popup-content">
        <text>预约提交成功后暂不支持自助取消，如需取消请联系管理员处理，请仔细确认预约信息！</text>
      </view>

      <!-- 底部操作 -->
      <view class="confirm-popup-footer">
        <view class="confirm-popup-btn confirm-popup-btn-cancel" @click="close">取消</view>
        <view class="confirm-popup-btn confirm-popup-btn-submit" @click="confirmSubmit">确认提交</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "submitConfirmPopup",
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false,
    },
    // 预约时间段展示文本
    timeRange: {
      type: String,
      default: "",
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    confirmSubmit() {
      this.$emit("confirm");
    },
  },
};
</script>

<style lang="scss" scoped>
.confirm-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-popup-card {
  position: relative;
  width: 86%;
  max-width: 620rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 36rpx 32rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
}

// 关闭按钮
.confirm-popup-close {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .close-icon {
    font-size: 44rpx;
    color: #c0c4cc;
    line-height: 1;
  }

  &:active .close-icon {
    color: #909399;
  }
}

// 标题
.confirm-popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  padding-right: 40rpx;
  margin-bottom: 24rpx;
}

// 预约时间段
.confirm-popup-time-box {
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  border-radius: 12rpx;
  background-color: rgba(46, 204, 113, 0.1);
  font-size: 30rpx;
  font-weight: 600;
  color: #1e8449;
  text-align: center;
}

// 提示内容
.confirm-popup-content {
  font-size: 28rpx;
  color: #ff9900;
  line-height: 1.8;
  padding-bottom: 8rpx;
}

// 底部操作
.confirm-popup-footer {
  display: flex;
  margin-top: 28rpx;
  border-top: 1rpx solid #f0f2f5;
  padding-top: 24rpx;
}

.confirm-popup-btn {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  padding: 16rpx 0;
  border-radius: 8rpx;

  &.confirm-popup-btn-cancel {
    color: #2ecc71;
    margin-right: 20rpx;
  }

  &.confirm-popup-btn-submit {
    color: #ffffff;
    background-color: #2ecc71;
  }

  &:active {
    opacity: 0.8;
  }
}
</style>
