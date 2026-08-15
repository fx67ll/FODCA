<template>
  <view class="fx67ll-form-box">
    <view class="fx67ll-form-content">
      <view class="fx67ll-pre-reference">
        <view class="fx67ll-pre-reference-tip">表单已按上次记录预填，可点击恢复上次数据</view>
        <button class="fx67ll-pre-reference-restore" size="mini" @click="handleRestorePreExtra">恢复上次数据</button>
      </view>
      <uni-forms ref="form" :model="formParams" labelWidth="80px">
        <uni-forms-item label="外快余额" name="extraMoney" required>
          <uni-easyinput v-model="formParams.extraMoney" placeholder="请输入当前外快总金额"
            @input="handleExtraMoneyChangeDubounce" clearable />
        </uni-forms-item>
        <uni-forms-item label="落袋金额" name="saveMoney" required>
          <uni-easyinput v-model="formParams.saveMoney" placeholder="请输入已经落袋为安的盈利金额"
            @input="handleSaveMoneyChangeDubounce" clearable />
        </uni-forms-item>
        <uni-forms-item label="上次落袋">
          <uni-easyinput v-model="preExtraData.saveMoney" placeholder="暂无数据" disabled />
        </uni-forms-item>
        <uni-forms-item label="上次余额">
          <uni-easyinput v-model="preExtraData.extraMoney" placeholder="暂无数据" disabled />
        </uni-forms-item>
        <uni-forms-item label="当前本金" name="seedMoney" required>
          <uni-easyinput v-model="formParams.seedMoney" placeholder="请输入当前本金" @input="handleSeedMoneyChangeDubounce"
            clearable />
        </uni-forms-item>
        <uni-forms-item label="上次本金">
          <uni-easyinput v-model="preExtraData.seedMoney" placeholder="暂无数据" disabled />
        </uni-forms-item>
        <uni-forms-item label="目标盈利" name="targetMoney" required>
          <uni-easyinput v-model="formParams.targetMoney" placeholder="请输入当前冲击的目标盈利" clearable />
        </uni-forms-item>
        <uni-forms-item label="上次目标">
          <uni-easyinput v-model="preExtraData.targetMoney" placeholder="暂无数据" disabled />
        </uni-forms-item>
        <uni-forms-item label="是否盈利" name="isWin" required>
          <uni-data-checkbox v-model="formParams.isWin" :localdata="isWinConfig" @change="handleIsWinChange" />
        </uni-forms-item>
        <uni-forms-item label="盈亏金额" name="winMoney" required>
          <uni-easyinput v-model="formParams.winMoney" placeholder="请输入外快盈亏金额" @input="handleWinMoneyChangeDubounce"
            clearable />
        </uni-forms-item>
        <uni-forms-item label="盈亏备注" name="extraRemark">
          <uni-easyinput type="textarea" v-model="formParams.extraRemark" placeholder="请输入盈亏备注" clearable />
        </uni-forms-item>
      </uni-forms>
      <button type="primary" @click="handleAddExtra">提交新增</button>
    </view>
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
        saveMoney: "0",
        targetMoney: "0",
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
            self.preExtraData = {
              extraMoney: res.rows[0]?.extraMoney || "0",
              seedMoney: res.rows[0]?.seedMoney || "0",
              saveMoney: res.rows[0]?.saveMoney || "0",
              targetMoney: res.rows[0]?.targetMoney || "0",
            };
            self.formParams.seedMoney = res.rows[0]?.seedMoney;
            self.formParams.saveMoney = res.rows[0]?.saveMoney;
            self.formParams.targetMoney = res.rows[0]?.targetMoney;
            // 总金额一并预填，预填后按基准计算一次，保证盈亏金额与是否盈利初始一致
            self.formParams.extraMoney = self.preExtraData.extraMoney;
            self.handleWinMoneyCount(
              self.formParams.extraMoney,
              self.formParams.seedMoney,
              self.preExtraData.extraMoney,
              self.preExtraData.seedMoney
            );
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
    // 一键恢复表单为上次记录的预填数据
    handleRestorePreExtra() {
      this.formParams.extraMoney = this.preExtraData.extraMoney;
      this.formParams.seedMoney = this.preExtraData.seedMoney;
      this.formParams.saveMoney = this.preExtraData.saveMoney;
      this.formParams.targetMoney = this.preExtraData.targetMoney;
      this.handleWinMoneyCount(
        this.formParams.extraMoney,
        this.formParams.seedMoney,
        this.preExtraData.extraMoney,
        this.preExtraData.seedMoney
      );
      uni.showToast({
        title: "已恢复为上次记录数据！",
        icon: "none",
        duration: 1998,
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
    // 盈亏金额手动监听防抖
    handleWinMoneyChangeDubounce: _.debounce(function () {
      this.handleWinMoneyChange();
    }, 444),
    // 盈亏金额手动监听，按正负号重算是否盈利
    handleWinMoneyChange() {
      const winMoney = parseFloat(this.formParams?.winMoney);
      if (!isNaN(winMoney)) {
        this.formParams.isWin = winMoney > 0 ? "Y" : "N";
      }
    },
    // 是否盈利手动监听，与盈亏金额正负不符时弹窗提醒
    handleIsWinChange() {
      const winMoney = parseFloat(this.formParams?.winMoney || 0);
      const isWinByWinMoney = winMoney > 0 ? "Y" : "N";
      if (!isNaN(winMoney) && this.formParams?.isWin !== isWinByWinMoney) {
        uni.showModal({
          title: "逻辑提醒",
          content: "是否盈利与盈亏金额正负不一致，当前填写将被保留，请确认无误！",
          showCancel: false,
        });
      }
    },
    // 落袋金额监听防抖
    handleSaveMoneyChangeDubounce: _.debounce(function () {
      this.handleSaveMoneyChange();
    }, 444),
    // 落袋金额超过历史净盈利时弹窗提醒
    handleSaveMoneyChange() {
      const saveMoney = parseFloat(this.formParams?.saveMoney);
      const netMoney =
        parseFloat(this.formParams?.extraMoney || 0) -
        parseFloat(this.formParams?.seedMoney || 0);
      if (!isNaN(saveMoney) && !isNaN(netMoney) && saveMoney > netMoney) {
        uni.showModal({
          title: "逻辑提醒",
          content: "落袋金额已超过当前历史净盈利（总金额 - 当前本金），请确认填写无误！",
          showCancel: false,
        });
      }
    },
    // 提交前一致性终检，矛盾时二次确认
    checkFormConsistency() {
      const winMoney = parseFloat(this.formParams?.winMoney || 0);
      const isWinByWinMoney = (!isNaN(winMoney) && winMoney > 0) ? "Y" : "N";
      const saveMoney = parseFloat(this.formParams?.saveMoney || 0);
      const netMoney =
        parseFloat(this.formParams?.extraMoney || 0) -
        parseFloat(this.formParams?.seedMoney || 0);
      const warnList = [];
      if (this.formParams?.isWin !== isWinByWinMoney) {
        warnList.push("是否盈利与盈亏金额正负不一致");
      }
      if (!isNaN(saveMoney) && !isNaN(netMoney) && saveMoney > netMoney) {
        warnList.push("落袋金额超过历史净盈利");
      }
      return warnList;
    },
    handleAddExtra() {
      const self = this;
      this.$refs.form.validate().then((valRes) => {
        const warnList = self.checkFormConsistency();
        if (warnList && warnList.length > 0) {
          uni.showModal({
            title: "提交确认",
            content: `检测到以下逻辑不一致：${warnList.join("；")}。是否仍要提交？`,
            success: (modalRes) => {
              if (modalRes?.confirm) {
                self.submitAddExtra();
              }
            },
          });
        } else {
          self.submitAddExtra();
        }
      });
    },
    submitAddExtra() {
      const self = this;
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
    },
  },
};
</script>

<style lang="less">
@import url("./add.less");
</style>
