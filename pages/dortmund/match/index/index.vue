<template>
  <view class="fx67ll-match-box">
    <z-paging-mini ref="paging" back-to-top-bottom="40rpx" :auto-show-back-to-top="true" v-model="matchList"
      @query="queryMatchList">
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
                <view v-for="option in resultOptions" :key="option.value || 'all'" class="match-chip"
                  :class="{ 'is-active': filters.matchResult === option.value, [option.className]: true }"
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

      <!-- 比赛卡片：点击进入详情，左滑快速进入赛果录入 -->
      <uni-swipe-action>
        <view v-for="item in matchList" :key="item.matchId" class="match-card-wrap"
          :style="{ animationDelay: item._animationDelay }">
          <uni-swipe-action-item :right-options="actionOptions" @click="(e) => handleActionClick(e, item)">
            <view class="match-card" @click="openDetailPage(item)">
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

  </view>
</template>

<script>
import { getMatchList } from '@/api/fx67ll/dortmund/match';
import {
  cardAnimationDelay,
  matchResultLabel,
  normalizeDateTime,
  oddsResultLabels,
} from '@/pages/dortmund/common/format';

export default {
  data() {
    return {
      matchList: [],
      total: 0,
      listReady: false,
      filterOpen: false,
      filters: {
        keyword: '',
        matchResult: '',
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
      // 静态左滑操作配置：详情由卡片点击进入，左滑只保留高频赛果录入
      actionOptions: [
        { text: '录赛果', style: { backgroundColor: '#2ecc71' } },
      ],
    };
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
        this.openDetailPage(item, true);
      }
    },
    openDetailPage(item, focusResult = false) {
      if (!item?.matchId) return;
      uni.navigateTo({
        url: `/pages/dortmund/match/detail/detail?matchId=${item.matchId}${focusResult ? '&focus=result' : ''}`,
      });
    },
  },
};
</script>

<style lang="less">
@import url('./index.less');
</style>
