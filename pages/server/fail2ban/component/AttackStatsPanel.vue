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
            <view class="ip-item" :class="item.threatClass" v-for="(item, index) in displayList" :key="index">
                <!-- 左侧排名徽章（前三名奖牌，其余圆形序号） -->
                <view class="rank-badge" :class="getRankBadgeClass(item.rank)">
                    <template v-if="item.rank <= 3">
                        <text class="rank-medal">{{ medalEmoji[item.rank - 1] }}</text>
                    </template>
                    <text v-else class="rank-num">{{ item.rank }}</text>
                </view>

                <!-- 主体信息 -->
                <view class="ip-info">
                    <!-- 第一行：IP地址 + 威胁等级 -->
                    <view class="ip-main-row">
                        <text class="ip-address">{{ item.ip }}</text>
                        <view class="ip-threat" :class="item.threatClass">{{ item.threatText }}</view>
                    </view>

                    <!-- 第二行：攻击次数 + 监狱标签 -->
                    <view class="ip-meta-row">
                        <view class="count-badge">
                            <text class="count-num" :class="item.threatClass">{{ item.count }}</text>
                            <text class="count-unit">次攻击</text>
                        </view>
                        <view class="jail-tag-wrap">
                            <text class="ip-jail-tag" v-for="jail in item.jailList" :key="jail">{{ jail }}</text>
                            <text v-if="!item.jailList.length" class="jail-unknown">未知监狱</text>
                        </view>
                    </view>

                    <!-- 第三行：攻击强度条（相对当前列表峰值占比） -->
                    <view class="intensity-row">
                        <view class="intensity-bar">
                            <view class="intensity-fill" :class="item.threatClass"
                                :style="{ width: item.intensity + '%' }"></view>
                        </view>
                        <text class="intensity-pct">{{ item.intensity }}%</text>
                    </view>
                </view>
            </view>

            <view v-if="displayList.length === 0" class="empty-text">暂无攻击来源数据</view>
        </view>

        <!-- 非 Top3 时显示：点击回到默认 Top3（与攻击趋势展开/收起功能相似，但独立样式） -->
        <view class="reset-top-wrap" v-if="topIpLimit !== 3 && displayList.length > 0">
            <view class="reset-top-btn" @click="resetToDefaultTop">
                <uni-icons type="arrowup" size="26rpx" color="#fff"></uni-icons>
                <text class="reset-top-text">重置为默认 Top3</text>
            </view>
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
            // 峰值作为强度条基准（避免除零）
            const maxCount = sorted.length ? Math.max(...sorted.map(i => i.count || 0), 1) : 1;
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
                    rank,
                    intensity: Math.round((count / maxCount) * 100)
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

        // 回到默认 Top3 状态（与切换 Top 选择器效果一致，仅重置数量并通知父组件重新加载）
        resetToDefaultTop() {
            if (this.topIpLimit === 3) return;
            this.topIpLimit = 3;
            this.$emit('stats-change', {
                topIpLimit: 3,
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
    // flex-direction: column;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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
    // width: 100%;
    width: auto;
    display: flex;
    justify-content: flex-end;
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

/* ==================== 单条 IP 卡片（威胁染色柔色底） ==================== */
.ip-item {
    display: flex;
    align-items: center;
    padding: 24rpx 24rpx 22rpx 20rpx;
    border-radius: 18rpx;
    background-color: #f8f9fa;
    border-left: 8rpx solid #c0c4cc;
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.ip-item:active {
    transform: scale(0.99);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

/* 威胁等级染色：浅色底 + 左侧色条（业务含义一目了然） */
.ip-item.threat-high {
    background-color: #fef3f3;
    border-left-color: #f56c6c;
}

.ip-item.threat-medium {
    background-color: #fef7ed;
    border-left-color: #e6a23c;
}

.ip-item.threat-normal {
    background-color: #f4f4f5;
    border-left-color: #909399;
}

.ip-item.threat-low {
    background-color: #eef6ff;
    border-left-color: #409eff;
}

/* ==================== 排名徽章 ==================== */
.rank-badge {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    flex-shrink: 0;
}

/* 前三名：奖牌放大居中 */
.badge-gold,
.badge-silver,
.badge-bronze {
    .rank-medal {
        font-size: 48rpx;
        line-height: 1;
    }
}

/* 普通排名：白底圆圈，在染色卡片上更清爽 */
.badge-normal {
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.75);
    border: 2rpx solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: center;

    .rank-num {
        font-size: 24rpx;
        font-weight: 600;
        color: #909399;
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
    gap: 12rpx;
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
    padding: 4rpx 16rpx;
    border-radius: 16rpx;
    font-size: 20rpx;
    font-weight: 600;
    flex-shrink: 0;
    white-space: nowrap;
}

.ip-threat.threat-high {
    background-color: #fde2e2;
    color: #f56c6c;
}

.ip-threat.threat-medium {
    background-color: #fbeccd;
    color: #e6a23c;
}

.ip-threat.threat-normal {
    background-color: #e9e9eb;
    color: #909399;
}

.ip-threat.threat-low {
    background-color: #d9ecff;
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
    flex-shrink: 0;
}

.count-num {
    font-size: 32rpx;
    font-weight: 700;
    line-height: 1;
}

/* 攻击次数按威胁染色，突出关键数字 */
.count-num.threat-high {
    color: #f56c6c;
}

.count-num.threat-medium {
    color: #e6a23c;
}

.count-num.threat-normal {
    color: #909399;
}

.count-num.threat-low {
    color: #409eff;
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
    background-color: rgba(255, 255, 255, 0.7);
    color: #606266;
}

.jail-unknown {
    font-size: 20rpx;
    color: #c0c4cc;
}

/* 第三行：攻击强度条 */
.intensity-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 2rpx;
}

.intensity-bar {
    flex: 1;
    height: 10rpx;
    background-color: rgba(0, 0, 0, 0.06);
    border-radius: 6rpx;
    overflow: hidden;
}

.intensity-fill {
    height: 100%;
    border-radius: 6rpx;
    transition: width 0.4s ease;
}

.intensity-fill.threat-high {
    background: linear-gradient(90deg, #f8a8a8, #f56c6c);
}

.intensity-fill.threat-medium {
    background: linear-gradient(90deg, #f3c98a, #e6a23c);
}

.intensity-fill.threat-normal {
    background: linear-gradient(90deg, #b8b9bb, #909399);
}

.intensity-fill.threat-low {
    background: linear-gradient(90deg, #8ec5ff, #409eff);
}

.intensity-pct {
    font-size: 20rpx;
    color: #909399;
    min-width: 56rpx;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

/* ==================== 空状态 ==================== */
.empty-text {
    text-align: center;
    padding: 60rpx 40rpx;
    color: #909399;
    font-size: 26rpx;
}

/* ==================== 回到默认 Top3 按钮（清新薄荷渐变，区别于趋势展开/收起） ==================== */
.reset-top-wrap {
    display: flex;
    justify-content: center;
    margin-top: 32rpx;
}

.reset-top-btn {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 18rpx 44rpx;
    background: linear-gradient(135deg, #5fe4c8 0%, #2bc4a3 100%);
    border-radius: 40rpx;
    box-shadow: 0 6rpx 18rpx rgba(43, 196, 163, 0.35);
    transition: all 0.2s ease;
}

.reset-top-btn:active {
    transform: scale(0.95);
    opacity: 0.9;
}

.reset-top-text {
    font-size: 26rpx;
    color: #fff;
    font-weight: 600;
    line-height: 1;
}
</style>
