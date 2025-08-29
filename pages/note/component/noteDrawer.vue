<template>
  <zb-drawer mode="bottom" :title="drawerTitle" :wrapperClosable="false" :visible.sync="isShowNoteDrawer" :radius="true"
    :height="drawerHeight">
    <view class="fx67ll-note-drawer">
      <view class="fx67ll-note-item-editor">
        <editor id="fx67ll-note-editor" class="fx67ll-note-editor"
          placeholder="这是一个简易的移动端富文本编辑器，您可以在这里输入备忘内容，这是必填项，支持多端互联展示" @ready="onEditorReady" @input="onEditorInput">
        </editor>
      </view>
      <view class="fx67ll-note-item-remark">
        <!-- <uni-easyinput :value="noteRemark" type="textarea" placeholder="有需要的话可以在这里记录备注" maxlength="1023"
          @input="noteRemarkChange" /> -->
        <uni-easyinput :value="noteRemark" placeholder="有需要的话可以在这里记录备注" maxlength="1023" :disabled="isNetworkLoading"
          @input="noteRemarkChange" />
      </view>
      <view class="fx67ll-note-btn">
        <button class="fx67ll-btn-insert" type="default" :loading="isNetworkLoading" @click="insertEditorImage"
          v-if="userName === 'fx67ll'">
          {{ isNetworkLoading ? "上传中" : "插入图片" }}
        </button>
        <button class="fx67ll-btn-submit-for-insert" type="primary" :disabled="isNetworkLoading"
          @click="submitNoteLogForm" v-if="userName === 'fx67ll'">
          {{ isAdd ? "新增" : "修改" }}
        </button>
        <button class="fx67ll-btn-submit" type="primary" @click="submitNoteLogForm" v-if="userName !== 'fx67ll'">
          {{ isAdd ? "新增" : "修改" }}备忘记录
        </button>
        <button class="fx67ll-btn-cancel" type="warn" :disabled="isNetworkLoading" @click="closeDrawer">取消</button>
      </view>
    </view>
  </zb-drawer>
</template>

<script>
import { addNoteLog, updateNoteLog } from "@/api/note/log";

import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

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
    // 是否是新增
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
      // 定时器对象
      timer: null,
      // Drawer组件相关参数
      drawerHeight: "75%",
      drawerTitle: moment().format("YYYY-MM-DD hh:mm:ss dddd"),
      // 表单相关参数
      noteContent: "",
      noteRemark: "",
      // 富文本相关参数
      editorContext: null,
      isNetworkLoading: false,
    };
  },
  watch: {
    isShowNoteDrawer(newValue, oldValue) {
      if (!newValue) {
        // 监听父节点是否需要关闭当前弹窗
        this.$emit("hideDrawer", newValue);
      } else {
        this.clearEditorContent();
        this.noteRemark = "";
      }
    },
    noteInfo(newValue, oldValue) {
      if (
        !this.isAdd &&
        newValue?.noteId
      ) {
        const { noteContent, noteRemark } = newValue;
        this.noteContent = noteContent || "";
        this.editorContext.setContents({
          html: noteContent || "",
        });
        this.noteRemark = noteRemark || "";
      }
    },
    // noteContent(newValue, oldValue) {
    //   const self = this;
    //   if (newValue) {
    //     setTimeout(() => {
    //       self.editorContext.setContents({
    //         html: newValue,
    //       });
    //     }, 1)
    //   }
    // },
  },
  mounted() {
    // moment初始汉化
    moment.locale("zh-cn");
    // 显示当前时间
    this.showNowTime();
  },
  destroyed() {
    // 销毁时清除定时器
    clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    // 显示当前时间
    showNowTime() {
      const self = this;
      this.timer = setInterval(() => {
        self.drawerTitle = moment().format("YYYY-MM-DD hh:mm:ss dddd");
      }, 1000);
    },
    // 编辑器初始化完成
    onEditorReady() {
      // 获取编辑器上下文
      uni.createSelectorQuery().select('#fx67ll-note-editor')
        .context((contextRes) => {
          this.editorContext = contextRes.context;
        })
        .exec();
    },
    // 编辑器内容变化时触发
    onEditorInput(e) {
      this.noteContent = e?.detail?.html || "";
    },
    // 编辑器插入图片
    insertEditorImage() {
      const self = this;
      if (!this.editorContext) return;
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
              if (!self.editorContext) return;
              self.editorContext.insertImage({
                src: uploadFileResData?.url,
                alt: uploadFileResData?.newFileName,
                width: '100%',
                success: () => {
                  self.isNetworkLoading = false;
                },
                fail: (err) => {
                  uni.showToast({
                    title: "富文本编辑器插入图片失败，请联系管理员！",
                    icon: "none",
                    duration: 1998,
                  });
                  console.error('富文本编辑器插入图片失败: ', err);
                  self.isNetworkLoading = false;
                }
              });
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
      if (!this.editorContext) return;
      this.editorContext.clear();
      this.noteContent = "";
    },
    // 输入备忘备注
    noteRemarkChange: function (e) {
      this.noteRemark = e;
    },
    // 新增或修改备忘记录
    submitNoteLogForm() {
      const self = this;
      const formParams = {
        noteContent: self.noteContent,
        noteRemark: self.noteRemark,
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
            self.isShowNoteDrawer = false;
            uni.showToast({
              title: "备忘时间记录成功！",
              icon: "none",
              duration: 1998,
            });
          } else {
            uni.showToast({
              title: "备忘时间记录失败，请联系管理员！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      } else {
        updateNoteLog(noteParams).then((res) => {
          self.isNetworkLoading = false;
          if (res?.code === 200) {
            self.isShowNoteDrawer = false;
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
