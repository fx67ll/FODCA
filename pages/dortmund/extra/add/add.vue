<template>
  <view class="fx67ll-form-box">
    <view class="fx67ll-form-content">
      <uni-forms ref="form" :model="formParams" labelWidth="80px">
        <uni-forms-item label="外快余额" name="extraMoney" required>
          <uni-easyinput
            v-model="formParams.extraMoney"
            placeholder="请输入当前外快总金额"
            @input="handleExtraMoneyChangeDubounce"
            clearable
          />
        </uni-forms-item>
        <uni-forms-item label="落袋金额" name="saveMoney" required>
          <uni-easyinput
            v-model="formParams.saveMoney"
            placeholder="请输入已经落袋为安的盈利金额"
            clearable
          />
        </uni-forms-item>
        <uni-forms-item label="上次余额">
          <uni-easyinput
            v-model="preExtraData.extraMoney"
            placeholder="暂无数据"
            disabled
          />
        </uni-forms-item>
        <uni-forms-item label="当前本金" name="seedMoney" required>
          <uni-easyinput
            v-model="formParams.seedMoney"
            placeholder="请输入当前本金"
            @input="handleSeedMoneyChangeDubounce"
            clearable
          />
        </uni-forms-item>
        <uni-forms-item label="上次本金">
          <uni-easyinput
            v-model="preExtraData.seedMoney"
            placeholder="暂无数据"
            disabled
          />
        </uni-forms-item>
        <uni-forms-item label="目标盈利" name="targetMoney" required>
          <uni-easyinput
            v-model="formParams.targetMoney"
            placeholder="请输入当前冲击的目标盈利"
            clearable
          />
        </uni-forms-item>
        <uni-forms-item label="是否盈利" name="isWin" required>
          <uni-data-checkbox
            v-model="formParams.isWin"
            :localdata="isWinConfig"
            disabled
          />
        </uni-forms-item>
        <uni-forms-item label="盈亏金额" name="winMoney" required>
          <uni-easyinput
            v-model="formParams.winMoney"
            placeholder="请输入外快盈亏金额"
            disabled
          />
        </uni-forms-item>
        <uni-forms-item label="盈亏备注" name="extraRemark">
          <uni-easyinput
            type="textarea"
            v-model="formParams.extraRemark"
            placeholder="请输入盈亏备注"
            clearable
          />
        </uni-forms-item>
      </uni-forms>
      <button type="primary" @click="handleAddExtra">提交新增</button></view
    >
    <view class="fx67ll-form-fake" />
  </view>
</template>

<script>
import { addExtra, getExtraList } from "@/api/fx67ll/dortmund/extra";
import _ from "@/node_modules/underscore";

export default {
  data() {
    return {
      formParams: {
        extraMoney: "",
        seedMoney: "",
        saveMoney: "",
        targetMoney: "",
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
        seedMoney: {
          rules: [
            {
              required: true,
              errorMessage: "当前本金不能为空",
            },
          ],
        },
        saveMoney: {
          rules: [
            {
              required: true,
              errorMessage: "已经落袋为安的盈利金额不能为空",
            },
          ],
        },
        targetMoney: {
          rules: [
            {
              required: true,
              errorMessage: "当前冲击的目标盈利不能为空",
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
      preExtraData: {
        extraMoney: "0",
        seedMoney: "0",
      },
    };
  },
  onLoad() {
    this.getPreExtraMoney();
  },
  onReady() {
    this.$refs.form.setRules(this.rules);
  },
  methods: {
    getPreExtraMoney() {
      const self = this;
      const queryParams = {
        pageNum: 1,
        pageSize: 1,
      };
      getExtraList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            self.preExtraData = res.rows[0];
            self.formParams.seedMoney = res.rows[0]?.seedMoney;
            self.formParams.saveMoney = res.rows[0]?.saveMoney;
            self.formParams.targetMoney = res.rows[0]?.targetMoney;
          } else {
            uni.showToast({
              title: "暂无历史外快盈亏记录数据！",
              icon: "none",
              duration: 1998,
            });
          }
        } else {
          uni.showToast({
            title: "查询外快盈亏记录失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    handleExtraMoneyChangeDubounce: _.debounce(function (val) {
      this.handleExtraMoneyChange(val);
    }, 444),
    handleExtraMoneyChange(val) {
      const seedMoney = this.formParams?.seedMoney;
      const preExtraMoney = this.preExtraData?.extraMoney || "0";
      const preSeedMoney = this.preExtraData?.seedMoney || "0";
      if (val && seedMoney && preExtraMoney && preSeedMoney) {
        this.handleWinMoneyCount(val, seedMoney, preExtraMoney, preSeedMoney);
      }
    },
    handleSeedMoneyChangeDubounce: _.debounce(function (val) {
      this.handleSeedMoneyChange(val);
    }, 444),
    handleSeedMoneyChange(val) {
      const extraMoney = this.formParams?.extraMoney;
      const preExtraMoney = this.preExtraData?.extraMoney || "0";
      const preSeedMoney = this.preExtraData?.seedMoney || "0";
      if (val && extraMoney && preExtraMoney && preSeedMoney) {
        this.handleWinMoneyCount(extraMoney, val, preExtraMoney, preSeedMoney);
      }
    },
    handleWinMoneyCount(extraMoney, seedMoney, preExtraMoney, preSeedMoney) {
      const nowWinMoney = (
        parseFloat(extraMoney) -
        parseFloat(seedMoney) -
        (parseFloat(preExtraMoney) - parseFloat(preSeedMoney))
      ).toFixed(2);
      this.formParams.isWin = nowWinMoney > 0 ? "Y" : "N";
      this.formParams.winMoney = nowWinMoney;
    },
    handleAddExtra() {
      const self = this;
      this.$refs.form.validate().then((valRes) => {
        addExtra(self.formParams).then((res) => {
          if (res?.code === 200) {
            uni.showToast({
              title: "外快盈亏记录新增成功！",
              icon: "none",
              duration: 1998,
            });
            setTimeout(() => {
              self.$tab.navigateBack("/pages/dortmund/extra/index/index");
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
