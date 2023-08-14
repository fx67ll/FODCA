<template>
  <view class="fx67ll-tools-box">
    <div class="fx67ll-btn-box">
      <!-- 
			1. 优化大乐透的选号方案，是否严格限制重复号码
			2. 添加设置，当日幸运数字，输入之后必须出现在随机号码中
			3. 幸运按钮点击之后，添加一个动画效果，然后展示今天是否适合买彩票，虽然永远不会用，但是我想做一个这个功能
			4. 完成彩票的基础功能的之后，重新开一个项目做一个fx67ll的App，添加之前一直想做的，在地图上记录行踪的功能
			-->

      <div class="fx67ll-btn-item fx67ll-btn-item-two">
        <button
          class="fx67ll-btn-default"
          type="default"
          @click="getLuckyNumber"
          :disabled="countLoading || isDrawLoading"
        >
          获取今日随机号码
        </button>
        <uni-icons
          class="fx67ll-btn-icon"
          type="gear-filled"
          :size="iconSize"
          @click="editLuckySetting"
          v-if="!countLoading && !isDrawLoading"
        ></uni-icons>
        <uni-icons
          class="fx67ll-btn-loading"
          type="spinner-cycle"
          :size="iconSize"
          v-if="countLoading || isDrawLoading"
        ></uni-icons>
      </div>
      <div class="fx67ll-btn-item fx67ll-btn-item-two">
        <button
          class="fx67ll-btn-default"
          type="default"
          @click="importLuckyImg"
          :disabled="countLoading || isDrawLoading"
        >
          上传照片自动分析
        </button>
        <uni-icons
          class="fx67ll-btn-icon"
          type="camera-filled"
          :size="iconSize"
          @click="useCamera"
          v-if="!countLoading && !isDrawLoading"
        ></uni-icons>
        <uni-icons
          class="fx67ll-btn-loading"
          type="spinner-cycle"
          :size="iconSize"
          v-if="countLoading || isDrawLoading"
        ></uni-icons>
      </div>
      <div class="fx67ll-btn-item" v-if="!isDrawLoading">
        <button class="fx67ll-btn-default" type="warn" @click="fakeDrawLottery(true)">
          {{ drawLottoryText }}
        </button>
      </div>
      <div class="fx67ll-btn-item fx67ll-btn-item-two" v-if="isDrawLoading">
        <button
          class="fx67ll-btn-default"
          type="warn"
          @click="fakeDrawLottery(true)"
          :disabled="isDrawLoading"
        >
          {{ drawLottoryText }}
        </button>
        <uni-icons
          class="fx67ll-btn-icon"
          type="minus"
          :size="iconSize"
          @click="stopDrawLottory"
        ></uni-icons>
      </div>
      <div class="fx67ll-btn-item">
        <button
          class="fx67ll-btn-default"
          type="warn"
          @click="getTodayLucky"
          :disabled="countLoading"
        >
          {{
            !countLoading
              ? "点击看看今天运势如何"
              : `正在为您计算今日运势：${luckyRandomProgrss}%`
          }}
        </button>
      </div>
    </div>
    <div class="fx67ll-lucky-box" v-if="settingInfo.todayLuckyNumber">
      <div class="fx67ll-lucky-bumber">{{ settingInfo.todayLuckyNumber }}</div>
      <div class="fx67ll-lucky-title">今日推荐幸运数字</div>
    </div>

    <!-- 页面底部抽屉 -->
    <zb-drawer
      mode="bottom"
      :title="drawerTitle"
      :wrapperClosable="false"
      :visible.sync="isShowDrawer"
      :radius="true"
      :height="drawerHeight"
    >
      <div v-if="showType === 'luckyNumber'">
        <div id="luckyNumberText" class="fx67ll-number-box">
          <div
            class="fx67ll-number-item"
            v-for="item in luckyNumberList"
            :key="item.timeStamp"
          >
            <!-- #ifdef H5 -->
            <span
              v-for="(redNum, j) in item.lottoryNumberFirst"
              :key="Math.random() * redNum + j"
              >{{ redNum }}</span
            >
            -
            <span
              v-for="(blueNum, k) in item.lottoryNumberSecond"
              :key="Math.random() * blueNum + k"
              >{{ blueNum }}</span
            >
            <!-- #endif -->
            <!-- #ifdef MP-WEIXIN -->
            <span v-for="itemFirst in item.lottoryNumberFirst" :key="itemFirst.key">{{
              itemFirst.num
            }}</span>
            -
            <span v-for="itemSecond in item.lottoryNumberSecond" :key="itemSecond.key">{{
              itemSecond.num
            }}</span>
            <!-- #endif -->
          </div>
        </div>
        <!-- #ifdef H5 -->
        <button
          class="fx67ll-btn-submit fx67ll-btn-submit-h5"
          type="primary"
          @click="copyLuckyNumber"
        >
          拷贝至剪切板
        </button>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <button class="fx67ll-btn-submit" type="primary" @click="copyLuckyNumber">
          拷贝至剪切板
        </button>
        <!-- #endif -->
      </div>

      <div
        class="fx67ll-drawer-img"
        v-if="showType === 'luckyPhoto' && lottoryTicketArr.length > 0"
      >
        <!-- <uni-icons class="fx67ll-img-icon" type="trash" size="24" color="#BFBFBF" @click="deleteImportImg"></uni-icons> -->
        <img
          class="fx67ll-img-lottory"
          :src="lottoryTicketArr[0]"
          @click="previewImportImg"
        />
      </div>

      <div class="fx67ll-drawer-setting" v-if="showType === 'luckySetting'">
        <div class="fx67ll-setting-item">
          <span>需要随机输出的注数</span>
          <uni-number-box
            :min="1"
            :max="5"
            v-model="settingInfo.luckyCount"
            @change="luckyCountChange"
          ></uni-number-box>
        </div>
        <div class="fx67ll-setting-item">
          <span>是否允许出现重复串号</span>
          <switch
            class="fx67ll-setting-switch"
            :checked="settingInfo.isNeedRepeat"
            @change="isNeedRepeatChange"
          />
        </div>
        <div class="fx67ll-setting-item">
          <span>当日幸运数字是否要包含在内</span>
          <switch
            class="fx67ll-setting-switch"
            :checked="settingInfo.isNeedLuckyNumber"
            @change="isNeedLuckyNumberChange"
          />
        </div>
        <div class="fx67ll-setting-item">
          <span>当日是否仅允许生成一次随机</span>
          <switch
            class="fx67ll-setting-switch"
            :checked="settingInfo.isOnlyFirstToday"
            @change="isOnlyFirstTodayChange"
          />
        </div>
        <div class="fx67ll-setting-tip">
          Tip-1：修改其他设置会重置
          <text>"当日是否仅允许生成一次随机"</text> 设置，请手动重新配置即可
        </div>
        <div class="fx67ll-setting-tip">
          Tip-2：摇奖设置会自动保存到本地，本地缓存会有丢失风险，请按需保存到云端
        </div>
        <!-- #ifdef H5 -->
        <button
          class="fx67ll-btn-submit fx67ll-btn-submit-h5"
          type="primary"
          @click="saveLuckySetting(false)"
        >
          保存设置到云端
        </button>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <button class="fx67ll-btn-submit" type="primary" @click="saveLuckySetting(false)">
          保存设置到云端
        </button>
        <!-- #endif -->
      </div>
    </zb-drawer>
  </view>
</template>

<script>
// 官方组件库
import uniIcons from "@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue";
import uniNumberBox from "@/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue";
// underscores函数库
import _ from "@/node_modules/underscore";
// 日期时间处理
import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";
// 快速排序
import { quickSort } from "@/utils/index.js";
// lottery相关api
import { getSetting, updateSetting } from "@/api/lottery/setting";
export default {
  components: {
    uniIcons,
    uniNumberBox,
  },
  data() {
    return {
      // 按钮图标大小
      iconSize: 32,
      // 定时器对象
      timer: null,
      // 今日星期几
      todayWeek: moment().format("E"),
      // todayWeek: '4',
      // Drawer组件相关参数
      isShowDrawer: false,
      drawerHeight: "75%",
      drawerTitle: moment().format("YYYY-MM-DD hh:mm:ss dddd"),
      showType: "",
      // SSQ红蓝球
      luckyNumberRed: [],
      luckyNumberBlue: [],
      // DLT前后区
      luckyNumberFront: [],
      luckyNumberBack: [],
      // 今日随机号码
      luckyNumberList: [],
      // SSQ固定追号配置，后期开放自定义固定追号
      luckyNumberSSQ: {
        timeStamp: new Date().getTime(),
        lottoryNumberFirst: [1, 4, 5, 8, 10, 23],
        lottoryNumberSecond: [5],
      },
      // DLT固定追号配置，后期开放自定义固定追号
      luckyNumberDLT: {
        timeStamp: new Date().getTime(),
        lottoryNumberFirst: [4, 7, 8, 10, 23],
        lottoryNumberSecond: [4, 9],
      },
      // 需要拷贝到剪切板的内容
      copyTextContent: "",
      // 照片数组
      lottoryTicketArr: [],
      idImgArrBack: [],
      // 设置相关参数
      settingInfo: {
        // 输出注数
        luckyCount: 5,
        // 是否允许重复
        isNeedRepeat: false,
        // 当日是否只允许出现一注随机号码，打开开关后需要缓存当前第一注
        isOnlyFirstToday: false,
        firstRandomDate: null,
        localLuckyNumberList: [],
        // 当日幸运数字是否必须出现在当日随机号码中
        isNeedLuckyNumber: false,
        todayLuckyNumber: null,
        luckyNumberDate: null,
        // 每天只允许点击一次是否幸运，并且判断当日点击后计算是否完成，未完成就退出下次进入允许重新点击
        firstLuckyDate: null,
        isCheckLuckyOver: false,
        todayLuckyText: null,
        luckyClickTotal: 0,
        // 模拟摇奖，包括中奖耗时，暂停摇奖，继续摇奖，以及中奖号码
        drawLottoryTimeHistory: 0,
        isGetBigReward: false,
        bigRewardNumber: null,
      },
      // 幸运进度条
      luckyRandomProgrss: 0,
      // 达成幸运百分百的次数
      luckyProgrssCount: 0,
      // 计算是否幸运的定时器
      luckyTimer: null,
      // 是否正在运算
      countLoading: false,
      // 计时开始
      countStartTime: null,
      // 模拟摇奖的定时器
      fakeDrawTimer: null,
      // 模拟摇奖计时
      drawLottoryText: "模拟摇奖",
      // 是否正在模拟
      isDrawLoading: false,
      // 模拟摇奖计时
      drawLottoryTime: 0,
    };
  },
  onLoad() {
    // moment初始汉化
    moment.locale("zh-cn");
    // 初始化随机号码
    this.initLuckyNumber();
    // 初始化缓存设置
    this.initCacheSetting();
  },
  onShow() {
    // 显示当前时间
    this.showNowTime();
  },
  onHide() {
    // 销毁时清除定时器
    clearInterval(this.timer);
    clearTimeout(this.luckyTimer);
    clearTimeout(this.fakeDrawTimer);
    this.timer = null;
    this.luckyTimer = null;
    this.fakeDrawTimer = null;
    // 隐藏时停止计时
    if (this.isDrawLoading) {
      this.stopDrawLottory();
    }
  },
  onUnload() {
    // 销毁时清除定时器
    clearInterval(this.timer);
    clearTimeout(this.luckyTimer);
    clearTimeout(this.fakeDrawTimer);
    this.timer = null;
    this.luckyTimer = null;
    this.fakeDrawTimer = null;
    // 隐藏时停止计时
    if (this.isDrawLoading) {
      this.stopDrawLottory();
    }
  },
  methods: {
    // 保存设置到服务端
    // noToast，默认不用传，传true表示不会提示保存成功或失败的信息，传false表示正常提示
    saveLuckySetting(noToast) {
      const self = this;
      const updateParams = {
        settingId: 1,
        lotterySetting: JSON.stringify(this.settingInfo),
      };
      updateSetting(updateParams).then((res) => {
        if (res?.code === 200) {
          if (!noToast) {
            uni.showToast({
              title: "摇奖设置以成功保存到云端啦~",
              icon: "none",
              duration: 1998,
            });
          }
        } else {
          if (!noToast) {
            uni.showToast({
              title: "摇奖设置保存到云端失败！",
              icon: "none",
              duration: 1998,
            });
          }
        }
        if (!noToast) {
          self.isShowDrawer = false;
        }
      });
    },
    // 从服务端初始化之前的摇奖设置
    initCacheSetting() {
      const self = this;
      getSetting().then((res) => {
        if (res?.code === 200 && res?.data) {
          const lotterySetting = res?.data?.lotterySetting;
          const settingInfo = JSON.parse(lotterySetting) || {};
          if (_.has(settingInfo, "luckyNumberDate")) {
            self.settingInfo = {
              ...settingInfo,
            };
            // 如果打开了只允许一注随机则需要重新渲染当日的随机号码
            if (
              self.settingInfo.isOnlyFirstToday &&
              self.settingInfo.firstRandomDate === moment().format("YYYY-MM-DD")
            ) {
              self.luckyNumberList = self.settingInfo.localLuckyNumberList;
            }
            // 初始化完缓存配置项后初始化今日幸运数字
            self.initTodayLuckyNumber(settingInfo.luckyNumberDate);
            // 初始化模拟摇奖配置
            self.initDrawLottory();
          } else {
            // 初始化完缓存配置项后初始化今日幸运数字
            self.initTodayLuckyNumber(null);
          }
        } else {
          // 如果云端摇奖设置获取失败，则自动加载本地摇奖设置
          this.initCacheSettingLocal();
          uni.showToast({
            title: "获取云端摇奖设置失败！已为您自动加载本地摇奖设置~",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    // 本地缓存摇奖设置
    saveLuckySettingLocal() {
      // 本地缓存的时候默认也存一下云端
      this.saveLuckySetting(true);

      // #ifdef H5
      localStorage.setItem("settingInfo", JSON.stringify(this.settingInfo));
      // #endif

      // 微信端不支持localStorage
      // #ifdef MP-WEIXIN
      wx.setStorage({
        key: "settingInfo",
        data: JSON.stringify(this.settingInfo),
      });
      // #endif
    },
    // 从本地缓存里初始化之前的摇奖设置
    initCacheSettingLocal() {
      const self = this;
      // #ifdef H5
      if (localStorage.getItem("settingInfo")) {
        let settingInfo = JSON.parse(localStorage.getItem("settingInfo"));
        this.settingInfo = {
          ...settingInfo,
        };
        // 如果打开了只允许一注随机则需要重新渲染当日的随机号码
        if (
          this.settingInfo.isOnlyFirstToday &&
          this.settingInfo.firstRandomDate === moment().format("YYYY-MM-DD")
        ) {
          this.luckyNumberList = this.settingInfo.localLuckyNumberList;
        }
        // 初始化完缓存配置项后初始化今日幸运数字
        this.initTodayLuckyNumber(settingInfo.luckyNumberDate);
        // 初始化模拟摇奖配置
        this.initDrawLottory();
      } else {
        // 初始化完缓存配置项后初始化今日幸运数字
        this.initTodayLuckyNumber(null);
      }
      // #endif

      // 微信端不支持localStorage
      // #ifdef MP-WEIXIN
      wx.getStorage({
        key: "settingInfo",
        success: function (res) {
          let settingInfo = JSON.parse(res.data);
          self.settingInfo = {
            ...settingInfo,
          };
          // 如果打开了只允许一注随机则需要重新渲染当日的随机号码
          if (
            self.settingInfo.isOnlyFirstToday &&
            self.settingInfo.firstRandomDate === moment().format("YYYY-MM-DD")
          ) {
            self.luckyNumberList = self.settingInfo.localLuckyNumberList;
          }
          // 初始化完缓存配置项后初始化今日幸运数字
          self.initTodayLuckyNumber(settingInfo.luckyNumberDate);
          // 初始化模拟摇奖配置
          self.initDrawLottory();
        },
        fail: function () {
          // 如果第一次进入没有缓存配置，仍然需要生成当日幸运数字
          self.initTodayLuckyNumber(null);
        },
      });
      // #endif
    },
    // 显示今日随机号码
    getLuckyNumber() {
      if (this.todayWeek === "5") {
        uni.showToast({
          title: "非常抱歉，今天是星期五，不提供随机号码选择~",
          icon: "none",
          duration: 1998,
        });
      } else {
        this.showType = "luckyNumber";
        // 是否允许再次生成随机号码
        if (this.checkIsOnlyFirstTodayConfig()) {
          this.packageRandomList();
          this.settingInfo.firstRandomDate = moment().format("YYYY-MM-DD");
          this.saveLuckySettingLocal();
        }
        // #ifdef H5
        this.drawerHeight = `${170 + this.settingInfo.luckyCount * 30 + 50}px`;
        // #endif
        // #ifdef MP-WEIXIN
        this.drawerHeight = `${200 + this.settingInfo.luckyCount * 30}px`;
        // #endif
        this.isShowDrawer = true;
      }
    },
    // 判断当日是否只允许出现一注随机号码的配置是否生效
    // 先判断，是否配置了只显示当日第一注随机号码，则不再重复生成随机号码
    // 再判断，如果配了只生成随机一注，则再判断当天是否生成过
    checkIsOnlyFirstTodayConfig() {
      if (this.settingInfo.isOnlyFirstToday) {
        if (this.settingInfo.firstRandomDate !== moment().format("YYYY-MM-DD")) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },
    // 从奖池中摇奖
    rollNumber(luckyList, numberList, count) {
      let tempLucky = [...luckyList];
      let tempNumber = [...numberList];
      let randomIndex = Math.floor(Math.random() * tempNumber.length);
      tempLucky.push(tempNumber[randomIndex]);
      tempLucky = quickSort(tempLucky);
      tempNumber.splice(randomIndex, 1);
      count--;
      if (count > 0) {
        return this.rollNumber(tempLucky, tempNumber, count);
      } else {
        let checkResArr = this.checkSameNumber(tempLucky);
        if (checkResArr && checkResArr.length !== 0) {
          return tempLucky;
        } else {
          if (tempLucky.length === 6) {
            return this.rollNumber([], this.luckyNumberRed, tempLucky.length);
          }
          if (tempLucky.length === 1) {
            return this.rollNumber([], this.luckyNumberBlue, tempLucky.length);
          }
          if (tempLucky.length === 5) {
            return this.rollNumber([], this.luckyNumberFront, tempLucky.length);
          }
          if (tempLucky.length === 2) {
            return this.rollNumber([], this.luckyNumberBack, tempLucky.length);
          }
        }
      }
    },
    // 检查后半区是否有重复号码
    checkSameNumber(numberList) {
      let isSameNumber = false;
      let tempList = [...numberList];
      if (!this.settingInfo.isNeedRepeat) {
        for (var i = 0; i < this.luckyNumberList.length; i++) {
          // #ifdef H5
          if (
            _.isEqual(tempList, this.luckyNumberList[i].lottoryNumberFirst) ||
            _.isEqual(tempList, this.luckyNumberList[i].lottoryNumberSecond)
          ) {
            isSameNumber = true;
          }
          // #endif
          // #ifdef MP-WEIXIN
          if (_.isEqual(tempList, [this.luckyNumberList[i].lottoryNumberSecond[0].num])) {
            isSameNumber = true;
          }
          // #endif
        }
      }
      if (isSameNumber) {
        return [];
      } else {
        return tempList;
      }
    },
    // 组装今今日随机号码
    packageRandomList() {
      this.luckyNumberList = [];
      if (this.todayWeek === "1" || this.todayWeek === "3" || this.todayWeek === "6") {
        // #ifdef H5
        this.luckyNumberList.push(this.luckyNumberDLT);
        // #endif
        // #ifdef MP-WEIXIN
        this.luckyNumberList.push(this.packageTempObjForWX(this.luckyNumberDLT));
        // #endif
        for (var i = 0; i < this.settingInfo.luckyCount - 1; i++) {
          // #ifdef H5
          this.luckyNumberList.push(this.packageTempObj("DLT", i));
          // #endif
          // #ifdef MP-WEIXIN
          this.luckyNumberList.push(
            this.packageTempObjForWX(this.packageTempObj("DLT", i))
          );
          // #endif
        }
      }
      if (this.todayWeek === "2" || this.todayWeek === "4" || this.todayWeek === "7") {
        // #ifdef H5
        this.luckyNumberList.push(this.luckyNumberSSQ);
        // #endif
        // #ifdef MP-WEIXIN
        this.luckyNumberList.push(this.packageTempObjForWX(this.luckyNumberSSQ));
        // #endif
        for (var i = 0; i < this.settingInfo.luckyCount - 1; i++) {
          // #ifdef H5
          this.luckyNumberList.push(this.packageTempObj("SSQ", i));
          // #endif
          // #ifdef MP-WEIXIN
          this.luckyNumberList.push(
            this.packageTempObjForWX(this.packageTempObj("SSQ", i))
          );
          // #endif
        }
      }
      // 如果打开了只允许一注随机则需要缓存当日的随机号码
      if (this.settingInfo.isOnlyFirstToday) {
        this.settingInfo.localLuckyNumberList = this.luckyNumberList;
        this.saveLuckySettingLocal();
      }
      // 如果打开了需要包含当日幸运数字就需要重新摇号
      if (!this.checkHasTodayLuckyNumber()) {
        this.packageRandomList();
      }
    },
    // 判断是否包含当日的幸运数字
    checkHasTodayLuckyNumber() {
      const self = this;
      if (this.settingInfo.isNeedLuckyNumber) {
        let hasTodayLuckyNumber = false;
        this.luckyNumberList.forEach(function (item) {
          item.lottoryNumberFirst.forEach(function (ita) {
            // #ifdef H5
            if (
              JSON.stringify(ita) === JSON.stringify(self.settingInfo.todayLuckyNumber)
            ) {
              hasTodayLuckyNumber = true;
            }
            // #endif
            // #ifdef MP-WEIXIN
            if (
              JSON.stringify(ita.num) ===
              JSON.stringify(self.settingInfo.todayLuckyNumber)
            ) {
              hasTodayLuckyNumber = true;
            }
            // #endif
          });
          item.lottoryNumberSecond.forEach(function (itb) {
            // #ifdef H5
            if (
              JSON.stringify(itb) === JSON.stringify(self.settingInfo.todayLuckyNumber)
            ) {
              hasTodayLuckyNumber = true;
            }
            // #endif
            // #ifdef MP-WEIXIN
            if (
              JSON.stringify(itb.num) ===
              JSON.stringify(self.settingInfo.todayLuckyNumber)
            ) {
              hasTodayLuckyNumber = true;
            }
            // #endif
          });
        });
        return hasTodayLuckyNumber;
      } else {
        return true;
      }
    },
    // 特供微信处理包装单条随机号码，微信小程序不支持key使用表达式，包装一下再渲染
    packageTempObjForWX(numberObj) {
      let tempFirst = [];
      let tempSecond = [];
      let tempObj = {
        ...numberObj,
      };
      _.each(tempObj.lottoryNumberFirst, function (ita, ina) {
        let temObj = {
          num: ita,
          key: Math.random() * ita + ina,
        };
        tempFirst.push(temObj);
      });
      _.each(tempObj.lottoryNumberSecond, function (itb, inb) {
        let temObj = {
          num: itb,
          key: Math.random() * itb + inb,
        };
        tempSecond.push(temObj);
      });
      tempObj.lottoryNumberFirst = tempFirst;
      tempObj.lottoryNumberSecond = tempSecond;
      return tempObj;
    },
    // 包装单条随机号码
    packageTempObj(type, mix) {
      let objTemp = {
        timeStamp: new Date().getTime() + mix,
        lottoryNumberFirst: [],
        lottoryNumberSecond: [],
      };
      if (type === "DLT") {
        objTemp.lottoryNumberFirst = this.rollNumber([], this.luckyNumberFront, 5);
        objTemp.lottoryNumberSecond = this.rollNumber([], this.luckyNumberBack, 2);
      }
      if (type === "SSQ") {
        objTemp.lottoryNumberFirst = this.rollNumber([], this.luckyNumberRed, 6);
        objTemp.lottoryNumberSecond = this.rollNumber([], this.luckyNumberBlue, 1);
      }
      return objTemp;
    },
    // 复制给发给彩票店老板的内容
    copyLuckyNumber() {
      const self = this;
      let luckyTitle = "";
      // let luckyFooter = '\n 老板号码别打错了哈，谢谢~';
      let luckyFooter = "\n";
      let luckyContent = null;
      // #ifdef H5
      luckyContent = document
        .getElementById("luckyNumberText")
        .innerHTML.replace(/(<\/?span.*?>)/g, " ")
        .replace(/<\/?div.*?>/gi, "\n");
      // #endif
      // #ifdef MP-WEIXIN
      luckyContent = this.packageContextForWX();
      // #endif
      if (this.todayWeek === "1" || this.todayWeek === "3" || this.todayWeek === "6") {
        luckyTitle = " 老板买" + this.settingInfo.luckyCount + "注自选号码大乐透\n";
        this.copyTextContent = luckyTitle + luckyContent + luckyFooter;
      }
      if (this.todayWeek === "2" || this.todayWeek === "4" || this.todayWeek === "7") {
        luckyTitle = " 老板买" + this.settingInfo.luckyCount + "注自选号码双色球\n";
        this.copyTextContent = luckyTitle + luckyContent + luckyFooter;
      }
      uni.setClipboardData({
        data: this.copyTextContent,
        showToast: false,
        success: function () {
          uni.showToast({
            title: "已复制到剪切板啦~",
            icon: "none",
            duration: 1998,
          });
          self.isShowDrawer = false;
        },
        fail: function () {
          uni.showToast({
            title: "卧槽复制失败了！请联系管理员~",
            icon: "none",
            duration: 1998,
          });
        },
      });
    },
    // 微信小程序不支持直接操作dom
    packageContextForWX() {
      const self = this;
      let context = "";
      _.each(this.luckyNumberList, function (item, index) {
        let singleContextFirst = "";
        let singleContextSecond = "";
        _.each(item.lottoryNumberFirst, function (ita, ina) {
          singleContextFirst = singleContextFirst.concat(
            ina === 0 ? ` ` : "",
            `${JSON.stringify(ita.num)}  `
          );
        });
        _.each(item.lottoryNumberSecond, function (itb, inb) {
          singleContextSecond = singleContextSecond.concat(
            inb === 0 ? ` ` : "",
            `${JSON.stringify(itb.num)}  `
          );
        });
        context = context.concat(
          index === 0 ? "\n" : "",
          `${singleContextFirst}- ${singleContextSecond}`,
          "\n",
          index + 1 !== self.luckyNumberList.length ? "\n" : ""
        );
      });
      return context;
    },
    // 初始化随机号码
    initLuckyNumber() {
      if (this.todayWeek === "1" || this.todayWeek === "3" || this.todayWeek === "6") {
        this.initDLT();
      }
      if (this.todayWeek === "2" || this.todayWeek === "4" || this.todayWeek === "7") {
        this.initSSQ();
      }
      // test
      this.initSSQ();
    },
    // 初始化SSQ的奖池初始号码
    initSSQ() {
      this.luckyNumberRed = [];
      this.luckyNumberBlue = [];
      for (var i = 0; i < 33; i++) {
        this.luckyNumberRed.push(i + 1);
      }
      for (var i = 0; i < 16; i++) {
        this.luckyNumberBlue.push(i + 1);
      }
    },
    // 初始化DLT的奖池初始号码
    initDLT() {
      this.luckyNumberFront = [];
      this.luckyNumberBack = [];
      for (var i = 0; i < 35; i++) {
        this.luckyNumberFront.push(i + 1);
      }
      for (var i = 0; i < 12; i++) {
        this.luckyNumberBack.push(i + 1);
      }
    },
    // 显示当前时间
    showNowTime() {
      const self = this;
      this.timer = setInterval(() => {
        self.drawerTitle = moment().format("YYYY-MM-DD hh:mm:ss dddd");
      }, 1000);
    },
    // 获取今日幸运数字
    // Math.random()*(m-n)+n -->> 生成 [ n, m ) 范围内的随机数（大于等于n，小于m）
    initTodayLuckyNumber(luckyNumberDate) {
      if (!luckyNumberDate || luckyNumberDate !== moment().format("YYYY-MM-DD")) {
        this.settingInfo.luckyNumberDate = moment().format("YYYY-MM-DD");
        if (this.todayWeek === "1" || this.todayWeek === "3" || this.todayWeek === "6") {
          this.settingInfo.todayLuckyNumber = Math.floor(Math.random() * (36 - 1) + 1);
        }
        if (this.todayWeek === "2" || this.todayWeek === "4" || this.todayWeek === "7") {
          this.settingInfo.todayLuckyNumber = Math.floor(Math.random() * (34 - 1) + 1);
        }
        this.saveLuckySettingLocal();
      } else {
        if (this.todayWeek === "5") {
          this.settingInfo.todayLuckyNumber = "0";
        }
      }
    },
    // 打开摇奖设置
    editLuckySetting() {
      this.showType = "luckySetting";
      // #ifdef H5
      this.drawerHeight = "470px";
      // #endif
      // #ifdef MP-WEIXIN
      this.drawerHeight = "420px";
      // #endif
      this.isShowDrawer = true;
    },
    // 监听注数监听
    luckyCountChange(e) {
      this.settingInfo.luckyCount = e;
      this.saveLuckySettingLocal();
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 监听是否允许重复
    isNeedRepeatChange(e) {
      this.settingInfo.isNeedRepeat = e.detail.value;
      this.saveLuckySettingLocal();
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 监听当日是否只允许出现一注随机号码
    isOnlyFirstTodayChange(e) {
      this.settingInfo.isOnlyFirstToday = e.detail.value;
      this.settingInfo.localLuckyNumberList = this.luckyNumberList;
      this.saveLuckySettingLocal();
      if (!e.detail.value) {
        this.settingInfo.firstRandomDate = null;
        this.settingInfo.localLuckyNumberList = [];
        this.saveLuckySettingLocal();
      }
    },
    // 其他设置修改需要重置当日只允许出现一注随机号码
    resetIsOnlyFirstToday() {
      this.isOnlyFirstTodayChange({
        detail: {
          value: false,
        },
      });
    },
    // 监听当日幸运数字是否必须出现在当日随机号码中
    isNeedLuckyNumberChange(e) {
      this.settingInfo.isNeedLuckyNumber = e.detail.value;
      this.saveLuckySettingLocal();
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 上传图片
    importLuckyImg(type) {
      const self = this;
      // #ifdef H5
      uni.chooseImage({
        /** 关于count参数的官方说明
						count 值在 H5 平台的表现，基于浏览器本身的规范。目前测试的结果来看，只能限制单选/多选，并不能限制数量。
						并且，在实际的手机浏览器很少有能够支持多选的。 **/
        count: 1,
        sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有，仅支持App、微信小程序、支付宝小程序、百度小程序
        sourceType: ["album", "camera"], // album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
        // 成功则返回图片的本地文件路径列表 tempFilePaths
        success: function (res) {
          self.showType = "luckyPhoto";
          self.lottoryTicketArr = [];
          self.lottoryTicketArr.push(res.tempFilePaths[0]);
          self.drawerHeight = "80%";
          self.isShowDrawer = true;
          self.showImgDevTip();
        },
        // 接口调用失败的回调函数，小程序、App
        fail: function (res) {
          // console.log('H5图片上传接口调用失败:' + JSON.stringify(res));
        },
        // 接口调用结束的回调函数（调用成功、失败都会执行），全平台
        complete: function (res) {
          // console.log('H5图片上传接口调用结束:' + JSON.stringify(res));
        },
      });
      // #endif
      // 官方文档地址：https://developers.weixin.qq.com/miniprogram/dev/api/media/video/wx.chooseMedia.html
      // #ifdef MP-WEIXIN
      wx.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sourceType: ["album"],
        // sizeType	Array.<string>	['original', 'compressed']	否	仅对 mediaType 为 image 时有效，是否压缩所选文件
        sizeType: ["original"],
        maxDuration: 30,
        camera: "back",
        success(res) {
          self.showType = "luckyPhoto";
          self.lottoryTicketArr = [];
          self.lottoryTicketArr.push(res.tempFiles[0].tempFilePath);
          self.drawerHeight = "80%";
          self.isShowDrawer = true;
          self.showImgDevTip();
        },
        fail(res) {
          // console.log('微信文件图片上传接口调用失败:' + JSON.stringify(res));
        },
        complete(res) {
          // console.log('微信文件图片上传接口调用结束:' + JSON.stringify(res));
        },
      });
      // #endif
    },
    // 上传图片功能研发中
    showImgDevTip() {
      uni.showToast({
        title: "上传照片自动 OCR 分析识别功能正在紧张研发中，敬请期待！",
        icon: "none",
        duration: 5000,
      });
    },
    // 删除上传图片（功能暂时不需要）
    deleteImportImg(type) {
      const self = this;
      uni.showModal({
        title: "提示",
        content: "是否删除当前照片",
        success: function (res) {
          if (res.confirm) {
            // console.log('用户点击确定');
            self.lottoryTicketArr = [];
          } else if (res.cancel) {
            // console.log('用户点击取消');
          }
        },
      });
    },
    // 预览上传图片
    previewImportImg(type) {
      const self = this;
      uni.previewImage({
        urls: [self.lottoryTicketArr[0]],
        longPressActions: {
          success: function (data) {
            // console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
          },
          fail: function (err) {
            // console.log(err.errMsg);
          },
        },
      });
    },
    // 使用摄像头扫码
    useCamera() {
      // #ifdef H5
      uni.showToast({
        title: "功能开发中",
        icon: "none",
        duration: 1998,
      });
      // #endif
      // #ifdef MP-WEIXIN
      uni.showToast({
        title: "功能开发中",
        icon: "none",
        duration: 1998,
      });
      // #endif
    },
    // 计时用工具函数
    // start: 时间差开始
    // end: 时间差结束
    // getType: 需要的时间差类型，参考moment.duration对象get方法所能获取的到的，一般有：milliseconds、seconds、minutes、hours、days、months、years
    getTimeDuration(start, end, getType) {
      const duration = moment.duration(
        moment(parseInt(end)).diff(moment(parseInt(start)))
      );
      return duration.get(getType);
    },
    // 判断当日是否计算过是否幸运
    checkIsCountLucky() {
      if (this.settingInfo.firstLuckyDate !== moment().format("YYYY-MM-DD")) {
        return true;
      } else {
        if (this.settingInfo.isCheckLuckyOver) {
          return false;
        }
        return true;
      }
    },
    // 今天是幸运日吗
    isLuckyDay(isFirst, progress) {
      const total = 888;
      let nowProgress = progress;
      this.countLoading = true;
      if (isFirst) {
        this.countStartTime = moment().format("X");
      } else {
        const nowTime = moment().format("X");
        // console.log('已耗时：', this.getTimeDuration(this.countStartTime, nowTime, 'milliseconds'));
      }
      const self = this;
      const randomTempNum = Math.random() * (1 - 0) + 0;
      nowProgress += randomTempNum;
      this.luckyRandomProgrss = Math.floor((nowProgress / total) * 100);
      this.luckyProgrssCount += 1;
      // console.log(`计算进度：${this.luckyRandomProgrss}%`);
      if (nowProgress > total) {
        if (this.luckyProgrssCount % 2 === 0) {
          const luckyText = "今天你真的很幸运！";
          this.settingInfo.todayLuckyText = luckyText;
          uni.showToast({
            title: luckyText,
            icon: "none",
            duration: 1998,
          });
        } else {
          const luckyText = "哎呀今天不太走运，明天再试试吧！";
          this.settingInfo.todayLuckyText = luckyText;
          uni.showToast({
            title: luckyText,
            icon: "none",
            duration: 1998,
          });
        }
        this.luckyRandomProgrss = 0;
        this.luckyProgrssCount = 0;
        this.countLoading = false;
        this.settingInfo.isCheckLuckyOver = true;
        this.saveLuckySettingLocal();
      } else {
        this.luckyTimer = setTimeout(function () {
          self.isLuckyDay(false, nowProgress);
        }, 1);
      }
    },
    // 获取今日运势
    getTodayLucky() {
      if (this.todayWeek === "5") {
        uni.showToast({
          title: "非常抱歉，今天是星期五，无法获取今日运势~",
          icon: "none",
          duration: 1998,
        });
      } else {
        const self = this;
        if (this.checkIsCountLucky()) {
          this.settingInfo.luckyClickTotal = 0;
          this.saveLuckySettingLocal();
          this.isLuckyDay(true, 0);
          this.settingInfo.firstLuckyDate = moment().format("YYYY-MM-DD");
        } else {
          if (this.settingInfo.luckyClickTotal < 8) {
            this.settingInfo.luckyClickTotal += 1;
            const firstShowDuration = 2888;
            uni.showToast({
              title: `今天已经计算过了，${this.settingInfo.todayLuckyText}`,
              icon: "none",
              duration: firstShowDuration,
            });
            // setTimeout(function() {
            // 	if (self.settingInfo.todayLuckyText) {
            // 		uni.showToast({
            // 			title: self.settingInfo.todayLuckyText,
            // 			icon: 'none',
            // 			duration: 1998
            // 		});
            // 	}
            // }, firstShowDuration + 100);
          } else {
            // 触发彩蛋同时禁用点击
            this.countLoading = true;
            // 重复点击达到8次后，触发彩蛋，允许重新计算当日是否幸运
            const firstShowDuration = 1998;
            uni.showToast({
              title: "恭喜你触发彩蛋，重新计算今日运势！",
              icon: "none",
              duration: firstShowDuration,
            });
            this.settingInfo.firstLuckyDate = null;
            this.settingInfo.isCheckLuckyOver = false;
            this.settingInfo.todayLuckyText = null;
            this.settingInfo.luckyClickTotal = 0;
            this.saveLuckySettingLocal();
            setTimeout(function () {
              self.getTodayLucky();
            }, firstShowDuration + 100);
          }
          this.saveLuckySettingLocal();
        }
      }
    },
    // 计时用工具函数，获取时分秒文字
    // start: 时间差开始
    // end: 时间差结束
    getTimeDurationText(totalSeconds) {
      const currentTime = moment.duration(totalSeconds, "seconds");
      return moment({
        h: currentTime.hours(),
        m: currentTime.minutes(),
        s: currentTime.seconds(),
      }).format("HH:mm:ss");
    },
    // 模拟摇奖
    fakeDrawLottery(isFirst) {
      if (this.todayWeek === "5") {
        uni.showToast({
          title: "非常抱歉，今天是星期五，不提供模拟摇奖~",
          icon: "none",
          duration: 1998,
        });
      } else {
        const self = this;
        // 记录开始摇奖状态
        this.isDrawLoading = true;
        // 判断是否事第一次点击
        if (isFirst) {
          this.countStartTime = moment().format("X");
          this.drawLottoryTime = this.settingInfo.drawLottoryTimeHistory;
        } else {
          const nowTime = moment().format("X");
          this.drawLottoryTime =
            this.settingInfo.drawLottoryTimeHistory +
            this.getTimeDuration(this.countStartTime, nowTime, "milliseconds");
          console.log("总耗时：", this.drawLottoryTime, "秒");
          this.drawLottoryText = `模拟摇奖中，已耗时：${this.getTimeDurationText(
            this.drawLottoryTime
          )}`;
        }
        // 模拟摇奖，并判断是否中奖
        this.settingInfo.luckyCount = 2;
        this.settingInfo.isOnlyFirstToday = false;
        // 第一次摇号
        this.packageRandomList();
        // H5和微信的数据结构有些区别，这里要分开处理

        // #ifdef H5
        const yourNumber = this.luckyNumberList[1].lottoryNumberFirst
          .concat(this.luckyNumberList[1].lottoryNumberSecond)
          .join(",");
        // #endif

        // H5和微信的数据结构有些区别，这里要分开处理
        // #ifdef MP-WEIXIN
        const yourNumberTempList = [];
        this.luckyNumberList[1].lottoryNumberFirst.forEach((item) => {
          yourNumberTempList.push(item.num);
        });
        this.luckyNumberList[1].lottoryNumberSecond.forEach((item) => {
          yourNumberTempList.push(item.num);
        });
        const yourNumber = yourNumberTempList.join(",");
        // #endif
        // 第二次摇号
        this.packageRandomList();

        // H5和微信的数据结构有些区别，这里要分开处理
        // #ifdef H5
        const rightNumber = this.luckyNumberList[1].lottoryNumberFirst
          .concat(this.luckyNumberList[1].lottoryNumberSecond)
          .join(",");
        // #endif

        // H5和微信的数据结构有些区别，这里要分开处理
        // #ifdef MP-WEIXIN
        const rightNumberTempList = [];
        this.luckyNumberList[1].lottoryNumberFirst.forEach((item) => {
          rightNumberTempList.push(item.num);
        });
        this.luckyNumberList[1].lottoryNumberSecond.forEach((item) => {
          rightNumberTempList.push(item.num);
        });
        const rightNumber = rightNumberTempList.join(",");
        // #endif

        const isWin = _.isEqual(yourNumber, rightNumber);
        console.log(`${yourNumber}\n${rightNumber}\n是否中奖：${isWin}`);
        // 若中奖，结束递归摇奖
        if (isWin) {
          // 中奖了停止摇奖状态
          this.isDrawLoading = false;
          // 记录中奖状态和号码
          console.log("今日模拟中奖号码：", rightNumber);
          this.settingInfo.bigRewardNumber = rightNumber;
          this.settingInfo.isGetBigReward = true;
          this.saveLuckySettingLocal();
        } else {
          clearTimeout(this.fakeDrawTimer);
          this.fakeDrawTimer = null;

          // #ifdef H5
          const drawGap = 1;
          // #endif

          // #ifdef MP-WEIXIN
          const drawGap = 88;
          // #endif

          this.fakeDrawTimer = setTimeout(function () {
            self.fakeDrawLottery(false);
          }, drawGap);
        }
      }
    },
    // 停止计时
    stopDrawLottory() {
      const self = this;
      this.isDrawLoading = false;
      const drawLottoryTimeTemp = this.drawLottoryTime;
      // #ifdef H5
      this.initCacheSettingLocal();
      this.drawLottoryText = `继续摇奖，已耗时：${this.getTimeDurationText(
        drawLottoryTimeTemp
      )}`;
      this.settingInfo.drawLottoryTimeHistory = drawLottoryTimeTemp;
      this.saveLuckySettingLocal();
      // #endif
      // #ifdef MP-WEIXIN
      // 微信回调有延时，这里直接拷贝 `this.initCacheSetting()` 方法过来
      wx.getStorage({
        key: "settingInfo",
        success: function (res) {
          let settingInfo = JSON.parse(res.data);
          self.settingInfo = {
            ...settingInfo,
          };
          // 如果打开了只允许一注随机则需要重新渲染当日的随机号码
          if (
            self.settingInfo.isOnlyFirstToday &&
            self.settingInfo.firstRandomDate === moment().format("YYYY-MM-DD")
          ) {
            self.luckyNumberList = self.settingInfo.localLuckyNumberList;
          }
          // 初始化完缓存配置项后初始化今日幸运数字
          self.initTodayLuckyNumber(settingInfo.luckyNumberDate);
          // 初始化模拟摇奖配置
          self.initDrawLottory();
          // 微信回调有延时，这里还原配置后保存计时
          self.drawLottoryText = `继续摇奖，已耗时：${self.getTimeDurationText(
            drawLottoryTimeTemp
          )}`;
          self.settingInfo.drawLottoryTimeHistory = drawLottoryTimeTemp;
        },
        fail: function () {
          // 如果第一次进入没有缓存配置，仍然需要生成当日幸运数字
          self.initTodayLuckyNumber(null);
        },
      });
      this.saveLuckySettingLocal();
      // #endif
      clearTimeout(this.fakeDrawTimer);
      this.fakeDrawTimer = null;
    },
    // 初始化摇奖状态
    initDrawLottory() {
      if (
        !this.settingInfo.isGetBigReward &&
        this.settingInfo.drawLottoryTimeHistory > 0
      ) {
        this.drawLottoryText = `继续摇奖，已耗时：${this.getTimeDurationText(
          this.settingInfo.drawLottoryTimeHistory
        )}`;
      } else {
        if (this.settingInfo.isGetBigReward) {
          this.drawLottoryText = `已中奖，中奖号码是：${this.settingInfo.bigRewardNumber}`;
          this.settingInfo.drawLottoryTimeHistory = 0;
        } else {
          this.drawLottoryText = "模拟摇奖";
        }
      }
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
