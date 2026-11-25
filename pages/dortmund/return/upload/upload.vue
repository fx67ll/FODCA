<template>
  <view class="fx67ll-return-upload-page">
    <view class="upload-hero">
      <view class="upload-hero-glow" />
      <view class="upload-hero-copy">
        <text class="upload-hero-kicker">RETURN COMBINATION</text>
        <text class="upload-hero-title">上传组合图片</text>
        <text class="upload-hero-desc">{{ detail.combinationTitle || '回报组合凭证' }}</text>
      </view>
      <view class="upload-hero-count">
        <text class="upload-hero-count-value">{{ images.length }}</text>
        <text class="upload-hero-count-label">/ {{ maxImages }} 张</text>
      </view>
    </view>

    <view v-if="loading" class="upload-loading">
      <view class="upload-loading-ring" />
      <text>正在加载组合图片…</text>
    </view>

    <template v-else>
      <view class="upload-card">
        <view class="upload-card-head">
          <view>
            <text class="upload-card-title">凭证图片</text>
            <text class="upload-card-desc">支持 JPG、PNG，单次最多上传 {{ remainingSlots }} 张</text>
          </view>
          <text class="upload-card-count">{{ images.length }}/{{ maxImages }}</text>
        </view>

        <view v-if="imageViews.length || canUpload" class="upload-image-grid">
          <view v-for="image in imageViews" :key="image.imageId" class="upload-image-item" @click="previewImage(image)">
            <image class="upload-image-thumb" :src="image.url" mode="aspectFill" />
            <text class="upload-image-name">{{ image.originalName || '组合图片' }}</text>
          </view>
          <view v-if="canUpload" class="upload-image-slot" @click="chooseImages">
            <view class="upload-slot-mark">
              <uni-icons :type="uploading ? 'spinner-cycle' : 'plusempty'" size="28" color="#2ecc71" />
            </view>
            <text>{{ uploading ? '上传中…' : '添加图片' }}</text>
          </view>
        </view>

        <view v-else-if="!images.length" class="upload-empty">
          <text class="upload-empty-icon">🖼️</text>
          <text class="upload-empty-title">还没有组合图片</text>
          <text class="upload-empty-desc">上传赛果截图或核对凭证，后续可在详情页直接查看。</text>
        </view>

        <button v-if="canUpload" class="upload-primary-btn" :disabled="uploading" @click="chooseImages">
          <uni-icons :type="uploading ? 'spinner-cycle' : 'camera'" size="19" color="#ffffff" />
          <text>{{ uploading ? '正在上传，请稍候…' : '选择图片并上传' }}</text>
        </button>
        <view v-else-if="images.length >= maxImages" class="upload-lock">
          <uni-icons type="checkmarkempty" size="17" color="#7d9184" />
          <text>已达到三张上限，请先返回详情页核对已上传图片。</text>
        </view>
        <view v-else-if="detail.planLinked" class="upload-lock">
          <uni-icons type="info" size="17" color="#7d9184" />
          <text>组合已被方案计划引用，图片区当前只读。</text>
        </view>
        <view v-else-if="detail.adoptedFlag !== 'Y'" class="upload-lock">
          <uni-icons type="info" size="17" color="#7d9184" />
          <text>仅已采用的回报组合可以上传图片。</text>
        </view>
      </view>

      <view class="upload-tips">
        <text class="upload-tips-title">上传说明</text>
        <text class="upload-tips-item">• 图片会直接绑定当前回报组合，不上传本地临时路径。</text>
        <text class="upload-tips-item">• 单张上传失败不会阻断其余图片，可稍后重试。</text>
        <text class="upload-tips-item">• 上传完成后返回详情页即可核对图片顺序。</text>
      </view>
    </template>

    <view class="upload-footer">
      <button class="upload-back-btn" @click="goBack">返回详情</button>
    </view>
  </view>
</template>

<script>
import config from '@/config';
import { getToken } from '@/utils/auth';
import { getReturnCombinationInfo, RETURN_IMAGE_UPLOAD_URL } from '@/api/fx67ll/dortmund/return';

export default {
  name: 'ReturnImageUploadPage',
  data() {
    return {
      combinationId: null,
      detail: {},
      loading: false,
      uploading: false,
      // 与后端 DortmundModuleConfig.Return.MAX_RETURN_IMAGES 保持一致
      maxImages: 3,
    };
  },
  computed: {
    images() {
      return Array.isArray(this.detail.images)
        ? this.detail.images.filter((image) => image && image.imageId)
        : [];
    },
    imageViews() {
      return this.images.map((image) => ({
        ...image,
        url: this.resolveImageUrl(image.objectKey),
      }));
    },
    remainingSlots() {
      return Math.max(this.maxImages - this.images.length, 0);
    },
    canUpload() {
      return Boolean(this.detail.combinationId
        && this.detail.adoptedFlag === 'Y'
        && !this.detail.planLinked
        && this.remainingSlots > 0);
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
    if (this.combinationId) {
      this.refreshDetail(!this.detail.combinationId);
    }
  },
  onPullDownRefresh() {
    this.refreshDetail(false).finally(() => uni.stopPullDownRefresh());
  },
  methods: {
    normalizeId(value) {
      const id = Number(value);
      return Number.isInteger(id) && id > 0 ? id : null;
    },
    refreshDetail(showLoading = false) {
      if (!this.combinationId) return Promise.resolve();
      if (showLoading) {
        this.loading = true;
      }
      return getReturnCombinationInfo(this.combinationId)
        .then((res) => {
          if (res?.code === 200) {
            this.detail = { ...(this.detail || {}), ...(res.data || {}) };
          }
        })
        .catch(() => {
          // request.js 已统一提示业务错误，保留当前页面数据避免内容闪空。
        })
        .finally(() => {
          this.loading = false;
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
      const urls = this.imageViews.map((item) => item.url).filter(Boolean);
      if (!urls.length) return;
      uni.previewImage({ current: image.url, urls });
    },
    chooseImages() {
      if (!this.canUpload || this.uploading) return;
      uni.chooseImage({
        count: this.remainingSlots,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const paths = res.tempFilePaths || [];
          if (paths.length) {
            this.uploadSequentially(paths);
          }
        },
      });
    },
    async uploadSequentially(paths) {
      this.uploading = true;
      let successCount = 0;
      for (const filePath of paths) {
        try {
          await this.uploadOne(filePath);
          successCount += 1;
        } catch (error) {
          // 单张失败不阻断后续图片，具体原因已在 uploadOne 中提示。
        }
      }
      this.uploading = false;
      if (successCount > 0) {
        uni.showToast({ title: `已上传 ${successCount} 张图片`, icon: 'none' });
        await this.refreshDetail(false);
      }
    },
    uploadOne(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: config.baseUrl + RETURN_IMAGE_UPLOAD_URL + this.combinationId,
          filePath,
          name: 'file',
          header: { Authorization: 'Bearer ' + getToken() },
          success: (response) => {
            let payload = {};
            try {
              payload = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            } catch (error) {
              payload = {};
            }
            if (response.statusCode === 200 && payload.code === 200) {
              resolve(payload);
            } else {
              uni.showToast({ title: payload.msg || '图片上传失败，请稍后重试', icon: 'none' });
              reject(payload);
            }
          },
          fail: () => {
            uni.showToast({ title: '图片上传失败，请检查网络后重试', icon: 'none' });
            reject(new Error('upload failed'));
          },
        });
      });
    },
    goBack() {
      uni.navigateBack();
    },
  },
};
</script>

<style lang="less">
@import url('./upload.less');
</style>
