<template>
    <view class="app-container">
        <!-- 卡片容器 -->
        <view class="status-card">
            <!-- 头部区域 -->
            <view class="status-header">
                <!-- 刷新区域 -->
                <view class="refresh-container">
                    <button class="refresh-btn" :loading="isRefreshing" @click="handleRefresh">
                        <uni-icons type="refresh" size="16" color="#409eff"></uni-icons>
                        <text class="btn-text">手动刷新</text>
                    </button>
                    <text class="refresh-time">最后刷新: {{ lastRefreshTime }}</text>
                </view>
            </view>

            <!-- 状态内容区 -->
            <view class="status-content">
                <!-- 状态指示器 -->
                <view class="status-indicator">
                    <view class="indicator-dot" :class="status === '运行中' ? 'running' : 'stopped'"></view>
                    <text class="status-text">{{ status }}</text>
                </view>

                <!-- 操作按钮区 -->
                <view class="operation-buttons">
                    <button class="btn start-btn" :disabled="status === '运行中' || isOperating"
                        :loading="isOperating && status !== '运行中'" @click="startTomcat">
                        <uni-icons type="play" size="14" color="#fff"></uni-icons>
                        <text class="btn-text">启动服务</text>
                    </button>
                    <button class="btn stop-btn" :disabled="status === '已停止' || isOperating"
                        :loading="isOperating && status !== '已停止'" @click="stopTomcat">
                        <uni-icons type="stop" size="14" color="#fff"></uni-icons>
                        <text class="btn-text">停止服务</text>
                    </button>
                </view>
            </view>

            <!-- 操作日志区 -->
            <view class="status-log" v-if="logInfo">
                <text class="log-title">操作日志</text>
                <view class="log-content">
                    <text class="log-text">{{ logInfo }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { getTomcatStatus, startTomcat, stopTomcat } from "@/api/fx67ll/server/tomcat";

export default {
    name: "TomcatManager",
    data() {
        return {
            status: "加载中...",
            lastRefreshTime: "",
            logInfo: "",
            isOperating: false,
            refreshInterval: null,
            isRefreshing: false // 刷新按钮加载状态
        };
    },
    onLoad() {
        // 初始化查询状态
        this.queryStatus();

        // 设置自动刷新，每10秒一次
        this.refreshInterval = setInterval(() => {
            this.queryStatus();
        }, 10000);
    },
    onUnload() {
        // 清除定时器
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    },
    methods: {
        /**
         * 手动刷新状态
         */
        handleRefresh() {
            this.isRefreshing = true;
            this.queryStatus().finally(() => {
                this.isRefreshing = false; // 无论成功失败，都关闭加载状态
            });
        },

        /**
         * 查询Tomcat状态
         */
        queryStatus() {
            // 注：此处替换为你的uniapp接口调用逻辑
            return new Promise((resolve, reject) => {
                getTomcatStatus().then(response => {
                    this.status = response.data;
                    this.lastRefreshTime = this.formatDateTime(new Date());
                    resolve();
                }).catch(error => {
                    uni.showToast({
                        title: "查询状态失败: " + (error.msg || error.message),
                        icon: "none",
                        duration: 2000
                    });
                    this.status = "未知";
                    reject(error);
                });
            });
        },

        /**
         * 启动Tomcat
         */
        startTomcat() {
            uni.showModal({
                title: '提示',
                content: '确定要启动Tomcat服务吗？',
                confirmText: '确定',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        this.isOperating = true;
                        this.logInfo = "正在启动Tomcat服务...";

                        startTomcat().then(response => {
                            uni.showToast({
                                title: response.msg,
                                icon: "success",
                                duration: 2000
                            });
                            this.logInfo = response.data || response.msg;
                            // 启动后立即查询一次状态，然后等待3秒再查一次
                            setTimeout(() => {
                                this.queryStatus();
                                setTimeout(() => {
                                    this.queryStatus();
                                    this.isOperating = false;
                                }, 3000);
                            }, 1000);
                        }).catch(error => {
                            uni.showToast({
                                title: error.msg || "启动失败",
                                icon: "none",
                                duration: 2000
                            });
                            this.logInfo = error.msg || "启动失败";
                            this.isOperating = false;
                            this.queryStatus();
                        });
                    } else {
                        uni.showToast({
                            title: '已取消启动',
                            icon: "none",
                            duration: 2000
                        });
                    }
                }
            });
        },

        /**
         * 停止Tomcat
         */
        stopTomcat() {
            uni.showModal({
                title: '警告',
                content: '确定要停止Tomcat服务吗？停止后可能导致相关应用无法访问。',
                confirmText: '确定',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        this.isOperating = true;
                        this.logInfo = "正在停止Tomcat服务...";

                        stopTomcat().then(response => {
                            uni.showToast({
                                title: response.msg,
                                icon: "success",
                                duration: 2000
                            });
                            this.logInfo = response.data || response.msg;
                            // 停止后立即查询一次状态，然后等待3秒再查一次
                            setTimeout(() => {
                                this.queryStatus();
                                setTimeout(() => {
                                    this.queryStatus();
                                    this.isOperating = false;
                                }, 3000);
                            }, 1000);
                        }).catch(error => {
                            uni.showToast({
                                title: error.msg || "停止失败",
                                icon: "none",
                                duration: 2000
                            });
                            this.logInfo = error.msg || "停止失败";
                            this.isOperating = false;
                            this.queryStatus();
                        });

                    } else {
                        uni.showToast({
                            title: '已取消停止',
                            icon: "none",
                            duration: 2000
                        });
                    }
                }
            });
        },

        /**
         * 格式化日期时间
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
         * 补零
         */
        padZero(num) {
            return num < 10 ? `0${num}` : num;
        }
    }
};
</script>

<style scoped>
/* 全局容器 */
.app-container {
    padding: 15px;
    background-color: #f5f5f5;
    min-height: 100vh;
    box-sizing: border-box;
}

/* 卡片容器 */
.status-card {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 20px 15px;
    margin-bottom: 15px;
}

/* 头部区域 */
.status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f5f5f5;
}

.status-header .title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2d3d;
}

/* 刷新容器 */
.refresh-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 刷新按钮 */
.refresh-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    background: transparent;
    border: none;
    color: #409eff;
    font-size: 12px;
}

.refresh-btn .btn-text {
    margin-left: 4px;
}

/* 刷新时间 */
.refresh-time {
    font-size: 11px;
    color: #8392a5;
}

/* 状态内容区 */
.status-content {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

/* 状态指示器 */
.status-indicator {
    display: flex;
    align-items: center;
    margin-right: 20px;
    margin-bottom: 15px;
}

/* 状态圆点 */
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

/* 状态文字 */
.status-text {
    font-size: 22px;
    font-weight: 500;
    color: #1f2d3d;
}

/* 操作按钮区 */
.operation-buttons {
    display: flex;
    gap: 10px;
    width: 100%;
}

/* 通用按钮样式 */
.btn {
    flex: 1;
    height: 44px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    font-size: 14px;
}

/* 启动按钮 */
.start-btn {
    background-color: #52c41a;
    color: #fff;
}

.start-btn:disabled {
    background-color: #aaff88;
    color: #fff;
    opacity: 0.7;
}

/* 停止按钮 */
.stop-btn {
    background-color: #f5222d;
    color: #fff;
}

.stop-btn:disabled {
    background-color: #ff8888;
    color: #fff;
    opacity: 0.7;
}

.btn .btn-text {
    margin-left: 6px;
}

/* 日志区域 */
.status-log {
    margin-top: 15px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 8px;
}

/* 日志标题 */
.log-title {
    font-size: 14px;
    color: #4e5969;
    font-weight: 500;
    display: block;
    margin-bottom: 10px;
}

/* 日志内容 */
.log-content {
    padding: 10px;
    background-color: #1f2d3d;
    border-radius: 6px;
    max-height: 200px;
    overflow-y: auto;
}

/* 日志文字 */
.log-text {
    font-size: 12px;
    color: #e0e0e0;
    line-height: 1.6;
    white-space: pre-wrap;
}
</style>