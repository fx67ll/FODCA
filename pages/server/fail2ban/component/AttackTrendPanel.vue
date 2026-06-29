<template>
    <view>
        <!-- 最近攻击趋势卡片 -->
        <view class="status-card trend-card">
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
            <view class="trend-list" :class="expanded ? 'list-expanded' : 'list-collapsed'">
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
                    <!-- 微信小程序模板不支持调用带参方法，H5 用方法调用，MP-WEIXIN 用预计算字段 -->
                    <!-- #ifdef H5 -->
                    <view class="hourly-ip-item" :class="getThreatClass(item.count)"
                        v-for="(item, index) in currentHourTopIpsRanked" :key="index">
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
                                    <text class="count-num" :class="getThreatClass(item.count)">{{ item.count }}</text>
                                    <text class="count-unit">次攻击</text>
                                </view>
                                <view class="jail-tag-wrap">
                                    <text class="ip-jail-tag" v-for="jail in splitJails(item.jails)" :key="jail">
                                        {{ jail }}
                                    </text>
                                    <text v-if="!splitJails(item.jails).length" class="jail-unknown">未知监狱</text>
                                </view>
                            </view>
                            <!-- 攻击强度条（相对当前时段峰值占比） -->
                            <view class="intensity-row">
                                <view class="intensity-bar">
                                    <view class="intensity-fill" :class="getThreatClass(item.count)"
                                        :style="{ width: item.intensity + '%' }">
                                    </view>
                                </view>
                                <text class="intensity-pct">{{ item.intensity }}%</text>
                            </view>
                        </view>
                    </view>
                    <!-- #endif -->
                    <!-- #ifdef MP-WEIXIN -->
                    <view class="hourly-ip-item" :class="item.threatClass"
                        v-for="(item, index) in currentHourTopIpsRanked" :key="index">
                        <!-- 排名徽章（允许并列，名次按攻击次数计算） -->
                        <view class="rank-badge" :class="item.rankBadgeClass">
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
                                <view class="ip-threat" :class="item.threatClass">
                                    {{ item.threatText }}
                                </view>
                            </view>
                            <!-- 攻击次数 + 监狱标签 -->
                            <view class="ip-meta-row">
                                <view class="count-badge">
                                    <text class="count-num" :class="item.threatClass">{{ item.count }}</text>
                                    <text class="count-unit">次攻击</text>
                                </view>
                                <view class="jail-tag-wrap">
                                    <text class="ip-jail-tag" v-for="jail in item.jailList" :key="jail">
                                        {{ jail }}
                                    </text>
                                    <text v-if="!item.jailList.length" class="jail-unknown">未知监狱</text>
                                </view>
                            </view>
                            <!-- 攻击强度条（相对当前时段峰值占比） -->
                            <view class="intensity-row">
                                <view class="intensity-bar">
                                    <view class="intensity-fill" :class="item.threatClass"
                                        :style="{ width: item.intensity + '%' }">
                                    </view>
                                </view>
                                <text class="intensity-pct">{{ item.intensity }}%</text>
                            </view>
                        </view>
                    </view>
                    <!-- #endif -->
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
            // 峰值作为强度条基准（避免除零）
            const maxCount = sorted.length ? Math.max(...sorted.map(i => i.count || 0), 1) : 1;
            let lastCount = null;
            let lastRank = 0;
            return sorted.map((item, index) => {
                const count = item.count || 0;
                // 并列排名：相同攻击次数共享名次，下一位根据并列数量顺延（1224 排名）
                const rank = (lastCount === null || count !== lastCount) ? index + 1 : lastRank;
                lastCount = count;
                lastRank = rank;
                return {
                    ...item,
                    rank,
                    intensity: Math.round((count / maxCount) * 100),
                    // 微信小程序模板不支持调用带参方法，预计算以下字段供 MP-WEIXIN 分支使用
                    threatClass: this.getThreatClass(count),
                    threatText: this.getThreatLevelText(count),
                    rankBadgeClass: this.getRankBadgeClass(rank),
                    jailList: this.splitJails(item.jails)
                };
            });
        }
    },
    methods: {
        toggleExpand() {
            if (this.expanded) {
                // 收起时先滚动到卡片标题处，再执行收起动画
                this.scrollToCard().then(() => {
                    this.expanded = false;
                });
            } else {
                this.expanded = true;
            }
        },

        scrollToCard() {
            return new Promise((resolve) => {
                const query = uni.createSelectorQuery().in(this);
                query.select('.trend-card').boundingClientRect();
                query.selectViewport().scrollOffset();
                query.exec((res) => {
                    const rect = res[0];
                    const viewport = res[1];
                    if (rect && viewport) {
                        const target = viewport.scrollTop + rect.top - 16;
                        uni.pageScrollTo({
                            scrollTop: Math.max(target, 0),
                            duration: 300
                        });
                    }
                    // 等滚动动画完成后再收起
                    setTimeout(resolve, 350);
                });
            });
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
    overflow: hidden;
    transition: max-height 0.5s ease-in-out;
}

.trend-list.list-collapsed {
    max-height: 800rpx;
}

.trend-list.list-expanded {
    max-height: 3500rpx;
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

.fill-primary {
    background: linear-gradient(90deg, #66b1ff, #409eff);
}

.fill-danger {
    background: linear-gradient(90deg, #f78989, #f56c6c);
}

.trend-count {
    width: 80rpx;
    text-align: right;
    white-space: nowrap;
    font-size: 24rpx;
    font-weight: 500;
    color: #303133;
    flex-shrink: 0;
}

.text-danger {
    color: #f5222d !important;
}

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
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
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

/* ==================== 弹窗内 IP 卡片（威胁染色柔色底，与 AttackStatsPanel 一致） ==================== */
.hourly-ip-item {
    display: flex;
    align-items: center;
    padding: 24rpx 24rpx 22rpx 20rpx;
    border-radius: 18rpx;
    background-color: #f8f9fa;
    border-left: 8rpx solid #c0c4cc;
    margin-bottom: 20rpx;
    transition: all 0.2s ease;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.hourly-ip-item:active {
    transform: scale(0.99);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

/* 威胁等级染色：浅色底 + 左侧色条 */
.hourly-ip-item.threat-high {
    background-color: #fef3f3;
    border-left-color: #f56c6c;
}

.hourly-ip-item.threat-medium {
    background-color: #fef7ed;
    border-left-color: #e6a23c;
}

.hourly-ip-item.threat-normal {
    background-color: #f4f4f5;
    border-left-color: #909399;
}

.hourly-ip-item.threat-low {
    background-color: #eef6ff;
    border-left-color: #409eff;
}

/* 排名徽章 */
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

.badge-gold,
.badge-silver,
.badge-bronze {
    .rank-medal {
        font-size: 48rpx;
        line-height: 1;
    }
}

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

/* 信息区 */
.ip-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
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

/* 攻击强度条 */
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

.empty-text {
    text-align: center;
    padding: 60rpx 40rpx;
    color: #909399;
    font-size: 26rpx;
}
</style>
