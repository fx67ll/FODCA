<template>
  <view class="fx67ll-return-detail-page">
    <view class="return-detail-body">
      <view v-if="loading" class="return-detail-loading">
        <view class="return-loading-ring" />
        <text>正在加载组合详情…</text>
      </view>

      <template v-else>
        <view class="return-detail-hero">
          <view class="return-detail-hero-glow" />
          <text class="return-detail-code">{{ detail.combinationCode || '回报组合' }}</text>
          <text class="return-detail-title">{{ detail.combinationTitle || '未命名回报组合' }}</text>
          <view class="return-detail-tags">
            <text class="return-detail-tag" :class="{ 'is-adopted': detail.adoptedFlag === 'Y' }">
              {{ adoptionLabel(detail.adoptedFlag) }}
            </text>
            <text class="return-detail-tag" :class="detailVerificationClass">
              {{ verificationLabel(detail.verificationStatus) }}
            </text>
            <text v-if="detail.aiConfidence !== null && detail.aiConfidence !== undefined"
              class="return-detail-tag is-confidence">✨ 置信 {{ detail.aiConfidence }}%</text>
          </view>
        </view>

        <view class="return-detail-section">
          <view class="return-detail-section-title">
            <text class="return-detail-section-icon">📊</text>
            <text>组合指标</text>
          </view>
          <view class="return-detail-grid">
            <view class="return-detail-metric">
              <text class="return-detail-metric-label">组合场次</text>
              <text class="return-detail-metric-value">{{ detail.matchCount || (detail.matches || []).length || 0 }}
                场</text>
            </view>
            <view class="return-detail-metric">
              <text class="return-detail-metric-label">组合倍率</text>
              <text class="return-detail-metric-value">{{ formatNumber(detail.combinedOdds, 4) }}</text>
            </view>
            <view class="return-detail-metric">
              <text class="return-detail-metric-label">预计回报</text>
              <text class="return-detail-metric-value">{{ formatNumber(detail.estimatedReturn) }}</text>
            </view>
            <view class="return-detail-metric">
              <text class="return-detail-metric-label">偏差金额</text>
              <text class="return-detail-metric-value" :class="detailDeviationClass">
                {{ formatSignedNumber(detail.deviationAmount) }}
              </text>
            </view>
            <view class="return-detail-metric">
              <text class="return-detail-metric-label">核验时间</text>
              <text class="return-detail-metric-value return-detail-metric-time">{{
                normalizeDateTime(detail.verifyTime) }}</text>
            </view>
            <view class="return-detail-metric">
              <text class="return-detail-metric-label">创建时间</text>
              <text class="return-detail-metric-value return-detail-metric-time">{{
                normalizeDateTime(detail.createTime) }}</text>
            </view>
          </view>
          <view v-if="detail.riskNotes" class="return-detail-risk">
            <text class="return-detail-risk-icon">🛡️</text>
            <text class="return-detail-risk-text">{{ detail.riskNotes }}</text>
          </view>
        </view>

        <view class="return-detail-section">
          <view class="return-detail-section-title">
            <text class="return-detail-section-icon">⚽</text>
            <text>组合内比赛</text>
            <text class="return-detail-count">{{ (detail.matches || []).length }}</text>
          </view>
          <view v-if="(detail.matches || []).length" class="return-match-list">
            <view v-for="(match, index) in detail.matches" :key="match.itemId || match.matchId || index"
              class="return-match-card">
              <view class="return-match-head">
                <text class="return-match-index">{{ index + 1 }}</text>
                <view class="return-match-title-wrap">
                  <text class="return-match-summary">
                    {{ match.matchSummary || `${match.homeTeamName || '主队'} vs ${match.awayTeamName || '客队'}` }}
                  </text>
                  <text class="return-match-time">🕒 {{ normalizeDateTime(match.matchTime) }}</text>
                </view>
                <text class="return-selection-pill">{{ selectionTypeLabel(match.selectionType) }}</text>
              </view>
              <view class="return-match-meta">
                <text class="return-match-meta-item">倍率 {{ match.oddsValueSnapshot || '-' }}</text>
                <text class="return-match-meta-item">常规赛果 {{ matchResultLabel(match.matchResult) }}</text>
                <text class="return-match-meta-item">倍率赛果 {{ oddsResultText(match.oddsResult) }}</text>
              </view>
              <view v-if="match.selectionReason" class="return-match-reason">
                <text class="return-match-reason-label">选择依据</text>
                <text class="return-match-reason-text">{{ match.selectionReason }}</text>
              </view>
            </view>
          </view>
          <view v-else class="return-detail-empty-line">组合内暂无比赛明细</view>
        </view>

        <view class="return-detail-section">
          <view class="return-detail-section-title">
            <text class="return-detail-section-icon">🖼️</text>
            <text>组合图片</text>
            <text class="return-detail-count">{{ images.length }}/{{ maxImages }}</text>
          </view>
          <view v-if="imageViews.length" class="return-image-grid">
            <view v-for="image in imageViews" :key="image.imageId" class="return-image-item"
              @click="previewImage(image)">
              <image class="return-image-thumb" :src="image.url" mode="aspectFill" />
              <text class="return-image-name">{{ image.originalName || '组合图片' }}</text>
            </view>
          </view>
          <view v-else class="return-image-empty">
            <text class="return-image-empty-icon">📷</text>
            <text class="return-image-empty-title">还没有组合图片</text>
            <text class="return-image-empty-desc">上传核对截图或凭证，便于后续追溯。</text>
          </view>
          <button v-if="canUpload" class="return-upload-btn" @click="openUploadPage">
            <uni-icons type="camera" size="17" color="#2ecc71" />
            <text>前往上传组合图片</text>
          </button>
          <text v-else-if="detail.planLinked" class="return-upload-lock">组合已被方案计划引用，图片区当前只读。</text>
          <text v-else-if="detail.adoptedFlag !== 'Y'" class="return-upload-lock">采用该组合后才可上传图片。</text>
        </view>

        <view class="return-detail-bottom-space" />
      </template>
    </view>

    <view class="return-detail-footer">
      <button class="return-footer-btn return-footer-close" @click="goBack">返回</button>
      <button v-if="detail.adoptedFlag === 'Y'" class="return-footer-btn return-footer-verify"
        :disabled="verifying || loading" @click="confirmVerify">
        <uni-icons type="checkmarkempty" size="17" color="#ffffff" />
        <text>{{ verifying ? '核验中…' : '核验赛果' }}</text>
      </button>
    </view>
  </view>
</template>

<script>
import config from '@/config';
import { getReturnCombinationInfo, verifyReturnCombination } from '@/api/fx67ll/dortmund/return';
import {
  adoptionLabel,
  formatLocalDateTime,
  formatNumber,
  formatSignedNumber,
  matchResultLabel,
  normalizeDateTime,
  oddsResultLabels,
  selectionTypeLabel,
  verificationClass,
  verificationLabel,
} from '@/pages/dortmund/common/format';

export default {
  name: 'ReturnDetailPage',
  data() {
    return {
      detail: {},
      combinationId: null,
      loading: false,
      verifying: false,
      // 与后端 DortmundModuleConfig.Return.MAX_RETURN_IMAGES 保持一致
      maxImages: 3,
    };
  },
  computed: {
    images() {
      return Array.isArray(this.detail.images) ? this.detail.images.filter((image) => image && image.imageId) : [];
    },
    // 小程序模板不支持在 :src 中调用方法，图片地址在计算属性中统一拼接
    imageViews() {
      return this.images.map((image) => ({
        ...image,
        url: this.resolveImageUrl(image.objectKey),
      }));
    },
    canUpload() {
      return Boolean(this.detail.combinationId && this.detail.adoptedFlag === 'Y' && !this.detail.planLinked
        && this.images.length < this.maxImages);
    },
    // 小程序模板不支持在 :class 中调用方法，详情状态与偏差样式统一预计算
    detailVerificationClass() {
      return this.verificationClass(this.detail.verificationStatus);
    },
    detailDeviationClass() {
      return this.deviationClass(this.detail.deviationAmount);
    },
  },
  onLoad(options) {
    const id = this.normalizeId(options?.combinationId);
    if (!id) {
      uni.showToast({ title: '回报组合主键缺失', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 500);
      return;
    }
    this.combinationId = id;
  },
  onShow() {
    // 从图片上传页返回时重新拉取详情，确保新图片立即出现在当前页面。
    if (this.combinationId) {
      this.refreshDetail(!this.detail.combinationId);
    }
  },
  onPullDownRefresh() {
    this.refreshDetail(false).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    adoptionLabel,
    verificationLabel,
    verificationClass,
    formatNumber,
    formatSignedNumber,
    matchResultLabel,
    selectionTypeLabel,
    normalizeDateTime,
    oddsResultText(value) {
      const labels = oddsResultLabels(value);
      return labels.length ? labels.join('、') : '未登记';
    },
    deviationClass(value) {
      const number = Number(value || 0);
      if (number > 0) return 'is-positive';
      if (number < 0) return 'is-negative';
      return 'is-zero';
    },
    normalizeId(value) {
      const id = Number(value);
      return Number.isInteger(id) && id > 0 ? id : null;
    },
    refreshDetail(showLoading = false) {
      const id = this.normalizeId(this.combinationId || this.detail.combinationId);
      if (!id) {
        return Promise.resolve();
      }
      if (showLoading) {
        this.loading = true;
      }
      return getReturnCombinationInfo(id)
        .then((res) => {
          if (res?.code === 200) {
            this.detail = { ...(this.detail || {}), ...(res.data || {}) };
          }
        })
        .catch(() => {
          // request.js 已提示错误；保留当前页面已加载内容，避免详情区闪空
        })
        .finally(() => {
          this.loading = false;
        });
    },
    goBack() {
      uni.navigateBack();
    },
    openUploadPage() {
      if (!this.canUpload) return;
      uni.navigateTo({
        url: `/pages/dortmund/return/upload/upload?combinationId=${this.combinationId}`,
      });
    },
    resolveImageUrl(objectKey) {
      if (!objectKey) return '';
      if (/^(https?:)?\/\//i.test(objectKey) || String(objectKey).startsWith('data:')) {
        return objectKey;
      }
      return config.baseUrl + objectKey;
    },
    previewImage(image) {
      const urls = this.images.map((item) => this.resolveImageUrl(item.objectKey)).filter(Boolean);
      if (!urls.length) return;
      uni.previewImage({ current: this.resolveImageUrl(image.objectKey), urls });
    },
    confirmVerify() {
      if (!this.detail.combinationId || this.verifying) return;
      const content = this.detail.verificationStatus
        ? '该记录已经核验，是否重新核验？'
        : '将按组合内每场比赛已登记的倍率赛果执行核验。';
      uni.showModal({
        title: '赛果核验',
        content,
        confirmColor: '#2ecc71',
        success: (result) => {
          if (result.confirm) {
            this.doVerify();
          }
        },
      });
    },
    doVerify() {
      this.verifying = true;
      verifyReturnCombination(this.detail.combinationId)
        .then((res) => {
          if (res?.code === 200) {
            const status = res.data?.verificationStatus || null;
            this.detail.verificationStatus = status;
            this.detail.verifyTime = res.data?.verifyTime || formatLocalDateTime();
            uni.showToast({ title: `核验完成：${verificationLabel(status)}`, icon: 'none' });
          }
        })
        .catch(() => {
          // request.js 已统一提示服务端语义错误
        })
        .finally(() => {
          this.verifying = false;
        });
    },
  },
};
</script>

<style lang="less">
@import url('./detail.less');
</style>
