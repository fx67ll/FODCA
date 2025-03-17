<template>
    <view class="fx67ll-tools-box">
        <scroll-view
          scroll-y="true"
          class="fx67ll-tools-scroll"
        >
          <view class="fx67ll-ocr-lottery">
            <view class="fx67ll-drawer-title" v-if="!ocrTagList || ocrTagList.length < 1"
              >测试页，后期看看能填充什么内容</view
            >
  
            <view class="fx67ll-ocr-btn">
              <button
                type="warn"
                v-if="
                  ocrTagList &&
                  ocrTagList.length > 0 &&
                  ocrTagCheckList &&
                  ocrTagCheckList.length > 0
                "
                @click="copyCheckTagText"
              >
                拷贝选中的文字至剪切板
              </button>
            </view>
  
            <view
              class="fx67ll-drawer-title"
              v-if="
                ocrTagList &&
                ocrTagList.length > 0 &&
                ocrTagCheckList &&
                ocrTagCheckList.length === 0
              "
              >尝试点击识别结果中你需要的的文字分块吧！</view
            >
            <view
              class="fx67ll-drawer-title"
              v-if="
                ocrTagList &&
                ocrTagList.length > 0 &&
                ocrTagCheckList &&
                ocrTagCheckList.length > 0
              "
              >您已选中以下识别结果:</view
            >
            <view class="fx67ll-ocr-result" v-if="ocrTagList && ocrTagList.length > 0">
              <span
                v-for="(item, index) in ocrTagList"
                :key="item.timeStamp"
                :class="{
                  'fx67ll-ocr-tag': item.isCheck,
                  'fx67ll-ocr-tag-choose': item.isCheck,
                }"
                @click="changeTagStatus(index)"
                ><text v-if="item.isCheck">{{ item.words || "--" }}</text>
              </span>
            </view>
  
            <view class="fx67ll-drawer-title" v-if="ocrTagList && ocrTagList.length > 0"
              >本次百度OCR识别的结果:</view
            >
            <view class="fx67ll-ocr-result" v-if="ocrTagList && ocrTagList.length > 0">
              <span
                v-for="(item, index) in ocrTagList"
                :key="item.timeStamp"
                :class="{ 'fx67ll-ocr-tag': true, 'fx67ll-ocr-tag-check': item.isCheck }"
                @click="changeTagStatus(index)"
                >{{ item.words || "--" }}
              </span>
            </view>
          </view>
        </scroll-view>
    </view>
  </template>
  
  <script>
  // underscores函数库
  import _ from "@/node_modules/underscore";
  
  // 日期时间处理
  import moment from "@/node_modules/moment";
  import "@/node_modules/moment/locale/zh-cn";
  
  // 各种工具类
  import {
    decryptString,
  } from "@/utils/index";
  // 获取加密配置
  import { getSecretConfig } from "@/api/secret/key.js";
  import { getCryptoSaltKey } from "@/neverUploadToGithub";
  
  export default {
    data() {
      return {
        ocrTagList: [],
        ocrTagCheckList: [],
      };
    },
    onLoad() {
      // 执行初始化流程
      this.initProcess();
    },
    methods: {
      // 初始化流程
      initProcess() {
        // moment初始汉化
        moment.locale("zh-cn");
      },
      // 拷贝选中的识别结果文字字块
      copyCheckTagText() {
        const self = this;
        let copyResTxt = "";
        this.ocrTagCheckList.forEach((item, index) => {
          if (item?.isCheck) {
            if (index === self.ocrTagCheckList.length - 1) {
              copyResTxt = copyResTxt.concat(item?.words);
            } else {
              copyResTxt = copyResTxt.concat(item?.words + ",");
            }
          }
        });
        console.log("copyResTxt", copyResTxt);
        uni.setClipboardData({
          data: copyResTxt,
          showToast: false, // 仅支持 App (3.2.13+)、H5 (3.2.13+)
          success: function (res) {
            // #ifdef H5
            // 微信不支持关闭复制成功提示所以暂时只支持H5
            uni.showToast({
              title: "已为您成功复制到剪切板! ",
              icon: "none",
              duration: 1998,
            });
            // #endif
            console.log("uni.setClipboardData - success: " + JSON.stringify(res));
          },
          fail: function (err) {
            uni.showToast({
              title: "卧槽复制失败了！请联系管理员处理! ",
              icon: "none",
              duration: 1998,
            });
            console.error("uni.setClipboardData - fail: " + JSON.stringify(err));
          },
        });
      },
      // 修改识别结果的tag状态
      changeTagStatus(tagIndex) {
        const self = this;
        this.ocrTagList[tagIndex].isCheck = !this.ocrTagList[tagIndex].isCheck;
        this.ocrTagCheckList = [];
        this.ocrTagList.forEach((item) => {
          if (item?.isCheck) {
            self.ocrTagCheckList.push({ ...item });
          }
        });
      },
    },
  };
  </script>
  
  <style lang="less">
  @import url("./ticket.less");
  </style>
  