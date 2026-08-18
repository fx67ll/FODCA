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
      // 模拟 iPhone 状态栏（时间/信号/电池，仅卡片模式可见，不占内容布局高度）
      this.initDeviceStatusBar()
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

      this.setupLayoutToggle(mq)

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
    // 默认卡片模式；点击按钮或隐藏快捷键切换 localStorage 标记并整页刷新
    // （rpx 换算基准在页面样式注入时确定，必须重新加载）
    setupLayoutToggle(mq) {
      const KEY = 'fx67ll-desktop-layout'
      const isFull = () => {
        try {
          return localStorage.getItem(KEY) === 'full'
        } catch (e) {
          return false
        }
      }
      const toggle = () => {
        try {
          if (isFull()) {
            localStorage.removeItem(KEY)
          } else {
            localStorage.setItem(KEY, 'full')
          }
        } catch (e) { }
        location.reload()
      }
      const btn = document.createElement('button')
      btn.className = 'desktop-layout-toggle'
      btn.textContent = isFull() ? '卡片模式' : '全屏模式'
      btn.addEventListener('click', toggle)
      document.body.appendChild(btn)

      // 隐藏快捷键 Ctrl+E+Z：按住 Ctrl 与 E 的同时再按 Z 触发切换（先按 E 再按 Z，E 松开或加了其它修饰键即失效）；
      // 仅在宽屏（卡片/全屏两种模式可切换的场景）时接管按键，窄屏竖屏下浏览器快捷键行为不受影响；
      // Ctrl+E 必须拦截（否则焦点会跳到地址栏，收不到后续按键），Ctrl+Z 仅在紧接 Ctrl+E 时被拦截，平时仍是正常撤销
      let armed = false
      document.addEventListener('keydown', (ev) => {
        if (!mq.matches || ev.repeat) return
        const key = ev.key && ev.key.toLowerCase()
        if (!ev.ctrlKey || ev.altKey || ev.shiftKey || ev.metaKey) {
          armed = false
          return
        }
        if (key === 'e') {
          armed = true
          ev.preventDefault()
        } else if (key === 'z' && armed) {
          armed = false
          ev.preventDefault()
          toggle()
        } else {
          armed = false
        }
      })
      document.addEventListener('keyup', (ev) => {
        if (ev.key && ev.key.toLowerCase() === 'e') {
          armed = false
        }
      })
      window.addEventListener('blur', () => {
        armed = false
      })
    },
    // 模拟 iPhone 状态栏（仅卡片模式可见，样式见 App.vue 样式块 .device-status-bar）：
    // 左侧当前时间（24 小时制、无前导零，每 15 秒刷新），右侧信号与电池图标（静态满格/满电）；
    // 挂载到 uni-app 内部，fixed 定位包含块即卡片 —— 随卡片缩放、被卡片圆角裁剪、不占内容布局高度
    initDeviceStatusBar() {
      const app = document.querySelector('uni-app')
      if (!app) return
      const SIGNAL =
        '<svg viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg" fill="#000000">' +
        '<rect x="0" y="8" width="3" height="4" rx="1"/>' +
        '<rect x="5" y="6" width="3" height="6" rx="1"/>' +
        '<rect x="10" y="3.5" width="3" height="8.5" rx="1"/>' +
        '<rect x="15" y="1" width="3" height="11" rx="1"/></svg>'
      const BATTERY =
        '<svg viewBox="0 0 27 13" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="#000000"/>' +
        '<rect x="24.5" y="4.5" width="2" height="4" rx="1" fill="#000000"/>' +
        '<rect x="2" y="2" width="18" height="9" rx="2" fill="#000000"/></svg>'
      const bar = document.createElement('div')
      bar.className = 'device-status-bar'
      bar.innerHTML =
        '<span class="device-status-time"></span>' +
        '<span class="device-status-icons">' + SIGNAL + BATTERY + '</span>'
      const time = bar.querySelector('.device-status-time')
      const render = () => {
        const now = new Date()
        time.textContent = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0')
      }
      render()
      setInterval(render, 15000)
      app.appendChild(bar)
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
// 横屏平板与桌面浏览器默认以「iPhone Pro Max 规格的居中悬浮卡片」展示（430:932 恒定纵横比、
// 55px 屏幕圆角、顶部灵动岛与底部 Home 指示条安全区，视口较矮时整卡等比缩小、恒居中），
// 页面右下角提供开关（localStorage['fx67ll-desktop-layout']）可切换回原始整页全宽布局，
// full-layout 类名由 static/index.html 中先于业务包执行的内联脚本添加，见该文件注释。
// 媒体查询阈值取 980px，与 rpx 换算的 960px 上限衔接（见 pages.json 与 static/index.html 注释）：
// 980px 视口扣除滚动条宽度后仍大于 960px，保证卡片出现时 rpx 一定已按 430px 基准换算，二者不会错位

// 布局切换开关按钮：挂在 body 下（uni-app 之外，不受卡片裁剪与定位影响），
// 默认隐藏，仅宽屏媒体查询内显示；按钮的创建与切换逻辑见 script 中 initCardScrollBridge；
// 注意：该隐藏规则必须声明在下方媒体查询之前（同特异性下源顺序靠后者生效），
// 媒体查询内的 display: flex 才能在宽屏下稳定覆盖这里的 display: none
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

// 模拟状态栏（时间/信号/电池）：由 script 中 initDeviceStatusBar 挂载到 uni-app 内，
// 默认隐藏，仅宽屏卡片模式（html:not(.full-layout)）的媒体查询内显示；
// 与上方开关同理，隐藏规则声明在媒体查询之前，保证媒体内的规则可稳定覆盖
.device-status-bar {
  display: none;
}

@media (orientation: landscape) and (min-width: 980px) {

  // 布局切换开关：卡片与全屏两种模式下都显示（全屏模式下用于切回卡片模式）
  .desktop-layout-toggle {
    display: flex;
  }

  html:not(.full-layout) {
    // 卡片尺寸体系（纵向尺寸统一由 --card-h 等比推导，任意缩放下都是一台等比例的小号 iPhone Pro Max）：
    // --card-inset 卡片上下最小留白（视口高于标准卡片时，居中后实际留白更大，始终上下相等）；
    // --card-h 卡片高度，标准 932px（iPhone Pro Max 逻辑分辨率高），视口较矮时以可用高度为限；
    // --safe-top / --safe-bottom 顶部状态栏（灵动岛）与底部 Home 指示条安全区（真机分别为 59px / 34px）
    --card-inset: 23px;
    --card-h: min(932px, calc(100vh - 2 * var(--card-inset)));
    --card-radius: calc(var(--card-h) * 55 / 932);
    --safe-top: calc(var(--card-h) * 59 / 932);
    --safe-bottom: calc(var(--card-h) * 34 / 932);

    background-color: #f5f6f8;
    // 禁止页面级滚动，整个应用收纳进固定高度的卡片内
    overflow: hidden;

    // body 弹性布局使 #app 连同卡片在视口中水平垂直双向居中（上下留白相等、左右留白相等）；
    // body 默认白底来自框架的 var(--UI-BG-0)（运行时注入），加 !important 确保无论编译产物中的
    // 样式顺序如何，留白区域都能稳定渲染为浅灰，卡片圆角与投影才有可见的对比背景
    body {
      display: flex !important;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f5f6f8 !important;
      overflow: hidden;
    }

    // 居中悬浮卡片容器（iPhone Pro Max 规格：430×932、55px 屏幕圆角）：
    // 宽高同源于 --card-h，纵横比恒为 430:932；margin auto 提供水平居中（纵向居中由 body 弹性布局保证）；
    // overflow: hidden 将内容裁剪进圆角轮廓，圆角由裁剪结构性保证，任何内部元素都无法再盖住圆角；
    // 上下内边距即状态栏与 Home 指示条安全区，uni-page 高度百分比基于卡片内容区，页面内容自动避开两段安全区；
    // translateZ(0) 使卡片成为其内部所有 fixed 元素（导航栏、tabBar、遮罩、弹层、悬浮按钮）的包含块，
    // 它们全部相对卡片定位并被卡片圆角裁剪，与手机屏幕的表现一致，无需逐个覆盖定位规则
    uni-app {
      box-sizing: border-box;
      width: calc(var(--card-h) * 430 / 932);
      height: var(--card-h);
      margin: auto;
      padding-top: var(--safe-top);
      padding-bottom: var(--safe-bottom);
      border-radius: var(--card-radius);
      background-color: #ffffff;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transform: translateZ(0);
    }

    // 灵动岛：顶部安全区中央的黑色胶囊，模拟 iPhone Pro Max 状态栏；
    // fixed 定位包含块即卡片（translateZ(0)），层级压过卡片内一切内容（真机硬件恒在应用之上），不拦截点击
    uni-app::before {
      content: '';
      position: fixed;
      top: calc(var(--card-h) * 11 / 932);
      left: 50%;
      z-index: 2147482000;
      width: calc(var(--card-h) * 125 / 932);
      height: calc(var(--card-h) * 37 / 932);
      border-radius: 999px;
      background-color: #000000;
      transform: translateX(-50%);
      pointer-events: none;
    }

    // Home 指示条：底部安全区中央的黑色圆条，同样不拦截点击
    uni-app::after {
      content: '';
      position: fixed;
      bottom: calc(var(--card-h) * 8 / 932);
      left: 50%;
      z-index: 2147482000;
      width: calc(var(--card-h) * 140 / 932);
      height: calc(var(--card-h) * 5 / 932);
      border-radius: 999px;
      background-color: rgba(0, 0, 0, 0.9);
      transform: translateX(-50%);
      pointer-events: none;
    }

    // 状态栏内容（时间左、信号与电池右）：fixed 悬浮于顶部安全区，与灵动岛同一水平中线（安全区内垂直居中），
    // 不参与内容布局（不占用内容高度，内部组件定位不受影响），不拦截点击；
    // 基础隐藏规则声明在媒体查询之前，这里的规则在源顺序上靠后，保证卡片模式下稳定可见
    .device-status-bar {
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--safe-top);
      align-items: center;
      justify-content: space-between;
      padding: 0 calc(var(--card-h) * 24 / 932);
      z-index: 2147482000;
      pointer-events: none;
      user-select: none;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Arial, sans-serif;
      font-size: calc(var(--card-h) * 17 / 932);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    // 右侧图标组：信号、电池，尺寸随 --card-h 等比缩放（与灵动岛同一套推导）
    .device-status-icons {
      display: flex;
      align-items: center;
      gap: calc(var(--card-h) * 5 / 932);

      svg {
        display: block;
        height: calc(var(--card-h) * 12 / 932);
      }
    }

    // 页面滚动收进卡片：uni-page-wrapper 由框架计算好高度（基于卡片内容区的百分比，已扣除导航栏占位，
    // 且天然避开上下安全区），这里开启纵向滚动
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

    // 原生导航栏与 tabBar 为 fixed 定位，包含块已是卡片，纵向分别贴齐顶部/底部安全区边缘（圆角由卡片裁剪保证）
    body uni-page-head .uni-page-head {
      top: var(--safe-top);
    }

    body uni-tabbar,
    body uni-tabbar .uni-tabbar {
      bottom: var(--safe-bottom);
    }
  }
}

/* #endif */
</style>
