<template>
  <view class="notice-popup-mask" v-if="isShow" @click="close">
    <view class="notice-popup-card" @click.stop>
      <!-- 关闭按钮 -->
      <view class="notice-popup-close" @click="close">
        <text class="close-icon">×</text>
      </view>

      <!-- 标题 -->
      <view class="notice-popup-title">{{ noticeInfo.noticeTitle || '最新公告' }}</view>

      <!-- 类型 + 时间 -->
      <view class="notice-popup-meta">
        <view class="notice-type-tag" :class="'type-' + noticeInfo.noticeType">{{ typeText(noticeInfo.noticeType) }}</view>
        <text class="notice-popup-time">{{ formatTime(noticeInfo.createTime) }}</text>
      </view>

      <!-- 富文本正文 -->
      <scroll-view :scroll-y="true" class="notice-popup-content">
        <rich-text :nodes="noticeInfo.noticeContent || ''"></rich-text>
      </scroll-view>

      <!-- 底部操作 -->
      <view class="notice-popup-footer">
        <view class="notice-popup-btn notice-popup-btn-all" @click="viewAll">查看全部公告</view>
        <view class="notice-popup-btn notice-popup-btn-know" @click="close">我知道了</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'noticePopup',
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false,
    },
    // 公告信息
    noticeInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      typeDict: [
        { value: '1', label: '通知' },
        { value: '2', label: '公告' },
      ],
    };
  },
  methods: {
    typeText(noticeType) {
      const dict = this.typeDict.find((d) => d.value === noticeType);
      return dict ? dict.label : '公告';
    },
    formatTime(time) {
      if (!time) return '';
      return String(time).replace('T', ' ').substring(0, 16);
    },
    close() {
      this.$emit('close');
    },
    viewAll() {
      this.$emit('viewAll');
    },
  },
};
</script>

<style lang="less">
.notice-popup-mask {
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

.notice-popup-card {
  position: relative;
  width: 86%;
  max-width: 620rpx;
  max-height: 76vh;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 36rpx 32rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
}

// 关闭按钮
.notice-popup-close {
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
.notice-popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  padding-right: 40rpx;
  margin-bottom: 20rpx;
}

// 类型 + 时间
.notice-popup-meta {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
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

.notice-popup-time {
  font-size: 24rpx;
  color: #909399;
}

// 富文本正文
.notice-popup-content {
  flex: 1;
  overflow-y: auto;
  font-size: 28rpx;
  color: #303133;
  line-height: 1.8;
  padding-bottom: 8rpx;
}

// 底部操作
.notice-popup-footer {
  display: flex;
  margin-top: 28rpx;
  border-top: 1rpx solid #f0f2f5;
  padding-top: 24rpx;
}

.notice-popup-btn {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  padding: 16rpx 0;
  border-radius: 8rpx;

  &.notice-popup-btn-all {
    color: #2ecc71;
    margin-right: 20rpx;
  }

  &.notice-popup-btn-know {
    color: #ffffff;
    background-color: #2ecc71;
  }

  &:active {
    opacity: 0.8;
  }
}
</style>
