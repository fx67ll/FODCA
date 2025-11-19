<template>
  <zb-drawer
    mode="bottom"
    :title="drawerTitle"
    :wrapperClosable="false"
    :visible.sync="isShowPunchDrawer"
    :radius="true"
    :height="drawerHeight"
  >
    <view class="fx67ll-punch-drawer">
      <view class="fx67ll-punch-item">
        <view class="fx67ll-punch-item-title">打卡类型</view>
        <view class="fx67ll-punch-item-picker">
          <picker @change="punchTypeChange" :value="punchTypeIndex" :range="punchTypeArr">
            <view class="fx67ll-punch-item-text">{{ punchTypeArr[punchTypeIndex] }}</view>
          </picker>
        </view>
      </view>
      <view class="fx67ll-punch-item">
        <view class="fx67ll-punch-item-title">打卡日期</view>
        <view class="fx67ll-punch-item-picker">
          <picker
            mode="date"
            :value="punchDate"
            :start="startPunchDate"
            :end="endPunchDate"
            @change="punchDateChange"
          >
            <view class="fx67ll-punch-item-text">{{ punchDate }}</view>
          </picker>
        </view>
      </view>
      <view class="fx67ll-punch-item">
        <view class="fx67ll-punch-item-title">打卡时间</view>
        <view class="fx67ll-punch-item-picker">
          <picker
            mode="time"
            :value="punchTime"
            start="00:00"
            end="23:59"
            @change="punchTimeChange"
          >
            <view class="fx67ll-punch-item-text">{{ punchTime }}</view>
          </picker>
        </view>
      </view>
      <view class="fx67ll-punch-item-remark">
        <uni-easyinput
          :value="punchRemark"
          type="textarea"
          placeholder="有需要的话可以在这里记录备注~"
          maxlength="1023"
          @input="punchRemarkChange"
        />
      </view>
      <view class="fx67ll-punch-btn">
        <button class="fx67ll-btn-submit" type="primary" @click="submitPunchLogForm">
          {{ isAdd ? "新增" : "修改" }}打卡记录
        </button>
        <button class="fx67ll-btn-cancel" type="warn" @click="closeDrawer">取消</button>
      </view>
    </view>
  </zb-drawer>
</template>

<script>
import { addPunchLog, updatePunchLog } from "@/api/fx67ll/punch/log";

import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

export default {
  props: {
    // 是否显示抽屉
    isShowPunchDrawer: {
      type: Boolean,
      required: true,
      default: false,
    },
    // 是否是新增
    isAdd: {
      type: Boolean,
      required: true,
      default: true,
    },
    // 打卡信息详情
    punchInfo: {
      type: Object,
      required: false,
      default: () => {
        return {};
      },
    },
  },
  data() {
    const currentDate = this.getPunchDate({
      format: true,
    });
    return {
      // 定时器对象
      timer: null,
      // Drawer组件相关参数
      // drawerHeight: "360px",
      drawerHeight: "420px",
      drawerTitle: moment().format("YYYY-MM-DD hh:mm:ss dddd"),
      // 选择器组件相关参数
      punchTypeArr: ["上班打卡", "下班打卡"],
      punchTypeIndex: 0,
      punchDate: currentDate,
      punchTime: moment().format("HH:mm"),
      punchRemark: "",
    };
  },
  watch: {
    isShowPunchDrawer(newValue, oldValue) {
      if (!newValue) {
        // 监听父节点是否需要关闭当前弹窗
        this.$emit("hideDrawer", newValue);
      } else {
        // 每次打开弹窗的时候重新获取当前默认打卡时间和类型
        this.punchTime = moment().format("HH:mm");
        this.getDefaultPunchType();
        this.punchRemark = "";
      }
    },
    punchInfo(newValue, oldValue) {
      if (
        !this.isAdd &&
        newValue?.punchId &&
        newValue?.punchType &&
        newValue?.updateTime
      ) {
        const { punchType, updateTime, punchRemark } = newValue;
        this.punchTypeIndex = punchType === "1" ? 0 : punchType === "2" ? 1 : 2;
        this.punchDate = updateTime.substr(0, 10);
        this.punchTime = updateTime.substring(11, 16);
        this.punchRemark = punchRemark || "";
      }
    },
  },
  computed: {
    startPunchDate() {
      return this.getPunchDate("start");
    },
    endPunchDate() {
      return this.getPunchDate("end");
    },
  },
  mounted() {
    // moment初始汉化
    moment.locale("zh-cn");
    // 显示当前时间
    this.showNowTime();
  },
  destroyed() {
    // 销毁时清除定时器
    clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    // 显示当前时间
    showNowTime() {
      const self = this;
      this.timer = setInterval(() => {
        self.drawerTitle = moment().format("YYYY-MM-DD hh:mm:ss dddd");
      }, 1000);
    },
    // 切换打卡类型
    punchTypeChange: function (e) {
      console.log("picker发送选择改变，携带值为", e.detail.value);
      this.punchTypeIndex = e.detail.value;
    },
    // 获取默认打卡类型
    getDefaultPunchType() {
      const currentTime = moment();
      const noon = moment().hour(12).minute(0).second(0);
      if (currentTime.isBefore(noon)) {
        this.punchTypeIndex = 0;
      } else {
        this.punchTypeIndex = 1;
      }
    },
    // 切换打卡日期
    punchDateChange: function (e) {
      this.punchDate = e.detail.value;
    },
    // 切换打卡时间
    punchTimeChange: function (e) {
      this.punchTime = e.detail.value;
    },
    // 输入打卡备注
    punchRemarkChange: function (e) {
      this.punchRemark = e;
    },
    // 获取打卡日期
    getPunchDate(type) {
      const date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();

      if (type === "start") {
        year = year - 60;
      } else if (type === "end") {
        year = year + 2;
      }
      month = month > 9 ? month : "0" + month;
      day = day > 9 ? day : "0" + day;
      return `${year}-${month}-${day}`;
    },
    // 新增或修改打卡记录
    submitPunchLogForm() {
      const self = this;
      const formParams = {
        punchType: (parseInt(self.punchTypeIndex, 10) + 1).toString(),
        // updateTime: `${self.punchDate} ${self.punchTime}:${moment().format("ss")}`,
        updateTime: `${self.punchDate} ${self.punchTime}:00`,
        punchRemark: self.punchRemark,
      };
      const punchParams = self.isAdd
        ? formParams
        : {
            ...self.punchInfo,
            ...formParams,
          };
      if (self.isAdd) {
        addPunchLog(punchParams).then((res) => {
          self.isNetworkLoading = false;
          if (res?.code === 200) {
            self.closeDrawer();
            uni.showToast({
              title: "打卡时间记录成功！",
              icon: "none",
              duration: 1998,
            });
          } else {
            uni.showToast({
              title: "打卡时间记录失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      } else {
        updatePunchLog(punchParams).then((res) => {
          self.isNetworkLoading = false;
          if (res?.code === 200) {
            self.closeDrawer();
            uni.showToast({
              title: "修改成功！",
              icon: "none",
              duration: 1998,
            });
            self.$emit("reloadPunchList");
          } else {
            uni.showToast({
              title: "修改失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      }
    },
    // 关闭当前弹窗
    closeDrawer() {
      this.$emit("hideDrawer", false);
    },
  },
};
</script>

<style lang="less">
@import url("./punchDrawer.less");
</style>
