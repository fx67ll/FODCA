<template>
    <view>
        <!-- 最近攻击趋势卡片 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">{{ cardTitle }}</text>
                <view class="trend-stats">
                    <text class="stat-item">总攻击：{{ displayedTotal }} 次</text>
                    <text class="stat-item">峰值：{{ displayedMax }} 次/小时</text>
                </view>
            </view>
            <!-- <view class="trend-tip">
                <uni-icons type="info" size="24rpx" color="#909399"></uni-icons>
                <text class="trend-tip-text">点击时段查看Top攻击IP</text>
            </view> -->
            <view class="trend-list">
                <view class="trend-item" v-for="(item, index) in displayedData" :key="index"
                    @click="openHourlyDetail(item)">
                    <text class="trend-hour">{{ item.dateTime }}</text>
                    <view class="trend-bar">
                        <view class="trend-fill" :class="item.isOverThreshold ? 'fill-danger' : 'fill-primary'"
                            :style="{ width: (displayedMax > 0 ? Math.min((item.count / displayedMax) * 100, 100) : 0) + '%' }">
                        </view>
                    </view>
                    <text class="trend-count" :class="item.isOverThreshold ? 'text-danger' : ''">{{ item.count }}</text>
                </view>
            </view>
            <!-- 展开/收起按钮 -->
            <view class="expand-btn" @click="toggleExpand">
                <uni-icons :type="expanded ? 'arrowup' : 'arrowdown'" size="28rpx" color="#409eff"></uni-icons>
                <text class="expand-btn-text">{{ expanded ? '收起，只看最近6小时' : '展开，查看全部24小时' }}</text>
            </view>
        </view>

        <!-- 时段攻击IP详情弹窗 -->
        <view class="jail-detail-mask" v-show="showHourlyDetail" @click="closeHourlyDetail"></view>
        <view class="jail-detail-popup" :class="{ 'show': showHourlyDetail }">
            <view class="popup-drag-bar"></view>
            <view class="popup-header">
                <text class="popup-title">{{ currentHourLabel }} Top攻击IP</text>
                <uni-icons type="close" size="44rpx" color="#909399" @click="closeHourlyDetail"></uni-icons>
            </view>
            <view class="popup-content">
                <view v-if="currentHourTopIps.length > 0">
                    <view
                        class="hourly-ip-item"
                        :class="[`item-rank-${item.rank}`, getThreatClass(item.count)]"
                        v-for="(item, index) in currentHourTopIpsRanked"
                        :key="index"
                    >
                        <!-- 排名徽章（允许并列，名次按攻击次数计算） -->
                        <view class="rank-badge" :class="getRankBadgeClass(item.rank)">
                            <template v-if="item.rank <= 3">
                                <text class="rank-medal">{{ medalEmoji[item.rank - 1] }}</text>
                            </template>
                            <text v-else class="rank-num">{{ item.rank }}</text>
                        </view>

                        <!-- IP 信息 -->
                        <view class="ip-info">
                            <!-- IP 地址 + 威胁等级 -->
                            <view class="ip-main-row">
                                <text class="ip-address">{{ item.ip }}</text>
                                <view class="ip-threat" :class="getThreatClass(item.count)">
                                    {{ getThreatLevelText(item.count) }}
                                </view>
                            </view>
                            <!-- 攻击次数 + 监狱标签 -->
                            <view class="ip-meta-row">
                                <view class="count-badge">
                                    <text class="count-num">{{ item.count }}</text>
                                    <text class="count-unit">次攻击</text>
                                </view>
                                <view class="jail-tag-wrap">
                                    <text class="ip-jail-tag" v-for="jail in splitJails(item.jails)" :key="jail">
                                        {{ jail }}
                                    </text>
                                    <text v-if="!splitJails(item.jails).length" class="jail-unknown">未知监狱</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
                <view v-else class="empty-text">该时段暂无攻击IP记录</view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: "AttackTrendPanel",
    props: {
        trendData: {
            type: Array,
            default: () => []
        },
        maxTrendCount: {
            type: Number,
            default: 1
        },
        totalTrendAttacks: {
            type: Number,
            default: 0
        },
        baselineMaxRetry: {
            type: Number,
            default: 5
        }
    },
    data() {
        return {
            expanded: false,
            showHourlyDetail: false,
            currentHourLabel: "",
            currentHourTopIps: [],
            medalEmoji: ['🥇', '🥈', '🥉']
        };
    },
    computed: {
        // 当前显示的数据：折叠时取最近6条，展开时全部24条
        displayedData() {
            return this.expanded ? this.trendData : this.trendData.slice(0, 6);
        },
        // 当前区间的总攻击次数
        displayedTotal() {
            return this.displayedData.reduce((sum, item) => sum + item.count, 0);
        },
        // 当前区间的峰值（柱宽基准，避免折叠态柱条全被压扁）
        displayedMax() {
            const counts = this.displayedData.map(item => item.count);
            return counts.length ? Math.max(...counts, 1) : 1;
        },
        cardTitle() {
            return this.expanded ? '最近24小时攻击趋势' : '最近6小时攻击趋势';
        },
        // 时段Top攻击IP（按攻击次数降序，允许并列，名次顺延）
        currentHourTopIpsRanked() {
            const sorted = [...this.currentHourTopIps].sort((a, b) => (b.count || 0) - (a.count || 0));
            let lastCount = null;
            let lastRank = 0;
            return sorted.map((item, index) => {
                const count = item.count || 0;
                // 并列排名：相同攻击次数共享名次，下一位根据并列数量顺延（1224 排名）
                const rank = (lastCount === null || count !== lastCount) ? index + 1 : lastRank;
                lastCount = count;
                lastRank = rank;
                return { ...item, rank };
            });
        }
    },
    methods: {
        toggleExpand() {
            this.expanded = !this.expanded;
        },

        getRankBadgeClass(rank) {
            if (rank === 1) return 'badge-gold';
            if (rank === 2) return 'badge-silver';
            if (rank === 3) return 'badge-bronze';
            return 'badge-normal';
        },

        openHourlyDetail(item) {
            if (!item.topIps || item.topIps.length === 0) {
                uni.showToast({ title: "该时段暂无攻击IP记录", icon: "none", duration: 1500 });
                return;
            }
            this.currentHourLabel = item.dateTime;
            this.currentHourTopIps = item.topIps;
            this.showHourlyDetail = true;
        },

        closeHourlyDetail() {
            this.showHourlyDetail = false;
            setTimeout(() => {
                this.currentHourTopIps = [];
                this.currentHourLabel = "";
            }, 300);
        },

        splitJails(jails) {
            if (!jails) return [];
            return jails.split(', ').filter(Boolean);
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
    position: relative;
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

.trend-stats {
    width: 100%;
    display: flex;
    align-items: center;
}

.trend-stats .stat-item {
    font-size: 24rpx;
    color: #606266;
    font-weight: 500;
    margin-right: 48rpx;
}

.trend-tip {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 20rpx;
    position: relative;
    top: -8rpx;
}

.trend-tip-text {
    font-size: 22rpx;
    color: #909399;
}

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
    min-width: 4rpx;
}

.fill-primary { background: linear-gradient(90deg, #66b1ff, #409eff); }
.fill-danger { background: linear-gradient(90deg, #f78989, #f56c6c); }

.trend-count {
    width: 80rpx;
    text-align: right;
    white-space: nowrap;
    font-size: 24rpx;
    font-weight: 500;
    color: #303133;
    flex-shrink: 0;
}

.text-danger { color: #f5222d !important; }

.expand-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10rpx;
    margin-top: 28rpx;
    padding: 20rpx 0;
    border-top: 1rpx solid #f0f2f5;
}

.expand-btn:active {
    opacity: 0.7;
}

.expand-btn-text {
    font-size: 26rpx;
    color: #409eff;
    font-weight: 500;
}

/* 弹窗 */
.jail-detail-mask {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.jail-detail-popup {
    position: fixed;
    left: 0; right: 0; bottom: 0;
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

.jail-detail-popup.show { transform: translateY(0); }

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
    box-sizing: border-box;
}

/* ==================== 弹窗内 IP 卡片（与 AttackStatsPanel 保持一致） ==================== */
.hourly-ip-item {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx;
    border-radius: 18rpx;
    background-color: #f8f9fa;
    border-left: 8rpx solid #e4e7ed;
    margin-bottom: 20rpx;
    transition: all 0.2s ease;
}

.hourly-ip-item:active {
    transform: scale(0.99);
    opacity: 0.9;
}

/* 前三名背景 */
.hourly-ip-item.item-rank-1 {
    background: linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%);
    border-left-color: #f5a623;
}

.hourly-ip-item.item-rank-2 {
    background: linear-gradient(135deg, #f8f9fb 0%, #f2f4f7 100%);
    border-left-color: #a0aab8;
}

.hourly-ip-item.item-rank-3 {
    background: linear-gradient(135deg, #fdf8f5 0%, #faf3ee 100%);
    border-left-color: #c8845a;
}

/* 4名以后用威胁颜色 */
.hourly-ip-item.threat-high   { border-left-color: #f56c6c; }
.hourly-ip-item.threat-medium { border-left-color: #e6a23c; }
.hourly-ip-item.threat-normal { border-left-color: #909399; }
.hourly-ip-item.threat-low    { border-left-color: #409eff; }

/* 排名徽章 */
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

.badge-gold   { .rank-medal { font-size: 40rpx; line-height: 1; } .medal-num { font-size: 20rpx; font-weight: 700; color: #d48806; } }
.badge-silver { .rank-medal { font-size: 40rpx; line-height: 1; } .medal-num { font-size: 20rpx; font-weight: 700; color: #7a8a9a; } }
.badge-bronze { .rank-medal { font-size: 40rpx; line-height: 1; } .medal-num { font-size: 20rpx; font-weight: 700; color: #9d6035; } }

.badge-normal {
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    background-color: #e8eaed;
    display: flex;
    align-items: center;
    justify-content: center;
    .rank-num { font-size: 24rpx; font-weight: 600; color: #606266; }
}

.rank-num   { line-height: 1; }
.rank-medal { display: block; }

/* 信息区 */
.ip-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14rpx;
    min-width: 0;
}

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

.threat-high   { background-color: #fef0f0; color: #f56c6c; }
.threat-medium { background-color: #fdf6ec; color: #e6a23c; }
.threat-normal { background-color: #f4f4f5; color: #909399; }
.threat-low    { background-color: #e6f4ff; color: #409eff; }

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

.empty-text {
    text-align: center;
    padding: 60rpx 40rpx;
    color: #909399;
    font-size: 26rpx;
}

@media (min-width: 768px) {
    .status-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .trend-stats { width: auto; gap: 24rpx; }
}
</style>
