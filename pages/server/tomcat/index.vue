# TomcatManager 完整全部px转rpx文件（1px=2rpx，逻辑注释不变）
<template>
    <view class="app-container">
        <!-- Tomcat 服务管理卡片 -->
        <view class="status-card">
            <!-- 头部区域 -->
            <view class="status-header">
                <text class="title">Tomcat 服务管理</text>
                <!-- 刷新区域 -->
                <view class="refresh-container">
                    <!-- <button class="refresh-btn" :loading="isRefreshing" @click="handleRefresh"> -->
                    <uni-icons type="refresh" size="32rpx" color="#409eff" @click="handleRefresh"></uni-icons>
                    <!-- <text class="btn-text">手动刷新</text> -->
                    <!-- </button> -->
                    <!-- <text class="refresh-time">最后刷新: {{ lastRefreshTime }}</text> -->
                    <text class="refresh-time" v-if="lastRefreshTime">{{ lastRefreshTime }}</text>
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
                        <uni-icons type="play" size="28rpx" color="#fff"></uni-icons>
                        <text class="btn-text">启动服务</text>
                    </button>
                    <button class="btn stop-btn" :disabled="status === '已停止' || isOperating"
                        :loading="isOperating && status !== '已停止'" @click="stopTomcat">
                        <uni-icons type="stop" size="28rpx" color="#fff"></uni-icons>
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

        <!-- 新增：系统内存信息卡片 -->
        <view class="status-card">
            <!-- 头部区域 -->
            <view class="status-header">
                <text class="title">系统内存信息</text>
                <!-- 刷新区域 -->
                <view class="refresh-container">
                    <!-- <button class="refresh-btn" :loading="isRefreshing" @click="queryStatus"> -->
                    <uni-icons type="refresh" size="32rpx" color="#409eff" @click="queryStatus"></uni-icons>
                    <!-- <text class="btn-text">手动刷新</text> -->
                    <!-- </button> -->
                    <!-- <text class="refresh-time">最后更新: {{ lastRefreshTime }}</text> -->
                    <text class="refresh-time" v-if="lastRefreshTime">{{ lastRefreshTime }}</text>
                </view>
            </view>

            <!-- 内存信息网格 -->
            <view class="memory-grid">
                <view class="memory-item total-memory">
                    <view class="memory-label">总内存</view>
                    <view class="memory-value">{{ formatMemory(memoryInfo.totalMemoryMb) }} MB</view>
                    <view class="memory-progress">
                        <view class="progress-bar">
                            <view class="progress-fill" :style="{ width: '100%' }"></view>
                        </view>
                    </view>
                </view>
                <view class="memory-item used-memory">
                    <view class="memory-label">已用内存</view>
                    <view class="memory-value">{{ formatMemory(memoryInfo.usedMemoryMb) }} MB</view>
                    <view class="memory-progress">
                        <view class="progress-bar">
                            <view class="progress-fill"
                                :style="{ width: getProgressPercentage(memoryInfo.usedMemoryMb, memoryInfo.totalMemoryMb) + '%' }">
                            </view>
                        </view>
                    </view>
                </view>
                <view class="memory-item available-memory">
                    <view class="memory-label">可用内存</view>
                    <view class="memory-value">{{ formatMemory(memoryInfo.availableMemoryMb) }} MB</view>
                    <view class="memory-progress">
                        <view class="progress-bar">
                            <view class="progress-fill"
                                :style="{ width: getProgressPercentage(memoryInfo.availableMemoryMb, memoryInfo.totalMemoryMb) + '%' }">
                            </view>
                        </view>
                    </view>
                </view>
                <view class="memory-item tomcat-memory">
                    <view class="memory-label">Tomcat占用</view>
                    <view class="memory-value">{{ formatMemory(memoryInfo.tomcatResidentMemoryMb) }} MB</view>
                    <view class="memory-progress">
                        <view class="progress-bar">
                            <view class="progress-fill"
                                :style="{ width: getProgressPercentage(memoryInfo.tomcatResidentMemoryMb, memoryInfo.totalMemoryMb) + '%' }">
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 清理缓存区域 -->
            <view class="cache-clear-section">
                <button class="btn clear-cache-btn" :loading="clearingCache" @click="handleClearCache">
                    <uni-icons type="trash" size="28rpx" color="#fff"></uni-icons>
                    <text class="btn-text">清理系统缓存</text>
                </button>
                <text class="cache-tip">执行 sync; echo 3 > /proc/sys/vm/drop_caches 释放内存缓存</text>
            </view>
        </view>

        <!-- 新增：GitHub 连通性检测卡片 -->
        <view class="status-card">
            <!-- 头部区域 -->
            <view class="status-header">
                <text class="title">GitHub 连通性检测</text>
                <!-- 刷新区域 -->
                <view class="refresh-container">
                    <!-- <button class="refresh-btn" :loading="isRefreshingGithub" @click="handleRefreshGithub"> -->
                    <uni-icons type="map-pin-ellipse" size="32rpx" color="#409eff"
                        @click="handleRefreshGithub"></uni-icons>
                    <!-- <text class="btn-text">重置检测</text> -->
                    <!-- </button> -->
                    <!-- <text class="refresh-time" v-if="lastGithubTestTime">最后检测: {{ lastGithubTestTime }}</text> -->
                    <text class="refresh-time" v-if="lastGithubTestTime">{{ lastGithubTestTime }}</text>
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
    testConnectToGithubByHttp,
    clearSystemCache  // 新增导入
} from "@/api/fx67ll/server/tomcat";

export default {
    name: "TomcatManager",
    data() {
        return {
            // Tomcat 状态相关
            status: "加载中...",
            memoryInfo: {          // 新增内存信息对象
                totalMemoryMb: 0,
                availableMemoryMb: 0,
                usedMemoryMb: 0,
                tomcatResidentMemoryMb: 0
            },
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
            isRefreshingGithub: false,

            // 清理缓存状态
            clearingCache: false
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
                this.isRefreshing = false;
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
         * 查询Tomcat状态（适配新接口）
         */
        queryStatus() {
            return getTomcatStatus().then(response => {
                const data = response.data || {};
                this.status = data.status || "未知";
                this.memoryInfo = data.memoryInfo || {
                    totalMemoryMb: 0,
                    availableMemoryMb: 0,
                    usedMemoryMb: 0,
                    tomcatResidentMemoryMb: 0
                };
                this.lastRefreshTime = this.formatDateTime(new Date());
            }).catch(error => {
                uni.showToast({
                    title: "查询状态失败: " + (error.msg || error.message),
                    icon: "none",
                    duration: 2000
                });
                this.status = "未知";
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
         * 清理系统缓存（新增方法）
         */
        handleClearCache() {
            uni.showModal({
                title: '警告',
                content: '清理系统缓存将释放被占用的内存，但可能导致短时间内磁盘IO升高。确定继续吗？',
                confirmText: '确定',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        this.clearingCache = true;
                        clearSystemCache().then(response => {
                            uni.showToast({
                                title: response.msg || '缓存清理成功',
                                icon: "success",
                                duration: 2000
                            });
                            this.queryStatus(); // 刷新内存信息
                        }).catch(error => {
                            uni.showToast({
                                title: error.msg || '缓存清理失败',
                                icon: "none",
                                duration: 2000
                            });
                        }).finally(() => {
                            this.clearingCache = false;
                        });
                    } else {
                        uni.showToast({
                            title: '已取消清理操作',
                            icon: "none",
                            duration: 2000
                        });
                    }
                }
            });
        },

        /**
         * 格式化内存数值，保留两位小数（新增方法）
         */
        formatMemory(value) {
            if (value === undefined || value === null || isNaN(value)) return '0.00';
            return Number(value).toFixed(2);
        },

        /**
         * 计算进度百分比（新增方法）
         */
        getProgressPercentage(part, total) {
            if (!total || total === 0) return 0;
            return ((part / total) * 100).toFixed(1);
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

<style lang="less" scoped>
@import url("./index.less");
</style>
