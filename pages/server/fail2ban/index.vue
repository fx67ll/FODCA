<template>
    <view class="app-container">
        <!-- Fail2ban服务状态卡片 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">Fail2ban 防护状态</text>
                <view class="refresh-container">
                    <uni-icons type="refresh" size="32rpx" color="#409eff" @click="handleRefresh"
                        :class="{ 'rotate': isRefreshing }"></uni-icons>
                    <text class="refresh-time" v-if="lastRefreshTime">{{ lastRefreshTime }}</text>
                </view>
            </view>

            <view class="status-content">
                <view class="status-indicator">
                    <view class="indicator-dot" :class="serviceStatus === '运行中' ? 'running' : 'stopped'"></view>
                    <text class="status-text">{{ serviceStatus }}</text>
                </view>

                <view class="service-info">
                    <view class="info-item">
                        <text class="info-label">版本：</text>
                        <text class="info-value">{{ serviceInfo.version }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">运行：</text>
                        <text class="info-value">{{ serviceInfo.uptime }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">防火墙：</text>
                        <text class="info-value"
                            :class="serviceInfo.firewallStatus.startsWith('运行中') ? 'text-success' : 'text-danger'">
                            {{ serviceInfo.firewallStatus }}
                        </text>
                    </view>
                </view>
            </view>

            <view class="stats-grid">
                <view class="stat-card">
                    <text class="stat-value">{{ serviceInfo.totalJails }}</text>
                    <text class="stat-label">防护监狱</text>
                </view>
                <view class="stat-card">
                    <text class="stat-value">{{ serviceInfo.totalBannedIps }}</text>
                    <text class="stat-label">当前封禁</text>
                </view>
                <view class="stat-card">
                    <text class="stat-value">{{ serviceInfo.totalFailedAttempts }}</text>
                    <text class="stat-label">总攻击数</text>
                </view>
            </view>
        </view>

        <!-- 最近24小时攻击趋势 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">最近24小时攻击趋势</text>
            </view>
            <view class="trend-list">
                <view class="trend-item" v-for="(item, index) in trendData" :key="index">
                    <text class="trend-hour">{{ item.hour }}</text>
                    <view class="trend-bar">
                        <view class="trend-fill" :style="{ width: Math.min(item.count * 2, 100) + '%' }"></view>
                    </view>
                    <text class="trend-count">{{ item.count }} 次</text>
                </view>
            </view>
        </view>

        <!-- 监狱防护状态 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">监狱防护状态</text>
            </view>

            <view class="jail-list">
                <view class="jail-item" v-for="jail in jailList" :key="jail.name" @click="openJailDetail(jail)">
                    <view class="jail-main">
                        <view class="jail-name">{{ jail.name }}</view>
                        <view class="jail-stats">
                            <text class="stat">失败: {{ jail.currentlyFailed || 0 }}</text>
                            <text class="stat">封禁: {{ jail.currentlyBanned || 0 }}</text>
                            <text class="stat">累计: {{ jail.totalBanned || 0 }}</text>
                        </view>
                    </view>
                    <uni-icons type="arrowright" size="28rpx" color="#c0c4cc"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 攻击来源Top 10 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">攻击来源 Top 10</text>
                <view class="status-header-btn">
                    <button class="btn btn-primary btn-small" @click="copyAllTopIps"
                        :disabled="topAttackIps.length === 0">
                        复制全部
                    </button>
                </view>
            </view>

            <view class="ip-list">
                <view class="ip-item" v-for="(item, index) in topAttackIpsWithClass.slice(0, 10)" :key="index">
                    <view class="ip-rank">{{ index + 1 }}</view>
                    <view class="ip-info">
                        <text class="ip-address">{{ item.ip }}</text>
                        <text class="ip-count">攻击 {{ item.count }} 次</text>
                    </view>
                    <view class="ip-threat" :class="item.threatClass">
                        {{ item.threatText }}
                    </view>
                    <uni-icons type="copy" size="32rpx" color="#409eff" @click="copySingleIp(item.ip)"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 全量封禁IP列表 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">全量封禁IP (共 {{ allBannedIps.length }} 个)</text>
                <view class="status-header-btn">
                    <button class="btn btn-primary btn-small" @click="copyAllBannedIps"
                        :disabled="allBannedIps.length === 0">
                        复制全部
                    </button>
                </view>
            </view>

            <view class="all-banned-ips">
                <view class="ip-tag ip-tag-danger" v-for="ip in paginatedBannedIps" :key="ip">
                    <text class="ip-text">{{ ip }}</text>
                    <uni-icons type="copy" size="24rpx" color="#fff" @click.stop="copySingleIp(ip)"></uni-icons>
                </view>
                <view v-if="allBannedIps.length === 0" class="empty-text">
                    暂无被封禁IP
                </view>
            </view>

            <view class="load-more" @click="loadMoreIps" v-if="hasMoreIps">
                <text>加载更多</text>
            </view>
            <view class="no-more" v-else-if="allBannedIps.length > ipPageSize">
                <text>没有更多了</text>
            </view>
        </view>

        <!-- 最近攻击日志 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">最近攻击日志</text>
                <view class="filter-container">
                    <picker :range="logLimitOptions" range-key="label" @change="onLogLimitChange">
                        <text class="picker-text">{{ currentLogLimit.label }}</text>
                    </picker>
                    <uni-icons type="refresh" size="32rpx" color="#409eff" @click="refreshLogs"
                        :class="{ 'rotate': isLoadingLogs }"></uni-icons>
                    <text class="refresh-time" v-if="logLastRefreshTime">{{ logLastRefreshTime }}</text>
                </view>
            </view>

            <view class="log-container">
                <view class="log-item" v-for="(log, index) in paginatedLogsWithClass" :key="index" :class="log.logClass"
                    v-if="paginatedLogsWithClass.length > 0">
                    <view class="log-header">
                        <text class="log-time">{{ log.time }}</text>
                        <text class="log-level">[{{ log.level }}]</text>
                    </view>
                    <text class="log-message">{{ log.message }}</text>
                    <view class="log-actions" v-if="log.ip">
                        <uni-icons type="copy" size="28rpx" color="#409eff" @click="copySingleIp(log.ip)"></uni-icons>
                    </view>
                </view>
                <view v-if="paginatedLogsWithClass.length === 0" class="empty-text">
                    暂无攻击日志
                </view>
            </view>

            <view class="load-more" @click="loadMoreLogs" v-if="hasMoreLogs">
                <text>加载更多</text>
            </view>
            <view class="no-more" v-else-if="filteredLogs.length > logPageSize">
                <text>没有更多了</text>
            </view>
        </view>

        <!-- 监狱详情弹窗（适配新后端） -->
        <view class="jail-detail-mask" v-show="showJailDetail" @click="closeJailDetail"></view>
        <view class="jail-detail-popup" :class="{ 'show': showJailDetail }">
            <view class="popup-header">
                <text class="popup-title">{{ currentJailDetail.name || '监狱详情' }}</text>
                <uni-icons type="close" size="40rpx" color="#909399" @click="closeJailDetail"></uni-icons>
            </view>
            <view class="popup-content">
                <view v-if="!isJailDetailLoading" class="jail-detail">
                    <view class="detail-section">
                        <text class="section-title">防护统计</text>
                        <view class="detail-grid">
                            <view class="detail-item">
                                <text class="detail-label">当前失败</text>
                                <text class="detail-value">{{ currentJailDetail.currentlyFailed || '0' }}</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">当前封禁</text>
                                <text class="detail-value">{{ currentJailDetail.currentlyBanned || '0' }}</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">累计封禁</text>
                                <text class="detail-value">{{ currentJailDetail.totalBanned || '0' }}</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">总失败尝试</text>
                                <text class="detail-value">{{ currentJailDetail.totalFailed || '0' }}</text>
                            </view>
                            <view class="detail-item" style="grid-column: span 2;">
                                <text class="detail-label">日志路径</text>
                                <text class="detail-value">{{ currentJailDetail.logPath || '未知' }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="detail-section">
                        <view class="section-header">
                            <text class="section-title">当前被封禁IP ({{ currentJailDetail.bannedIps.length || 0 }})</text>
                            <view class="ip-actions">
                                <button class="btn btn-primary btn-small"
                                    @click="copyAllIps(currentJailDetail.bannedIps)"
                                    :disabled="currentJailDetail.bannedIps.length === 0">
                                    复制全部
                                </button>
                            </view>
                        </view>

                        <view class="banned-ips">
                            <view class="ip-tag" v-for="ip in currentJailDetail.bannedIps" :key="ip">
                                <text class="ip-text">{{ ip }}</text>
                                <uni-icons type="copy" size="24rpx" color="#fff"
                                    @click.stop="copySingleIp(ip)"></uni-icons>
                            </view>
                            <view v-if="currentJailDetail.bannedIps.length === 0" class="empty-text">
                                暂无被封禁IP
                            </view>
                        </view>
                    </view>
                </view>
                <view v-else class="loading-text">
                    {{ loadingText }}
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import {
    getFail2banStatus,
    getJailList,
    getJailDetail,
    getRecentLogs,
    getAttackStats,
    getAllBannedIps
} from "@/api/fx67ll/server/fail2ban";

export default {
    name: "Fail2banManager",
    data() {
        return {
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

            // ==================== 监狱管理 ====================
            jailList: [],
            currentJailDetail: {
                name: '',
                currentlyFailed: 0,
                currentlyBanned: 0,
                totalBanned: 0,
                totalFailed: 0,
                logPath: '',
                bannedIps: []
            },
            isJailDetailLoading: false,
            showJailDetail: false,
            loadingText: "加载中...",
            jailDetailTimeout: null, // 超时定时器

            // ==================== 攻击统计 ====================
            topAttackIps: [],
            trendData: [],

            // ==================== 全量封禁IP ====================
            allBannedIps: [],
            ipCurrentPage: 1,
            ipPageSize: 50,

            // ==================== 日志管理 ====================
            recentLogs: [],
            logLimit: 200,
            logCurrentPage: 1,
            logPageSize: 20,
            logLimitOptions: [
                { label: "50条", value: 50 },
                { label: "100条", value: 100 },
                { label: "200条", value: 200 },
                { label: "500条", value: 500 },
                { label: "1000条", value: 1000 }
            ],
            currentLogLimit: { label: "200条", value: 200 },
            logLastRefreshTime: "",

            // ==================== 加载状态 ====================
            isRefreshing: false,
            isLoadingLogs: false,

            // ==================== 其他 ====================
            lastRefreshTime: "",
            refreshInterval: null
        };
    },
    computed: {
        filteredLogs() {
            return this.recentLogs;
        },

        paginatedLogs() {
            const end = this.logCurrentPage * this.logPageSize;
            return this.filteredLogs.slice(0, end);
        },

        paginatedBannedIps() {
            const end = this.ipCurrentPage * this.ipPageSize;
            return this.allBannedIps.slice(0, end);
        },

        hasMoreIps() {
            return this.ipCurrentPage * this.ipPageSize < this.allBannedIps.length;
        },

        hasMoreLogs() {
            return this.logCurrentPage * this.logPageSize < this.filteredLogs.length;
        },

        topAttackIpsWithClass() {
            return this.topAttackIps.map(item => {
                return {
                    ...item,
                    threatClass: this.getThreatClass(item.count),
                    threatText: this.getThreatLevelText(item.count)
                }
            })
        },

        paginatedLogsWithClass() {
            return this.paginatedLogs.map(log => {
                return {
                    ...log,
                    logClass: this.getLogClass(log.level)
                }
            })
        }
    },
    onLoad() {
        this.loadAllData();
        // 与后端缓存TTL保持一致
        this.refreshInterval = setInterval(() => {
            this.loadAllData();
        }, 30000);
    },
    onUnload() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (this.jailDetailTimeout) {
            clearTimeout(this.jailDetailTimeout);
        }
    },
    methods: {
        async loadAllData() {
            try {
                await Promise.all([
                    this.loadServiceStatus(),
                    this.loadJailList(),
                    this.loadAttackStats(),
                    this.loadRecentLogs(),
                    this.loadAllBannedIps()
                ]);
                const now = this.formatDateTime(new Date());
                this.lastRefreshTime = now;
                this.logLastRefreshTime = now;
            } catch (error) {
                console.error("全局数据加载失败:", error);
                uni.showToast({
                    title: "加载数据失败",
                    icon: "none",
                    duration: 2000
                });
            }
        },

        handleRefresh() {
            if (this.isRefreshing) return;
            this.isRefreshing = true;
            this.loadAllData().finally(() => {
                this.isRefreshing = false;
            });
        },

        refreshLogs() {
            if (this.isLoadingLogs) return;
            this.isLoadingLogs = true;
            this.loadRecentLogs().finally(() => {
                this.isLoadingLogs = false;
                this.logLastRefreshTime = this.formatDateTime(new Date());
            });
        },

        onLogLimitChange(e) {
            this.currentLogLimit = this.logLimitOptions[e.detail.value];
            this.logLimit = this.currentLogLimit.value;
            this.loadRecentLogs().then(() => {
                this.logLastRefreshTime = this.formatDateTime(new Date());
            });
        },

        async loadServiceStatus() {
            try {
                const response = await getFail2banStatus();
                const data = response.data || {};
                this.serviceStatus = data.status || "未知";
                this.serviceInfo = data;
            } catch (error) {
                console.error("加载服务状态失败:", error);
            }
        },

        async loadJailList() {
            try {
                const response = await getJailList();
                this.jailList = response.data || [];
            } catch (error) {
                console.error("加载监狱列表失败:", error);
            }
        },

        async loadAttackStats() {
            try {
                const response = await getAttackStats();
                this.topAttackIps = response.data.topAttackIps || [];
                const trend = response.data.hourlyTrend || {};
                this.trendData = Object.entries(trend).map(([hour, count]) => ({
                    hour,
                    count
                }));
            } catch (error) {
                console.error("加载攻击统计失败:", error);
            }
        },

        async loadAllBannedIps() {
            try {
                const response = await getAllBannedIps();
                const data = response.data || {};
                const bannedIpsByJail = data.bannedIpsByJail || {};
                const allIps = new Set();
                Object.values(bannedIpsByJail).forEach(ips => {
                    ips.forEach(ip => allIps.add(ip));
                });
                this.allBannedIps = Array.from(allIps);
                this.ipCurrentPage = 1;
            } catch (error) {
                console.error("加载全量封禁IP失败:", error);
            }
        },

        async loadRecentLogs() {
            try {
                const response = await getRecentLogs({
                    limit: this.logLimit
                });
                this.recentLogs = response.data || [];
                this.logCurrentPage = 1;
            } catch (error) {
                console.error("加载日志失败:", error);
            }
        },

        /**
         * 打开监狱详情弹窗（适配新后端）
         */
        async openJailDetail(jail) {
            // 防重复点击
            if (this.isJailDetailLoading) {
                return;
            }

            // 重置状态
            this.isJailDetailLoading = true;
            this.loadingText = "加载中...";
            this.currentJailDetail = {
                name: jail.name,
                currentlyFailed: 0,
                currentlyBanned: 0,
                totalBanned: 0,
                totalFailed: 0,
                logPath: '',
                bannedIps: []
            };
            this.showJailDetail = true;

            // 10秒超时保护
            this.jailDetailTimeout = setTimeout(() => {
                this.loadingText = "请求超时，请重试";
                this.isJailDetailLoading = false;
            }, 10000);

            try {
                const response = await getJailDetail(jail.name);
                let data = response.data || response;

                // 数据兼容性处理
                if (!data.bannedIps) data.bannedIps = [];

                this.currentJailDetail = data;
            } catch (error) {
                console.error("获取监狱详情失败:", error);
                this.loadingText = "加载失败，请重试";
                uni.showToast({
                    title: "获取详情失败",
                    icon: "none",
                    duration: 2000
                });
            } finally {
                // 强制清除超时定时器
                if (this.jailDetailTimeout) {
                    clearTimeout(this.jailDetailTimeout);
                    this.jailDetailTimeout = null;
                }
                this.isJailDetailLoading = false;
            }
        },

        closeJailDetail() {
            this.showJailDetail = false;
            // 关闭时清除超时定时器
            if (this.jailDetailTimeout) {
                clearTimeout(this.jailDetailTimeout);
                this.jailDetailTimeout = null;
            }
            // 延迟清空数据
            setTimeout(() => {
                this.currentJailDetail = {
                    name: '',
                    currentlyFailed: 0,
                    currentlyBanned: 0,
                    totalBanned: 0,
                    totalFailed: 0,
                    logPath: '',
                    bannedIps: []
                };
                this.loadingText = "加载中...";
            }, 300);
        },

        // ==================== IP复制功能 ====================
        copySingleIp(ip) {
            uni.setClipboardData({
                data: ip,
                success: () => {
                    uni.showToast({
                        title: `已复制IP: ${ip}`,
                        icon: "success"
                    });
                }
            });
        },

        copyAllIps(ips) {
            if (!ips || ips.length === 0) {
                uni.showToast({
                    title: "没有可复制的IP",
                    icon: "none"
                });
                return;
            }
            const ipText = ips.join("\n");
            uni.setClipboardData({
                data: ipText,
                success: () => {
                    uni.showToast({
                        title: `已复制 ${ips.length} 个IP`,
                        icon: "success"
                    });
                }
            });
        },

        copyAllTopIps() {
            const ips = this.topAttackIps.map(item => item.ip);
            this.copyAllIps(ips);
        },

        copyAllBannedIps() {
            this.copyAllIps(this.allBannedIps);
        },

        // ==================== 加载更多功能 ====================
        loadMoreIps() {
            this.ipCurrentPage++;
        },

        loadMoreLogs() {
            this.logCurrentPage++;
        },

        // ==================== 工具方法 ====================
        getThreatClass(count) {
            if (count > 200) return "threat-high";
            if (count > 100) return "threat-medium";
            return "threat-low";
        },

        getThreatLevelText(count) {
            if (count > 200) return "极高危";
            if (count > 100) return "高危";
            if (count > 50) return "中危";
            return "低危";
        },

        getLogClass(level) {
            const classMap = {
                "ERROR": "log-error",
                "WARN": "log-warn",
                "INFO": "log-info",
                "DEBUG": "log-debug"
            };
            return classMap[level] || "log-info";
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
@import url("./index.less");
</style>
