<script>
import config from './config'
// import store from '@/store'
import { getToken } from '@/utils/auth'

export default {
  onLaunch: function () {
    this.initApp()
  },
  // 页面不存在时兜底跳转首页（主要针对 H5 hash 路由白屏问题）
  onPageNotFound(res) {
    uni.reLaunch({ url: '/pages/index' })
  },
  methods: {
    // 初始化应用
    initApp() {
      // 初始化应用配置
      this.initConfig()
      // 检查用户登录状态（两端都检查，避免小程序刷新后绕过 permission.js 直接进首页）
      this.checkLogin()
      // #ifdef H5
      // 宽屏卡片布局的内部滚动桥接（媒体查询未命中时不做任何事）
      this.initCardScrollBridge()
      // #endif
    },
    initConfig() {
      this.globalData.config = config
    },
    checkLogin() {
      if (!getToken()) {
        this.$tab.reLaunch('/pages/login')
      }
    },
    // #ifdef H5
    // 宽屏「卡片内滚动」桥接与布局开关（小程序编译时整块剔除）：
    // uni-h5 的页面滚动体系（onPageScroll / onReachBottom / uni.pageScrollTo）基于 window 滚动实现，
    // 卡片布局下 html/body overflow hidden、window 固定不滚，页面滚动实际发生在 uni-page-wrapper 上，
    // 这里把这几个能力桥接到卡片内部滚动容器；
    // 卡片布局仅在「宽屏媒体查询命中 且 未开启全屏模式（html.full-layout）」时生效，
    // 其余情况（手机、竖屏平板、全屏模式）全部走框架原生逻辑，行为与之前完全一致
    initCardScrollBridge() {
      // 与 App.vue 样式中的媒体查询保持同一阈值
      const mq = window.matchMedia('(orientation: landscape) and (min-width: 980px)')
      const isCardMode = () =>
        mq.matches && !document.documentElement.classList.contains('full-layout')

      this.setupLayoutToggle()

      // 当前页面（页面栈最顶层）的主滚动容器 uni-page-wrapper
      const getWrapper = () => {
        const pages = getCurrentPages()
        const current = pages && pages.length ? pages[pages.length - 1] : null
        const el = current && current.$vm && current.$vm.$el
        const page = el && el.closest ? el.closest('uni-page') : null
        return page ? page.querySelector('uni-page-wrapper') : null
      }

      // 调用当前页面实例的生命周期钩子（页面钩子可能因 mixin 被合并成数组）
      const invokeHook = (name, args) => {
        const pages = getCurrentPages()
        const current = pages && pages.length ? pages[pages.length - 1] : null
        const vm = current && current.$vm
        if (!vm) return
        const hooks = vm.$options[name]
        if (typeof hooks === 'function') {
          hooks.call(vm, args)
        } else if (Array.isArray(hooks)) {
          hooks.forEach((fn) => fn && fn.call(vm, args))
        }
      }

      // onReachBottom 闩锁：离开触底区域后复位，避免一次贴底连续触发
      let reachBottomLatched = false

      // scroll 事件不冒泡但可被捕获，捕获阶段监听即可拿到卡片内所有滚动，过滤出页面主容器
      document.addEventListener(
        'scroll',
        (e) => {
          if (!isCardMode()) return
          const wrapper = e.target
          if (!wrapper || wrapper.tagName !== 'UNI-PAGE-WRAPPER') return
          invokeHook('onPageScroll', { scrollTop: wrapper.scrollTop })
          // 距底 50px 触发，与框架默认 onReachBottomDistance 一致
          const distance = wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight
          if (distance <= 50) {
            if (!reachBottomLatched) {
              reachBottomLatched = true
              invokeHook('onReachBottom', {})
            }
          } else {
            reachBottomLatched = false
          }
        },
        true
      )

      // uni.pageScrollTo 桥接：
      // 业务侧（fail2ban 各面板组件）以「viewport.scrollTop + rect.top」计算目标位置，
      // 卡片内滚动下该公式对应的正确落点 = 入参 scrollTop + wrapper 当前滚动位置 - wrapper 顶边的视口坐标，
      // 逐项推导可将元素精确滚动到与整页滚动时相同的相对位置；duration > 0 时平滑滚动
      const rawPageScrollTo = uni.pageScrollTo && uni.pageScrollTo.bind(uni)
      uni.pageScrollTo = (options = {}) => {
        const wrapper = isCardMode() ? getWrapper() : null
        if (!wrapper) {
          return rawPageScrollTo && rawPageScrollTo(options)
        }
        const rect = wrapper.getBoundingClientRect()
        const top = Math.max((options.scrollTop || 0) + wrapper.scrollTop - rect.top, 0)
        wrapper.scrollTo({ top, behavior: options.duration ? 'smooth' : 'auto' })
        options.success && options.success()
        options.complete && options.complete()
      }
    },
    // 桌面布局切换开关（仅宽屏媒体查询内可见，样式见 App.vue 样式块 .desktop-layout-toggle）：
    // 默认卡片模式；点击切换 localStorage 标记并整页刷新（rpx 换算基准在页面样式注入时确定，必须重新加载）
    setupLayoutToggle() {
      const KEY = 'fx67ll-desktop-layout'
      const isFull = () => {
        try {
          return localStorage.getItem(KEY) === 'full'
        } catch (e) {
          return false
        }
      }
      const btn = document.createElement('button')
      btn.className = 'desktop-layout-toggle'
      btn.textContent = isFull() ? '卡片模式' : '全屏模式'
      btn.addEventListener('click', () => {
        try {
          if (isFull()) {
            localStorage.removeItem(KEY)
          } else {
            localStorage.setItem(KEY, 'full')
          }
        } catch (e) { }
        location.reload()
      })
      document.body.appendChild(btn)
    }
    // #endif
  }
}
</script>

<style lang="scss">
@import '@/static/scss/index.scss';

/* #ifdef H5 */
// 宽屏访问适配（小程序编译时整块剔除）：
// 竖屏设备（手机、主流竖屏平板）不做任何限制，保持与手机一致的整屏移动端布局；
// 横屏平板与桌面浏览器默认以「iPhone Pro Max 规格的居中悬浮卡片」展示（430px 宽、55px 屏幕圆角），
// 页面右下角提供开关（localStorage['fx67ll-desktop-layout']）可切换回原始整页全宽布局，
// full-layout 类名由 static/index.html 中先于业务包执行的内联脚本添加，见该文件注释。
// 媒体查询阈值取 980px，与 rpx 换算的 960px 上限衔接（见 pages.json 与 static/index.html 注释）：
// 980px 视口扣除滚动条宽度后仍大于 960px，保证卡片出现时 rpx 一定已按 430px 基准换算，二者不会错位
@media (orientation: landscape) and (min-width: 980px) {

  // 布局切换开关：卡片与全屏两种模式下都显示（全屏模式下用于切回卡片模式）
  .desktop-layout-toggle {
    display: flex;
  }

  html:not(.full-layout) {
    // 卡片纵向留白与屏幕圆角（iPhone Pro Max 屏幕圆角为 55px）
    --card-inset: 23px;
    --card-radius: 55px;

    background-color: #f5f6f8;
    // 禁止页面级滚动，整个应用收纳进固定高度的卡片内
    overflow: hidden;

    // body 默认白底来自框架的 var(--UI-BG-0)（运行时注入），加 !important 确保无论编译产物中的
    // 样式顺序如何，留白区域都能稳定渲染为浅灰，卡片圆角与投影才有可见的对比背景
    body {
      background-color: #f5f6f8 !important;
      overflow: hidden;
    }

    // 居中悬浮卡片容器：固定高度（视口高扣除上下留白）、限宽、圆角、投影；
    // overflow: hidden 将内容裁剪进圆角轮廓，圆角由裁剪结构性保证，任何内部元素都无法再盖住圆角；
    // translateZ(0) 使卡片成为其内部所有 fixed 元素（导航栏、tabBar、遮罩、弹层、悬浮按钮）的包含块，
    // 它们全部相对卡片定位并被卡片圆角裁剪，与手机屏幕的表现一致，无需逐个覆盖定位规则
    uni-app {
      height: calc(100vh - 2 * var(--card-inset));
      max-width: 375px;
      margin: var(--card-inset) auto;
      border-radius: var(--card-radius);
      background-color: #ffffff;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transform: translateZ(0);
    }

    // 页面滚动收进卡片：uni-page-wrapper 由框架计算好高度（已扣除导航栏占位），这里开启纵向滚动
    uni-page-wrapper {
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    // 手机屏幕没有滚动条，卡片内所有滚动容器（页面主容器、scroll-view）隐藏滚动条，
    // 滚动行为不受影响（滚轮、触摸、键盘均正常），仅不显示滚动条本身
    uni-page-wrapper,
    uni-scroll-view,
    .uni-scroll-view {
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
        width: 0;
      }
    }

    // 原生导航栏与 tabBar 为 fixed 定位，包含块已是卡片，纵向贴齐卡片上下边缘即可（圆角由卡片裁剪保证）
    body uni-page-head .uni-page-head {
      top: 0;
    }

    body uni-tabbar {
      bottom: 0;
    }
  }
}

// 布局切换开关按钮：挂在 body 下（uni-app 之外，不受卡片裁剪与定位影响），
// 默认隐藏，仅宽屏媒体查询内显示；按钮的创建与切换逻辑见 script 中 initCardScrollBridge
.desktop-layout-toggle {
  display: none;
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2147483000;
  align-items: center;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  user-select: none;

  &:hover {
    background-color: rgba(0, 0, 0, 0.75);
  }
}

/* #endif */
</style>
