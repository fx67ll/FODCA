<template>
  <zb-drawer mode="bottom" :title="isAdd ? '新增备忘记录' : isView ? '预览富文本' : '修改备忘记录'" :wrapperClosable="false"
    :visible.sync="isShowNoteDrawer" :radius="true" :height="drawerHeight">
    <scroll-view :scroll-y="true" class="fx67ll-note-drawer" v-if="!isView">
      <scroll-view :scroll-y="true" class="fx67ll-note-editor">
        <editor id="fx67ll-note-editor-add" class="fx67ll-note-editor-class"
          placeholder="这是一个简易的移动端富文本编辑器，您可以在这里输入备忘内容，这是必填项，支持多端互联展示" @ready="onEditorReady" @input="onEditorInput"
          v-if="isAdd">
        </editor>
        <editor id="fx67ll-note-editor-edit" class="fx67ll-note-editor-class"
          placeholder="这是一个简易的移动端富文本编辑器，您可以在这里输入备忘内容，这是必填项，支持多端互联展示" @ready="onEditorReady" @input="onEditorInput"
          v-if="!isAdd">
        </editor>
      </scroll-view>
      <view class="fx67ll-note-remark" v-if="isNeedRemark">
        <uni-easyinput type="textarea" :value="noteRemark" placeholder="有需要的话可以在这里记录备注信息" maxlength="1023"
          :disabled="isNetworkLoading" @input="noteRemarkChange" />
      </view>
      <view class="fx67ll-note-btn">
        <button class="fx67ll-btn-insert" type="default" :loading="isNetworkLoading" @click="insertEditorImage"
          v-if="userName === 'fx67ll'" style="color:#ffffff; background-color:#E6A23C; border-color:#E6A23C">
          {{ isNetworkLoading ? "上传中" : "插入图片" }}
        </button>
        <button class="fx67ll-btn-remark" type="default" :disabled="isNetworkLoading" @click="handleShowRemark"
          style="color:#ffffff; background-color:#409EFF; border-color:#409EFF">
          {{ isNeedRemark ? "关闭备注设置" : "添加备注信息" }}
        </button>
      </view>
      <view class="fx67ll-note-btn">
        <button class="fx67ll-btn-submit" type="default" :disabled="isNetworkLoading" @click="submitNoteLogForm"
          style="color:#ffffff; background-color:#1AAD19; border-color:#1AAD19">
          {{ isAdd ? "提交新增记录" : "提交修改记录" }}
        </button>
        <button class="fx67ll-btn-cancel" type="warn" :disabled="isNetworkLoading" @click="closeDrawer">取消</button>
      </view>
    </scroll-view>
    <scroll-view :scroll-y="true" class="fx67ll-note-drawer-view" v-if="isView">
      <rich-text :nodes="noteContent"></rich-text>
    </scroll-view>
  </zb-drawer>
</template>

<script>
import { addNoteLog, updateNoteLog } from "@/api/note/log";
import { getToken } from "@/utils/auth";

export default {
  props: {
    // 是否显示抽屉
    isShowNoteDrawer: {
      type: Boolean,
      required: true,
      default: false,
    },
    // 是否是新增
    isAdd: {
      type: Boolean,
      required: true,
      default: true,
    },
    // 是否是预览
    isView: {
      type: Boolean,
      required: true,
      default: true,
    },
    // 备忘信息详情
    noteInfo: {
      type: Object,
      required: false,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      // 全局用户名
      userName: this.$store.state.user.name,
      // Drawer组件相关参数
      drawerHeight: "calc(100% - 66px)",
      // 表单相关参数
      noteContent: "",
      noteRemark: "",
      // 富文本相关参数
      isEditorReady: false,
      addEditorContext: null,
      editEditorContext: null,
      isNetworkLoading: false,
      // 备注开关
      isNeedRemark: false,
    };
  },
  watch: {
    isShowNoteDrawer(newValue, oldValue) {
      if (!newValue) {
        // 监听父节点是否需要关闭当前弹窗
        this.$emit("hideDrawer", newValue);
        // 重置弹框配置
        this.isNeedRemark = false;
      }
    },
    noteInfo(newValue, oldValue) {
      const self = this;
      if (!this.isAdd && newValue?.noteId) {
        const { noteContent, noteRemark } = newValue;

        this.noteContent = noteContent || "";
        this.noteRemark = noteRemark || "";

        if (noteRemark) {
          this.isNeedRemark = true;
        }

        // 定义递归检查函数
        function setEditorContentWhenReady() {
          if (self.isEditorReady) {
            self.editEditorContext.setContents({
              html: noteContent || "",
            });
          } else {
            // 延迟233ms后再次检查
            setTimeout(setEditorContentWhenReady, 233);
          }
        }

        // 启动检查
        setEditorContentWhenReady();
      }
    },
  },
  methods: {
    // 编辑器初始化完成后获取编辑器上下文
    onEditorReady() {
      const self = this;
      self.isEditorReady = false;
      function tryGetContext(retryCount = 0) {
        if (retryCount > 10) {
          console.error('编辑器上下文获取失败，超过最大重试次数！');
          uni.showToast({
            title: "编辑器初始化失败，请联系管理员！",
            icon: 'none',
            duration: 1998,
          });
          return;
        };
        if (self.isAdd) {
          uni.createSelectorQuery()
            .in(self)
            .select('#fx67ll-note-editor-add')
            .context((contextRes) => {
              if (contextRes && contextRes.context) {
                self.addEditorContext = contextRes.context;
                self.isEditorReady = true;
                console.log('新增弹窗中，编辑器上下文获取成功，重试次数：', retryCount, '次。');
              } else {
                console.log('新增弹窗中，编辑器上下文获取失败，重试中... 第', retryCount + 1, '次。');
                setTimeout(() => {
                  tryGetContext(retryCount + 1);
                }, 233);
              }
            })
            .exec();
        } else {
          uni.createSelectorQuery()
            .in(self)
            .select('#fx67ll-note-editor-edit')
            .context((contextRes) => {
              if (contextRes && contextRes.context) {
                self.editEditorContext = contextRes.context;
                self.isEditorReady = true;
                console.log('编辑弹窗中，编辑器上下文获取成功，重试次数：', retryCount, '次。');
              } else {
                console.log('编辑弹窗中，编辑器上下文获取失败，重试中... 第', retryCount + 1, '次。');
                setTimeout(() => {
                  tryGetContext(retryCount + 1);
                }, 233);
              }
            })
            .exec();
        }
      };
      tryGetContext();
    },
    // 编辑器内容变化时触发
    onEditorInput(e) {
      this.noteContent = e?.detail?.html || "";
    },
    // 编辑器插入图片
    insertEditorImage() {
      const self = this;
      if (!this.addEditorContext && !this.editEditorContext) {
        uni.showToast({
          title: "编辑器初始化失败，请联系管理员！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
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
    // 本地选取照片上传之后统一处理的回调
    pickLocalPhotoCallBack(type, pickCallBackRes) {
      // 成功回调
      if (type === 0) {
        // 如果返回的图片列表数据正常则继续执行百度OCR分析的流程
        if (pickCallBackRes && pickCallBackRes.length > 0) {
          // console.log("chooseImageRes", pickCallBackRes);
          this.uploadPicForEditor(pickCallBackRes);
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
    // 上传图片，使用若依的上传接口
    uploadPicForEditor(fileList) {
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
          // "Content-Type": "multipart/form-data",
        },
        success: (uploadFileRes) => {
          // console.log("uploadFileRes", uploadFileRes);
          if (uploadFileRes && uploadFileRes?.statusCode === 200 && uploadFileRes?.data) {
            const uploadFileResData = JSON.parse(uploadFileRes?.data);
            // console.log("uploadFileResData", uploadFileResData);
            if (uploadFileResData?.code === 200 && uploadFileResData?.url) {
              if (self.isAdd) {
                self.addEditorContext.insertImage({
                  src: uploadFileResData?.url,
                  alt: uploadFileResData?.newFileName,
                  width: '100%',
                  success: (res) => {
                    self.isNetworkLoading = false;
                    self.noteContent = self.addEditorContext.getContents();
                  },
                  fail: (err) => {
                    uni.showToast({
                      title: "富文本编辑器插入图片失败，请联系管理员！",
                      icon: "none",
                      duration: 1998,
                    });
                    console.error('新增的时候，富文本编辑器插入图片失败: ', err);
                    self.isNetworkLoading = false;
                  }
                });
              } else {
                self.editEditorContext.insertImage({
                  src: uploadFileResData?.url,
                  alt: uploadFileResData?.newFileName,
                  width: '100%',
                  success: (res) => {
                    self.isNetworkLoading = false;
                    self.noteContent = self.editEditorContext.getContents();
                  },
                  fail: (err) => {
                    uni.showToast({
                      title: "富文本编辑器插入图片失败，请联系管理员！",
                      icon: "none",
                      duration: 1998,
                    });
                    console.error('修改的时候，富文本编辑器插入图片失败: ', err);
                    self.isNetworkLoading = false;
                  }
                });
              }
            }
          } else {
            self.isNetworkLoading = false;
          }
        },
        fail: (uploadErr) => {
          uni.showToast({
            title: "uniCloud图片上传接口调用失败，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
          console.error("uniCloud图片上传接口调用失败: " + JSON.stringify(uploadErr));
          self.isNetworkLoading = false;
        },
        complete: (res) => {
          console.log("uniCloud图片上传接口调用完成: " + JSON.stringify(res));
        },
      });
    },
    // 清空编辑器内容
    clearEditorContent() {
      if (!this.addEditorContext && !this.editEditorContext) {
        uni.showToast({
          title: "编辑器初始化失败，请联系管理员！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      if (this.isAdd) {
        this.addEditorContext.clear();
      } else {
        this.editEditorContext.clear();
      }
      this.noteContent = "";
      this.noteRemark = "";
    },
    // 输入备忘备注
    noteRemarkChange: function (e) {
      this.noteRemark = e;
    },
    // 切换显示备注
    handleShowRemark() {
      this.isNeedRemark = !this.isNeedRemark;
    },
    // 新增或修改备忘记录
    submitNoteLogForm() {
      const self = this;
      if (!this.noteContent) {
        uni.showToast({
          title: "备忘内容不能为空！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      if (this.noteContent?.length > 1023) {
        uni.showToast({
          title: "备忘内容过长！",
          icon: "none",
          duration: 1998,
        });
        return;
      }
      const formParams = {
        noteContent: self.noteContent,
        noteRemark: self.isNeedRemark ? self.noteRemark : '',
      };
      const noteParams = self.isAdd
        ? formParams
        : {
          ...self.noteInfo,
          ...formParams,
        };
      if (self.isAdd) {
        addNoteLog(noteParams).then((res) => {
          self.isNetworkLoading = false;
          if (res?.code === 200) {
            self.clearEditorContent();
            self.closeDrawer();
            uni.showToast({
              title: "新增成功！",
              icon: "none",
              duration: 1998,
            });
          } else {
            uni.showToast({
              title: "新增失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      } else {
        updateNoteLog(noteParams).then((res) => {
          self.isNetworkLoading = false;
          if (res?.code === 200) {
            self.closeDrawer();
            uni.showToast({
              title: "修改成功！",
              icon: "none",
              duration: 1998,
            });
            self.$emit("reloadNoteList");
          } else {
            uni.showToast({
              title: "修改失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      }
    },
    // 关闭当前弹窗
    closeDrawer() {
      this.$emit("hideDrawer", false);
    },
  },
};
</script>

<style lang="less">
@import url("./noteDrawer.less");
</style>
