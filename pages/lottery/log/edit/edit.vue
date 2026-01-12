<template>
  <view class="fx67ll-form-box">
    <uni-forms ref="form" :model="formParams" labelWidth="80px">
      <uni-forms-item label="彩票期号" name="dateCode">
        <uni-easyinput v-model="formParams.dateCode" placeholder="请输入彩票期号" clearable />
      </uni-forms-item>
      <uni-forms-item label="中奖号码" name="winningNumber">
        <uni-easyinput v-model="formParams.winningNumber" placeholder="请输入中奖号码" clearable />
      </uni-forms-item>
      <uni-forms-item label="是否中奖" name="isWin" required>
        <uni-data-checkbox v-model="formParams.isWin" :localdata="isConfig" />
      </uni-forms-item>
      <uni-forms-item label="中奖金额" name="winningPrice" required v-if="formParams.isWin === 'Y'">
        <uni-easyinput v-model="formParams.winningPrice" placeholder="请输入中奖金额" clearable />
      </uni-forms-item>
      <uni-forms-item label="是否追加" name="hasMorePurchases" required>
        <uni-data-checkbox v-model="formParams.hasMorePurchases" :localdata="isConfig" />
      </uni-forms-item>
    </uni-forms>
    <button type="primary" @click="handleEditLog">提交修改</button>
  </view>
</template>

<script>
import { getLogInfo, editLog } from "@/api/fx67ll/lottery/log";
import { validateLotteryString } from "@/utils/index";

export default {
  data() {
    return {
      formParams: {
        lotteryId: "",
        dateCode: "",
        winningNumber: "",
        isWin: "N",
        winningPrice: "",
        hasMorePurchases: "N",
      },
      isConfig: [
        {
          text: "是",
          value: "Y",
        },
        {
          text: "否",
          value: "N",
        },
      ],
      rules: {
        isWin: {
          rules: [
            {
              required: true,
              errorMessage: "是否中奖不能为空",
            },
          ],
        },
        winningPrice: {
          rules: [
            {
              required: true,
              errorMessage: "中奖金额不能为空",
            },
          ],
        },
        hasMorePurchases: {
          rules: [
            {
              required: true,
              errorMessage: "是否有追加购买行为不能为空",
            },
          ],
        },
      },
    };
  },
  onLoad(option) {
    if (option?.lotteryId) {
      this.getHistoryLogInfo(parseInt(option.lotteryId));
    } else {
      uni.showToast({
        title: "未查询到号码历史记录ID！",
        icon: "none",
        duration: 1998,
      });
    }
  },
  // onReady() {
  //   this.resetForm();
  // },
  onUnload() {
    this.formParams.dateCode = ''
  },
  methods: {
    getHistoryLogInfo(lotteryId) {
      const self = this;
      this.formParams.lotteryId = lotteryId;
      getLogInfo(lotteryId).then((res) => {
        if (res?.code === 200) {
          if (res?.data) {
            self.formParams = {
              ...self.formParams,
              numberType: res?.data?.numberType,
              dateCode: res?.data?.dateCode,
              // recordNumber: res?.data?.recordNumber,
              // chaseNumber: res?.data?.chaseNumber,
              winningNumber: res?.data?.winningNumber,
              isWin: res?.data?.isWin,
              winningPrice: res?.data?.winningPrice,
              hasMorePurchases: res?.data?.hasMorePurchases,
            };
          } else {
            uni.showToast({
              title: "暂无历史号码记录详情数据！",
              icon: "none",
              duration: 1998,
            });
          }
        } else {
          uni.showToast({
            title: "查询历史号码记录详情失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    /** 校验不同类型号码的字符串格式 */
    handleCheckNumber(checkNumType, checkNumStr) {
      const referenceFormat = {
        1: {
          numType: "大乐透",
          numStr: "4,7,8,10,23-4,9",
        },
        2: {
          numType: "双色球",
          numStr: "1,4,5,8,10,23-5",
        },
        3: {
          numType: "排列三",
          numStr: "1,2,3",
        },
        4: {
          numType: "排列五",
          numStr: "1,2,3,4,5",
        },
        5: {
          numType: "七星彩",
          numStr: "1,2,3,4,5,6,7",
        },
      };
      if (checkNumStr) {
        const checkRecord = validateLotteryString(checkNumType, checkNumStr);
        if (!checkRecord) {
          uni.showToast({
            title: `${referenceFormat?.[checkNumType]?.numType}号码格式错误！参考格式：${referenceFormat?.[checkNumType]?.numStr}`,
            icon: "none",
            duration: 1998,
          });
          return false;
        }
        return true;
      }
      return true;
    },
    handleEditLog() {
      const self = this;
      this.$refs.form.validate().then((valRes) => {
        self.formParams.winningPrice =
          self.formParams.isWin === "Y" ? self.formParams.winningPrice : "";

        const nType = self.formParams.numberType;
        if (
          !(
            // self.handleCheckNumber(nType, self.formParams.recordNumber) &&
            // self.handleCheckNumber(nType, self.formParams.chaseNumber) &&
            self.handleCheckNumber(nType, self.formParams.winningNumber)
          )
        ) {
          return;
        }

        editLog(self.formParams).then((res) => {
          if (res?.code === 200) {
            uni.showToast({
              title: "历史号码记录详情修改成功！",
              icon: "none",
              duration: 1998,
            });
            setTimeout(() => {
              self.$tab.navigateBack("/pages/lottery/log/index/index");
            }, 1023);
          } else {
            uni.showToast({
              title: "历史号码记录详情修改失败！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      });
    },
  }
};
</script>

<style lang="less">
@import url("./edit.less");
</style>
