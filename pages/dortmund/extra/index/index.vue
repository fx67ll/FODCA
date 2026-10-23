<template>
  <view class="fx67ll-extra-box">
    <z-paging-mini ref="paging" back-to-top-bottom="30rpx" :auto-show-back-to-top="true" v-model="extraList"
      @query="queryExtraList">
      <uni-swipe-action>
        <view class="fx67ll-extra-item" v-for="item in extraList" :key="item.extraId">
          <uni-swipe-action-item :right-options="actionOptions" @click="(e) => handleActionClick(e, item)">
            <uni-section :title="item.createTime" type="line">
              <uni-list :border="true">
                <uni-list-chat :avatar="'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=' + 6
                  " :title="`￥${item.extraMoney}${item.saveMoney && item.saveMoney !== '0'
                      ? ' / ￥' + item.saveMoney
                      : ''
                    }`" :note="item.extraRemark">
                  <template v-slot:default>
                    <view :style="{ fontSize: '14px', color: '#999', paddingRight: '6rpx' }">￥{{
                      item.saveMoney < item.seedMoney ? "-" + item.seedMoney : item.seedMoney }} </view>
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
                          <text :class="{
                            'fx67ll-extra-badge': true,
                            'fx67ll-extra-badge-success': item.isWin === 'Y',
                            'fx67ll-extra-badge-fail':
                              item.isWin !== 'Y' && item.winMoney !== '0',
                            'fx67ll-extra-badge-normal':
                              item.isWin !== 'Y' && item.winMoney === '0',
                          }">{{
                          item.isWin === "Y"
                            ? `+${item.winMoney}`
                            : item.winMoney === "0"
                              ? "0"
                              : `${item.winMoney}`
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
    <uni-fab ref="fab" :pattern="fabConfig.pattern" :content="fabConfig.content" :horizontal="fabConfig.horizontal"
      :vertical="fabConfig.vertical" :direction="fabConfig.direction" @trigger="handleFabTrigger" />
    <extraDrawer :isShowExtraDrawer="isShowExtraDrawer" :multipleExtraDataList="extraList" operaBtnName="合并外快盈亏记录"
      :selectedExtraItemList="defaultSelectedList" @hideDrawer="setIsShowExtraDrawer"
      @submitDrawer="handleSelectedData" />
  </view>
</template>

<script>
import extraDrawer from "@/pages/dortmund/extra/component/extraDrawer/extraDrawer.vue";
import { getExtraList, delExtra, mergeExtra } from "@/api/fx67ll/dortmund/extra";
import { diffTimeStrFromNow } from "@/utils/index";
import { showConfirm } from "@/utils/common";
import uniListChat from "@/uni_modules/uni-list/components/uni-list-chat/uni-list-chat.vue";
export default {
  components: { extraDrawer, uniListChat },
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
          text: "合并",
          style: {
            backgroundColor: "#ffa940",
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
      // extraDrawer组件相关参数
      isShowExtraDrawer: false,
      // 打开extraDrawer组件的默认选中数据
      defaultSelectedList: null,
      // 合并提交中标志，防止用户重复点击提交造成并发请求
      mergeSubmitting: false,
    };
  },
  onShow() {
    if (this.$refs.paging) {
      this.$refs.paging.reload();
    }
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
        this.$tab.navigateTo("/pages/dortmund/extra/add/add");
      }
      if (e?.index === 1) {
        this.$tab.navigateTo("/pages/dortmund/extra/chart/chart");
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
      if (e?.position === "right" && e?.index === 1) {
        this.defaultSelectedList = [record];
        setTimeout(() => {
          self.isShowExtraDrawer = true;
        }, 444)
      }
      if (e?.position === "right" && e?.index === 2) {
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
    // 关闭多选数据记录抽屉
    setIsShowExtraDrawer(val) {
      this.isShowExtraDrawer = val;
    },
    // 提交多选数据记录抽屉（extraDrawer确认合并后回调，携带所选记录列表与合并后备注）
    handleSelectedData(selectedData) {
      this.mergeExtraRecord(selectedData?.selectedList, selectedData?.extraRemark);
    },
    // 合并外快盈亏历史记录，调用后台事务接口完成合并+删除旧数据
    mergeExtraRecord(mergeExtraItemList, extraRemark) {
      const self = this;
      // 防重复提交：合并进行中时直接忽略后续点击，避免并发请求造成脏数据
      if (self.mergeSubmitting) {
        return;
      }
      // 抽屉内已完成数量、上限与连续性校验，此处做兜底校验，防止异常调用
      if (!mergeExtraItemList || mergeExtraItemList.length < 2) {
        uni.showToast({
          title: "请至少选择两条记录进行合并！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      // 收集所有记录的主键，过滤无效值，按字符串去重后转回数字，保证传给后台的是数字数组（与后台 Long[] 入参一致）
      const extraIdList = mergeExtraItemList
        .map((item) => item.extraId)
        .filter((id) => id !== undefined && id !== null && id !== "");
      const extraIds = Array.from(new Set(extraIdList.map((id) => String(id)))).map((id) => Number(id));
      if (extraIds.length < 2) {
        uni.showToast({
          title: "请至少选择两条不同的记录进行合并！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      self.mergeSubmitting = true;
      mergeExtra({ extraIds, extraRemark })
        .then((res) => {
          if (res?.code === 200) {
            uni.showToast({
              title: "合并成功！",
              icon: "none",
              duration: 1998,
            });
            self.isShowExtraDrawer = false;
            self.$refs.paging && self.$refs.paging.reload();
          } else {
            uni.showToast({
              title: res?.msg || "合并失败，请稍后重试！",
              icon: "none",
              duration: 1998,
            });
          }
        })
        .catch(() => {
          // request.js 已统一 toast 提示，此处无需重复
        })
        .finally(() => {
          self.mergeSubmitting = false;
        });
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
