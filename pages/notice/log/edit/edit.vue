<template>
  <view class="fx67ll-notice-edit-box">
    <!-- 基础信息卡片 -->
    <view class="form-card form-card-base">
      <view class="form-item">
        <text class="form-label">公告标题<text class="required">*</text></text>
        <uni-easyinput v-model="formParams.noticeTitle" placeholder="请输入公告标题" clearable :inputBorder="false" />
      </view>
      <view class="form-divider"></view>
      <view class="form-item">
        <text class="form-label">公告类型<text class="required">*</text></text>
        <uni-data-checkbox v-model="formParams.noticeType" :localdata="typeOptions" />
      </view>
      <view class="form-divider"></view>
      <view class="form-item">
        <text class="form-label">公告状态<text class="required">*</text></text>
        <uni-data-checkbox v-model="formParams.status" :localdata="statusOptions" />
      </view>
    </view>

    <!-- 公告内容卡片：撑满剩余空间 -->
    <view class="form-card form-card-content">
      <view class="form-item form-item-column">
        <text class="form-label">公告内容<text class="required">*</text></text>
        <view class="editor-wrapper">
          <editor id="notice-editor" class="editor-class" placeholder="请输入公告内容，支持富文本" @ready="onEditorReady"
            @input="onEditorInput"></editor>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="edit-btn">
      <button class="btn-submit" type="default" :loading="isNetworkLoading" @click="handleSubmit">
        {{ isEdit ? '提交修改' : '提交新增' }}
      </button>
      <button class="btn-cancel" type="default" @click="handleBack">返回</button>
    </view>
  </view>
</template>

<script>
import { getNoticeLogForApp, addNoticeLogForApp, editNoticeLogForApp } from '@/api/fx67ll/notice/log';
import { getToken } from '@/utils/auth';

export default {
  data() {
    return {
      noticeId: '',
      isEdit: false,
      isNetworkLoading: false,
      isEditorReady: false,
      editorContext: null,
      formParams: {
        noticeId: undefined,
        noticeTitle: '',
        noticeType: '1',
        status: '0',
        noticeContent: '',
      },
      typeOptions: [
        { text: '通知', value: '1' },
        { text: '公告', value: '2' },
      ],
      statusOptions: [
        { text: '正常', value: '0' },
        { text: '停用', value: '1' },
      ],
    };
  },
  onLoad(options) {
    // 权限校验：仅 fx67ll 可进入
    const userName = this.$store.state.user.name;
    if (!getToken() || !userName || userName !== 'fx67ll') {
      uni.showToast({ title: '无权限访问', icon: 'none', duration: 1998 });
      setTimeout(() => this.$tab.navigateBack(), 1500);
      return;
    }
    this.noticeId = options?.noticeId || '';
    this.isEdit = !!this.noticeId;
    if (this.isEdit) {
      this.loadDetail();
    }
  },
  methods: {
    // 加载公告详情回填
    loadDetail() {
      const self = this;
      uni.showLoading({ title: '加载中...' });
      getNoticeLogForApp(this.noticeId)
        .then((res) => {
          uni.hideLoading();
          if (res?.code === 200 && res?.data) {
            self.formParams = {
              noticeId: res.data.noticeId,
              noticeTitle: res.data.noticeTitle || '',
              noticeType: res.data.noticeType || '1',
              status: res.data.status || '0',
              noticeContent: res.data.noticeContent || '',
            };
            // 编辑器就绪后回填内容
            self.setEditorContentWhenReady();
          } else {
            uni.showToast({ title: '获取详情失败', icon: 'none', duration: 1998 });
          }
        })
        .catch(() => {
          uni.hideLoading();
          uni.showToast({ title: '获取详情失败', icon: 'none', duration: 1998 });
        });
    },
    // 编辑器初始化完成后获取上下文
    onEditorReady() {
      const self = this;
      self.isEditorReady = false;
      function tryGetContext(retryCount = 0) {
        if (retryCount > 10) {
          console.error('编辑器上下文获取失败，超过最大重试次数！');
          uni.showToast({ title: '编辑器初始化失败，请联系管理员！', icon: 'none', duration: 1998 });
          return;
        }
        uni.createSelectorQuery()
          .in(self)
          .select('#notice-editor')
          .context((contextRes) => {
            if (contextRes && contextRes.context) {
              self.editorContext = contextRes.context;
              self.isEditorReady = true;
              // 编辑模式回填内容
              if (self.isEdit && self.formParams.noticeContent) {
                self.setEditorContentWhenReady();
              }
            } else {
              setTimeout(() => tryGetContext(retryCount + 1), 233);
            }
          })
          .exec();
      }
      tryGetContext();
    },
    // 编辑器内容就绪后回填
    setEditorContentWhenReady() {
      const self = this;
      function setWhenReady() {
        if (self.isEditorReady && self.editorContext && self.formParams.noticeContent) {
          self.editorContext.setContents({ html: self.formParams.noticeContent });
        } else if (self.formParams.noticeContent) {
          setTimeout(setWhenReady, 233);
        }
      }
      setWhenReady();
    },
    // 编辑器内容变化
    onEditorInput(e) {
      this.formParams.noticeContent = e?.detail?.html || '';
    },
    // 提交
    handleSubmit() {
      const self = this;
      if (!this.formParams.noticeTitle || !this.formParams.noticeTitle.trim()) {
        uni.showToast({ title: '公告标题不能为空！', icon: 'none', duration: 1998 });
        return;
      }
      if (!this.formParams.noticeContent || !this.formParams.noticeContent.trim()) {
        uni.showToast({ title: '公告内容不能为空！', icon: 'none', duration: 1998 });
        return;
      }
      const action = this.isEdit ? '修改' : '新增';
      uni.showModal({
        title: '提示',
        content: `确认${action}该公告吗？`,
        cancelText: '取消',
        confirmText: '确定',
        success: (modalRes) => {
          if (modalRes.confirm) {
            self.doSubmit();
          }
        },
      });
    },
    // 执行提交
    doSubmit() {
      const self = this;
      this.isNetworkLoading = true;
      const requestFn = this.isEdit ? editNoticeLogForApp : addNoticeLogForApp;
      requestFn(this.formParams)
        .then((res) => {
          self.isNetworkLoading = false;
          if (res?.code === 200) {
            uni.showToast({ title: self.isEdit ? '修改成功！' : '新增成功！', icon: 'none', duration: 1998 });
            setTimeout(() => self.$tab.navigateBack(), 1500);
          } else {
            uni.showToast({ title: '提交失败，请联系管理员！', icon: 'none', duration: 1998 });
          }
        })
        .catch(() => {
          self.isNetworkLoading = false;
          uni.showToast({ title: '提交失败，请联系管理员！', icon: 'none', duration: 1998 });
        });
    },
    // 返回
    handleBack() {
      this.$tab.navigateBack();
    },
  },
};
</script>

<style lang="less">
.fx67ll-notice-edit-box {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 140rpx;
  box-sizing: border-box;
}

// 表单卡片
.form-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 8rpx 32rpx;
  margin: 20rpx 24rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  min-height: 80rpx;

  .form-label {
    flex-shrink: 0;
    width: 160rpx;
    font-size: 28rpx;
    color: #303133;

    .required {
      color: #ff4d4f;
      margin-left: 4rpx;
    }
  }
}

// 纵向表单项（内容编辑器）
.form-item-column {
  flex-direction: column;
  align-items: stretch;

  .form-label {
    width: auto;
    margin-bottom: 20rpx;
    flex-shrink: 0;
  }
}

.form-divider {
  height: 1rpx;
  background-color: #f0f2f5;
}

// 编辑器容器：固定高度
.editor-wrapper {
  width: 100%;
  background-color: #fafafa;
  border-radius: 12rpx;
  padding: 16rpx;
  border: 1rpx solid #ebeef5;
  box-sizing: border-box;
}

// editor 固定高度
.editor-class {
  height: 400rpx;
  font-size: 28rpx;
  line-height: 1.7;
}

// 底部按钮：固定在页面底部
.edit-btn {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top: 1rpx solid #f0f2f5;
  z-index: 10;

  button {
    flex: 1;
    margin: 0 10rpx;
    font-size: 30rpx;
    border-radius: 12rpx;
  }

  .btn-submit {
    color: #ffffff;
    background-color: #2ecc71;
    border-color: #2ecc71;
  }

  .btn-cancel {
    color: #606266;
    background-color: #ffffff;
    border-color: #dcdfe6;
  }
}
</style>
