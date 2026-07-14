<template>
  <view class="mine-container" :style="{ height: `${windowHeight}px` }">
    <!--顶部个人信息栏-->
    <view class="header-section">
      <view class="flex padding justify-between">
        <view class="flex align-center">
          <view v-if="!avatar" class="cu-avatar xl round bg-white">
            <view class="iconfont icon-people text-gray icon"></view>
          </view>
          <image v-if="avatar" @click="handleToAvatar" :src="avatar" class="cu-avatar xl round" mode="widthFix">
          </image>
          <view v-if="!userName" @click="handleToLogin" class="login-tip">
            点击登录
          </view>
          <view v-if="userName" @click="handleToInfo" class="user-info">
            <view class="u_title"> {{ userName }} </view>
          </view>
        </view>
        <view @click="handleToInfo" class="flex align-center">
          <text>个人信息</text>
          <view class="iconfont icon-right"></view>
        </view>
      </view>
    </view>

    <view class="content-section">
      <view class="mine-actions grid col-4 text-center">
        <view class="action-item" @click="goFx67ll(0)">
          <view><uni-icons color="#2ecc71" type="star" size="32"></uni-icons></view>
          <text class="text">{{ globalConfig.appInfo.author_info[0].title }}</text>
        </view>
        <view class="action-item" @click="goFx67ll(1)">
          <view><uni-icons color="#2ecc71" type="medal" size="32"></uni-icons></view>
          <text class="text">{{ globalConfig.appInfo.author_info[1].title }}</text>
        </view>
        <view class="action-item" @click="goFx67ll(2)">
          <view><uni-icons color="#2ecc71" type="fire" size="32"></uni-icons></view>
          <text class="text">{{ globalConfig.appInfo.author_info[2].title }}</text>
        </view>
        <view class="action-item" @click="goFx67ll(3)">
          <view><uni-icons color="#2ecc71" type="hand-up" size="32"></uni-icons></view>
          <text class="text">{{ globalConfig.appInfo.author_info[3].title }}</text>
        </view>
      </view>

      <view class="menu-list">
        <view class="list-cell list-cell-arrow" @click="handleToLogHistory">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="wallet" size="20"></uni-icons></view>
            <view>历史号码记录</view>
          </view>
        </view>
        <!-- 中奖金额统计接口仅限 fx67ll 本人使用，仅对 fx67ll 显示入口避免撞 403 -->
        <view class="list-cell list-cell-arrow" @click="handleToLogStatistics" v-if="userName && userName === 'fx67ll'">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="flag" size="22"></uni-icons></view>
            <view>中奖金额统计</view>
          </view>
        </view>
        <!-- 只允许超级管理员fx67ll使用外快盈亏管理的功能，后续视情况开放 -->
        <!-- 2023已禁用，2024再出发 -->
        <view class="list-cell list-cell-arrow" @click="handleToExtraManagement"
          v-if="userName && userName === 'fx67ll' && isNeedWaiKuai">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="vip" size="20"></uni-icons></view>
            <view>外快盈亏管理</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleToPunchLog">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="calendar" size="20"></uni-icons></view>
            <view>打卡工时管理</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleToNoteLog">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="compose" size="20"></uni-icons></view>
            <view>富文本备忘录</view>
          </view>
        </view>
      </view>

      <view class="menu-list">
        <view class="list-cell list-cell-arrow" @click="handleToCubeGame">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="star" size="20"></uni-icons></view>
            <view>魔方小游戏</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleToServerStatus">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="headphones" size="20"></uni-icons></view>
            <view>Status 面板</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleTomcatServer" v-if="userName && userName === 'fx67ll'">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="paperplane" size="20"></uni-icons></view>
            <view>Tomcat 服务</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleFail2BanServer" v-if="userName && userName === 'fx67ll'">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="notification" size="20"></uni-icons></view>
            <view>Fail2Ban 监控</view>
          </view>
        </view>
        <!-- <view class="list-cell list-cell-arrow" @click="handleToEditInfo">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="staff" size="20"></uni-icons></view>
            <view>编辑资料</view>
          </view>
        </view> -->
      </view>

      <view class="menu-list menu-list-last">
        <view class="list-cell list-cell-arrow" @click="handleToNotice">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="chat" size="20"></uni-icons></view>
            <view>系统公告</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleAbout">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="paperclip" size="20"></uni-icons></view>
            <view>关于我们</view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handleToSetting">
          <view class="menu-item-box">
            <view><uni-icons color="#2ecc71" type="gear" size="20"></uni-icons></view>
            <view>应用设置</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 最新公告弹窗 -->
    <noticePopup :isShow="isShowNoticePopup" :noticeInfo="latestNoticeInfo" @close="closeNoticePopup"
      @viewAll="handleViewAllNotice" />
  </view>
</template>

<script>
import noticePopup from "@/pages/notice/component/noticePopup.vue";

// 获取配置（isNeedWaiKuai 非敏感键，明文返回）
import { getSecretConfig } from "@/api/fx67ll/secret/key.js";
import { latestNoticeLog } from "@/api/fx67ll/notice/log.js";
import { getToken } from "@/utils/auth";

export default {
  components: { noticePopup },
  data() {
    return {
      // 当前登录用户信息
      userName: this.$store.state.user.name,
      version: getApp().globalData.config.appInfo.version,
      globalConfig: getApp().globalData.config,
      // 是否需要外快的配置项
      isNeedWaiKuai: uni.getStorageSync("isNeedWaiKuai") || false,
      // 最新公告弹窗
      isShowNoticePopup: false,
      latestNoticeInfo: {},
    };
  },
  computed: {
    avatar() {
      return this.$store.state.user.avatar;
    },
    windowHeight() {
      return uni.getSystemInfoSync().windowHeight - 50;
    },
  },
  onLoad() {
    this.getWKConfig();
  },
  onShow() {
    this.isNeedWaiKuai = uni.getStorageSync("isNeedWaiKuai");
    // 登录后首次打开检查最新公告（按公告ID记已读）
    this.checkLatestNotice();
  },
  methods: {
    // 检查最新公告：有新公告（ID变化）则弹出，与本地记录的 lastNoticeId 对比
    checkLatestNotice() {
      const self = this;
      // 未登录不弹
      if (!getToken()) {
        return;
      }
      // 超级管理员 fx67ll 不弹公告通知
      if (this.userName && this.userName === 'fx67ll') {
        return;
      }
      latestNoticeLog()
        .then((res) => {
          if (res?.code === 200 && res?.data && res?.data?.noticeId) {
            const noticeId = res.data.noticeId;
            const lastId = uni.getStorageSync("lastNoticeId");
            // 与上次弹出的公告ID不同才弹（有新公告才提示）
            if (String(lastId) !== String(noticeId)) {
              self.latestNoticeInfo = res.data;
              self.isShowNoticePopup = true;
            }
          }
        })
        .catch(() => { });
    },
    // 关闭公告弹窗并记录已弹公告ID
    closeNoticePopup() {
      this.isShowNoticePopup = false;
      if (this.latestNoticeInfo?.noticeId) {
        uni.setStorageSync("lastNoticeId", this.latestNoticeInfo.noticeId);
      }
    },
    // 查看全部公告
    handleViewAllNotice() {
      this.isShowNoticePopup = false;
      if (this.latestNoticeInfo?.noticeId) {
        uni.setStorageSync("lastNoticeId", this.latestNoticeInfo.noticeId);
      }
      this.$tab.navigateTo("/pages/notice/log/index/index");
    },
    handleToInfo() {
      this.$tab.navigateTo("/pages/mine/info/index");
    },
    handleToLogHistory() {
      this.$tab.navigateTo("/pages/lottery/log/index/index");
    },
    handleToLogStatistics() {
      this.$tab.navigateTo("/pages/lottery/statistics/statistics");
    },
    handleToExtraManagement() {
      this.$tab.navigateTo("/pages/dortmund/extra/index/index");
    },
    handleToPunchLog() {
      this.$tab.navigateTo("/pages/punch/log/record/record");
    },
    handleToNoteLog() {
      this.$tab.navigateTo("/pages/note/log/index/index");
    },
    handleToNotice() {
      this.$tab.navigateTo("/pages/notice/log/index/index");
    },
    handleToCubeGame() {
      this.openBrowserNewTab("https://three.fx67ll.com/cube", "魔方小游戏");
    },
    // 跳转服务状态大盘（公开页，免登录）
    // H5 端：PC 桌面浏览器按 FODCF 逻辑居中悬浮小窗口打开（沉浸式展示），
    //        手机移动端浏览器保持全屏新页签原逻辑；
    // 微信/小程序端：走标准页面栈 navigateTo，保留标题栏
    handleToServerStatus() {
      // #ifdef H5
      const { origin, pathname } = window.location;
      const url = `${origin}${pathname}#/pages/server/status/index`;
      try {
        let newTab;
        if (this.isMobileBrowser()) {
          // 移动端浏览器：全屏新页签打开
          newTab = window.open(url, "_blank");
        } else {
          // PC 桌面浏览器：按可视高度挑选 iPhone 宽高，相对显示屏居中悬浮小窗口打开
          // 与 FODCF 一致，使用 window.screen 作为显示屏尺寸参照
          const { width, height } = this.pickSize();
          let left = (window.screen.width - width) / 2;
          let top = (window.screen.height - height) / 2;
          // 钳制非负，避免越界被浏览器强制移到屏幕左上角
          left = Math.max(0, Math.round(left));
          top = Math.max(0, Math.round(top));
          const features = [
            `width=${width}`,
            `height=${height}`,
            `left=${left}`,
            `top=${top}`,
            "resizable=yes", // 允许用户调整窗口大小
            "scrollbars=yes", // 显示滚动条
          ].join(",");
          newTab = window.open(url, "_blank", features);
        }
        if (!newTab) {
          // 拦截时降级：当前页打开
          window.location.href = url;
        }
      } catch (e) {
        uni.showToast({ title: "浏览器禁止打开新标签", icon: "none" });
      }
      // #endif
      // #ifndef H5
      this.$tab.navigateTo("/pages/server/status/index");
      // #endif
    },
    // 判断当前 H5 环境是否为「真实」手机移动端浏览器
    // 注意：Chrome F12 设备模拟模式会改写 navigator.userAgent 为机型 UA，
    // 但一般不改写 navigator.platform（桌面机仍为 Win32/MacIntel）。
    // 因此仅凭 UA 关键字会把 F12 移动模拟误判成真机——
    // 这里额外校验 platform：UA 含移动关键字但 platform 仍是桌面 OS 时，
    // 判定为 F12 模拟（按桌面处理，走居中悬浮小窗口）。
    isMobileBrowser() {
      // #ifdef H5
      const ua = navigator.userAgent || "";
      const hasMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      if (!hasMobileUA) {
        // UA 本身无移动关键字：常规桌面浏览器（含未切移动模式的 F12）
        return false;
      }
      // UA 命中移动关键字，进一步用 platform 排除 F12 设备模拟
      const platform =
        navigator.platform ||
        (navigator.userAgentData && navigator.userAgentData.platform) ||
        "";
      // 桌面 OS 的 platform 标识：命中其一即认为是桌面机在模拟移动端
      const isDesktopPlatform = /Win32|Win64|MacIntel|Macintosh|MacPowerPC|Linux x86_64|Linux i686|Linux x86/i.test(
        platform
      );
      // 桌面 platform + 移动 UA → F12 移动模拟，按桌面处理
      return !isDesktopPlatform;
      // #endif
      // #ifndef H5
      return true;
      // #endif
    },
    /**
     * 根据当前浏览器可视高度，从预设的 iPhone 机型宽高中挑选最合适的一组
     * 选择规则（默认取最小宽高）：
     *   1. 当前可视高度 <= 最小高度        → 取最小宽高
     *   2. 当前可视高度 >  最大高度        → 取最大宽高
     *   3. 其它（介于最小与最大之间）       → 取「heightPx <= 当前可视高度」中最接近的一项
     * @returns {{ width: number, height: number }} 选中的宽高，单位 px
     */
    pickSize() {
      // 预设的 iPhone 机型宽高（逻辑像素），按需替换为实际值
      const iphoneList = [
        { model: "iPhone 4", widthPx: 320, heightPx: 480 },
        { model: "iPhone 5/SE(GEN1)", widthPx: 320, heightPx: 568 },
        { model: "iPhone 6/7/8/SE(GEN2/3)", widthPx: 375, heightPx: 667 },
        { model: "iPhone 6/7/8 Plus", widthPx: 540, heightPx: 960 },
        { model: "iPhone X/XS/11 Pro", widthPx: 562.5, heightPx: 1218 },
        { model: "iPhone XR/11", widthPx: 414, heightPx: 896 },
        { model: "iPhone XS/11 Pro Max", widthPx: 621, heightPx: 1344 },
        { model: "iPhone 12/13 mini", widthPx: 540, heightPx: 1170 },
        { model: "iPhone 12/13/14", widthPx: 585, heightPx: 1266 },
        { model: "iPhone 12/13 Pro Max + 14 Plus", widthPx: 642, heightPx: 1389 },
        { model: "iPhone 14/15/16", widthPx: 589.5, heightPx: 1278 },
        { model: "iPhone 14/15 Pro Max + Plus", widthPx: 645, heightPx: 1398 },
        { model: "iPhone 16 Pro", widthPx: 603, heightPx: 1311 },
        { model: "iPhone 16 Pro Max", widthPx: 660, heightPx: 1434 }
      ];
      // 按 heightPx 升序排列，便于按高度分档选择（不修改原数组）
      const sorted = [...iphoneList].sort((a, b) => a.heightPx - b.heightPx);
      const currentHeight = window.innerHeight; // 当前浏览器可视区域高度
      const minHeight = sorted[0].heightPx;
      const maxHeight = sorted[sorted.length - 1].heightPx;
      // 默认取最小宽高（对应规则 1）
      let target = sorted[0];
      if (currentHeight > maxHeight) {
        // 规则 3：超过最大高度 → 取最大宽高
        target = sorted[sorted.length - 1];
      } else if (currentHeight > minHeight) {
        // 规则 2：高于最小高度 → 取「heightPx <= 当前可视高度」中最接近的一项
        // 在所有满足 heightPx <= currentHeight 的机型里，挑 heightPx 最大的那个
        target = sorted.reduce((acc, cur) => {
          return cur.heightPx <= currentHeight && cur.heightPx > acc.heightPx ? cur : acc;
        }, sorted[0]);
      }
      return { width: target.widthPx, height: target.heightPx };
    },
    // handleToEditInfo() {
    //   this.$tab.navigateTo("/pages/mine/info/edit");
    // },
    handleToSetting() {
      this.$tab.navigateTo("/pages/mine/setting/index");
    },
    handleToLogin() {
      this.$tab.reLaunch("/pages/login");
    },
    handleToAvatar() {
      this.$tab.navigateTo("/pages/mine/avatar/index");
    },
    handleLogout() {
      this.$modal.confirm("确定注销并退出系统吗？").then(() => {
        this.$store.dispatch("LogOut").then(() => {
          this.$tab.reLaunch("/pages/index");
        });
      });
    },
    handleTomcatServer() {
      this.$tab.navigateTo("/pages/server/tomcat/index");
    },
    handleFail2BanServer() {
      this.$tab.navigateTo("/pages/server/fail2ban/index");
    },
    handleAbout() {
      this.$tab.navigateTo("/pages/mine/about/index");
    },
    goFx67ll(index) {
      let site = this.globalConfig.appInfo.author_info[index];
      this.openBrowserNewTab(site.url, site.title);
    },
    getWKConfig() {
      const self = this;
      // isNeedWaiKuai 为非敏感键，后端鉴权分级匿名返回明文，前端直接取值（阶段三·4.12）
      getSecretConfig({ secretKey: "isNeedWaiKuai" }).then((res) => {
        if (res && res?.rows && res?.rows.length > 0 && res?.code === 200) {
          const wkTmp = JSON.parse(res.rows[0].secretValue || "false");
          uni.setStorageSync("isNeedWaiKuai", wkTmp);
          self.isNeedWaiKuai = wkTmp;
        }
      });
    },
    /**
     * 打开浏览器新页签/新窗口跳转链接
     * @param {String} url 要跳转的链接（需完整http/https协议）
     */
    openBrowserNewTab(url, title) {
      // 1. 校验链接合法性
      if (!/^https?:\/\/.+/.test(url)) {
        uni.showToast({ title: '链接格式错误', icon: 'none' });
        return;
      }

      // 2. 区分平台处理
      // #ifdef H5
      // H5端：打开新标签页（需用户交互触发，否则会被浏览器拦截）
      try {
        const newTab = window.open(url, '_blank');
        if (!newTab) {
          // 拦截时降级：当前页打开
          window.location.href = url;
        }
      } catch (e) {
        uni.showToast({ title: '浏览器禁止打开新标签', icon: 'none' });
      }
      // #endif

      // #ifdef APP-PLUS
      // App端：唤起系统浏览器（自动开新窗口/新标签）
      // 等待plus环境就绪（必加，否则可能报错）
      document.addEventListener('plusready', () => {
        plus.runtime.openURL(url, (res) => {
          uni.showToast({ title: '无法打开浏览器', icon: 'none' });
        });
      }, false);
      // #endif

      // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU
      // 小程序端：无新页签，仅能唤起系统浏览器
      this.$tab.navigateTo(
        `/pages/common/webview/index?title${title}&url=${url}`
      );
      // #endif
    }
  },
};
</script>

<style lang="scss">
page {
  background-color: #f5f6f7;
}

.mine-container {
  width: 100%;
  height: 100%;

  .header-section {
    padding: 15px 15px 45px 15px;
    background-color: #2ecc71;
    color: white;

    .login-tip {
      font-size: 18px;
      margin-left: 10px;
    }

    .cu-avatar {
      border: 2px solid #eaeaea;

      .icon {
        font-size: 40px;
      }
    }

    .user-info {
      margin-left: 15px;

      .u_title {
        font-size: 18px;
        line-height: 30px;
      }
    }
  }

  .content-section {
    position: relative;
    top: -50px;

    .menu-list {
      margin-top: 15px;
    }

    .menu-list-last {
      padding-bottom: 68px;
    }

    .mine-actions {
      margin: 15px 15px 0 15px;
      padding: 20px 0px;
      border-radius: 8px;
      background-color: white;

      .action-item {
        .icon {
          font-size: 28px;
        }

        .text {
          display: block;
          font-size: 13px;
          margin: 8px 0px;
        }
      }
    }
  }
}
</style>
