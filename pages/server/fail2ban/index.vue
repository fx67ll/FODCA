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

            <!-- 卡片头部：标题独占一行，操作区换行居右 -->
            <view class="status-header">
                <text class="title">Fail2ban 防护状态</text>
                <view class="header-actions">
                    <view class="refresh-container">
                        <text class="refresh-time" v-if="lastRefreshTime">最后刷新: {{ lastRefreshTime }}</text>
                        <uni-icons type="refresh" size="36rpx" color="#409eff" @click="handleRefresh"
                            :class="{ 'rotate': isRefreshing }"></uni-icons>
                    </view>
                </view>
            </view>

            <!-- 状态内容区：移动端纵向排布，信息更清晰 -->
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

            <!-- 统计卡片：移动端默认2列，更宽松易读 -->
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
        </view>

        <!-- 以下所有卡片仅在系统正常时显示 -->
        <template v-if="!isSystemLocked">
            <!-- ==================== 监狱防护状态列表 ==================== -->
            <view class="status-card">
                <view class="status-header">
                    <text class="title">监狱防护状态</text>
                    <!-- <view class="header-actions">
                        <input v-model="jailFilter" placeholder="搜索监狱名称" class="search-input" />
                    </view> -->
                </view>

                <view class="jail-list">
                    <view class="jail-item" v-for="jail in paginatedJailList" :key="jail.name"
                        @click="openJailDetail(jail)">
                        <view class="jail-main">
                            <view class="jail-header">
                                <view class="jail-name">{{ jail.name }}</view>
                                <view class="jail-status-tag">
                                    <text :class="jail.status === '运行中' ? 'tag-success' : 'tag-info'">{{ jail.status
                                    }}</text>
                                </view>
                            </view>
                            <view class="jail-stats">
                                <view class="jail-stat-item">
                                    <text class="stat-num">{{ jail.currentlyFailed || 0 }}</text>
                                    <text class="stat-label">当前失败</text>
                                </view>
                                <view class="jail-stat-item">
                                    <text class="stat-num">{{ jail.currentlyBanned || 0 }}</text>
                                    <text class="stat-label">当前封禁</text>
                                </view>
                                <view class="jail-stat-item">
                                    <text class="stat-num">{{ jail.totalBanned || 0 }}</text>
                                    <text class="stat-label">累计封禁</text>
                                </view>
                                <view class="jail-stat-item">
                                    <text class="stat-num">{{ jail.totalFailed || 0 }}</text>
                                    <text class="stat-label">失败尝试</text>
                                </view>
                            </view>
                        </view>
                        <uni-icons type="arrowright" size="32rpx" color="#c0c4cc"></uni-icons>
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
                <!-- 移动端弹窗顶部拖拽条，提升交互体验 -->
                <view class="popup-drag-bar"></view>
                <view class="popup-header">
                    <text class="popup-title">监狱详情 - {{ currentJailDetail.name || '' }}</text>
                    <uni-icons type="close" size="44rpx" color="#909399" @click="closeJailDetail"></uni-icons>
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
                            <view class="picker-btn">
                                <text class="picker-text">Top{{ topIpLimit }}</text>
                            </view>
                        </picker>
                        <picker :range="statsLogLineOptions" range-key="label" @change="onStatsLogLineChange">
                            <view class="picker-btn">
                                <text class="picker-text">{{ currentStatsLogLine.label }}</text>
                            </view>
                        </picker>
                        <!-- <button class="btn btn-primary btn-small" @click="copyAllTopIps"
                            :disabled="topAttackIps.length === 0">
                            复制全部
                        </button> -->
                    </view>
                </view>

                <view class="ip-list">
                    <view class="ip-item" v-for="(item, index) in topAttackIpsWithClass.slice(0, topIpLimit)"
                        :key="index">
                        <view class="ip-rank" :class="index < 3 ? 'rank-top' : ''">{{ index + 1 }}</view>
                        <view class="ip-info">
                            <view class="ip-top-row">
                                <text class="ip-address">{{ item.ip }}</text>
                                <view class="ip-threat" :class="item.threatClass">
                                    {{ item.threatText }}
                                </view>
                            </view>
                            <view class="jail-tag-wrap">
                                <text class="ip-jail-tag info-tag" v-for="jail in item.jailList" :key="jail">
                                    {{ jail }}
                                </text>
                                <text v-if="!item.jailList.length" style="color:#909399;font-size:22rpx;">未知监狱</text>
                            </view>
                            <text class="ip-count">攻击 {{ item.count }} 次</text>
                        </view>
                        <view class="ip-copy-btn">
                            <uni-icons type="copy" size="32rpx" color="#409eff"
                                @click="copySingleIp(item.ip)"></uni-icons>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 全量封禁IP列表卡片 -->
            <view class="status-card">
                <view class="status-header">
                    <text class="title">全量封禁IP列表</text>
                    <view class="header-actions">
                        <text class="header-sub">共 {{ allBannedIps.length }} 个</text>
                        <!-- <button class="btn btn-primary btn-small" @click="copyAllBannedIps"
                            :disabled="allBannedIps.length === 0">
                            复制全部
                        </button> -->
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
                            <view class="picker-btn">
                                <text class="picker-text">{{ currentLogLevel.label }}</text>
                            </view>
                        </picker>
                        <picker :range="jailNameOptions" range-key="label" @change="onLogJailChange">
                            <view class="picker-btn">
                                <text class="picker-text">{{ currentLogJail.label }}</text>
                            </view>
                        </picker>
                        <picker :range="logLimitOptions" range-key="label" @change="onLogLimitChange">
                            <view class="picker-btn">
                                <text class="picker-text">{{ currentLogLimit.label }}</text>
                            </view>
                        </picker>
                        <view class="log-refresh-box">
                            <text class="refresh-time" v-if="logLastRefreshTime">{{ logLastRefreshTime }}</text>
                            <uni-icons type="refresh" size="32rpx" color="#409eff" @click="refreshLogs"
                                :class="{ 'rotate': isLoadingLogs }"></uni-icons>
                        </view>
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
        // jailFilter() {
        //     this.jailCurrentPage = 1;
        // },
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

        // copyAllTopIps() {
        //     const ips = this.topAttackIps.map(item => item.ip);
        //     return this.copyAllIps(ips);
        // },

        // copyAllBannedIps() {
        //     return this.copyAllIps(this.allBannedIps);
        // },

        // loadMoreJails() {
        //     this.jailCurrentPage++;
        // },
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
/* ==================== 全局容器 ==================== */
.app-container {
    padding: 24rpx;
    background-color: #f5f7fa;
    min-height: 100vh;
    box-sizing: border-box;
    padding-bottom: 40rpx;
}

/* ==================== 全局卡片样式 ==================== */
.status-card {
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
    padding: 32rpx 28rpx;
    margin-bottom: 24rpx;
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
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.lock-icon {
    color: #909399;
    margin-bottom: 32rpx;
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
    font-size: 38rpx;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12rpx;
}

.lock-desc {
    font-size: 26rpx;
    color: #606266;
}

/* ==================== 卡片头部（移动端上下布局） ==================== */
.status-header {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f2f5;
    gap: 20rpx;
}

.header-actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-sub {
    font-size: 24rpx;
    color: #909399;
}

.status-header-btn {
    width: 100%;
    display: flex;
    justify-content: flex-end;
}

.title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1f2d3d;
}

/* ==================== 刷新与筛选容器 ==================== */
.refresh-container {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.log-refresh-box {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-left: auto;
}

.filter-container {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex-wrap: wrap;
}

/* 搜索框样式优化 */
.search-input {
    width: 100%;
    height: 72rpx;
    padding: 0 24rpx;
    border: 1rpx solid #e4e7ed;
    border-radius: 12rpx;
    font-size: 26rpx;
    background-color: #f8f9fa;
    box-sizing: border-box;
}

/* 选择器按钮优化，加大触控区域 */
.picker-btn {
    padding: 12rpx 20rpx;
    background-color: #f0f7ff;
    border-radius: 10rpx;
}

.picker-text {
    font-size: 24rpx;
    color: #409eff;
    font-weight: 500;
}

.refresh-time {
    font-size: 22rpx;
    color: #909399;
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

/* ==================== 状态指示器（移动端纵向排布） ==================== */
.status-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 32rpx;
    gap: 28rpx;
}

.status-indicator {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: flex-start;
}

.indicator-dot {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    transition: all 0.3s ease;
}

.indicator-dot.running {
    background-color: #52c41a;
    box-shadow: 0 0 20rpx rgba(82, 196, 26, 0.4);
}

.indicator-dot.stopped {
    background-color: #f5222d;
    box-shadow: 0 0 20rpx rgba(245, 34, 45, 0.4);
}

.indicator-dot.unknown {
    background-color: #909399;
    box-shadow: 0 0 20rpx rgba(144, 147, 153, 0.4);
}

.status-text {
    font-size: 40rpx;
    font-weight: 600;
    color: #1f2d3d;
}

/* 服务信息网格布局 */
.service-info {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 20rpx;
    background-color: #f8f9fa;
    border-radius: 12rpx;
}

.info-item-full {
    grid-column: span 2;
}

.info-label {
    font-size: 24rpx;
    color: #909399;
}

.info-value {
    font-size: 28rpx;
    color: #1f2d3d;
    font-weight: 500;
    word-break: break-all;
}

.text-success {
    color: #52c41a !important;
}

.text-danger {
    color: #f5222d !important;
}

/* ==================== 统计卡片网格（移动端2列） ==================== */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    margin-top: 8rpx;
}

.stat-card-full {
    grid-column: span 2;
}

.stat-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
    border-radius: 16rpx;
    padding: 28rpx 20rpx;
    text-align: center;
    transition: transform 0.2s ease;
}

.stat-card:active {
    transform: scale(0.98);
}

.stat-value {
    font-size: 52rpx;
    font-weight: 700;
    color: #409eff;
    margin-bottom: 8rpx;
    line-height: 1.2;
}

.stat-label {
    font-size: 24rpx;
    color: #909399;
}

/* ==================== 趋势统计样式 ==================== */
.trend-stats {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.trend-stats .stat-item {
    font-size: 24rpx;
    color: #606266;
    font-weight: 500;
    margin-right: 64rpx;
}

/* 攻击趋势柱状图优化 */
.trend-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-top: 8rpx;
}

.trend-item {
    display: flex;
    align-items: center;
    padding: 8rpx 0;
}

.trend-hour {
    width: 170rpx;
    font-size: 22rpx;
    color: #909399;
    flex-shrink: 0;
}

.trend-bar {
    flex: 1;
    height: 28rpx;
    background-color: #f0f2f5;
    border-radius: 14rpx;
    margin: 0 16rpx;
    overflow: hidden;
}

.trend-fill {
    height: 100%;
    border-radius: 14rpx;
    transition: width 0.3s ease;
}

.fill-primary {
    background: linear-gradient(90deg, #66b1ff, #409eff);
}

.fill-danger {
    background: linear-gradient(90deg, #f78989, #f56c6c);
}

.trend-count {
    width: 110rpx;
    text-align: right;
    font-size: 24rpx;
    font-weight: 500;
    color: #303133;
    flex-shrink: 0;
}

/* ==================== 监狱列表优化 ==================== */
.jail-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.jail-item {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx;
    background-color: #f8f9fa;
    border-radius: 16rpx;
    transition: all 0.2s ease;
}

.jail-item:active {
    background-color: #eef0f3;
    transform: scale(0.99);
}

.jail-main {
    flex: 1;
    min-width: 0;
}

.jail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.jail-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #1f2d3d;
}

.jail-status-tag {
    flex-shrink: 0;
}

.tag-success {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    background-color: #f0f9eb;
    color: #67c23a;
    border-radius: 8rpx;
    font-weight: 500;
}

.tag-info {
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    background-color: #ecf5ff;
    color: #409eff;
    border-radius: 8rpx;
    font-weight: 500;
}

/* 监狱统计2列网格 */
.jail-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12rpx;
}

.jail-stat-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4rpx;
}

.stat-num {
    font-size: 28rpx;
    font-weight: 600;
    color: #303133;
}

.jail-stat-item .stat-label {
    font-size: 20rpx;
    color: #909399;
}

/* ==================== 监狱详情弹窗优化 ==================== */
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
    height: 85vh;
    display: flex;
    flex-direction: column;
    z-index: 1000;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.jail-detail-popup.show {
    transform: translateY(0);
}

/* 移动端弹窗顶部拖拽条，符合原生交互习惯 */
.popup-drag-bar {
    width: 80rpx;
    height: 8rpx;
    background-color: #e4e7ed;
    border-radius: 4rpx;
    margin: 20rpx auto 0;
    flex-shrink: 0;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 32rpx 32rpx;
    border-bottom: 1rpx solid #f0f2f5;
    flex-shrink: 0;
}

.popup-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1f2d3d;
}

.popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 32rpx 28rpx;
    -webkit-overflow-scrolling: touch;
    position: relative;
    box-sizing: border-box;
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
    margin-bottom: 48rpx;
}

.section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1f2d3d;
    margin-bottom: 24rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #409eff;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 20rpx;
    background-color: #f8f9fa;
    border-radius: 12rpx;
}

.detail-label {
    font-size: 24rpx;
    color: #909399;
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
    flex-wrap: wrap;
    gap: 16rpx;
}

.ip-actions {
    display: flex;
    gap: 16rpx;
}

/* 按钮样式优化，加大触控区域适配移动端点击 */
.btn {
    padding: 12rpx 24rpx;
    border-radius: 10rpx;
    font-size: 24rpx;
    border: none;
    line-height: 1.2;
    font-weight: 500;
}

.btn-primary {
    background-color: #409eff;
    color: #fff;
}

.btn-small {
    padding: 8rpx 20rpx;
    font-size: 22rpx;
}

.ip-tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 8rpx;
}

.ip-tag {
    display: inline-flex;
    align-items: center;
    gap: 12rpx;
    padding: 10rpx 18rpx;
    border-radius: 10rpx;
    font-size: 24rpx;
    color: #fff;
}

.ip-tag-danger {
    background-color: #f56c6c;
}

.info-tag {
    background-color: #ecf5ff;
    color: #409eff;
    padding: 6rpx 14rpx;
    font-size: 22rpx;
    border-radius: 8rpx;
}

.ip-text {
    max-width: 220rpx;
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
    color: #909399;
    font-size: 28rpx;
    white-space: pre-line;
}

/* ==================== 攻击来源列表移动端优化 ==================== */
.ip-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.ip-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background-color: #f8f9fa;
    border-radius: 16rpx;
    position: relative;
}

.ip-rank {
    width: 52rpx;
    height: 52rpx;
    line-height: 52rpx;
    text-align: center;
    background-color: #c0c4cc;
    color: #fff;
    border-radius: 50%;
    font-size: 24rpx;
    font-weight: 600;
    margin-right: 20rpx;
    flex-shrink: 0;
}

/* 前三名排名高亮 */
.ip-rank.rank-top {
    background: linear-gradient(135deg, #ff9a44 0%, #fc6076 100%);
    box-shadow: 0 4rpx 12rpx rgba(252, 96, 118, 0.3);
}

.ip-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    min-width: 0;
}

.ip-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16rpx;
}

.ip-address {
    font-size: 28rpx;
    font-weight: 600;
    color: #1f2d3d;
    word-break: break-all;
}

.jail-tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
}

.ip-jail-tag {
    font-size: 20rpx;
    padding: 4rpx 10rpx;
    border-radius: 6rpx;
}

.ip-count {
    font-size: 24rpx;
    color: #909399;
}

.ip-threat {
    padding: 6rpx 14rpx;
    border-radius: 8rpx;
    font-size: 22rpx;
    font-weight: 500;
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

.ip-copy-btn {
    margin-left: 16rpx;
    flex-shrink: 0;
    padding: 8rpx;
}

/* ==================== 全量封禁IP ==================== */
.all-banned-ips {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 24rpx;
}

/* ==================== 日志容器移动端优化 ==================== */
.log-container {
    background-color: #1f2d3d;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
}

.log-item {
    margin-bottom: 24rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #304156;
}

.log-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
}

.log-time {
    font-size: 22rpx;
    color: #8392a5;
}

.log-level {
    font-size: 22rpx;
    font-weight: 600;
}

.log-message {
    font-size: 24rpx;
    line-height: 1.6;
    word-break: break-all;
}

.log-actions {
    text-align: right;
    margin-top: 12rpx;
}

.log-error .log-message {
    color: #ff7875;
}

.log-error .log-level {
    color: #ff7875;
}

.log-warn .log-message {
    color: #ffc53d;
}

.log-warn .log-level {
    color: #ffc53d;
}

.log-info .log-message {
    color: #73d13d;
}

.log-info .log-level {
    color: #73d13d;
}

.log-debug .log-message {
    color: #8c8c8c;
}

.log-debug .log-level {
    color: #8c8c8c;
}

/* ==================== 加载更多与空状态 ==================== */
.load-more {
    text-align: center;
    padding: 28rpx;
    color: #409eff;
    font-size: 26rpx;
    background-color: #f0f7ff;
    border-radius: 12rpx;
    font-weight: 500;
}

.no-more {
    text-align: center;
    padding: 28rpx;
    color: #c0c4cc;
    font-size: 24rpx;
}

.empty-text {
    text-align: center;
    padding: 60rpx 40rpx;
    color: #909399;
    font-size: 26rpx;
}

/* ==================== 响应式适配（平板/横屏保持舒适布局） ==================== */
@media (min-width: 768px) {
    .app-container {
        padding: 32rpx;
    }

    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .stat-card-full {
        grid-column: span 1;
    }

    .service-info {
        grid-template-columns: repeat(3, 1fr);
    }

    .info-item-full {
        grid-column: span 1;
    }

    /* 大屏下标题和操作区恢复左右布局 */
    .status-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .header-actions {
        width: auto;
        justify-content: flex-end;
    }

    .filter-container {
        width: auto;
        justify-content: flex-end;
    }

    .search-input {
        width: 360rpx;
    }

    .trend-stats {
        width: auto;
        gap: 24rpx;
    }
}
</style>