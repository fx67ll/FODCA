<template>
  <view class="fx67ll-tools-box">
    <view class="fx67ll-btn-box">
      <view class="fx67ll-btn-item fx67ll-btn-item-two">
        <button class="fx67ll-btn-default" type="default" @click="getLuckyNumber"
          :disabled="isNetworkLoading || countLoading || isDrawLoading">
          {{
            this.settingInfo.isOnlyFirstToday &&
              this.settingInfo.localLuckyNumberList &&
              (this.settingInfo.localLuckyNumberList.length || 0) > 0
              ? "查看今日已生成号码"
              : "获取今日随机号码"
          }}
        </button>
        <uni-icons class="fx67ll-btn-icon" type="gear-filled" :size="iconSize" @click="editLuckySetting"
          v-if="!isNetworkLoading && !countLoading && !isDrawLoading"></uni-icons>
        <uni-icons class="fx67ll-btn-loading" type="spinner-cycle" :size="iconSize"
          v-if="isNetworkLoading || countLoading || isDrawLoading"></uni-icons>
      </view>
      <!-- 只允许超级管理员fx67ll使用图片上传自动分析的功能，后续视情况开放 -->
      <view class="fx67ll-btn-item fx67ll-btn-item-two" v-if="userName && userName === 'fx67ll'">
        <button class="fx67ll-btn-default" type="default" @click="pickImportLuckyImg"
          :disabled="isNetworkLoading || countLoading || isDrawLoading">
          <span v-if="parseInt(pictureUploadNumber) === 0 && !isNetworkLoading">上传照片自动分析</span>
          <span v-if="parseInt(pictureUploadNumber) === 0 && isNetworkLoading">正在努力上传中...</span>
          <span v-if="parseInt(pictureUploadNumber) !== 0">上传进度:{{ pictureUploadNumber }}%, 正在解析数据中...</span>
        </button>
        <uni-icons class="fx67ll-btn-icon" type="camera-filled" :size="iconSize" @click="useCamera"
          v-if="!isNetworkLoading && !countLoading && !isDrawLoading"></uni-icons>
        <uni-icons class="fx67ll-btn-loading" type="spinner-cycle" :size="iconSize"
          v-if="isNetworkLoading || countLoading || isDrawLoading"></uni-icons>
      </view>
      <view class="fx67ll-btn-item" v-if="!isDrawLoading">
        <button class="fx67ll-btn-default" type="warn" :disabled="isNetworkLoading" @click="fakeDrawLottery(true)">
          {{ drawLotteryText }}
        </button>
      </view>
      <view class="fx67ll-btn-item fx67ll-btn-item-two" v-if="isDrawLoading">
        <button class="fx67ll-btn-default" type="warn" @click="fakeDrawLottery(true)" :disabled="isDrawLoading">
          {{ drawLotteryText }}
        </button>
        <uni-icons class="fx67ll-btn-icon" type="minus" :size="iconSize" @click="stopDrawLottery"></uni-icons>
      </view>
      <view class="fx67ll-btn-item">
        <button class="fx67ll-btn-default" type="warn" @click="getTodayLucky"
          :disabled="isNetworkLoading || countLoading || isDrawLoading">
          {{
            !countLoading
              ? isDrawLoading
                ? "正在摇奖中，无法计算运势~"
                : "点击看看今天运势如何"
              : `正在为您计算今日运势：${luckyRandomProgrss}%`
          }}
        </button>
      </view>
      <view class="fx67ll-btn-item" v-if="
        todayWeek === '5' &&
        userName === 'fx67ll' &&
        !settingInfo.isDoneOneClickThreeFriday
      ">
        <button class="fx67ll-btn-default" type="default" @click="fridayOneClickThree"
          :disabled="isNetworkLoading || countLoading || isDrawLoading">
          周五一键三连
        </button>
      </view>
    </view>

    <view class="fx67ll-lucky-box" v-if="settingInfo.todayLuckyNumber">
      <view class="fx67ll-lucky-bumber">{{
        todayWeek === "5" ? "0" : settingInfo.todayLuckyNumber
      }}</view>
      <view class="fx67ll-lucky-title" @click="handleToLogHistory">今日随机幸运数字</view>
    </view>

    <!-- 页面底部抽屉 -->
    <zb-drawer mode="bottom" :title="drawerTitle" :wrapperClosable="false" :visible.sync="isShowDrawer" :radius="true"
      :height="drawerHeight" :before-close="handleDrawerClose">
      <view v-if="showType === 'luckyNumber'">
        <view id="luckyNumberText" class="fx67ll-number-box">
          <view class="fx67ll-number-item" v-for="(item, index) in luckyNumberList" :key="item.timeStamp" @click="openConfigLogDrawer">
            <span v-for="itemFirst in item.lotteryNumberFirst" :key="itemFirst.key" :class="{
              'color-daily-chasing': index === 0 && settingInfo.isNeedDailyChasingNumber && userName === 'fx67ll',
              'color-low-freq-second': index === (settingInfo.isNeedDailyChasingNumber ? 1 : 0) && settingInfo.isNeedHighFrequencyCombination && userName === 'fx67ll',
              'color-low-freq-third': index === (settingInfo.isNeedDailyChasingNumber ? 1 : 0) + (settingInfo.isNeedHighFrequencyCombination ? 1 : 0) && settingInfo.isNeedLowFrequencyCombination && userName === 'fx67ll',
              'color-hot-cold-append': index === luckyNumberList.length - 1 && settingInfo.isHotColdWeighted && !settingInfo.isOverrideRandomLogic && userName === 'fx67ll'
            }">{{
              itemFirst.num
            }}</span>
            {{
              item.lotteryNumberSecond && item.lotteryNumberSecond.length > 0 ? "-" : ""
            }}
            <view class="fx67ll-number-item-back"
              v-if="item.lotteryNumberSecond && item.lotteryNumberSecond.length > 0">
              <span v-for="itemSecond in item.lotteryNumberSecond" :key="itemSecond.key" :class="{
                'color-daily-chasing': index === 0 && settingInfo.isNeedDailyChasingNumber && userName === 'fx67ll',
                'color-low-freq-second': index === (settingInfo.isNeedDailyChasingNumber ? 1 : 0) && settingInfo.isNeedHighFrequencyCombination && userName === 'fx67ll',
                'color-low-freq-third': index === (settingInfo.isNeedDailyChasingNumber ? 1 : 0) + (settingInfo.isNeedHighFrequencyCombination ? 1 : 0) && settingInfo.isNeedLowFrequencyCombination && userName === 'fx67ll',
                'color-hot-cold-append': index === luckyNumberList.length - 1 && settingInfo.isHotColdWeighted && !settingInfo.isOverrideRandomLogic && userName === 'fx67ll'
              }">
                {{ itemSecond.num }}
              </span>
            </view>
          </view>
        </view>

        <!-- #ifdef H5 -->
        <view class="fx67ll-drawer-btn-box h5" v-if="!settingInfo.isOnlyFirstToday">
          <button class="fx67ll-btn-copy" type="primary" @click="copyLuckyNumber">拷贝至剪切板</button>
          <button class="fx67ll-btn-submit" :loading="isNetworkLoading" :disabled="isNetworkLoading"
            @click="uploadLuckyNumberDebounce(true)">
            保存到云端
          </button>
        </view>
        <view class="fx67ll-drawer-btn-box h5" v-if="settingInfo.isOnlyFirstToday">
          <button class="fx67ll-btn-copy-one" type="primary" @click="copyLuckyNumber">拷贝至剪切板</button>
        </view>
        <!-- #endif -->

        <!-- #ifdef MP-WEIXIN -->
        <view class="fx67ll-drawer-btn-box" v-if="!settingInfo.isOnlyFirstToday">
          <button class="fx67ll-btn-copy" type="primary" @click="copyLuckyNumber">拷贝至剪切板</button>
          <button class="fx67ll-btn-submit" :loading="isNetworkLoading" :disabled="isNetworkLoading"
            @click="uploadLuckyNumberDebounce(true)">
            保存到云端
          </button>
        </view>
        <view class="fx67ll-drawer-btn-box" v-if="settingInfo.isOnlyFirstToday">
          <button class="fx67ll-btn-copy-one" type="primary" @click="copyLuckyNumber">拷贝至剪切板</button>
        </view>
        <!-- #endif -->
      </view>

      <scroll-view scroll-y="true" class="fx67ll-drawer-img" v-if="showType === 'luckyPhoto'">
        <view class="fx67ll-drawer-tip">请注意！每次的分析结果数据不会保存到云端，关闭当前弹窗后将无法再次获取历史识别结果~</view>
        <view class="fx67ll-ocr-lottery">
          <view class="fx67ll-drawer-title" v-if="!ocrTagList || ocrTagList.length < 1">本次OCR未识别到文字！</view>

          <view class="fx67ll-ocr-btn">
            <button type="warn" v-if="
              ocrTagList &&
              ocrTagList.length > 0 &&
              ocrTagCheckList &&
              ocrTagCheckList.length > 0
            " @click="copyCheckTagText">
              拷贝选中的文字至剪切板
            </button>
          </view>

          <view class="fx67ll-drawer-title" v-if="
            ocrTagList &&
            ocrTagList.length > 0 &&
            ocrTagCheckList &&
            ocrTagCheckList.length === 0
          ">尝试点击识别结果中你需要的的文字分块吧！</view>
          <view class="fx67ll-drawer-title" v-if="
            ocrTagList &&
            ocrTagList.length > 0 &&
            ocrTagCheckList &&
            ocrTagCheckList.length > 0
          ">您已选中以下识别结果:</view>
          <view class="fx67ll-ocr-result" v-if="ocrTagList && ocrTagList.length > 0">
            <span v-for="(item, index) in ocrTagList" :key="item.timeStamp" :class="{
              'fx67ll-ocr-tag': item.isCheck,
              'fx67ll-ocr-tag-choose': item.isCheck,
            }" @click="changeTagStatus(index)"><text v-if="item.isCheck">{{ item.words || "--" }}</text>
            </span>
          </view>

          <view class="fx67ll-drawer-title" v-if="ocrTagList && ocrTagList.length > 0">本次百度OCR识别的结果:</view>
          <view class="fx67ll-ocr-result" v-if="ocrTagList && ocrTagList.length > 0">
            <span v-for="(item, index) in ocrTagList" :key="item.timeStamp"
              :class="{ 'fx67ll-ocr-tag': true, 'fx67ll-ocr-tag-check': item.isCheck }"
              @click="changeTagStatus(index)">{{ item.words || "--" }}
            </span>
          </view>
        </view>

        <view class="fx67ll-ocr-lottery">
          <view class="fx67ll-drawer-title">本次百度OCR识别的照片:</view>
          <!-- <img
            :src="lotteryTicketArr[0]"
            @click="previewImportImg"
            :style="{ width: `${ocrImgDomWidth}` }"
          /> -->
          <image mode="widthFix" :src="lotteryTicketArr[0]" @click="previewImportImg" />
        </view>
      </scroll-view>

      <view class="fx67ll-drawer-setting" v-if="showType === 'luckySetting'">
        <scroll-view scroll-y="true" class="fx67ll-setting-scroll">
          <view class="fx67ll-setting-item">
            <span>需要随机输出的注数</span>
            <uni-number-box :min="getMinCount" :max="getMaxCount" v-model="settingInfo.luckyCount"
              @change="luckyCountChange"></uni-number-box>
          </view>
          <view class="fx67ll-setting-item">
            <span>当日是否仅允许生成一次随机</span>
            <switch class="fx67ll-setting-switch" :checked="settingInfo.isOnlyFirstToday"
              @change="isOnlyFirstTodayChange" />
          </view>
          <view class="fx67ll-setting-item"
            v-if="!(settingInfo.isHotColdWeighted && settingInfo.isOverrideRandomLogic && userName === 'fx67ll')">
            <span>是否允许出现重复串号</span>
            <switch class="fx67ll-setting-switch" :checked="settingInfo.isNeedRepeat" @change="isNeedRepeatChange" />
          </view>
          <view class="fx67ll-setting-item" v-if="!settingInfo.isHotColdWeighted || !settingInfo.isOverrideRandomLogic">
            <span>当日幸运数字是否要包含在内</span>
            <switch class="fx67ll-setting-switch" :checked="settingInfo.isNeedLuckyNumber"
              @change="isNeedLuckyNumberChange" />
          </view>
          <view class="fx67ll-setting-item"
            v-if="userName === 'fx67ll' && !(settingInfo.isHotColdWeighted && settingInfo.isOverrideRandomLogic)">
            <span>过往最高频中奖号码是否要包含在内</span>
            <switch class="fx67ll-setting-switch" :checked="settingInfo.isNeedAddPastRewardNumber"
              @change="isNeedAddPastChange" />
          </view>
          <view class="fx67ll-setting-item"
            v-if="userName === 'fx67ll' && settingInfo.isNeedAddPastRewardNumber && !(settingInfo.isHotColdWeighted && settingInfo.isOverrideRandomLogic)">
            <span>需要总结的过往期数</span>
            <uni-number-box :min="1" :max="1023" v-model="settingInfo.pastCheckCount"
              @change="pastCheckCountChange"></uni-number-box>
          </view>
          <view class="fx67ll-setting-item" v-if="userName === 'fx67ll'">
            <span>随机生成的号码是否需要冷热加权</span>
            <switch class="fx67ll-setting-switch" :checked="settingInfo.isHotColdWeighted"
              @change="isHotColdWeightedChange" />
          </view>
          <view class="fx67ll-setting-item-group" v-show="settingInfo.isHotColdWeighted && userName === 'fx67ll'">
            <view class="fx67ll-setting-item">
              <radio-group class="fx67ll-setting-radio-group" @change="hotColdWeightTypeChange">
                <label class="fx67ll-setting-radio-label">
                  <radio value="hot" :checked="settingInfo.hotColdWeightType === 'hot'" />
                  <span class="fx67ll-setting-radio-text">热加权</span>
                </label>
                <label class="fx67ll-setting-radio-label">
                  <radio value="cold" :checked="settingInfo.hotColdWeightType === 'cold'" />
                  <span class="fx67ll-setting-radio-text">冷加权</span>
                </label>
              </radio-group>
            </view>
            <view class="fx67ll-setting-item">
              <span>冷热加权是否需要覆盖当前随机逻辑</span>
              <switch class="fx67ll-setting-switch" :checked="settingInfo.isOverrideRandomLogic"
                @change="isOverrideRandomLogicChange" />
            </view>
          </view>
          <view class="fx67ll-setting-item" v-if="userName === 'fx67ll'">
            <span>是否添加一注每日追号</span>
            <switch class="fx67ll-setting-switch" :checked="settingInfo.isNeedDailyChasingNumber"
              @change="isNeedDailyChasingNumberChange" />
          </view>
          <view class="fx67ll-setting-item" v-if="userName === 'fx67ll'">
            <span>是否添加一注历史开奖高频号码组合</span>
            <switch class="fx67ll-setting-switch" :checked="settingInfo.isNeedHighFrequencyCombination"
              @change="isNeedHighFrequencyCombinationChange" />
          </view>
          <view class="fx67ll-setting-item" v-if="userName === 'fx67ll'">
            <span>是否添加一注历史开奖低频号码组合</span>
            <switch class="fx67ll-setting-switch" :checked="settingInfo.isNeedLowFrequencyCombination"
              @change="isNeedLowFrequencyCombinationChange" />
          </view>
          <view class="fx67ll-setting-item" v-if="userName === 'fx67ll'">
            <span>是否添加一注随机排列五</span>
            <switch class="fx67ll-setting-switch" :checked="settingInfo.isNeedDailyRandomPL5"
              @change="isNeedDailyRandomPL5Change" />
          </view>
          <view class="fx67ll-setting-tip">
            Tip-1：修改其他设置会重置
            <text>"当日是否仅允许生成一次随机"</text>
            设置，并且开启该配置会自动上传生成的号码记录
          </view>
          <view class="fx67ll-setting-tip"> Tip-2：摇奖设置会自动保存到本地，本地缓存会有丢失风险，请按需保存到云端，部分配置次日生效
          </view>
          <view class="fx67ll-setting-tip" v-if="userName === 'fx67ll'">
            Tip-3：冷热加权配置开启之后，如果关闭覆盖配置则随机号码之中，会有一注是加权随机号码；如果打开覆盖配置。则全部随机均采用加权随机生成逻辑
          </view>
          <!-- 底部占位，防止内容被固定按钮遮挡 -->
          <view class="fx67ll-setting-scroll-placeholder"></view>
        </scroll-view>
        <!-- #ifdef H5 -->
        <view class="fx67ll-setting-fixed-btn fx67ll-setting-fixed-btn-h5 fx67ll-setting-btn">
          <button class="fx67ll-btn-default" type="primary" :loading="isNetworkLoading"
            @click="saveLuckySettingDebounce(false)">
            保存设置到云端
          </button>
          <button class="fx67ll-btn-close" type="warn" :loading="isNetworkLoading" @click="handleDrawerClose">
            关闭
          </button>
        </view>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <button class="fx67ll-setting-fixed-btn" type="primary" :loading="isNetworkLoading"
          @click="saveLuckySettingDebounce(false)">保存设置到云端</button>
        <!-- #endif -->
      </view>
    </zb-drawer>

    <!-- 配置记录弹窗 -->
    <zb-drawer mode="bottom" title="本次号码生成配置记录日志" :wrapperClosable="true" :visible.sync="isShowConfigLogDrawer"
      :radius="true" :height="configLogDrawerHeight">
      <view class="fx67ll-config-log-drawer">
        <scroll-view scroll-y="true" class="fx67ll-config-log-scroll">
          <view v-if="settingInfo.lastGenerateConfigLog">
            <view class="fx67ll-config-log-item" v-for="(line, idx) in settingInfo.lastGenerateConfigLog" :key="idx">
              <text class="fx67ll-config-log-index">{{ idx + 1 }}.</text>
              <text class="fx67ll-config-log-text">{{ line }}</text>
            </view>
          </view>
          <view v-else class="fx67ll-config-log-empty">暂无配置记录</view>
          <view class="fx67ll-config-log-placeholder"></view>
        </scroll-view>
        <!-- #ifdef H5 -->
        <view class="fx67ll-config-log-btn-box">
          <button class="fx67ll-config-log-btn" type="warn" @click="isShowConfigLogDrawer = false">关 闭</button>
        </view>
        <!-- #endif -->
      </view>
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

// 各种工具类
import {
  quickSort,
  decryptString,
  mapLotteryNumberType,
  sortNumberByFrequency,
  sortNumberByAscending,
  isTwoOrThreeDaysAfterWithSameYearCheck,
  calculateCurrentDateCode,
  getLotteryNumberByFrequency,
  buildWeightedPool,
  drawFromWeightedPool,
} from "@/utils/index";
import { showConfirm } from "@/utils/common";
import { getToken } from "@/utils/auth";

// lottery相关api
import {
  getSetting,
  updateSetting,
  addSetting,
  getChaseNumberSetting,
} from "@/api/fx67ll/lottery/setting";
import { getLogList, addLog, listHistoryStatistics } from "@/api/fx67ll/lottery/log";

// 获取加密配置
import { getSecretConfig } from "@/api/fx67ll/secret/key.js";
import { getCryptoSaltKey } from "@/neverUploadToGithub";

export default {
  components: {
    uniIcons,
    uniNumberBox,
  },
  data() {
    return {
      // 当前登录用户信息
      userName: this.$store.state.user.name,
      // 当前配置信息云端ID
      settingInfoId: null,
      // 按钮图标大小
      iconSize: 32,
      // 定时器对象
      timer: null,
      // 今日星期几
      todayWeek: moment().format("E"),
      // todayWeek: '4',
      // 今日彩票编号
      todayDateCode: null,
      // Drawer组件相关参数
      isShowDrawer: false,
      drawerHeight: "75%",
      drawerType: 0,
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
        lotteryNumberFirst: [1, 4, 5, 8, 10, 23],
        lotteryNumberSecond: [5],
      },
      // DLT固定追号配置，后期开放自定义固定追号
      luckyNumberDLT: {
        timeStamp: new Date().getTime(),
        lotteryNumberFirst: [4, 7, 8, 10, 23],
        lotteryNumberSecond: [4, 9],
      },
      // 需要拷贝到剪切板的内容
      copyTextContent: "",
      // 照片数组
      lotteryTicketArr: [],
      idImgArrBack: [],
      // 设置相关参数
      settingInfo: {
        // 输出注数
        luckyCount: 2,
        // 是否允许重复
        isNeedRepeat: false,
        // 当日是否只允许出现一注随机号码，打开开关后需要缓存当前第一注
        isOnlyFirstToday: true,
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
        drawLotteryTimeHistory: 0,
        isGetBigReward: false,
        bigRewardNumber: null,
        // 是否需要追加一注过往中奖号码出现的高频数字，以及需要查询过往多少期
        isNeedAddPastRewardNumber: false,
        pastCheckCount: 1023,
        // 是否需要每天带一注随机排列五，fx67ll个人用配置
        isNeedDailyRandomPL5: false,
        // 周五是否已经完成一键三连，fx67ll个人用配置
        isDoneOneClickThreeFriday: false,
        // 是否需要带一注高频号码组合
        isNeedHighFrequencyCombination: false,
        // 是否需要带一注低频号码组合
        isNeedLowFrequencyCombination: false,
        // 是否需要添加每日追号
        isNeedDailyChasingNumber: true,
        // 是否开启冷热加权
        isHotColdWeighted: false,
        // 冷热加权类型：'hot' 热加权 | 'cold' 冷加权
        hotColdWeightType: 'hot',
        // 是否用冷热加权逻辑覆盖原有随机逻辑
        isOverrideRandomLogic: false,
        // 最后一次生成号码时的配置记录（数组，每项一条记录文案）
        lastGenerateConfigLog: null,
      },
      // 配置记录Drawer组件相关参数
      isShowConfigLogDrawer: false,
      configLogDrawerHeight: '88%',
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
      drawLotteryText: "模拟摇奖",
      // 是否正在模拟
      isDrawLoading: false,
      // 模拟摇奖计时
      drawLotteryTime: 0,
      // 调用接口的加载标识
      isNetworkLoading: false,
      // 图片上传百分比
      pictureUploadNumber: 0,
      // 百度OCR分析之后的结果列表
      ocrTagList: [],
      // 百度OCR分析之后的结果选中的列表
      ocrTagCheckList: [],
      // 百度OCR识别的图片宽度，使用uniapp的image组件的mode="fixWidth"属性即可，不再需要自动计算
      // ocrImgDomWidth: "",
      // 彩票类型枚举（后期改为后台枚举接口获取）
      lotteryTypeMap: {
        1: {
          text: "大乐透",
          code: "cjdlt",
        },
        2: {
          text: "双色球",
          code: "ssq",
        },
        3: {
          text: "排列三",
          code: "pl3",
        },
        4: {
          text: "排列五",
          code: "pl5",
        },
        5: {
          text: "七星彩",
          code: "qxc",
        },
      },
    };
  },
  computed: {
    getMinCount() {
      if (this.userName !== 'fx67ll') {
        // 游客：最低 1 注随机
        return 1;
      }
      // 管理员：冷热加权追加模式需要至少 2 注随机（1 注普通随机 + 1 注冷热加权）
      // 其他情况最低 1 注随机
      const isHotColdAppendMode = this.settingInfo.isHotColdWeighted && !this.settingInfo.isOverrideRandomLogic;
      return isHotColdAppendMode ? 2 : 1;
    },
    getMaxCount() {
      if (this.userName !== 'fx67ll') {
        // 游客：最高 5 注随机
        return 5;
      }
      // 管理员：固定追加注占用后，剩余最高随机注数 = 5 - 固定占位数
      // 追号、高频组合、低频组合各占 1 位
      let fixedSlots = 0;
      if (this.settingInfo.isNeedDailyChasingNumber) fixedSlots++;
      if (this.settingInfo.isNeedHighFrequencyCombination) fixedSlots++;
      if (this.settingInfo.isNeedLowFrequencyCombination) fixedSlots++;
      // 最高随机注数 = 5 - 固定占位，但至少保留 1 注随机
      return Math.max(1, 5 - fixedSlots);
    },
  },
  watch: {
    isShowDrawer: {
      handler(newValue, oldValue) {
        if (!newValue && this.drawerType > 0) {
          // #ifdef MP-WEIXIN
          this.initCacheSetting();
          // #endif
        }
      },
      deep: true, // 深度监测对象的变化
      immediate: true, // 立即执行监测器函数
    },
  },
  onLoad() {
    // 执行初始化流程
    this.initProcess();
  },
  onShow() {
    // // 设置图片显示宽度，使用uniapp的image组件的mode="fixWidth"属性即可，不再需要自动计算
    // this.ocrImgDomWidth = `${uni.getWindowInfo()?.windowWidth - 30}px`;

    // 如果当前时间跨日了需要立刻重新初始化
    if (this.checkNowIsCrossDay()) {
      this.initProcess();
    }
  },
  onHide() {
    // 增加一下保存的频率
    this.saveLuckySettingDebounce(true);
    // 退出页面时清理所有定时器
    this.clearAllTimer();
  },
  onUnload() {
    // 页面销毁时清理所有定时器
    this.clearAllTimer();
  },
  methods: {
    // 初始化流程
    initProcess() {
      // moment初始汉化
      moment.locale("zh-cn");
      // 初始化随机号码
      this.initLuckyNumber();
      // 初始化缓存设置
      this.initCacheSetting();
      // 显示当前时间
      this.showNowTime();
      // 初始化最近官方彩票编号
      this.initLastLotteryDateCode();
    },
    // 清理所有定时器
    clearAllTimer() {
      // 销毁时清除定时器
      clearInterval(this.timer);
      clearTimeout(this.luckyTimer);
      clearTimeout(this.fakeDrawTimer);
      this.timer = null;
      this.luckyTimer = null;
      this.fakeDrawTimer = null;
      // 隐藏时停止计时
      if (this.isDrawLoading) {
        this.stopDrawLottery();
      }
    },
    // 保存设置到服务端
    // noToast，默认不用传，传true表示不会提示保存成功或失败的信息，传false表示正常提示
    saveLuckySetting(isNoNeedToast) {
      const self = this;
      this.isNetworkLoading = true;
      if (this.settingInfoId) {
        const updateParams = {
          settingId: this.settingInfoId,
          lotterySetting: JSON.stringify(this.settingInfo),
        };
        updateSetting(updateParams).then((res) => {
          self.showSavingToast(
            res?.code,
            !isNoNeedToast,
            "摇奖设置已成功新增到云端~",
            "摇奖设置保存新增到云端失败，请联系管理员！",
            false
          );
        });
      } else {
        const addParams = {
          lotterySetting: JSON.stringify(this.settingInfo),
        };
        addSetting(addParams).then((res) => {
          self.showSavingToast(
            res?.code,
            !isNoNeedToast,
            "摇奖设置已成功保存到云端~",
            "摇奖设置保存修改到云端失败，请联系管理员！",
            true
          );
        });
      }
    },
    // 保存设置到服务端 - 防抖处理
    saveLuckySettingDebounce: _.debounce(function (isNoNeedToast) {
      this.saveLuckySetting(isNoNeedToast);
    }, 233),
    // 调用新增或修改接口之后的统一处理
    showSavingToast(resCode, isNeedTip, successTip, failTip, isNeedQuerySettingId) {
      const self = this;
      if (resCode === 200) {
        if (isNeedTip && successTip) {
          uni.showToast({
            title: successTip,
            icon: "none",
            duration: 1998,
          });
        }
        if (isNeedQuerySettingId) {
          getSetting().then((res) => {
            if (res?.code === 200 && res?.data) {
              self.settingInfoId = res?.data?.settingId;
            }
          });
        }
      } else {
        if (isNeedTip && failTip) {
          uni.showToast({
            title: failTip,
            icon: "none",
            duration: 1998,
          });
        }
      }
      if (isNeedTip) {
        this.drawerType = 0;
        this.isShowDrawer = false;
      }
      this.isNetworkLoading = false;
    },
    // 本地缓存摇奖设置
    saveLuckySettingLocal() {
      // 保存到服务端
      this.saveLuckySettingDebounce(true);

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
    // 检查当前时间和上一次摇奖时间是否跨日
    checkNowIsCrossDay() {
      const self = this;
      let lastDateStr = null;

      // #ifdef H5
      if (localStorage.getItem("settingInfo")) {
        const settingInfoH5 = JSON.parse(localStorage.getItem("settingInfo"));
        lastDateStr = settingInfoH5?.firstRandomDate || null;
      } else {
        // 拿不到配置则不做后续处理了
        return false;
      }
      // #endif

      // 微信端不支持localStorage
      // #ifdef MP-WEIXIN
      wx.getStorage({
        key: "settingInfo",
        success: function (res) {
          const settingInfoWX = JSON.parse(res.data);
          lastDateStr = settingInfoWX?.firstRandomDate || null;
        },
        fail: function () {
          // 拿不到配置则不做后续处理了
          return false;
        },
      });
      // #endif

      const currentDateTime = moment();
      const lastDateTime = moment(lastDateStr);
      console.log(
        "checkNowIsCrossDay",
        currentDateTime.format("YYYY-MM-DD"),
        lastDateTime.format("YYYY-MM-DD")
      );
      if (currentDateTime.format("YYYY-MM-DD") !== lastDateTime.format("YYYY-MM-DD")) {
        return true;
      } else {
        return false;
      }
    },
    // 从服务端初始化之前的摇奖设置
    initCacheSetting() {
      const self = this;
      this.$modal.loading("加载配置中，请耐心等待...");
      this.isNetworkLoading = true;
      getSetting().then((res) => {
        if (res?.code === 200 && res?.data) {
          this.settingInfoId = res?.data?.settingId;
          const lotterySetting = res?.data?.lotterySetting;
          const settingInfo = JSON.parse(lotterySetting) || {};
          if (_.has(settingInfo, "firstRandomDate")) {
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
            self.initDrawLottery();
          } else {
            // 初始化完缓存配置项后初始化今日幸运数字
            self.initTodayLuckyNumber(null);
          }
        } else {
          // 如果云端摇奖设置获取失败，则自动加载本地摇奖设置，并默认没有保存过摇奖设置
          this.settingInfoId = null;
          this.initCacheSettingLocal();
          uni.showToast({
            title: "获取云端摇奖设置失败！已为您自动加载本地摇奖设置~",
            icon: "none",
            duration: 1998,
          });
        }
        self.$modal.closeLoading();
        self.isNetworkLoading = false;
      });
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
        this.initDrawLottery();
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
          self.initDrawLottery();
        },
        fail: function () {
          // 如果第一次进入没有缓存配置，仍然需要生成当日幸运数字
          self.initTodayLuckyNumber(null);
        },
      });
      // #endif
    },
    // 从服务端初始化最近一条同类型记录的期号，仅限大乐透和双色球
    initLastLotteryDateCode() {
      const self = this;
      self.todayDateCode = null;
      const todeyNumberType = mapLotteryNumberType(self.todayWeek);
      const queryParams = {
        pageNum: 1,
        pageSize: 1,
        numberType: todeyNumberType,
      };
      getLogList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            const latestDate = res?.rows[0]?.createTime || "";
            const latestDateFormat = moment(latestDate)?.format("YYYY-MM-DD") || "";
            const nowDateFormat = moment()?.format("YYYY-MM-DD") || "";
            if (
              latestDate &&
              latestDateFormat &&
              nowDateFormat &&
              isTwoOrThreeDaysAfterWithSameYearCheck(latestDateFormat, nowDateFormat)
            ) {
              const latestOfficialDateCode = res?.rows[0]?.dateCode || "";
              self.todayDateCode = latestOfficialDateCode
                ? parseInt(latestOfficialDateCode) + 1
                : null;
            } else {
              const lastDateCode = parseInt(res?.rows[0]?.dateCode) || null;
              if (lastDateCode) {
                self.todayDateCode = calculateCurrentDateCode(parseInt(todeyNumberType), nowDateFormat, latestDateFormat, lastDateCode);
              }
            }
          }
        }
      });
    },
    // 构建本次生成号码的配置记录汇总（收集生成过程中的实际执行结果日志）
    buildGenerateConfigLog() {
      const lines = this._configLogLines || [];
      if (!lines.length) {
        lines.push('本次生成未产生任何配置日志');
      }
      this.settingInfo.lastGenerateConfigLog = [...lines];
    },
    // 打开配置记录弹窗
    openConfigLogDrawer() {
      this.isShowConfigLogDrawer = true;
    },
    // #ifdef H5
    // 关闭摇奖设置弹窗时需重新加载之前保存的设置
    // 这里的回调微信会直接报错，H5正常，所以微信采用watch函数来监听弹窗显示隐藏的变化来重新加载数据
    handleDrawerClose() {
      this.initCacheSetting();
      this.isShowDrawer = false;
    },
    // #endif
    // 显示今日随机号码
    async getLuckyNumber() {
      if (this.todayWeek === "5") {
        uni.showToast({
          title: "非常抱歉，今天是星期五，不提供随机号码选择~",
          icon: "none",
          duration: 1998,
        });
      } else {
        this.showType = "luckyNumber";
        // 不是周五重置一件三连的按钮
        this.settingInfo.isDoneOneClickThreeFriday = false;
        // 是否允许再次生成随机号码
        if (this.checkIsOnlyFirstTodayConfig()) {
          // 初始化本次生成过程的日志收集数组
          this._configLogLines = [`生成时间：${moment().format('YYYY-MM-DD HH:mm:ss')}`];
          let chasingNumObjTmp = null;
          let pastNumObjTmp = null;
          // 后期也是在这里处理追号的查询，目前是只有超管可以配置追号
          if (this.userName && this.userName === "fx67ll") {
            chasingNumObjTmp = await this.queryDailyChasingNumber();
          }
          // 如果打开了需要统计过往开奖号码中的高频数字的开关，则先处理并返回统计的一注再继续往下处理
          if (this.settingInfo.isNeedAddPastRewardNumber && this.userName === "fx67ll") {
            pastNumObjTmp = await this.searchPastNumberFilterByFrequency();
          }
          await this.packageRandomList(chasingNumObjTmp, pastNumObjTmp);

          // 生成配置记录汇总
          this.buildGenerateConfigLog();

          // 如果打开了带一注随机排列五则需要自动生成随机排列五
          const isNeedDailyRandomPL5 = this.settingInfo.isNeedDailyRandomPL5 && this.userName === "fx67ll";
          if (isNeedDailyRandomPL5) {
            this._configLogLines && this._configLogLines.push('[随机排列五] 配置生效 → 开始生成并上传今日随机排列五');
            this.getOtherLuckyNumberDebounce(4);
          } else {
            this._configLogLines && this._configLogLines.push('[随机排列五] 未开启，跳过');
          }

          this.settingInfo.firstRandomDate = moment().format("YYYY-MM-DD");
          this.saveLuckySettingLocal();
        }

        // #ifdef H5
        this.drawerHeight = `${170 +
          this.settingInfo.luckyCount * 30 +
          50 +
          (this.settingInfo.isNeedDailyRandomPL5 ? 30 : 0)
          }px`;
        // #endif

        // #ifdef MP-WEIXIN
        this.drawerHeight = `${200 +
          this.settingInfo.luckyCount * 30 +
          (this.settingInfo.isNeedDailyRandomPL5 ? 30 : 0)
          }px`;
        // #endif

        this.drawerType = 0;
        this.isShowDrawer = true;
      }
    },
    // 查询过往指定期数的中奖号码，提取出现频率最高的单个数字（参考幸运数字逻辑，检查是否包含在随机号码中）
    async searchPastNumberFilterByFrequency() {
      const queryParams = {
        pageNum: 1,
        pageSize: this.settingInfo.pastCheckCount || 23,
        numberType: mapLotteryNumberType(this.todayWeek),
      };
      const pastData = await getLogList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            let allNums = [];
            res.rows.forEach((item) => {
              if (item?.winningNumber) {
                const parts = item.winningNumber.split('-');
                // 前区和后区的号码都纳入统计
                parts.forEach(part => {
                  part.split(',').forEach(n => {
                    const num = parseInt(n.trim());
                    if (!isNaN(num)) allNums.push(num);
                  });
                });
              }
            });
            if (allNums.length > 0) {
              // 取出现频率最高的那个数字
              const topNum = sortNumberByFrequency(allNums, 1)[0];
              return topNum;
            }
            return null;
          } else {
            // #ifdef H5
            uni.showToast({ title: '历史号码数据为空，过往高频号码获取失败！', icon: 'none', duration: 1998 });
            // #endif
            // #ifdef MP-WEIXIN
            uni.showToast({ title: '过往高频号码获取失败！', icon: 'none', duration: 1998 });
            // #endif
            return null;
          }
        } else {
          // #ifdef H5
          uni.showToast({ title: '历史号码接口异常，过往高频号码获取失败！', icon: 'none', duration: 1998 });
          // #endif
          // #ifdef MP-WEIXIN
          uni.showToast({ title: '过往高频号码获取失败！', icon: 'none', duration: 1998 });
          // #endif
          return null;
        }
      });
      return pastData ?? null;
    },
    // 查询每日追号的配置
    async queryDailyChasingNumber() {
      const queryParams = {
        weekType: parseInt(this.todayWeek),
        numberType: parseInt(mapLotteryNumberType(this.todayWeek)),
      };
      const chasingNumber = await getChaseNumberSetting(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            if (res?.rows[0]?.chaseNumber) {
              const arrFir = res?.rows[0]?.chaseNumber?.split("-");
              if (arrFir && arrFir.length > 1) {
                const numFirTmp = (arrFir[0]?.split(",") || []).map((item) =>
                  item ? parseInt(item) : ""
                );
                const numSecTmp = (arrFir[1]?.split(",") || []).map((item) =>
                  item ? parseInt(item) : ""
                );
                const resultChasingNumberTmpObj = {
                  timeStamp: new Date().getTime(),
                  lotteryNumberFirst: numFirTmp,
                  lotteryNumberSecond: numSecTmp,
                };
                return resultChasingNumberTmpObj;
              }
              return null;
            }
            return null;
          } else {
            uni.showToast({
              title: "每日追号配置查询为空！",
              icon: "none",
              duration: 1998,
            });
            return null;
          }
        } else {
          uni.showToast({
            title: "每日追号配置查询失败！",
            icon: "none",
            duration: 1998,
          });
          return null;
        }
      });
      return chasingNumber || null;
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
            _.isEqual(tempList, this.luckyNumberList[i].lotteryNumberFirst) ||
            _.isEqual(tempList, this.luckyNumberList[i].lotteryNumberSecond)
          ) {
            isSameNumber = true;
          }
          // #endif
          // #ifdef MP-WEIXIN
          if (_.isEqual(tempList, [this.luckyNumberList[i].lotteryNumberSecond[0].num])) {
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
    // 辅助方法：将工具函数返回的数组转为内部号码对象格式
    buildFreqNumberObj(numberArray, numberType) {
      let first = [], second = [];
      if (numberType === '1') { // 大乐透
        first = numberArray.slice(0, 5);
        second = numberArray.slice(5, 7);
      } else { // 双色球
        first = numberArray.slice(0, 6);
        second = numberArray.slice(6, 7);
      }
      return {
        timeStamp: new Date().getTime(),
        lotteryNumberFirst: first,
        lotteryNumberSecond: second
      };
    },
    // 组装今日随机号码
    async packageRandomList(chasingNumber, pastHighFreNumber) {
      this.luckyNumberList = [];
      let randomInitLength = this.settingInfo.luckyCount;
      const dayOfYear = moment().dayOfYear();
      const lotteryType = mapLotteryNumberType(this.todayWeek);
      const lotteryName = lotteryType === '1' ? '大乐透' : '双色球';
      const isAdmin = this.userName === 'fx67ll';
      const lotteryKey = lotteryType === '1' ? 'DLT' : 'SSQ';
      const numType = lotteryType === '1' ? 1 : 2;

      // 日志工具：只写入配置记录弹窗，不打印到控制台
      const log = (msg) => {
        this._configLogLines && this._configLogLines.push(msg);
      };

      log(`[生成开始] 彩票类型：${lotteryName}，配置随机注数：${this.settingInfo.luckyCount} 注，允许重复串号：${this.settingInfo.isNeedRepeat ? '是' : '否'}`);

      if (isAdmin) {
        // 固定追加注：追号、高频组合、低频组合，不占用随机注数配置
        // randomInitLength 直接等于用户配置的随机注数
        randomInitLength = this.settingInfo.luckyCount;
        const fixedParts = [];
        if (this.settingInfo.isNeedDailyChasingNumber) fixedParts.push('每日追号 1 注');
        if (this.settingInfo.isNeedHighFrequencyCombination) fixedParts.push('高频组合 1 注');
        if (this.settingInfo.isNeedLowFrequencyCombination) fixedParts.push('低频组合 1 注');
        const fixedDesc = fixedParts.length > 0 ? `固定追加：${fixedParts.join('、')}` : '无固定追加注';
        log(`[注数分配] 管理员模式 - 随机注数：${randomInitLength} 注，${fixedDesc}，总计：${randomInitLength + fixedParts.length} 注`);
      } else {
        log(`[注数分配] 游客模式 - 全部 ${randomInitLength} 注为随机号码`);
      }

      // ── 固定注生成（追号、过往高频、高低频组合）──
      // 追号
      if (isAdmin && this.settingInfo.isNeedDailyChasingNumber) {
        const chasingSrc = lotteryType === '1' ? this.luckyNumberDLT : this.luckyNumberSSQ;
        const chaseOk = lotteryType === '1'
          ? chasingNumber?.lotteryNumberFirst?.length === 5 && chasingNumber?.lotteryNumberSecond?.length === 2
          : chasingNumber?.lotteryNumberFirst?.length === 6 && chasingNumber?.lotteryNumberSecond?.length === 1;
        if (chaseOk) {
          this.luckyNumberList.push(this.packageTempObjForWX(chasingNumber));
          log(`[每日追号] 已追加配置追号（固定追加注，不占用随机注数）- 前区：${chasingNumber.lotteryNumberFirst.join(',')}，后区：${chasingNumber.lotteryNumberSecond.join(',')}`);
        } else {
          this.luckyNumberList.push(this.packageTempObjForWX(chasingSrc));
          log(`[每日追号] 配置追号数据异常，已使用默认${lotteryName}追号（固定追加注）- 前区：${chasingSrc.lotteryNumberFirst.join(',')}，后区：${chasingSrc.lotteryNumberSecond.join(',')}`);
        }
      } else if (isAdmin) {
        log('[每日追号] 未开启，跳过');
      }

      // 过往高频（不再追加为固定注，而是作为检查条件传入随机生成）
      if (isAdmin && this.settingInfo.isNeedAddPastRewardNumber) {
        if (pastHighFreNumber != null) {
          log(`[过往高频] 已开启，过往 ${this.settingInfo.pastCheckCount} 期出现频率最高号码：${pastHighFreNumber}，将在普通随机生成时强制包含`);
        } else {
          log(`[过往高频] 已开启但未获取到数据（查询期数：${this.settingInfo.pastCheckCount}），跳过检查`);
        }
      }

      // 高频低频组合
      if (this.todayWeek !== '5' && isAdmin) {
        // 🔽🔽🔽 高频低频组合需求 开始 🔽🔽🔽
        try {
          const res = await listHistoryStatistics();
          if (res?.code === 200 && res?.rows) {
            const freqData = getLotteryNumberByFrequency(res, dayOfYear);
            const highFreq = lotteryType === '1' ? freqData.lotteryDLTHighFrequency : freqData.lotterySSQHighFrequency;
            const lowFreq = lotteryType === '1' ? freqData.lotteryDLTLowFrequency : freqData.lotterySSQLowFrequency;
            const frontLen = lotteryType === '1' ? 5 : 6;
            const backLen = lotteryType === '1' ? 2 : 1;
            if (this.settingInfo.isNeedHighFrequencyCombination) {
              const highObj = this.buildFreqNumberObj(highFreq, lotteryType);
              this.luckyNumberList.push(this.packageTempObjForWX(highObj));
              log(`[高频组合] ${lotteryName}历史高频号码已追加（固定追加注，不占用随机注数）- 前区：${highFreq.slice(0, frontLen).join(',')}，后区：${highFreq.slice(frontLen, frontLen + backLen).join(',')}`);
            } else {
              log('[高频组合] 未开启，跳过');
            }
            if (this.settingInfo.isNeedLowFrequencyCombination) {
              const lowObj = this.buildFreqNumberObj(lowFreq, lotteryType);
              this.luckyNumberList.push(this.packageTempObjForWX(lowObj));
              log(`[低频组合] ${lotteryName}历史低频号码已追加（固定追加注，不占用随机注数）- 前区：${lowFreq.slice(0, frontLen).join(',')}，后区：${lowFreq.slice(frontLen, frontLen + backLen).join(',')}`);
            } else {
              log('[低频组合] 未开启，跳过');
            }
          }
        } catch (e) {
          console.error('获取高频/低频组合失败：' + JSON.stringify(e));
        }
        // 🔼🔼🔼 高频低频组合需求 结束 🔼🔼🔼
      }

      // 记录固定注结束位置，随机注从这里开始
      const fixedEndIndex = this.luckyNumberList.length;
      const isHotColdAppend = this.settingInfo.isHotColdWeighted && !this.settingInfo.isOverrideRandomLogic && isAdmin;
      const isHotColdOverride = this.settingInfo.isHotColdWeighted && this.settingInfo.isOverrideRandomLogic && isAdmin;
      const weightName = this.settingInfo.hotColdWeightType === 'hot' ? '热' : '冷';

      // 工具：生成单注普通随机号码，逐注检查重复串号、幸运数字、过往高频号码，不满足只重摇该注
      // pastHighFreNum 为过往出现频率最高的单个数字（number | null）
      const generateOneNote = (index, label, pastHighFreNum) => {
        let attempt = 0;
        let obj;
        do {
          attempt++;
          obj = this.packageTempObj(lotteryKey, index + attempt);
          if (attempt > 1) {
            log(`[随机生成] 第 ${index + 1} 注${label}重摇第 ${attempt} 次 - 前区：${obj.lotteryNumberFirst.join(',')}，后区：${obj.lotteryNumberSecond.join(',')}`);
          } else {
            log(`[随机生成] 第 ${index + 1} 注${label} - 前区：${obj.lotteryNumberFirst.join(',')}，后区：${obj.lotteryNumberSecond.join(',')}`);
          }
          // 检查重复串号（关闭时不允许重复）
          if (!this.settingInfo.isNeedRepeat) {
            const isDuplicate = this.luckyNumberList.some(existing =>
              _.isEqual(existing.lotteryNumberFirst.map(n => n.num), obj.lotteryNumberFirst) ||
              _.isEqual(existing.lotteryNumberSecond.map(n => n.num), obj.lotteryNumberSecond)
            );
            if (isDuplicate) {
              log(`[随机生成] 第 ${index + 1} 注${label}与已有号码重复，重摇`);
              continue;
            }
          }
          // 检查幸运数字
          if (this.settingInfo.isNeedLuckyNumber) {
            const lucky = String(this.settingInfo.todayLuckyNumber);
            const inFirst = obj.lotteryNumberFirst.some(n => String(n) === lucky);
            const inSecond = obj.lotteryNumberSecond.some(n => String(n) === lucky);
            if (!inFirst && !inSecond) {
              log(`[随机生成] 第 ${index + 1} 注${label}未含幸运数字 ${lucky}，重摇`);
              continue;
            }
          }
          // 检查过往高频号码
          if (this.settingInfo.isNeedAddPastRewardNumber && pastHighFreNum != null) {
            const freqStr = String(pastHighFreNum);
            const inFirst = obj.lotteryNumberFirst.some(n => String(n) === freqStr);
            const inSecond = obj.lotteryNumberSecond.some(n => String(n) === freqStr);
            if (!inFirst && !inSecond) {
              log(`[随机生成] 第 ${index + 1} 注${label}未含过往高频号码 ${pastHighFreNum}，重摇`);
              continue;
            }
          }
          break;
        } while (attempt < 444);
        return obj;
      };

      // ── 随机注生成 ──
      // 🔽🔽🔽 冷热加权需求 开始 🔽🔽🔽
      if (isHotColdAppend) {
        // 追加模式：先生成 (randomInitLength - 1) 注普通随机（逐注检查幸运数字），最后生成 1 注冷热加权（不参与重摇）
        const normalCount = randomInitLength - 1;
        log(`[冷热加权] 追加模式 - 共 ${randomInitLength} 注，其中普通随机 ${normalCount} 注 + ${weightName}加权 1 注`);
        for (let i = 0; i < normalCount; i++) {
          const obj = generateOneNote(i, '（普通随机）', pastHighFreNumber);
          this.luckyNumberList.push(this.packageTempObjForWX(obj));
        }
        log(`[冷热加权] 开始生成追加注（该注不受以下配置约束：允许重复串号、幸运数字包含、过往高频号码）`);
        const weightedObj = await this.buildWeightedNumberObj(numType, this.settingInfo.hotColdWeightType);
        if (weightedObj) {
          this.luckyNumberList.push(this.packageTempObjForWX(weightedObj));
          log(`[随机生成] 第 ${randomInitLength} 注（${weightName}加权，不参与随机配置检查）- 前区：${weightedObj.lotteryNumberFirst.join(',')}，后区：${weightedObj.lotteryNumberSecond.join(',')}`);
        } else {
          const fallback = this.packageTempObj(lotteryKey, normalCount);
          this.luckyNumberList.push(this.packageTempObjForWX(fallback));
          log(`[随机生成] 第 ${randomInitLength} 注（${weightName}加权失败，降级普通随机，同样不参与随机配置检查）- 前区：${fallback.lotteryNumberFirst.join(',')}，后区：${fallback.lotteryNumberSecond.join(',')}`);
        }
      } else if (isHotColdOverride) {
        // 覆盖模式：全部注数由冷热加权生成，逐注检查幸运数字，不满足只重摇该注
        log(`[冷热加权] 覆盖模式 - 全部 ${randomInitLength} 注由${weightName}加权生成（覆盖模式下随机相关配置已关闭，不做额外检查）`);
        for (let i = 0; i < randomInitLength; i++) {
          let attempt = 0;
          let finalObj;
          do {
            attempt++;
            const weightedObj = await this.buildWeightedNumberObj(numType, this.settingInfo.hotColdWeightType);
            finalObj = weightedObj || this.packageTempObj(lotteryKey, i + attempt);
            const label = weightedObj ? `${weightName}加权` : `${weightName}加权失败降级`;
            if (attempt > 1) {
              log(`[随机生成] 第 ${i + 1} 注（${label}）重摇第 ${attempt} 次 - 前区：${finalObj.lotteryNumberFirst.join(',')}，后区：${finalObj.lotteryNumberSecond.join(',')}`);
            } else {
              log(`[随机生成] 第 ${i + 1} 注（${label}）- 前区：${finalObj.lotteryNumberFirst.join(',')}，后区：${finalObj.lotteryNumberSecond.join(',')}`);
            }
            break;
          } while (attempt < 444);
          this.luckyNumberList.push(this.packageTempObjForWX(finalObj));
        }
      } else {
        // 普通随机模式：逐注生成，逐注检查幸运数字，不满足只重摇该注
        if (isAdmin && this.settingInfo.isHotColdWeighted) {
          log('[冷热加权] 已开启但未开启覆盖，走普通随机');
        } else {
          log(`[随机生成] 普通随机模式，共生成 ${randomInitLength} 注`);
        }
        for (let i = 0; i < randomInitLength; i++) {
          const obj = generateOneNote(i, '', pastHighFreNumber);
          this.luckyNumberList.push(this.packageTempObjForWX(obj));
        }
      }
      // 🔼🔼🔼 冷热加权需求 结束 🔼🔼🔼

      log(`[生成汇总] 本次共生成 ${this.luckyNumberList.length} 注号码`);

      // 如果打开了只允许一注随机则需要缓存当日的随机号码
      if (this.settingInfo.isOnlyFirstToday) {
        this.settingInfo.localLuckyNumberList = this.luckyNumberList;
        this.saveLuckySettingLocal();
      }
    },
    // 判断是否包含当日的幸运数字
    checkHasTodayLuckyNumber() {
      const self = this;
      // 🔽🔽🔽 冷热加权需求 开始 🔽🔽🔽
      // 覆盖模式下幸运数字逻辑不生效（仅管理员 fx67ll 的冷热加权生效）
      if (this.settingInfo.isHotColdWeighted && this.settingInfo.isOverrideRandomLogic && this.userName === "fx67ll") {
        const msg = '[幸运数字] 跳过 - 冷热加权覆盖模式已开启，幸运数字强制包含逻辑不生效';
        this._configLogLines && this._configLogLines.push(msg);
        return true;
      }
      // 🔼🔼🔼 冷热加权需求 结束 🔼🔼🔼
      if (this.settingInfo.isNeedLuckyNumber) {
        let hasTodayLuckyNumber = false;
        this.luckyNumberList.forEach(function (item) {
          item.lotteryNumberFirst.forEach(function (ita) {
            if (JSON.stringify(ita.num) === JSON.stringify(self.settingInfo.todayLuckyNumber)) {
              hasTodayLuckyNumber = true;
            }
          });
          item.lotteryNumberSecond.forEach(function (itb) {
            if (JSON.stringify(itb.num) === JSON.stringify(self.settingInfo.todayLuckyNumber)) {
              hasTodayLuckyNumber = true;
            }
          });
        });
        const msg = `[幸运数字] 检查 - 今日幸运数字：${self.settingInfo.todayLuckyNumber}，本次号码${hasTodayLuckyNumber ? '已包含，无需重摇' : '未包含，将重新摇号'}`;
        self._configLogLines && self._configLogLines.push(msg);
        return hasTodayLuckyNumber;
      } else {
        const msg = '[幸运数字] 跳过 - 「当日幸运数字包含」未开启，不做强制检查';
        self._configLogLines && self._configLogLines.push(msg);
        return true;
      }
    },
    // 本来是特供微信处理包装单条随机号码，微信小程序不支持key使用表达式，包装一下再渲染
    // 目前为统一处理成微信小程序支持的数据结构
    packageTempObjForWX(numberObj) {
      let tempFirst = [];
      let tempSecond = [];
      let tempObj = {
        ...numberObj,
      };
      _.each(tempObj.lotteryNumberFirst, function (ita, ina) {
        let temObj = {
          num: ita,
          key: Math.random() * ita + ina,
        };
        tempFirst.push(temObj);
      });
      _.each(tempObj.lotteryNumberSecond, function (itb, inb) {
        let temObj = {
          num: itb,
          key: Math.random() * itb + inb,
        };
        tempSecond.push(temObj);
      });
      tempObj.lotteryNumberFirst = tempFirst;
      tempObj.lotteryNumberSecond = tempSecond;
      return tempObj;
    },
    // 包装单条随机号码
    packageTempObj(type, mix) {
      let objTemp = {
        timeStamp: new Date().getTime() + mix,
        lotteryNumberFirst: [],
        lotteryNumberSecond: [],
      };
      if (type === "DLT") {
        objTemp.lotteryNumberFirst = this.rollNumber([], this.luckyNumberFront, 5);
        objTemp.lotteryNumberSecond = this.rollNumber([], this.luckyNumberBack, 2);
      }
      if (type === "SSQ") {
        objTemp.lotteryNumberFirst = this.rollNumber([], this.luckyNumberRed, 6);
        objTemp.lotteryNumberSecond = this.rollNumber([], this.luckyNumberBlue, 1);
      }
      return objTemp;
    },
    // 统一处理提示是否需要操作完关闭弹窗
    isNeedCloseDrawerConfirm(successTip) {
      const self = this;
      showConfirm(`${successTip}，是否需要为您关闭抽屉？`).then((res) => {
        if (res?.confirm) {
          self.drawerType = 0;
          self.isShowDrawer = false;
        }
      });
    },
    // 处理上传号码记录
    handleUplaodTodayNumber(todayNumber, isNeedConfirm) {
      const self = this;
      const fixNumList = [];
      if (this.userName && this.userName === "fx67ll") {
        fixNumList.push({ ...this.luckyNumberList[0] });
      }
      let todayNumType = "";
      if (["1", "3", "6"].includes(this.todayWeek)) {
        todayNumType = "1";
      }
      if (["2", "4", "7"].includes(this.todayWeek)) {
        todayNumType = "2";
      }
      this.isNetworkLoading = true;
      const addParams = {
        recordNumber: todayNumber,
        chaseNumber:
          fixNumList.length > 0 ? this.formatNumberListForUpload(fixNumList) : "",
        numberType: todayNumType,
        weekType: this.todayWeek,
        hasMorePurchases: "N",
        dateCode: this.todayDateCode,
      };
      addLog(addParams).then((res) => {
        self.isNetworkLoading = false;
        if (res?.code === 200) {
          // isNeedConfirm如果为true，则表示为是需要弹出关闭确认框的，如果为false，则表示不需要
          if (isNeedConfirm) {
            self.isNeedCloseDrawerConfirm("号码记录已经成功保存到云端");
          }
        } else {
          uni.showToast({
            title: "号码记录保存失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    // 上传当前生成的随机号码
    uploadLuckyNumber(isNeedConfirm) {
      const self = this;
      if (this.luckyNumberList && this.luckyNumberList.length > 0) {
        const buyingNumList = this.luckyNumberList.filter((item, index) => index > 0);
        const todayNumber = this.formatNumberListForUpload(
          self.userName && self.userName === "fx67ll"
            ? buyingNumList
            : self.luckyNumberList
        );
        const queryParams = {
          pageNum: 1,
          pageSize: 1,
          recordNumber: todayNumber,
        };
        getLogList(queryParams).then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              // isNeedConfirm如果为true，则表示为是需要弹出关闭确认框的，如果为false，则表示不需要
              if (isNeedConfirm) {
                showConfirm("查询到相同随机号码记录，是否需要再次上传该号码记录？").then(
                  (res) => {
                    if (res?.confirm) {
                      self.handleUplaodTodayNumber(todayNumber, isNeedConfirm);
                    }
                  }
                );
              }
            } else {
              self.handleUplaodTodayNumber(todayNumber, isNeedConfirm);
            }
          } else {
            uni.showToast({
              title: "查询历史号码记录失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      } else {
        uni.showToast({
          title: "请先点击获取今日随机号码~",
          icon: "none",
          duration: 1998,
        });
      }
    },
    // 上传当前生成的随机号码 - 防抖处理
    uploadLuckyNumberDebounce: _.debounce(function (isNeedConfirm) {
      this.uploadLuckyNumber(isNeedConfirm);
    }, 233),
    // 保存到云端的号码记录需要重新处理下
    formatNumberListForUpload(list) {
      let textResult = "";
      _.each(list, (item, key) => {
        _.each(item?.lotteryNumberFirst, (ita, kya) => {
          if (kya !== item.lotteryNumberFirst.length - 1) {
            textResult = textResult.concat(`${ita?.num},`);
          } else {
            textResult = textResult.concat(`${ita?.num}-`);
          }
        });
        _.each(item?.lotteryNumberSecond, (itb, kyb) => {
          if (kyb !== item.lotteryNumberSecond.length - 1) {
            textResult = textResult.concat(`${itb?.num},`);
          } else {
            textResult = textResult.concat(`${itb?.num}`);
          }
        });
        if (key !== list.length - 1) {
          textResult = textResult.concat("/");
        }
      });
      return textResult;
    },
    // 复制给发给彩票店老板的内容
    async copyLuckyNumber() {
      const self = this;
      let luckyTitle = "";
      // let luckyFooter = '\n 老板号码别打错了哈，谢谢~';
      let luckyFooter = "";
      let luckyContent = null;
      // const tempLuckyText = "\n 外加一注随机排列五";

      // #ifdef H5
      // luckyContent = document
      //   .getElementById("luckyNumberText")
      //   .innerHTML.replace(/(<\/?span.*?>)/g, " ")
      //   .replace(/<\/?view.*?>/gi, "\n");
      // #endif
      // #ifdef MP-WEIXIN
      // luckyContent = this.packageContextForWX();
      // #endif

      // 上面H5的实现方式有点问题，统一使用小程序的处理方式即可
      luckyContent = this.packageContextForWX();
      const totalCount = this.luckyNumberList.length;
      if (mapLotteryNumberType(this.todayWeek) === "1") {
        luckyTitle = " 老板买" + totalCount + "注自选号码大乐透\n";
      }
      if (mapLotteryNumberType(this.todayWeek) === "2") {
        luckyTitle = " 老板买" + totalCount + "注自选号码双色球\n";
      }

      // if (this.userName && this.userName === "fx67ll") {
      //   this.copyTextContent = luckyTitle + luckyContent + luckyFooter + tempLuckyText;
      // } else {
      //   this.copyTextContent = luckyTitle + luckyContent + luckyFooter;
      // }

      // 如果打开了带一注随机排列五则需要调用一下这个方法，获取最新生成的随机排列五号码
      if (this.settingInfo.isNeedDailyRandomPL5 && this.userName === "fx67ll") {
        const dailyRandomPL5Title = "\n 老板买1注自选号码排列五\n";
        const dailyRandomPL5Text = await this.getLatestPL5Record(false);
        this.copyTextContent =
          luckyTitle +
          luckyContent +
          dailyRandomPL5Title +
          dailyRandomPL5Text +
          luckyFooter;
      } else {
        this.copyTextContent = luckyTitle + luckyContent + luckyFooter;
      }

      // 如果打开了每天只生成一次随机号码，则在点击拷贝的时候直接上传生成的随机号码
      if (this.settingInfo.isOnlyFirstToday) {
        this.uploadLuckyNumberDebounce(false);
      }

      uni.setClipboardData({
        data: self.copyTextContent,
        showToast: false, // 仅支持 App (3.2.13+)、H5 (3.2.13+)
        success: function (res) {
          // #ifdef H5
          // 微信不支持关闭复制成功提示所以暂时只支持H5
          self.isNeedCloseDrawerConfirm("已为您成功复制到剪切板~");
          // #endif
          console.log("复制到剪切板操作成功: " + JSON.stringify(res));
        },
        fail: function (err) {
          uni.showToast({
            title: "复制到剪切板操作失败！请联系管理员处理! ",
            icon: "none",
            duration: 1998,
          });
          console.error("复制到剪切板操作失败: " + JSON.stringify(err));
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
        _.each(item.lotteryNumberFirst, function (ita, ina) {
          singleContextFirst = singleContextFirst.concat(
            ina === 0 ? ` ` : "",
            `${JSON.stringify(ita.num)}  `
          );
        });
        _.each(item.lotteryNumberSecond, function (itb, inb) {
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
      if (mapLotteryNumberType(this.todayWeek) === "1") {
        this.initDLT();
      }
      if (mapLotteryNumberType(this.todayWeek) === "2") {
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
        if (mapLotteryNumberType(this.todayWeek) === "1") {
          this.settingInfo.todayLuckyNumber = Math.floor(Math.random() * (36 - 1) + 1);
        }
        if (mapLotteryNumberType(this.todayWeek) === "2") {
          this.settingInfo.todayLuckyNumber = Math.floor(Math.random() * (34 - 1) + 1);
        }
      } else if (this.todayWeek === "5") {
        this.settingInfo.todayLuckyNumber = "0";
      }
      this.saveLuckySettingLocal();
    },
    // 打开摇奖设置
    editLuckySetting() {
      this.showType = "luckySetting";

      // #ifdef MP-WEIXIN
      // 小程序端：保持原有的精确高度计算逻辑
      const systemInfo = uni.getSystemInfoSync();
      const windowHeight = systemInfo.windowHeight;
      const statusBarHeight = systemInfo.statusBarHeight || 0;
      const titleBarHeight = 44;
      const bottomPadding = 20;

      let contentItemCount = 0;
      contentItemCount += 4;

      // 基础必选项（所有用户都有的设置项）
      contentItemCount += 4; // 注数、是否重复、包含幸运数字、仅生成一次

      // 根据用户名动态添加高级选项
      if (this.userName === 'fx67ll') {
        contentItemCount += 5;
      } else {
        if (this.settingInfo.isNeedAddPastRewardNumber) {
          contentItemCount += 2;
        } else {
          contentItemCount += 1;
        }
      }

      const itemHeight = 55;
      const buttonAreaHeight = 70;
      const tipHeight = 40;
      const contentItemTotalHeight = contentItemCount * itemHeight;
      const extraButtonHeight = buttonAreaHeight;
      const hasTip = this.userName !== 'fx67ll';
      const tipTotalHeight = hasTip ? tipHeight : 0;

      // 内容所需最小高度 = 所有设置项 + 提示 + 按钮区域 + 顶部标题栏（抽屉自带的标题栏，zb-drawer 会处理，此处加入是为了防止抽屉内容顶到标题栏）
      const requiredHeight = titleBarHeight + contentItemTotalHeight + tipTotalHeight + extraButtonHeight + bottomPadding;

      // 3. 确定最终抽屉高度：取 requiredHeight 与最大可用高度之间的较小值
      const maxAvailableHeight = windowHeight - statusBarHeight - titleBarHeight;
      const bestDrawerHeight = Math.min(requiredHeight, maxAvailableHeight);

      console.log('小程序端 - 系统高度:', windowHeight, '内容需高:', requiredHeight, '最终使用:', bestDrawerHeight);
      this.drawerHeight = `${bestDrawerHeight}px`;
      // #endif

      // #ifdef H5
      // H5端（含移动端浏览器）：直接设为100%高度，内部内容区域超出自动滚动
      // 注意：需确保 zb-drawer 内部的内容容器样式设置了 overflow-y: auto
      this.drawerHeight = '90%';
      console.log('H5端 - 设置高度为90%，内部内容自动滚动');
      // #endif

      this.drawerType += 1;
      this.isShowDrawer = true;
    },
    // 监听注数监听
    luckyCountChange(e) {
      this.settingInfo.luckyCount = e;
      // this.saveLuckySettingLocal();
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 监听是否允许重复
    isNeedRepeatChange(e) {
      this.settingInfo.isNeedRepeat = e?.detail?.value;
      // this.saveLuckySettingLocal();
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 监听当日是否只允许出现一注随机号码
    isOnlyFirstTodayChange(e) {
      this.settingInfo.isOnlyFirstToday = e?.detail?.value;
      this.settingInfo.localLuckyNumberList = this.luckyNumberList;
      // this.saveLuckySettingLocal();
      if (!e?.detail?.value) {
        this.settingInfo.firstRandomDate = null;
        this.settingInfo.localLuckyNumberList = [];
        // this.saveLuckySettingLocal();
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
      this.settingInfo.isNeedLuckyNumber = e?.detail?.value;
      // this.saveLuckySettingLocal();
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 监听是否需要追加一注过往中奖号码出现的高频数字
    isNeedAddPastChange(e) {
      this.settingInfo.isNeedAddPastRewardNumber = e?.detail?.value;
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
      // this.saveLuckySettingLocal();
    },
    // 监听需要查询过往多少期
    pastCheckCountChange(e) {
      this.settingInfo.pastCheckCount = e;
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
      // this.saveLuckySettingLocal();
    },
    // 监听是否需要日常排列五
    isNeedDailyRandomPL5Change(e) {
      this.settingInfo.isNeedDailyRandomPL5 = e?.detail?.value;
    },
    // 监听是否需要带一注高频号码组合
    isNeedHighFrequencyCombinationChange(e) {
      this.settingInfo.isNeedHighFrequencyCombination = e?.detail?.value;
    },
    // 监听是否需要带一注低频号码组合
    isNeedLowFrequencyCombinationChange(e) {
      this.settingInfo.isNeedLowFrequencyCombination = e?.detail?.value;
    },
    // 监听是否需要每日追号
    isNeedDailyChasingNumberChange(e) {
      this.settingInfo.isNeedDailyChasingNumber = e?.detail?.value;
    },
    // 🔽🔽🔽 冷热加权需求 开始 🔽🔽🔽
    // 监听是否开启冷热加权
    isHotColdWeightedChange(e) {
      const isOn = e?.detail?.value;
      this.settingInfo.isHotColdWeighted = isOn;
      if (isOn) {
        // 打开冷热加权：默认热加权、默认不覆盖随机逻辑
        this.settingInfo.hotColdWeightType = 'hot';
        this.settingInfo.isOverrideRandomLogic = false;
        // 如果当前只生成一注随机是打开的，参考Tip1重置
        if (this.settingInfo.isOnlyFirstToday) {
          this.resetIsOnlyFirstToday();
        }
      } else {
        this.settingInfo.isOverrideRandomLogic = false;
        if (this.settingInfo.isOnlyFirstToday) {
          this.resetIsOnlyFirstToday();
        }
      }
    },
    // 监听冷热加权类型单选
    hotColdWeightTypeChange(e) {
      this.settingInfo.hotColdWeightType = e?.detail?.value;
      if (this.settingInfo.isOnlyFirstToday) {
        this.resetIsOnlyFirstToday();
      }
    },
    // 监听是否覆盖当前随机逻辑
    isOverrideRandomLogicChange(e) {
      const isOn = e?.detail?.value;
      this.settingInfo.isOverrideRandomLogic = isOn;
      if (isOn) {
        // 覆盖模式开启：自动关闭三个随机配置开关
        const closedItems = [];
        if (this.settingInfo.isNeedRepeat) {
          this.settingInfo.isNeedRepeat = false;
          closedItems.push('允许重复串号');
        }
        if (this.settingInfo.isNeedLuckyNumber) {
          this.settingInfo.isNeedLuckyNumber = false;
          closedItems.push('幸运数字包含');
        }
        if (this.settingInfo.isNeedAddPastRewardNumber) {
          this.settingInfo.isNeedAddPastRewardNumber = false;
          closedItems.push('过往高频号码包含');
        }
        const closedMsg = closedItems.length > 0 ? `，已自动关闭并隐藏：${closedItems.join('、')}` : '，上述三项配置均已关闭';
        if (this.settingInfo.isOnlyFirstToday) {
          this.resetIsOnlyFirstToday();
        }
      } else {
        if (this.settingInfo.isOnlyFirstToday) {
          this.resetIsOnlyFirstToday();
        }
      }
    },
    // 使用冷热加权逻辑生成一注号码对象
    async buildWeightedNumberObj(numberType, weightType) {
      try {
        const res = await listHistoryStatistics({ numberType });
        if (!res?.rows?.length) return null;
        const rows = res.rows;
        const numType = parseInt(numberType);
        const lotteryName = numType === 1 ? '大乐透' : '双色球';
        const weightName = weightType === 'hot' ? '热加权' : '冷加权';
        console.log(`====================开始计算冷热加权（${lotteryName} · ${weightName}）====================`);
        this._configLogLines && this._configLogLines.push(`[冷热加权] 开始 - ${lotteryName} · ${weightName}`);

        const logPool = (zone, pool) => {
          const weightMap = {};
          pool.forEach(n => { weightMap[n] = (weightMap[n] || 0) + 1; });
          const sorted = Object.entries(weightMap).sort((a, b) => b[1] - a[1]);
          // 权重池详情只打印到控制台，不写入弹窗日志
          console.log(`[冷热加权] ${zone}加权池大小：${pool.length}，号码权重（号码:权重）：${sorted.map(([n, w]) => `${n}:${w}`).join('  ')}`);
        };

        if (numType === 1) {
          const frontPool = buildWeightedPool(rows, numType, '前区', weightType);
          const backPool = buildWeightedPool(rows, numType, '后区', weightType);
          if (!frontPool || !backPool) return null;
          logPool('前区', frontPool);
          logPool('后区', backPool);
          const front = drawFromWeightedPool(frontPool, 5);
          const back = drawFromWeightedPool(backPool, 2);
          const msg = `[冷热加权] 大乐透${weightName}结果 - 前区：${front.join(',')}，后区：${back.join(',')}`;
          this._configLogLines && this._configLogLines.push(msg);
          return { timeStamp: new Date().getTime(), lotteryNumberFirst: front, lotteryNumberSecond: back };
        }
        if (numType === 2) {
          const frontPool = buildWeightedPool(rows, numType, '前区', weightType);
          const backPool = buildWeightedPool(rows, numType, '后区', weightType);
          if (!frontPool || !backPool) return null;
          logPool('前区', frontPool);
          logPool('后区', backPool);
          const front = drawFromWeightedPool(frontPool, 6);
          const back = drawFromWeightedPool(backPool, 1);
          const msg = `[冷热加权] 双色球${weightName}结果 - 前区：${front.join(',')}，后区：${back.join(',')}`;
          this._configLogLines && this._configLogLines.push(msg);
          return { timeStamp: new Date().getTime(), lotteryNumberFirst: front, lotteryNumberSecond: back };
        }
        return null;
      } catch (e) {
        console.error('冷热加权号码生成失败：' + JSON.stringify(e));
        return null;
      }
    },
    // 🔼🔼🔼 冷热加权需求 结束 🔼🔼🔼
    // 图片上传结束后需要还原加载状态
    afterPicUploadFinished() {
      this.isNetworkLoading = false;
      this.pictureUploadNumber = 0;
    },
    // 拷贝选中的识别结果文字字块
    copyCheckTagText() {
      const self = this;
      let copyResTxt = "";
      this.ocrTagCheckList.forEach((item, index) => {
        if (item?.isCheck) {
          if (index === self.ocrTagCheckList.length - 1) {
            copyResTxt = copyResTxt.concat(item?.words);
          } else {
            copyResTxt = copyResTxt.concat(item?.words + ",");
          }
        }
      });
      uni.setClipboardData({
        data: copyResTxt,
        showToast: false, // 仅支持 App (3.2.13+)、H5 (3.2.13+)
        success: function (res) {
          // #ifdef H5
          // 微信不支持关闭复制成功提示所以暂时只支持H5
          uni.showToast({
            title: "已为您成功复制到剪切板~",
            icon: "none",
            duration: 1998,
          });
          // #endif
          console.log("复制到剪切板操作成功: " + JSON.stringify(res));
        },
        fail: function (err) {
          uni.showToast({
            title: "复制到剪切板操作失败！请联系管理员处理! ",
            icon: "none",
            duration: 1998,
          });
          console.error("复制到剪切板操作失败: " + JSON.stringify(err));
        },
      });
    },
    // 修改识别结果的tag状态
    changeTagStatus(tagIndex) {
      const self = this;
      this.ocrTagList[tagIndex].isCheck = !this.ocrTagList[tagIndex].isCheck;
      this.ocrTagCheckList = [];
      this.ocrTagList.forEach((item) => {
        if (item?.isCheck) {
          self.ocrTagCheckList.push({ ...item });
        }
      });
    },
    // OCR识别成功之后打开弹窗显示识别的图片
    afterBaiduOcrSuccess(baiduOcrFileUrl) {
      // 设置OCR识别弹窗显示的识别图片
      this.lotteryTicketArr = [];
      this.lotteryTicketArr.push(baiduOcrFileUrl);
      // 清除弹窗标题的定时器
      clearInterval(this.timer);
      this.timer = null;
      this.drawerTitle = "待处理分析结果";
      // 打开弹窗
      this.showType = "luckyPhoto";
      this.drawerHeight = "80%";
      this.drawerType = 0;
      this.isShowDrawer = true;
    },
    // 百度OCR结果返回之后的回调
    ocrResultCallBack(ocrCallBackRes, baiduOcrFileUrl) {
      // console.log("ocrCallBackRes", ocrCallBackRes);
      // 关闭加载状态
      this.afterPicUploadFinished();
      // 存储分析结果
      if (
        ocrCallBackRes?.data?.words_result &&
        ocrCallBackRes?.data?.words_result.length > 0
      ) {
        const corTempList = [];
        const ocrResList = ocrCallBackRes?.data?.words_result;
        ocrResList.forEach((item, index) => {
          corTempList.push({
            words: item?.words,
            isCheck: false,
            timeStamp: new Date().getTime() + index,
          });
        });
        this.ocrTagList = [...corTempList];
      } else {
        this.ocrTagList = [];
        this.ocrTagCheckList = [];
        uni.showToast({
          title: "百度OCR识别结果为空，请联系管理员！",
          icon: "none",
          duration: 1998,
        });
      }
      this.afterBaiduOcrSuccess(baiduOcrFileUrl);
    },
    // 使用百度OCR分析，注意！！！百度OCR识别需要先获取鉴权信息~
    analysisByBaiduOcr(ocrPubKey, ocrSecKey, fileCloudUrl) {
      const self = this;
      uni
        .request({
          method: "POST",
          timeout: 102344,
          // #ifdef H5
          url: "/baiduOcrAuth",
          // #endif
          // #ifdef MP-WEIXIN
          url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${ocrPubKey}&client_secret=${ocrSecKey}`,
          // #endif
          dataType: "json",
        })
        .then((baiduOcrAuthRes) => {
          // console.log("baiduOcrAuthRes", baiduOcrAuthRes);
          if (
            baiduOcrAuthRes &&
            baiduOcrAuthRes.length > 1 &&
            baiduOcrAuthRes[1]?.data?.access_token
          ) {
            uni.request({
              method: "POST",
              timeout: 102344,
              // #ifdef H5
              url: "/baiduOcr",
              // #endif
              // #ifdef MP-WEIXIN
              url: `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${baiduOcrAuthRes[1]?.data?.access_token}`,
              // #endif
              data: {
                url: fileCloudUrl,
              },
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              dataType: "json",
              success: function (baiduOcrRes) {
                // console.log("baiduOcrRes", baiduOcrRes);
                self.ocrResultCallBack(baiduOcrRes, fileCloudUrl);
              },
              fail: (err) => {
                uni.showToast({
                  title: "百度OCR识别接口调用失败，请联系管理员！",
                  icon: "none",
                  duration: 1998,
                });
                console.error("百度OCR识别接口调用失败: " + JSON.stringify(err));
                self.afterPicUploadFinished();
              },
              complete: (res) => {
                console.log("百度OCR识别接口调用完成: " + JSON.stringify(res));
              },
            });
          } else {
            uni.showToast({
              title: "百度OCR鉴权接口调用失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
            self.afterPicUploadFinished();
          }
        })
        .catch((err) => {
          self.afterPicUploadFinished();
        });
    },
    // 获取百度OCR分析必须的配置
    qryBaiduOcrConfig(fileCloudUrl) {
      const self = this;
      getSecretConfig({ secretKey: "ocrPubKey" }).then((res) => {
        if (res && res?.rows && res?.rows.length > 0 && res?.code === 200) {
          const ocrPubKey = decryptString(res.rows[0].secretValue, getCryptoSaltKey());
          getSecretConfig({ secretKey: "ocrSecKey" }).then((res) => {
            if (res && res?.rows && res?.rows.length > 0 && res?.code === 200) {
              const ocrSecKey = decryptString(
                res.rows[0].secretValue,
                getCryptoSaltKey()
              );
              self.analysisByBaiduOcr(ocrPubKey, ocrSecKey, fileCloudUrl);
            } else {
              uni.showToast({
                title: "查询百度OCR分析配置项SecretKey失败！",
                icon: "none",
                duration: 1998,
              });
            }
          });
        } else {
          uni.showToast({
            title: "查询百度OCR分析配置项PublicKey失败！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    // 上传图片到uniCloud，目前是改为使用若依的上传接口
    uploadPicForBaiDuOcr(fileList) {
      const self = this;
      this.isNetworkLoading = true;
      uni.uploadFile({
        url: "https://vip.fx67ll.com/vip-api/common/upload", //仅为示例，非真实的接口地址
        // #ifdef H5
        filePath: fileList[0].path,
        // #endif
        // #ifdef MP-WEIXIN
        filePath: fileList[0].tempFilePath,
        // #endif
        name: "file",
        header: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
        success: (uploadFileRes) => {
          // console.log("uploadFileRes", uploadFileRes);
          if (uploadFileRes && uploadFileRes?.statusCode === 200 && uploadFileRes?.data) {
            const uploadFileResData = JSON.parse(uploadFileRes?.data);
            // console.log("uploadFileResData", uploadFileResData);
            if (uploadFileResData?.code === 200 && uploadFileResData?.url) {
              self.qryBaiduOcrConfig(uploadFileResData?.url);
            }
          } else {
            self.afterPicUploadFinished();
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "ruoyi-fx67ll 图片上传接口调用失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
          console.error("ruoyi-fx67ll 图片上传接口调用失败: " + JSON.stringify(err));
          self.afterPicUploadFinished();
        },
        complete: (res) => {
          console.log("ruoyi-fx67ll 图片上传接口调用完成: " + JSON.stringify(res));
        },
      });
    },
    // 本地选取照片上传之后统一处理的回调
    pickLocalPhotoCallBack(type, pickCallBackRes) {
      // 成功回调
      if (type === 0) {
        // 如果返回的图片列表数据正常则继续执行百度OCR分析的流程
        if (pickCallBackRes && pickCallBackRes.length > 0) {
          // console.log("chooseImageRes", pickCallBackRes);
          this.uploadPicForBaiDuOcr(pickCallBackRes);
        } else {
          uni.showToast({
            title: "相册选择接口返回数据异常，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
      }
      // 失败回调
      if (type === 1) {
        if (pickCallBackRes?.errMsg !== "chooseMedia:fail cancel") {
          uni.showToast({
            title: "相册选择接口调用失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
        console.error("相册选择接口调用失败: " + JSON.stringify(pickCallBackRes));
      }
      // 完成回调，不管失败还是成功打印参数，方便后期查看错误调试
      if (type === 2) {
        console.log("相册选择接口调用完成: " + JSON.stringify(pickCallBackRes));
      }
    },
    // 选取需要上传的图片
    pickImportLuckyImg() {
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
        success: function (chooseImageRes) {
          self.pickLocalPhotoCallBack(0, chooseImageRes?.tempFiles || null);
        },
        // 接口调用失败的回调函数，小程序、App
        fail: function (err) {
          self.pickLocalPhotoCallBack(1, err);
        },
        // 接口调用结束的回调函数（调用成功、失败都会执行），全平台
        complete: function (res) {
          self.pickLocalPhotoCallBack(2, res);
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
        sizeType: ["original", "compressed"],
        camera: "back",
        success(chooseImageRes) {
          self.pickLocalPhotoCallBack(0, chooseImageRes?.tempFiles || null);
        },
        fail(err) {
          self.pickLocalPhotoCallBack(1, err);
        },
        complete(res) {
          self.pickLocalPhotoCallBack(2, res);
        },
      });
      // #endif
    },
    // 使用摄像头扫码
    useCamera() {
      const self = this;
      // #ifdef H5
      uni.showToast({
        title: "H5拍照识别功能开发中！目前仅支持微信小程序拍照识别！",
        icon: "none",
        duration: 1998,
      });
      // #endif
      // #ifdef MP-WEIXIN
      wx.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sourceType: ["camera"],
        sizeType: ["original", "compressed"],
        camera: "back",
        success(chooseImageRes) {
          self.pickLocalPhotoCallBack(0, chooseImageRes?.tempFiles || null);
        },
        fail(err) {
          self.pickLocalPhotoCallBack(1, err);
        },
        complete(res) {
          self.pickLocalPhotoCallBack(2, res);
        },
      });
      // #endif
    },
    // 预览上传图片
    previewImportImg(type) {
      const self = this;
      uni.previewImage({
        urls: [self.lotteryTicketArr[0]],
        longPressActions: {
          success: function (data) {
            const successMsg = '预览图片长按操作成功：' + '选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片';
            uni.showToast({
              title: successMsg,
              icon: "none",
              duration: 1998,
            });
            console.log(successMsg);
          },
          fail: function (err) {
            uni.showToast({
              title: "预览图片长按操作失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
            console.error('预览图片长按操作失败：' + JSON.stringify(err));
          },
        },
      });
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
        console.log('====================开始计算今天是不是幸运日====================');
        console.log("当前计算已耗时：", this.getTimeDuration(this.countStartTime, nowTime, "milliseconds")
        );
      }
      const self = this;
      const randomTempNum = Math.random() * (1 - 0) + 0;
      nowProgress += randomTempNum;
      this.luckyRandomProgrss = Math.floor((nowProgress / total) * 100);
      this.luckyProgrssCount += 1;
      console.log(`当前计算进度：${this.luckyRandomProgrss}%`);
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
    // 跳转到历史号码记录列表的隐藏快捷方式
    handleToLogHistory() {
      this.$tab.navigateTo("/pages/lottery/log/index/index");
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
          this.drawLotteryTime = this.settingInfo.drawLotteryTimeHistory;
        } else {
          const nowTime = moment().format("X");
          this.drawLotteryTime =
            this.settingInfo.drawLotteryTimeHistory +
            this.getTimeDuration(this.countStartTime, nowTime, "milliseconds");
          console.log("摇奖总耗时：", this.drawLotteryTime, "秒");
          this.drawLotteryText = `模拟摇奖中，已耗时：${this.getTimeDurationText(
            this.drawLotteryTime
          )}`;
        }
        // 模拟摇奖，并判断是否中奖
        this.settingInfo.luckyCount = 2;
        this.settingInfo.isOnlyFirstToday = false;

        // 第一次摇号
        this.packageRandomList();
        const yourNumberTempList = [];
        this.luckyNumberList[1].lotteryNumberFirst.forEach((item) => {
          yourNumberTempList.push(item.num);
        });
        this.luckyNumberList[1].lotteryNumberSecond.forEach((item) => {
          yourNumberTempList.push(item.num);
        });
        const yourNumber = yourNumberTempList.join(",");

        // 第二次摇号
        this.packageRandomList();
        const rightNumberTempList = [];
        this.luckyNumberList[1].lotteryNumberFirst.forEach((item) => {
          rightNumberTempList.push(item.num);
        });
        this.luckyNumberList[1].lotteryNumberSecond.forEach((item) => {
          rightNumberTempList.push(item.num);
        });
        const rightNumber = rightNumberTempList.join(",");

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
          const drawGapH5 = 1;
          this.fakeDrawTimer = setTimeout(function () {
            self.fakeDrawLottery(false);
          }, drawGapH5);
          // #endif

          // #ifdef MP-WEIXIN
          const drawGapWX = 88;
          this.fakeDrawTimer = setTimeout(function () {
            self.fakeDrawLottery(false);
          }, drawGapWX);
          // #endif
        }
      }
    },
    // 停止计时
    stopDrawLottery() {
      const self = this;
      this.isDrawLoading = false;
      const drawLotteryTimeTemp = this.drawLotteryTime;
      // #ifdef H5
      this.initCacheSettingLocal();
      this.drawLotteryText = `继续摇奖，已耗时：${this.getTimeDurationText(
        drawLotteryTimeTemp
      )}`;
      this.settingInfo.drawLotteryTimeHistory = drawLotteryTimeTemp;
      // #endif
      // #ifdef MP-WEIXIN
      // 微信回调有延时，这里直接拷贝 `this.initCacheSettingLocal()` 方法过来
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
          self.initDrawLottery();
          // 微信回调有延时，这里还原配置后保存计时
          self.drawLotteryText = `继续摇奖，已耗时：${self.getTimeDurationText(
            drawLotteryTimeTemp
          )}`;
          self.settingInfo.drawLotteryTimeHistory = drawLotteryTimeTemp;
        },
        fail: function () {
          // 如果第一次进入没有缓存配置，仍然需要生成当日幸运数字
          self.initTodayLuckyNumber(null);
        },
      });
      // #endif
      this.saveLuckySettingLocal();
      clearTimeout(this.fakeDrawTimer);
      this.fakeDrawTimer = null;
    },
    // 初始化摇奖状态
    initDrawLottery() {
      if (
        !this.settingInfo.isGetBigReward &&
        this.settingInfo.drawLotteryTimeHistory > 0
      ) {
        this.drawLotteryText = `继续摇奖，已耗时：${this.getTimeDurationText(
          this.settingInfo.drawLotteryTimeHistory
        )}`;
      } else {
        if (this.settingInfo.isGetBigReward) {
          this.drawLotteryText = `已中奖，中奖号码是：${this.settingInfo.bigRewardNumber}`;
          this.settingInfo.drawLotteryTimeHistory = 0;
        } else {
          this.drawLotteryText = "模拟摇奖";
        }
      }
    },
    // 获取随机号码，先检查是否生成过相关记录，再生成其他类型的随机数并直接上传 - 防抖处理
    getOtherLuckyNumberDebounce: _.debounce(function (type) {
      this.getOtherLuckyNumber(type);
    }, 233),
    // 获取随机号码，先检查是否生成过相关记录
    getOtherLuckyNumber(type) {
      const self = this;
      const queryParams = {
        pageNum: 1,
        pageSize: 1,
        numberType: type,
        beginCreateTime: moment().format("YYYY-MM-DD"),
        endCreateTime: moment().add(1, "days").format("YYYY-MM-DD"),
      };
      getLogList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            showConfirm(
              `查询到当日已生成过随机${self.lotteryTypeMap[type].text}，是否需要再次生成一注新的随机号码？`
            ).then((res) => {
              if (res?.confirm) {
                self.uploadOtherLuckyNumber(type);
              }
            });
          } else {
            self.uploadOtherLuckyNumber(type);
          }
        } else {
          uni.showToast({
            title: "查询历史号码记录失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    // 生成其他类型的随机数并直接上传
    async uploadOtherLuckyNumber(type) {
      const self = this;
      const dateCode = parseInt(type) === 5 ? await this.getLatestCodeNumberQxc(type) : await this.getLatestCodeNumberPl35(type);
      const addParams = {
        dateCode,
        recordNumber: null,
        chaseNumber: null,
        numberType: null,
        weekType: this.todayWeek,
        hasMorePurchases: "N",
      };
      if (type === 3) {
        const randomPl3Numbers = Array.from({ length: 3 }, () =>
          Math.floor(Math.random() * 10)
        );
        addParams.recordNumber = randomPl3Numbers.join(",");
        addParams.numberType = "3";
      }
      if (type === 4) {
        const randomPl5Numbers = Array.from({ length: 5 }, () =>
          Math.floor(Math.random() * 10)
        );
        addParams.recordNumber = randomPl5Numbers.join(",");
        addParams.numberType = "4";
      }
      if (type === 5) {
        const frontSix = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));
        const lastOne = Math.floor(Math.random() * 15);
        addParams.recordNumber = `${frontSix.join(",")},${lastOne}`;
        addParams.numberType = "5";
      }
      addLog(addParams).then((res) => {
        self.isNetworkLoading = false;
        if (res?.code === 200) {
          // 如果是排列三或排列五记录，则自动追加到弹窗中显示
          if ([1, 2].includes(parseInt(type))) {
            self.formatPl35Record(addParams.recordNumber);
          } else {
            uni.showToast({
              title: `随机${self.lotteryTypeMap[type].text}：${addParams.recordNumber} 已生成并上传成功！`,
              icon: "none",
              duration: 1998,
            });
          }
        } else {
          uni.showToast({
            title: "号码记录保存失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
      });
    },
    // 计算并返回今日七星彩的期号，只在同一年处理，七星彩只有每周二五日有
    // AI优化过，能够循环向前查询，防止因为断买了的日期无法续上期号  
    async getLatestCodeNumberQxc(type) {
      if (moment().subtract(1, "days").year() !== moment().year()) {
        return false;
      }
      if (![5].includes(parseInt(type))) {
        return null;
      }
      const queryParams = {
        pageNum: 1,
        pageSize: 1,
        numberType: 5,
      };
      const nowDateCodeRecord = await getLogList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0) {
            const latestDate = res?.rows[0]?.createTime || "";
            const latestDateFormat = moment(latestDate)?.format("YYYY-MM-DD") || "";
            const nowDateFormat = moment()?.format("YYYY-MM-DD") || "";
            const lastDateCode = parseInt(res?.rows[0]?.dateCode) || null;
            if (lastDateCode) {
              const nowDateCode = calculateCurrentDateCode(3, nowDateFormat, latestDateFormat, lastDateCode);
              console.log('====================开始计算七星彩期号====================');
              console.log('最后一次记录的号码期号记录：', lastDateCode, latestDateFormat);
              console.log('今日号码期号计算结果：', nowDateCode, nowDateFormat);
              return nowDateCode || null;
            }
            return null;
          }
        }
        return null;
      });
      return nowDateCodeRecord || null;
    },
    // 计算并返回今日排列五或排列三的期号，只在同一年处理，排列三五每天都有
    // AI优化过，能够循环向前查询，防止因为断买了的日期无法续上期号  
    async getLatestCodeNumberPl35(type, customeMaxSearchDays) {
      // 1. 初始校验逻辑
      if (moment().subtract(1, "days").year() !== moment().year()) {
        return false;
      }

      if (![3, 4].includes(parseInt(type))) {
        return null;
      }

      // 使用当天00:00作为基准日期
      const today = moment().startOf('day');
      const maxSearchDays = customeMaxSearchDays || 8;

      console.log('====================开始计算排列三排列五期号====================');
      console.log(`计算基准日期: ${today.format('YYYY-MM-DD')}, 最大查询天数: ${maxSearchDays}`);

      // 2. 异步递归查询函数
      const searchRecursively = async (daysBack) => {
        // 终止条件：超过最大查询天数
        if (daysBack > maxSearchDays) {
          console.warn(`在过去${maxSearchDays}天内未找到type ${type}的彩票记录`);
          return null;
        }

        // 计算查询日期（标准化为00:00）
        const searchDate = moment().subtract(daysBack, "days").startOf('day');
        const beginCreateTime = searchDate.format("YYYY-MM-DD");
        const endCreateTime = searchDate.clone().add(1, "day").format("YYYY-MM-DD");

        const queryParams = {
          pageNum: 1,
          pageSize: 1,
          numberType: parseInt(type),
          beginCreateTime,
          endCreateTime,
        };

        try {
          console.log(`正在查询第${daysBack}天前的记录: ${beginCreateTime}`);
          const res = await getLogList(queryParams);

          // 3. 找到有效记录时的处理
          if (res?.code === 200 && res?.rows?.length > 0) {
            const latestRecord = res.rows[0];
            const latestDateCode = latestRecord.dateCode || "";

            // 获取记录的日期（优先使用创建时间，否则使用查询日期）
            const recordDate = latestRecord.createTime
              ? moment(latestRecord.createTime).startOf('day')
              : searchDate.clone();

            console.log('找到记录:', {
              date: recordDate.format('YYYY-MM-DD'),
              code: latestDateCode
            });

            if (latestDateCode) {
              // 计算日历天数差（基于标准化日期）
              const daysDiff = today.diff(recordDate, 'days');

              // 调试日志：显示日期计算详情
              console.log(`日期计算: 今天=${today.format('YYYY-MM-DD')}, ` +
                `记录日期=${recordDate.format('YYYY-MM-DD')}, ` +
                `天数差=${daysDiff}`);

              const nowDateCode = parseInt(latestDateCode) + daysDiff;
              console.log(`计算完成: 基准期号=${latestDateCode}, ` +
                `天数差=${daysDiff}, ` +
                `当前期号=${nowDateCode}`);
              return nowDateCode;
            }
            return null;
          }
          // 4. 未找到记录时继续递归
          else {
            console.log(`第${daysBack}天前无记录，继续查询更早日期...`);
            await new Promise(resolve => setTimeout(resolve, 233));
            return searchRecursively(daysBack + 1);
          }
        } catch (e) {
          console.error(`查询第${daysBack}天前的记录时出错:`, e);
          await new Promise(resolve => setTimeout(resolve, 233));
          return searchRecursively(daysBack + 1);
        }
      };

      // 5. 开始递归查询
      return await searchRecursively(1);
    },
    // 返回当前最新生成的排列五记录
    async getLatestPL5Record(isNeedPush) {
      const self = this;
      const queryParams = {
        pageNum: 1,
        pageSize: 1,
        numberType: 4,
        beginCreateTime: moment().format("YYYY-MM-DD"),
        endCreateTime: moment().add(1, "days").format("YYYY-MM-DD"),
      };
      const latestPL5Record = await getLogList(queryParams).then((res) => {
        if (res?.code === 200) {
          if (res?.rows && res?.rows?.length > 0 && res?.rows[0]?.recordNumber) {
            if (isNeedPush) {
              self.formatPl35Record(res?.rows[0]?.recordNumber);
            }
            const pl5List = res?.rows[0]?.recordNumber?.split(",") || [];
            const spaceThree = Array(2).fill(" ").join("");
            return `\n${pl5List.join(spaceThree)}\n`;
          }
          return null;
        }
        return null;
      });
      return latestPL5Record || null;
    },
    // 组装排列三或排列五并添加入当前生成的号码组记录中，展示在底部弹窗中
    formatPl35Record(numberRecord) {
      const self = this;
      const pl5List = numberRecord.split(",") || [];
      const pl5ItemList = pl5List.map((it5, ind5) => {
        return {
          num: it5,
          key: Math.random() * it5 + ind5,
        };
      });
      const pl5Obj = {
        timeStamp: new Date().getTime(),
        lotteryNumberFirst: pl5ItemList,
        lotteryNumberSecond: [],
      };

      // 添加到底部弹窗里显示
      const lastNumberIndex = self.luckyNumberList.length - 1;
      if (self.luckyNumberList[lastNumberIndex].lotteryNumberSecond.length !== 0) {
        self.luckyNumberList.push(pl5Obj);
      }

      // 如果打开了只允许一注随机则需要缓存当日的随机号码
      if (self.settingInfo.isOnlyFirstToday) {
        self.settingInfo.localLuckyNumberList = self.luckyNumberList;
        self.saveLuckySettingLocal();
      }
    },
    // 周五一键三连
    fridayOneClickThree() {
      const self = this;
      setTimeout(() => {
        self.getOtherLuckyNumberDebounce(3);
      }, 1998 * 0 + 1);
      setTimeout(() => {
        self.getOtherLuckyNumberDebounce(4);
      }, 1998 * 1);
      setTimeout(() => {
        self.getOtherLuckyNumberDebounce(5);
      }, 1998 * 2);
      this.settingInfo.isDoneOneClickThreeFriday = true;
      this.saveLuckySettingLocal();
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
