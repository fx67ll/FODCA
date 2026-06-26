<template>
    <view>
        <!-- 监狱防护状态列表 -->
        <view class="status-card">
            <view class="status-header">
                <text class="title">监狱防护状态</text>
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
                                <text class="stat-num" :class="statNumClass(jail.currentlyFailed, 'fail')">{{
                                    jail.currentlyFailed || 0 }}</text>
                                <text class="stat-label">当前失败</text>
                            </view>
                            <view class="jail-stat-item">
                                <text class="stat-num" :class="statNumClass(jail.totalFailed, 'fail')">{{
                                    jail.totalFailed || 0 }}</text>
                                <text class="stat-label">总失败尝试</text>
                            </view>
                            <view class="jail-stat-item">
                                <text class="stat-num" :class="statNumClass(jail.currentlyBanned, 'ban')">{{
                                    jail.currentlyBanned || 0 }}</text>
                                <text class="stat-label">当前封禁</text>
                            </view>
                            <view class="jail-stat-item">
                                <text class="stat-num" :class="statNumClass(jail.totalBanned, 'ban')">{{
                                    jail.totalBanned || 0 }}</text>
                                <text class="stat-label">累计封禁</text>
                            </view>
                        </view>
                    </view>
                    <uni-icons type="arrowright" size="32rpx" color="#c0c4cc"></uni-icons>
                </view>
            </view>

            <view class="load-more" @click="loadMore" v-if="hasMore">
                <text>加载更多监狱</text>
            </view>
            <view class="no-more" v-else-if="sortedJailList.length > pageSize">
                <text>没有更多监狱</text>
            </view>
        </view>

        <!-- 监狱详情弹窗 -->
        <view class="jail-detail-mask" v-show="showDetail" @click="closeDetail"></view>
        <view class="jail-detail-popup" :class="{ 'show': showDetail }">
            <view class="popup-drag-bar"></view>
            <view class="popup-header">
                <text class="popup-title">{{ detailData.name || '' }} 监狱详情</text>
                <uni-icons type="close" size="44rpx" color="#909399" @click="closeDetail"></uni-icons>
            </view>
            <view class="popup-content">
                <view v-if="!isLoading" class="jail-detail">
                    <view class="detail-section">
                        <text class="section-title">监狱基本信息</text>
                        <view class="detail-grid">
                            <view class="detail-item" style="grid-column: span 2;">
                                <text class="detail-label">运行状态</text>
                                <text class="detail-value" :class="detailData.status === '运行中' ? 'text-success' : ''">
                                    {{ detailData.status }}
                                </text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">当前失败</text>
                                <text class="detail-value" :class="statNumClass(detailData.currentlyFailed, 'fail')">{{
                                    detailData.currentlyFailed || '0' }}</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">总失败尝试</text>
                                <text class="detail-value" :class="statNumClass(detailData.totalFailed, 'fail')">{{
                                    detailData.totalFailed || '0' }}</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">当前封禁</text>
                                <text class="detail-value" :class="statNumClass(detailData.currentlyBanned, 'ban')">{{
                                    detailData.currentlyBanned || '0' }}</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">累计封禁</text>
                                <text class="detail-value" :class="statNumClass(detailData.totalBanned, 'ban')">{{
                                    detailData.totalBanned || '0' }}</text>
                            </view>
                            <view class="detail-item" style="grid-column: span 2;">
                                <text class="detail-label">日志路径</text>
                                <text class="detail-value">{{ detailData.logPath || '未知' }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="detail-section">
                        <text class="section-title">监狱配置参数</text>
                        <view class="detail-grid">
                            <view class="detail-item">
                                <text class="detail-label">封禁时长</text>
                                <text class="detail-value">{{ detailData.config.bantime || '未知' }}</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">检测窗口</text>
                                <text class="detail-value">{{ detailData.config.findtime || '未知' }}</text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">最大重试次数</text>
                                <text class="detail-value">
                                    {{ detailData.config.maxretry !== undefined ?
                                        `${detailData.config.maxretry}次` : '未知' }}
                                </text>
                            </view>
                            <view class="detail-item">
                                <text class="detail-label">白名单IP数量</text>
                                <text class="detail-value">{{ detailData.config.ignoreIpList.length }} 个</text>
                            </view>
                            <view class="detail-item" style="grid-column: span 2;">
                                <text class="detail-label">监狱白名单</text>
                                <view class="ip-tag-wrap">
                                    <text class="ip-tag info-tag" v-for="ip in detailData.config.ignoreIpList"
                                        :key="ip">
                                        {{ ip }}
                                    </text>
                                    <text v-if="!detailData.config.ignoreIpList.length"
                                        style="color: #909399;font-size:24rpx;">
                                        无白名单配置
                                    </text>
                                </view>
                            </view>
                        </view>
                    </view>

                    <view class="detail-section">
                        <text class="section-title">当前被封禁IP ({{ detailData.bannedIps.length }})</text>
                        <view class="banned-ips">
                            <view class="ip-tag ip-tag-danger" v-for="ip in detailData.bannedIps" :key="ip">
                                <text class="ip-text">{{ ip }}</text>
                            </view>
                            <view v-if="!detailData.bannedIps.length" class="empty-text">
                                暂无被封禁的IP
                            </view>
                        </view>
                    </view>
                </view>
                <view v-else class="loading-text">{{ loadingText }}</view>
            </view>
        </view>
    </view>
</template>

<script>
import { getJailDetail } from "@/api/fx67ll/server/fail2ban";

export default {
    name: "JailStatusPanel",
    props: {
        jailList: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            currentPage: 1,
            pageSize: 5,
            showDetail: false,
            isLoading: false,
            loadingText: "加载中...",
            detailTimeout: null,
            detailData: {
                name: '', status: "", currentlyFailed: 0, currentlyBanned: 0,
                totalBanned: 0, totalFailed: 0, logPath: '',
                config: { bantime: '', findtime: '', maxretry: undefined, ignoreIpList: [] },
                bannedIps: []
            }
        };
    },
    computed: {
        sortedJailList() {
            return [...this.jailList].sort((a, b) => {
                if (a.status === '运行中' && b.status !== '运行中') return -1;
                if (a.status !== '运行中' && b.status === '运行中') return 1;
                return 0;
            });
        },
        paginatedJailList() {
            return this.sortedJailList.slice(0, this.currentPage * this.pageSize);
        },
        hasMore() {
            return this.currentPage * this.pageSize < this.sortedJailList.length;
        }
    },
    watch: {
        // 数据刷新时尽量保持浏览位置：仅当当前页已超出数据范围时才回退，避免刷新导致列表跳变
        jailList(newList) {
            const maxPage = Math.max(1, Math.ceil(newList.length / this.pageSize));
            if (this.currentPage > maxPage) this.currentPage = maxPage;
        }
    },
    methods: {
        loadMore() {
            this.currentPage++;
        },

        // 数字业务含义着色：封禁类(红) / 失败类(橙) / 零值(灰)，参考 Web 端 JailStatusPanel
        statNumClass(value, type) {
            const num = Number(value) || 0;
            if (num === 0) return 'num-zero';
            return type === 'ban' ? 'num-ban' : 'num-fail';
        },

        async openJailDetail(row) {
            if (this.isLoading) return;
            this.isLoading = true;
            this.loadingText = "加载中...";
            this.detailData = {
                name: row.name, status: "", currentlyFailed: 0, currentlyBanned: 0,
                totalBanned: 0, totalFailed: 0, logPath: '',
                config: { bantime: '', findtime: '', maxretry: undefined, ignoreIpList: [] },
                bannedIps: []
            };
            this.showDetail = true;

            this.detailTimeout = setTimeout(() => {
                this.loadingText = "请求超时，请重试";
                this.isLoading = false;
            }, 10000);

            try {
                const res = await getJailDetail(row.name);
                const data = res.data || {};
                this.detailData = {
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
                uni.showToast({ title: "获取详情失败", icon: "none", duration: 2000 });
            } finally {
                if (this.detailTimeout) {
                    clearTimeout(this.detailTimeout);
                    this.detailTimeout = null;
                }
                this.isLoading = false;
            }
        },

        closeDetail() {
            this.showDetail = false;
            if (this.detailTimeout) {
                clearTimeout(this.detailTimeout);
                this.detailTimeout = null;
            }
            setTimeout(() => {
                this.detailData = {
                    name: '', status: "", currentlyFailed: 0, currentlyBanned: 0,
                    totalBanned: 0, totalFailed: 0, logPath: '',
                    config: { bantime: '', findtime: '', maxretry: undefined, ignoreIpList: [] },
                    bannedIps: []
                };
                this.loadingText = "加载中...";
            }, 300);
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
}

.title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1f2d3d;
}

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

.stat-label {
    font-size: 20rpx;
    color: #909399;
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
    position: relative;
    box-sizing: border-box;
}

.popup-content .loading-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
    display: block;
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

.text-success {
    color: #52c41a !important;
}

/* 数字业务含义着色（参考 Web 端 JailStatusPanel）：封禁类红、失败类橙、零值灰 */
.num-ban {
    color: #ff8787 !important;
    font-weight: 700;
}

.num-fail {
    color: #fcac50 !important;
    font-weight: 700;
}

.num-zero {
    color: #c0c4cc !important;
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
}

.empty-text {
    text-align: center;
    padding: 60rpx 40rpx;
    color: #909399;
    font-size: 26rpx;
}
</style>
