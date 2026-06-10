<template>
  <zb-drawer mode="bottom" title="本次号码生成配置记录日志" :wrapperClosable="true" :visible.sync="isShowConfigLogDrawer"
    :radius="true" :height="configLogDrawerHeight">
    <view class="fx67ll-config-log-drawer">
      <scroll-view scroll-y="true" class="fx67ll-config-log-scroll">
        <view v-if="configLogList && configLogList.length > 0">
          <view class="fx67ll-config-log-item" v-for="(line, idx) in configLogList" :key="idx">
            <text class="fx67ll-config-log-index">{{ idx + 1 }}.</text>
            <text class="fx67ll-config-log-text">{{ line }}</text>
          </view>
        </view>
        <view v-else class="fx67ll-config-log-empty">暂无配置记录</view>
        <!-- #ifdef H5 -->
        <view class="fx67ll-config-log-placeholder-h5"></view>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="fx67ll-config-log-placeholder"></view>
        <!-- #endif -->
      </scroll-view>
      <!-- #ifdef H5 -->
      <view class="fx67ll-config-log-btn-box">
        <button class="fx67ll-config-log-btn" type="warn" @click="closeDrawer">关 闭</button>
      </view>
      <!-- #endif -->
    </view>
  </zb-drawer>
</template>

<script>
export default {
  name: "ConfigLogDrawer",

  props: {
    isShowConfigLogDrawer: {
      type: Boolean,
      required: true,
      default: false,
    },
    configLogList: {
      type: Array,
      required: false,
      default: () => [],
    },
    configLogDrawerHeight: {
      type: String,
      required: false,
      default: '88%',
    },
  },

  methods: {
    closeDrawer() {
      this.$emit("update:isShowConfigLogDrawer", false);
    },
  },
};
</script>

<style lang="less">
@import url("./configLogDrawer.less");
</style>
