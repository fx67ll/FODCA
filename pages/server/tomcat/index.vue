<template>
    <view class="app-container">
        <!-- Tomcat 服务管理卡片（始终显示，异常状态显示上锁样式） -->
        <view class="status-card" :class="{ 'locked-card': isSystemLocked }">
            <!-- 上锁遮罩（优化：显示具体错误原因） -->
            <view v-if="isSystemLocked" class="lock-overlay">
                <view class="lock-icon" :class="lockIconClass">
                    <uni-icons type="locked" size="128rpx" color="#909399"></uni-icons>
                </view>
                <view class="lock-text">
                    <view class="lock-title">{{ status }}</view>
                    <view class="lock-desc">{{ lockMessage }}</view>
                </view>
            </view>

            <!-- 头部区域 -->
            <view class="status-header">
                <text class="title">Tomcat 服务管理</text>
                <!-- 刷新区域 -->
                <view class="refresh-container">
                    <view class="icon-tap" @click="handleRefresh">
                        <uni-icons class="refresh-icon" :class="{ 'is-spinning': isRefreshing }" type="refresh"
                            size="32rpx" color="#409eff"></uni-icons>
                    </view>
                    <text class="refresh-time" v-if="lastRefreshTime">{{ lastRefreshTime }}</text>
                </view>
            </view>

            <!-- 状态内容区 -->
            <view class="status-content">
                <!-- 状态指示器 -->
                <view class="status-indicator">
                    <view class="indicator-dot"
                        :class="status === '运行中' ? 'running' : status === '系统不匹配' ? 'unknown' : status === '未安装' ? 'unknown' : 'stopped'">
                    </view>
                    <text class="status-text">{{ status }}</text>
                </view>

                <!-- 操作按钮区 -->
                <view class="operation-buttons">
                    <button class="btn start-btn" :disabled="status === '运行中' || isOperating || isSystemLocked"
                        :loading="isOperating && status !== '运行中'" @click="startTomcat">
                        <uni-icons type="play" size="28rpx" color="#fff"></uni-icons>
                        <text class="btn-text">启动服务</text>
                    </button>
                    <button class="btn stop-btn" :disabled="status === '已停止' || isOperating || isSystemLocked"
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

        <!-- 以下所有卡片仅在系统正常时显示 -->
        <template v-if="!isSystemLocked">
            <!-- 新增：系统内存信息卡片 -->
            <view class="status-card">
                <!-- 头部区域 -->
                <view class="status-header">
                    <text class="title">系统内存信息</text>
                    <!-- 刷新区域 -->
                    <view class="refresh-container">
                        <view class="icon-tap" @click="handleRefresh">
                            <uni-icons class="refresh-icon" :class="{ 'is-spinning': isRefreshing }" type="refresh"
                                size="32rpx" color="#409eff"></uni-icons>
                        </view>
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
                    <!-- 重置区域 -->
                    <view class="refresh-container">
                        <view class="icon-tap" @click="handleRefreshGithub">
                            <uni-icons class="reset-icon" :class="{ 'is-bouncing': isResetBouncing }"
                                type="map-pin-ellipse" size="32rpx" color="#409eff"></uni-icons>
                        </view>
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
        </template>
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
            // ==================== 系统检测状态（新增） ====================
            isSystemLocked: false,    // 系统是否被锁定（不匹配/未安装）
            lockMessage: "",          // 锁定状态提示信息

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
            clearingCache: false,

            // GitHub 重置按钮弹跳动效
            isResetBouncing: false,
            resetBounceTimer: null
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
        },
        /**
         * 锁定状态图标颜色类（新增）
         */
        lockIconClass() {
            if (this.status === "系统不匹配") {
                return "warning-icon";
            } else if (this.status === "未安装") {
                return "info-icon";
            }
            return "";
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
        if (this.resetBounceTimer) {
            clearTimeout(this.resetBounceTimer);
        }
    },
    methods: {
        /**
         * 手动刷新状态（保证图标至少旋转一圈）
         */
        handleRefresh() {
            if (this.isRefreshing || this.isSystemLocked) return;
            this.isRefreshing = true;
            const startAt = Date.now();
            this.queryStatus().finally(() => {
                const elapsed = Date.now() - startAt;
                const minSpin = 800; // 至少旋转一圈
                const remain = Math.max(0, minSpin - elapsed);
                setTimeout(() => {
                    this.isRefreshing = false;
                }, remain);
            });
        },

        /**
         * 手动刷新GitHub检测状态（重置）
         */
        handleRefreshGithub() {
            this.isRefreshingGithub = true;
            // 弹跳动效
            this.isResetBouncing = true;
            if (this.resetBounceTimer) clearTimeout(this.resetBounceTimer);
            this.resetBounceTimer = setTimeout(() => {
                this.isResetBouncing = false;
            }, 600);
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

                // 检测系统是否需要锁定
                if (data.status === "系统不匹配" || data.status === "未安装") {
                    this.isSystemLocked = true;
                    this.lockMessage = data.error || "该功能不可用";
                } else {
                    this.isSystemLocked = false;
                    this.lockMessage = "";
                }

                // 只有系统正常时才更新内存信息
                if (!this.isSystemLocked) {
                    this.memoryInfo = data.memoryInfo || {
                        totalMemoryMb: 0,
                        availableMemoryMb: 0,
                        usedMemoryMb: 0,
                        tomcatResidentMemoryMb: 0
                    };
                }
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
            if (this.isSystemLocked) {
                uni.showToast({
                    title: "系统状态异常，无法执行操作",
                    icon: "none"
                });
                return;
            }
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
            if (this.isSystemLocked) {
                uni.showToast({
                    title: "系统状态异常，无法执行操作",
                    icon: "none"
                });
                return;
            }
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
            if (this.isSystemLocked) {
                uni.showToast({
                    title: "系统状态异常，无法执行操作",
                    icon: "none"
                });
                return;
            }
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
            if (this.isSystemLocked) return;
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
            if (this.isSystemLocked) return;
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
// @import url("./index.less");

/* 全局容器 */
.app-container {
    padding: 30rpx;
    background-color: #f5f5f5;
    min-height: 100vh;
    box-sizing: border-box;
}

/* 卡片容器 */
.status-card {
    background-color: #fff;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    padding: 40rpx 30rpx;
    margin-bottom: 30rpx;
    position: relative;
    transition: all 0.3s ease;
}

/* ==================== 新增：上锁状态卡片样式 ==================== */
.locked-card {
    filter: grayscale(50%);
    opacity: 0.9;
}

.lock-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.lock-icon {
    font-size: 128rpx;
    color: #909399;
    margin-bottom: 40rpx;
}

.lock-icon.warning-icon {
    color: #e6a23c;
}

.lock-icon.info-icon {
    color: #409eff;
}

.lock-text {
    text-align: center;
    line-height: 1.6;
    max-width: 80%;
}

.lock-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16rpx;
}

.lock-desc {
    font-size: 28rpx;
    color: #606266;
}

/* 头部区域 */
.status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
}

.status-header .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1f2d3d;
}

/* 刷新容器 */
.refresh-container {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

/* 点击包裹层：承担缩放反馈，与图标自身的旋转/弹跳分离避免 transform 冲突 */
.icon-tap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.icon-tap:active {
    transform: scale(0.85);
    opacity: 0.85;
}

/* 刷新中：图标持续旋转（保证至少一圈，动画明显） */
.refresh-icon.is-spinning {
    display: inline-block;
    animation: tomcat-spin 1s linear infinite;
}

/* 重置按钮：点击弹跳 */
.reset-icon.is-bouncing {
    display: inline-block;
    animation: tomcat-bounce 0.6s cubic-bezier(0.36, 0, 0.66, 1);
}

@keyframes tomcat-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes tomcat-bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    25% {
        transform: translateY(-30%);
    }

    50% {
        transform: translateY(0);
    }

    75% {
        transform: translateY(-15%);
    }
}

/* 刷新按钮 */
.refresh-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 16rpx;
    background: transparent;
    border: none;
    color: #409eff;
    font-size: 24rpx;
}

.refresh-btn .btn-text {
    margin-left: 8rpx;
}

/* 刷新时间 */
.refresh-time {
    font-size: 22rpx;
    color: #8392a5;
}

/* 状态内容区 */
.status-content {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    flex-wrap: wrap;
}

/* 状态指示器 */
.status-indicator {
    display: flex;
    align-items: center;
    margin-right: 40rpx;
    margin-bottom: 30rpx;
}

/* 状态圆点 */
.indicator-dot {
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    transition: all 0.3s ease;
}

.indicator-dot.running {
    background-color: #52c41a;
    box-shadow: 0 0 16rpx rgba(82, 196, 26, 0.4);
}

.indicator-dot.stopped {
    background-color: #f5222d;
    box-shadow: 0 0 16rpx rgba(245, 34, 45, 0.4);
}

/* 新增：未知/系统不匹配状态指示器 */
.indicator-dot.unknown {
    background-color: #909399;
    box-shadow: 0 0 16rpx rgba(144, 147, 153, 0.4);
}

/* 状态文字 */
.status-text {
    font-size: 44rpx;
    font-weight: 500;
    color: #1f2d3d;
}

/* 操作按钮区 */
.operation-buttons {
    display: flex;
    gap: 20rpx;
    width: 100%;
}

/* 通用按钮样式 */
.btn {
    flex: 1;
    height: 88rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    font-size: 28rpx;
    /* 修复移动端 button 默认 ::after 伪元素边框：圆角会裁切边框导致线条不完整 */
    position: relative;
}

.btn::after {
    border: none;
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
    margin-left: 12rpx;
}

/* 日志区域 */
.status-log {
    margin-top: 30rpx;
    padding: 30rpx;
    background-color: #f5f7fa;
    border-radius: 16rpx;
}

/* 日志标题 */
.log-title {
    font-size: 28rpx;
    color: #4e5969;
    font-weight: 500;
    display: block;
    margin-bottom: 20rpx;
}

/* 日志内容 */
.log-content {
    padding: 20rpx;
    background-color: #1f2d3d;
    border-radius: 12rpx;
    max-height: 400rpx;
    overflow-y: auto;
}

/* 日志文字 */
.log-text {
    font-size: 24rpx;
    color: #e0e0e0;
    line-height: 1.6;
    white-space: pre-wrap;
}

/* 新增：内存卡片样式 */
.memory-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24rpx;
    margin: 40rpx 0;
}

.memory-item {
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 24rpx;
    border-left: 8rpx solid;
    transition: all 0.3s;
}

.total-memory {
    border-left-color: #409eff;
}

.total-memory .memory-label {
    color: #409eff;
}

.used-memory {
    border-left-color: #f56c6c;
}

.used-memory .memory-label {
    color: #f56c6c;
}

.available-memory {
    border-left-color: #67c23a;
}

.available-memory .memory-label {
    color: #67c23a;
}

.tomcat-memory {
    border-left-color: #e6a23c;
}

.tomcat-memory .memory-label {
    color: #e6a23c;
}

.memory-label {
    font-size: 26rpx;
    margin-bottom: 12rpx;
}

.memory-value {
    font-size: 36rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
}

.memory-progress {
    margin-top: 12rpx;
}

.progress-bar {
    width: 100%;
    height: 12rpx;
    background-color: #e6e6e6;
    border-radius: 6rpx;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: #409eff;
    border-radius: 6rpx;
}

.total-memory .progress-fill {
    background-color: #409eff;
}

.used-memory .progress-fill {
    background-color: #f56c6c;
}

.available-memory .progress-fill {
    background-color: #67c23a;
}

.tomcat-memory .progress-fill {
    background-color: #e6a23c;
}

/* 缓存清理区域 */
.cache-clear-section {
    margin-top: 40rpx;
    padding-top: 32rpx;
    border-top: 1rpx dashed #e6e6e6;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.clear-cache-btn {
    background-color: #e6a23c;
    color: #fff;
    height: 88rpx;
    width: 100%;
}

.clear-cache-btn:disabled {
    background-color: #f5d7a7;
    opacity: 0.7;
}

.cache-tip {
    font-size: 22rpx;
    color: #8392a5;
    background: #f5f7fa;
    padding: 12rpx 20rpx;
    border-radius: 24rpx;
    line-height: 1.4;
}

/* 新增：GitHub 检测相关样式 */
.github-content {
    margin-top: 20rpx;
}

.detection-methods {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
    margin-bottom: 40rpx;
}

.method-card {
    border: 1rpx solid #e6e6e6;
    border-radius: 16rpx;
    padding: 32rpx;
    background-color: #fafafa;
    transition: all 0.3s ease;
}

.method-card:hover {
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    border-color: #d1d1d1;
}

.method-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
}

.method-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1f2d3d;
}

.method-status {
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    font-size: 22rpx;
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
    margin-bottom: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.desc-text {
    font-size: 24rpx;
    color: #666;
    line-height: 1.4;
}

.desc-detail {
    font-size: 22rpx;
    color: #999;
    line-height: 1.4;
}

.method-action {
    text-align: center;
}

.test-btn {
    background-color: #409eff;
    color: #fff;
    height: 72rpx;
    font-size: 26rpx;
}

.test-btn:disabled {
    background-color: #a0cfff;
    color: #fff;
    opacity: 0.7;
}

.detection-result {
    margin-top: 30rpx;
    padding: 30rpx;
    background-color: #f5f7fa;
    border-radius: 16rpx;
}

/* 响应式调整 */
@media (min-width: 768rpx) {
    .detection-methods {
        flex-direction: row;
    }

    .method-card {
        flex: 1;
    }
}
</style>