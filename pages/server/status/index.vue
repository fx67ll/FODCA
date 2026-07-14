<template>
  <!-- 游客公开服务状态大盘（移动端精简版）：仅展示后端脱敏聚合数据 -->
  <view class="status-page">
    <view class="status-header">
      <view class="header-left">
        <view class="logo-dot"></view>
        <text class="header-title">fx67ll's 系统服务状态总览</text>
      </view>
      <!-- 更新时间 + 倒计时圆环：同一排，时间在前圆环在后，更符合移动端适配 -->
      <view class="header-right" :class="{ refreshing: refreshing }">
        <view class="update-time">
          <text class="update-label">数据更新于</text>
          <text class="update-value">{{ updateTimeText }}</text>
        </view>
        <view class="countdown-ring">
          <!-- 圆环用 conic-gradient 实现，兼容 H5 与微信小程序（不用 svg，小程序不支持原生 svg 标签） -->
          <view class="ring-progress" :style="ringStyle"></view>
          <view class="ring-inner"></view>
          <text class="ring-text">{{ countdownSeconds }}s</text>
        </view>
      </view>
    </view>

    <!-- 概览卡片区：前两张并排，累计拦截攻击单独占满一行 -->
    <view class="overview-cards">
      <view class="overview-row">
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
            <text class="card-num">{{ uptimeValue }}</text>
            <text class="card-unit">{{ uptimeUnit }}</text>
          </view>
          <text class="card-sub">应用进程持续运行</text>
        </view>
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

    <!-- 服务器负载与运行时长（脱敏，负载定性展示不暴露核数） -->
    <view class="load-section">
      <view class="load-item">
        <text class="load-value">{{ osUptimeDays }}</text>
        <text class="load-label">开机天数</text>
      </view>
      <view class="load-item">
        <text class="load-value" :class="load1Level">{{ load1Display }}</text>
        <text class="load-label">1min · {{ load1Text }}</text>
      </view>
      <view class="load-item">
        <text class="load-value" :class="load15Level">{{ load15Display }}</text>
        <text class="load-label">15min · {{ load15Text }}</text>
      </view>
    </view>

    <!-- 能力摘要文案 -->
    <view class="summary-text">
      本站由 fx67ll.com 提供运维与安全防护，已累计抵御
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
// 负载档位（基于绝对值定性，不依赖核数）：<0.5 空闲，<1.0 正常，<2.0 偏高，≥2.0 繁忙
function loadLevel(value) {
  const v = Number(value) || 0;
  if (v >= 2) return 'danger';
  if (v >= 1) return 'warn';
  return 'normal';
}
// 负载定性文案：让游客无需理解负载比也能看懂当前系统忙闲程度
function loadLevelText(value) {
  const v = Number(value) || 0;
  if (v >= 2) return '繁忙';
  if (v >= 1) return '偏高';
  if (v >= 0.5) return '正常';
  return '空闲';
}

export default {
  data() {
    return {
      // 脱敏状态快照
      onlineServiceCount: 0,
      totalServiceCount: 0,
      uptimeHours: 0,
      totalBlockedAttempts: 0,
      fail2banEnabled: false,
      services: {},
      lastUpdateTime: 0,
      initializing: true,
      refreshTimer: null,
      // 倒计时进度：基于前端拉取时刻计算，30 秒走满 100%，到顶触发刷新脉冲后归零
      countdownPercent: 0,
      // 是否处于"到顶刷新"动效中（进度条闪动 + 数据淡入）
      refreshing: false,
      // 拉取周期基准时刻（前端自己的 Date.now()，不依赖后端时间戳，避免时钟偏差导致瞬间走满）
      cycleStartTime: 0,
      countdownTimer: null,
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
    // 稳定运行时长：后端返回总小时数 uptimeHours，≥24 小时换算为天（保留 1 位小数），<24 小时直接显示小时（整数）。
    // uptimeHours 经 tweenNumber 整数滚动，展示层在这里换算，滚动动画作用于原始小时数。
    uptimeValue() {
      const hours = Number(this.uptimeHours) || 0;
      return hours >= 24 ? (Math.round((hours / 24) * 10) / 10).toFixed(1) : hours;
    },
    uptimeUnit() {
      return (Number(this.uptimeHours) || 0) >= 24 ? '天' : '小时';
    },
    // 距下次刷新的剩余秒数（圆环中心展示）
    countdownSeconds() {
      return Math.max(0, Math.ceil((100 - this.countdownPercent) / 100 * 60));
    },
    // 圆环进度：用 conic-gradient 表达百分比（computed，兼容微信小程序 :style，不用 svg）
    // 圆环进度：conic-gradient 按百分比填充品牌绿（#2ecc71 为 $brand 色值，JS 中无法用 scss 变量）
    ringStyle() {
      return `background: conic-gradient(#2ecc71 ${this.countdownPercent}%, rgba(255,255,255,0.08) 0);`;
    },
    // 更新时间点文案：完整中文日期 YYYY年M月D日 HH:mm:ss
    updateTimeText() {
      if (!this.lastUpdateTime) return '初始化中';
      const d = new Date(this.lastUpdateTime);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    // 负载档位 class 与定性文案（computed，供模板 :class / 文案直接引用，兼容微信小程序）
    load1Level() { return loadLevel(this.load1); },
    load15Level() { return loadLevel(this.load15); },
    load1Text() { return loadLevelText(this.load1); },
    load15Text() { return loadLevelText(this.load15); },
    // 负载展示文案：固定 2 位小数，避免空闲时显示 0 显得异常
    load1Display() { return Number(this.load1 || 0).toFixed(2); },
    load15Display() { return Number(this.load15 || 0).toFixed(2); },
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
    // 每 60 秒拉取一次缓存，与后端 60 秒采集周期对齐：圆环到顶 = 后端刚采集 = 数据必然更新
    this.refreshTimer = setInterval(this.fetchStatus, 60000);
    // 倒计时圆环：每秒推进，60 秒走满一圈，到顶触发刷新脉冲
    this.countdownTimer = setInterval(this.tickCountdown, 1000);
  },
  onUnload() {
    clearInterval(this.refreshTimer);
    clearInterval(this.countdownTimer);
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
          // 拉到新数据：更新展示时间戳，并以本次拉取时刻重置倒计时周期基准
          this.lastUpdateTime = Number(data.lastUpdateTime) || Date.now();
          this.cycleStartTime = Date.now();
          this.countdownPercent = 0;
          this.refreshing = true;
          // 刷新脉冲动效：短暂闪动后恢复，配合进度条归零重新走满
          setTimeout(() => { this.refreshing = false; }, 600);
          // 服务器运行指标（保留 1 位小数的百分比直接赋值）
          this.osUptimeDays = Number(data.osUptimeDays) || 0;
          this.memoryUsedGB = Number(data.memoryUsedGB) || 0;
          this.memoryTotalGB = Number(data.memoryTotalGB) || 0;
          // 数值指标用滚动动画过渡到新值，与 FODCF vue-count-to 动效保持一致
          this.tweenNumber('onlineServiceCount', Number(data.onlineServiceCount) || 0);
          this.tweenNumber('uptimeHours', Number(data.uptimeHours) || 0);
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
    // 倒计时进度：基于本次拉取时刻（前端 Date.now()）真实计算，60 秒走满 100%。
    // 与后端 60 秒采集周期对齐：到顶 = 后端刚采集 = 数据必然更新。
    // 不用后端 lastUpdateTime 作为基准，避免服务器/客户端时钟偏差导致一加载就瞬间走满
    tickCountdown() {
      if (!this.cycleStartTime || this.refreshing) return;
      const elapsed = Date.now() - this.cycleStartTime;
      const percent = Math.min(100, (elapsed / 60000) * 100);
      this.countdownPercent = percent;
      // 走到 100% 主动触发一次拉取（圆环到顶 = 刷新，语义清晰），并启动刷新脉冲
      if (percent >= 100 && !this.refreshing) {
        this.refreshing = true;
        this.fetchStatus();
      }
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
  gap: 16rpx;
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

  // 更新时间 + 倒计时圆环：同一排，时间在前圆环在后
  .header-right {
    flex-basis: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;

    .update-time {
      flex: 1;
      font-size: 24rpx;
      text-align: left;

      // "数据更新于" 标签用次级灰色，时间值用品牌绿，与 FODCF 配色一致
      .update-label {
        color: $text-sub;
        margin-right: 6rpx;
      }

      .update-value {
        color: $brand;
        font-variant-numeric: tabular-nums; // 等宽数字，秒数跳动不抖动
      }
    }

    // 倒计时圆环：conic-gradient 外环 + 内层空心圆 + 中心秒数，60 秒走满一圈
    .countdown-ring {
      position: relative;
      width: 80rpx;
      height: 80rpx;
      flex-shrink: 0;

      // 外环：conic-gradient 按百分比填充品牌绿，剩余为底色（内联 style 注入）。
      // 不加 transition：gradient 无法平滑过渡，每秒 countdownPercent 更新即重绘，肉眼可见圆环逐秒增长
      .ring-progress {
        position: absolute;
        inset: 0;
        border-radius: 50%;
      }

      // 内层空心圆：遮住外环中心，形成圆环效果（取页面渐变左上角相近色，避免色差突兀）
      .ring-inner {
        position: absolute;
        inset: 8rpx;
        border-radius: 50%;
        background: #141a26;
      }

      // 圆环中心：距下次刷新的剩余秒数
      .ring-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 22rpx;
        color: $brand;
        font-variant-numeric: tabular-nums;
        z-index: 1;
      }
    }

    // 到顶刷新脉冲：圆环 + 时间文字微微亮起，配合数据淡入
    &.refreshing {
      .ring-progress {
        animation: refresh-flash 0.6s ease;
      }

      .ring-text {
        animation: refresh-flash 0.6s ease;
      }

      .update-time {
        animation: refresh-flash 0.6s ease;
      }
    }
  }
}

// 刷新脉冲：闪动一下，表示数据已刷新
@keyframes refresh-flash {
  0% {
    filter: brightness(1);
  }

  40% {
    filter: brightness(1.8);
  }

  100% {
    filter: brightness(1);
  }
}

// 概览卡片区
.overview-cards {
  margin-bottom: 40rpx;

  // 前两张卡片并排容器
  .overview-row {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;

    .overview-card {
      flex: 1;
      margin-bottom: 0;
    }
  }

  // 卡片淡入上浮，与 PC 端 hover 上浮呼应
  .overview-card {
    padding: 32rpx 28rpx;
    background: $card-bg;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    animation: fade-up 0.5s ease both;

    // 前两张并排卡片依次入场，第三张整行稍后入场
    .overview-row &.overview-card:nth-child(1) { animation-delay: 0.05s; }
    .overview-row &.overview-card:nth-child(2) { animation-delay: 0.15s; }
    &.highlight { animation-delay: 0.25s; }

    &.highlight {
      border-color: rgba(46, 204, 113, 0.15);
      background: linear-gradient(145deg, $card-bg, #13231a);
      // 累计拦截攻击单独占满一行，强调展示，数字放大
      .card-num {
        font-size: 72rpx;
      }
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
      font-variant-numeric: tabular-nums; // 等宽数字，负载值刷新不抖动

      // 负载档位着色：空闲/正常用品牌绿，偏高用橙，繁忙用红
      &.warn {
        color: #e6a23c;
      }

      &.danger {
        color: $offline;
      }
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

<!-- H5 端全屏沉浸式：隐藏 uni-app 顶部导航栏，页面占满视口。
     仅 H5 构建生效（#ifdef H5 条件编译），微信/小程序端不受影响，保留标题栏。 -->
<!-- #ifdef H5 -->
<style lang="scss">
// 隐藏 H5 端 uni-app 自动生成的页面导航栏
uni-page .uni-page-head {
  display: none;
}

// 导航栏隐藏后，页面内容区上提占满整屏
uni-page .uni-page-wrapper,
uni-page .uni-page-body {
  height: 100%;
}
</style>
<!-- #endif -->
