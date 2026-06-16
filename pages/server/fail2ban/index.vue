<template>
    <view class="app-container">
        <!-- Fail2ban服务状态卡片 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">Fail2ban 防护状态</text>
                <view class="refresh-container">
                    <uni-icons type="refresh" size="16" color="#409eff" @click="handleRefresh"></uni-icons>
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
                            :class="serviceInfo.firewallStatus === '运行中' ? 'text-success' : 'text-danger'">
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
                    <text class="trend-count">{{ item.count }}</text>
                </view>
            </view>
        </view>

        <!-- 监狱防护状态 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">监狱防护状态</text>
            </view>

            <view class="jail-list">
                <view class="jail-item" v-for="jail in jailList" :key="jail.name" @click="toggleJailDetail(jail)">
                    <view class="jail-main">
                        <view class="jail-name">{{ jail.name }}</view>
                        <view class="jail-stats">
                            <text class="stat">封禁: {{ jail.currentlyBanned }}</text>
                            <text class="stat">累计: {{ jail.totalBanned }}</text>
                            <text class="stat">失败: {{ jail.totalFailed }}</text>
                        </view>
                    </view>
                    <uni-icons :type="expandedJails.includes(jail.name) ? 'arrowup' : 'arrowdown'" size="14"
                        color="#c0c4cc"></uni-icons>
                </view>

                <!-- 监狱详情平铺区域（无弹窗） -->
                <view class="jail-detail" v-for="jail in expandedJailDetails" :key="jail.name"
                    v-show="expandedJails.includes(jail.name)">
                    <view class="detail-section">
                        <text class="section-title">防护配置</text>
                        <view class="detail-grid">
                            <view class="detail-item">
                                <text class="detail-label">封禁时间</text>
                                <text class="detail-value">{{ jail.config.bantime || '未知' }}秒</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">检测窗口</text>
                                <text class="detail-value">{{ jail.config.findtime || '未知' }}秒</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">最大失败</text>
                                <text class="detail-value">{{ jail.config.maxretry || '未知' }}</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">监控端口</text>
                                <text class="detail-value">{{ jail.config.port || '未知' }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="detail-section">
                        <view class="section-header">
                            <text class="section-title">当前被封禁IP ({{ jail.bannedIps.length || 0 }})</text>
                            <view class="ip-actions">
                                <button class="btn btn-primary btn-small" @click="copyAllIps(jail.bannedIps)"
                                    :disabled="!jail.bannedIps || jail.bannedIps.length === 0">
                                    复制全部
                                </button>
                            </view>
                        </view>

                        <view class="banned-ips">
                            <view class="ip-tag" v-for="ip in jail.bannedIps" :key="ip">
                                <text class="ip-text">{{ ip }}</text>
                                <uni-icons type="copy" size="12" color="#fff"
                                    @click.stop="copySingleIp(ip)"></uni-icons>
                            </view>
                            <view v-if="!jail.bannedIps || jail.bannedIps.length === 0" class="empty-text">
                                暂无被封禁IP
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 攻击来源Top 10 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">攻击来源 Top 10</text>
                <button class="btn btn-primary btn-small" @click="copyAllTopIps" :disabled="topAttackIps.length === 0">
                    复制全部
                </button>
            </view>

            <view class="ip-list">
                <view class="ip-item" v-for="(item, index) in topAttackIps.slice(0, 10)" :key="index">
                    <view class="ip-rank">{{ index + 1 }}</view>
                    <view class="ip-info">
                        <text class="ip-address">{{ item.ip }}</text>
                        <text class="ip-count">攻击 {{ item.count }} 次</text>
                    </view>
                    <view class="ip-threat" :class="getThreatClass(item.count)">
                        {{ getThreatLevelText(item.count) }}
                    </view>
                    <uni-icons type="copy" size="16" color="#409eff" @click="copySingleIp(item.ip)"></uni-icons>
                </view>
            </view>
        </view>

        <!-- 全量封禁IP列表 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">全量封禁IP (共 {{ allBannedIps.length }} 个)</text>
                <button class="btn btn-primary btn-small" @click="copyAllBannedIps"
                    :disabled="allBannedIps.length === 0">
                    复制全部
                </button>
            </view>

            <view class="all-banned-ips">
                <view class="ip-tag ip-tag-danger" v-for="ip in paginatedBannedIps" :key="ip">
                    <text class="ip-text">{{ ip }}</text>
                    <uni-icons type="copy" size="12" color="#fff" @click.stop="copySingleIp(ip)"></uni-icons>
                </view>
                <view v-if="allBannedIps.length === 0" class="empty-text">
                    暂无被封禁IP
                </view>
            </view>

            <!-- 加载更多 -->
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
                    <uni-icons type="refresh" size="16" color="#409eff" @click="refreshLogs"></uni-icons>
                </view>
            </view>

            <view class="log-container">
                <view class="log-item" v-for="(log, index) in paginatedLogs" :key="index"
                    :class="getLogClass(log.level)" v-if="paginatedLogs.length > 0">
                    <view class="log-header">
                        <text class="log-time">{{ log.time }}</text>
                        <text class="log-level">[{{ log.level }}]</text>
                    </view>
                    <text class="log-message">{{ log.message }}</text>
                    <view class="log-actions" v-if="log.ip">
                        <uni-icons type="copy" size="14" color="#409eff" @click="copySingleIp(log.ip)"></uni-icons>
                    </view>
                </view>
                <view v-if="paginatedLogs.length === 0" class="empty-text">
                    暂无被封禁IP
                </view>
            </view>

            <!-- 加载更多 -->
            <view class="load-more" @click="loadMoreLogs" v-if="hasMoreLogs">
                <text>加载更多</text>
            </view>
            <view class="no-more" v-else-if="filteredLogs.length > logPageSize">
                <text>没有更多了</text>
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
            expandedJails: [], // 已展开的监狱名称列表
            expandedJailDetails: [], // 已展开的监狱详情数据

            // ==================== 攻击统计 ====================
            topAttackIps: [], // 攻击来源Top 20
            trendData: [], // 24小时攻击趋势数据

            // ==================== 全量封禁IP ====================
            allBannedIps: [], // 所有被封禁的IP（去重后）
            ipCurrentPage: 1, // IP列表当前页码
            ipPageSize: 50, // IP列表每页条数（移动端优化）

            // ==================== 日志管理 ====================
            recentLogs: [], // 原始日志数据
            logLimit: 200, // 日志返回条数（参数化）
            logCurrentPage: 1, // 日志当前页码
            logPageSize: 20, // 日志每页条数（移动端优化）
            logLimitOptions: [
                { label: "50条", value: 50 },
                { label: "100条", value: 100 },
                { label: "200条", value: 200 },
                { label: "500条", value: 500 },
                { label: "1000条", value: 1000 }
            ],
            currentLogLimit: { label: "200条", value: 200 },

            // ==================== 加载状态 ====================
            isRefreshing: false, // 整体刷新状态
            isLoadingLogs: false, // 日志刷新状态

            // ==================== 其他 ====================
            lastRefreshTime: "", // 最后刷新时间
            refreshInterval: null // 自动刷新定时器
        };
    },
    computed: {
        /**
         * 过滤后的日志列表（移动端暂不支持级别和监狱筛选，如需可自行添加）
         */
        filteredLogs() {
            return this.recentLogs;
        },

        /**
         * 分页后的日志列表（移动端加载更多模式）
         */
        paginatedLogs() {
            const end = this.logCurrentPage * this.logPageSize;
            return this.filteredLogs.slice(0, end);
        },

        /**
         * 分页后的全量封禁IP列表（移动端加载更多模式）
         */
        paginatedBannedIps() {
            const end = this.ipCurrentPage * this.ipPageSize;
            return this.allBannedIps.slice(0, end);
        },

        /**
         * 是否还有更多IP可以加载
         */
        hasMoreIps() {
            return this.ipCurrentPage * this.ipPageSize < this.allBannedIps.length;
        },

        /**
         * 是否还有更多日志可以加载
         */
        hasMoreLogs() {
            return this.logCurrentPage * this.logPageSize < this.filteredLogs.length;
        }
    },
    onLoad() {
        // 页面加载时加载所有数据
        this.loadAllData();
        // 设置自动刷新，每30秒更新一次
        this.refreshInterval = setInterval(() => {
            this.loadAllData();
        }, 30000);
    },
    onUnload() {
        // 页面卸载时清除定时器
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    },
    methods: {
        /**
         * 加载所有数据
         */
        async loadAllData() {
            try {
                await Promise.all([
                    this.loadServiceStatus(),
                    this.loadJailList(),
                    this.loadAttackStats(),
                    this.loadRecentLogs(),
                    this.loadAllBannedIps()
                ]);
                this.lastRefreshTime = this.formatDateTime(new Date());
            } catch (error) {
                uni.showToast({
                    title: "加载数据失败",
                    icon: "none"
                });
            }
        },

        /**
         * 手动刷新所有数据
         */
        handleRefresh() {
            this.isRefreshing = true;
            this.loadAllData().finally(() => {
                this.isRefreshing = false;
            });
        },

        /**
         * 刷新日志数据
         */
        refreshLogs() {
            this.isLoadingLogs = true;
            this.loadRecentLogs().finally(() => {
                this.isLoadingLogs = false;
            });
        },

        /**
         * 日志条数选择器改变事件
         */
        onLogLimitChange(e) {
            this.currentLogLimit = this.logLimitOptions[e.detail.value];
            this.logLimit = this.currentLogLimit.value;
            this.loadRecentLogs();
        },

        /**
         * 加载Fail2ban服务状态
         */
        async loadServiceStatus() {
            const response = await getFail2banStatus();
            const data = response.data || {};
            this.serviceStatus = data.status || "未知";
            this.serviceInfo = data;
        },

        /**
         * 加载监狱列表
         */
        async loadJailList() {
            const response = await getJailList();
            this.jailList = response.data || [];
        },

        /**
         * 加载攻击统计数据
         */
        async loadAttackStats() {
            const response = await getAttackStats();
            this.topAttackIps = response.data.topAttackIps || [];

            // 转换趋势数据格式
            const trend = response.data.hourlyTrend || {};
            this.trendData = Object.entries(trend).map(([hour, count]) => ({
                hour,
                count
            }));
        },

        /**
         * 加载全量封禁IP列表
         */
        async loadAllBannedIps() {
            const response = await getAllBannedIps();
            const data = response.data || {};
            const bannedIpsByJail = data.bannedIpsByJail || {};

            // 合并所有监狱的IP并去重
            const allIps = new Set();
            Object.values(bannedIpsByJail).forEach(ips => {
                ips.forEach(ip => allIps.add(ip));
            });
            this.allBannedIps = Array.from(allIps);
            // 重置IP分页
            this.ipCurrentPage = 1;
        },

        /**
         * 加载最近日志（支持参数化）
         */
        async loadRecentLogs() {
            const response = await getRecentLogs({
                limit: this.logLimit
            });
            this.recentLogs = response.data || [];
            // 重置日志分页
            this.logCurrentPage = 1;
        },

        /**
         * 切换监狱详情展开/收起（平铺展示，无弹窗）
         * @param {Object} row 监狱行数据
         */
        async toggleJailDetail(row) {
            const index = this.expandedJails.indexOf(row.name);
            if (index > -1) {
                // 收起详情
                this.expandedJails.splice(index, 1);
                this.expandedJailDetails = this.expandedJailDetails.filter(
                    jail => jail.name !== row.name
                );
            } else {
                // 展开详情
                try {
                    const response = await getJailDetail(row.name);
                    this.expandedJails.push(row.name);
                    this.expandedJailDetails.push(response.data);
                } catch (error) {
                    uni.showToast({
                        title: "获取监狱详情失败",
                        icon: "none"
                    });
                }
            }
        },

        // ==================== IP复制功能 ====================

        /**
         * 复制单个IP到剪贴板
         * @param {String} ip IP地址
         */
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

        /**
         * 复制全部IP到剪贴板
         * @param {Array} ips IP地址数组
         */
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

        /**
         * 复制全部Top攻击IP到剪贴板
         */
        copyAllTopIps() {
            const ips = this.topAttackIps.map(item => item.ip);
            this.copyAllIps(ips);
        },

        /**
         * 复制所有封禁IP到剪贴板
         */
        copyAllBannedIps() {
            this.copyAllIps(this.allBannedIps);
        },

        // ==================== 加载更多功能 ====================

        /**
         * 加载更多IP
         */
        loadMoreIps() {
            this.ipCurrentPage++;
        },

        /**
         * 加载更多日志
         */
        loadMoreLogs() {
            this.logCurrentPage++;
        },

        // ==================== 工具方法 ====================

        /**
         * 根据攻击次数获取威胁等级CSS类
         * @param {Number} count 攻击次数
         * @returns {String} CSS类名
         */
        getThreatClass(count) {
            if (count > 200) return "threat-high";
            if (count > 100) return "threat-medium";
            return "threat-low";
        },

        /**
         * 根据攻击次数获取威胁等级文本
         * @param {Number} count 攻击次数
         * @returns {String} 威胁等级文本
         */
        getThreatLevelText(count) {
            if (count > 200) return "极高危";
            if (count > 100) return "高危";
            if (count > 50) return "中危";
            return "低危";
        },

        /**
         * 根据日志级别获取对应的CSS类
         * @param {String} level 日志级别
         * @returns {String} CSS类名
         */
        getLogClass(level) {
            const classMap = {
                "ERROR": "log-error",
                "WARN": "log-warn",
                "INFO": "log-info",
                "DEBUG": "log-debug"
            };
            return classMap[level] || "log-info";
        },

        /**
         * 格式化日期时间为字符串
         * @param {Date} date 日期对象
         * @returns {String} 格式化后的日期字符串
         */
        formatDateTime(date) {
            const year = date.getFullYear();
            const month = this.padZero(date.getMonth() + 1);
            const day = this.padZero(date.getDate());
            const hour = this.padZero(date.getHours());
            const minute = this.padZero(date.getMinutes());
            const second = this.padZero(date.getSeconds());
            return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        },

        /**
         * 数字补零函数
         * @param {Number} num 数字
         * @returns {String} 补零后的两位字符串
         */
        padZero(num) {
            return num < 10 ? `0${num}` : num;
        }
    }
};
</script>

<style scoped>
.app-container {
    padding: 15px;
    background-color: #f5f5f5;
    min-height: 100vh;
}

.status-card {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 20px 15px;
    margin-bottom: 15px;
}

.status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f5f5f5;
}

.title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2d3d;
}

.refresh-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.picker-text {
    font-size: 12px;
    color: #409eff;
    padding: 4px 8px;
    background-color: #e6f4ff;
    border-radius: 4px;
}

.refresh-time {
    font-size: 11px;
    color: #8392a5;
}

/* 状态指示器 */
.status-content {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.status-indicator {
    display: flex;
    align-items: center;
    margin-right: 20px;
    margin-bottom: 15px;
}

.indicator-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 8px;
    transition: all 0.3s ease;
}

.indicator-dot.running {
    background-color: #52c41a;
    box-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
}

.indicator-dot.stopped {
    background-color: #f5222d;
    box-shadow: 0 0 8px rgba(245, 34, 45, 0.4);
}

.status-text {
    font-size: 22px;
    font-weight: 500;
    color: #1f2d3d;
}

.service-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-left: 20px;
}

.info-item {
    font-size: 13px;
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

/* 统计卡片网格 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 20px;
}

.stat-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
    border-radius: 8px;
    padding: 15px 10px;
    text-align: center;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #409eff;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 12px;
    color: #8392a5;
}

/* 攻击趋势 */
.trend-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.trend-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
}

.trend-hour {
    width: 50px;
    font-size: 12px;
    color: #8392a5;
}

.trend-bar {
    flex: 1;
    height: 12px;
    background-color: #e6e6e6;
    border-radius: 6px;
    margin: 0 10px;
    overflow: hidden;
}

.trend-fill {
    height: 100%;
    background-color: #f56c6c;
    border-radius: 6px;
    transition: width 0.3s ease;
}

.trend-count {
    width: 40px;
    text-align: right;
    font-size: 12px;
    font-weight: 500;
    color: #1f2d3d;
}

/* 监狱列表 */
.jail-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.jail-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s;
}

.jail-item:active {
    background-color: #e9ecef;
}

.jail-main {
    flex: 1;
}

.jail-name {
    font-size: 16px;
    font-weight: 500;
    color: #1f2d3d;
    margin-bottom: 6px;
}

.jail-stats {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #8392a5;
}

/* 监狱详情 */
.jail-detail {
    margin-top: 10px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.detail-section {
    margin-bottom: 20px;
}

.section-title {
    font-size: 15px;
    font-weight: 500;
    color: #1f2d3d;
    margin-bottom: 12px;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-label {
    font-size: 12px;
    color: #8392a5;
}

.detail-value {
    font-size: 13px;
    font-weight: 500;
    color: #1f2d3d;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.ip-actions {
    display: flex;
    gap: 8px;
}

.btn {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    border: none;
}

.btn-primary {
    background-color: #409eff;
    color: #fff;
}

.btn-small {
    padding: 2px 8px;
    font-size: 11px;
}

.banned-ips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.ip-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background-color: #409eff;
    color: #fff;
    border-radius: 4px;
    font-size: 12px;
}

.ip-tag-danger {
    background-color: #f56c6c;
}

.ip-text {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 攻击来源列表 */
.ip-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.ip-item {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.ip-rank {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    background-color: #409eff;
    color: #fff;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 500;
    margin-right: 10px;
}

.ip-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ip-address {
    font-size: 14px;
    font-weight: 500;
    color: #1f2d3d;
}

.ip-count {
    font-size: 12px;
    color: #8392a5;
}

.ip-threat {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    margin-right: 10px;
}

.threat-high {
    background-color: #fef0f0;
    color: #f56c6c;
}

.threat-medium {
    background-color: #fdf6ec;
    color: #e6a23c;
}

.threat-low {
    background-color: #e6f4ff;
    color: #409eff;
}

/* 全量封禁IP */
.all-banned-ips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
}

/* 日志容器 */
.log-container {
    background-color: #1f2d3d;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 15px;
}

.log-item {
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #304156;
}

.log-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.log-header {
    display: flex;
    gap: 10px;
    margin-bottom: 6px;
}

.log-time {
    font-size: 11px;
    color: #8392a5;
}

.log-level {
    font-size: 11px;
    font-weight: 500;
}

.log-message {
    font-size: 12px;
    line-height: 1.5;
    word-break: break-all;
}

.log-actions {
    text-align: right;
    margin-top: 6px;
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
    padding: 12px;
    color: #409eff;
    font-size: 13px;
    background-color: #e6f4ff;
    border-radius: 8px;
}

.no-more {
    text-align: center;
    padding: 12px;
    color: #8392a5;
    font-size: 13px;
}

.empty-text {
    text-align: center;
    padding: 20px;
    color: #8392a5;
    font-size: 13px;
}
</style>