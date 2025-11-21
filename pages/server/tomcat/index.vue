<template>
    <view class="app-container">
        <!-- Tomcat 服务管理卡片 -->
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

        <!-- 新增：GitHub 连通性检测卡片 -->
        <view class="status-card">
            <!-- 头部区域 -->
            <view class="status-header">
                <!-- 刷新区域 -->
                <view class="refresh-container">
                    <button class="refresh-btn" :loading="isRefreshingGithub" @click="handleRefreshGithub">
                        <uni-icons type="map-pin-ellipse" size="16" color="#409eff"></uni-icons>
                        <text class="btn-text">重置检测</text>
                    </button>
                    <text class="refresh-time" v-if="lastGithubTestTime">最后检测: {{ lastGithubTestTime }}</text>
                </view>
            </view>

            <!-- GitHub 检测内容区 -->
            <view class="github-content">
                <!-- 检测方法区域 -->
                <view class="detection-methods">
                    <!-- TCP 网络层检测 -->
                    <view class="method-card">
                        <view class="method-header">
                            <text class="method-title">TCP 网络层检测</text>
                            <view class="method-status" :class="tcpStatusClass">
                                {{ getStatusText(tcpStatus) }}
                            </view>
                        </view>
                        <view class="method-desc">
                            <text class="desc-text">检测与 GitHub 的网络连通性（TCP 443端口）</text>
                            <text class="desc-detail">仅验证网络层是否可达，不涉及HTTP协议</text>
                        </view>
                        <view class="method-action">
                            <button class="btn test-btn" :disabled="testingHttp" :loading="testingTcp"
                                @click="testTcpConnectivity">
                                <text class="btn-text">{{ testingTcp ? '检测中...' : '开始检测' }}</text>
                            </button>
                        </view>
                    </view>

                    <!-- HTTP 应用层检测 -->
                    <view class="method-card">
                        <view class="method-header">
                            <text class="method-title">HTTP 应用层检测</text>
                            <view class="method-status" :class="httpStatusClass">
                                {{ getStatusText(httpStatus) }}
                            </view>
                        </view>
                        <view class="method-desc">
                            <text class="desc-text">完整检测 HTTPS 连接（包含SSL握手）</text>
                            <text class="desc-detail">验证完整的HTTP协议栈和证书链</text>
                        </view>
                        <view class="method-action">
                            <button class="btn test-btn" :disabled="testingTcp" :loading="testingHttp"
                                @click="testHttpConnectivity">
                                <text class="btn-text">{{ testingHttp ? '检测中...' : '开始检测' }}</text>
                            </button>
                        </view>
                    </view>
                </view>

                <!-- 检测结果区域 -->
                <view class="detection-result" v-if="githubLogInfo">
                    <text class="log-title">检测结果</text>
                    <view class="log-content">
                        <text class="log-text">{{ githubLogInfo || '未知问题' }}</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import {
    getTomcatStatus,
    startTomcat,
    stopTomcat,
    testConnectToGithubByTcp,
    testConnectToGithubByHttp
} from "@/api/fx67ll/server/tomcat";

export default {
    name: "TomcatManager",
    data() {
        return {
            // Tomcat 状态相关
            status: "加载中...",
            lastRefreshTime: "",
            logInfo: "",
            isOperating: false,
            refreshInterval: null,
            isRefreshing: false,

            // GitHub 检测相关
            tcpStatus: "waiting", // waiting, testing, success, error
            httpStatus: "waiting", // waiting, testing, success, error
            testingTcp: false,
            testingHttp: false,
            githubLogInfo: "",
            lastGithubTestTime: "",
            isRefreshingGithub: false
        };
    },
    // 新增计算属性，替代原有的 getStatusClass 方法（解决微信小程序不支持模板内方法调用）
    computed: {
        /**
         * TCP状态对应的样式类
         */
        tcpStatusClass() {
            const statusMap = {
                waiting: 'status-waiting',
                testing: 'status-testing',
                success: 'status-success',
                error: 'status-error'
            };
            return statusMap[this.tcpStatus] || 'status-waiting';
        },
        /**
         * HTTP状态对应的样式类
         */
        httpStatusClass() {
            const statusMap = {
                waiting: 'status-waiting',
                testing: 'status-testing',
                success: 'status-success',
                error: 'status-error'
            };
            return statusMap[this.httpStatus] || 'status-waiting';
        }
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
         * 手动刷新GitHub检测状态
         */
        handleRefreshGithub() {
            this.isRefreshingGithub = true;
            // 重置状态
            this.tcpStatus = "waiting";
            this.httpStatus = "waiting";
            this.githubLogInfo = "";
            setTimeout(() => {
                this.isRefreshingGithub = false;
            }, 500);
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
         * 测试TCP连通性
         */
        testTcpConnectivity() {
            this.testingTcp = true;
            this.tcpStatus = "testing";
            this.githubLogInfo = "正在检测 GitHub TCP 连通性...";

            testConnectToGithubByTcp().then(response => {
                this.tcpStatus = "success";
                this.githubLogInfo = `TCP检测成功：${response.msg}\n详细信息：${response.data}`;
                this.lastGithubTestTime = this.formatDateTime(new Date());
                uni.showToast({
                    title: 'GitHub TCP连通性检测成功',
                    icon: "success",
                    duration: 2000
                });
            }).catch(error => {
                this.tcpStatus = "error";
                this.githubLogInfo = `TCP检测失败：${error.msg || error.message}`;
                this.lastGithubTestTime = this.formatDateTime(new Date());
                uni.showToast({
                    title: 'GitHub TCP连通性检测失败',
                    icon: "none",
                    duration: 2000
                });
            }).finally(() => {
                this.testingTcp = false;
            });
        },

        /**
         * 测试HTTP连通性
         */
        testHttpConnectivity() {
            this.testingHttp = true;
            this.httpStatus = "testing";
            this.githubLogInfo = "正在检测 GitHub HTTP 连通性...";

            testConnectToGithubByHttp().then(response => {
                this.httpStatus = "success";
                this.githubLogInfo = `HTTP检测成功：${response.msg}\n详细信息：${response.data}`;
                this.lastGithubTestTime = this.formatDateTime(new Date());
                uni.showToast({
                    title: 'GitHub HTTP连通性检测成功',
                    icon: "success",
                    duration: 2000
                });
            }).catch(error => {
                this.httpStatus = "error";
                this.githubLogInfo = `HTTP检测失败：${error.msg || error.message}`;
                this.lastGithubTestTime = this.formatDateTime(new Date());
                uni.showToast({
                    title: 'GitHub HTTP连通性检测失败',
                    icon: "none",
                    duration: 2000
                });
            }).finally(() => {
                this.testingHttp = false;
            });
        },

        /**
         * 获取状态文本
         */
        getStatusText(status) {
            const textMap = {
                waiting: '等待检测',
                testing: '检测中...',
                success: '连接正常',
                error: '连接失败'
            };
            return textMap[status] || '未知状态';
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

/* 新增：GitHub 检测相关样式 */
.github-content {
    margin-top: 10px;
}

.detection-methods {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.method-card {
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    padding: 16px;
    background-color: #fafafa;
    transition: all 0.3s ease;
}

.method-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #d1d1d1;
}

.method-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.method-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2d3d;
}

.method-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
}

.status-waiting {
    background-color: #f5f5f5;
    color: #8c8c8c;
}

.status-testing {
    background-color: #e6f7ff;
    color: #1890ff;
}

.status-success {
    background-color: #f6ffed;
    color: #52c41a;
}

.status-error {
    background-color: #fff2f0;
    color: #ff4d4f;
}

.method-desc {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.desc-text {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
}

.desc-detail {
    font-size: 11px;
    color: #999;
    line-height: 1.4;
}

.method-action {
    text-align: center;
}

.test-btn {
    background-color: #409eff;
    color: #fff;
    height: 36px;
    font-size: 13px;
}

.test-btn:disabled {
    background-color: #a0cfff;
    color: #fff;
    opacity: 0.7;
}

.detection-result {
    margin-top: 15px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 8px;
}

/* 响应式调整 */
@media (min-width: 768px) {
    .detection-methods {
        flex-direction: row;
    }

    .method-card {
        flex: 1;
    }
}
</style>