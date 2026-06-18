<template>
    <view class="app-container">
        <!-- Fail2ban服务状态卡片（始终显示，异常状态显示上锁样式） -->
        <view class="status-card" :class="{ 'locked-card': isSystemLocked }">
            <!-- 上锁遮罩（优化：显示具体错误原因） -->
            <view v-if="isSystemLocked" class="lock-overlay">
                <view class="lock-icon" :class="lockIconClass">
                    <uni-icons type="lock" size="128rpx"></uni-icons>
                </view>
                <view class="lock-text">
                    <view class="lock-title">{{ serviceStatus }}</view>
                    <view class="lock-desc">{{ lockMessage }}</view>
                </view>
            </view>

            <view class="status-header">
                <text class="title">Fail2ban 防护状态</text>
                <view class="refresh-container">
                    <uni-icons type="refresh" size="32rpx" color="#409eff" @click="handleRefresh"
                        :class="{ 'rotate': isRefreshing }"></uni-icons>
                    <text class="refresh-time" v-if="lastRefreshTime">最后刷新: {{ lastRefreshTime }}</text>
                </view>
            </view>

            <view class="status-content">
                <view class="status-indicator">
                    <view class="indicator-dot"
                        :class="serviceStatus === '运行中' ? 'running' : serviceStatus === '系统不匹配' ? 'unknown' : serviceStatus === '未安装' ? 'unknown' : 'stopped'">
                    </view>
                    <text class="status-text">{{ serviceStatus }}</text>
                </view>

                <view class="service-info">
                    <view class="info-item">
                        <text class="info-label">版本号：</text>
                        <text class="info-value">{{ serviceInfo.version }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">运行时间：</text>
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
                    <view class="stat-value">{{ serviceInfo.totalJails }}</view>
                    <view class="stat-label">防护监狱</view>
                </view>
                <view class="stat-card">
                    <view class="stat-value">{{ serviceInfo.totalBannedIps }}</view>
                    <view class="stat-label">当前封禁IP</view>
                </view>
                <view class="stat-card">
                    <view class="stat-value">{{ serviceInfo.totalFailedAttempts }}</view>
                    <view class="stat-label">总攻击次数</view>
                </view>
            </view>
        </view>

        <!-- 以下所有卡片仅在系统正常时显示 -->
        <template v-if="!isSystemLocked">
            <!-- ==================== 监狱防护状态列表 ==================== -->
            <view class="status-card">
                <view class="status-header">
                    <text class="title">监狱防护状态</text>
                    <view class="filter-container">
                        <input v-model="jailFilter" placeholder="搜索监狱" class="search-input" />
                    </view>
                </view>

                <view class="jail-list">
                    <view class="jail-item" v-for="jail in paginatedJailList" :key="jail.name"
                        @click="openJailDetail(jail)">
                        <view class="jail-main">
                            <view class="jail-name">{{ jail.name }}</view>
                            <view class="jail-status-tag">
                                <text :class="jail.status === '运行中' ? 'tag-success' : 'tag-info'">{{ jail.status
                                    }}</text>
                            </view>
                            <view class="jail-stats">
                                <text class="stat">当前失败: {{ jail.currentlyFailed || 0 }}</text>
                                <text class="stat">当前封禁: {{ jail.currentlyBanned || 0 }}</text>
                                <text class="stat">累计封禁: {{ jail.totalBanned || 0 }}</text>
                                <text class="stat">失败尝试: {{ jail.totalFailed || 0 }}</text>
                            </view>
                        </view>
                        <uni-icons type="arrowright" size="28rpx" color="#c0c4cc"></uni-icons>
                    </view>
                </view>

                <!-- 监狱列表分页加载更多 -->
                <view class="load-more" @click="loadMoreJails" v-if="hasMoreJails">
                    <text>加载更多监狱</text>
                </view>
                <view class="no-more" v-else-if="filteredJailList.length > jailPageSize">
                    <text>没有更多监狱</text>
                </view>
            </view>

            <!-- ==================== 监狱详情弹窗（完整配置展示） ==================== -->
            <view class="jail-detail-mask" v-show="showJailDetail" @click="closeJailDetail"></view>
            <view class="jail-detail-popup" :class="{ 'show': showJailDetail }">
                <view class="popup-header">
                    <text class="popup-title">监狱详情 - {{ currentJailDetail.name || '' }}</text>
                    <uni-icons type="close" size="40rpx" color="#909399" @click="closeJailDetail"></uni-icons>
                </view>
                <view class="popup-content">
                    <view v-if="!isJailDetailLoading" class="jail-detail">
                        <!-- 监狱基本信息 -->
                        <view class="detail-section">
                            <text class="section-title">监狱基本信息</text>
                            <view class="detail-grid">
                                <view class="detail-item">
                                    <text class="detail-label">运行状态</text>
                                    <text class="detail-value"
                                        :class="currentJailDetail.status === '运行中' ? 'text-success' : ''">
                                        {{ currentJailDetail.status }}
                                    </text>
                                </view>
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
                                <view class="detail-item" style="grid-column: span 2;">
                                    <text class="detail-label">总失败尝试</text>
                                    <text class="detail-value">{{ currentJailDetail.totalFailed || '0' }}</text>
                                </view>
                                <view class="detail-item" style="grid-column: span 2;">
                                    <text class="detail-label">日志路径</text>
                                    <text class="detail-value">{{ currentJailDetail.logPath || '未知' }}</text>
                                </view>
                            </view>
                        </view>

                        <!-- 监狱只读配置信息 -->
                        <view class="detail-section">
                            <text class="section-title">监狱配置参数</text>
                            <view class="detail-grid">
                                <view class="detail-item">
                                    <text class="detail-label">封禁时长</text>
                                    <text class="detail-value">{{ currentJailDetail.config.bantime || '未知' }}</text>
                                </view>
                                <view class="detail-item">
                                    <text class="detail-label">检测窗口</text>
                                    <text class="detail-value">{{ currentJailDetail.config.findtime || '未知' }}</text>
                                </view>
                                <view class="detail-item">
                                    <text class="detail-label">最大重试次数</text>
                                    <text class="detail-value">
                                        {{ currentJailDetail.config.maxretry !== undefined ?
                                            `${currentJailDetail.config.maxretry}次` : '未知' }}
                                    </text>
                                </view>
                                <view class="detail-item">
                                    <text class="detail-label">白名单IP数量</text>
                                    <text class="detail-value">{{ currentJailDetail.config.ignoreIpList.length
                                        }} 个</text>
                                </view>
                                <view class="detail-item" style="grid-column: span 2;">
                                    <text class="detail-label">监狱白名单</text>
                                    <view class="ip-tag-wrap">
                                        <text class="ip-tag info-tag"
                                            v-for="ip in currentJailDetail.config.ignoreIpList" :key="ip">
                                            {{ ip }}
                                        </text>
                                        <text v-if="!currentJailDetail.config.ignoreIpList.length"
                                            style="color: #909399;font-size:24rpx;">
                                            无白名单配置
                                        </text>
                                    </view>
                                </view>
                            </view>
                        </view>

                        <!-- 封禁IP列表区域 -->
                        <view class="detail-section">
                            <view class="section-header">
                                <text class="section-title">当前被封禁IP ({{ currentJailDetail.bannedIps.length
                                    }})</text>
                                <view class="ip-actions">
                                    <button class="btn btn-primary btn-small"
                                        @click="copyAllIps(currentJailDetail.bannedIps)"
                                        :disabled="!currentJailDetail.bannedIps.length">
                                        复制全部
                                    </button>
                                </view>
                            </view>

                            <view class="banned-ips">
                                <view class="ip-tag ip-tag-danger" v-for="ip in currentJailDetail.bannedIps" :key="ip">
                                    <text class="ip-text">{{ ip }}</text>
                                    <uni-icons type="copy" size="24rpx" color="#fff"
                                        @click.stop="copySingleIp(ip)"></uni-icons>
                                </view>
                                <view v-if="!currentJailDetail.bannedIps.length" class="empty-text">
                                    暂无被封禁的IP
                                </view>
                            </view>
                        </view>
                    </view>
                    <view v-else class="loading-text">
                        {{ loadingText }}
                    </view>
                </view>
            </view>

            <!-- 最近24小时攻击趋势卡片（原生柱状条，超阈值标红） -->
            <view class="status-card">
                <view class="status-header">
                    <text class="title">最近24小时攻击趋势</text>
                    <view class="trend-stats">
                        <text class="stat-item">总攻击：{{ totalTrendAttacks }} 次</text>
                        <text class="stat-item">峰值：{{ maxTrendCount }} 次/小时</text>
                    </view>
                </view>
                <view class="trend-list">
                    <view class="trend-item" v-for="(item, index) in trendData" :key="index">
                        <text class="trend-hour">{{ item.dateTime }}</text>
                        <view class="trend-bar">
                            <view class="trend-fill" :class="item.isOverThreshold ? 'fill-danger' : 'fill-primary'"
                                :style="{ width: Math.min(item.count * 2, 100) + '%' }"></view>
                        </view>
                        <text class="trend-count">{{ item.count }} 次</text>
                    </view>
                </view>
            </view>

            <!-- 攻击来源统计卡片 -->
            <view class="status-card">
                <view class="status-header">
                    <text class="title">攻击来源统计 (Top {{ topIpLimit }})</text>
                    <view class="filter-container">
                        <picker :range="topIpOptions" range-key="label" @change="onTopIpLimitChange">
                            <text class="picker-text">Top{{ topIpLimit }}</text>
                        </picker>
                        <picker :range="statsLogLineOptions" range-key="label" @change="onStatsLogLineChange">
                            <text class="picker-text">{{ currentStatsLogLine.label }}</text>
                        </picker>
                        <button class="btn btn-primary btn-small" @click="copyAllTopIps"
                            :disabled="topAttackIps.length === 0">
                            复制全部
                        </button>
                    </view>
                </view>

                <view class="ip-list">
                    <view class="ip-item" v-for="(item, index) in topAttackIpsWithClass.slice(0, topIpLimit)"
                        :key="index">
                        <view class="ip-rank">{{ index + 1 }}</view>
                        <view class="ip-info">
                            <text class="ip-address">{{ item.ip }}</text>
                            <view class="jail-tag-wrap">
                                <text class="ip-jail-tag info-tag" v-for="jail in item.jailList" :key="jail">
                                    {{ jail }}
                                </text>
                                <text v-if="!item.jailList.length" style="color:#909399;font-size:22rpx;">未知</text>
                            </view>
                            <text class="ip-count">攻击 {{ item.count }} 次</text>
                        </view>
                        <view class="ip-threat" :class="item.threatClass">
                            {{ item.threatText }}
                        </view>
                        <uni-icons type="copy" size="32rpx" color="#409eff" @click="copySingleIp(item.ip)"></uni-icons>
                    </view>
                </view>
            </view>

            <!-- 全量封禁IP列表卡片 -->
            <view class="status-card">
                <view class="status-header">
                    <text class="title">全量封禁IP列表 (共 {{ allBannedIps.length }} 个)</text>
                    <view class="status-header-btn">
                        <button class="btn btn-primary btn-small" @click="copyAllBannedIps"
                            :disabled="allBannedIps.length === 0">
                            复制全部封禁IP
                        </button>
                    </view>
                </view>

                <view class="all-banned-ips">
                    <view class="ip-tag ip-tag-danger" v-for="ip in paginatedBannedIps" :key="ip">
                        <text class="ip-text">{{ ip }}</text>
                        <uni-icons type="copy" size="24rpx" color="#fff" @click.stop="copySingleIp(ip)"></uni-icons>
                    </view>
                    <view v-if="allBannedIps.length === 0" class="empty-text">
                        暂无被封禁的IP
                    </view>
                </view>

                <!-- 全量IP加载更多 -->
                <view class="load-more" @click="loadMoreIps" v-if="hasMoreIps">
                    <text>加载更多</text>
                </view>
                <view class="no-more" v-else-if="allBannedIps.length > ipPageSize">
                    <text>没有更多了</text>
                </view>
            </view>

            <!-- 最近攻击日志卡片 -->
            <view class="status-card">
                <view class="status-header">
                    <text class="title">最近攻击日志</text>
                    <view class="filter-container">
                        <picker :range="logLevelOptions" range-key="label" @change="onLogLevelChange">
                            <text class="picker-text">{{ currentLogLevel.label }}</text>
                        </picker>
                        <picker :range="jailNameOptions" range-key="label" @change="onLogJailChange">
                            <text class="picker-text">{{ currentLogJail.label }}</text>
                        </picker>
                        <picker :range="logLimitOptions" range-key="label" @change="onLogLimitChange">
                            <text class="picker-text">{{ currentLogLimit.label }}</text>
                        </picker>
                        <uni-icons type="refresh" size="32rpx" color="#409eff" @click="refreshLogs"
                            :class="{ 'rotate': isLoadingLogs }"></uni-icons>
                        <text class="refresh-time" v-if="logLastRefreshTime">日志刷新: {{ logLastRefreshTime }}</text>
                    </view>
                </view>

                <view class="log-container">
                    <template v-if="paginatedLogsWithClass.length > 0">
                        <view class="log-item" v-for="(log, index) in paginatedLogsWithClass" :key="index"
                            :class="log.logClass">
                            <view class="log-header">
                                <text class="log-time">{{ log.date }} {{ log.time }}</text>
                                <text class="log-level">[{{ log.level }}]</text>
                            </view>
                            <text class="log-message">{{ log.message }}</text>
                            <view class="log-actions" v-if="log.ip">
                                <uni-icons type="copy" size="28rpx" color="#409eff"
                                    @click="copySingleIp(log.ip)"></uni-icons>
                            </view>
                        </view>
                    </template>
                    <view v-else class="empty-text">
                        暂无符合条件的日志
                    </view>
                </view>

                <!-- 日志加载更多 -->
                <view class="load-more" @click="loadMoreLogs" v-if="hasMoreLogs">
                    <text>加载更多</text>
                </view>
                <view class="no-more" v-else-if="filteredLogs.length > logPageSize">
                    <text>没有更多了</text>
                </view>
            </view>
        </template>
    </view>
</template>

<script>
// 导入所有Fail2ban相关API
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

            // ==================== 监狱管理 ====================
            jailList: [],
            jailFilter: "",
            jailCurrentPage: 1,
            jailPageSize: 5,

            // ==================== 弹窗控制 ====================
            showJailDetail: false,
            // 初始化完整默认结构，避免属性访问报错
            currentJailDetail: {
                name: '',
                status: "",
                currentlyFailed: 0,
                currentlyBanned: 0,
                totalBanned: 0,
                totalFailed: 0,
                logPath: '',
                config: {
                    bantime: '',
                    findtime: '',
                    maxretry: undefined,
                    ignoreIpList: []
                },
                bannedIps: []
            },
            isJailDetailLoading: false,
            loadingText: "加载中...",
            jailDetailTimeout: null,

            // ==================== 攻击统计 ====================
            topAttackIps: [],
            trendData: [],
            maxTrendCount: 1,
            totalTrendAttacks: 0,
            baselineMaxRetry: 5,
            statsLogLines: 10000,
            topIpLimit: 20,
            topIpOptions: [
                { label: "Top10", value: 10 },
                { label: "Top20", value: 20 },
                { label: "Top50", value: 50 },
                { label: "Top100", value: 100 }
            ],
            statsLogLineOptions: [
                { label: "最近5千行", value: 5000 },
                { label: "最近1万行", value: 10000 },
                { label: "最近5万行", value: 50000 },
                { label: "最近10万行", value: 100000 }
            ],
            currentStatsLogLine: { label: "最近1万行", value: 10000 },

            // ==================== 全量封禁IP ====================
            allBannedIps: [],
            ipCurrentPage: 1,
            ipPageSize: 100,

            // ==================== 日志管理 ====================
            recentLogs: [],
            logLevelFilter: "",
            logJailFilter: "",
            logLimit: 200,
            logCurrentPage: 1,
            logPageSize: 50,
            logLastRefreshTime: "",
            logLevelOptions: [
                { label: "全部", value: "" },
                { label: "ERROR", value: "ERROR" },
                { label: "WARN", value: "WARN" },
                { label: "INFO", value: "INFO" }
            ],
            currentLogLevel: { label: "全部", value: "" },
            jailNameOptions: [
                { label: "全部", value: "" }
            ],
            currentLogJail: { label: "全部", value: "" },
            logLimitOptions: [
                { label: "50条", value: 50 },
                { label: "100条", value: 100 },
                { label: "200条", value: 200 },
                { label: "500条", value: 500 },
                { label: "1000条", value: 1000 }
            ],
            currentLogLimit: { label: "200条", value: 200 },

            // ==================== 加载状态 ====================
            isRefreshing: false,
            isLoadingLogs: false,

            // ==================== 其他 ====================
            lastRefreshTime: "",
            refreshInterval: null
        };
    },
    computed: {
        filteredJailList() {
            let list = this.jailList;
            if (this.jailFilter) {
                list = list.filter(jail =>
                    jail.name.toLowerCase().includes(this.jailFilter.toLowerCase())
                );
            }
            return [...list].sort((a, b) => {
                if (a.status === '运行中' && b.status !== '运行中') return -1;
                if (a.status !== '运行中' && b.status === '运行中') return 1;
                return 0;
            });
        },

        paginatedJailList() {
            const end = this.jailCurrentPage * this.jailPageSize;
            return this.filteredJailList.slice(0, end);
        },

        hasMoreJails() {
            return this.jailCurrentPage * this.jailPageSize < this.filteredJailList.length;
        },

        filteredLogs() {
            let logs = this.recentLogs;
            if (this.logLevelFilter) {
                logs = logs.filter(log => log.level === this.logLevelFilter);
            }
            if (this.logJailFilter) {
                logs = logs.filter(log => log.message.includes("[" + this.logJailFilter + "]"));
            }
            return logs;
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

        lockIconClass() {
            if (this.serviceStatus === "系统不匹配") {
                return "warning-icon";
            } else if (this.serviceStatus === "未安装") {
                return "info-icon";
            }
            return "";
        },

        topAttackIpsWithClass() {
            return this.topAttackIps.map(item => {
                // 在计算属性中拆分监狱列表，避免模板中split报错
                const jailList = item.jails ? item.jails.split(', ') : [];
                return {
                    ...item,
                    jailList,
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
    watch: {
        jailFilter() {
            this.jailCurrentPage = 1;
        },
        jailList(val) {
            this.jailNameOptions = [{ label: "全部", value: "" }];
            val.forEach(jail => {
                this.jailNameOptions.push({ label: jail.name, value: jail.name })
            })
        }
    },
    onLoad() {
        this.loadAllData();
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
                await this.loadServiceStatus();
                if (!this.isSystemLocked) {
                    await Promise.all([
                        this.loadJailList(),
                        this.loadAttackStats(),
                        this.loadRecentLogs(),
                        this.loadAllBannedIps()
                    ]);
                }
                const now = this.formatDateTime(new Date());
                this.lastRefreshTime = now;
                this.logLastRefreshTime = now;
            } catch (error) {
                console.error("加载数据失败：", error);
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
            if (this.isSystemLocked) return;
            if (this.isLoadingLogs) return;
            this.isLoadingLogs = true;
            this.loadRecentLogs().finally(() => {
                this.isLoadingLogs = false;
                this.logLastRefreshTime = this.formatDateTime(new Date());
            });
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
                this.jailCurrentPage = 1;
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

                const avgCount = entries.length ? (entries.reduce((sum, [, c]) => sum + c, 0) / entries.length) : 0;
                const threshold = avgCount * 2;

                this.trendData = entries.map(([hour, count], index) => {
                    const date = new Date(now.getTime() - (23 - index) * 60 * 60 * 1000);
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return {
                        dateTime: `${month}-${day} ${hour}`,
                        count,
                        isOverThreshold: count > threshold
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
                Object.values(bannedIpsByJail).forEach(ips => {
                    ips.forEach(ip => allIps.add(ip));
                });
                this.allBannedIps = Array.from(allIps);
                this.ipCurrentPage = 1;
            } catch (e) {
                console.error("加载全量封禁IP失败:", e);
                this.allBannedIps = [];
            }
        },

        async loadRecentLogs() {
            try {
                const response = await getRecentLogs({
                    limit: this.logLimit,
                    level: this.logLevelFilter,
                    jail: this.logJailFilter
                });
                this.recentLogs = response.data || [];
                this.logCurrentPage = 1;
            } catch (e) {
                console.error("加载日志失败:", e);
                this.recentLogs = [];
            }
        },

        async openJailDetail(row) {
            if (this.isJailDetailLoading) return;

            this.isJailDetailLoading = true;
            this.loadingText = "加载中...";
            // 重置为默认结构
            this.currentJailDetail = {
                name: row.name,
                status: "",
                currentlyFailed: 0,
                currentlyBanned: 0,
                totalBanned: 0,
                totalFailed: 0,
                logPath: '',
                config: {
                    bantime: '',
                    findtime: '',
                    maxretry: undefined,
                    ignoreIpList: []
                },
                bannedIps: []
            };
            this.showJailDetail = true;

            this.jailDetailTimeout = setTimeout(() => {
                this.loadingText = "请求超时，请重试";
                this.isJailDetailLoading = false;
            }, 10000);

            try {
                const res = await getJailDetail(row.name);
                const data = res.data || {};
                // 合并数据，保证config结构完整
                this.currentJailDetail = {
                    ...data,
                    config: {
                        bantime: data.config?.bantime || '',
                        findtime: data.config?.findtime || '',
                        maxretry: data.config?.maxretry,
                        ignoreIpList: data.config?.ignoreIpList || []
                    },
                    bannedIps: data.bannedIps || []
                };
            } catch (err) {
                console.error("获取监狱详情失败：", err);
                this.loadingText = "加载失败，请重试";
                uni.showToast({
                    title: "获取详情失败",
                    icon: "none",
                    duration: 2000
                });
            } finally {
                if (this.jailDetailTimeout) {
                    clearTimeout(this.jailDetailTimeout);
                    this.jailDetailTimeout = null;
                }
                this.isJailDetailLoading = false;
            }
        },

        closeJailDetail() {
            this.showJailDetail = false;
            if (this.jailDetailTimeout) {
                clearTimeout(this.jailDetailTimeout);
                this.jailDetailTimeout = null;
            }
            setTimeout(() => {
                this.currentJailDetail = {
                    name: '',
                    status: "",
                    currentlyFailed: 0,
                    currentlyBanned: 0,
                    totalBanned: 0,
                    totalFailed: 0,
                    logPath: '',
                    config: {
                        bantime: '',
                        findtime: '',
                        maxretry: undefined,
                        ignoreIpList: []
                    },
                    bannedIps: []
                };
                this.loadingText = "加载中...";
            }, 300);
        },

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
            return this.copyAllIps(ips);
        },

        copyAllBannedIps() {
            return this.copyAllIps(this.allBannedIps);
        },

        loadMoreJails() {
            this.jailCurrentPage++;
        },
        loadMoreIps() {
            this.ipCurrentPage++;
        },
        loadMoreLogs() {
            this.logCurrentPage++;
        },

        onTopIpLimitChange(e) {
            this.topIpLimit = this.topIpOptions[e.detail.value].value;
            this.loadAttackStats();
        },
        onStatsLogLineChange(e) {
            this.currentStatsLogLine = this.statsLogLineOptions[e.detail.value];
            this.statsLogLines = this.currentStatsLogLine.value;
            this.loadAttackStats();
        },
        onLogLevelChange(e) {
            this.currentLogLevel = this.logLevelOptions[e.detail.value];
            this.logLevelFilter = this.currentLogLevel.value;
            this.loadRecentLogs();
        },
        onLogJailChange(e) {
            this.currentLogJail = this.jailNameOptions[e.detail.value];
            this.logJailFilter = this.currentLogJail.value;
            this.loadRecentLogs();
        },
        onLogLimitChange(e) {
            this.currentLogLimit = this.logLimitOptions[e.detail.value];
            this.logLimit = this.currentLogLimit.value;
            this.loadRecentLogs();
        },

        getThreatClass(count) {
            const base = this.baselineMaxRetry;
            if (count >= base * 10) return "threat-high";
            if (count >= base * 5) return "threat-medium";
            if (count >= base * 2) return "threat-normal";
            return "threat-low";
        },

        getThreatLevelText(count) {
            const base = this.baselineMaxRetry;
            if (count >= base * 10) return "极高危";
            if (count >= base * 5) return "高危";
            if (count >= base * 2) return "中危";
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
.app-container {
    padding: 30rpx;
    background-color: #f5f5f5;
    min-height: 100vh;
}

/* ==================== 全局卡片样式 ==================== */
.status-card {
    background-color: #fff;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    padding: 40rpx 30rpx;
    margin-bottom: 30rpx;
    position: relative;
    transition: all 0.3s ease;
}

/* ==================== 上锁状态卡片样式 ==================== */
.locked-card {
    filter: grayscale(50%);
    opacity: 0.9;
}

.lock-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.lock-icon {
    color: #909399;
    margin-bottom: 20rpx;
}

.lock-icon.warning-icon {
    color: #e6a23c;
}

.lock-icon.info-icon {
    color: #409eff;
}

.lock-text {
    text-align: center;
    line-height: 1.6;
    max-width: 80%;
}

.lock-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8rpx;
}

.lock-desc {
    font-size: 28rpx;
    color: #606266;
}

.status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
}

.status-header-btn {
    display: flex;
    justify-content: flex-end;
}

.title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1f2d3d;
}

.refresh-container {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.filter-container {
    display: flex;
    align-items: center;
    gap: 20rpx;
    flex-wrap: wrap;
}

.search-input {
    width: 320rpx;
    height: 60rpx;
    padding: 0 16rpx;
    border: 1rpx solid #e4e7ed;
    border-radius: 8rpx;
    font-size: 24rpx;
}

.picker-text {
    font-size: 24rpx;
    color: #409eff;
    padding: 8rpx 16rpx;
    background-color: #e6f4ff;
    border-radius: 8rpx;
}

.refresh-time {
    font-size: 22rpx;
    color: #8392a5;
}

/* 刷新按钮旋转动画 */
.rotate {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* ==================== 状态指示器 ==================== */
.status-content {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    flex-wrap: wrap;
}

.status-indicator {
    display: flex;
    align-items: center;
    margin-right: 40rpx;
    margin-bottom: 30rpx;
}

.indicator-dot {
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    transition: all 0.3s ease;
}

.indicator-dot.running {
    background-color: #52c41a;
    box-shadow: 0 0 16rpx rgba(82, 196, 26, 0.4);
}

.indicator-dot.stopped {
    background-color: #f5222d;
    box-shadow: 0 0 16rpx rgba(245, 34, 45, 0.4);
}

.indicator-dot.unknown {
    background-color: #909399;
    box-shadow: 0 0 16rpx rgba(144, 147, 153, 0.4);
}

.status-text {
    font-size: 44rpx;
    font-weight: 500;
    color: #1f2d3d;
}

.service-info {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-left: 40rpx;
}

.info-item {
    font-size: 26rpx;
}

.info-label {
    color: #8392a5;
}

.info-value {
    color: #1f2d3d;
    font-weight: 500;
}

.text-success {
    color: #52c41a !important;
}

.text-danger {
    color: #f5222d !important;
}

/* ==================== 统计卡片网格 ==================== */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
    margin-top: 40rpx;
}

.stat-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    text-align: center;
}

.stat-value {
    font-size: 56rpx;
    font-weight: 700;
    color: #409eff;
    margin-bottom: 10rpx;
    margin-right: 4rpx;
}

.stat-label {
    font-size: 24rpx;
    color: #8392a5;
}

/* ==================== 趋势统计样式 ==================== */
.trend-stats {
    display: flex;
    gap: 20rpx;
    align-items: center;
}

.trend-stats .stat-item {
    font-size: 26rpx;
    color: #303133;
}

/* 攻击趋势 */
.trend-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 20rpx;
}

.trend-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
}

.trend-hour {
    width: 160rpx;
    font-size: 24rpx;
    color: #8392a5;
}

.trend-bar {
    flex: 1;
    height: 24rpx;
    background-color: #e6e6e6;
    border-radius: 12rpx;
    margin: 0 20rpx;
    overflow: hidden;
}

.trend-fill {
    height: 100%;
    border-radius: 12rpx;
    transition: width 0.3s ease;
}

.fill-primary {
    background: linear-gradient(0deg, #66b1ff, #409eff);
}

.fill-danger {
    background: linear-gradient(0deg, #f78989, #f56c6c);
}

.trend-count {
    width: 120rpx;
    text-align: right;
    font-size: 24rpx;
    font-weight: 500;
    color: #1f2d3d;
}

/* 监狱列表 */
.jail-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.jail-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background-color: #f8f9fa;
    border-radius: 16rpx;
    transition: all 0.3s;
}

.jail-item:active {
    background-color: #e9ecef;
}

.jail-main {
    flex: 1;
}

.jail-name {
    font-size: 32rpx;
    font-weight: 500;
    color: #1f2d3d;
    margin-bottom: 12rpx;
}

.jail-status-tag {
    margin-bottom: 12rpx;
}

.tag-success {
    font-size: 22rpx;
    padding: 4rpx 12rpx;
    background-color: #f0f9eb;
    color: #67c23a;
    border-radius: 6rpx;
}

.tag-info {
    font-size: 22rpx;
    padding: 4rpx 12rpx;
    background-color: #ecf5ff;
    color: #409eff;
    border-radius: 6rpx;
}

.jail-stats {
    display: flex;
    gap: 30rpx;
    font-size: 24rpx;
    color: #8392a5;
    flex-wrap: wrap;
}

/* 监狱详情弹窗样式 */
.jail-detail-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.jail-detail-mask[style*='display: block'] {
    opacity: 1;
}

.jail-detail-popup {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border-top-left-radius: 32rpx;
    border-top-right-radius: 32rpx;
    height: 80vh;
    display: flex;
    flex-direction: column;
    z-index: 1000;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.jail-detail-popup.show {
    transform: translateY(0);
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 40rpx;
    border-bottom: 1rpx solid #f5f5f5;
    flex-shrink: 0;
}

.popup-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1f2d3d;
}

.popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 40rpx;
    -webkit-overflow-scrolling: touch;
    position: relative;
}

.popup-content .loading-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    margin: 0;
    padding: 0;
}

.jail-detail {
    width: 100%;
}

.detail-section {
    margin-bottom: 50rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: 500;
    color: #1f2d3d;
    margin-bottom: 24rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #409eff;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 20rpx;
    background-color: #f8f9fa;
    border-radius: 16rpx;
}

.detail-label {
    font-size: 24rpx;
    color: #8392a5;
}

.detail-value {
    font-size: 28rpx;
    font-weight: 500;
    color: #1f2d3d;
    word-break: break-all;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
}

.ip-actions {
    display: flex;
    gap: 16rpx;
}

.btn {
    padding: 8rpx 24rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    border: none;
    line-height: 1.2;
}

.btn-primary {
    background-color: #409eff;
    color: #fff;
}

.btn-small {
    padding: 4rpx 16rpx;
    font-size: 22rpx;
}

.ip-tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 8rpx;
}

.ip-tag {
    display: inline-flex;
    align-items: center;
    gap: 12rpx;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #fff;
}

.ip-tag-danger {
    background-color: #f56c6c;
}

.info-tag {
    background-color: #ecf5ff;
    color: #409eff;
    padding: 4rpx 12rpx;
    font-size: 22rpx;
}

.ip-text {
    max-width: 240rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.banned-ips {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.loading-text {
    text-align: center;
    padding: 80rpx;
    color: #8392a5;
    font-size: 28rpx;
    white-space: pre-line;
}

/* 攻击来源列表 */
.ip-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.ip-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background-color: #f8f9fa;
    border-radius: 16rpx;
}

.ip-rank {
    width: 48rpx;
    height: 48rpx;
    line-height: 48rpx;
    text-align: center;
    background-color: #409eff;
    color: #fff;
    border-radius: 50%;
    font-size: 24rpx;
    font-weight: 500;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.ip-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    min-width: 0;
}

.ip-address {
    font-size: 28rpx;
    font-weight: 500;
    color: #1f2d3d;
}

.jail-tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6rpx;
}

.ip-jail-tag {
    font-size: 20rpx;
    padding: 2rpx 8rpx;
    border-radius: 4rpx;
}

.ip-count {
    font-size: 24rpx;
    color: #8392a5;
}

.ip-threat {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-size: 22rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.threat-high {
    background-color: #fef0f0;
    color: #f56c6c;
}

.threat-medium {
    background-color: #fdf6ec;
    color: #e6a23c;
}

.threat-normal {
    background-color: #f4f4f5;
    color: #909399;
}

.threat-low {
    background-color: #e6f4ff;
    color: #409eff;
}

/* 全量封禁IP */
.all-banned-ips {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 30rpx;
}

/* 日志容器 */
.log-container {
    background-color: #1f2d3d;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 30rpx;
}

.log-item {
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #304156;
}

.log-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.log-header {
    display: flex;
    gap: 20rpx;
    margin-bottom: 12rpx;
}

.log-time {
    font-size: 22rpx;
    color: #8392a5;
}

.log-level {
    font-size: 22rpx;
    font-weight: 500;
}

.log-message {
    font-size: 24rpx;
    line-height: 1.5;
    word-break: break-all;
}

.log-actions {
    text-align: right;
    margin-top: 12rpx;
}

.log-error .log-message {
    color: #ff4d4f;
}

.log-error .log-level {
    color: #ff4d4f;
}

.log-warn .log-message {
    color: #faad14;
}

.log-warn .log-level {
    color: #faad14;
}

.log-info .log-message {
    color: #52c41a;
}

.log-info .log-level {
    color: #52c41a;
}

.log-debug .log-message {
    color: #8392a5;
}

.log-debug .log-level {
    color: #8392a5;
}

/* 加载更多 */
.load-more {
    text-align: center;
    padding: 24rpx;
    color: #409eff;
    font-size: 26rpx;
    background-color: #e6f4ff;
    border-radius: 16rpx;
}

.no-more {
    text-align: center;
    padding: 24rpx;
    color: #8392a5;
    font-size: 26rpx;
}

.empty-text {
    text-align: center;
    padding: 40rpx;
    color: #8392a5;
    font-size: 26rpx;
}

/* 响应式适配 */
@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .status-content {
        flex-direction: column;
        align-items: flex-start;
    }

    .service-info {
        flex-direction: column;
        gap: 10rpx;
        margin-left: 0;
        margin-top: 15rpx;
    }

    .filter-container {
        flex-wrap: wrap;
        margin-top: 10rpx;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10rpx;
    }

    .ip-actions {
        width: 100%;
        justify-content: flex-start;
    }

    .trend-stats {
        margin-top: 10rpx;
    }
}
</style>
