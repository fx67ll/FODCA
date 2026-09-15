<template>
  <view class="fx67ll-simulate-box">
    <z-paging-mini ref="paging" back-to-top-bottom="30rpx" :auto-show-back-to-top="true" v-model="simList"
      @query="querySimulateList">
      <template #top>
        <view class="sim-operation-card">
          <view class="sim-card-header">
            <view class="sim-card-title">数值模拟操作台</view>
            <view class="sim-mode-tag" :class="simForm.simMode === 'half' ? 'half' : 'full'">{{ simForm.simMode ===
              "half" ? "半量滚动" : "全量滚动" }}</view>
          </view>
          <scroll-view class="sim-version-scroll" scroll-x>
            <view class="sim-version-row">
              <view class="sim-version-chip" v-for="v in simEnabledVersionList" :key="v.versionId"
                :class="{ active: v.versionId === currentVersionId }" @click="handleSimVersionChange(v)">{{
                  v.versionName || `版本${v.versionNo}` }}</view>
              <view class="sim-version-chip manage" v-if="simVersionList.length > 0"
                @click="handleSimVersionManage">管理</view>
              <view class="sim-version-empty" v-if="simEnabledVersionList.length === 0">暂无版本，记录本轮或重新模拟将自动开启</view>
            </view>
          </scroll-view>
          <!-- 参数配置开关：默认收起，配置写入本地缓存 -->
          <view class="sim-config-toggle" @click="configExpanded = !configExpanded">
            <text class="sim-config-toggle-title">参数配置</text>
            <text class="sim-config-toggle-summary">{{ simConfigSummary }}</text>
            <view class="sim-config-toggle-arrow" :class="{ expanded: configExpanded }">
              <uni-icons type="down" size="14" color="#8392a5" />
            </view>
          </view>
          <view class="sim-config-area" v-show="configExpanded">
            <view class="sim-mode-group">
              <view class="sim-mode-item full" :class="{ active: simForm.simMode === 'full' }"
                @click="simForm.simMode = 'full'">
                <view class="sim-mode-title">全量滚动</view>
                <view class="sim-mode-desc">每轮全部数值参与滚动</view>
              </view>
              <view class="sim-mode-item half" :class="{ active: simForm.simMode === 'half' }"
                @click="simForm.simMode = 'half'">
                <view class="sim-mode-title">半量滚动</view>
                <view class="sim-mode-desc">每轮一半参与滚动</view>
              </view>
            </view>
            <view class="sim-param-group">
              <view class="sim-param-item">
                <view class="sim-param-label">初始数值</view>
                <input class="sim-param-input" type="digit" v-model="simForm.initialValue" placeholder="请输入初始数值" />
              </view>
              <view class="sim-param-item">
                <view class="sim-param-label">每轮系数</view>
                <input class="sim-param-input" type="digit" v-model="simForm.coefficient" placeholder="请输入每轮系数" />
              </view>
              <view class="sim-param-item">
                <view class="sim-param-label">目标数值</view>
                <input class="sim-param-input" type="digit" v-model="simForm.targetValue" placeholder="请输入目标数值" />
              </view>
            </view>
          </view>
          <view class="sim-config-cache-tip">配置已本地缓存，开启新版本时随版本保存，切换版本自动载入该版本参数</view>
          <view class="sim-rule-tip">{{ simRuleText }}</view>
          <view class="sim-stats-grid">
            <view class="sim-stat-item">
              <view class="sim-stat-value">{{ formatSimNumber(simNowValue) }}</view>
              <view class="sim-stat-label">当前数值</view>
            </view>
            <view class="sim-stat-item">
              <view class="sim-stat-value">{{ formatSimNumber(simNextStartValue) }}</view>
              <view class="sim-stat-label">下一轮开始数值</view>
            </view>
            <view class="sim-stat-item">
              <view class="sim-stat-value">{{ simNextRoundNo }}</view>
              <view class="sim-stat-label">下一轮轮次</view>
            </view>
            <view class="sim-stat-item">
              <view class="sim-stat-value">{{ simProgress }}</view>
              <view class="sim-stat-label">目标进度</view>
            </view>
            <view class="sim-stat-item">
              <view class="sim-stat-value">{{ simRequiredRounds }}</view>
              <view class="sim-stat-label">连续达成所需轮次</view>
            </view>
            <view class="sim-stat-item sim-stat-placeholder"></view>
          </view>
          <view class="sim-status-banner danger" v-if="simFinished">当前版本数值已归零，下一轮将自动开启新版本并从初始数值
            {{ formatSimNumber(simForm.initialValue) }} 重新开始</view>
          <view class="sim-status-banner success" v-else-if="simTargetHit">已达成目标数值，可继续记录实际数值或重新模拟</view>
          <view class="sim-secondary-actions">
            <button class="sim-mini-btn" size="mini" @click="handleSimRestart">重新模拟</button>
            <button class="sim-mini-btn danger" size="mini" :disabled="!simLastRound"
              @click="handleSimDeleteLast">删除上一轮</button>
          </view>
        </view>
      </template>
      <view class="sim-round-item" v-for="item in simList" :key="item.simId">
        <view class="sim-round-header">
          <view class="sim-round-title">第{{ item.roundNo }}轮 ·
            {{ item.simMode === "half" ? "半量滚动" : "全量滚动" }}</view>
          <text class="sim-round-badge" :class="item.isHit === 'Y' ? 'success' : 'fail'">{{ item.isHit === "Y" ? "达成" :
            "未达成"
          }}</text>
        </view>
        <view class="sim-round-body">
          <view class="sim-round-line">
            <text class="sim-round-label">开始数值</text>
            <text class="sim-round-value">{{ formatSimNumber(item.startValue) }}</text>
          </view>
          <view class="sim-round-line">
            <text class="sim-round-label">参与数值</text>
            <text class="sim-round-value">{{ formatSimNumber(item.joinValue) }}</text>
          </view>
          <view class="sim-round-line">
            <text class="sim-round-label">回收数值</text>
            <text class="sim-round-value">{{ formatSimNumber(item.returnValue) }}</text>
          </view>
          <view class="sim-round-line">
            <text class="sim-round-label">结束数值</text>
            <text class="sim-round-value">{{ formatSimNumber(item.endValue) }}</text>
          </view>
          <view class="sim-round-line">
            <text class="sim-round-label">数值变动</text>
            <text class="sim-round-value">×{{ item.roundChange }}</text>
          </view>
          <view class="sim-round-line">
            <text class="sim-round-label">使用系数</text>
            <text class="sim-round-value">{{ formatSimNumber(item.coefficient) }}</text>
          </view>
        </view>
        <view class="sim-round-footer">{{ item.createTime }}</view>
      </view>
      <view class="sim-footer-tip">本功能仅基于给定数值做滚动测算，不构成任何参考建议</view>
    </z-paging-mini>
    <uni-fab ref="fab" :pattern="fabConfig.pattern" :content="fabConfig.content" :horizontal="fabConfig.horizontal"
      :vertical="fabConfig.vertical" :direction="fabConfig.direction" @trigger="handleFabTrigger" />
    <uni-popup ref="recordPopup" type="dialog">
      <view class="sim-record-dialog">
        <view class="sim-record-title">记录本轮结果</view>
        <view class="sim-record-row">
          <text class="sim-record-label">本轮结果</text>
          <text class="sim-record-value" :style="{ color: simRecordIsHit === 'Y' ? '#2ecc71' : '#ff5a5f' }">{{
            simRecordIsHit === "Y" ? "达成" : "未达成" }}</text>
        </view>
        <view class="sim-record-row">
          <text class="sim-record-label">本轮开始数值</text>
          <text class="sim-record-value">{{ formatSimNumber(simNextStartValue) }}</text>
        </view>
        <view class="sim-record-row">
          <text class="sim-record-label">本轮参与数值</text>
          <text class="sim-record-value">{{ formatSimNumber(simRecordJoinValue) }}</text>
        </view>
        <view class="sim-record-field">
          <text class="sim-record-label">本轮轮次</text>
          <view class="sim-record-input-box">
            <uni-easyinput type="number" v-model="simRecordRoundNo" placeholder="请输入本轮轮次" :inputBorder="true" />
          </view>
          <view class="sim-record-tip" :class="{ danger: simRecordRoundNoIsNegative }">
            {{ simRecordRoundNoIsNegative ? "轮次为负，保存后该版本将被强制作废" : "默认自动顺延可修改，支持负值" }}
          </view>
        </view>
        <view class="sim-record-field">
          <text class="sim-record-label">实际回收数值</text>
          <view class="sim-record-input-box">
            <uni-easyinput type="digit" v-model="simRecordReturnValue" placeholder="请输入实际回收数值" :inputBorder="true" />
          </view>
        </view>
        <view class="sim-record-tip">默认按系数计算，可按实际数值修改，支持部分回本</view>
        <view class="sim-record-row">
          <text class="sim-record-label">本轮结束数值</text>
          <text class="sim-record-value end">{{ formatSimNumber(simRecordEndValue) }}</text>
        </view>
        <view class="sim-record-actions">
          <button class="sim-record-btn" size="mini" @click="handleSimRecordCancel">取 消</button>
          <button class="sim-record-btn primary" size="mini" :disabled="simSubmitting" @click="submitSimRound">确
            定</button>
        </view>
      </view>
    </uni-popup>
    <!-- 版本管理弹窗（版本启用停用与作废） -->
    <uni-popup ref="versionPopup" type="dialog">
      <view class="sim-version-dialog">
        <view class="sim-version-dialog-title">管理模拟版本</view>
        <view class="sim-version-dialog-tip">停用后版本将不在标签中展示，轮次记录仍保留，可随时重新启用；作废后版本将从列表中隐藏且不可恢复；仅支持作废24小时内创建的版本，更早版本请在网页端后台操作；停用或作废当前选中版本时将自动切换到最新启用版本</view>
        <scroll-view class="sim-version-dialog-list" scroll-y>
          <view class="sim-version-dialog-item" v-for="v in simVersionList" :key="v.versionId"
            :class="{ disabled: v.delFlag === '2' }">
            <view class="sim-version-dialog-info">
              <view class="sim-version-dialog-row">
                <text class="sim-version-dialog-no">{{ v.versionName || `版本${v.versionNo}` }}</text>
                <text class="sim-version-dialog-tag" :class="v.simMode === 'half' ? 'half' : 'full'">{{
                  v.simMode === "half" ? "半量" : "全量" }}</text>
              </view>
              <view class="sim-version-dialog-desc">版本{{ v.versionNo }} · 初始 {{ v.initialValue }} · 系数 {{ v.coefficient }} · 目标 {{ v.targetValue }}</view>
              <view class="sim-version-dialog-time">{{ v.createTime }}</view>
            </view>
            <view class="sim-version-dialog-ops">
              <button class="sim-version-dialog-btn" size="mini" :class="v.delFlag === '2' ? '' : 'danger'"
                :disabled="simVersionSwitching" @click="handleSimVersionToggle(v)">{{ v.delFlag === "2" ? "启用" : "停用"
                }}</button>
              <button class="sim-version-dialog-btn invalidate" size="mini" :disabled="simVersionSwitching"
                @click="handleSimVersionInvalidate(v)">作废</button>
            </view>
          </view>
          <view class="sim-version-dialog-empty" v-if="simVersionList.length === 0">暂无版本记录</view>
        </scroll-view>
        <view class="sim-version-dialog-actions">
          <button class="sim-version-dialog-close" size="mini" @click="handleSimVersionManageClose">关 闭</button>
        </view>
      </view>
    </uni-popup>
    <!-- 开启新版本确认弹窗 -->
    <uni-popup ref="versionCreatePopup" type="dialog">
      <view class="sim-create-dialog">
        <view class="sim-create-title">开启新版本</view>
        <view class="sim-create-tip">将以当前参数配置开启新的模拟版本，历史轮次归档到旧版本，下一轮从初始数值重新开始</view>
        <view class="sim-create-config">
          <view class="sim-create-config-item">
            <text class="sim-create-config-label">滚动模式</text>
            <text class="sim-create-config-value">{{ simForm.simMode === "half" ? "半量滚动" : "全量滚动" }}</text>
          </view>
          <view class="sim-create-config-item">
            <text class="sim-create-config-label">初始数值</text>
            <text class="sim-create-config-value">{{ formatSimNumber(simForm.initialValue) }}</text>
          </view>
          <view class="sim-create-config-item">
            <text class="sim-create-config-label">每轮系数</text>
            <text class="sim-create-config-value">{{ formatSimNumber(simForm.coefficient) }}</text>
          </view>
          <view class="sim-create-config-item">
            <text class="sim-create-config-label">目标数值</text>
            <text class="sim-create-config-value">{{ formatSimNumber(simForm.targetValue) }}</text>
          </view>
        </view>
        <view class="sim-create-field">
          <text class="sim-create-field-label">版本名称</text>
          <view class="sim-create-input-box">
            <uni-easyinput type="text" v-model="simVersionCreateName" placeholder="请输入新版本名称" :inputBorder="true"
              maxlength="20" />
          </view>
          <view class="sim-create-field-tip">名称仅用于辨识版本，创建后随版本保存</view>
        </view>
        <view class="sim-create-actions">
          <button class="sim-create-btn" size="mini" @click="handleSimVersionCreateCancel">取 消</button>
          <button class="sim-create-btn primary" size="mini"
            :disabled="!simVersionCreateName || !simVersionCreateName.trim() || simVersionCreateSubmitting"
            @click="confirmSimVersionCreate">确 定</button>
        </view>
      </view>
    </uni-popup>
    <!-- 版本作废第一步确认弹窗 -->
    <uni-popup ref="invalidateConfirmPopup" type="dialog">
      <view class="sim-invalidate-dialog">
        <view class="sim-invalidate-banner">
          <text class="sim-invalidate-banner-icon">!</text>
          <text class="sim-invalidate-banner-text">高危操作警告</text>
        </view>
        <view class="sim-invalidate-title">作废模拟版本</view>
        <view class="sim-invalidate-card" v-if="simInvalidateVersion">
          <view class="sim-invalidate-card-row">
            <text class="sim-invalidate-card-label">作废版本</text>
            <text class="sim-invalidate-card-value">{{ simInvalidateVersion.versionName || `版本${simInvalidateVersion.versionNo}` }}</text>
          </view>
          <view class="sim-invalidate-card-row">
            <text class="sim-invalidate-card-label">版本编号</text>
            <text class="sim-invalidate-card-value">版本{{ simInvalidateVersion.versionNo }}</text>
          </view>
          <view class="sim-invalidate-card-row">
            <text class="sim-invalidate-card-label">创建时间</text>
            <text class="sim-invalidate-card-value">{{ simInvalidateVersion.createTime }}</text>
          </view>
        </view>
        <view class="sim-invalidate-desc">作废后版本将从列表中隐藏且不可恢复，轮次记录将一并归档隐藏，请谨慎操作</view>
        <view class="sim-invalidate-countdown-tip" :class="{ ready: simInvalidateCountdown <= 0 }">
          {{ simInvalidateCountdown > 0 ? `请在 ${simInvalidateCountdown} 秒后再次确认，谨慎操作` : "倒计时结束，可继续二次确认" }}
        </view>
        <view class="sim-invalidate-actions">
          <button class="sim-invalidate-btn" size="mini" @click="handleSimInvalidateCancel">取 消</button>
          <button class="sim-invalidate-btn danger" size="mini" :disabled="simInvalidateCountdown > 0"
            @click="handleSimInvalidateStep1Confirm">进入二次确认{{ simInvalidateCountdown > 0 ? `（${simInvalidateCountdown}s）` : "" }}</button>
        </view>
      </view>
    </uni-popup>
    <!-- 版本作废第二步确认弹窗 -->
    <uni-popup ref="invalidateDangerPopup" type="dialog">
      <view class="sim-invalidate-dialog">
        <view class="sim-invalidate-banner">
          <text class="sim-invalidate-banner-icon">!</text>
          <text class="sim-invalidate-banner-text">二次验证</text>
        </view>
        <view class="sim-invalidate-title">确认作废版本</view>
        <view class="sim-invalidate-desc">请输入「<text class="sim-invalidate-keyword">确认作废</text>」以确认作废该版本，此操作不可恢复</view>
        <view class="sim-invalidate-input-box">
          <uni-easyinput type="text" v-model="simInvalidateKeyword" placeholder="请输入确认作废" :inputBorder="true" />
        </view>
        <view class="sim-invalidate-actions">
          <button class="sim-invalidate-btn" size="mini" @click="handleSimInvalidateCancel">取 消</button>
          <button class="sim-invalidate-btn danger" size="mini"
            :disabled="simInvalidateKeyword.trim() !== '确认作废' || simInvalidateSubmitting"
            @click="handleSimInvalidateConfirm">{{ simInvalidateSubmitting ? "作废中..." : "确认作废" }}</button>
        </view>
      </view>
    </uni-popup>
    <!-- 版本强制作废系统通知弹窗 -->
    <uni-popup ref="invalidNoticePopup" type="dialog">
      <view class="sim-invalid-notice-dialog">
        <view class="sim-invalid-notice-icon">
          <text class="sim-invalid-notice-icon-text">!</text>
        </view>
        <view class="sim-invalid-notice-title">版本已被强制作废</view>
        <view class="sim-invalid-notice-desc">版本「{{ simInvalidNoticeVersionName }}」本轮轮次为负数，系统已自动作废该版本，版本不再在列表中展示，轮次记录已一并归档隐藏。</view>
        <view class="sim-invalid-notice-card">
          <view class="sim-invalid-notice-card-item">
            <text class="sim-invalid-notice-card-label">版本编号</text>
            <text class="sim-invalid-notice-card-value">版本{{ simInvalidNoticeVersionNo }}</text>
          </view>
          <view class="sim-invalid-notice-card-item">
            <text class="sim-invalid-notice-card-label">本轮轮次</text>
            <text class="sim-invalid-notice-card-value danger">{{ simInvalidNoticeRoundNo }}</text>
          </view>
        </view>
        <view class="sim-invalid-notice-tip">已自动切换到最新启用版本，可通过开启新版本重新开始模拟</view>
        <view class="sim-invalid-notice-actions">
          <button class="sim-invalid-notice-btn" size="mini" @click="handleSimInvalidNoticeClose">我知道了</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import {
  getSimulateList,
  addSimulate,
  delSimulate,
  getSimulateVersionList,
  addSimulateVersion,
  updateSimulateVersion,
  invalidateSimulateVersion,
} from "@/api/fx67ll/dortmund/extraSimulate";
import { showConfirm } from "@/utils/common";
import { diffTimeStrFromNow } from "@/utils/index";

// 数值模拟参数本地缓存键
const SIM_CONFIG_CACHE_KEY = "dortmund-extra-sim-config";

export default {
  data() {
    return {
      // 数值模拟参数配置
      simForm: {
        simMode: "full",
        initialValue: 100,
        coefficient: 2,
        targetValue: 500000,
      },
      // 参数配置区域展开状态（默认收起）
      configExpanded: false,
      // 数值模拟轮次记录列表数据
      simList: [],
      // 数值模拟版本记录列表数据（接口按版本倒序返回，第一条为最新版本）
      simVersionList: [],
      // 数值模拟当前选中的版本主键
      currentVersionId: null,
      // 数值模拟版本启用停用提交中状态
      simVersionSwitching: false,
      // 数值模拟最近一条轮次记录（单独查询，用于驱动下一轮开始数值与轮次）
      simLatestRound: null,
      // 数值模拟轮次记录保存中状态
      simSubmitting: false,
      // 数值模拟本轮结果（Y达成 N未达成），打开弹窗前记录
      simRecordIsHit: "Y",
      // 数值模拟本轮轮次（默认自动顺延可修改，支持负值）
      simRecordRoundNo: 1,
      // 数值模拟实际回收数值（默认按系数计算，可按实际数值修改）
      simRecordReturnValue: 0,
      // 数值模拟开启新版本弹窗输入的版本名称
      simVersionCreateName: "",
      // 数值模拟开启新版本提交中状态
      simVersionCreateSubmitting: false,
      // 数值模拟暂存的本轮结果（开启新版本确认后继续保存）
      pendingSimRecord: null,
      // 数值模拟待作废的版本记录
      simInvalidateVersion: null,
      // 数值模拟版本作废第一步确认倒计时（秒）
      simInvalidateCountdown: 0,
      // 数值模拟版本作废第二步确认输入的关键词
      simInvalidateKeyword: "",
      // 数值模拟版本作废提交中状态
      simInvalidateSubmitting: false,
      // 数值模拟版本作废第一步确认倒计时定时器
      simInvalidateCountdownTimer: null,
      // 数值模拟被强制作废的版本记录
      simInvalidNoticeVersion: null,
      // 数值模拟触发强制作废的负轮次
      simInvalidNoticeRoundNo: "",
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
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=28",
            selectedIconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=28",
            text: "达成",
            active: false,
          },
          {
            iconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=27",
            selectedIconPath:
              "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=27",
            text: "未达成",
            active: false,
          },
        ],
      },
    };
  },
  computed: {
    // 数值模拟启用的版本列表（停用版本不在标签中展示）
    simEnabledVersionList() {
      return this.simVersionList.filter((item) => item.delFlag !== "2");
    },
    // 数值模拟本轮轮次是否为负（负值保存后版本将被强制作废）
    simRecordRoundNoIsNegative() {
      return parseInt(this.simRecordRoundNo) < 0;
    },
    // 数值模拟被强制作废的版本名称（无版本时展示占位）
    simInvalidNoticeVersionName() {
      const version = this.simInvalidNoticeVersion || {};
      return version.versionName || `版本${version.versionNo || ""}`;
    },
    // 数值模拟被强制作废的版本编号
    simInvalidNoticeVersionNo() {
      const version = this.simInvalidNoticeVersion || {};
      return version.versionNo || "-";
    },
    // 数值模拟参数配置概要（收起时展示当前模式与三项参数）
    simConfigSummary() {
      const modeText = this.simForm.simMode === "half" ? "半量" : "全量";
      return `${modeText} · 初始 ${this.formatSimNumber(this.simForm.initialValue)} · 系数 ${this.formatSimNumber(this.simForm.coefficient)} · 目标 ${this.formatSimNumber(this.simForm.targetValue)}`;
    },
    // 数值模拟当前模式规则说明
    simRuleText() {
      if (this.simForm.simMode === "half") {
        return "半量滚动模式：每轮以当前数值的一半参与滚动，另一半保留，本轮结束数值 = 保留的一半 + 实际回收数值；回收数值默认按系数计算，可按实际数值录入，支持部分回本";
      }
      return "全量滚动模式：每轮以全部当前数值参与滚动，本轮结束数值 = 实际回收数值；回收数值默认按系数计算，可按实际数值录入，未达成不必然归零，支持部分回本";
    },
    // 数值模拟当前模式每轮达成后的数值乘数
    simWinFactor() {
      return this.simForm.simMode === "half"
        ? (1 + parseFloat(this.simForm.coefficient || 0)) / 2
        : parseFloat(this.simForm.coefficient || 0);
    },
    // 数值模拟最近一条轮次记录
    simLastRound() {
      return this.simLatestRound;
    },
    // 数值模拟下一轮是否从初始数值重新开始（当前版本无记录或上轮归零）
    simRestartFromInitial() {
      return !this.simLastRound || this.simLastRound.endValue <= 0;
    },
    // 数值模拟当前数值（最近一条记录的结束数值，无记录时为初始数值）
    simNowValue() {
      return this.simLastRound
        ? this.simLastRound.endValue
        : parseFloat(this.simForm.initialValue || 0);
    },
    // 数值模拟下一轮开始数值
    simNextStartValue() {
      return this.simRestartFromInitial
        ? parseFloat(this.simForm.initialValue || 0)
        : this.simLastRound.endValue;
    },
    // 数值模拟下一轮轮次序号
    simNextRoundNo() {
      return this.simRestartFromInitial ? 1 : this.simLastRound.roundNo + 1;
    },
    // 数值模拟本轮参与数值（半量滚动为开始数值的一半）
    simRecordJoinValue() {
      return this.simForm.simMode === "half"
        ? parseFloat((this.simNextStartValue / 2).toFixed(2))
        : this.simNextStartValue;
    },
    // 数值模拟本轮结束数值（半量滚动保留另一半，全量滚动即实际回收数值）
    simRecordEndValue() {
      const keepValue = this.simForm.simMode === "half" ? this.simNextStartValue / 2 : 0;
      return parseFloat(
        (keepValue + parseFloat(this.simRecordReturnValue || 0)).toFixed(2)
      );
    },
    // 数值模拟目标进度
    simProgress() {
      const targetValue = parseFloat(this.simForm.targetValue || 0);
      if (targetValue <= 0) {
        return "0.00%";
      }
      return ((this.simNowValue / targetValue) * 100).toFixed(2) + "%";
    },
    // 数值模拟从下一轮开始数值连续达成达目标所需轮次
    simRequiredRounds() {
      return this.countSimRequiredRounds(
        this.simNextStartValue,
        parseFloat(this.simForm.targetValue || 0),
        this.simWinFactor
      );
    },
    // 数值模拟是否已归零终止
    simFinished() {
      return this.simLastRound != null && this.simLastRound.endValue <= 0;
    },
    // 数值模拟是否已达成目标数值
    simTargetHit() {
      const targetValue = parseFloat(this.simForm.targetValue || 0);
      return (
        this.simLastRound != null &&
        targetValue > 0 &&
        this.simNowValue >= targetValue
      );
    },
  },
  onLoad() {
    this.loadSimConfigCache();
  },
  onShow() {
    const self = this;
    this.getSimVersionList().then(() => {
      if (self.$refs.paging) {
        self.$refs.paging.reload();
      }
    });
  },
  onBackPress() {
    if (this.$refs.fab.isShow) {
      this.$refs.fab.close();
      return true;
    }
    return false;
  },
  onHide() {
    this.stopInvalidateCountdown();
  },
  onUnload() {
    this.stopInvalidateCountdown();
  },
  watch: {
    // 数值模拟参数变动时写入本地缓存，下次进入页面自动恢复
    simForm: {
      handler(val) {
        uni.setStorageSync(SIM_CONFIG_CACHE_KEY, val);
      },
      deep: true,
    },
  },
  methods: {
    // 载入本地缓存的参数配置，无版本选中时作为默认配置
    loadSimConfigCache() {
      const cached = uni.getStorageSync(SIM_CONFIG_CACHE_KEY);
      if (!cached) {
        return;
      }
      try {
        const config =
          typeof cached === "string" ? JSON.parse(cached) : cached;
        this.simForm = {
          simMode: config.simMode === "half" ? "half" : "full",
          initialValue: parseFloat(config.initialValue || 0) || 100,
          coefficient: parseFloat(config.coefficient || 0) || 2,
          targetValue: parseFloat(config.targetValue || 0) || 500000,
        };
      } catch (err) {
        // 缓存解析失败时保持默认配置
      }
    },
    // 查询数值模拟版本记录列表，无选中版本时默认选中最新启用版本，开启新版本后强制切换到最新版本
    getSimVersionList(isSelectLatest) {
      const self = this;
      return getSimulateVersionList({}).then((res) => {
        const rows = res?.rows || [];
        const enabledRows = rows.filter((item) => item.delFlag !== "2");
        self.simVersionList = rows;
        if (
          isSelectLatest ||
          !enabledRows.some((item) => item.versionId === self.currentVersionId)
        ) {
          const latestVersion = enabledRows.length > 0 ? enabledRows[0] : null;
          self.currentVersionId = latestVersion ? latestVersion.versionId : null;
          if (latestVersion) {
            self.loadSimVersionParams(latestVersion);
          }
        }
      });
    },
    // 切换数值模拟版本，载入该版本的参数配置并刷新轮次记录
    handleSimVersionChange(version) {
      this.currentVersionId = version.versionId;
      this.loadSimVersionParams(version);
      this.$refs.paging.reload();
    },
    // 打开版本管理弹窗
    handleSimVersionManage() {
      this.$refs.versionPopup.open("dialog");
    },
    // 关闭版本管理弹窗
    handleSimVersionManageClose() {
      this.$refs.versionPopup.close();
    },
    // 切换版本启用停用状态，保存后刷新版本列表，停用当前选中版本自动切换到最新启用版本
    handleSimVersionToggle(version) {
      const self = this;
      this.simVersionSwitching = true;
      updateSimulateVersion({
        versionId: version.versionId,
        delFlag: version.delFlag === "2" ? "0" : "2",
      })
        .then((res) => {
          if (res?.code === 200) {
            uni.showToast({
              title:
                version.delFlag === "2"
                  ? `版本${version.versionNo}已启用！`
                  : `版本${version.versionNo}已停用！`,
              icon: "none",
              duration: 1998,
            });
            self.getSimVersionList().then(() => {
              self.$refs.paging.reload();
            });
          } else {
            uni.showToast({
              title: "版本状态修改失败！",
              icon: "none",
              duration: 1998,
            });
          }
        })
        .catch(() => { })
        .finally(() => {
          self.simVersionSwitching = false;
        });
    },
    // 载入数值模拟版本保存的参数配置
    loadSimVersionParams(version) {
      this.simForm.simMode = version.simMode || "full";
      this.simForm.initialValue = parseFloat(version.initialValue || 0);
      this.simForm.coefficient = parseFloat(version.coefficient || 0);
      this.simForm.targetValue = parseFloat(version.targetValue || 0);
    },
    querySimulateList(pageNum, pageSize) {
      const self = this;
      if (!this.currentVersionId) {
        // 版本列表加载完成前不查询轮次记录，避免查出全部版本数据
        self.$refs.paging.complete([]);
        return;
      }
      const queryParams = {
        pageNum,
        pageSize,
        versionId: this.currentVersionId,
      };
      getSimulateList(queryParams)
        .then((res) => {
          if (res?.code === 200) {
            if (res?.rows && res?.rows?.length > 0) {
              self.$refs.paging.complete(
                res.rows.map((item) => self.formatSimRound(item))
              );
            } else {
              self.$refs.paging.complete([]);
            }
          } else {
            uni.showToast({
              title: "查询数值模拟轮次记录失败！",
              icon: "none",
              duration: 1998,
            });
            self.$refs.paging.complete(false);
          }
        })
        .catch((res) => {
          self.$refs.paging.complete(false);
        });
      this.getSimLatestRound();
    },
    // 查询数值模拟最近一条轮次记录，驱动下一轮开始数值与轮次
    getSimLatestRound() {
      const self = this;
      if (!this.currentVersionId) {
        this.simLatestRound = null;
        return;
      }
      getSimulateList({
        pageNum: 1,
        pageSize: 1,
        versionId: this.currentVersionId,
      }).then((response) => {
        const rows = response?.rows || [];
        self.simLatestRound =
          rows.length > 0 ? self.formatSimRound(rows[0]) : null;
      });
    },
    // 数值模拟轮次记录数值字段格式化
    formatSimRound(item) {
      return {
        ...item,
        roundNo: parseInt(item.roundNo || 0),
        startValue: parseFloat(item.startValue || 0),
        joinValue: parseFloat(item.joinValue || 0),
        returnValue: parseFloat(item.returnValue || 0),
        endValue: parseFloat(item.endValue || 0),
        roundChange: this.formatSimFactor(item.roundChange || 0),
      };
    },
    handleFabTrigger(e) {
      if (e?.index === 0) {
        this.handleSimRound(true);
      }
      if (e?.index === 1) {
        this.handleSimRound(false);
      }
      this.$refs.fab.close();
    },
    // 校验数值模拟参数配置
    validateSimParams() {
      const initialValue = parseFloat(this.simForm.initialValue);
      const coefficient = parseFloat(this.simForm.coefficient);
      const targetValue = parseFloat(this.simForm.targetValue);
      if (!initialValue || initialValue <= 0) {
        uni.showToast({
          title: "初始数值必须大于0！",
          icon: "none",
          duration: 1998,
        });
        return false;
      }
      if (!coefficient || coefficient <= 1) {
        uni.showToast({
          title: "每轮系数必须大于1！",
          icon: "none",
          duration: 1998,
        });
        return false;
      }
      if (!targetValue || targetValue <= 0) {
        uni.showToast({
          title: "目标数值必须大于0！",
          icon: "none",
          duration: 1998,
        });
        return false;
      }
      return true;
    },
    // 打开记录本轮结果弹窗，打开前校验参数并按下一轮轮次与系数预填
    handleSimRound(hit) {
      if (!this.validateSimParams()) {
        return;
      }
      this.simRecordIsHit = hit ? "Y" : "N";
      this.simRecordRoundNo = this.simNextRoundNo;
      this.simRecordReturnValue =
        hit
          ? parseFloat(
            (
              this.simRecordJoinValue * parseFloat(this.simForm.coefficient || 0)
            ).toFixed(2)
          )
          : 0;
      this.$refs.recordPopup.open("dialog");
    },
    // 提交本轮结果记录，当前版本已归零或尚无版本时先经确认弹窗开启新版本再记录
    submitSimRound() {
      const returnValue = parseFloat(this.simRecordReturnValue);
      if (isNaN(returnValue) || returnValue < 0) {
        uni.showToast({
          title: "实际回收数值不能为空！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      const roundNo = parseInt(this.simRecordRoundNo);
      if (isNaN(roundNo)) {
        uni.showToast({
          title: "本轮轮次不能为空！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      const record = {
        returnValue: returnValue,
        roundNo: roundNo,
      };
      if (!this.currentVersionId || this.simFinished) {
        // 暂存本轮结果，待开启新版本确认创建后再继续保存，取消则中止记录
        this.pendingSimRecord = record;
        this.$refs.versionCreatePopup.open("dialog");
      } else {
        this.doSubmitSimRound(record);
      }
    },
    // 保存本轮结果记录，保存后下一轮从保存的结束数值继续，轮次为负时版本被强制作废
    doSubmitSimRound(record) {
      const self = this;
      this.simSubmitting = true;
      const roundNo = record.roundNo;
      addSimulate({
        versionId: self.currentVersionId,
        simMode: self.simForm.simMode,
        roundNo: roundNo,
        startValue: self.formatSimNumber(self.simNextStartValue),
        joinValue: self.formatSimNumber(self.simRecordJoinValue),
        isHit: self.simRecordIsHit,
        returnValue: self.formatSimNumber(record.returnValue),
        endValue: self.formatSimNumber(self.simRecordEndValue),
        roundChange: String(
          self.formatSimFactor(self.simRecordEndValue / self.simNextStartValue)
        ),
        coefficient: self.formatSimNumber(self.simForm.coefficient),
      })
        .then((res) => {
          if (res?.code === 200) {
            self.$refs.recordPopup.close();
            if (roundNo < 0) {
              // 轮次为负，版本已被后端强制作废，弹窗告知并刷新版本列表
              self.simInvalidNoticeVersion =
                self.simVersionList.find(
                  (item) => item.versionId === self.currentVersionId
                ) || { versionId: self.currentVersionId };
              self.simInvalidNoticeRoundNo = roundNo;
              self.$refs.invalidNoticePopup.open("dialog");
              self.getSimVersionList().then(() => {
                self.$refs.paging.reload();
              });
            } else {
              uni.showToast({
                title: "本轮记录保存成功！",
                icon: "none",
                duration: 1998,
              });
              self.$refs.paging.reload();
            }
          } else {
            uni.showToast({
              title: "数值模拟轮次记录保存失败！",
              icon: "none",
              duration: 1998,
            });
          }
        })
        .catch((res) => {
          uni.showToast({
            title: "数值模拟轮次记录保存失败！",
            icon: "none",
            duration: 1998,
          });
        })
        .finally(() => {
          self.simSubmitting = false;
        });
    },
    // 取消记录本轮结果
    handleSimRecordCancel() {
      this.$refs.recordPopup.close();
    },
    // 以当前参数配置开启新的数值模拟版本，历史轮次归档到旧版本
    createSimVersion(versionName) {
      const self = this;
      return addSimulateVersion({
        versionName: versionName,
        simMode: self.simForm.simMode,
        initialValue: self.formatSimNumber(self.simForm.initialValue),
        coefficient: self.formatSimNumber(self.simForm.coefficient),
        targetValue: self.formatSimNumber(self.simForm.targetValue),
      }).then((res) => {
        if (res?.code === 200) {
          return self.getSimVersionList(true);
        }
        return Promise.reject(res);
      });
    },
    // 手动开启新的数值模拟版本，先经确认弹窗输入版本名称，确认后才创建
    handleSimRestart() {
      if (!this.validateSimParams()) {
        return;
      }
      this.pendingSimRecord = null;
      this.$refs.versionCreatePopup.open("dialog");
    },
    // 取消开启新版本，有暂存的本轮结果时一并中止记录
    handleSimVersionCreateCancel() {
      this.pendingSimRecord = null;
      this.simVersionCreateName = "";
      this.$refs.versionCreatePopup.close();
    },
    // 开启新版本确认弹窗确认后创建版本，有暂存的本轮结果时继续保存
    confirmSimVersionCreate() {
      const self = this;
      const versionName = (this.simVersionCreateName || "").trim();
      if (!versionName) {
        uni.showToast({
          title: "版本名称不能为空！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      this.simVersionCreateSubmitting = true;
      this.createSimVersion(versionName)
        .then(() => {
          self.$refs.versionCreatePopup.close();
          self.simVersionCreateName = "";
          if (self.pendingSimRecord) {
            const record = self.pendingSimRecord;
            self.pendingSimRecord = null;
            self.doSubmitSimRound(record);
          } else {
            uni.showToast({
              title: `已开启新版本，下一轮将从初始数值 ${self.formatSimNumber(self.simForm.initialValue)} 重新开始！`,
              icon: "none",
              duration: 1998,
            });
            self.$refs.paging.reload();
          }
        })
        .catch(() => {
          uni.showToast({
            title: "开启新版本失败！",
            icon: "none",
            duration: 1998,
          });
        })
        .finally(() => {
          self.simVersionCreateSubmitting = false;
        });
    },
    // 打开版本作废第一步确认弹窗，仅支持作废24小时内创建的版本，更早版本提示在网页端后台操作
    handleSimVersionInvalidate(version) {
      if (diffTimeStrFromNow(version?.createTime) <= -24) {
        uni.showToast({
          title: "版本创建时间已超过24小时，不允许作废操作！有需要请在网页端后台操作~",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      this.simInvalidateVersion = version;
      this.simInvalidateKeyword = "";
      this.startInvalidateCountdown();
      this.$refs.invalidateConfirmPopup.open("dialog");
    },
    // 版本作废第一步确认倒计时
    startInvalidateCountdown() {
      const self = this;
      this.stopInvalidateCountdown();
      this.simInvalidateCountdown = 5;
      this.simInvalidateCountdownTimer = setInterval(() => {
        if (self.simInvalidateCountdown > 0) {
          self.simInvalidateCountdown--;
        }
        if (self.simInvalidateCountdown <= 0) {
          self.stopInvalidateCountdown();
        }
      }, 1000);
    },
    // 停止版本作废第一步确认倒计时
    stopInvalidateCountdown() {
      this.simInvalidateCountdown = 0;
      if (this.simInvalidateCountdownTimer) {
        clearInterval(this.simInvalidateCountdownTimer);
        this.simInvalidateCountdownTimer = null;
      }
    },
    // 版本作废第一步确认通过，进入第二步输入关键词确认
    handleSimInvalidateStep1Confirm() {
      this.stopInvalidateCountdown();
      this.$refs.invalidateConfirmPopup.close();
      this.$refs.invalidateDangerPopup.open("dialog");
    },
    // 取消版本作废，关闭两步确认弹窗并重置状态
    handleSimInvalidateCancel() {
      this.stopInvalidateCountdown();
      this.simInvalidateKeyword = "";
      this.$refs.invalidateConfirmPopup.close();
      this.$refs.invalidateDangerPopup.close();
    },
    // 版本作废二次验证通过，正式作废版本并刷新版本列表，作废当前选中版本时自动切换到最新启用版本
    handleSimInvalidateConfirm() {
      const self = this;
      const version = this.simInvalidateVersion;
      if (!version || !version.versionId) {
        this.handleSimInvalidateCancel();
        return;
      }
      this.simInvalidateSubmitting = true;
      invalidateSimulateVersion({
        versionId: version.versionId,
      })
        .then((res) => {
          if (res?.code === 200) {
            self.stopInvalidateCountdown();
            self.simInvalidateKeyword = "";
            self.$refs.invalidateDangerPopup.close();
            self.$refs.invalidateConfirmPopup.close();
            uni.showToast({
              title: `版本「${version.versionName || `版本${version.versionNo}`}」已作废！`,
              icon: "none",
              duration: 1998,
            });
            self.getSimVersionList().then(() => {
              self.$refs.paging.reload();
            });
          } else {
            uni.showToast({
              title: "版本作废失败！",
              icon: "none",
              duration: 1998,
            });
          }
        })
        .catch(() => {
          uni.showToast({
            title: "版本作废失败！",
            icon: "none",
            duration: 1998,
          });
        })
        .finally(() => {
          self.simInvalidateSubmitting = false;
        });
    },
    // 关闭版本强制作废系统通知弹窗并重置状态
    handleSimInvalidNoticeClose() {
      this.simInvalidNoticeVersion = null;
      this.simInvalidNoticeRoundNo = "";
      this.$refs.invalidNoticePopup.close();
    },
    // 删除最近一条数值模拟轮次记录，下一轮回退到上一条的结束数值
    handleSimDeleteLast() {
      const self = this;
      const lastRound = this.simLastRound;
      if (!lastRound) {
        return;
      }
      showConfirm(
        `是否确认删除第${lastRound.roundNo}轮记录（结束数值 ${this.formatSimNumber(lastRound.endValue)}）？删除后将从上一轮结束数值继续`,
        "警告"
      ).then((res) => {
        if (res?.confirm && lastRound?.simId) {
          delSimulate(lastRound.simId).then((res) => {
            if (res?.code === 200) {
              uni.showToast({
                title: "数值模拟轮次记录删除成功！",
                icon: "none",
                duration: 1998,
              });
              self.$refs.paging.reload();
            } else {
              uni.showToast({
                title: "数值模拟轮次记录删除失败！",
                icon: "none",
                duration: 1998,
              });
            }
          });
        }
      });
    },
    // 计算从初始数值连续达成达目标所需的最少轮次
    countSimRequiredRounds(initialValue, targetValue, winFactor) {
      if (initialValue <= 0 || targetValue <= 0 || winFactor <= 1) {
        return "-";
      }
      if (initialValue >= targetValue) {
        return 0;
      }
      return Math.ceil(
        Math.log(targetValue / initialValue) / Math.log(winFactor)
      );
    },
    // 数值模拟金额格式化，保留两位小数
    formatSimNumber(value) {
      return parseFloat(value || 0).toFixed(2);
    },
    // 数值模拟乘数格式化，去除多余的零
    formatSimFactor(value) {
      return parseFloat(parseFloat(value || 0).toFixed(4));
    },
  },
};
</script>

<style lang="less">
@import url("./simulate.less");
</style>
