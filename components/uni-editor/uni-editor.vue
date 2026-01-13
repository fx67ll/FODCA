<template>
    <view class="container">
        <view class="page-body">
            <view class="wrapper">
                <view class="toolbar" @tap="format" style="height: 120px;overflow-y: auto;">
                    <view :class="formats.bold ? 'ql-active' : ''" class="iconfont icon-zitijiacu" data-name="bold">
                    </view>
                    <view :class="formats.italic ? 'ql-active' : ''" class="iconfont icon-zitixieti" data-name="italic">
                    </view>
                    <view :class="formats.underline ? 'ql-active' : ''" class="iconfont icon-zitixiahuaxian"
                        data-name="underline"></view>
                    <view :class="formats.strike ? 'ql-active' : ''" class="iconfont icon-zitishanchuxian"
                        data-name="strike"></view>
                    <!-- #ifndef MP-BAIDU -->
                    <view :class="formats.align === 'left' ? 'ql-active' : ''" class="iconfont icon-zuoduiqi"
                        data-name="align" data-value="left"></view>
                    <!-- #endif -->
                    <view :class="formats.align === 'center' ? 'ql-active' : ''" class="iconfont icon-juzhongduiqi"
                        data-name="align" data-value="center"></view>
                    <view :class="formats.align === 'right' ? 'ql-active' : ''" class="iconfont icon-youduiqi"
                        data-name="align" data-value="right"></view>
                    <view :class="formats.align === 'justify' ? 'ql-active' : ''" class="iconfont icon-zuoyouduiqi"
                        data-name="align" data-value="justify"></view>
                    <!-- #ifndef MP-BAIDU -->
                    <view :class="formats.lineHeight ? 'ql-active' : ''" class="iconfont icon-line-height"
                        data-name="lineHeight" data-value="2"></view>
                    <view :class="formats.letterSpacing ? 'ql-active' : ''" class="iconfont icon-Character-Spacing"
                        data-name="letterSpacing" data-value="2em"></view>
                    <view :class="formats.marginTop ? 'ql-active' : ''" class="iconfont icon-722bianjiqi_duanqianju"
                        data-name="marginTop" data-value="20px"></view>
                    <view :class="formats.marginBottom ? 'ql-active' : ''" class="iconfont icon-723bianjiqi_duanhouju"
                        data-name="marginBottom" data-value="20px"></view>
                    <!-- #endif -->

                    <view class="iconfont icon-clearedformat" @tap="removeFormat"></view>

                    <!-- #ifndef MP-BAIDU -->
                    <view :class="formats.fontFamily ? 'ql-active' : ''" class="iconfont icon-font"
                        data-name="fontFamily" data-value="Pacifico"></view>
                    <view :class="formats.fontSize === '24px' ? 'ql-active' : ''" class="iconfont icon-fontsize"
                        data-name="fontSize" data-value="24px"></view>
                    <!-- #endif -->
                    <view :class="formats.color === '#0000ff' ? 'ql-active' : ''" class="iconfont icon-text_color"
                        data-name="color" data-value="#0000ff"></view>
                    <view :class="formats.backgroundColor === '#00ff00' ? 'ql-active' : ''"
                        class="iconfont icon-fontbgcolor" data-name="backgroundColor" data-value="#00ff00"></view>
                    <view class="iconfont icon-date" @tap="insertDate"></view>
                    <view class="iconfont icon--checklist" data-name="list" data-value="check"></view>
                    <view :class="formats.list === 'ordered' ? 'ql-active' : ''" class="iconfont icon-youxupailie"
                        data-name="list" data-value="ordered"></view>
                    <view :class="formats.list === 'bullet' ? 'ql-active' : ''" class="iconfont icon-wuxupailie"
                        data-name="list" data-value="bullet"></view>

                    <view class="iconfont icon-undo" @tap="undo"></view>
                    <view class="iconfont icon-redo" @tap="redo"></view>

                    <view class="iconfont icon-outdent" data-name="indent" data-value="-1"></view>
                    <view class="iconfont icon-indent" data-name="indent" data-value="+1"></view>
                    <view class="iconfont icon-fengexian" @tap="insertDivider"></view>
                    <view class="iconfont icon-charutupian" @tap="insertImage"></view>
                    <view :class="formats.header === 1 ? 'ql-active' : ''" class="iconfont icon-format-header-1"
                        data-name="header" :data-value="1"></view>
                    <view :class="formats.script === 'sub' ? 'ql-active' : ''" class="iconfont icon-zitixiabiao"
                        data-name="script" data-value="sub"></view>
                    <view :class="formats.script === 'super' ? 'ql-active' : ''" class="iconfont icon-zitishangbiao"
                        data-name="script" data-value="super"></view>

                    <view class="iconfont icon-shanchu" @tap="clear"></view>

                    <view :class="formats.direction === 'rtl' ? 'ql-active' : ''" class="iconfont icon-direction-rtl"
                        data-name="direction" data-value="rtl"></view>
                </view>

                <view class="editor-wrapper">
                    <editor id="editor" class="ql-container" placeholder="开始输入..." show-img-size show-img-toolbar
                        show-img-resize @statuschange="onStatusChange" :read-only="readOnly" @ready="onEditorReady">
                    </editor>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getToken } from "@/utils/auth";
export default {
    name: 'UniEditor',
    data() {
        return {
            readOnly: false,
            formats: {}
        }
    },
    methods: {
        readOnlyChange() {
            this.readOnly = !this.readOnly
        },
        onEditorReady() {
            // #ifdef APP-PLUS || MP-WEIXIN || H5
            uni.createSelectorQuery().select('#editor').context((res) => {
                this.editorCtx = res.context
            }).exec()
            // #endif
        },
        undo() {
            this.editorCtx.undo()
        },
        redo() {
            this.editorCtx.redo()
        },
        format(e) {
            let {
                name,
                value
            } = e.target.dataset
            if (!name) return
            this.editorCtx.format(name, value)
        },
        onStatusChange(e) {
            const formats = e.detail
            this.formats = formats
        },
        insertDivider() {
            this.editorCtx.insertDivider({
                success: function () {
                    console.log('insert divider success')
                }
            })
        },
        clear() {
            uni.showModal({
                title: '清空编辑器',
                content: '确定清空编辑器全部内容？',
                success: res => {
                    if (res.confirm) {
                        this.editorCtx.clear({
                            success: function (res) {
                                console.log("clear success")
                            }
                        })
                    }
                }
            })
        },
        removeFormat() {
            this.editorCtx.removeFormat()
        },
        insertDate() {
            const date = new Date()
            const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
            this.editorCtx.insertText({
                text: formatDate
            })
        },
        insertImage() {
            const self = this;
            // uni.chooseImage({
            //     count: 1,
            //     success: (res) => {
            //         this.editorCtx.insertImage({
            //             src: res.tempFilePaths[0],
            //             alt: '图像',
            //             success: function () {
            //                 console.log('insert image success')
            //             }
            //         })
            //     }
            // })
            if (!this.editorCtx) {
                uni.showToast({
                    title: "编辑器初始化未完成，请重新操作！",
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
                            self.editorCtx.insertImage({
                                src: uploadFileResData?.url,
                                alt: uploadFileResData?.newFileName,
                                count: 1,
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
                            self.insertEditorImage();
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
    }
}
</script>

<style>
@import "./editor-icon.css";

.page-body {
    height: calc(100vh - var(--window-top) - var(--status-bar-height));
}

.wrapper {
    height: 100%;
}

.editor-wrapper {
    height: calc(100vh - var(--window-top) - var(--status-bar-height) - 140px);
    background: #fff;
}

.iconfont {
    display: inline-block;
    padding: 8px 8px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 20px;
}

.toolbar {
    box-sizing: border-box;
    border-bottom: 0;
    font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}

.ql-container {
    box-sizing: border-box;
    padding: 12px 15px;
    width: 100%;
    min-height: 30vh;
    height: 100%;
    font-size: 16px;
    line-height: 1.5;
}

.ql-active {
    color: #06c;
}
</style>
