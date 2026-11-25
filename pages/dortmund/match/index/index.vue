<template>
  <view class="fx67ll-match-box">
    <z-paging-mini ref="paging" :paging-style="pagingStyle" back-to-top-bottom="40rpx" :auto-show-back-to-top="true"
      v-model="matchList" @query="queryMatchList">
      <!-- 顶部固定区：标题、比赛球队搜索和赛果筛选不随列表滚动 -->
      <template v-slot:top>
        <view class="match-top">
          <view class="match-hero">
            <view class="match-hero-glow match-hero-glow-one" />
            <view class="match-hero-glow match-hero-glow-two" />
            <view class="match-hero-content">
              <text class="match-hero-kicker">FODCS FREEDOM</text>
              <view class="match-hero-title">
                <text class="match-hero-emoji">⚽️</text>
                <text>比赛历史记录</text>
              </view>
              <text class="match-hero-desc">回看比赛编排，补录常规赛果与倍率赛果</text>
            </view>
            <view class="match-hero-mark">
              <uni-icons type="flag" color="#ffffff" size="34" />
            </view>
            <view class="match-hero-total">
              <text class="match-hero-total-value">{{ total }}</text>
              <text class="match-hero-total-label">场比赛</text>
            </view>
          </view>

          <view class="match-filter-card">
            <view class="match-search-row">
              <view class="match-search-input">
                <uni-easyinput v-model="filters.keyword" prefixIcon="search" placeholder="搜索主队或客队" :inputBorder="false"
                  confirmType="search" @confirm="reloadList" @clear="reloadList" />
              </view>
              <button class="match-filter-toggle" :class="{ 'is-active': filterOpen }"
                @click="filterOpen = !filterOpen">
                <uni-icons type="settings" size="16" :color="filterOpen ? '#ffffff' : '#2ecc71'" />
                <text>筛选</text>
              </button>
            </view>

            <scroll-view scroll-x class="match-chip-scroll" :show-scrollbar="false">
              <view class="match-chip-row">
                <view v-for="option in resultOptions" :key="option.text" class="match-chip"
                  :class="['match-chip', filters.matchResult === option.value ? 'is-active' : '', option.className]"
                  @click="selectMatchResult(option.value)">
                  <text>{{ option.text }}</text>
                </view>
              </view>
            </scroll-view>

            <view v-if="filterOpen" class="match-advanced">
              <view class="match-advanced-title">比赛时间</view>
              <view class="match-date-row">
                <picker class="match-date-picker" mode="date" :value="filters.beginMatchTime"
                  @change="onBeginDateChange">
                  <view class="match-date-value" :class="{ 'is-empty': !filters.beginMatchTime }">
                    <uni-icons type="calendar" size="15" color="#2ecc71" />
                    <text>{{ filters.beginMatchTime || '开始日期' }}</text>
                  </view>
                </picker>
                <text class="match-date-separator">至</text>
                <picker class="match-date-picker" mode="date" :value="filters.endMatchTime" @change="onEndDateChange">
                  <view class="match-date-value" :class="{ 'is-empty': !filters.endMatchTime }">
                    <uni-icons type="calendar" size="15" color="#2ecc71" />
                    <text>{{ filters.endMatchTime || '结束日期' }}</text>
                  </view>
                </picker>
              </view>
              <view class="match-advanced-footer">
                <text class="match-advanced-tip">赛果和日期筛选会即时刷新；球队名称输入后按回车搜索。</text>
                <button class="match-reset-btn" @click="resetFilters">重置</button>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 比赛卡片：仅右下角“查看”进入详情，左滑打开轻量赛果录入弹窗，避免整卡误触 -->
      <uni-swipe-action>
        <view v-for="item in matchList" :key="item.matchId" class="match-card-wrap"
          :style="{ animationDelay: item._animationDelay }">
          <uni-swipe-action-item :right-options="actionOptions" @click="(e) => handleActionClick(e, item)">
            <view class="match-card">
              <view class="match-card-head">
                <view class="match-card-code-wrap">
                  <text class="match-card-code">{{ item.matchCode || '比赛记录' }}</text>
                  <text class="match-card-season">{{ item.seasonName || '未关联赛季' }}</text>
                </view>
                <view class="match-card-tags">
                  <text class="match-tag" :class="item._statusClass">
                    {{ matchStatusLabel(item.matchStatus) }}
                  </text>
                  <text class="match-tag" :class="item._resultClass">
                    {{ matchResultLabel(item.matchResult) }}
                  </text>
                </view>
              </view>

              <view class="match-versus">
                <view class="match-team match-team-home">
                  <view class="match-team-badge">主</view>
                  <text class="match-team-name">{{ item.homeTeamName || '未知主队' }}</text>
                </view>
                <view class="match-versus-center">
                  <text class="match-versus-text">VS</text>
                </view>
                <view class="match-team match-team-away">
                  <view class="match-team-badge is-away">客</view>
                  <text class="match-team-name">{{ item.awayTeamName || '未知客队' }}</text>
                </view>
              </view>

              <view class="match-meta-row">
                <view class="match-meta-pill">
                  <text>🏟️ {{ item.matchVenue || '主场待定' }}</text>
                </view>
                <view class="match-meta-pill">
                  <text>🎯 倍率赛果 {{ oddsResultText(item.oddsResult) }}</text>
                </view>
              </view>

              <view class="match-stat-grid">
                <view class="match-stat-item">
                  <text class="match-stat-label">分析次数</text>
                  <text class="match-stat-value">{{ item.analysisCount || 0 }}</text>
                </view>
                <view class="match-stat-item">
                  <text class="match-stat-label">已采用组合</text>
                  <text class="match-stat-value is-green">{{ item.adoptedCombinationCount || 0 }}</text>
                </view>
              </view>

              <view class="match-time-row">
                <text class="match-time-row-label">开赛时间</text>
                <text class="match-time-row-value">{{ normalizeDateTime(item.matchTime) }}</text>
              </view>

              <view class="match-card-footer">
                <text class="match-card-tip">🕒 更新 {{ normalizeDateTime(item.updateTime || item.createTime) }}</text>
                <view class="match-card-view" @click.stop="openDetailPage(item)">
                  <text>查看</text>
                  <uni-icons type="right" size="12" color="#2ecc71" />
                </view>
              </view>
            </view>
          </uni-swipe-action-item>
        </view>
      </uni-swipe-action>

      <view slot="empty" class="match-empty">
        <view class="match-empty-icon">🧺</view>
        <text class="match-empty-title">暂无比赛记录</text>
        <text class="match-empty-desc">可以尝试清空筛选条件，或下拉刷新重新加载。</text>
      </view>
    </z-paging-mini>

    <!-- 左滑“录入赛果”仅打开轻量弹窗，避免离开列表；有效倍率只读展示让分值 -->
    <uni-popup ref="resultPopup" type="dialog" :is-mask-click="!entrySaving">
      <view class="match-entry-dialog">
        <view class="match-entry-head">
          <view class="match-entry-title-wrap">
            <text class="match-entry-kicker">QUICK ENTRY</text>
            <text class="match-entry-title">录入赛果</text>
            <text class="match-entry-subtitle">{{ entryMatchupText }}</text>
          </view>
          <view class="match-entry-close" :class="{ 'is-disabled': entrySaving }" @click="closeResultPopup">
            <uni-icons type="closeempty" size="18" color="#7f9186" />
          </view>
        </view>

        <scroll-view scroll-y class="match-entry-body">
          <view class="match-entry-odds" :class="{ 'is-empty': !entryActiveOdds }">
            <view v-if="entryOddsLoading" class="match-entry-odds-loading">
              <view class="match-entry-spinner" />
              <text>正在读取有效倍率版本…</text>
            </view>
            <template v-else-if="entryActiveOdds">
              <view class="match-entry-odds-copy">
                <text class="match-entry-odds-label">当前有效倍率版本</text>
                <text class="match-entry-odds-code">{{ entryActiveOdds.oddsCode || '未命名版本' }}</text>
              </view>
              <view class="match-entry-handicap">
                <text class="match-entry-handicap-label">让分值</text>
                <text class="match-entry-handicap-value" :class="entryHandicapClass">
                  {{ formatHandicap(entryActiveOdds.handicapValue) }}
                </text>
              </view>
            </template>
            <template v-else>
              <text class="match-entry-odds-empty-icon">📌</text>
              <view>
                <text class="match-entry-odds-empty-title">暂无有效倍率版本</text>
                <text class="match-entry-odds-empty-desc">仍可先登记常规赛果与倍率赛果。</text>
              </view>
            </template>
          </view>

          <view class="match-entry-section">
            <view class="match-entry-section-head">
              <text class="match-entry-section-title">常规赛果</text>
              <text class="match-entry-section-tip">单选，可再次点击取消</text>
            </view>
            <view class="match-entry-result-row">
              <view v-for="(option, index) in matchResultOptions" :key="option.value" class="match-entry-result"
                :class="{ 'is-active': entryMatchResult === option.value }"
                @click="selectEntryMatchResult(option.value)">
                <text class="match-entry-result-icon">{{ resultIcons[index] }}</text>
                <text class="match-entry-result-text">{{ option.text }}</text>
              </view>
            </view>
          </view>

          <view class="match-entry-section">
            <view class="match-entry-section-head">
              <text class="match-entry-section-title">倍率赛果</text>
              <text class="match-entry-section-tip">可多选，已选 {{ entryOddsList.length }} 项</text>
            </view>
            <view class="match-entry-odds-grid">
              <view v-for="option in oddsResultOptions" :key="option.value" class="match-entry-odds-option"
                :class="{ 'is-active': entryOddsMap[option.value] }" @click="toggleEntryOddsResult(option.value)">
                <text class="match-entry-option-code">{{ option.value }}</text>
                <text class="match-entry-option-name">{{ option.text }}</text>
                <uni-icons v-if="entryOddsMap[option.value]" type="checkmarkempty" size="14" color="#ffffff" />
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="match-entry-actions">
          <button class="match-entry-btn is-cancel" :disabled="entrySaving" @click="closeResultPopup">取消</button>
          <button class="match-entry-btn is-save" :disabled="entrySaving || entryOddsLoading" @click="saveEntryResult">
            <uni-icons :type="entrySaving ? 'spinner-cycle' : 'checkmarkempty'" size="16" color="#ffffff" />
            <text>{{ entrySaving ? '保存中…' : '保存赛果' }}</text>
          </button>
        </view>
      </view>
    </uni-popup>

  </view>
</template>

<script>
import { getActiveOdds, getMatchList, updateMatchResult } from '@/api/fx67ll/dortmund/match';
import {
  MATCH_RESULT_OPTIONS,
  ODDS_RESULT_OPTIONS,
  cardAnimationDelay,
  formatNumber,
  matchResultLabel,
  normalizeDateTime,
  oddsResultLabels,
} from '@/pages/dortmund/common/format';
import uniPopup from '@/pages/dortmund/component/uni-popup/uni-popup.vue';

export default {
  components: { uniPopup },
  data() {
    return {
      matchList: [],
      total: 0,
      listReady: false,
      filterOpen: false,
      filters: {
        keyword: '',
        matchResult: 'U',
        beginMatchTime: '',
        endMatchTime: '',
      },
      resultOptions: [
        { text: '全部赛果', value: '', className: 'is-neutral' },
        { text: '未登记', value: 'U', className: 'is-pending' },
        { text: '主队胜', value: '0', className: 'is-home' },
        { text: '平局', value: '1', className: 'is-draw' },
        { text: '客队胜', value: '2', className: 'is-away' },
      ],
      // 静态左滑操作配置：详情由右下角“查看”进入，左滑只保留高频赛果录入
      actionOptions: [
        { text: '录入赛果', style: { backgroundColor: '#2ecc71' } },
      ],
      // 轻量赛果录入弹窗状态；与详情页各自维护草稿，只有确认保存后才写回服务端
      entryItem: {},
      entryMatchResult: '',
      entryOddsList: [],
      entryActiveOdds: null,
      entryOddsLoading: false,
      entrySaving: false,
      matchResultOptions: MATCH_RESULT_OPTIONS,
      oddsResultOptions: ODDS_RESULT_OPTIONS,
      resultIcons: ['🏠', '🤝', '✈️'],
    };
  },
  computed: {
    // H5 宽屏卡片中导航栏和顶部安全区均为 fixed；通过组件内联样式覆盖 z-paging 默认的 windowTop，
    // 让列表从真实内容区开始，避免顶部 Hero 被模拟导航栏遮挡。其他平台保持组件默认定位。
    pagingStyle() {
      const style = {};
      // #ifdef H5
      style.top = 'calc(var(--window-top, 44px) + var(--safe-top, 0px))';
      style.bottom = 'var(--safe-bottom, 0px)';
      // #endif
      return style;
    },
    entryMatchupText() {
      const item = this.entryItem || {};
      return `${item.homeTeamName || '未知主队'} VS ${item.awayTeamName || '未知客队'}`;
    },
    // 小程序模板不保证支持数组 includes 调用，勾选状态统一转换为字典查询
    entryOddsMap() {
      return this.entryOddsList.reduce((map, value) => {
        map[value] = true;
        return map;
      }, {});
    },
    entryHandicapClass() {
      const value = Number(this.entryActiveOdds?.handicapValue);
      if (!Number.isFinite(value) || value === 0) return 'is-neutral';
      return value > 0 ? 'is-positive' : 'is-negative';
    },
  },
  onShow() {
    // 从详情页返回后重新查询，确保刚补录的赛果和关联组合统计立即生效。
    if (this.listReady) {
      this.reloadList();
    }
  },
  methods: {
    matchResultLabel,
    normalizeDateTime,
    cardAnimationDelay,
    // 列表分页查询；z-paging 根据 total 判断是否还能继续上拉加载
    queryMatchList(pageNum, pageSize) {
      if (!this.validateDateRange(false)) {
        this.$refs.paging.complete(false);
        return;
      }
      const query = {
        pageNum,
        pageSize,
        teamName: this.filters.keyword.trim() || null,
        matchResult: this.filters.matchResult || null,
        beginMatchTime: this.filters.beginMatchTime ? `${this.filters.beginMatchTime} 00:00:00` : null,
        endMatchTime: this.filters.endMatchTime ? `${this.filters.endMatchTime} 23:59:59` : null,
      };
      getMatchList(query)
        .then((res) => {
          if (res?.code === 200) {
            this.total = Number(res.total || 0);
            // 小程序模板不支持在 :class/:style 中调用方法，卡片展示字段在入列前统一预计算
            const rows = (res.rows || []).map((item, index) => ({
              ...item,
              _statusClass: this.matchStatusClass(item.matchStatus),
              _resultClass: this.matchResultTagClass(item.matchResult),
              _animationDelay: cardAnimationDelay(index),
            }));
            this.$refs.paging.completeByTotal(rows, this.total);
            this.listReady = true;
          } else {
            this.$refs.paging.complete(false);
          }
        })
        .catch(() => {
          // request.js 已统一提示业务错误
          this.$refs.paging.complete(false);
        });
    },
    reloadList() {
      this.$refs.paging && this.$refs.paging.reload();
    },
    selectMatchResult(value) {
      this.filters.matchResult = value;
      this.reloadList();
    },
    onBeginDateChange(event) {
      this.filters.beginMatchTime = event.detail.value || '';
      this.validateDateRange(true) && this.reloadList();
    },
    onEndDateChange(event) {
      this.filters.endMatchTime = event.detail.value || '';
      this.validateDateRange(true) && this.reloadList();
    },
    // 日期只用于界面输入，查询时补齐当天起止时间，避免漏掉结束日记录
    validateDateRange(showToast) {
      if (this.filters.beginMatchTime && this.filters.endMatchTime
        && this.filters.beginMatchTime > this.filters.endMatchTime) {
        if (showToast) {
          uni.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' });
        }
        return false;
      }
      return true;
    },
    resetFilters() {
      this.filters = {
        keyword: '',
        matchResult: '',
        beginMatchTime: '',
        endMatchTime: '',
      };
      this.filterOpen = false;
      this.reloadList();
    },
    matchStatusLabel(value) {
      return String(value || '') === '1' ? '已关闭' : '正常';
    },
    matchStatusClass(value) {
      return String(value || '') === '1' ? 'is-closed' : 'is-normal';
    },
    matchResultTagClass(value) {
      if (value === '0') return 'is-home';
      if (value === '1') return 'is-draw';
      if (value === '2') return 'is-away';
      return 'is-pending';
    },
    oddsResultText(value) {
      const labels = oddsResultLabels(value);
      return labels.length ? labels.join('、') : '未登记';
    },
    handleActionClick(event, item) {
      if (event?.position && event.position !== 'right') return;
      if (event?.index === 0) {
        this.openResultPopup(item);
      }
    },
    normalizeId(value) {
      const id = Number(value);
      return Number.isInteger(id) && id > 0 ? id : null;
    },
    // 左滑录入只打开弹窗；先回填列表已有赛果，再异步读取当前有效倍率版本
    openResultPopup(item) {
      const matchId = this.normalizeId(item?.matchId);
      if (!matchId) return;
      this.entryItem = item;
      this.entryMatchResult = MATCH_RESULT_OPTIONS.some(
        (option) => option.value === String(item.matchResult || ''),
      ) ? String(item.matchResult) : '';
      const tokens = String(item.oddsResult || '')
        .split(/[,，;；、\s]+/)
        .map((token) => token.trim().toUpperCase())
        .filter(Boolean);
      this.entryOddsList = ODDS_RESULT_OPTIONS
        .map((option) => option.value)
        .filter((value) => tokens.includes(value));
      this.entryActiveOdds = null;
      this.entryOddsLoading = true;
      this.$refs.resultPopup && this.$refs.resultPopup.open('dialog');

      getActiveOdds(matchId)
        .then((res) => {
          // 用户可能已关闭并打开另一场比赛，过期响应不能污染当前弹窗
          if (String(this.entryItem.matchId) !== String(matchId)) return;
          if (res?.code === 200) {
            this.entryActiveOdds = res.data || null;
          }
        })
        .catch(() => {
          // request.js 已统一提示网络或业务异常；无有效版本由接口返回 null，不进入此分支
        })
        .finally(() => {
          if (String(this.entryItem.matchId) === String(matchId)) {
            this.entryOddsLoading = false;
          }
        });
    },
    closeResultPopup() {
      if (this.entrySaving) return;
      this.$refs.resultPopup && this.$refs.resultPopup.close();
    },
    selectEntryMatchResult(value) {
      this.entryMatchResult = this.entryMatchResult === value ? '' : value;
    },
    toggleEntryOddsResult(value) {
      if (this.entryOddsList.includes(value)) {
        this.entryOddsList = this.entryOddsList.filter((item) => item !== value);
      } else {
        this.entryOddsList = [...this.entryOddsList, value];
      }
    },
    buildEntryOddsResult() {
      const values = ODDS_RESULT_OPTIONS
        .map((option) => option.value)
        .filter((value) => this.entryOddsList.includes(value));
      return values.length ? values.join(',') : null;
    },
    formatHandicap(value) {
      if (value === null || value === undefined || value === '') return '未设置';
      const number = Number(value);
      if (!Number.isFinite(number)) return String(value);
      const text = formatNumber(number, 2);
      return number > 0 ? `+${text}` : text;
    },
    // 保存后沿用服务端赛果失效规则；刷新列表以同步关联组合核验状态
    saveEntryResult() {
      if (this.entrySaving || this.entryOddsLoading) return;
      const matchId = this.normalizeId(this.entryItem.matchId);
      if (!matchId) {
        uni.showToast({ title: '比赛主键缺失，请关闭后重试', icon: 'none' });
        return;
      }
      const oddsResult = this.buildEntryOddsResult();
      if (!this.entryMatchResult && !oddsResult) {
        uni.showToast({ title: '请至少录入一项赛果', icon: 'none' });
        return;
      }
      this.entrySaving = true;
      updateMatchResult({
        matchId,
        matchResult: this.entryMatchResult || null,
        oddsResult,
      })
        .then((res) => {
          if (res?.code === 200) {
            this.$refs.resultPopup && this.$refs.resultPopup.close();
            uni.showToast({ title: '赛果已保存', icon: 'none' });
            setTimeout(() => this.reloadList(), 260);
          } else {
            uni.showToast({ title: res?.msg || '赛果保存失败，请稍后重试', icon: 'none' });
          }
        })
        .catch(() => {
          // request.js 已统一提示服务端语义错误
        })
        .finally(() => {
          this.entrySaving = false;
        });
    },
    openDetailPage(item) {
      if (!item?.matchId) return;
      uni.navigateTo({
        url: `/pages/dortmund/match/detail/detail?matchId=${item.matchId}`,
      });
    },
  },
};
</script>

<style lang="less">
@import url('./index.less');
</style>
