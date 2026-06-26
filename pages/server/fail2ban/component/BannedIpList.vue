<template>
    <view class="status-card">
        <view class="status-header">
            <text class="title">全量封禁IP列表</text>
            <view class="header-actions">
                <text class="header-sub">共 {{ allBannedIps.length }} 个</text>
            </view>
        </view>

        <view class="all-banned-ips">
            <view class="ip-tag ip-tag-danger" v-for="ip in displayedIps" :key="ip">
                <text class="ip-text">{{ ip }}</text>
            </view>
            <view v-if="allBannedIps.length === 0" class="empty-text">
                暂无被封禁的IP
            </view>
        </view>

        <!-- 展开/收起按钮：默认只展示20个，超过时可展开全部。折叠态红色封禁警示，展开态清新蓝色 -->
        <view class="banned-toggle" :class="{ 'is-expanded': expanded }" v-if="hasMore" @click="toggleExpand">
            <view class="toggle-text-wrap">
                <text class="toggle-text">{{ expanded ? `收起，只看Top${pageSize}即可` : '展开，查看全部封禁IP' }}</text>
                <view class="toggle-count">{{ expanded ? `总计${allBannedIps.length}个` : `还有${allBannedIps.length -
                    pageSize}个` }}</view>
            </view>
            <uni-icons :type="expanded ? 'arrowup' : 'arrowdown'" size="26rpx"
                :color="expanded ? '#409eff' : '#f56c6c'"></uni-icons>
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
            // 默认折叠只展示前10个，避免长列表撑高页面
            pageSize: 10,
            expanded: false
        };
    },
    computed: {
        displayedIps() {
            return this.expanded ? this.allBannedIps : this.allBannedIps.slice(0, this.pageSize);
        },
        hasMore() {
            return this.allBannedIps.length > this.pageSize;
        }
    },
    methods: {
        toggleExpand() {
            this.expanded = !this.expanded;
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

.header-actions {
    width: auto;
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

.ip-tag-danger {
    background-color: #f56c6c;
}

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

/* 展开/收起按钮：封禁IP红色主题药丸，区别于趋势面板的蓝色文字链接 */
.banned-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18rpx 24rpx;
    border: 2rpx solid #fbc4c4;
    border-radius: 32rpx;
    background-color: #fef0f0;
    transition: all 0.2s ease;
}

.banned-toggle:active {
    transform: scale(0.99);
    background-color: #fde7e7;
}

.toggle-text-wrap {
    display: flex;
    align-items: center;
    gap: 12rpx;
    min-width: 0;
}

.toggle-text {
    font-size: 26rpx;
    color: #f56c6c;
    font-weight: 500;
}

.toggle-count {
    font-size: 22rpx;
    color: #fff;
    background-color: #f56c6c;
    padding: 4rpx 14rpx;
    border-radius: 20rpx;
    white-space: nowrap;
    flex-shrink: 0;
}

/* 展开态：清新蓝色主题（已展示全部，视觉从警示转平和） */
.banned-toggle.is-expanded {
    border-color: #c6e2ff;
    background-color: #ecf5ff;
}

.banned-toggle.is-expanded:active {
    background-color: #d9ecff;
}

.banned-toggle.is-expanded .toggle-text {
    color: #409eff;
}

.banned-toggle.is-expanded .toggle-count {
    background-color: #409eff;
}
</style>
