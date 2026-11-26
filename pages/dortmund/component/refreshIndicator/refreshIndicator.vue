<template>
  <view class="fx67ll-refresh-indicator" :class="statusClass">
    <view class="fx67ll-refresh-orbit">
      <view class="fx67ll-refresh-ring" />
      <text class="fx67ll-refresh-icon">{{ statusIcon }}</text>
    </view>
    <view class="fx67ll-refresh-copy">
      <text class="fx67ll-refresh-title">{{ statusTitle }}</text>
      <text class="fx67ll-refresh-tip">{{ statusTip }}</text>
    </view>
  </view>
</template>

<script>
// Dortmund 列表下拉刷新统一动效：0 默认、1 松手刷新、2 刷新中、3 刷新完成
export default {
  name: 'RefreshIndicator',
  props: {
    status: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    normalizedStatus() {
      const value = Number(this.status);
      return value >= 0 && value <= 3 ? value : 0;
    },
    statusClass() {
      return [
        'is-default',
        'is-ready',
        'is-loading',
        'is-complete',
      ][this.normalizedStatus];
    },
    statusIcon() {
      return ['↓', '↑', '↻', '✓'][this.normalizedStatus];
    },
    statusTitle() {
      return ['下拉刷新', '松手刷新', '正在刷新', '刷新完成'][this.normalizedStatus];
    },
    statusTip() {
      return ['同步最新业务记录', '松开后立即同步', '请稍候，正在更新列表', '已同步到最新状态'][
        this.normalizedStatus
      ];
    },
  },
};
</script>

<style lang="less">
@import url('./refreshIndicator.less');
</style>
