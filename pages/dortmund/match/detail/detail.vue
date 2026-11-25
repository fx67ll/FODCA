<template>
  <view class="fx67ll-match-detail-page">
    <view class="match-detail-body">
      <view v-if="loading" class="match-detail-loading">
        <view class="match-loading-ring" />
        <text>正在加载比赛详情…</text>
      </view>

      <template v-else>
        <view class="match-detail-hero">
          <view class="match-detail-hero-glow" />
          <text class="match-detail-code">{{ detail.matchCode || '比赛记录' }}</text>
          <view class="match-detail-versus">
            <text class="match-detail-team">{{ detail.homeTeamName || '未知主队' }}</text>
            <text class="match-detail-vs">VS</text>
            <text class="match-detail-team is-away">{{ detail.awayTeamName || '未知客队' }}</text>
          </view>
          <view class="match-detail-tags">
            <text class="match-detail-tag">{{ matchStatusLabel(detail.matchStatus) }}</text>
            <text class="match-detail-tag" :class="detailResultClass">
              {{ matchResultLabel(detail.matchResult) }}
            </text>
            <text class="match-detail-tag is-time">🕒 {{ formatDetailTime(detail.matchTime) }}</text>
          </view>
        </view>

        <view class="match-detail-section">
          <view class="match-detail-section-title">
            <text class="match-detail-section-icon">📋</text>
            <text>比赛信息</text>
          </view>
          <view class="match-info-grid">
            <view v-for="item in infoItems" :key="item.label" class="match-info-item">
              <text class="match-info-label">{{ item.label }}</text>
              <text class="match-info-value">{{ item.value || item.emptyText || '未记录' }}</text>
            </view>
          </view>
        </view>

        <!-- 有效倍率是回报组合冻结数据，详情页只读展示，不在移动端切换或编辑版本 -->
        <view class="match-detail-section match-active-odds-section">
          <view class="match-detail-section-title">
            <text class="match-detail-section-icon">🎚️</text>
            <text>有效倍率版本</text>
            <text v-if="activeOdds" class="match-active-odds-badge">当前有效</text>
          </view>
          <view v-if="activeOddsLoading" class="match-active-odds-loading">
            <view class="match-loading-ring" />
            <text>正在读取倍率版本…</text>
          </view>
          <template v-else-if="activeOdds">
            <view class="match-active-odds-head">
              <view class="match-active-odds-copy">
                <text class="match-active-odds-code">{{ activeOdds.oddsCode || '未命名版本' }}</text>
                <text class="match-active-odds-source">来源 {{ normalizeDateTime(activeOdds.sourceTime) }}</text>
              </view>
              <view class="match-active-handicap">
                <text class="match-active-handicap-label">让分值</text>
                <text class="match-active-handicap-value" :class="activeHandicapClass">
                  {{ formatHandicap(activeOdds.handicapValue) }}
                </text>
              </view>
            </view>
            <view class="match-active-odds-grid">
              <view v-for="row in activeOddsRows" :key="row.value" class="match-active-odds-item">
                <view class="match-active-odds-item-head">
                  <text class="match-active-odds-tag">{{ row.value }}</text>
                  <text class="match-active-odds-name">{{ row.text }}</text>
                </view>
                <text class="match-active-odds-value">{{ formatOddsValue(row.odds) }}</text>
                <text class="match-active-odds-weight">权重 {{ formatOddsWeight(row.weight) }}</text>
              </view>
            </view>
          </template>
          <view v-else class="match-active-odds-empty">
            <text class="match-active-odds-empty-icon">📌</text>
            <view>
              <text class="match-active-odds-empty-title">暂无有效倍率版本</text>
              <text class="match-active-odds-empty-desc">赛果仍可正常补录，倍率版本请从 Web 端维护。</text>
            </view>
          </view>
        </view>

        <view id="match-result-entry" class="match-detail-section match-result-section">
          <view class="match-detail-section-title">
            <text class="match-detail-section-icon">✍️</text>
            <text>赛果补录</text>
            <text class="match-result-count">{{ selectedOddsCount }} 项倍率</text>
          </view>
          <view class="match-result-warning">
            <text class="match-result-warning-icon">⚠️</text>
            <text>保存后以本页赛果为准；关联回报组合的核验状态会重置为未核验，请重新核验。</text>
          </view>

          <view class="match-result-block">
            <view class="match-result-block-head">
              <view>
                <text class="match-result-block-title">常规赛果</text>
                <text class="match-result-block-desc">单选，可清除为未登记</text>
              </view>
              <button class="match-result-clear" @click="clearMatchResult">
                <uni-icons type="closeempty" size="13" color="#809187" />
                <text>清除</text>
              </button>
            </view>
            <view class="match-result-options">
              <view v-for="(option, index) in matchResultOptions" :key="option.value" class="match-result-option"
                :class="{ 'is-active': draft.matchResult === option.value }" @click="selectMatchResult(option.value)">
                <text class="match-result-option-icon">{{ resultIcons[index] }}</text>
                <text class="match-result-option-text">{{ option.text }}</text>
              </view>
            </view>
          </view>

          <view class="match-result-block">
            <view class="match-result-block-head">
              <view>
                <text class="match-result-block-title">倍率赛果</text>
                <text class="match-result-block-desc">可多选，需至少选择一项才登记</text>
              </view>
              <button class="match-result-clear" @click="clearOddsResult">
                <uni-icons type="closeempty" size="13" color="#809187" />
                <text>清除</text>
              </button>
            </view>
            <view class="match-odds-grid">
              <view v-for="option in oddsResultOptions" :key="option.value" class="match-odds-option"
                :class="{ 'is-active': selectedOddsMap[option.value] }" @click="toggleOddsResult(option.value)">
                <text class="match-odds-code">{{ option.value }}</text>
                <text class="match-odds-name">{{ option.text }}</text>
                <uni-icons v-if="selectedOddsMap[option.value]" type="checkmarkempty" size="14" color="#ffffff" />
              </view>
            </view>
          </view>

          <view class="match-result-preview">
            <view class="match-result-preview-row">
              <text class="match-result-preview-label">常规赛果</text>
              <text class="match-result-preview-value">{{ matchResultLabel(draft.matchResult) }}</text>
            </view>
            <view class="match-result-preview-row">
              <text class="match-result-preview-label">倍率赛果</text>
              <text class="match-result-preview-value is-odds">{{ selectedOddsText }}</text>
            </view>
          </view>
        </view>

        <view class="match-detail-bottom-space" />
      </template>
    </view>

    <view class="match-detail-footer">
      <button class="match-footer-btn match-footer-close" @click="goBack">返回</button>
      <button class="match-footer-btn match-footer-save" :disabled="saving || loading" @click="saveMatchResult">
        <uni-icons :type="saving ? 'spinner-cycle' : 'checkmarkempty'" size="17" color="#ffffff" />
        <text>{{ saving ? '保存中…' : '保存赛果' }}</text>
      </button>
    </view>
  </view>
</template>

<script>
import { getActiveOdds, getMatchInfo, updateMatchResult } from '@/api/fx67ll/dortmund/match';
import {
  MATCH_RESULT_OPTIONS,
  ODDS_RESULT_OPTIONS,
  formatNumber,
  matchResultLabel,
  normalizeDateTime,
} from '@/pages/dortmund/common/format';

// 有效倍率六类字段与前端展示编码一一对应，避免详情页依赖后端字段顺序
const ACTIVE_ODDS_FIELDS = Object.freeze({
  HW: ['homeWinOdds', 'homeWinWeight'],
  DR: ['drawOdds', 'drawWeight'],
  AW: ['awayWinOdds', 'awayWinWeight'],
  HH: ['handicapHomeWinOdds', 'handicapHomeWinWeight'],
  HD: ['handicapDrawOdds', 'handicapDrawWeight'],
  HA: ['handicapAwayWinOdds', 'handicapAwayWinWeight'],
});

export default {
  name: 'MatchDetailPage',
  data() {
    return {
      detail: {},
      matchId: null,
      focusResult: false,
      resultScrolled: false,
      draft: {
        matchResult: '',
      },
      oddsResultList: [],
      matchResultOptions: MATCH_RESULT_OPTIONS,
      oddsResultOptions: ODDS_RESULT_OPTIONS,
      activeOdds: null,
      activeOddsLoading: false,
      resultIcons: ['🏠', '🤝', '✈️'],
      loading: false,
      saving: false,
    };
  },
  computed: {
    selectedOddsCount() {
      return this.oddsResultList.length;
    },
    selectedOddsText() {
      const labels = ODDS_RESULT_OPTIONS
        .filter((option) => this.oddsResultList.includes(option.value))
        .map((option) => `${option.value} ${option.text}`);
      return labels.length ? labels.join('、') : '未登记';
    },
    // 详情页固定展示六类有效倍率；无有效版本时整块显示空状态
    activeOddsRows() {
      if (!this.activeOdds) return [];
      return ODDS_RESULT_OPTIONS.map((option) => {
        const fields = ACTIVE_ODDS_FIELDS[option.value] || [];
        return {
          value: option.value,
          text: option.text,
          odds: this.activeOdds[fields[0]],
          weight: this.activeOdds[fields[1]],
        };
      });
    },
    activeHandicapClass() {
      const value = Number(this.activeOdds?.handicapValue);
      if (!Number.isFinite(value) || value === 0) return 'is-neutral';
      return value > 0 ? 'is-positive' : 'is-negative';
    },
    // 小程序模板不保证支持数组 includes 调用，选择状态预先转换为字典查询
    selectedOddsMap() {
      return this.oddsResultList.reduce((map, value) => {
        map[value] = true;
        return map;
      }, {});
    },
    infoItems() {
      return [
        { label: '所属赛季', value: this.detail.seasonName, emptyText: '未关联赛季' },
        { label: '比赛状态', value: this.matchStatusLabel(this.detail.matchStatus) },
        { label: '开赛时间', value: normalizeDateTime(this.detail.matchTime) },
        { label: '比赛场地', value: this.detail.matchVenue, emptyText: '主场待定' },
        { label: '分析次数', value: this.detail.analysisCount == null ? '0' : String(this.detail.analysisCount) },
        {
          label: '已采用组合',
          value: this.detail.adoptedCombinationCount == null ? '0' : String(this.detail.adoptedCombinationCount),
        },
        { label: '创建人', value: this.detail.createBy },
        { label: '最近更新', value: normalizeDateTime(this.detail.updateTime || this.detail.createTime) },
      ];
    },
    // 小程序模板不支持在 :class 中调用方法，详情赛果样式统一预计算
    detailResultClass() {
      return this.matchResultClass(this.detail.matchResult);
    },
  },
  onLoad(options) {
    const id = this.normalizeId(options?.matchId);
    if (!id) {
      uni.showToast({ title: '比赛主键缺失', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 500);
      return;
    }
    this.matchId = id;
    this.focusResult = options?.focus === 'result';
  },
  onShow() {
    // 页面重新显示时刷新服务端事实，避免返回页面后继续展示过期赛果。
    if (this.matchId) {
      this.refreshDetail(!this.detail.matchId);
    }
  },
  onPullDownRefresh() {
    this.refreshDetail(false).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    matchResultLabel,
    normalizeDateTime,
    normalizeId(value) {
      const id = Number(value);
      return Number.isInteger(id) && id > 0 ? id : null;
    },
    formatDetailTime(value) {
      return value ? String(value).replace('T', ' ').slice(0, 16) : '时间待定';
    },
    matchStatusLabel(value) {
      return String(value || '') === '1' ? '已关闭' : '正常';
    },
    matchResultClass(value) {
      if (value === '0') return 'is-home';
      if (value === '1') return 'is-draw';
      if (value === '2') return 'is-away';
      return 'is-pending';
    },
    syncResultForm(source) {
      const matchResult = String(source?.matchResult || '');
      this.draft.matchResult = MATCH_RESULT_OPTIONS.some((option) => option.value === matchResult)
        ? matchResult
        : '';
      const tokens = String(source?.oddsResult || '')
        .split(/[,，;；、\s]+/)
        .map((token) => token.trim().toUpperCase())
        .filter(Boolean);
      this.oddsResultList = ODDS_RESULT_OPTIONS
        .map((option) => option.value)
        .filter((value) => tokens.includes(value));
    },
    refreshDetail(showLoading = false) {
      const id = this.normalizeId(this.matchId || this.detail.matchId);
      if (!id) {
        return Promise.resolve();
      }
      if (showLoading) {
        this.loading = true;
      }
      // 基础详情与倍率版本并行读取；倍率失败不阻断赛果补录主流程
      this.refreshActiveOdds(id);
      return getMatchInfo(id)
        .then((res) => {
          if (res?.code === 200) {
            this.detail = { ...(this.detail || {}), ...(res.data || {}) };
            this.syncResultForm(this.detail);
            if (this.focusResult && !this.resultScrolled) {
              this.resultScrolled = true;
              this.$nextTick(() => this.scrollToResultSection());
            }
          }
        })
        .catch(() => {
          // request.js 已提示错误；保留当前页面已加载内容，避免详情区闪空
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 倍率版本单独加载，失败不影响比赛基础详情和赛果录入
    refreshActiveOdds(matchId) {
      this.activeOddsLoading = true;
      return getActiveOdds(matchId)
        .then((res) => {
          if (res?.code === 200) {
            this.activeOdds = res.data || null;
          }
        })
        .catch(() => {
          this.activeOdds = null;
        })
        .finally(() => {
          this.activeOddsLoading = false;
        });
    },
    formatHandicap(value) {
      if (value === null || value === undefined || value === '') return '未设置';
      const number = Number(value);
      if (!Number.isFinite(number)) return String(value);
      const text = formatNumber(number, 2);
      return number > 0 ? `+${text}` : text;
    },
    formatOddsValue(value) {
      if (value === null || value === undefined || value === '') return '未设置';
      return formatNumber(value, 4);
    },
    formatOddsWeight(value) {
      if (value === null || value === undefined || value === '') return '未设置';
      const number = Number(value);
      return Number.isFinite(number) ? number.toFixed(4) : String(value);
    },
    selectMatchResult(value) {
      this.draft.matchResult = this.draft.matchResult === value ? '' : value;
    },
    clearMatchResult() {
      this.draft.matchResult = '';
    },
    toggleOddsResult(value) {
      if (this.oddsResultList.includes(value)) {
        this.oddsResultList = this.oddsResultList.filter((item) => item !== value);
      } else {
        this.oddsResultList = [...this.oddsResultList, value];
      }
    },
    clearOddsResult() {
      this.oddsResultList = [];
    },
    buildOddsResult() {
      const odds = ODDS_RESULT_OPTIONS
        .map((option) => option.value)
        .filter((value) => this.oddsResultList.includes(value));
      return odds.length ? odds.join(',') : null;
    },
    saveMatchResult() {
      if (this.saving) return;
      const id = this.normalizeId(this.detail.matchId || this.matchId);
      if (!id) {
        uni.showToast({ title: '比赛主键缺失，请关闭后重试', icon: 'none' });
        return;
      }
      const payload = {
        matchId: id,
        matchResult: this.draft.matchResult || null,
        oddsResult: this.buildOddsResult(),
      };
      this.saving = true;
      updateMatchResult(payload)
        .then((res) => {
          if (res?.code === 200) {
            uni.showToast({ title: '赛果已保存', icon: 'none' });
            setTimeout(() => this.goBack(), 350);
          } else {
            uni.showToast({ title: res?.msg || '赛果保存失败，请稍后重试', icon: 'none' });
          }
        })
        .catch(() => {
          // request.js 已统一提示服务端语义错误
        })
        .finally(() => {
          this.saving = false;
        });
    },
    goBack() {
      uni.navigateBack();
    },
    scrollToResultSection() {
      const query = uni.createSelectorQuery().in(this);
      query.select('#match-result-entry').boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec((result) => {
        const rect = result?.[0];
        const viewport = result?.[1];
        if (!rect || !viewport) return;
        uni.pageScrollTo({
          scrollTop: Math.max(rect.top + viewport.scrollTop - 12, 0),
          duration: 300,
        });
      });
    },
  },
};
</script>

<style lang="less">
@import url('./detail.less');
</style>
