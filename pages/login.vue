<template>
  <view class="normal-login-container">
    <view class="logo-content align-center justify-center flex">
      <image style="width: 100rpx; height: 100rpx" :src="globalConfig.appInfo.logo" mode="widthFix"></image>
      <text class="title">fx67ll's Life App</text>
    </view>

    <!-- ============ H5 端：账号密码 + 验证码登录（默认），游客一键登录（主动切换） ============ -->
    <!-- #ifdef H5 -->
    <view class="login-form-content">
      <!-- 账号密码登录区（默认显示，切到游客时隐藏） -->
      <view v-if="!showGuestBtn">
        <view class="input-item flex align-center">
          <view class="iconfont icon-user icon"></view>
          <input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
        </view>
        <view class="input-item flex align-center">
          <view class="iconfont icon-password icon"></view>
          <input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
        </view>
        <view class="input-item flex align-center" style="width: 60%; margin: 0px" v-if="captchaEnabled">
          <view class="iconfont icon-code icon"></view>
          <input v-model="loginForm.code" type="number" class="input" placeholder="请输入验证码" maxlength="4" />
          <view class="login-code">
            <image :src="codeUrl" @click="getCodeDebounce" class="login-code-img" v-if="codeUrl"></image>
            <button class="login-code-img" :loading="isLoginLoading" :disabled="isLoginLoading"
              v-if="!codeUrl"></button>
          </view>
        </view>
        <view class="action-btn">
          <button @click="handleLogin" :loading="isLoginLoading" :disabled="isLoginLoading"
            class="login-btn cu-btn block lg round">
            登录
          </button>
        </view>
        <view class="reg text-center" v-if="register">
          <text class="text-grey1">还没有账号？</text>
          <text @click="toggleGuestLogin" class="text-blue">游客登录</text>
        </view>
      </view>

      <!-- 游客一键登录区（主动切换后显示，可返回账号密码登录） -->
      <view v-else>
        <view class="avatar-content">
          <image class="avatar" :src="randomAvatar || globalConfig.appInfo.logo" mode="aspectFill"></image>
        </view>
        <view class="action-btn">
          <button @click="handleOneClickLogin('guest')" :loading="isLoginLoading && loginType === 'guest'"
            :disabled="isLoginLoading" class="login-btn cu-btn block lg round">
            <text v-if="!(isLoginLoading && loginType === 'guest')">游客一键登录</text>
          </button>
        </view>
        <view class="reg text-center">
          <text class="text-grey1">已有账号？</text>
          <text @click="toggleGuestLogin" class="text-blue">返回账号登录</text>
        </view>
      </view>

      <view class="xieyi text-center">
        <text class="text-grey1">如果您有更多的疑问？</text>
        <text @click="handleGetAuthorMoreInfo(4)" class="text-blue">{{
          globalConfig.appInfo.author_info[4].title
          }}</text>
      </view>
    </view>
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

    <!-- ============ 小程序端：根据登录资格切换一键登录/账密登录 ============ -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="login-form-content">
      <!-- 一键登录区（eligible=true 默认显示，可切到账密） -->
      <view v-if="showOneClickLogin">
        <view class="avatar-content">
          <image class="avatar" :src="globalConfig.appInfo.logo" mode="aspectFill"></image>
        </view>
        <view class="action-btn">
          <button @click="handleOneClickLogin('main')" :loading="isLoginLoading && loginType === 'main'"
            :disabled="isLoginLoading" class="login-btn cu-btn block lg round">
            <text v-if="!(isLoginLoading && loginType === 'main')">一键登录</text>
          </button>
          <button v-if="showGuestBtn" @click="handleOneClickLogin('guest')"
            :loading="isLoginLoading && loginType === 'guest'" :disabled="isLoginLoading"
            class="login-btn guest-btn cu-btn block lg round guest-slide">
            <text v-if="!(isLoginLoading && loginType === 'guest')">游客一键登录</text>
          </button>
        </view>
        <view class="reg text-center" v-if="register">
          <text class="text-grey1">还没有账号？</text>
          <text @click="toggleGuestLogin" class="text-blue">{{ showGuestBtn ? '收起' : '游客登录' }}</text>
        </view>
        <view class="reg text-center">
          <text class="text-grey1">无法一键登录？</text>
          <text @click="toggleLoginMode" class="text-blue">账号密码登录</text>
        </view>
      </view>

      <!-- 账号密码登录区（eligible=false 默认显示，可切到一键登录） -->
      <view v-else>
        <view class="input-item flex align-center">
          <view class="iconfont icon-user icon"></view>
          <input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
        </view>
        <view class="input-item flex align-center">
          <view class="iconfont icon-password icon"></view>
          <input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
        </view>
        <view class="input-item flex align-center" style="width: 60%; margin: 0px" v-if="captchaEnabled">
          <view class="iconfont icon-code icon"></view>
          <input v-model="loginForm.code" type="number" class="input" placeholder="请输入验证码" maxlength="4" />
          <view class="login-code">
            <image :src="codeUrl" @click="getCodeDebounce" class="login-code-img" v-if="codeUrl"></image>
            <button class="login-code-img" :loading="isLoginLoading" :disabled="isLoginLoading" v-if="!codeUrl"></button>
          </view>
        </view>
        <view class="action-btn">
          <button @click="handleLogin" :loading="isLoginLoading" :disabled="isLoginLoading"
            class="login-btn cu-btn block lg round">登录</button>
        </view>
        <view class="reg text-center">
          <text class="text-grey1">想用一键登录？</text>
          <text @click="toggleLoginMode" class="text-blue">返回一键登录</text>
        </view>
        <view class="reg text-center" v-if="register">
          <text class="text-grey1">还没有账号？</text>
          <text @click="switchToGuest" class="text-blue">游客登录</text>
        </view>
      </view>

      <view class="xieyi text-center">
        <text class="text-grey1">如果您有更多的疑问？</text>
        <text @click="handleGetAuthorMoreInfo(4)" class="text-blue">{{
          globalConfig.appInfo.author_info[4].title
          }}</text>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";
import _ from "@/node_modules/underscore";
import { getAvatar } from "@/api/system/user";
import { getCodeImg } from "@/api/login";
import { loginToken, oneClickLogin } from "@/api/auth/app.js";
import { getFingerprint } from "@/utils/fingerprint.js";
// #ifdef MP-WEIXIN
import { checkLoginEligibility } from "@/api/fx67ll/secret/key.js";
// #endif

export default {
  data() {
    return {
      // 用户注册开关（控制游客入口显示）
      register: true,
      globalConfig: getApp().globalData.config,
      // 是否正在登陆标识
      isLoginLoading: false,
      // 当前登录类型 main / guest（用于区分 loading 态）
      loginType: "",
      // 是否展开游客一键登录按钮
      showGuestBtn: false,
      // 随机马赛克头像（头像接口已匿名，登录页可调）
      randomAvatar: "",
      // 今年
      nowYear: moment().format("YYYY"),
      // ===== H5 端账密登录相关 =====
      codeUrl: "",
      captchaEnabled: true,
      loginForm: {
        username: "",
        password: "",
        code: "",
        uuid: "",
      },
      // ===== 小程序端登录模式切换 =====
      // 是否显示一键登录区（eligible=true 默认 true，eligible=false 默认 false，可手动切换）
      showOneClickLogin: false,
      // 当前微信账号是否在白名单（可一键登录）
      eligible: false,
    };
  },
  created() {
    // 两端都获取验证码（账密登录需要）
    this.getCode();
    // #ifdef H5
    // H5 端游客区用随机马赛克头像（头像接口已匿名）
    this.getRandomAvatar();
    // #endif
    // #ifdef MP-WEIXIN
    // 小程序端：检查登录资格，决定默认显示一键登录还是账密登录
    this.checkEligibility();
    // #endif
  },
  methods: {
    // 切换游客一键登录按钮展开/收起
    toggleGuestLogin() {
      this.showGuestBtn = !this.showGuestBtn;
    },
    // 切换登录模式（一键登录 ↔ 账号密码登录，小程序端）
    toggleLoginMode() {
      this.showOneClickLogin = !this.showOneClickLogin;
    },
    // 从账密登录切到游客一键登录（展开游客按钮）
    switchToGuest() {
      this.showOneClickLogin = true;
      this.showGuestBtn = true;
    },
    // 检查登录资格：wx.login 拿 code → 调后端查白名单 → 只返回布尔
    // 伪装成"检查登录资格"接口，不暴露 openid 概念
    checkEligibility() {
      const self = this;
      uni.login({
        provider: "weixin",
        success: (loginRes) => {
          checkLoginEligibility(loginRes.code).then((res) => {
            self.eligible = res?.eligible === true;
            self.showOneClickLogin = self.eligible;
          });
        },
        fail: () => {
          self.eligible = false;
          self.showOneClickLogin = false;
        },
      });
    },
    // 获取随机马赛克头像（头像接口已匿名，登录页装饰用）
    getRandomAvatar() {
      const self = this;
      getAvatar("fx67ll").then((res) => {
        if (res?.avatar) {
          self.randomAvatar = "data:image/gif;base64," + res.avatar;
        }
      });
    },
    // 获取更多信息
    handleGetAuthorMoreInfo(index) {
      let site = this.globalConfig.appInfo.author_info[index];
      this.$tab.navigateTo(
        `/pages/common/webview/index?title=${site.title}&url=${site.url}`
      );
    },
    /**
     * 一键登录主流程（阶段三·4.4）
     * 1. 主账号(main,仅小程序)：wx.login 拿 code → loginToken 带 wxCode 换令牌
     *    游客(guest)：loginToken 带设备指纹换令牌
     * 2. oneClickLogin 用令牌 + 指纹换 JWT
     * 3. setToken → GetInfo → 跳首页
     */
    handleOneClickLogin(loginType) {
      const self = this;
      this.loginType = loginType;
      this.isLoginLoading = true;
      const fingerprint = getFingerprint();
      // 第一步：派发登录令牌
      self.requestLoginToken(loginType, fingerprint)
        .then((loginTokenStr) => {
          // 第二步：令牌 + 指纹换 JWT
          return oneClickLogin({ loginToken: loginTokenStr, fingerprint: fingerprint });
        })
        .then((res) => {
          // 第三步：存 token → 拉用户信息 → 跳首页
          self.$store.dispatch("OneClickLogin", res.token).then(() => {
            self.loginSuccess();
          });
        })
        .catch((err) => {
          self.isLoginLoading = false;
          self.loginType = "";
          self.shakeLoginBtn();
          self.$modal.msgError(err && err.msg ? err.msg : "登录失败，请重试");
        });
    },
    /**
     * 请求登录令牌
     * main：wx.login 拿 code，带 wxCode 请求（后端换 openid 校验白名单）
     * guest：直接带指纹请求
     */
    requestLoginToken(loginType, fingerprint) {
      const self = this;
      return new Promise((resolve, reject) => {
        if (loginType === "main") {
          // #ifdef MP-WEIXIN
          uni.login({
            provider: "weixin",
            success: (loginRes) => {
              self.doLoginToken({ loginType: "main", wxCode: loginRes.code, fingerprint: fingerprint }, resolve, reject);
            },
            fail: () => {
              reject({ msg: "微信登录失败" });
            },
          });
          // #endif
          // #ifndef MP-WEIXIN
          reject({ msg: "主账号登录仅支持微信小程序" });
          // #endif
        } else {
          self.doLoginToken({ loginType: "guest", fingerprint: fingerprint }, resolve, reject);
        }
      });
    },
    // 实际调 loginToken 接口
    doLoginToken(data, resolve, reject) {
      loginToken(data)
        .then((res) => {
          if (res && res.loginToken) {
            resolve(res.loginToken);
          } else {
            reject({ msg: "获取登录令牌失败" });
          }
        })
        .catch((err) => {
          reject(err);
        });
    },
    // 登录成功后处理
    loginSuccess() {
      const self = this;
      this.$store.dispatch("GetInfo").then(() => {
        self.isLoginLoading = false;
        self.loginType = "";
        self.$tab.reLaunch("/pages/index");
      });
    },
    // 登录失败时按钮轻微抖动动效
    shakeLoginBtn() {
      // #ifdef MP-WEIXIN
      uni.vibrateShort();
      // #endif
    },
    // ===== 账密登录方法（H5 + 小程序端共用） =====
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
    // 账号密码登录校验
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
        })
        .catch(() => {
          if (self.captchaEnabled) {
            self.getCode();
          }
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
    padding-top: 12%;

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
    margin-top: 12%;
    width: 80%;

    // H5 端输入框样式
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

    // 小程序端头像区：圆形 + 阴影 + 入场淡入缩放动效
    .avatar-content {
      margin: 30px auto 40px;
      animation: avatarFadeIn 0.6s ease-out;

      .avatar {
        width: 160rpx;
        height: 160rpx;
        border-radius: 50%;
        box-shadow: 0 8rpx 30rpx rgba(46, 204, 113, 0.35);
        border: 4rpx solid #ffffff;
      }
    }

    @keyframes avatarFadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }

      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .action-btn {
      margin-top: 20px;

      // 主色调胶囊按钮（薄荷绿）+ 按压反馈
      .login-btn {
        margin-top: 20px;
        height: 45px;
        background-color: #2ecc71;
        color: #ffffff;
        font-size: 16px;
        box-shadow: 0 6rpx 20rpx rgba(46, 204, 113, 0.4);
        transition: all 0.15s ease;

        &:active {
          transform: scale(0.97);
          box-shadow: 0 3rpx 10rpx rgba(46, 204, 113, 0.4);
        }

        &::after {
          border: none;
        }
      }

      // 游客按钮：白底薄荷绿描边，区分主次
      .guest-btn {
        background-color: #ffffff;
        color: #2ecc71;
        border: 2rpx solid #2ecc71;
        box-shadow: 0 4rpx 12rpx rgba(46, 204, 113, 0.15);
      }
    }

    // 游客按钮展开过渡动效（CSS animation，跨端兼容小程序与 H5）
    .guest-slide {
      animation: guestSlideIn 0.3s ease;
    }

    @keyframes guestSlideIn {
      from {
        transform: translateY(-10px);
        opacity: 0;
      }

      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    // H5 端 transition 过渡（小程序端不用）
    .slide-fade-enter-active {
      transition: all 0.3s ease;
    }

    .slide-fade-enter-from {
      transform: translateY(-10px);
      opacity: 0;
    }

    .reg {
      margin-top: 20px;
    }

    .xieyi {
      color: #333;
      margin-top: 20px;
    }

    // H5 端验证码图片
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
