<template>
  <!-- 游客公开服务状态大盘（移动端精简版）：仅展示后端脱敏聚合数据 -->
  <view class="status-page">
    <view class="status-header">
      <view class="header-left">
        <view class="logo-dot"></view>
        <text class="header-title">fx67ll's 系统服务状态总览</text>
      </view>
      <text class="update-time">更新于 {{ updateTimeText }}</text>
    </view>

    <!-- 概览卡片区 -->
    <view class="overview-cards">
      <view class="overview-card">
        <text class="card-label">在线服务</text>
        <view class="card-value">
          <text class="card-num">{{ onlineServiceCount }}</text>
          <text class="card-unit">/ {{ totalServiceCount }}</text>
        </view>
        <text class="card-sub">在线率 {{ onlineRate }}%</text>
      </view>
      <view class="overview-card">
        <text class="card-label">稳定运行</text>
        <view class="card-value">
          <text class="card-num">{{ uptimeDays }}</text>
          <text class="card-unit">天</text>
        </view>
        <text class="card-sub">系统持续平稳运行</text>
      </view>
      <view class="overview-card highlight">
        <text class="card-label">累计拦截攻击</text>
        <view class="card-value">
          <text class="card-num">{{ totalBlockedAttempts }}</text>
          <text class="card-unit">次</text>
        </view>
        <text class="card-sub">Fail2Ban 防护{{ fail2banEnabled ? '已启用' : '未启用' }}</text>
      </view>
    </view>

    <!-- 服务在线状态列表 -->
    <view class="service-section">
      <text class="section-title">服务在线状态</text>
      <view class="service-list">
        <view v-for="item in serviceList" :key="item.name" class="service-item">
          <view class="service-dot" :class="{ online: item.online, offline: !item.online }"></view>
          <text class="service-name">{{ item.name }}</text>
          <text class="service-status" :class="{ online: item.online, offline: !item.online }">
            {{ item.online ? '在线' : '离线' }}
          </text>
        </view>
      </view>
    </view>

    <!-- 服务器资源占用（脱敏，仅百分比/小数，不含路径与配置） -->
    <view class="resource-section">
      <text class="section-title">服务器资源占用</text>

      <!-- CPU 使用率 -->
      <view class="resource-item">
        <view class="resource-head">
          <text class="resource-name">CPU 使用率</text>
          <text class="resource-value">{{ cpuUsage }}%</text>
        </view>
        <view class="bar">
          <view class="bar-inner" :class="cpuBarClass" :style="{ width: cpuBarWidth }"></view>
        </view>
      </view>

      <!-- 内存使用率 -->
      <view class="resource-item">
        <view class="resource-head">
          <text class="resource-name">内存使用率</text>
          <text class="resource-value">{{ memoryUsage }}%</text>
        </view>
        <view class="bar">
          <view class="bar-inner" :class="memoryBarClass" :style="{ width: memoryBarWidth }"></view>
        </view>
        <text class="resource-sub">{{ memoryUsedGB }} / {{ memoryTotalGB }} GB</text>
      </view>

      <!-- 磁盘使用率 -->
      <view class="resource-item">
        <view class="resource-head">
          <text class="resource-name">磁盘使用率</text>
          <text class="resource-value">{{ diskUsage }}%</text>
        </view>
        <view class="bar">
          <view class="bar-inner" :class="diskBarClass" :style="{ width: diskBarWidth }"></view>
        </view>
      </view>
    </view>

    <!-- 服务器负载与运行时长（脱敏，负载仅小数，不暴露核数） -->
    <view class="load-section">
      <view class="load-item">
        <text class="load-value">{{ osUptimeDays }}</text>
        <text class="load-label">开机天数</text>
      </view>
      <view class="load-item">
        <text class="load-value">{{ load1 }}</text>
        <text class="load-label">1min 负载</text>
      </view>
      <view class="load-item">
        <text class="load-value">{{ load15 }}</text>
        <text class="load-label">15min 负载</text>
      </view>
    </view>

    <!-- 能力摘要文案 -->
    <view class="summary-text">
      本站由 fx67ll 管理系统提供运维与安全防护，已累计抵御
      <text class="summary-num">{{ totalBlockedAttempts }}</text>
      次恶意访问，数据均已脱敏处理，仅展示状态信息。
    </view>

    <!-- 加载提示 -->
    <view v-if="initializing" class="skeleton-tip">数据加载中，请稍候...</view>
  </view>
</template>

<script>
import { getPublicStatusOverview } from '@/api/fx67ll/server/status';

// 进度条宽度：百分比转宽度字符串（0-100%）
// 抽到模块级纯函数，供 computed 调用，避免在模板 :style 里直接调方法（微信小程序不兼容）
function barWidth(percent) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return `${p}%`;
}
// 进度条档位：低于 60% 正常(normal)，60-85% 警告(warn)，85%+ 危险(danger)
// 同样抽到模块级，供 computed 调用，避免模板 :class 调方法（微信小程序不兼容）
function barLevel(percent) {
  const p = Number(percent) || 0;
  if (p >= 85) return 'danger';
  if (p >= 60) return 'warn';
  return 'normal';
}

export default {
  data() {
    return {
      // 脱敏状态快照
      onlineServiceCount: 0,
      totalServiceCount: 0,
      uptimeDays: 0,
      totalBlockedAttempts: 0,
      fail2banEnabled: false,
      services: {},
      lastUpdateTime: 0,
      initializing: true,
      refreshTimer: null,
      // 服务器运行指标（全部脱敏，不含 IP/路径/版本/阈值）
      osUptimeDays: 0,      // 操作系统开机时长（天）
      cpuUsage: 0,          // CPU 使用率（0-100）
      memoryUsage: 0,       // 内存使用率（0-100）
      memoryUsedGB: 0,      // 已用内存（GB）
      memoryTotalGB: 0,     // 总内存（GB）
      diskUsage: 0,         // 根分区磁盘使用率（0-100）
      load1: 0,             // 1 分钟平均负载
      load5: 0,             // 5 分钟平均负载
      load15: 0,             // 15 分钟平均负载
    };
  },
  computed: {
    // 服务列表（服务名 -> 在线布尔 映射转为展示数组）
    serviceList() {
      const labelMap = {
        fail2ban: 'Fail2Ban 安全防护',
        tomcat: 'Tomcat 应用服务',
        jenkins: 'Jenkins 构建服务',
      };
      return Object.keys(this.services).map(name => ({
        name: labelMap[name] || name,
        online: !!this.services[name],
      }));
    },
    // 在线率百分比
    onlineRate() {
      if (!this.totalServiceCount) return 0;
      return Math.round((this.onlineServiceCount / this.totalServiceCount) * 100);
    },
    // "更新于 Xmin 前" 文案
    updateTimeText() {
      if (!this.lastUpdateTime) return '初始化中';
      const diff = Date.now() - this.lastUpdateTime;
      const min = Math.floor(diff / 60000);
      if (min < 1) return '刚刚';
      return `${min}min 前`;
    },
    // 进度条档位 class（computed，供模板 :class 直接引用，兼容微信小程序）
    // 微信模板不支持 :class="barLevel(cpuUsage)" 这种方法调用写法，故改为预计算属性
    cpuBarClass() { return barLevel(this.cpuUsage); },
    memoryBarClass() { return barLevel(this.memoryUsage); },
    diskBarClass() { return barLevel(this.diskUsage); },
    // 进度条宽度（computed，供模板 :style 直接引用，同样为兼容微信小程序）
    cpuBarWidth() { return barWidth(this.cpuUsage); },
    memoryBarWidth() { return barWidth(this.memoryUsage); },
    diskBarWidth() { return barWidth(this.diskUsage); },
  },
  onLoad() {
    this.fetchStatus();
    // 每 30 秒拉取一次缓存（后端 60 秒刷新一次，前端 30 秒轮询能尽快命中新缓存，开销极低）
    this.refreshTimer = setInterval(this.fetchStatus, 30000);
  },
  onUnload() {
    clearInterval(this.refreshTimer);
  },
  methods: {
    fetchStatus() {
      getPublicStatusOverview()
        .then(res => {
          // 成功响应 res 为 {msg, code, data}，业务数据在 data 中（request 拦截器约定）
          const data = res.data || {};
          this.totalServiceCount = Number(data.totalServiceCount) || 0;
          this.fail2banEnabled = !!data.fail2banEnabled;
          this.services = data.services || {};
          this.lastUpdateTime = Number(data.lastUpdateTime) || Date.now();
          // 服务器运行指标（保留 1 位小数的百分比直接赋值）
          this.osUptimeDays = Number(data.osUptimeDays) || 0;
          this.memoryUsedGB = Number(data.memoryUsedGB) || 0;
          this.memoryTotalGB = Number(data.memoryTotalGB) || 0;
          // 数值指标用滚动动画过渡到新值，与 FODCF vue-count-to 动效保持一致
          this.tweenNumber('onlineServiceCount', Number(data.onlineServiceCount) || 0);
          this.tweenNumber('uptimeDays', Number(data.uptimeDays) || 0);
          this.tweenNumber('totalBlockedAttempts', Number(data.totalBlockedAttempts) || 0);
          this.tweenNumber('cpuUsage', Number(data.cpuUsage) || 0);
          this.tweenNumber('memoryUsage', Number(data.memoryUsage) || 0);
          this.tweenNumber('diskUsage', Number(data.diskUsage) || 0);
          this.tweenNumber('load1', Number(data.load1) || 0);
          this.tweenNumber('load5', Number(data.load5) || 0);
          this.tweenNumber('load15', Number(data.load15) || 0);
          this.initializing = false;
        })
        .catch(() => {
          // 接口失败静默处理，保留上次数据，不暴露后端错误
          this.initializing = false;
        });
    },
    // 轻量数字滚动：从当前值平滑过渡到目标值，模拟 FODCF 的 vue-count-to 动效
    // uni-app 无 vue-count-to，这里用 requestAnimationFrame 自实现，duration 控制时长
    tweenNumber(key, target) {
      const from = Number(this[key]) || 0;
      if (from === target) {
        this[key] = target;
        return;
      }
      const duration = 800;
      const start = Date.now();
      const step = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart：先快后慢，收尾平稳
        const eased = 1 - Math.pow(1 - progress, 4);
        this[key] = Math.round(from + (target - from) * eased);
        if (progress < 1) {
          setTimeout(step, 16);
        }
      };
      step();
    },
  },
};
</script>

<style lang="scss" scoped>
$brand: #2ecc71;
$bg: #0e1117;
$card-bg: #161b22;
$text-main: #e6edf3;
$text-sub: #8b949e;
$offline: #f85149;

.status-page {
  min-height: 100vh;
  padding: 40rpx 30rpx;
  box-sizing: border-box;
  background: radial-gradient(circle at 20% 0%, #1a2233 0%, $bg 55%);
  color: $text-main;
}

// 顶部标题栏
.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 40rpx;
  animation: fade-down 0.5s ease both;

  .header-left {
    display: flex;
    align-items: center;

    .logo-dot {
      width: 20rpx;
      height: 20rpx;
      border-radius: 50%;
      background: $brand;
      box-shadow: 0 0 16rpx $brand;
      margin-right: 16rpx;
      // 与 FODCF 一致的呼吸脉冲，标识系统在线
      animation: pulse-dot 2s infinite;
    }

    .header-title {
      font-size: 36rpx;
      font-weight: 600;
    }
  }

  .update-time {
    font-size: 24rpx;
    color: $brand;
  }
}

// 概览卡片区
.overview-cards {
  margin-bottom: 40rpx;

  // 三张卡片依次淡入上浮，与 PC 端 hover 上浮呼应
  .overview-card {
    padding: 32rpx 28rpx;
    background: $card-bg;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    animation: fade-up 0.5s ease both;

    &:nth-child(1) { animation-delay: 0.05s; }
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.25s; }

    &.highlight {
      border-color: rgba(46, 204, 113, 0.15);
      background: linear-gradient(145deg, $card-bg, #13231a);
    }

    .card-label {
      font-size: 26rpx;
      color: $text-sub;
      display: block;
      margin-bottom: 20rpx;
    }

    .card-value {
      display: flex;
      align-items: baseline;

      .card-num {
        font-size: 64rpx;
        font-weight: 700;
        color: $text-main;
      }

      .card-unit {
        font-size: 28rpx;
        color: $text-sub;
        margin-left: 8rpx;
      }
    }

    .card-sub {
      font-size: 24rpx;
      color: $text-sub;
      display: block;
      margin-top: 16rpx;
    }
  }
}

// 服务列表
.service-section {
  padding: 32rpx 28rpx;
  background: $card-bg;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20rpx;
  margin-bottom: 40rpx;
  animation: fade-up 0.5s ease 0.3s both;

  .section-title {
    font-size: 26rpx;
    color: $text-sub;
    display: block;
    margin-bottom: 24rpx;
  }

  .service-item {
    display: flex;
    align-items: center;
    padding: 24rpx 20rpx;
    border-radius: 14rpx;
    background: rgba(255, 255, 255, 0.03);
    margin-bottom: 16rpx;

    .service-dot {
      width: 18rpx;
      height: 18rpx;
      border-radius: 50%;
      margin-right: 20rpx;

      &.online {
        background: $brand;
        // 在线服务点呼吸脉冲，与 FODCF 在线状态点动效一致
        animation: pulse-dot 2s infinite;
      }

      &.offline {
        background: $offline;
      }
    }

    .service-name {
      flex: 1;
      font-size: 28rpx;
    }

    .service-status {
      font-size: 26rpx;

      &.online {
        color: $brand;
      }

      &.offline {
        color: $offline;
      }
    }
  }
}

// 服务器资源占用（CPU/内存/磁盘 进度条）
.resource-section {
  padding: 32rpx 28rpx;
  background: $card-bg;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20rpx;
  margin-bottom: 40rpx;
  animation: fade-up 0.5s ease 0.35s both;

  .section-title {
    font-size: 26rpx;
    color: $text-sub;
    display: block;
    margin-bottom: 24rpx;
  }

  .resource-item {
    margin-bottom: 28rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .resource-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16rpx;

      .resource-name {
        font-size: 28rpx;
      }

      .resource-value {
        font-size: 28rpx;
        font-weight: 600;
      }
    }

    // 进度条底槽
    .bar {
      height: 14rpx;
      border-radius: 8rpx;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    // 进度条填充：宽度由内联 style 控制，颜色随档位变化
    .bar-inner {
      height: 100%;
      border-radius: 8rpx;
      transition: width 0.6s ease;

      &.normal {
        background: linear-gradient(90deg, $brand, #6ee7a8);
      }

      &.warn {
        background: linear-gradient(90deg, #e6a23c, #f3c267);
      }

      &.danger {
        background: linear-gradient(90deg, $offline, #ff7b72);
      }
    }

    .resource-sub {
      font-size: 22rpx;
      color: $text-sub;
      display: block;
      margin-top: 10rpx;
    }
  }
}

// 服务器负载与运行时长（三宫格）
.load-section {
  display: flex;
  align-items: stretch;
  margin-bottom: 40rpx;
  animation: fade-up 0.5s ease 0.4s both;

  .load-item {
    flex: 1;
    padding: 28rpx 12rpx;
    background: $card-bg;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20rpx;
    margin-right: 20rpx;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    &:last-child {
      margin-right: 0;
    }

    .load-value {
      font-size: 44rpx;
      font-weight: 700;
      color: $brand;
      margin-bottom: 10rpx;
    }

    .load-label {
      font-size: 22rpx;
      color: $text-sub;
    }
  }
}

// 能力摘要文案
.summary-text {
  text-align: center;
  font-size: 24rpx;
  color: $text-sub;
  line-height: 1.8;
  padding: 0 20rpx;
  animation: fade-up 0.5s ease 0.4s both;

  .summary-num {
    color: $brand;
    font-weight: 600;
  }
}

// 加载提示
.skeleton-tip {
  text-align: center;
  color: $text-sub;
  font-size: 26rpx;
  margin-top: 40rpx;
}

// 呼吸脉冲：在线标识点的扩散光晕
@keyframes pulse-dot {
  0% {
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.5);
  }

  70% {
    box-shadow: 0 0 0 12rpx rgba(46, 204, 113, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
  }
}

// 卡片入场：淡入上浮
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 标题栏入场：淡入下移
@keyframes fade-down {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
