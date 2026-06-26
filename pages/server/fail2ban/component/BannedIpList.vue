<template>
    <view class="status-card">
        <view class="status-header">
            <text class="title">全量封禁IP列表</text>
            <view class="header-actions">
                <text class="header-sub">共 {{ allBannedIps.length }} 个</text>
            </view>
        </view>

        <view class="all-banned-ips">
            <view class="ip-tag ip-tag-danger" v-for="ip in paginatedIps" :key="ip">
                <text class="ip-text">{{ ip }}</text>
            </view>
            <view v-if="allBannedIps.length === 0" class="empty-text">
                暂无被封禁的IP
            </view>
        </view>

        <view class="load-more" @click="loadMore" v-if="hasMore">
            <text>加载更多</text>
        </view>
        <view class="no-more" v-else-if="allBannedIps.length > pageSize">
            <text>没有更多了</text>
        </view>
    </view>
</template>

<script>
export default {
    name: "BannedIpList",
    props: {
        allBannedIps: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            currentPage: 1,
            pageSize: 100
        };
    },
    computed: {
        paginatedIps() {
            return this.allBannedIps.slice(0, this.currentPage * this.pageSize);
        },
        hasMore() {
            return this.currentPage * this.pageSize < this.allBannedIps.length;
        }
    },
    watch: {
        // 数据刷新时尽量保持浏览位置：仅当当前页已超出数据范围时才回退
        allBannedIps(newList) {
            const maxPage = Math.max(1, Math.ceil(newList.length / this.pageSize));
            if (this.currentPage > maxPage) this.currentPage = maxPage;
        }
    },
    methods: {
        loadMore() {
            this.currentPage++;
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

.all-banned-ips {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 24rpx;
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

.ip-tag-danger { background-color: #f56c6c; }

.ip-text {
    max-width: 220rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-text {
    text-align: center;
    padding: 60rpx 40rpx;
    color: #909399;
    font-size: 26rpx;
    width: 100%;
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

@media (min-width: 768px) {
    .status-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .header-actions { width: auto; }
}
</style>
