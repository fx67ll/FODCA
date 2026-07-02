<template>
    <view class="status-card recent-logs-card">
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
                <view class="reset-btn" @click="handleResetFilters">
                    <uni-icons type="refresh" size="24rpx" color="#f56c6c"></uni-icons>
                    <text class="reset-btn-text">重置筛选</text>
                </view>
            </view>
        </view>

        <view class="log-container">
            <view v-if="isLoading" class="log-loading">
                <view class="log-loading-spinner"></view>
                <text class="log-loading-text">加载中...</text>
            </view>
            <template v-else-if="paginatedLogsWithClass.length > 0">
                <view class="log-item" v-for="(log, index) in paginatedLogsWithClass" :key="index"
                    :class="log.logClass">
                    <view class="log-header">
                        <text class="log-time">{{ log.date }} {{ log.time }}</text>
                        <text class="log-level">[{{ log.level }}]</text>
                    </view>
                    <text class="log-message">{{ log.message }}</text>
                </view>
            </template>
            <view v-else class="empty-text">暂无符合条件的日志</view>
        </view>

        <!-- 回到本卡片标题处：加载更多后列表变长，提供一键返回日志顶部的入口 -->
        <view class="back-to-top" v-if="filteredLogs.length > pageSize" @click="scrollToLogsTop">
            <!-- <uni-icons type="arrowup" size="24rpx" color="#409eff"></uni-icons> -->
            <text class="back-to-top-text">返回日志顶部</text>
        </view>

        <view class="load-more" @click="loadMore" v-if="hasMore">
            <text>加载更多日志</text>
        </view>
        <view class="no-more" v-else-if="filteredLogs.length > pageSize">
            <text>没有更多了</text>
        </view>
    </view>
</template>

<script>
import { getRecentLogs } from "@/api/fx67ll/server/fail2ban";

export default {
    name: "RecentLogsPanel",
    props: {
        jailList: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            recentLogs: [],
            logLevelFilter: "",
            logJailFilter: "",
            logLimit: 5,
            currentPage: 1,
            pageSize: 5,
            isLoading: false,
            logLevelOptions: [
                { label: "全部", value: "" },
                { label: "ERROR", value: "ERROR" },
                { label: "WARN", value: "WARN" },
                { label: "INFO", value: "INFO" }
            ],
            currentLogLevel: { label: "全部", value: "" },
            currentLogJail: { label: "全部", value: "" },
            logLimitOptions: [
                { label: "5条", value: 5 },
                { label: "10条", value: 10 },
                { label: "20条", value: 20 },
                { label: "50条", value: 50 },
                { label: "100条", value: 100 }
            ],
            currentLogLimit: { label: "5条", value: 5 }
        };
    },
    computed: {
        jailNameOptions() {
            const options = [{ label: "全部", value: "" }];
            this.jailList.forEach(jail => {
                options.push({ label: jail.name, value: jail.name });
            });
            return options;
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
            return this.filteredLogs.slice(0, this.currentPage * this.pageSize);
        },

        paginatedLogsWithClass() {
            return this.paginatedLogs.map(log => ({
                ...log,
                logClass: this.getLogClass(log.level)
            }));
        },

        hasMore() {
            return this.currentPage * this.pageSize < this.filteredLogs.length;
        }
    },
    methods: {
        async loadLogs(showLoading = true, resetPage = true) {
            if (showLoading) this.isLoading = true;
            // 切换筛选条件/重置时回到第1页；整体刷新时保持当前页（不改变浏览位置）
            if (resetPage) this.currentPage = 1;
            try {
                const response = await getRecentLogs({
                    limit: this.logLimit,
                    level: this.logLevelFilter,
                    jail: this.logJailFilter
                });
                this.recentLogs = response.data || [];
            } catch (e) {
                console.error("加载日志失败:", e);
                this.recentLogs = [];
            } finally {
                if (showLoading) this.isLoading = false;
            }
        },

        refresh() {
            // 父组件（页面整体刷新/初始加载）调用：静默加载并保持浏览位置（不重置分页、不显示 loading）
            this.loadLogs(false, false);
        },

        loadMore() {
            this.currentPage++;
        },

        // 平滑滚动到「最近攻击日志」标题处（卡片顶部留一点呼吸距离）
        scrollToLogsTop() {
            const query = uni.createSelectorQuery().in(this);
            query.select('.recent-logs-card').boundingClientRect();
            query.selectViewport().scrollOffset();
            query.exec((res) => {
                const rect = res[0];
                const viewport = res[1];
                if (!rect || !viewport) return;
                const target = viewport.scrollTop + rect.top - 16;
                uni.pageScrollTo({
                    scrollTop: Math.max(target, 0),
                    duration: 300
                });
            });
        },

        onLogLevelChange(e) {
            this.currentLogLevel = this.logLevelOptions[e.detail.value];
            this.logLevelFilter = this.currentLogLevel.value;
            this.loadLogs(true);
        },

        onLogJailChange(e) {
            this.currentLogJail = this.jailNameOptions[e.detail.value];
            this.logJailFilter = this.currentLogJail.value;
            this.loadLogs(true);
        },

        onLogLimitChange(e) {
            this.currentLogLimit = this.logLimitOptions[e.detail.value];
            this.logLimit = this.currentLogLimit.value;
            this.loadLogs(true);
        },

        // 重置筛选条件：静默刷新，不闪动页面
        handleResetFilters() {
            this.currentLogLevel = this.logLevelOptions[0];
            this.logLevelFilter = this.currentLogLevel.value;
            this.currentLogJail = this.jailNameOptions[0];
            this.logJailFilter = this.currentLogJail.value;
            this.currentLogLimit = this.logLimitOptions[0];
            this.logLimit = this.currentLogLimit.value;
            this.loadLogs(false, true);
        },

        getLogClass(level) {
            const classMap = { "ERROR": "log-error", "WARN": "log-warn", "INFO": "log-info", "DEBUG": "log-debug" };
            return classMap[level] || "log-info";
        }
    }
};
</script>

<style lang="less" scoped>
.status-card {
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
    padding: 32rpx 28rpx;
    margin-bottom: 24rpx;
}

.status-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f2f5;
    gap: 20rpx;
}

.title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1f2d3d;
}

.filter-container {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex-wrap: wrap;
}

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

/* 重置筛选按钮（参考 Web 端 reset-btn，红色提示色） */
.reset-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 12rpx 20rpx;
    background-color: #fef0f0;
    border-radius: 10rpx;
}

.reset-btn-text {
    font-size: 24rpx;
    color: #f56c6c;
    font-weight: 500;
}

.reset-btn:active {
    opacity: 0.7;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

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

.log-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
    gap: 16rpx;
}

.log-loading-spinner {
    width: 44rpx;
    height: 44rpx;
    border: 4rpx solid #304156;
    border-top-color: #409eff;
    border-radius: 50%;
    animation: rotate 0.8s linear infinite;
}

.log-loading-text {
    font-size: 24rpx;
    color: #8392a5;
}

.log-error .log-message,
.log-error .log-level {
    color: #ff7875;
}

.log-warn .log-message,
.log-warn .log-level {
    color: #ffc53d;
}

.log-info .log-message,
.log-info .log-level {
    color: #73d13d;
}

.log-debug .log-message,
.log-debug .log-level {
    color: #8c8c8c;
}

.empty-text {
    text-align: center;
    padding: 60rpx 40rpx;
    color: #909399;
    font-size: 26rpx;
}

.load-more {
    text-align: center;
    padding: 28rpx;
    color: #409eff;
    font-size: 26rpx;
    background-color: #f0f7ff;
    border-radius: 12rpx;
    font-weight: 500;
    margin-top: 20rpx;
}

.no-more {
    text-align: center;
    padding: 28rpx;
    color: #c0c4cc;
    font-size: 24rpx;
    margin-top: 20rpx;
}

/* 回到日志顶部按钮（药丸款，与加载更多圆角色块呼应但更紧凑） */
.back-to-top {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    margin: 20rpx auto 0;
    padding: 16rpx 36rpx;
    background: linear-gradient(135deg, #f0f7ff 0%, #e8f3ff 100%);
    border-radius: 32rpx;
    box-shadow: 0 2rpx 8rpx rgba(64, 158, 255, 0.1);
    transition: all 0.2s ease;
}

.back-to-top:active {
    opacity: 0.7;
    transform: scale(0.96);
}

.back-to-top-text {
    font-size: 24rpx;
    color: #409eff;
    font-weight: 500;
    line-height: 1;
}

@media (min-width: 768px) {
    .status-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .filter-container {
        width: auto;
        justify-content: flex-end;
    }
}
</style>
