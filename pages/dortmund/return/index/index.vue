<template>
  <view class="fx67ll-return-box">
    <z-paging-mini ref="paging" :paging-style="pagingStyle" back-to-top-bottom="40rpx" :auto-show-back-to-top="true"
      :refresher-threshold="58" :refresher-complete-delay="360" :refresher-complete-duration="520"
      refresher-background="#f2faf5" @scrollTopChange="handleScrollTopChange" v-model="returnList"
      @query="queryReturnList">
      <template v-slot:refresher="{ refresherStatus }">
        <refreshIndicator :status="refresherStatus" />
      </template>
      <!-- 顶部固定区：与列表滚动解耦，搜索和状态筛选始终可操作 -->
      <template v-slot:top>
        <view class="return-top">
          <view class="return-hero">
            <view class="return-hero-glow return-hero-glow-one" />
            <view class="return-hero-glow return-hero-glow-two" />
            <view class="return-hero-content">
              <text class="return-hero-kicker">FODCS FREEDOM</text>
              <view class="return-hero-title">
                <text class="return-hero-emoji">🎯</text>
                <text>回报组合记录</text>
              </view>
              <text class="return-hero-desc">核验赛果、补传凭证，随时掌握组合状态</text>
            </view>
            <view class="return-hero-mark">
              <uni-icons type="wallet" color="#ffffff" size="34" />
            </view>
            <view class="return-hero-total">
              <text class="return-hero-total-value">{{ total }}</text>
              <text class="return-hero-total-label">条记录</text>
            </view>
          </view>

          <view class="return-filter-card">
            <view class="return-search-row">
              <view class="return-search-input">
                <uni-easyinput v-model="filters.keyword" prefixIcon="search" placeholder="搜索组合标题" :inputBorder="false"
                  confirmType="search" @confirm="reloadList" @clear="reloadList" />
              </view>
              <button class="return-filter-toggle" :class="{ 'is-active': filterOpen }"
                @click="filterOpen = !filterOpen">
                <uni-icons type="settings" size="16" :color="filterOpen ? '#ffffff' : '#2ecc71'" />
                <text>筛选</text>
              </button>
            </view>

            <scroll-view scroll-x class="return-chip-scroll" :show-scrollbar="false">
              <view class="return-chip-row">
                <view v-for="option in verificationOptions" :key="option.text" class="return-chip"
                  :class="['return-chip', filters.verificationStatus === option.value ? 'is-active' : '', option.className]"
                  @click="selectVerification(option.value)">
                  <text>{{ option.text }}</text>
                </view>
              </view>
            </scroll-view>

            <view v-if="filterOpen" class="return-advanced">
              <view class="return-advanced-title">采用状态</view>
              <view class="return-adoption-row">
                <view v-for="option in adoptionOptions" :key="option.value" class="return-adoption-chip"
                  :class="{ 'is-active': filters.adoptedFlag === option.value }" @click="selectAdoption(option.value)">
                  <text>{{ option.text }}</text>
                </view>
              </view>
              <view class="return-advanced-footer">
                <text class="return-advanced-tip">默认展示已采用且未核验的组合；核验和图片操作仅对已采用记录开放。</text>
                <button class="return-reset-btn" @click="resetFilters">重置</button>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 卡片列表：仅右下角“查看”进入详情，避免整卡点击误触；左滑保留核验和图片操作 -->
      <uni-swipe-action>
        <view v-for="item in returnList" :key="item.combinationId" class="return-card-wrap"
          :style="{ animationDelay: item._animationDelay }">
          <uni-swipe-action-item :right-options="item._actionOptions" @click="(e) => handleActionClick(e, item)">
            <view class="return-card">
              <view class="return-card-head">
                <view class="return-card-title-wrap">
                  <text class="return-card-kicker">{{ item.combinationCode || 'AI 回报组合' }}</text>
                  <text class="return-card-title">{{ item.combinationTitle || '未命名回报组合' }}</text>
                </view>
                <view class="return-card-tags">
                  <text class="return-tag return-tag-adopt" :class="{ 'is-adopted': item.adoptedFlag === 'Y' }">
                    {{ adoptionLabel(item.adoptedFlag) }}
                  </text>
                  <text class="return-tag" :class="item._verificationClass">
                    {{ verificationLabel(item.verificationStatus) }}
                  </text>
                </view>
              </view>

              <view class="return-card-meta">
                <view class="return-meta-pill"><text>⚽ {{ item.matchCount || 0 }} 场</text></view>
                <view class="return-meta-pill"><text>🧮 {{ formatNumber(item.combinedOdds, 4) }}</text></view>
                <view v-if="item.aiConfidence !== null && item.aiConfidence !== undefined" class="return-meta-pill">
                  <text>✨ 置信 {{ item.aiConfidence }}%</text>
                </view>
              </view>

              <view class="return-stat-grid">
                <view class="return-stat-item">
                  <text class="return-stat-label">预计回报</text>
                  <text class="return-stat-value">{{ formatNumber(item.estimatedReturn) }}</text>
                </view>
                <view class="return-stat-item">
                  <text class="return-stat-label">偏差金额</text>
                  <text class="return-stat-value" :class="item._deviationClass">
                    {{ formatSignedNumber(item.deviationAmount) }}
                  </text>
                </view>
                <view class="return-stat-item">
                  <text class="return-stat-label">核验时间</text>
                  <text class="return-stat-value return-stat-time">{{ formatCompactTime(item.verifyTime) }}</text>
                </view>
              </view>

              <view v-if="item.riskNotes" class="return-risk-note">
                <text class="return-risk-icon">🛡️</text>
                <text class="return-risk-text">{{ item.riskNotes }}</text>
              </view>

              <view class="return-card-footer">
                <text class="return-card-time">🕒 {{ normalizeDateTime(item.createTime) }}</text>
                <view class="return-card-view" @click.stop="openDetailPage(item)">
                  <text>查看</text>
                  <uni-icons type="right" size="12" color="#2ecc71" />
                </view>
              </view>
            </view>
          </uni-swipe-action-item>
        </view>
      </uni-swipe-action>

      <view slot="empty" class="return-empty">
        <view class="return-empty-icon">🧺</view>
        <text class="return-empty-title">暂无回报组合记录</text>
        <text class="return-empty-desc">可以尝试清空筛选条件，或重新下拉刷新。</text>
      </view>
    </z-paging-mini>

  </view>
</template>

<script>
import { getReturnCombinationList, verifyReturnCombination } from '@/api/fx67ll/dortmund/return';
import {
  adoptionLabel,
  cardAnimationDelay,
  formatLocalDateTime,
  formatNumber,
  formatSignedNumber,
  normalizeDateTime,
  verificationClass,
  verificationLabel,
} from '@/pages/dortmund/common/format';
import RefreshIndicator from '@/pages/dortmund/component/refreshIndicator/refreshIndicator.vue';

export default {
  components: { RefreshIndicator },
  data() {
    return {
      returnList: [],
      total: 0,
      listReady: false,
      currentScrollTop: 0,
      pendingRestoreTop: null,
      filterOpen: false,
      filters: {
        keyword: '',
        verificationStatus: 'U',
        adoptedFlag: 'Y',
      },
      verificationOptions: [
        { text: '全部状态', value: 'ALL', className: 'is-neutral' },
        { text: '未核验', value: 'U', className: 'is-pending' },
        { text: '已达成', value: 'Y', className: 'is-success' },
        { text: '未达成', value: 'N', className: 'is-failed' },
      ],
      adoptionOptions: [
        { text: '已采用', value: 'Y' },
        { text: '未采用', value: 'N' },
        { text: '全部采用状态', value: 'ALL' },
      ],
      // 详情仅由卡片右下角“查看”进入；未采用组合没有核验或上传动作
      baseActionOptions: [],
      adoptedActionOptions: [
        { text: '核验', style: { backgroundColor: '#2ecc71' } },
        { text: '上传', style: { backgroundColor: '#e6a23c' } },
      ],
      verifyingId: null,
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
  },
  onShow() {
    // 从详情或上传页返回时保留当前阅读位置，刷新数据和滚动位置都由 z-paging 接管。
    if (this.listReady) {
      this.refreshKeepingPosition();
    }
  },
  methods: {
    adoptionLabel,
    verificationLabel,
    verificationClass,
    formatNumber,
    formatSignedNumber,
    normalizeDateTime,
    cardAnimationDelay,
    // 查询列表；分页结果交给 z-paging 计算是否还能继续上拉
    queryReturnList(pageNum, pageSize) {
      const query = {
        pageNum,
        pageSize,
        keyword: this.filters.keyword.trim(),
      };
      // ALL 是仅前端使用的哨兵；不能把空串或 null 序列化成字面过滤值。
      if (this.filters.adoptedFlag !== 'ALL') {
        query.adoptedFlag = this.filters.adoptedFlag;
      }
      if (this.filters.verificationStatus !== 'ALL') {
        query.verificationStatus = this.filters.verificationStatus;
      }
      getReturnCombinationList(query)
        .then((res) => {
          if (res?.code === 200) {
            this.total = Number(res.total || 0);
            // 小程序模板不支持在 :class/:style 中调用方法，列表展示字段在入列前统一预计算
            const rows = (res.rows || []).map((item, index) => ({
              ...item,
              _verificationClass: verificationClass(item.verificationStatus),
              _deviationClass: this.deviationClass(item.deviationAmount),
              _animationDelay: cardAnimationDelay(index),
              _actionOptions: item.adoptedFlag === 'Y' ? this.adoptedActionOptions : this.baseActionOptions,
            }));
            this.$refs.paging.completeByTotal(rows, this.total);
            this.listReady = true;
            this.restoreScrollAfterQuery();
          } else {
            this.pendingRestoreTop = null;
            this.$refs.paging.complete(false);
          }
        })
        .catch(() => {
          this.pendingRestoreTop = null;
          this.$refs.paging.complete(false);
        });
    },
    handleScrollTopChange(value) {
      this.currentScrollTop = Number(value) || 0;
    },
    // 操作后刷新当前已加载区间，不重置页码；查询结束后再把滚动位置还原。
    refreshKeepingPosition() {
      if (!this.$refs.paging) return;
      this.pendingRestoreTop = this.currentScrollTop;
      this.$refs.paging.refresh();
    },
    restoreScrollAfterQuery() {
      if (this.pendingRestoreTop === null) return;
      const targetTop = this.pendingRestoreTop;
      this.pendingRestoreTop = null;
      this.$nextTick(() => {
        setTimeout(() => {
          if (!this.$refs.paging) return;
          this.$refs.paging.scrollToY(targetTop, 0, false);
          this.currentScrollTop = targetTop;
        }, 60);
      });
    },
    reloadList() {
      this.pendingRestoreTop = null;
      this.$refs.paging && this.$refs.paging.reload();
    },
    selectVerification(value) {
      this.filters.verificationStatus = value;
      this.reloadList();
    },
    selectAdoption(value) {
      this.filters.adoptedFlag = value;
      this.reloadList();
    },
    resetFilters() {
      this.filters = {
        keyword: '',
        verificationStatus: 'U',
        adoptedFlag: 'Y',
      };
      this.filterOpen = false;
      this.reloadList();
    },
    formatCompactTime(value) {
      if (!value) return '未核验';
      return String(value).replace('T', ' ').slice(5, 16);
    },
    deviationClass(value) {
      const number = Number(value || 0);
      if (number > 0) return 'is-positive';
      if (number < 0) return 'is-negative';
      return 'is-zero';
    },
    handleActionClick(event, item) {
      if (event?.position && event.position !== 'right') return;
      if (event?.index === 0) {
        this.confirmVerify(item);
      } else if (event?.index === 1) {
        this.openUploadPage(item);
      }
    },
    openDetailPage(item) {
      if (!item?.combinationId) return;
      uni.navigateTo({
        url: `/pages/dortmund/return/detail/detail?combinationId=${item.combinationId}`,
      });
    },
    openUploadPage(item) {
      if (!item?.combinationId) return;
      if (item.adoptedFlag !== 'Y') {
        uni.showToast({ title: '仅已采用的回报组合可以上传图片', icon: 'none' });
        return;
      }
      uni.navigateTo({
        url: `/pages/dortmund/return/upload/upload?combinationId=${item.combinationId}`,
      });
    },
    confirmVerify(item) {
      if (!item || item.adoptedFlag !== 'Y') {
        uni.showToast({ title: '仅已采用的回报组合可以执行核验', icon: 'none' });
        return;
      }
      const content = item.verificationStatus
        ? '该记录已经核验，是否重新核验？'
        : '将按组合内每场比赛已登记的倍率赛果执行核验。';
      uni.showModal({
        title: '赛果核验',
        content,
        confirmColor: '#2ecc71',
        success: (result) => {
          if (result.confirm) {
            this.doVerify(item.combinationId);
          }
        },
      });
    },
    doVerify(combinationId) {
      if (!combinationId || this.verifyingId) return;
      this.verifyingId = combinationId;
      verifyReturnCombination(combinationId)
        .then((res) => {
          if (res?.code === 200) {
            const status = res.data?.verificationStatus || null;
            this.updateVerificationStatus(combinationId, status);
            uni.showToast({ title: `核验完成：${verificationLabel(status)}`, icon: 'none' });
            this.refreshKeepingPosition();
          }
        })
        .catch(() => {
          // request.js 已统一提示服务端语义错误
        })
        .finally(() => {
          this.verifyingId = null;
        });
    },
    updateVerificationStatus(combinationId, status) {
      const target = this.returnList.find((item) => String(item.combinationId) === String(combinationId));
      if (target) {
        target.verificationStatus = status;
        target.verifyTime = formatLocalDateTime();
        target._verificationClass = verificationClass(status);
      }
    },
  },
};
</script>

<style lang="less">
@import url('./index.less');
</style>
