<template>
  <zb-drawer mode="bottom" title="麻将室介绍" :wrapperClosable="false" :visible.sync="isShowRoomDrawer" :radius="true"
    height="85%">
    <view class="fx67ll-room-drawer">
      <!-- 顶部主题色提示条 -->
      <view class="fx67ll-room-drawer-tip">
        <uni-icons type="info" color="#2ecc71" size="18"></uni-icons>
        <text>本功能是演示模拟页面，欢迎参观学习~ 以下是麻将室的详细介绍，预约前请先了解一下~</text>
      </view>
      <view v-if="isLoading" class="fx67ll-room-drawer-loading">
        <text>介绍内容加载中...</text>
      </view>
      <view v-else class="fx67ll-room-drawer-content">
        <rich-text v-if="mahjongRoomDescription" :nodes="mahjongRoomDescription"></rich-text>
        <!-- 介绍内容为空时的占位提示 -->
        <view v-else class="fx67ll-room-drawer-empty">
          <view class="fx67ll-room-drawer-empty-icon">
            <uni-icons type="shop" color="#2ecc71" size="56"></uni-icons>
          </view>
          <view class="fx67ll-room-drawer-empty-title">暂无介绍内容</view>
          <view class="fx67ll-room-drawer-empty-tip">麻将室介绍正在完善中，不影响正常预约使用~</view>
        </view>
      </view>
    </view>
  </zb-drawer>
</template>

<script>
import { getMahjongRoomInfo } from "@/api/fx67ll/mahjong/room";

export default {
  props: {
    // 是否显示抽屉
    isShowRoomDrawer: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  data() {
    return {
      // 麻将室介绍富文本内容
      mahjongRoomDescription: "",
      // 是否正在加载介绍内容
      isLoading: false,
    };
  },
  watch: {
    isShowRoomDrawer(newValue, oldValue) {
      if (!newValue) {
        // 监听父组件是否需要关闭当前抽屉
        this.$emit("hideDrawer", newValue);
      } else {
        // 每次打开抽屉的时候重新查询介绍内容，保证内容为最新
        this.isLoading = true;
        this.queryRoomInfo();
      }
    },
  },
  methods: {
    // 查询麻将室介绍详情
    queryRoomInfo() {
      const self = this;
      getMahjongRoomInfo(1)
        .then((res) => {
          if (res?.code === 200) {
            let htmlContent = res?.data?.mahjongRoomDescription || "";
            if (htmlContent) {
              // 内容被整体转义存储时（如&lt;p&gt;），先还原为HTML标签再渲染
              if (/&lt;[a-z][^&]*&gt;/i.test(htmlContent)) {
                htmlContent = htmlContent
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'");
              } else if (!/<[a-z][^>]*>/i.test(htmlContent)) {
                // 内容不含HTML标签时视为纯文本，转换换行为<br>，保证段落正常展示
                htmlContent = htmlContent
                  .replace(/\r\n/g, "\n")
                  .replace(/\n/g, "<br>");
              }
              // Quill编辑器输出的对齐与缩进通过class表达（如ql-align-center），rich-text内无法命中外部样式，统一转为内联样式保证生效
              htmlContent = htmlContent.replace(/<([a-z]+)([^>]*?)class="([^"]*)"/gi, (match, tag, attrs, cls) => {
                const styles = [];
                if (/\bql-align-center\b/.test(cls)) {
                  styles.push("text-align:center");
                }
                if (/\bql-align-right\b/.test(cls)) {
                  styles.push("text-align:right");
                }
                if (/\bql-align-justify\b/.test(cls)) {
                  styles.push("text-align:justify");
                }
                const indentMatch = cls.match(/\bql-indent-(\d+)\b/);
                if (indentMatch) {
                  styles.push(`padding-left:${parseInt(indentMatch[1], 10) * 3}em`);
                }
                if (!styles.length) {
                  return match;
                }
                // 合并标签上已有的内联样式
                const styleMatch = attrs.match(/\sstyle="([^"]*)"/i);
                const existStyle = styleMatch ? `${styleMatch[1]};` : "";
                const restAttrs = styleMatch ? attrs.replace(/\sstyle="[^"]*"/i, "") : attrs;
                return `<${tag}${restAttrs} style="${existStyle}${styles.join(";")}"`;
              });
              // 给所有img标签添加样式，限制最大宽度为100%
              htmlContent = htmlContent.replace(/<img/g, '<img style="max-width:100%; height:auto; margin-top:10px;"');
            }
            self.mahjongRoomDescription = htmlContent;
          } else {
            uni.showToast({
              title: "查询麻将室介绍详情失败！",
              icon: "none",
              duration: 1998,
            });
          }
          self.isLoading = false;
        })
        .catch(() => {
          self.isLoading = false;
          uni.showToast({
            title: "查询麻将室介绍详情失败！",
            icon: "none",
            duration: 1998,
          });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.fx67ll-room-drawer {
  padding: 20rpx 30rpx 60rpx;

  .fx67ll-room-drawer-tip {
    display: flex;
    align-items: center;
    padding: 16rpx 20rpx;
    margin-bottom: 20rpx;
    border-radius: 12rpx;
    background-color: rgba(46, 204, 113, 0.1);
    font-size: 26rpx;
    color: #1e8449;
  }

  .fx67ll-room-drawer-loading {
    padding: 60rpx 0;
    text-align: center;
    font-size: 28rpx;
    color: #909399;
  }

  .fx67ll-room-drawer-content {
    font-size: 28rpx;
    color: #333333;
    line-height: 1.8;
  }

  // 介绍内容为空时的占位样式
  .fx67ll-room-drawer-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 40rpx;

    .fx67ll-room-drawer-empty-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
      background-color: rgba(46, 204, 113, 0.1);
    }

    .fx67ll-room-drawer-empty-title {
      margin-top: 30rpx;
      font-size: 30rpx;
      font-weight: 600;
      color: #909399;
    }

    .fx67ll-room-drawer-empty-tip {
      margin-top: 14rpx;
      font-size: 24rpx;
      color: #c0c4cc;
    }
  }
}
</style>
