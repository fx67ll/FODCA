<template>
  <view class="normal-login-container">
    <view class="logo-content align-center justify-center flex">
      <image
        style="width: 100rpx; height: 100rpx"
        :src="globalConfig.appInfo.logo"
        mode="widthFix"
      ></image>
      <text class="title">fx67ll's Life App</text>
    </view>
    <view class="login-form-content">
      <view class="input-item flex align-center">
        <view class="iconfont icon-user icon"></view>
        <input
          v-model="loginForm.username"
          class="input"
          type="text"
          placeholder="请输入账号"
          maxlength="30"
        />
      </view>
      <view class="input-item flex align-center">
        <view class="iconfont icon-password icon"></view>
        <input
          v-model="loginForm.password"
          type="password"
          class="input"
          placeholder="请输入密码"
          maxlength="20"
        />
      </view>
      <view
        class="input-item flex align-center"
        style="width: 60%; margin: 0px"
        v-if="captchaEnabled"
      >
        <view class="iconfont icon-code icon"></view>
        <input
          v-model="loginForm.code"
          type="number"
          class="input"
          placeholder="请输入验证码"
          maxlength="4"
        />
        <view class="login-code">
          <image
            :src="codeUrl"
            @click="getCodeDebounce"
            class="login-code-img"
            v-if="codeUrl"
          ></image>
          <button
            class="login-code-img"
            :loading="isLoginLoading"
            :disabled="isLoginLoading"
            v-if="!codeUrl"
          ></button>
        </view>
      </view>
      <view class="action-btn">
        <button
          @click="handleLogin"
          :loading="isLoginLoading"
          :disabled="isLoginLoading"
          class="login-btn cu-btn block bg-blue lg round"
        >
          登录
        </button>
      </view>
      <!-- <view class="reg text-center" v-if="register">
        <text class="text-grey1">没有账号？</text>
        <text @click="handleUserRegister" class="text-blue">立即注册</text>
      </view> -->
      <view class="reg text-center" v-if="register">
        <text class="text-grey1">还没有账号？</text>
        <text @click="touristLogin" class="text-blue">游客登录</text>
      </view>
      <view class="xieyi text-center">
        <text class="text-grey1">如果您有更多的疑问？</text>
        <text @click="handleGetAuthorMoreInfo(4)" class="text-blue">{{
          globalConfig.appInfo.author_info[4].title
        }}</text>
      </view>
    </view>
    <!-- #ifdef H5 -->
    <view class="fx67ll-footer-container">
      <view class="fx67ll-footer">
        Designed & Powered by
        <a href="https://nav.fx67ll.com" target="_blank">fx67ll</a>
        Copyright© 2018- {{ nowYear }}
        <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">
          皖ICP备18017174号
        </a>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import { getCodeImg } from "@/api/login";
import _ from "@/node_modules/underscore";
// 日期时间处理
import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";
// #ifdef MP-WEIXIN
import { getSecretConfig } from "@/api/secret/key.js";
import { decryptString } from "@/utils/index";
import { getCryptoSaltKey } from "@/neverUploadToGithub";
// #endif

export default {
  data() {
    return {
      codeUrl: "",
      captchaEnabled: true,
      // 用户注册开关
      register: true,
      globalConfig: getApp().globalData.config,
      loginForm: {
        username: "",
        password: "",
        code: "",
        uuid: "",
      },
      // 是否正在登陆标识
      isLoginLoading: false,
      // 今年
      nowYear: moment().format("YYYY"),
    };
  },
  created() {
    this.getCode();
    // #ifdef MP-WEIXIN
    this.getDefaultLoginInfo();
    // #endif
  },
  methods: {
    // 填入默认账号密码
    getDefaultLoginInfo() {
      const self = this;
      getSecretConfig({ secretKey: "loginName" }).then((res) => {
        if (res && res?.rows && res?.rows.length > 0) {
          self.loginForm.username = decryptString(
            res.rows[0].secretValue,
            getCryptoSaltKey()
          );
        }
      });
      getSecretConfig({ secretKey: "loginPassword" }).then((res) => {
        if (res && res?.rows && res?.rows.length > 0) {
          self.loginForm.password = decryptString(
            res.rows[0].secretValue,
            getCryptoSaltKey()
          );
        }
      });
    },
    // 用户注册
    handleUserRegister() {
      this.$tab.redirectTo(`/pages/register`);
    },
    // 游客登录
    touristLogin() {
      this.$modal.showToast("暂不支持游客注册，已为您自动填充游客账号密码~");
      this.loginForm.username = "user";
      this.loginForm.password = "123456";
    },
    // 获取更多信息
    handleGetAuthorMoreInfo(index) {
      let site = this.globalConfig.appInfo.author_info[index];
      this.$tab.navigateTo(
        `/pages/common/webview/index?title=${site.title}&url=${site.url}`
      );
    },
    getCodeDebounce: _.debounce(function () {
      this.getCode();
    }, 233),
    // 获取图形验证码
    getCode() {
      const self = this;
      this.isLoginLoading = true;
      getCodeImg().then((res) => {
        self.captchaEnabled =
          res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (self.captchaEnabled) {
          self.codeUrl = "data:image/gif;base64," + res.img;
          self.loginForm.uuid = res.uuid;
        }
        self.isLoginLoading = false;
      });
    },
    // 登录方法
    async handleLogin() {
      if (this.loginForm.username === "") {
        this.$modal.msgError("请输入您的账号");
      } else if (this.loginForm.password === "") {
        this.$modal.msgError("请输入您的密码");
      } else if (this.loginForm.code === "" && this.captchaEnabled) {
        this.$modal.msgError("请输入验证码");
      } else {
        this.$modal.loading("登录中，请耐心等待...");
        this.pwdLogin();
      }
    },
    // 密码登录
    async pwdLogin() {
      const self = this;
      this.isLoginLoading = true;
      this.$store
        .dispatch("Login", this.loginForm)
        .then(() => {
          self.loginSuccess();
          // self.$modal.closeLoading();
        })
        .catch(() => {
          if (self.captchaEnabled) {
            self.getCode();
          }
        });
    },
    // 登录成功后，处理函数
    loginSuccess(result) {
      const self = this;
      // 设置用户信息
      this.$store.dispatch("GetInfo").then((res) => {
        self.isLoginLoading = false;
        self.$modal.closeLoading();
        self.$tab.reLaunch("/pages/index");
      });
    },
  },
};
</script>

<style lang="scss">
page {
  background-color: #ffffff;
}

.normal-login-container {
  width: 100%;

  .logo-content {
    width: 100%;
    font-size: 21px;
    text-align: center;
    padding-top: 15%;

    image {
      border-radius: 4px;
    }

    .title {
      margin-left: 10px;
    }
  }

  .login-form-content {
    text-align: center;
    margin: 20px auto;
    margin-top: 15%;
    width: 80%;

    .input-item {
      margin: 20px auto;
      background-color: #f5f6f7;
      height: 45px;
      border-radius: 20px;

      .icon {
        font-size: 38rpx;
        margin-left: 10px;
        color: #999;
      }

      .input {
        width: 100%;
        font-size: 14px;
        line-height: 20px;
        text-align: left;
        padding-left: 15px;
      }
    }

    .login-btn {
      margin-top: 40px;
      height: 45px;
    }

    .reg {
      margin-top: 15px;
    }

    .xieyi {
      color: #333;
      margin-top: 20px;
    }

    .login-code {
      height: 38px;
      float: right;

      .login-code-img {
        height: 38px;
        position: absolute;
        margin-left: 10px;
        width: 220rpx;
        border-radius: 8px;
      }
    }
  }
}

uni-button[loading]:before {
  vertical-align: initial;
}

.fx67ll-footer-container {
  width: 100%;
  margin-top: 23%;
  background-color: #ffffff;

  .fx67ll-footer {
    padding: 20px 30px;
    margin: 0 auto;
    text-align: center;
    user-select: text;
    z-index: 99999;
    color: #bababa;
    cursor: pointer;

    a {
      color: #bababa;
      padding: 0 10px;
    }

    a:hover {
      color: #42b983;
    }
  }
}
</style>
