<template>
  <zb-drawer mode="bottom" :title="drawerTitle" :wrapperClosable="false" :visible.sync="isShowLogDrawer" :radius="true"
    :height="drawerHeight" @close="closeDrawer">
    <view class="fx67ll-log-drawer">
      <!-- 操作工具栏 -->
      <view class="fx67ll-toolbar" v-if="multipleLogDataList.length > 0">
        <view class="fx67ll-toolbar-left">
          <view class="fx67ll-select-all" @tap="toggleSelectAll">
            <!-- 移除checkbox，使用自定义样式 -->
            <view class="fx67ll-select-checkbox" :class="{ 'fx67ll-select-checkbox-checked': isAllSelected }">
              <text v-if="isAllSelected">✓</text>
            </view>
            <text>{{ isAllSelected ? '取消全选' : '全选' }}</text>
          </view>
        </view>
        <view class="fx67ll-toolbar-right">
          <view class="fx67ll-selected-badge">
            <text>已选中 {{ selectedCount }} 项</text>
          </view>
        </view>
      </view>

      <!-- 日志列表区域 -->
      <scroll-view scroll-y="true" class="fx67ll-log-scroll" :style="{ height: scrollViewHeight }"
        :scroll-with-animation="true" :enable-back-to-top="true">
        <view class="fx67ll-log-list" v-if="multipleLogDataList.length > 0">
          <!-- 移除checkbox-group，使用手动管理选中状态 -->
          <view class="fx67ll-log-cell" v-for="(item, index) in multipleLogDataList" :key="item.logId"
            :class="{ 'fx67ll-log-cell-selected': isItemSelected(item) }" @tap="toggleItemSelection(item)">
            <!-- 左侧选中指示器，代替checkbox -->
            <view class="fx67ll-log-cell-left">
              <view class="fx67ll-selection-indicator"
                :class="{ 'fx67ll-selection-indicator-checked': isItemSelected(item) }">
                <text v-if="isItemSelected(item)">✓</text>
              </view>
            </view>

            <view class="fx67ll-log-cell-content">
              <view class="fx67ll-log-title">{{ item.logTitle }}</view>
              <view class="fx67ll-log-meta" v-if="item.createTime">
                <text class="fx67ll-time-icon">🕒</text>
                {{ formatTime(item.createTime) }}
              </view>
            </view>

            <!-- 右侧选中标记 -->
            <view class="fx67ll-log-cell-right" v-if="isItemSelected(item)">
              <view class="fx67ll-selected-badge-mini">
                <text>已选</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态提示 -->
        <view class="fx67ll-empty" v-else>
          <view class="fx67ll-empty-icon">
            <text>📋</text>
          </view>
          <text class="fx67ll-empty-text">暂无彩票记录</text>
          <text class="fx67ll-empty-subtext">请先添加彩票记录</text>
        </view>
      </scroll-view>

      <!-- 操作按钮区域 -->
      <view class="fx67ll-log-btn">
        <button class="fx67ll-btn-submit" type="primary" @click="handleSubmit" :disabled="selectedCount === 0"
          :class="{ 'fx67ll-btn-disabled': selectedCount === 0 }">
          <view class="fx67ll-btn-content">
            <text class="fx67ll-btn-icon">✅</text>
            <text>{{ operaBtnName }}</text>
          </view>
        </button>
        <button class="fx67ll-btn-cancel" @click="closeDrawer">
          <view class="fx67ll-btn-content">
            <text class="fx67ll-btn-icon">✕</text>
            <text>取消</text>
          </view>
        </button>
      </view>
    </view>
  </zb-drawer>
</template>

<script>
import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

export default {
  name: "LogDrawer",

  props: {
    // 是否显示抽屉
    isShowLogDrawer: {
      type: Boolean,
      required: true,
      default: false,
    },
    // 多选操作的彩票记录数据
    multipleLogDataList: {
      type: Array,
      required: true,
      default: () => [],
    },
    // 多选操作的类型：1是拷贝，2是合并
    operaLogType: {
      type: Number,
      required: false,
      default: 1,
    },
    // 多选操作按钮名称
    operaBtnName: {
      type: String,
      required: false,
      default: "提交多选数据",
    },
    // 默认选中的对象列表，传入的对象checkedValue属性值会与列表数据匹配，匹配上则默认勾选
    selectedLogItemList: {
      type: Array,
      required: false,
      default: () => [],
    },
  },

  data() {
    return {
      // 定时器对象
      timer: null,
      // Drawer组件相关参数
      drawerHeight: "550px",
      drawerTitle: moment().format("YYYY-MM-DD HH:mm:ss dddd"),
      // 本地选中的值数组，用于跟踪选中状态
      localCheckedValues: [],
      // 记录是否已经处理过默认选中
      hasProcessedDefaultSelection: false,
    };
  },

  computed: {
    // 选中的项目数量
    selectedCount() {
      return this.localCheckedValues.length;
    },

    // 动态计算滚动区域高度
    scrollViewHeight() {
      // 根据是否有数据和是否有工具栏计算高度
      const hasToolbar = this.multipleLogDataList.length > 0;
      return hasToolbar ? '380px' : '440px';
    },

    // 全选状态
    isAllSelected() {
      if (this.multipleLogDataList.length === 0) return false;
      return this.localCheckedValues.length === this.multipleLogDataList.length;
    },
  },

  watch: {
    // 监听父组件传递的显示状态
    isShowLogDrawer(newValue) {
      if (newValue) {
        // 显示时更新时间
        this.showNowTime();
        // 重置默认选中处理标志
        this.hasProcessedDefaultSelection = false;
        // 延迟处理默认选中，确保数据已加载
        this.$nextTick(() => {
          this.processDefaultSelection();
        });
      } else {
        this.localCheckedValues = [];
        this.clearTimer();
        this.$emit("hideDrawer", false);
      }
    },

    // 监听列表数据变化，初始化选中状态
    multipleLogDataList: {
      immediate: true,
      handler(newData) {
        if (newData && newData.length > 0) {
          // 从checked为true的数据中提取checkedValue
          const initialSelected = newData
            .filter(item => item.checked)
            .map(item => item.checkedValue);

          this.localCheckedValues = [...initialSelected];

          // 如果抽屉已打开且未处理默认选中，则处理默认选中
          if (this.isShowLogDrawer && !this.hasProcessedDefaultSelection) {
            this.processDefaultSelection();
          }
        } else {
          this.localCheckedValues = [];
        }
      }
    },

    // 监听默认选中对象列表的变化
    selectedLogItemList: {
      deep: true,
      handler(newList) {
        // 只有在抽屉已打开且未处理默认选中的情况下才处理
        if (this.isShowLogDrawer && !this.hasProcessedDefaultSelection && newList && newList.length > 0) {
          this.processDefaultSelection();
        }
      }
    },
  },

  mounted() {
    // moment初始汉化
    moment.locale("zh-cn");
    if (this.isShowLogDrawer) {
      this.showNowTime();
      // 延迟处理默认选中，确保数据已加载
      this.$nextTick(() => {
        this.processDefaultSelection();
      });
    }
  },

  beforeDestroy() {
    // 销毁时清除定时器
    this.clearTimer();
  },

  methods: {
    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    // 显示当前时间
    showNowTime() {
      this.clearTimer(); // 先清除可能存在的旧定时器

      this.timer = setInterval(() => {
        this.drawerTitle = moment().format("YYYY-MM-DD HH:mm:ss dddd");
      }, 1000);
    },

    // 格式化时间显示
    formatTime(time) {
      if (!time) return '';
      return moment(time).format('MM-DD HH:mm');
    },

    // 关闭当前弹窗
    closeDrawer() {
      this.localCheckedValues = [];
      this.clearTimer();
      this.$emit("hideDrawer", false);
    },

    // 判断单个项目是否被选中
    isItemSelected(item) {
      return this.localCheckedValues.includes(item.checkedValue);
    },

    // 切换单个项目的选中状态
    toggleItemSelection(item) {
      const checkedValue = item.checkedValue;
      const index = this.localCheckedValues.indexOf(checkedValue);

      if (index > -1) {
        // 已选中，则取消选中
        this.localCheckedValues.splice(index, 1);
      } else {
        // 未选中，则添加选中
        this.localCheckedValues.push(checkedValue);
      }

      // 触发响应式更新
      this.$forceUpdate();
    },

    // 全选/反选切换
    toggleSelectAll() {
      if (this.multipleLogDataList.length === 0) return;

      if (this.isAllSelected) {
        // 取消全选：清空选中值
        this.localCheckedValues = [];
      } else {
        // 全选：添加所有项目的checkedValue
        this.localCheckedValues = this.multipleLogDataList.map(item => item.checkedValue);
      }

      // 触发响应式更新
      this.$forceUpdate();
    },

    // 处理默认选中逻辑
    processDefaultSelection() {
      // 确保只执行一次
      if (this.hasProcessedDefaultSelection) return;

      // 确保抽屉已打开且有数据
      if (!this.isShowLogDrawer || !this.multipleLogDataList || this.multipleLogDataList.length === 0) return;

      // 确保有默认选中对象列表
      if (!this.selectedLogItemList || this.selectedLogItemList.length === 0) {
        this.hasProcessedDefaultSelection = true;
        return;
      }

      // 用于记录找到的匹配项数量
      let matchedCount = 0;
      let notMatchedCount = 0;

      // 遍历默认选中对象列表
      this.selectedLogItemList.forEach(selectedItem => {
        if (selectedItem && selectedItem.checkedValue) {
          // 查找列表中是否存在与默认选中对象匹配的项
          const matchedItem = this.multipleLogDataList.find(item =>
            item.checkedValue === selectedItem.checkedValue
          );

          if (matchedItem && !this.localCheckedValues.includes(selectedItem.checkedValue)) {
            this.localCheckedValues.push(selectedItem.checkedValue);
            matchedCount++;
          } else if (!matchedItem) {
            notMatchedCount++;
          }
        }
      });

      // 标记已处理默认选中
      this.hasProcessedDefaultSelection = true;

      // 如果有选中项更新，则触发响应式更新
      if (matchedCount > 0) {
        this.$forceUpdate();
        console.log(`默认选中已设置: ${matchedCount} 项，未找到匹配项: ${notMatchedCount} 项`);
      } else if (notMatchedCount > 0) {
        console.log(`未找到任何匹配的项，共检查了 ${notMatchedCount} 项`);
      }
    },

    // 处理选中数据提交
    handleSubmit() {
      if (this.selectedCount === 0) {
        uni.showToast({
          title: '请至少选择一条记录',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 获取选中的数据
      const selectedData = this.multipleLogDataList.filter(
        item => this.localCheckedValues.includes(item.checkedValue)
      );

      // 触发事件，将选中的数据传递给父组件
      this.$emit("submitDrawer", selectedData);

      // 如果数据异常，则弹出提示
      if (![1, 2].includes(this.operaLogType)) {
        uni.showToast({
          title: `类型传参错误，异常操作！已选中 ${this.selectedCount} 条记录`,
          icon: 'success',
          duration: 1500
        });
      }
    },
  },
};
</script>

<style lang="less">
@import url("./logDrawer.less");
</style>