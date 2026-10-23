<template>
  <view class="fx67ll-form-box">
    <view class="fx67ll-form-content">
      <uni-forms ref="form" :model="formParams" labelWidth="80px">
        <uni-forms-item label="外快余额" name="extraMoney" required>
          <uni-easyinput v-model="formParams.extraMoney" placeholder="请输入当前外快总金额"
            @input="handleExtraMoneyChangeDubounce" clearable />
        </uni-forms-item>
        <uni-forms-item label="上次余额">
          <uni-easyinput v-model="preExtraData.extraMoney" placeholder="暂无数据" disabled />
        </uni-forms-item>
        <uni-forms-item label="是否盈利" name="isWin" required>
          <uni-data-checkbox v-model="formParams.isWin" :localdata="isWinConfig" @change="handleIsWinChange" />
        </uni-forms-item>
        <uni-forms-item label="盈亏金额" name="winMoney" required>
          <uni-easyinput v-model="formParams.winMoney" placeholder="请输入外快盈亏金额" @input="handleWinMoneyChangeDubounce"
            clearable />
        </uni-forms-item>
        <uni-forms-item label="当前本金" name="seedMoney" required>
          <uni-easyinput v-model="formParams.seedMoney" placeholder="请输入当前本金" clearable />
        </uni-forms-item>
        <uni-forms-item label="上次本金">
          <uni-easyinput v-model="preExtraData.seedMoney" placeholder="暂无数据" disabled />
        </uni-forms-item>
        <uni-forms-item label="落袋金额" name="saveMoney" required>
          <uni-easyinput v-model="formParams.saveMoney" placeholder="请输入已经落袋为安的盈利金额"
            @input="handleSaveMoneyChangeDubounce" clearable />
        </uni-forms-item>
        <uni-forms-item label="上次落袋">
          <uni-easyinput v-model="preExtraData.saveMoney" placeholder="暂无数据" disabled />
        </uni-forms-item>
        <uni-forms-item label="目标盈利" name="targetMoney" required>
          <uni-easyinput v-model="formParams.targetMoney" placeholder="请输入当前冲击的目标盈利" clearable />
        </uni-forms-item>
        <uni-forms-item label="上次目标">
          <uni-easyinput v-model="preExtraData.targetMoney" placeholder="暂无数据" disabled />
        </uni-forms-item>
        <uni-forms-item label="盈亏备注" name="extraRemark">
          <uni-easyinput type="textarea" v-model="formParams.extraRemark" placeholder="请输入盈亏备注" clearable />
        </uni-forms-item>
      </uni-forms>
      <!-- 操作按钮区域 -->
      <view class="fx67ll-form-footer">
        <button class="fx67ll-reset-btn" type="warn" @click="handleRestorePreExtra">重置</button>
        <button class="fx67ll-add-btn" type="primary" @click="handleAddExtra">提交新增</button>
      </view>
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
            // 总金额一并预填，预填后按基准计算一次，保证盈亏金额与是否盈利初始一致（本次未变动时盈亏为0，按持平处理）
            self.formParams.extraMoney = self.preExtraData.extraMoney;
            self.handleWinMoneyCount();
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
      this.handleWinMoneyCount();
      uni.showToast({
        title: "已恢复为上次记录数据！",
        icon: "none",
        duration: 1998,
      });
    },
    // 外快总额监听防抖
    handleExtraMoneyChangeDubounce: _.debounce(function (val) {
      this.handleExtraMoneyChange(val);
    }, 444),
    // 外快总额监听
    handleExtraMoneyChange(val) {
      if (val !== "" && val != null) {
        // 手动输入的总金额补齐两位小数后再参与联动计算
        this.formParams.extraMoney = this.padMoneyToTwoDecimal(val);
        this.handleWinMoneyCount();
      }
    },
    // 金额统一补齐两位小数，无法解析为数字时原样返回
    padMoneyToTwoDecimal(val) {
      const money = parseFloat(val);
      return isNaN(money) ? val : money.toFixed(2);
    },
    // 计算上次记录的历史净盈利基准（移动端仅新增模式，直接取最新一条记录）
    calcPreNetMoney() {
      return (
        parseFloat(this.preExtraData?.extraMoney || 0) -
        parseFloat(this.preExtraData?.seedMoney || 0)
      );
    },
    // 按当前表单计算盈亏金额（以最新记录为基准）
    calcWinMoneyByForm() {
      return (
        parseFloat(this.formParams?.extraMoney || 0) -
        parseFloat(this.formParams?.seedMoney || 0) -
        this.calcPreNetMoney()
      ).toFixed(2);
    },
    // 按当前表单盈亏金额反推总金额（历史净盈利基准 + 当前本金 + 盈亏金额）
    calcExtraMoneyByForm() {
      return (
        parseFloat(this.formParams?.winMoney || 0) +
        parseFloat(this.formParams?.seedMoney || 0) +
        this.calcPreNetMoney()
      ).toFixed(2);
    },
    // 计算当前表单各类金额
    handleWinMoneyCount() {
      const nowWinMoney = this.calcWinMoneyByForm();
      this.formParams.isWin = parseFloat(nowWinMoney) > 0 ? "Y" : "N";
      this.formParams.winMoney = nowWinMoney;
    },
    // 盈亏金额手动监听防抖
    handleWinMoneyChangeDubounce: _.debounce(function () {
      this.handleWinMoneyChange();
    }, 444),
    // 盈亏金额手动监听，补齐两位小数后按正负号重算是否盈利，并按历史数据反推总金额
    handleWinMoneyChange() {
      const winMoney = parseFloat(this.formParams?.winMoney);
      if (!isNaN(winMoney)) {
        this.formParams.winMoney = this.padMoneyToTwoDecimal(this.formParams.winMoney);
        this.formParams.isWin = parseFloat(this.formParams.winMoney) > 0 ? "Y" : "N";
        this.formParams.extraMoney = this.calcExtraMoneyByForm();
      }
    },
    // 是否盈利手动监听，与盈亏金额正负不符时弹窗提醒，不保留时回退为按盈亏金额推导的值
    handleIsWinChange() {
      const winMoney = parseFloat(this.formParams?.winMoney || 0);
      const derivedIsWin = (!isNaN(winMoney) && winMoney > 0) ? "Y" : "N";
      if (!isNaN(winMoney) && this.formParams?.isWin !== derivedIsWin) {
        uni.showModal({
          title: "逻辑提醒",
          content: "是否盈利与盈亏金额正负不符，是否保留当前手动选择？",
          success: (modalRes) => {
            if (!modalRes?.confirm) {
              this.formParams.isWin = derivedIsWin;
            }
          },
        });
      }
    },
    // 落袋金额监听防抖
    handleSaveMoneyChangeDubounce: _.debounce(function () {
      this.handleSaveMoneyChange();
    }, 444),
    // 落袋金额数值校验提醒：为0时无需校验，负数不可能，历史净盈利为负时只能为0，否则不能超过历史净盈利
    handleSaveMoneyChange() {
      const saveMoney = parseFloat(this.formParams?.saveMoney);
      if (isNaN(saveMoney) || saveMoney === 0) {
        return;
      }
      if (saveMoney < 0) {
        uni.showToast({
          title: "落袋金额不可能为负数，请确认填写无误！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      const netMoney =
        parseFloat(this.formParams?.extraMoney || 0) -
        parseFloat(this.formParams?.seedMoney || 0);
      if (isNaN(netMoney)) {
        return;
      }
      if (netMoney < 0) {
        uni.showToast({
          title: "历史净盈利为负数（总金额 - 当前本金 < 0），落袋金额只能为0，请确认填写无误！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      if (saveMoney > netMoney) {
        uni.showToast({
          title: "落袋金额已超过当前历史净盈利（总金额 - 当前本金），请确认填写无误！",
          icon: "none",
          duration: 1998,
        });
      }
    },
    // 提交前一致性终检，返回矛盾提示列表
    checkFormConsistency() {
      const warnList = [];
      const winMoney = parseFloat(this.formParams?.winMoney || 0);
      const derivedIsWin = (!isNaN(winMoney) && winMoney > 0) ? "Y" : "N";
      if (this.formParams?.isWin !== derivedIsWin) {
        warnList.push("是否盈利与盈亏金额正负不一致");
      }
      const saveMoney = parseFloat(this.formParams?.saveMoney);
      if (!isNaN(saveMoney) && saveMoney !== 0) {
        if (saveMoney < 0) {
          warnList.push("落袋金额不可能为负数");
        } else {
          const netMoney =
            parseFloat(this.formParams?.extraMoney || 0) -
            parseFloat(this.formParams?.seedMoney || 0);
          if (!isNaN(netMoney)) {
            if (netMoney < 0) {
              warnList.push("历史净盈利为负数，落袋金额只能为0");
            } else if (saveMoney > netMoney) {
              warnList.push("落袋金额超过历史净盈利");
            }
          }
        }
      }
      return warnList;
    },
    handleAddExtra() {
      const self = this;
      this.$refs.form.validate().then((valRes) => {
        // 提交前统一校验并补齐总金额与盈亏金额两位小数
        self.formParams.extraMoney = self.padMoneyToTwoDecimal(self.formParams.extraMoney);
        self.formParams.winMoney = self.padMoneyToTwoDecimal(self.formParams.winMoney);
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
