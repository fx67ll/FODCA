<template>
  <view class="fx67ll-extra-box">
    <z-paging-mini ref="paging" v-model="extraList" @query="queryExtraList">
      <uni-swipe-action>
        <view class="fx67ll-extra-item" v-for="item in extraList" :key="item.extraId">
          <uni-swipe-action-item
            :right-options="actionOptions"
            @click="(e) => handleActionClick(e, item)"
          >
            <uni-section :title="item.createTime" type="line">
              <uni-list :border="true">
                <uni-list-chat
                  :avatar="
                    'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=' + 6
                  "
                  :title="`￥${item.extraMoney}`"
                  :note="item.extraRemark"
                >
                  <template v-slot:default>
                    <view
                      :style="{ fontSize: '14px', color: '#999', paddingRight: '6rpx' }"
                      >￥{{ item.seedMoney }}
                    </view>
                    <!-- <view
                      :style="{ fontSize: '14px', color: '#999', paddingRight: '6rpx' }"
                    >
                      {{
                        item.isWin === "Y"
                          ? "盈利"
                          : item.winMoney === "0"
                          ? "持平"
                          : "亏损"
                      }}
                    </view> -->
                    <!-- <view
                    :style="{ fontSize: '14px', color: '#2ecc71', paddingRight: '10rpx' }"
                    v-if="item.isWin === 'Y'"
                  >
                    盈利
                  </view>
                  <view
                    :style="{ fontSize: '14px', color: '#ff5a5f', paddingRight: '10rpx' }"
                    v-if="item.isWin !== 'Y' && item.winMoney !== '0'"
                  >
                    亏损
                  </view>
                  <view
                    :style="{ fontSize: '14px', color: '#999999', paddingRight: '10rpx' }"
                    v-if="item.isWin !== 'Y' && item.winMoney === '0'"
                  >
                    持平
                  </view> -->
                    <view>
                      <text
                        :class="{
                          'fx67ll-extra-badge': true,
                          'fx67ll-extra-badge-success': item.isWin === 'Y',
                          'fx67ll-extra-badge-fail':
                            item.isWin !== 'Y' && item.winMoney !== '0',
                          'fx67ll-extra-badge-normal':
                            item.isWin !== 'Y' && item.winMoney === '0',
                        }"
                        >{{
                          item.isWin === "Y"
                            ? `+${item.winMoney}`
                            : item.winMoney === "0"
                            ? "0"
                            : `-${item.winMoney}`
                        }}
                      </text>
                    </view>
                  </template>
                </uni-list-chat>
              </uni-list>
            </uni-section>
          </uni-swipe-action-item>
        </view>
      </uni-swipe-action>
    </z-paging-mini>
    <uni-fab
      ref="fab"
      :pattern="fabConfig.pattern"
      :content="fabConfig.content"
      :horizontal="fabConfig.horizontal"
      :vertical="fabConfig.vertical"
      :direction="fabConfig.direction"
      @trigger="handleFabTrigger"
    />
  </view>
</template>

<script>
import { getExtraList, delExtra } from "@/api/dortmund/extra";
import { diffTimeStrFromNow } from "@/utils/index";
import { showConfirm } from "@/utils/common";
import uniListChat from "@/uni_modules/uni-list/components/uni-list-chat/uni-list-chat.vue";
export default {
  components: { uniListChat },
  data() {
    return {
      extraList: [],
      actionOptions: [
        {
          text: "取消",
          style: {
            backgroundColor: "#4096ff",
          },
        },
        {
          text: "删除",
          style: {
            backgroundColor: "#ff4d4f",
          },
        },
      ],
      fabConfig: {
        title: "uni-fab",
        directionStr: "垂直",
        horizontal: "right",
        vertical: "bottom",
        direction: "horizontal",
        pattern: {
          color: "#7A7E83",
          backgroundColor: "#ffffff",
          selectedColor: "#7A7E83",
          buttonColor: "#2ecc71",
          iconColor: "#ffffff",
        },
        is_color_type: false,
        content: [
          {
            iconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=30",
            selectedIconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=30",
            text: "新增",
            active: false,
          },
          {
            iconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=29",
            selectedIconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=29",
            text: "走势",
            active: false,
          },
        ],
      },
    };
  },
  onBackPress() {
    if (this.$refs.fab.isShow) {
      this.$refs.fab.close();
      return true;
    }
    return false;
  },
  methods: {
    handleFabTrigger(e) {
      if (e?.index === 0) {
        this.$tab.navigateTo("/pages/dortmund/extra/add");
      }
      if (e?.index === 1) {
        this.$tab.navigateTo("/pages/dortmund/extra/chart");
      }
      this.$refs.fab.close();
    },
    queryExtraList(pageNum, pageSize) {
      const self = this;
      const queryParams = {
        pageNum,
        pageSize,
      };
      getExtraList(queryParams)
        .then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              self.$refs.paging.complete(res.rows);
            } else {
              self.$refs.paging.complete([]);
            }
          } else {
            uni.showToast({
              title: "查询外快盈亏记录失败！",
              icon: "none",
              duration: 1998,
            });
            self.$refs.paging.complete(false);
          }
        })
        .catch((res) => {
          self.$refs.paging.complete(false);
        });
    },
    deleteExtra(id) {
      const self = this;
      delExtra(id).then((res) => {
        if (res?.code === 200) {
          // self.queryExtraList();
          self.$refs.paging.reload();
          uni.showToast({
            title: "外快盈亏记录删除成功！",
            icon: "none",
            duration: 1998,
          });
        } else {
          uni.showToast({
            title: "外快盈亏记录删除失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    handleActionClick(e, record) {
      const self = this;
      if (e?.index === 1) {
        showConfirm(
          `删除后数据无法恢复，请确认是否删除创建时间为：${record?.createTime} 的外快盈亏记录？`,
          "警告"
        ).then((res) => {
          if (res?.confirm && record?.extraId) {
            if (diffTimeStrFromNow(record?.createTime) <= -24) {
              uni.showToast({
                title: "记录创建时间已超过24小时，不允许删除操作！",
                icon: "none",
                duration: 1998,
              });
            } else {
              self.deleteExtra(record.extraId);
            }
          }
        });
      }
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
