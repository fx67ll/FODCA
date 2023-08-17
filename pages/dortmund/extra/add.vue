<template>
  <view class="fx67ll-form-box">
    <uni-forms ref="form" :model="formParams" labelWidth="80px">
      <uni-forms-item label="外快余额" name="extraMoney" required>
        <uni-easyinput
          v-model="formParams.extraMoney"
          placeholder="请输入当前外快总金额"
        />
      </uni-forms-item>
      <uni-forms-item label="是否盈利" name="isWin" required>
        <uni-data-checkbox v-model="formParams.isWin" :localdata="isWinConfig" />
      </uni-forms-item>
      <uni-forms-item label="盈亏金额" name="winMoney" required>
        <uni-easyinput v-model="formParams.winMoney" placeholder="请输入外快盈亏金额" />
      </uni-forms-item>
      <uni-forms-item label="盈亏备注" name="extraRemark">
        <uni-easyinput
          type="textarea"
          v-model="formParams.extraRemark"
          placeholder="请输入盈亏备注"
        />
      </uni-forms-item>
    </uni-forms>
    <button type="primary" @click="handleAddExtra">提交新增</button>
  </view>
</template>

<script>
import { addExtra } from "@/api/dortmund/extra";

export default {
  data() {
    return {
      formParams: {
        extraMoney: "",
        isWin: "N",
        winMoney: "",
        extraRemark: "",
      },
      isWinConfig: [
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
        extraMoney: {
          rules: [
            {
              required: true,
              errorMessage: "当前外快总金额不能为空",
            },
          ],
        },
        isWin: {
          rules: [
            {
              required: true,
              errorMessage: "是否盈利不能为空",
            },
          ],
        },
        winMoney: {
          rules: [
            {
              required: true,
              errorMessage: "外快盈亏金额不能为空",
            },
          ],
        },
      },
    };
  },
  onLoad() {},
  onReady() {
    this.$refs.form.setRules(this.rules);
  },
  methods: {
    handleAddExtra() {
      const self = this;
      this.$refs.form.validate().then((valRes) => {
        console.log(valRes);
        addExtra(self.formParams).then((res) => {
          if (res?.code === 200) {
            uni.showToast({
              title: "外快盈亏记录新增成功！",
              icon: "none",
              duration: 1998,
            });
            setTimeout(() => {
              self.$tab.navigateTo("/pages/dortmund/extra/index");
            }, 1023);
          } else {
            uni.showToast({
              title: "外快盈亏记录新增失败！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      });
    },
  },
};
</script>

<style lang="less">
@import url("./add.less");
</style>
