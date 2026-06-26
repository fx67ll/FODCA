<template>
    <view class="app-container">
        <!-- Fail2ban服务状态卡片（始终显示，异常状态显示上锁样式） -->
        <view class="status-card" :class="{ 'locked-card': isSystemLocked }">
            <!-- 上锁遮罩 -->
            <view v-if="isSystemLocked" class="lock-overlay">
                <view class="lock-icon" :class="lockIconClass">
                    <uni-icons type="lock" size="128rpx"></uni-icons>
                </view>
                <view class="lock-text">
                    <view class="lock-title">{{ serviceStatus }}</view>
                    <view class="lock-desc">{{ lockMessage }}</view>
                </view>
            </view>

            <!-- 卡片头部 -->
            <view class="status-header">
                <text class="title">Fail2ban 防护状态</text>
                <view class="header-actions">
                    <text class="refresh-time" v-if="lastRefreshTime">最后刷新: {{ lastRefreshTime }}</text>
                    <view class="refresh-pill" :class="{ 'is-loading': isRefreshing }" @click="handleRefresh">
                        <view v-if="isRefreshing" class="pill-spinner"></view>
                        <uni-icons v-else type="refresh" size="26rpx" color="#409eff"></uni-icons>
                        <text class="refresh-pill-text">{{ isRefreshing ? '刷新中' : '刷新' }}</text>
                    </view>
                </view>
            </view>

            <!-- 状态内容区 + 统计卡片（刷新时显示加载遮罩） -->
            <view class="status-body">
                <view class="status-content">
                    <view class="status-indicator">
                        <view class="indicator-dot"
                            :class="serviceStatus === '运行中' ? 'running' : serviceStatus === '系统不匹配' ? 'unknown' : serviceStatus === '未安装' ? 'unknown' : 'stopped'">
                        </view>
                        <text class="status-text">{{ serviceStatus }}</text>
                    </view>

                    <view class="service-info">
                        <view class="info-item">
                            <text class="info-label">版本号</text>
                            <text class="info-value">{{ serviceInfo.version }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">防火墙状态</text>
                            <text class="info-value"
                                :class="serviceInfo.firewallStatus.startsWith('运行中') ? 'text-success' : 'text-danger'">
                                {{ serviceInfo.firewallStatus }}
                            </text>
                        </view>
                        <view class="info-item info-item-full">
                            <text class="info-label">运行时间</text>
                            <text class="info-value">{{ serviceInfo.uptime }}</text>
                        </view>
                    </view>
                </view>

                <!-- 统计卡片 -->
                <view class="stats-grid">
                    <view class="stat-card">
                        <view class="stat-value">{{ serviceInfo.totalJails }}</view>
                        <view class="stat-label">防护监狱</view>
                    </view>
                    <view class="stat-card">
                        <view class="stat-value">{{ serviceInfo.totalBannedIps }}</view>
                        <view class="stat-label">当前封禁IP</view>
                    </view>
                    <view class="stat-card stat-card-full">
                        <view class="stat-value">{{ serviceInfo.totalFailedAttempts }}</view>
                        <view class="stat-label">总攻击次数</view>
                    </view>
                </view>

                <!-- 刷新加载遮罩 -->
                <view v-if="isRefreshing" class="refresh-loading-mask">
                    <view class="loading-spinner"></view>
                    <text class="loading-text">刷新中...</text>
                </view>
            </view>
        </view>

        <!-- 以下所有卡片仅在系统正常时显示 -->
        <template v-if="!isSystemLocked">
            <jail-status-panel :jail-list="jailList" />

            <attack-trend-panel :trend-data="trendData" :max-trend-count="maxTrendCount"
                :total-trend-attacks="totalTrendAttacks" :baseline-max-retry="baselineMaxRetry" />

            <attack-stats-panel :top-attack-ips="topAttackIps" :baseline-max-retry="baselineMaxRetry"
                @stats-change="onStatsChange" />

            <banned-ip-list :all-banned-ips="allBannedIps" />

            <recent-logs-panel :jail-list="jailList" ref="recentLogsPanel" />
        </template>

        <!-- 悬浮刷新按钮：向下滚动后出现，刷新当前数据但不改变浏览位置 -->
        <view class="fab-refresh" :class="{ 'show': showFab, 'is-loading': isRefreshing }" @click="handleRefresh">
            <view v-if="isRefreshing" class="fab-spinner"></view>
            <uni-icons v-else type="refresh" size="44rpx" color="#fff"></uni-icons>
        </view>
    </view>
</template>

<script>
import {
    getFail2banStatus,
    getJailList,
    getAttackStats,
    getAllBannedIps
} from "@/api/fx67ll/server/fail2ban";

import JailStatusPanel from "./component/JailStatusPanel.vue";
import AttackTrendPanel from "./component/AttackTrendPanel.vue";
import AttackStatsPanel from "./component/AttackStatsPanel.vue";
import BannedIpList from "./component/BannedIpList.vue";
import RecentLogsPanel from "./component/RecentLogsPanel.vue";

export default {
    name: "Fail2banManager",
    components: {
        JailStatusPanel,
        AttackTrendPanel,
        AttackStatsPanel,
        BannedIpList,
        RecentLogsPanel
    },
    data() {
        return {
            // ==================== 系统检测状态 ====================
            isSystemLocked: false,
            lockMessage: "",

            // ==================== 服务状态 ====================
            serviceStatus: "加载中...",
            serviceInfo: {
                version: "未知",
                totalJails: 0,
                totalBannedIps: 0,
                totalFailedAttempts: 0,
                uptime: "未知",
                firewallStatus: "未知"
            },

            // ==================== 监狱列表 ====================
            jailList: [],

            // ==================== 攻击统计 ====================
            topAttackIps: [],
            trendData: [],
            maxTrendCount: 1,
            totalTrendAttacks: 0,
            trendThreshold: 0,
            baselineMaxRetry: 5,
            statsLogLines: 10000,
            topIpLimit: 3,

            // ==================== 全量封禁IP ====================
            allBannedIps: [],

            // ==================== 加载状态 ====================
            isRefreshing: false,

            // ==================== 其他 ====================
            lastRefreshTime: "",
            showFab: false
        };
    },
    computed: {
        lockIconClass() {
            if (this.serviceStatus === "系统不匹配") return "warning-icon";
            if (this.serviceStatus === "未安装") return "info-icon";
            return "";
        }
    },
    onLoad() {
        this.loadAllData();
    },
    onPageScroll(e) {
        // 仅在跨越阈值时切换，避免每次滚动都触发响应式更新
        const shouldShow = e.scrollTop > 400;
        if (shouldShow !== this.showFab) this.showFab = shouldShow;
    },
    methods: {
        async loadAllData() {
            try {
                await this.loadServiceStatus();
                if (!this.isSystemLocked) {
                    await Promise.all([
                        this.loadJailList(),
                        this.loadAttackStats(),
                        this.loadAllBannedIps()
                    ]);
                    this.$nextTick(() => {
                        if (this.$refs.recentLogsPanel) {
                            this.$refs.recentLogsPanel.refresh(this.formatDateTime(new Date()));
                        }
                    });
                }
                this.lastRefreshTime = this.formatDateTime(new Date());
            } catch (error) {
                console.error("加载数据失败：", error);
                uni.showToast({ title: "加载数据失败", icon: "none", duration: 2000 });
            }
        },

        handleRefresh() {
            if (this.isRefreshing) return;
            this.isRefreshing = true;
            this.loadAllData().finally(() => { this.isRefreshing = false; });
        },

        async loadServiceStatus() {
            try {
                const response = await getFail2banStatus();
                const data = response.data || {};
                this.serviceStatus = data.status || "未知";
                this.serviceInfo = data;
                if (data.status === "系统不匹配" || data.status === "未安装") {
                    this.isSystemLocked = true;
                    this.lockMessage = data.error || "该功能不可用";
                } else {
                    this.isSystemLocked = false;
                    this.lockMessage = "";
                }
            } catch (e) {
                console.error("加载服务状态失败:", e);
                this.serviceStatus = "加载失败";
                this.isSystemLocked = true;
                this.lockMessage = "服务状态获取异常";
            }
        },

        async loadJailList() {
            try {
                const response = await getJailList();
                this.jailList = response.data || [];
            } catch (e) {
                console.error("加载监狱列表失败:", e);
                this.jailList = [];
            }
        },

        async loadAttackStats() {
            try {
                const response = await getAttackStats({
                    logLines: this.statsLogLines,
                    topIpLimit: this.topIpLimit
                });
                this.topAttackIps = response.data.topAttackIps || [];
                this.baselineMaxRetry = response.data.baselineMaxRetry || 5;

                const trend = response.data.hourlyTrend || {};
                const now = new Date();
                const entries = Object.entries(trend);

                const counts = entries.map(([, data]) => (typeof data === 'object' ? data.count || 0 : data || 0));
                const avgCount = counts.length ? counts.reduce((sum, c) => sum + c, 0) / counts.length : 0;
                this.trendThreshold = avgCount * 2;

                this.trendData = entries.map(([hour, data], index) => {
                    const date = new Date(now.getTime() - (23 - index) * 60 * 60 * 1000);
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const count = typeof data === 'object' ? (data.count || 0) : (data || 0);
                    const topIps = typeof data === 'object' ? (data.topIps || []) : [];
                    return {
                        dateTime: `${month}-${day} ${hour}`,
                        count,
                        topIps,
                        isOverThreshold: count > this.trendThreshold
                    };
                }).reverse();

                const countArr = this.trendData.map(item => item.count);
                this.maxTrendCount = countArr.length ? Math.max(...countArr) : 1;
                this.totalTrendAttacks = countArr.reduce((sum, item) => sum + item, 0);
            } catch (e) {
                console.error("加载攻击统计失败:", e);
                this.topAttackIps = [];
                this.trendData = [];
            }
        },

        async loadAllBannedIps() {
            try {
                const response = await getAllBannedIps();
                const data = response.data || {};
                const bannedIpsByJail = data.bannedIpsByJail || {};
                const allIps = new Set();
                Object.values(bannedIpsByJail).forEach(ips => { ips.forEach(ip => allIps.add(ip)); });
                this.allBannedIps = Array.from(allIps);
            } catch (e) {
                console.error("加载全量封禁IP失败:", e);
                this.allBannedIps = [];
            }
        },

        onStatsChange({ topIpLimit, statsLogLines }) {
            this.topIpLimit = topIpLimit;
            this.statsLogLines = statsLogLines;
            this.loadAttackStats();
        },

        formatDateTime(date) {
            const year = date.getFullYear();
            const month = this.padZero(date.getMonth() + 1);
            const day = this.padZero(date.getDate());
            const hour = this.padZero(date.getHours());
            const minute = this.padZero(date.getMinutes());
            const second = this.padZero(date.getSeconds());
            return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        },

        padZero(num) {
            return num < 10 ? `0${num}` : num;
        }
    }
};
</script>

<style lang="less" scoped>
@import './index.less';
</style>
