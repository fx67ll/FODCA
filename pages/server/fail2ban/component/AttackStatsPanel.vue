<template>
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
            </view>
        </view>

        <view class="ip-list">
            <view class="ip-item" :class="[`item-rank-${item.rank}`, item.threatClass]"
                v-for="(item, index) in displayList" :key="index">
                <!-- 左侧排名徽章 -->
                <view class="rank-badge" :class="getRankBadgeClass(item.rank)">
                    <!-- 前三名：勋章图标（允许并列，名次按攻击次数计算） -->
                    <template v-if="item.rank <= 3">
                        <text class="rank-medal">{{ medalEmoji[item.rank - 1] }}</text>
                    </template>
                    <!-- 其余：纯数字（并列时名次顺延） -->
                    <text v-else class="rank-num">{{ item.rank }}</text>
                </view>

                <!-- 主体信息 -->
                <view class="ip-info">
                    <!-- 第一行：IP地址 + 威胁等级 -->
                    <view class="ip-main-row">
                        <text class="ip-address">{{ item.ip }}</text>
                        <view class="ip-threat" :class="item.threatClass">{{ item.threatText }}</view>
                    </view>

                    <!-- 第二行：攻击次数（突出显示） + 监狱标签 -->
                    <view class="ip-meta-row">
                        <view class="count-badge">
                            <text class="count-num">{{ item.count }}</text>
                            <text class="count-unit">次攻击</text>
                        </view>
                        <view class="jail-tag-wrap">
                            <text class="ip-jail-tag" v-for="jail in item.jailList" :key="jail">{{ jail }}</text>
                            <text v-if="!item.jailList.length" class="jail-unknown">未知监狱</text>
                        </view>
                    </view>
                </view>
            </view>

            <view v-if="displayList.length === 0" class="empty-text">暂无攻击来源数据</view>
        </view>
    </view>
</template>

<script>
export default {
    name: "AttackStatsPanel",
    props: {
        topAttackIps: {
            type: Array,
            default: () => []
        },
        baselineMaxRetry: {
            type: Number,
            default: 5
        }
    },
    data() {
        return {
            topIpLimit: 3,
            topIpOptions: [
                { label: "Top3", value: 3 },
                { label: "Top5", value: 5 },
                { label: "Top10", value: 10 },
                { label: "Top20", value: 20 }
            ],
            statsLogLineOptions: [
                { label: "最近5千行", value: 5000 },
                { label: "最近1万行", value: 10000 },
                { label: "最近5万行", value: 50000 },
                { label: "最近10万行", value: 100000 }
            ],
            currentStatsLogLine: { label: "最近1万行", value: 10000 },
            // 金银铜 emoji
            medalEmoji: ['🥇', '🥈', '🥉']
        };
    },
    computed: {
        displayList() {
            // 按攻击次数降序排序，确保排名计算正确
            const sorted = [...this.topAttackIps]
                .slice(0, this.topIpLimit)
                .sort((a, b) => (b.count || 0) - (a.count || 0));
            let lastCount = null;
            let lastRank = 0;
            return sorted.map((item, index) => {
                const jailList = item.jails ? item.jails.split(', ').filter(Boolean) : [];
                const count = item.count || 0;
                // 并列排名：相同攻击次数共享名次，下一位根据并列数量顺延（1224 排名）
                const rank = (lastCount === null || count !== lastCount) ? index + 1 : lastRank;
                lastCount = count;
                lastRank = rank;
                return {
                    ...item,
                    jailList,
                    threatClass: this.getThreatClass(count),
                    threatText: this.getThreatLevelText(count),
                    rank
                };
            });
        }
    },
    methods: {
        getRankBadgeClass(rank) {
            if (rank === 1) return 'badge-gold';
            if (rank === 2) return 'badge-silver';
            if (rank === 3) return 'badge-bronze';
            return 'badge-normal';
        },

        onTopIpLimitChange(e) {
            this.topIpLimit = this.topIpOptions[e.detail.value].value;
            this.$emit('stats-change', {
                topIpLimit: this.topIpLimit,
                statsLogLines: this.currentStatsLogLine.value
            });
        },

        onStatsLogLineChange(e) {
            this.currentStatsLogLine = this.statsLogLineOptions[e.detail.value];
            this.$emit('stats-change', {
                topIpLimit: this.topIpLimit,
                statsLogLines: this.currentStatsLogLine.value
            });
        },

        getThreatClass(count) {
            const base = this.baselineMaxRetry;
            if (count >= base * 10) return 'threat-high';
            if (count >= base * 5) return 'threat-medium';
            if (count >= base * 2) return 'threat-normal';
            return 'threat-low';
        },

        getThreatLevelText(count) {
            const base = this.baselineMaxRetry;
            if (count >= base * 10) return '极高危';
            if (count >= base * 5) return '高危';
            if (count >= base * 2) return '中危';
            return '低危';
        }
    }
};
</script>

<style lang="less" scoped>
/* ==================== 卡片容器 ==================== */
.status-card {
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
    padding: 32rpx 28rpx;
    margin-bottom: 24rpx;
}

/* ==================== 头部 ==================== */
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

/* ==================== 列表 ==================== */
.ip-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

/* ==================== 单条 IP 卡片 ==================== */
.ip-item {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx;
    border-radius: 18rpx;
    background-color: #f8f9fa;
    border-left: 8rpx solid #e4e7ed;
    position: relative;
    transition: all 0.2s ease;
}

.ip-item:active {
    transform: scale(0.99);
    opacity: 0.9;
}

/* 前三名卡片背景微调 */
.ip-item.item-rank-1 {
    background: linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%);
    border-left-color: #f5a623;
}

.ip-item.item-rank-2 {
    background: linear-gradient(135deg, #f8f9fb 0%, #f2f4f7 100%);
    border-left-color: #a0aab8;
}

.ip-item.item-rank-3 {
    background: linear-gradient(135deg, #fdf8f5 0%, #faf3ee 100%);
    border-left-color: #c8845a;
}

/* 威胁等级左边框颜色（4名以后用威胁色） */
.ip-item.threat-high {
    border-left-color: #f56c6c;
}

.ip-item.threat-medium {
    border-left-color: #e6a23c;
}

.ip-item.threat-normal {
    border-left-color: #909399;
}

.ip-item.threat-low {
    border-left-color: #409eff;
}

/* 前三名的边框优先级高于威胁色，通过顺序已覆盖，无需额外处理 */
.ip-item.item-rank-1,
.ip-item.item-rank-2,
.ip-item.item-rank-3 {
    /* 确保前三名边框不被威胁色覆盖 */
}

/* ==================== 排名徽章 ==================== */
.rank-badge {
    width: 64rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    flex-shrink: 0;
    gap: 2rpx;
}

/* 金牌 */
.badge-gold {
    .rank-medal {
        font-size: 40rpx;
        line-height: 1;
    }

    .medal-num {
        font-size: 20rpx;
        font-weight: 700;
        color: #d48806;
    }
}

/* 银牌 */
.badge-silver {
    .rank-medal {
        font-size: 40rpx;
        line-height: 1;
    }

    .medal-num {
        font-size: 20rpx;
        font-weight: 700;
        color: #7a8a9a;
    }
}

/* 铜牌 */
.badge-bronze {
    .rank-medal {
        font-size: 40rpx;
        line-height: 1;
    }

    .medal-num {
        font-size: 20rpx;
        font-weight: 700;
        color: #9d6035;
    }
}

/* 普通排名 */
.badge-normal {
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    background-color: #e8eaed;
    display: flex;
    align-items: center;
    justify-content: center;

    .rank-num {
        font-size: 24rpx;
        font-weight: 600;
        color: #606266;
    }
}

.rank-num {
    line-height: 1;
}

.rank-medal {
    display: block;
}

/* ==================== 信息区 ==================== */
.ip-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14rpx;
    min-width: 0;
}

/* 第一行：IP + 威胁标签 */
.ip-main-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12rpx;
}

.ip-address {
    font-size: 28rpx;
    font-weight: 700;
    color: #1f2d3d;
    word-break: break-all;
    flex: 1;
    line-height: 1.4;
}

.ip-threat {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    font-weight: 600;
    flex-shrink: 0;
    white-space: nowrap;
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

/* 第二行：攻击次数 + 监狱标签 */
.ip-meta-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex-wrap: wrap;
}

.count-badge {
    display: flex;
    align-items: baseline;
    gap: 4rpx;
    background-color: rgba(0, 0, 0, 0.04);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    flex-shrink: 0;
}

.count-num {
    font-size: 30rpx;
    font-weight: 700;
    color: #303133;
    line-height: 1;
}

.count-unit {
    font-size: 20rpx;
    color: #909399;
    line-height: 1;
}

.jail-tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    align-items: center;
}

.ip-jail-tag {
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    background-color: #ecf5ff;
    color: #409eff;
}

.jail-unknown {
    font-size: 20rpx;
    color: #c0c4cc;
}

/* ==================== 空状态 ==================== */
.empty-text {
    text-align: center;
    padding: 60rpx 40rpx;
    color: #909399;
    font-size: 26rpx;
}

/* ==================== 响应式 ==================== */
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
