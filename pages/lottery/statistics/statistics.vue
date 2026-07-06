<template>
  <view class="fx67ll-statistics-box">
    <view v-if="hasData">
      <!-- 顶部汇总卡片 -->
      <view class="summary-card">
        <view class="summary-title">总体统计概览</view>
        <view class="summary-grid">
          <view class="summary-item">
            <view class="summary-label">总中奖金额</view>
            <view class="summary-value value-win">￥{{ formatMoney(summary.totalWinningAmount) }}</view>
            <view class="summary-sub">花费 ￥{{ formatMoney(summary.totalCost) }}</view>
          </view>
          <view class="summary-item">
            <view class="summary-label">净收益</view>
            <view class="summary-value" :class="summary.netProfit >= 0 ? 'value-profit' : 'value-loss'">
              <text class="summary-icon">{{ summary.netProfit >= 0 ? '↑' : '↓' }}</text>￥{{
                formatMoney(Math.abs(summary.netProfit)) }}
            </view>
            <view class="summary-sub">{{ summary.netProfit >= 0 ? '盈利' : '亏损' }}</view>
          </view>
          <view class="summary-item">
            <view class="summary-label">总期数</view>
            <view class="summary-value value-cost">{{ summary.totalTickets }}</view>
            <view class="summary-sub">共 {{ summary.totalNumbers }} 注</view>
          </view>
          <view class="summary-item">
            <view class="summary-label">中奖率</view>
            <view class="summary-value value-rate">{{ summary.winRate }}%</view>
            <view class="summary-sub">中奖 {{ summary.winningTickets }} / {{ summary.totalTickets }} 期</view>
          </view>
        </view>
      </view>

      <!-- 中奖金额占比饼图 -->
      <view class="chart-card">
        <view class="chart-card-title">中奖金额占比</view>
        <!-- #ifdef H5 -->
        <view class="chart-container">
          <qiun-data-charts type="pie" :opts="pieOpts" :chartData="pieChartData" />
        </view>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="chart-container" style="height: 500rpx">
          <qiun-data-charts type="pie" :opts="pieOpts" :chartData="pieChartData" />
        </view>
        <!-- #endif -->
      </view>

      <!-- 各类型中奖金额柱状图 -->
      <view class="chart-card" v-if="typeList.length > 0">
        <view class="chart-card-title">各类型中奖金额</view>
        <!-- #ifdef H5 -->
        <view class="chart-container">
          <qiun-data-charts type="column" :opts="columnOpts" :chartData="columnChartData" />
        </view>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="chart-container" style="height: 500rpx">
          <qiun-data-charts type="column" :opts="columnOpts" :chartData="columnChartData" />
        </view>
        <!-- #endif -->
      </view>

      <!-- 各类型中奖率环形图 -->
      <view class="chart-card" v-if="typeList.length > 0">
        <view class="chart-card-title">各类型中奖率（%）</view>
        <!-- #ifdef H5 -->
        <view class="chart-container">
          <qiun-data-charts type="ring" :opts="ringOpts" :chartData="ringChartData" />
        </view>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="chart-container" style="height: 500rpx">
          <qiun-data-charts type="ring" :opts="ringOpts" :chartData="ringChartData" />
        </view>
        <!-- #endif -->
      </view>

      <!-- 明细卡片列表 -->
      <view class="detail-section">
        <view class="detail-section-title">各类型明细</view>
        <view class="detail-card" v-for="item in typeList" :key="item.key">
          <view class="detail-card-header">
            <view class="detail-card-type">{{ item.lotteryType }}</view>
            <view class="detail-card-profit" :class="item.netProfit >= 0 ? 'profit-win' : 'profit-loss'">
              {{ item.netProfit >= 0 ? '+' : '-' }}￥{{ formatMoney(Math.abs(item.netProfit)) }}
            </view>
          </view>
          <view class="detail-card-grid">
            <view class="detail-grid-item">
              <view class="detail-grid-label">中奖金额</view>
              <view class="detail-grid-value value-win">￥{{ formatMoney(item.totalWinningAmount) }}</view>
            </view>
            <view class="detail-grid-item">
              <view class="detail-grid-label">总花费</view>
              <view class="detail-grid-value value-cost">￥{{ formatMoney(item.totalCost) }}</view>
            </view>
            <view class="detail-grid-item">
              <view class="detail-grid-label">中奖期数</view>
              <view class="detail-grid-value">{{ item.winningTickets }}</view>
            </view>
            <view class="detail-grid-item">
              <view class="detail-grid-label">总期数</view>
              <view class="detail-grid-value">{{ item.totalTickets }}</view>
            </view>
            <view class="detail-grid-item">
              <view class="detail-grid-label">总注数</view>
              <view class="detail-grid-value">{{ item.totalNumbers }}</view>
            </view>
            <view class="detail-grid-item">
              <view class="detail-grid-label">中奖率</view>
              <view class="detail-grid-value value-rate">{{ item.winRate }}%</view>
            </view>
          </view>
          <!-- 中奖率进度条 -->
          <view class="detail-progress-wrap">
            <view class="detail-progress-label">中奖率</view>
            <view class="detail-progress-bar">
              <view class="detail-progress-inner" :style="{ width: item.winRate + '%' }"></view>
            </view>
            <view class="detail-progress-num">{{ item.winRate }}%</view>
          </view>
        </view>
      </view>
    </view>

    <view class="no-data" :class="{ 'fade-show': !logTotalLoading }" v-if="!hasData && !logTotalLoading">
      <img src="/static/images/no-data.png" />
    </view>
  </view>
</template>

<script>
import { listTotalReward } from "@/api/fx67ll/lottery/log";

export default {
  data() {
    return {
      logTotalList: [],
      typeList: [],
      logTotalLoading: false,
      // 合计数据
      summary: {
        totalWinningAmount: 0,
        totalCost: 0,
        netProfit: 0,
        winRate: 0,
        winningTickets: 0,
        totalTickets: 0,
        totalNumbers: 0,
      },
      // 统一配色色系：小清新活泼风格，明度适中、标识鲜明，所有图表共用同一套色板
      chartColor: ['#2ecc71', '#ff6b6b', '#4dabf7', '#f08c00', '#9775fa', '#ff8787', '#51cf66', '#ff922b'],
      // 彩票类型 → 固定颜色映射（兼容中文名与数字编码），保证同一玩法在各图表中颜色一致
      // 双色球为红球玩法 → 小清新红；大乐透为蓝球玩法 → 浅天蓝；整体偏淡小清新风
      lotteryTypeColorMap: {
        '双色球': '#ff6b6b', '2': '#ff6b6b',
        '大乐透': '#5bb8f9', '1': '#5bb8f9',
        '排列三': '#fb8c00', '3': '#fb8c00',
        '排列五': '#f78ab0', '4': '#f78ab0',
        '七星彩': '#a580f7', '5': '#a580f7',
      },
      // 饼图
      pieChartData: { series: [] },
      pieOpts: {
        color: ['#2ecc71', '#ff6b6b'],
        padding: [5, 5, 5, 5],
        enableScroll: false,
        extra: {
          pie: {
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: true,
            borderWidth: 3,
            borderColor: '#FFFFFF',
          },
        },
        legend: {
          show: true,
          fontSize: 12,
          lineHeight: 20,
        },
      },
      // 柱状图
      columnChartData: { categories: [], series: [] },
      columnOpts: {
        color: ['#2ecc71'],
        padding: [15, 15, 0, 5],
        enableScroll: false,
        legend: { show: false },
        xAxis: {
          disableGrid: false,
          axisLine: true,
          fontSize: 11,
          rotateLabel: true,
          rotateAngle: 45,
        },
        yAxis: {
          gridType: 'dash',
          dashLength: 4,
          data: [{ min: 0 }],
        },
        extra: {
          column: {
            type: 'group',
            width: 30,
            barBorderCircle: true,
            linearType: 'custom',
            linearOpacity: 0.5,
            customColor: ['#2ecc71'],
          },
        },
      },
      // 环形图
      ringChartData: { categories: [], series: [] },
      ringOpts: {
        color: ['#2ecc71', '#ff6b6b', '#4dabf7', '#f08c00', '#9775fa', '#ff8787', '#51cf66', '#ff922b'],
        padding: [5, 5, 5, 5],
        enableScroll: false,
        // 环形图中心文字
        title: {
          name: '综合中奖率',
          fontSize: 13,
          color: '#909399',
        },
        subtitle: {
          name: '0%',
          fontSize: 18,
          color: '#2ecc71',
        },
        legend: {
          show: true,
          fontSize: 11,
          lineHeight: 18,
        },
        extra: {
          ring: {
            offsetAngle: 0,
            ringWidth: 25,
            border: true,
            borderWidth: 2,
            borderColor: '#FFFFFF',
          },
        },
      },
    };
  },
  computed: {
    hasData() {
      return this.logTotalList && this.logTotalList.length > 0;
    },
  },
  onLoad() {
    this.getTotalReward();
  },
  methods: {
    // 查询历史号码中奖金额统计
    getTotalReward() {
      const self = this;
      this.logTotalLoading = true;
      uni.showLoading({ title: '查询数据中...' });
      this.logTotalList = [];
      this.typeList = [];
      listTotalReward()
        .then((res) => {
          if (res?.code === 200 && res?.rows && res?.rows.length > 0) {
            const rows = res.rows;
            // 最后一项是合计，单独提取
            const totalObj = rows[rows.length - 1];
            const typeRows = rows.slice(0, rows.length - 1);
            // 合计数据
            self.summary = self.buildSummary(totalObj);
            // 各类型明细
            self.typeList = typeRows.map((item, index) => self.buildTypeItem(item, index));
            self.logTotalList = rows;
            // 构建图表数据
            self.buildPieChart(totalObj);
            self.buildColumnChart(self.typeList);
            self.buildRingChart(self.typeList);
          } else if (res?.code === 200) {
            uni.showToast({ title: '暂无更多数据！', icon: 'none', duration: 1998 });
          } else {
            uni.showToast({ title: '查询历史统计记录失败！', icon: 'none', duration: 1998 });
          }
        })
        .finally(() => {
          uni.hideLoading();
          self.logTotalLoading = false;
        });
    },
    // 构建合计数据
    buildSummary(item) {
      const win = parseFloat(item?.totalWinningAmount || 0);
      const cost = parseFloat((item?.totalNumbers || 0) * 2);
      const winTickets = parseInt(item?.winningTickets || 0);
      const totalTickets = parseInt(item?.totalTickets || 0);
      const totalNumbers = parseInt(item?.totalNumbers || 0);
      return {
        totalWinningAmount: win,
        totalCost: cost,
        netProfit: win - cost,
        // 中奖率 = 中奖期数 / 总期数
        winRate: totalTickets > 0 ? ((winTickets / totalTickets) * 100).toFixed(1) : '0.0',
        winningTickets: winTickets,
        totalTickets: totalTickets,
        totalNumbers: totalNumbers,
      };
    },
    // 构建各类型明细项
    buildTypeItem(item, index) {
      const win = parseFloat(item?.totalWinningAmount || 0);
      const cost = parseFloat((item?.totalNumbers || 0) * 2);
      const winTickets = parseInt(item?.winningTickets || 0);
      const totalTickets = parseInt(item?.totalTickets || 0);
      return {
        ...item,
        key: index,
        totalWinningAmount: win,
        totalCost: cost,
        netProfit: win - cost,
        winRate: totalTickets > 0 ? ((winTickets / totalTickets) * 100).toFixed(1) : '0.0',
      };
    },
    // 饼图：已中奖 vs 未中奖金额占比（用合计）
    buildPieChart(totalObj) {
      const win = parseInt(totalObj?.totalWinningAmount || 0);
      const cost = parseInt((totalObj?.totalNumbers || 0) * 2);
      const notWin = cost - win > 0 ? cost - win : 0;
      this.pieChartData = {
        series: [
          {
            data: [
              { name: '已中奖', value: win },
              { name: '未中奖', value: notWin },
            ],
          },
        ],
      };
    },
    // 柱状图：各类型中奖金额（统一绿色单色）
    buildColumnChart(typeList) {
      this.columnChartData = {
        categories: typeList.map((item) => item.lotteryType),
        series: [
          {
            name: '中奖金额',
            data: typeList.map((item) => item.totalWinningAmount),
          },
        ],
      };
      const columnGreen = '#2ecc71';
      this.columnOpts.color = typeList.map(() => columnGreen);
      this.columnOpts.extra.column.customColor = [...this.columnOpts.color];
    },
    // 环形图：各类型中奖率（ring/pie 类型需 [{name, value}] 数据结构）
    // 包含 0% 的类型，按固定玩法顺序排列，每段用对应玩法的固定颜色，中心展示综合中奖率
    buildRingChart(typeList) {
      // 按固定玩法顺序排序，确保同玩法在各处颜色一致（双色球恒为红）
      const ordered = [...typeList].sort((a, b) => this.typeOrder(a.lotteryType) - this.typeOrder(b.lotteryType));
      this.ringChartData = {
        series: [
          {
            name: '中奖率',
            data: ordered.map((item) => ({
              name: item.lotteryType,
              value: parseFloat(item.winRate),
            })),
          },
        ],
      };
      // 颜色数组与数据顺序一一对应
      this.ringOpts.color = ordered.map((item) => this.getTypeColor(item.lotteryType));
      // 中心副标题：所有类型的中奖率均值
      const avgRate =
        typeList.length > 0
          ? (typeList.reduce((sum, item) => sum + parseFloat(item.winRate), 0) / typeList.length).toFixed(1)
          : '0.0';
      this.ringOpts.subtitle.name = avgRate + '%';
    },
    // 取玩法对应的固定颜色，未知类型回退到统一色板
    getTypeColor(lotteryType) {
      const key = String(lotteryType);
      if (this.lotteryTypeColorMap[key]) return this.lotteryTypeColorMap[key];
      // 兜底：按统一色板循环取色
      const fallbackIndex = Object.keys(this.lotteryTypeColorMap).filter((k) => isNaN(k)).length;
      return this.chartColor[fallbackIndex % this.chartColor.length];
    },
    // 玩法固定排序权重（用于环形图按稳定顺序排列）
    typeOrder(lotteryType) {
      const order = { '大乐透': 1, '1': 1, '双色球': 2, '2': 2, '排列三': 3, '3': 3, '排列五': 4, '4': 4, '七星彩': 5, '5': 5 };
      return order[String(lotteryType)] || 99;
    },
    // 格式化金额：保留2位小数，去掉多余的0
    formatMoney(num) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      const n = parseFloat(num);
      return n % 1 === 0 ? String(n) : n.toFixed(2);
    },
  },
};
</script>

<style lang="less">
@import url("./statistics.less");
</style>
