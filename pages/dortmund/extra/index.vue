<template>
  <view class="fx67ll-extra-box">
    <z-paging-mini ref="paging" v-model="extraList" @query="queryExtraList">
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
                    :style="{ fontSize: '14px', color: '#999', paddingRight: '10rpx' }"
                  >
                    {{
                      item.isWin === "Y"
                        ? "盈利"
                        : item.winMoney === "0"
                        ? "持平"
                        : "亏损"
                    }}
                  </view>
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
                    <uni-badge
                      :text="
                        item.isWin === 'Y'
                          ? `+${item.winMoney}`
                          : item.winMoney === '0'
                          ? '0'
                          : `-${item.winMoney}`
                      "
                      :max-num="999999999"
                      :custom-style="
                        item.isWin === 'Y'
                          ? badgeCustomSuccessStyle
                          : item.winMoney === '0'
                          ? badgeCustomNormalStyle
                          : badgeCustomFailStyle
                      "
                    />
                  </view>
                </template>
              </uni-list-chat>
            </uni-list>
          </uni-section>
        </uni-swipe-action-item>
      </view>
    </z-paging-mini>
  </view>
</template>

<script>
import { getExtraList, addExtra, delExtra } from "@/api/dortmund/extra";
import { showConfirm } from "@/utils/common";
import uniListChat from "@/uni_modules/uni-list/components/uni-list-chat/uni-list-chat.vue";
export default {
  components: { uniListChat },
  data() {
    return {
      extraList: [],
      badgeCustomSuccessStyle: {
        backgroundColor: "#2ecc71",
        zoom: 1.4,
        position: "relative",
        left: "8rpx",
        top: "4rpx",
        padding: "0 14rpx",
      },
      badgeCustomFailStyle: {
        backgroundColor: "#ff5a5f",
        zoom: 1.4,
        position: "relative",
        left: "8rpx",
        top: "4rpx",
        padding: "0 14rpx",
      },
      badgeCustomNormalStyle: {
        backgroundColor: "#999999",
        zoom: 1.4,
        position: "relative",
        left: "8rpx",
        top: "4rpx",
        padding: "0 14rpx",
      },
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
    };
  },
  methods: {
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
    deleteLog(id) {
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
            self.deleteLog(record.extraId);
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
