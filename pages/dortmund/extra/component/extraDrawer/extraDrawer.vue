<template>
  <zb-drawer mode="bottom" :title="drawerTitle" :wrapperClosable="false" :visible.sync="isShowExtraDrawer"
    :radius="true" :height="drawerHeight" @close="closeDrawer">
    <view class="fx67ll-extra-drawer">
      <!-- 记录选择步骤 -->
      <template v-if="!isConfirmStep">
        <!-- 操作工具栏 -->
        <view class="fx67ll-toolbar" v-if="multipleExtraDataList.length > 0">
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
              <text>已选 {{ selectedCount }}/{{ multipleExtraDataList.length }} 项</text>
            </view>
          </view>
        </view>

        <!-- 记录列表区域 -->
        <scroll-view scroll-y="true" class="fx67ll-extra-scroll" :style="{ height: scrollViewHeight }"
          :scroll-with-animation="true" :enable-back-to-top="true">
          <view class="fx67ll-extra-list" v-if="multipleExtraDataList.length > 0">
            <view class="fx67ll-extra-cell" v-for="item in multipleExtraDataList" :key="item.extraId"
              :class="{ 'fx67ll-extra-cell-selected': isItemSelected(item) }" @tap="toggleItemSelection(item)">
              <!-- 左侧选中指示器，代替checkbox -->
              <view class="fx67ll-extra-cell-left">
                <view class="fx67ll-selection-indicator"
                  :class="{ 'fx67ll-selection-indicator-checked': isItemSelected(item) }">
                  <text v-if="isItemSelected(item)">✓</text>
                </view>
              </view>

              <!-- 内容区域按外快盈亏记录特点重构：头部为创建时间与盈亏金额胶囊，中部为金额四宫格，备注单行省略展示 -->
              <view class="fx67ll-extra-cell-content">
                <view class="fx67ll-extra-cell-header">
                  <view class="fx67ll-extra-cell-time">
                    <text class="fx67ll-time-icon">🕒</text>
                    <text>{{ formatTime(item.createTime) }}</text>
                  </view>
                  <text class="fx67ll-extra-badge" :class="{
                    'fx67ll-extra-badge-success': item.isWin === 'Y',
                    'fx67ll-extra-badge-fail': item.isWin !== 'Y' && item.winMoney !== '0',
                    'fx67ll-extra-badge-normal': item.isWin !== 'Y' && item.winMoney === '0',
                  }">{{ formatWinMoney(item) }}</text>
                </view>
                <view class="fx67ll-stat-grid">
                  <view class="fx67ll-stat-chip">
                    <view class="fx67ll-stat-chip-label">
                      <text class="fx67ll-stat-chip-icon">💰</text>
                      <text>总金额</text>
                    </view>
                    <text class="fx67ll-stat-chip-value">￥{{ item.extraMoney }}</text>
                  </view>
                  <view class="fx67ll-stat-chip">
                    <view class="fx67ll-stat-chip-label">
                      <text class="fx67ll-stat-chip-icon">📥</text>
                      <text>落袋金额</text>
                    </view>
                    <text class="fx67ll-stat-chip-value">￥{{ item.saveMoney }}</text>
                  </view>
                  <view class="fx67ll-stat-chip">
                    <view class="fx67ll-stat-chip-label">
                      <text class="fx67ll-stat-chip-icon">🌱</text>
                      <text>当前本金</text>
                    </view>
                    <text class="fx67ll-stat-chip-value">￥{{ item.seedMoney }}</text>
                  </view>
                  <view class="fx67ll-stat-chip">
                    <view class="fx67ll-stat-chip-label">
                      <text class="fx67ll-stat-chip-icon">🎯</text>
                      <text>目标金额</text>
                    </view>
                    <text class="fx67ll-stat-chip-value">￥{{ item.targetMoney }}</text>
                  </view>
                </view>
                <view class="fx67ll-extra-cell-remark" v-if="item.extraRemark">
                  <text class="fx67ll-extra-cell-remark-icon">📝</text>
                  <text class="fx67ll-extra-cell-remark-text">{{ item.extraRemark }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 空状态提示 -->
          <view class="fx67ll-empty" v-else>
            <view class="fx67ll-empty-icon">
              <text>💰</text>
            </view>
            <text class="fx67ll-empty-text">暂无外快盈亏记录</text>
            <text class="fx67ll-empty-subtext">请先新增外快盈亏记录</text>
          </view>
        </scroll-view>

        <!-- 操作按钮区域 -->
        <view class="fx67ll-extra-btn">
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
      </template>

      <!-- 合并确认步骤（展示合并结果预览，支持录入合并后新备注） -->
      <template v-else>
        <scroll-view scroll-y="true" class="fx67ll-extra-scroll" :style="{ height: scrollViewHeight }"
          :scroll-with-animation="true" :enable-back-to-top="true">
          <!-- 合并结果预览面板 -->
          <view class="fx67ll-merge-preview">
            <view class="fx67ll-merge-preview-header">
              <view class="fx67ll-merge-preview-title">
                <text class="fx67ll-merge-preview-icon">📊</text>
                <text>合并结果预览</text>
              </view>
              <view class="fx67ll-merge-preview-count">
                <text>共 {{ mergeCount }} 条</text>
              </view>
            </view>
            <view class="fx67ll-merge-preview-body" v-if="lastMergeRow">
              <!-- 合并推导字段：盈亏金额之和与按正负推导的是否盈利重点突出展示 -->
              <view class="fx67ll-merge-preview-hero">
                <view class="fx67ll-merge-preview-hero-item">
                  <text class="fx67ll-merge-preview-label">合并后盈亏金额</text>
                  <text class="fx67ll-merge-preview-hero-value" :class="mergedWinMoneyClass">{{ mergedWinMoneyText }}</text>
                </view>
                <view class="fx67ll-merge-preview-hero-item">
                  <text class="fx67ll-merge-preview-label">合并后是否盈利</text>
                  <text class="fx67ll-merge-preview-hero-value" :class="mergedWinMoneyClass">{{ previewIsWinText }}</text>
                </view>
              </view>
              <!-- 快照字段：与记录选择卡片同构的金额四宫格，直观对照合并后新记录取自所选范围内最新一条的原值 -->
              <view class="fx67ll-stat-grid">
                <view class="fx67ll-stat-chip">
                  <view class="fx67ll-stat-chip-label">
                    <text class="fx67ll-stat-chip-icon">💰</text>
                    <text>总金额</text>
                  </view>
                  <text class="fx67ll-stat-chip-value">￥{{ lastMergeRow.extraMoney }}</text>
                </view>
                <view class="fx67ll-stat-chip">
                  <view class="fx67ll-stat-chip-label">
                    <text class="fx67ll-stat-chip-icon">📥</text>
                    <text>落袋金额</text>
                  </view>
                  <text class="fx67ll-stat-chip-value">￥{{ lastMergeRow.saveMoney }}</text>
                </view>
                <view class="fx67ll-stat-chip">
                  <view class="fx67ll-stat-chip-label">
                    <text class="fx67ll-stat-chip-icon">🌱</text>
                    <text>当前本金</text>
                  </view>
                  <text class="fx67ll-stat-chip-value">￥{{ lastMergeRow.seedMoney }}</text>
                </view>
                <view class="fx67ll-stat-chip">
                  <view class="fx67ll-stat-chip-label">
                    <text class="fx67ll-stat-chip-icon">🎯</text>
                    <text>目标金额</text>
                  </view>
                  <text class="fx67ll-stat-chip-value">￥{{ lastMergeRow.targetMoney }}</text>
                </view>
              </view>
              <view class="fx67ll-merge-preview-time">
                <text class="fx67ll-merge-preview-time-icon">🕒</text>
                <text class="fx67ll-merge-preview-time-text">创建时间：{{ lastMergeRow.createTime }}</text>
              </view>
            </view>
            <view class="fx67ll-merge-preview-tip">
              盈亏金额取所选记录盈亏金额之和并按正负推导是否盈利，总金额、当前本金、落袋金额、目标金额与创建时间取所选范围内最新一条记录的原值
            </view>
          </view>

          <!-- 合并操作警告横幅 -->
          <view class="fx67ll-merge-warning-banner">
            <view class="fx67ll-merge-warning-icon">
              <text>⚠️</text>
            </view>
            <view class="fx67ll-merge-warning-body">
              <view class="fx67ll-merge-warning-title">合并后原数据将被删除且无法恢复</view>
              <view class="fx67ll-merge-warning-desc">合并将删除所选的 {{ mergeCount }} 条原记录并生成一条新记录，请确认无误后再操作！</view>
            </view>
          </view>

          <!-- 合并后备注录入（可不填写） -->
          <view class="fx67ll-merge-remark-box">
            <view class="fx67ll-merge-remark-label">合并后备注（可不填写）</view>
            <uni-easyinput type="textarea" v-model="mergeRemark" :maxlength="1023"
              placeholder="请输入合并后新记录的备注，不填写则不保留备注" />
            <view class="fx67ll-merge-remark-count">
              <text>{{ mergeRemark.length }}/1023</text>
            </view>
          </view>
        </scroll-view>

        <!-- 操作按钮区域 -->
        <view class="fx67ll-extra-btn">
          <button class="fx67ll-btn-submit fx67ll-btn-warning" type="primary" @click="handleMergeConfirm">
            <view class="fx67ll-btn-content">
              <text class="fx67ll-btn-icon">⚠️</text>
              <text>确认合并</text>
            </view>
          </button>
          <button class="fx67ll-btn-cancel" @click="handleBackToSelect">
            <view class="fx67ll-btn-content">
              <text class="fx67ll-btn-icon">↩</text>
              <text>返回重选</text>
            </view>
          </button>
        </view>
      </template>
    </view>
  </zb-drawer>
</template>

<script>
import moment from "@/node_modules/moment";
import "@/node_modules/moment/locale/zh-cn";

export default {
  name: "ExtraDrawer",

  props: {
    // 是否显示抽屉
    isShowExtraDrawer: {
      type: Boolean,
      required: true,
      default: false,
    },
    // 多选操作的外快盈亏记录数据
    multipleExtraDataList: {
      type: Array,
      required: true,
      default: () => [],
    },
    // 多选操作按钮名称
    operaBtnName: {
      type: String,
      required: false,
      default: "提交多选数据",
    },
    // 默认选中的对象列表，传入对象的extraId属性值会与列表数据匹配，匹配上则默认勾选
    selectedExtraItemList: {
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
      drawerHeight: "85%",
      drawerTitle: moment().format("YYYY-MM-DD HH:mm:ss dddd"),
      // 本地选中的主键数组，用于跟踪选中状态
      localCheckedIds: [],
      // 记录是否已经处理过默认选中
      hasProcessedDefaultSelection: false,
      // 是否处于合并确认步骤（false为记录选择步骤，true为合并确认步骤）
      isConfirmStep: false,
      // 合并后新记录的备注（可不填写）
      mergeRemark: "",
    };
  },

  computed: {
    // 选中的项目数量
    selectedCount() {
      return this.localCheckedIds.length;
    },

    // 选中的记录数据（保持列表展示顺序）
    selectedList() {
      return this.multipleExtraDataList.filter((item) => this.localCheckedIds.includes(item.extraId));
    },

    // 动态计算滚动区域高度
    scrollViewHeight() {
      // 记录选择步骤有数据时带工具栏，其余场景仅保留底部按钮区域
      const hasToolbar = !this.isConfirmStep && this.multipleExtraDataList.length > 0;
      return hasToolbar ? "calc(100% - 120px)" : "calc(100% - 60px)";
    },

    // 全选状态
    isAllSelected() {
      if (this.multipleExtraDataList.length === 0) return false;
      return this.localCheckedIds.length === this.multipleExtraDataList.length;
    },

    // 待合并记录条数
    mergeCount() {
      return this.selectedList.length;
    },

    // 所选记录中创建时间最新的一条（快照类数值与创建时间预览取自该条）
    lastMergeRow() {
      const rows = [...this.selectedList].sort((a, b) =>
        (a.createTime || "").localeCompare(b.createTime || "")
      );
      return rows.length > 0 ? rows[rows.length - 1] : null;
    },

    // 合并后盈亏金额预览：所选记录盈亏金额之和
    mergedWinMoney() {
      let total = 0;
      this.selectedList.forEach((item) => {
        const winMoney = parseFloat(item.winMoney);
        if (!isNaN(winMoney)) {
          total += winMoney;
        }
      });
      return total.toFixed(2);
    },

    // 合并后盈亏金额展示文本（正数带加号，与列表展示习惯一致）
    mergedWinMoneyText() {
      return parseFloat(this.mergedWinMoney) > 0 ? "+" + this.mergedWinMoney : this.mergedWinMoney;
    },

    // 合并后盈亏金额配色（与列表盈亏金额展示配色一致）
    mergedWinMoneyClass() {
      const winMoney = parseFloat(this.mergedWinMoney);
      if (winMoney > 0) {
        return "fx67ll-win-money-positive";
      }
      if (winMoney < 0) {
        return "fx67ll-win-money-negative";
      }
      return "fx67ll-win-money-zero";
    },

    // 合并后是否盈利预览：按合并后盈亏金额正负推导（0 按未盈利处理）
    previewIsWinText() {
      return parseFloat(this.mergedWinMoney) > 0 ? "是" : "否";
    },
  },

  watch: {
    // 监听父组件传递的显示状态
    isShowExtraDrawer(newValue) {
      if (newValue) {
        // 显示时更新时间
        this.showNowTime();
        // 重置默认选中处理标志与合并确认步骤状态
        this.hasProcessedDefaultSelection = false;
        this.isConfirmStep = false;
        this.mergeRemark = "";
        // 延迟处理默认选中，确保数据已加载
        this.$nextTick(() => {
          this.processDefaultSelection();
        });
      } else {
        this.localCheckedIds = [];
        this.clearTimer();
        this.$emit("hideDrawer", false);
      }
    },

    // 监听列表数据变化，初始化选中状态
    multipleExtraDataList: {
      immediate: true,
      handler(newData) {
        if (newData && newData.length > 0) {
          // 外快盈亏记录为接口原始数据，无预置勾选标记，列表变化时重置选中状态，避免脏选中
          this.localCheckedIds = [];

          // 如果抽屉已打开且未处理默认选中，则处理默认选中
          if (this.isShowExtraDrawer && !this.hasProcessedDefaultSelection) {
            this.processDefaultSelection();
          }
        } else {
          this.localCheckedIds = [];
        }
      }
    },

    // 监听默认选中对象列表的变化
    selectedExtraItemList: {
      deep: true,
      handler(newList) {
        // 只有在抽屉已打开且未处理默认选中的情况下才处理
        if (this.isShowExtraDrawer && !this.hasProcessedDefaultSelection && newList && newList.length > 0) {
          this.processDefaultSelection();
        }
      }
    },
  },

  mounted() {
    // moment初始汉化
    moment.locale("zh-cn");
    if (this.isShowExtraDrawer) {
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

    // 格式化盈亏金额展示文本（正数带加号，与列表展示习惯一致）
    formatWinMoney(item) {
      if (item.isWin === 'Y') {
        return `+${item.winMoney}`;
      }
      if (item.winMoney === '0') {
        return '0';
      }
      return `${item.winMoney}`;
    },

    // 关闭当前弹窗
    closeDrawer() {
      this.localCheckedIds = [];
      this.isConfirmStep = false;
      this.mergeRemark = "";
      this.clearTimer();
      this.$emit("hideDrawer", false);
    },

    // 判断单个项目是否被选中
    isItemSelected(item) {
      return this.localCheckedIds.includes(item.extraId);
    },

    // 切换单个项目的选中状态
    toggleItemSelection(item) {
      const extraId = item.extraId;
      const index = this.localCheckedIds.indexOf(extraId);

      if (index > -1) {
        // 已选中，则取消选中
        this.localCheckedIds.splice(index, 1);
      } else {
        // 未选中，则添加选中
        this.localCheckedIds.push(extraId);
      }

      // 触发响应式更新
      this.$forceUpdate();
    },

    // 全选/反选切换
    toggleSelectAll() {
      if (this.multipleExtraDataList.length === 0) return;

      if (this.isAllSelected) {
        // 取消全选：清空选中值
        this.localCheckedIds = [];
      } else {
        // 全选：添加所有项目的extraId
        this.localCheckedIds = this.multipleExtraDataList.map(item => item.extraId);
      }

      // 触发响应式更新
      this.$forceUpdate();
    },

    // 处理默认选中逻辑
    processDefaultSelection() {
      // 确保只执行一次
      if (this.hasProcessedDefaultSelection) return;

      // 确保抽屉已打开且有数据
      if (!this.isShowExtraDrawer || !this.multipleExtraDataList || this.multipleExtraDataList.length === 0) return;

      // 确保有默认选中对象列表
      if (!this.selectedExtraItemList || this.selectedExtraItemList.length === 0) {
        this.hasProcessedDefaultSelection = true;
        return;
      }

      // 用于记录找到的匹配项数量
      let matchedCount = 0;
      let notMatchedCount = 0;

      // 遍历默认选中对象列表
      this.selectedExtraItemList.forEach(selectedItem => {
        if (selectedItem && selectedItem.extraId !== undefined && selectedItem.extraId !== null) {
          // 查找列表中是否存在与默认选中对象匹配的项
          const matchedItem = this.multipleExtraDataList.find(item =>
            item.extraId === selectedItem.extraId
          );

          if (matchedItem && !this.localCheckedIds.includes(selectedItem.extraId)) {
            this.localCheckedIds.push(selectedItem.extraId);
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

    // 处理选中数据提交：校验通过后进入合并确认步骤，展示合并结果预览并录入合并后备注
    handleSubmit() {
      if (this.selectedCount === 0) {
        uni.showToast({
          title: '请至少选择一条记录',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 合并至少需要两条记录
      if (this.selectedCount < 2) {
        uni.showToast({
          title: '请至少选择两条记录进行合并！',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 单次合并数量上限校验（与后台 MERGE_MAX_INPUT_COUNT 保持一致）
      if (this.selectedCount > 23) {
        uni.showToast({
          title: '单次最多合并23条记录！',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 连续性校验：所选记录在当前已加载列表中必须连续（后台仍会按全量历史数据二次校验）
      const selectedIndexList = [];
      this.multipleExtraDataList.forEach((item, index) => {
        if (this.localCheckedIds.includes(item.extraId)) {
          selectedIndexList.push(index);
        }
      });
      for (let i = 1; i < selectedIndexList.length; i++) {
        if (selectedIndexList[i] !== selectedIndexList[i - 1] + 1) {
          uni.showToast({
            title: '待合并的历史数据必须连续！',
            icon: 'none',
            duration: 2000
          });
          return;
        }
      }

      // 校验通过，进入合并确认步骤
      this.isConfirmStep = true;
    },

    // 返回记录选择步骤重新选择
    handleBackToSelect() {
      this.isConfirmStep = false;
      this.mergeRemark = "";
    },

    // 确认合并：将所选记录与合并后备注提交给父组件，由父组件调用后台事务接口完成合并
    handleMergeConfirm() {
      this.$emit("submitDrawer", {
        selectedList: this.selectedList,
        extraRemark: this.mergeRemark,
      });
    },
  },
};
</script>

<style lang="less">
@import url("./extraDrawer.less");
</style>
