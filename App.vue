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
    },
    initConfig() {
      this.globalData.config = config
    },
    checkLogin() {
      if (!getToken()) {
        this.$tab.reLaunch('/pages/login')
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/static/scss/index.scss'
</style>
