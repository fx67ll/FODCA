<template>
  <view class="fx67ll-log-box">
    <!-- z-paging 组件文档地址：https://z-paging.zxlee.cn/ -->
    <z-paging-mini ref="paging" back-to-top-bottom="166rpx" :auto-show-back-to-top="true" v-model="logList"
      @query="queryLogList">
      <!-- top插件，不可以直接使用v-if，可以在二级元素使用 -->
      <view slot="top">
        <v-tabs class="nav-tab-box nav-tab-box-four" v-model="tabCurrentIndex" v-if="logFilterType === 1"
          :tabs="tabDataList" :scroll="false" :lineScale="0.3" @change="handleTabChange"></v-tabs>
      </view>
      <uni-swipe-action>
        <view class="fx67ll-log-item" v-for="item in logList" :key="item.logKey">
          <uni-swipe-action-item :left-options="!listMergeMode ? leftActionOptions : []"
            :right-options="!listMergeMode ? rightActionOptions : []" @click="(e) => handleActionClick(e, item)">
            <uni-section :title="item.logTitle" type="line">
              <template v-slot:right>{{ item.createDate || "-" }}</template>
              <uni-list :border="true">
                <view>
                  <uni-list-chat v-for="ita in item.chaseList" :key="ita.numKey"
                    :avatar="'https://test.fx67ll.com/fx67ll-img-collection-for-lottery/' + item.numberType + '.jpg'"
                    :title="ita.title" :note="ita.chaseNumber">
                    <template v-slot:default>
                      <view :style="{ fontSize: '12px', color: '#999' }">
                        {{ ita.updateTime }}
                      </view>
                      <view>
                        <uni-badge :text="ita.winText" :custom-style="ita.isRed && item.winFlag === 'Y'
                          ? badgeCustomStyle
                          : badgeCustomStyleNotWinShort
                          " />
                      </view>
                    </template>
                  </uni-list-chat>
                </view>

                <view>
                  <uni-list-chat v-for="itb in item.recordList" :key="itb.numKey" :avatar="'https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=' +
                    (8 - item.numberType)
                    " :title="itb.title" :note="itb.recordNumber">
                    <template v-slot:default>
                      <view :style="{ fontSize: '12px', color: '#999' }">
                        {{ itb.updateTime }}
                      </view>
                      <view>
                        <uni-badge :text="itb.winText" :custom-style="itb.isRed && item.winFlag === 'Y'
                          ? badgeCustomStyle
                          : badgeCustomStyleNotWinShort
                          " />
                      </view>
                    </template>
                  </uni-list-chat>
                </view>

                <view v-if="item.winningList.length > 0">
                  <uni-list-chat v-for="itb in item.winningList" :key="itb.numKey" :avatar="item.winFlag === 'Y'
                    ? lotteryTypeMap[item.numberType].winImg
                    : lotteryTypeMap[item.numberType].ggImg
                    " :title="itb.title" :note="itb.winningNumber">
                    <template v-slot:default>
                      <view :style="{ fontSize: '12px', color: '#999' }">
                        {{ itb.winningText }}
                      </view>
                      <view>
                        <uni-badge :text="itb.winText" :custom-style="item.winFlag === 'Y'
                          ? badgeCustomStyleWin
                          : badgeCustomStyleNotWinLong
                          " />
                      </view>
                    </template>
                  </uni-list-chat>
                </view>
              </uni-list>
            </uni-section>
          </uni-swipe-action-item>
        </view>
      </uni-swipe-action>
    </z-paging-mini>
    <uni-popup ref="inputDialog" type="dialog">
      <uni-popup-dialog ref="inputClose" mode="input" v-if="isNeedInitDialog" :title="dateCodeQryTip"
        :placeholder="dateCodeQryPlaceHolder" :value="formParams.dateCodeValue"
        @confirm="handleDateCodeDialogConfirm"></uni-popup-dialog>
    </uni-popup>
    <uni-fab ref="fab" :pattern="fabConfig.pattern" :content="fabConfig.content" :horizontal="fabConfig.horizontal"
      :vertical="fabConfig.vertical" :direction="fabConfig.direction" @trigger="handleFabTrigger" />
    <zb-drawer mode="bottom" title="高级筛选" height="70%" :wrapperClosable="false" :visible.sync="isShowDrawer"
      :radius="true">
      <view class="fx67ll-search-drawer">
        <view class="fx67ll-tab-box" v-if="logFilterType === 2">
          <view v-for="(lotteryItem, key) in lotteryTypeMap" :key="key" :class="{
            'fx67ll-tab-item': true,
            'fx67ll-tab-item-type': true,
            'fx67ll-tab-item-type-active':
              parseInt(queryParams.numberType) === lotteryItem.type,
          }" @click="setSearchFilterParams('numberType', lotteryItem.type)">
            {{ lotteryItem.text }}
          </view>
          <view :class="{
            'fx67ll-tab-item': true,
            'fx67ll-tab-item-yes-or-not': queryParams.hasDateCode !== 'Y',
            'fx67ll-tab-item-yes-or-not-active': queryParams.hasDateCode === 'Y',
          }" @click="setSearchFilterParams('hasDateCode', queryParams.hasDateCode === 'Y' ? 'N' : 'Y')">
            {{
              !queryParams.hasDateCode
                ? "是否有彩票期号"
                : `${queryParams.hasDateCode === "Y" ? "有" : "无"}彩票期号`
            }}
          </view>
          <view :class="{
            'fx67ll-tab-item': true,
            'fx67ll-tab-item-yes-or-not': queryParams.hasWinningNumber !== 'Y',
            'fx67ll-tab-item-yes-or-not-active': queryParams.hasWinningNumber === 'Y',
          }" @click="setSearchFilterParams('hasWinningNumber', queryParams.hasWinningNumber === 'Y' ? 'N' : 'Y')">
            {{
              !queryParams.hasWinningNumber
                ? "是否记录中奖号码"
                : `${queryParams.hasWinningNumber === "Y" ? "已" : "没有"}记录过中奖号码`
            }}
          </view>
          <view :class="{
            'fx67ll-tab-item': true,
            'fx67ll-tab-item-yes-or-not': queryParams.isWin !== 'Y',
            'fx67ll-tab-item-yes-or-not-active': queryParams.isWin === 'Y',
          }" @click="setSearchFilterParams('isWin', queryParams.isWin === 'Y' ? 'N' : 'Y')">
            {{
              !queryParams.isWin
                ? "是否中奖"
                : `${queryParams.isWin === "Y" ? "已" : "未"}中奖`
            }}
          </view>
          <view :class="{
            'fx67ll-tab-item': true,
            'fx67ll-tab-item-date': true,
            'fx67ll-tab-item-date-active': searchFilterDateType === 'thisWeek',
          }" @click="setSearchFilterDateParams('thisWeek')">本周
          </view>
          <view :class="{
            'fx67ll-tab-item': true,
            'fx67ll-tab-item-date': true,
            'fx67ll-tab-item-date-active': searchFilterDateType === 'thisMonth',
          }" @click="setSearchFilterDateParams('thisMonth')">本月
          </view>
          <view :class="{
            'fx67ll-tab-item': true,
            'fx67ll-tab-item-date': true,
            'fx67ll-tab-item-date-active': searchFilterDateType === 'latestWeek',
          }" @click="setSearchFilterDateParams('latestWeek')">最近7天
          </view>
          <view :class="{
            'fx67ll-tab-item': true,
            'fx67ll-tab-item-date': true,
            'fx67ll-tab-item-date-active': searchFilterDateType === 'latestMonth',
          }" @click="setSearchFilterDateParams('latestMonth')">最近30天
          </view>
        </view>
        <view class="fx67ll-tab-btn">
          <button class="fx67ll-tab-btn-search" type="primary" @click="handleDrawerSubmit">查询</button>
          <button class="fx67ll-tab-btn-reset" @click="setSearchFilterParams('reset')">重置条件</button>
        </view>
      </view>
    </zb-drawer>
  </view>
</template>

<script>
  import { getLogList, delLog, editLog, getLogInfo } from "@/api/fx67ll/lottery/log";
  import {
    diffTimeStrFromNow,
    compareStringsBasic,
    compareStringsCheckIsLowestReward,
    hasNumberAppearedTwiceOrMore,
    checkLotteryResult,
  } from "@/utils/index";
  import { showConfirm } from "@/utils/common";
  import uniListChat from "@/uni_modules/uni-list/components/uni-list-chat/uni-list-chat.vue";
  import vTabs from "@/uni_modules/v-tabs/v-tabs.vue";

  // 获取加密配置
  import { getSecretConfig } from "@/api/fx67ll/secret/key.js";
  import { decryptString } from "@/utils/index";
  import { getCryptoSaltKey } from "@/neverUploadToGithub";
  import uniPopup from "@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue";
  import uniPopupDialog from "@/uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.vue";

  // 日期时间处理
  import moment from "@/node_modules/moment";
  import "moment/locale/zh-cn";
  import "@/node_modules/moment/locale/zh-cn";

  export default {
    components: { uniListChat, uniPopup, uniPopupDialog, vTabs },
    data() {
      return {
        // 当前登录用户信息
        userName: this.$store.state.user.name,
        logList: [],
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          numberType: null,
          isWin: null,
          beginCreateTime: null,
          endCreateTime: null,
        },
        formParams: {
          lotteryId: "",
          dateCode: "",
          numberType: "",
        },
        dateCodeQryTip: "提示：必要查询条件缺失",
        dateCodeQryPlaceHolder: "请输入彩票期号",
        isNeedInitDialog: false,
        lastSearchRewardInfoLotteryIds: [],
        badgeCustomStyle: {
          backgroundColor: "#2ecc71",
          zoom: 1.2,
          position: "relative",
          left: "6rpx",
          top: "4rpx",
          padding: "0 14rpx",
        },
        badgeCustomStyleNotWinShort: {
          backgroundColor: "#ff5a5f",
          zoom: 1.2,
          position: "relative",
          left: "6rpx",
          top: "4rpx",
          padding: "0 14rpx",
        },
        badgeCustomStyleWin: {
          backgroundColor: "#ffa940",
          zoom: 1.2,
          position: "relative",
          left: "14rpx",
          top: "4rpx",
          padding: "0 14rpx",
        },
        badgeCustomStyleNotWinLong: {
          backgroundColor: "#ff5a5f",
          zoom: 1.2,
          position: "relative",
          left: "12rpx",
          top: "4rpx",
          padding: "0 14rpx",
        },
        leftActionOptions: [
          {
            text: "拷贝至剪切板",
            style: {
              backgroundColor: "#ffa940",
            },
          },
          {
            text: "查询开奖信息",
            style: {
              backgroundColor: "#ff4d4f",
            },
          },
        ],
        rightActionOptions: [
          {
            text: "取消",
            style: {
              backgroundColor: "#4096ff",
            },
          },
          {
            text: "修改",
            style: {
              backgroundColor: "#2ecc71",
            },
          },
          {
            text: "删除",
            style: {
              backgroundColor: "#ff4d4f",
            },
          },
        ],
        // 0-关闭筛选 1-快速筛选  2-高级筛选
        logFilterType: 0,
        // 二级功能入口配置
        fabConfig: {
          title: "uni-fab",
          directionStr: "垂直",
          horizontal: "right",
          vertical: "bottom",
          direction: "horizontal",
          pattern: {
            icon: "search",
            color: "#7A7E83",
            backgroundColor: "#ffffff",
            selectedColor: "#7A7E83",
            buttonColor: "#2ecc71",
            iconColor: "#ffffff",
          },
          is_color_type: false,
          content: [
            {
              iconPath:
                "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=22",
              selectedIconPath:
                "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=24",
              text: "快速筛选",
              active: false,
            },
            {
              iconPath:
                "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=22",
              selectedIconPath:
                "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=23",
              text: "高级筛选",
              active: false,
            },
            {
              iconPath:
                "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=10",
              selectedIconPath:
                "https://vip.fx67ll.com/vip-api/getRandomAvatar?avatarBlockNum=5&avatarPadding=10",
              text: "重置筛选",
              active: false,
            },
          ],
        },
        // 快速筛选当前激活索引
        tabCurrentIndex: 0,
        // 快速筛选类型
        tabDataList: ["全部", "大乐透", "双色球", "已中奖"],
        // 高级筛选弹窗
        isShowDrawer: false,
        // 高级筛选时间类型
        searchFilterDateType: null,
        // 彩票类型枚举（后期改为后台枚举接口获取）
        lotteryTypeMap: {
          1: {
            text: "大乐透",
            type: 1,
            winImg: "https://test.fx67ll.com/fx67ll-img-collection/luffy.jpg",
            ggImg: "https://test.fx67ll.com/fx67ll-img-collection/kuzan.jpg",
          },
          2: {
            text: "双色球",
            type: 2,
            winImg: "https://test.fx67ll.com/fx67ll-img-collection/luffy.jpg",
            ggImg: "https://test.fx67ll.com/fx67ll-img-collection/kuzan.jpg",
          },
          3: {
            text: "排列三",
            type: 3,
            winImg: "https://test.fx67ll.com/fx67ll-img-collection/luffy.jpg",
            ggImg: "https://test.fx67ll.com/fx67ll-img-collection/kuzan.jpg",
          },
          4: {
            text: "排列五",
            type: 4,
            winImg: "https://test.fx67ll.com/fx67ll-img-collection/luffy.jpg",
            ggImg: "https://test.fx67ll.com/fx67ll-img-collection/kuzan.jpg",
          },
          5: {
            text: "七星彩",
            type: 5,
            winImg: "https://test.fx67ll.com/fx67ll-img-collection/luffy.jpg",
            ggImg: "https://test.fx67ll.com/fx67ll-img-collection/kuzan.jpg",
          },
        },
        lotteryTypeList: [1, 2, 3, 4, 5, "1", "2", "3", "4", "5"],
        // 多选合并模式
        listMergeMode: false,
      };
    },
    onShow() {
      // 请勿直接调用queryLogList方法！
      if (this.$refs.paging) {
        this.$refs.paging.reload();
      }
    },
    onLoad() {
      // 设置语言为中文
      moment.locale("zh-cn");
    },
    onunload() {
      this.resetSearchFilter();
    },
    methods: {
      // 获取log数据
      queryLogList(pageNum, pageSize) {
        const self = this;
        if (!pageNum || !pageSize) {
          return;
        }
        this.queryParams = { ...self.queryParams, pageNum, pageSize };
        getLogList(self.queryParams)
          .then((res) => {
            if (res?.code === 200) {
              if (res?.rows && res?.rows?.length > 0) {
                // 将请求的结果数组传递给z-paging
                self.$refs.paging.complete(self.formatLogList(res.rows));
              } else {
                // uni.showToast({
                //   title: "暂无更多数据！",
                //   icon: "none",
                //   duration: 1998,
                // });
                self.$refs.paging.complete([]);
              }
            } else {
              uni.showToast({
                title: "查询历史号码记录失败！",
                icon: "none",
                duration: 1998,
              });
              self.$refs.paging.complete(false);
            }
          })
          .catch((res) => {
            // 如果请求失败写this.$refs.paging.complete(false);
            // 注意，每次都需要在catch中写这句话很麻烦，z-paging提供了方案可以全局统一处理
            // 在底层的网络请求抛出异常时，写uni.$emit('z-paging-error-emit');即可
            self.$refs.paging.complete(false);
          });
      },
      // 整理log数据适配显示
      formatLogList(list) {
        const self = this;
        const listResult = [];
        list.forEach((item) => {
          const winFlag = item?.isWin || "N";
          const createDateWeekInfo = moment(item?.createTime).format("dddd");
          const createDateDayInfo = moment(item?.createTime).format("YYYY/MM/DD");
          const tmpObj = {
            logId: item?.lotteryId,
            logKey: new Date().getTime() + self.getRandomIndex(),
            logTitle: item?.numberType
              ? `${self.lotteryTypeMap[parseInt(item?.numberType)].text}期号：${item?.dateCode || "-"
              }`
              : "-",
            dateCode: item?.dateCode,
            winFlag,
            chaseList: [],
            recordList: [],
            winningList: [],
            weekType: item?.weekType,
            numberType: item?.numberType,
            createTime: item?.createTime || "暂无数据",
            createDate: `${createDateDayInfo} ${createDateWeekInfo}`,
          };
          const cl = item?.chaseNumber?.split("/") || [];
          const rl = item?.recordNumber?.split("/") || [];
          const wl = item?.winningNumber?.split("/") || [];
          if (cl.length > 0 && cl[0] !== "") {
            cl.forEach((ita) => {
              const isRed =
                !wl[0] ||
                compareStringsCheckIsLowestReward(ita, wl[0]) ||
                compareStringsBasic(ita, wl[0]) > 2;
              tmpObj.chaseList.push({
                numKey: new Date().getTime() + self.getRandomIndex(),
                title: "固定追号",
                updateTime: self.subStrUpdateTime(item?.updateTime) || self.subStrUpdateTime(item?.createTime) || "暂无数据",
                chaseNumber: ita || "暂无数据",
                isRed,
                winText: self.getWinText(winFlag, item?.winningPrice, isRed),
              });
            });
          }
          if (rl.length > 0 && rl[0] !== "") {
            rl.forEach((itb) => {
              const isRed =
                !wl[0] ||
                compareStringsCheckIsLowestReward(itb, wl[0]) ||
                compareStringsBasic(itb, wl[0]) > 2;
              tmpObj.recordList.push({
                numKey: new Date().getTime() + self.getRandomIndex(),
                title: self.getTitleByNumberType(item?.numberType),
                updateTime: self.subStrUpdateTime(item?.updateTime) || self.subStrUpdateTime(item?.createTime) || "暂无数据",
                recordNumber: itb || "暂无数据",
                isRed,
                winText: self.getWinText(winFlag, item?.winningPrice, isRed),
              });
            });
          }
          if (wl.length > 0 && wl[0] !== "") {
            wl.forEach((itc) => {
              tmpObj.winningList.push({
                numKey: new Date().getTime() + self.getRandomIndex(),
                title: "本期开奖号码",
                winningText: tmpObj.winFlag === "Y" ? "☆(￣▽￣)/$:*" : "o(╥﹏╥)o",
                winningNumber: itc || "暂无数据",
                winText: tmpObj.winFlag === "Y" ? "恭喜今日中奖" : "本期未中奖",
              });
            });
          }
          listResult.push({ ...tmpObj });
        });
        return listResult;
      },
      // 根据当前星期几来获取标题
      getTitleByNumberType(type) {
        const self = this;
        if (self.lotteryTypeList.includes(type)) {
          return `随机${self.lotteryTypeMap[parseInt(type)].text}`;
        } else {
          return "异常数据";
        }
      },
      // 截取更新时间
      subStrUpdateTime(time) {
        if (time && time.length === 19) {
          return time.substring(2, 16);
        } else {
          return null;
        }
      },
      // 格式化是否中奖信息
      getWinText(flag, price, redFlag) {
        if (flag === "Y" && parseInt(price) > 0 && redFlag) {
          return `中奖${price}元`;
        } else {
          return "未中奖";
        }
      },
      // 获取1-1023范围的随机整数
      getRandomIndex() {
        return Math.floor(Math.random() * 1023) + 1;
      },
      // 删除log接口调用
      deleteLog(id) {
        const self = this;
        delLog(id).then((res) => {
          if (res?.code === 200) {
            uni.showToast({
              title: "历史号码记录删除成功！",
              icon: "none",
              duration: 1998,
            });
            self.$refs.paging.refresh();
          } else {
            uni.showToast({
              title: "历史号码记录删除失败！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      },
      // 删除log强制提示
      checkDelLog(logDelItem) {
        const self = this;
        const allowDelHour = 48;
        showConfirm(
          `删除后数据无法恢复，请确认是否删除创建时间为：${logDelItem?.createTime} 的历史号码记录？`,
          "警告"
        ).then((res) => {
          if (res?.confirm && logDelItem?.logId) {
            if (diffTimeStrFromNow(logDelItem?.createTime) <= 0 - allowDelHour) {
              uni.showToast({
                title: `记录创建时间已超过${allowDelHour}小时，不允许删除操作！`,
                icon: "none",
                duration: 1998,
              });
            } else {
              self.deleteLog(logDelItem.logId);
            }
          }
        });
      },
      // 格式化需要拷贝到剪切板的文字数据
      formatCopyContent(copyDataList, listKey, copyDataType) {
        const txtResList = [];
        console.log(copyDataList, listKey, copyDataType);
        copyDataList.forEach((itemA) => {
          let txtRes = "";
          if (itemA[listKey]) {
            const tmpListAlpha = itemA[listKey].split("-");
            tmpListAlpha.forEach((itemB, indexB) => {
              const tmpListBeta = itemB.split(",");
              if (indexB === 0) {
                tmpListBeta.forEach((itemC, indexC) => {
                  if (indexC !== tmpListBeta.length - 1) {
                    txtRes = txtRes.concat(`${itemC}  `);
                  } else {
                    if ([5].includes(parseInt(copyDataType, 10))) {
                      txtRes = txtRes.concat(`${itemC}`);
                    }
                    if ([1, 2].includes(parseInt(copyDataType, 10))) {
                      txtRes = txtRes.concat(`${itemC} - `);
                    }
                    if ([3, 4].includes(parseInt(copyDataType, 10))) {
                      txtRes = txtRes.concat(`${itemC}`);
                    }
                  }
                });
              }
              if (indexB === 1) {
                tmpListBeta.forEach((itemD, indexD) => {
                  if (indexD !== tmpListBeta.length - 1) {
                    txtRes = txtRes.concat(`${itemD}  `);
                  } else {
                    txtRes = txtRes.concat(`${itemD}`);
                  }
                });
              }
            });
            txtResList.push(txtRes);
          } else {
            console.error("待处理的数组key不存在！");
          }
        });
        return txtResList;
      },
      // 拼接处理需要返回的字符串
      concatTxtList(txtList) {
        let concatResTxt = "";
        txtList.forEach((item, index) => {
          if (index !== txtList.length - 1) {
            // #ifdef H5
            concatResTxt = concatResTxt.concat(` ${item} `, "\n");
            // #endif
            // #ifdef MP-WEIXIN
            concatResTxt = concatResTxt.concat(` ${item} `, "\r\n", "\r\n");
            // #endif
          } else {
            concatResTxt = concatResTxt.concat(` ${item} `);
          }
        });
        return concatResTxt;
      },
      // 拷贝至剪切板
      copyLuckyNumber(logCopyItem) {
        const self = this;

        // 接受log参数
        const tdType = logCopyItem?.numberType;
        const chList = logCopyItem?.chaseList;
        const reList = logCopyItem?.recordList;
        const luckyCount = chList.length + reList.length;

        // 处理追号和买的号
        let copyContentList = [];
        if (chList && chList.length > 0) {
          copyContentList = copyContentList.concat(
            this.formatCopyContent(chList, "chaseNumber", tdType)
          );
        }
        if (reList && reList.length > 0) {
          copyContentList = copyContentList.concat(
            this.formatCopyContent(reList, "recordNumber", tdType)
          );
        }
        const copyContentBody = this.concatTxtList(copyContentList);

        // 拼接标题和主体
        let copyContentTxt = "";
        const copyNumberTypeText = self.lotteryTypeMap[parseInt(tdType)].text;

        // #ifdef H5
        const copyContentTitleH5 =
          " 老板买" + luckyCount + "注自选号码" + copyNumberTypeText + " \n";
        copyContentTxt = copyContentTitleH5 + copyContentBody;
        // #endif
        // #ifdef MP-WEIXIN
        const copyContentTitleWX =
          " 老板买" + luckyCount + "注自选号码" + copyNumberTypeText + " \r\n \r\n";
        copyContentTxt = copyContentTitleWX + copyContentBody;
        // #endif

        // 处理剪切板函数
        uni.setClipboardData({
          data: copyContentTxt,
          showToast: false, // 仅支持 App (3.2.13+)、H5 (3.2.13+)
          success: function (res) {
            console.log("uni.setClipboardData - success: " + JSON.stringify(res));
            // #ifdef H5
            // 微信不支持关闭复制成功提示所以暂时只支持H5
            uni.showToast({
              title: "已为您成功复制到剪切板! ",
              icon: "none",
              duration: 1998,
            });
            // #endif
          },
          fail: function (err) {
            uni.showToast({
              title: "卧槽复制失败了！请联系管理员处理! ",
              icon: "none",
              duration: 1998,
            });
            console.error("uni.setClipboardData - fail: " + JSON.stringify(err));
          },
        });
      },
      // 修改号码历史记录详情
      editLogInfo(logId) {
        this.$tab.navigateTo(`/pages/lottery/log/edit/edit?lotteryId=${logId}`);
      },
      // 侧滑组件事件处理
      handleActionClick(e, record) {
        const self = this;
        if (e?.position === "right" && e?.index === 2) {
          this.checkDelLog(record);
        }
        if (e?.position === "right" && e?.index === 1) {
          this.editLogInfo(record?.logId);
        }
        if (e?.position === "left" && e?.index === 0) {
          this.copyLuckyNumber(record);
        }
        if (e?.position === "left" && e?.index === 1) {
          this.checkRecordData(record);
        }
      },
      // 查询中奖信息前确认是否有彩票期号
      checkRecordData(record) {
        const self = this;
        self.formParams.lotteryId = record?.logId;
        self.formParams.numberType = record?.numberType;
        if (this.userName && this.userName === "user") {
          uni.showToast({
            title: "付费功能，游客暂不支持试用，谢谢！",
            icon: "none",
            duration: 1998,
          });
          return;
        }
        if (!self.lotteryTypeList.includes(record?.numberType)) {
          uni.showToast({
            title: "数据异常，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
          return;
        }
        if (record?.winningList && record.winningList.length > 0) {
          self.lastSearchRewardInfoLotteryIds.push(record?.logId);
          if (
            hasNumberAppearedTwiceOrMore(self.lastSearchRewardInfoLotteryIds, record?.logId)
          ) {
            showConfirm("您似乎对查询结果不满意，是否需要强制为您再次查询开奖信息？").then(
              (res) => {
                if (res?.confirm) {
                  self.lastSearchRewardInfoLotteryIds = self.lastSearchRewardInfoLotteryIds.filter(
                    (recordLogId) => recordLogId !== record?.logId
                  );
                  self.qryRewardQueryConfig(record?.dateCode, record?.numberType);
                }
              }
            );
          } else {
            uni.showToast({
              title: "已查询过开奖信息，无需再次查询！",
              icon: "none",
              duration: 1998,
            });
          }
        } else if (record?.dateCode) {
          self.qryRewardQueryConfig(record?.dateCode, record?.numberType);
        } else {
          self.formatCreateDate(record?.createTime, record?.numberType);
          self.isNeedInitDialog = true;
          self.$refs.inputDialog.open();
        }
      },
      // 获取创建日期
      formatCreateDate(time, type) {
        const self = this;
        const originalDate = new Date(time);
        const year = originalDate.getFullYear().toString().substring(2);
        const month = originalDate.getMonth() + 1; // 月份从0开始，需要加1
        const day = originalDate.getDate();
        const formattedDate = `${year}年${month}月${day}日`;
        const lotteryTypeText = self.lotteryTypeMap[parseInt(type)].text;
        this.dateCodeQryPlaceHolder = `请输入${formattedDate + lotteryTypeText}的期号`;
      },
      // 修改彩票期号信息
      handleDateCodeDialogConfirm(dateCodeVal) {
        const self = this;
        this.formParams.dateCode = dateCodeVal;
        editLog(this.formParams).then((res) => {
          if (res?.code === 200) {
            self.qryRewardQueryConfig(dateCodeVal, self.formParams.numberType);
          } else {
            uni.showToast({
              title: "彩票期号记录失败！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      },
      // 查询外部网站所需要的配置
      qryRewardQueryConfig(logDateCode, logNumType) {
        const self = this;
        if (logDateCode && logNumType) {
          uni.showLoading({
            title: "查询ing...",
          });
          getSecretConfig({ secretKey: "qryLotteryRewardAppId" })
            .then((res) => {
              if (res && res?.rows && res?.rows.length > 0 && res?.code === 200) {
                const qryLotteryRewardAppId = decryptString(
                  res.rows[0].secretValue,
                  getCryptoSaltKey()
                );
                getSecretConfig({ secretKey: "qryLotteryRewardAppSecret" })
                  .then((res) => {
                    if (res && res?.rows && res?.rows.length > 0 && res?.code === 200) {
                      const qryLotteryRewardAppSecret = decryptString(
                        res.rows[0].secretValue,
                        getCryptoSaltKey()
                      );
                      self.queryLotteryRewardInfo(
                        qryLotteryRewardAppId,
                        qryLotteryRewardAppSecret,
                        logDateCode,
                        logNumType
                      );
                    } else {
                      uni.showToast({
                        title: "查询中奖信息查询接口配置项AppSecret失败！",
                        icon: "none",
                        duration: 1998,
                      });
                    }
                  })
                  .catch((error) => {
                    console.error("查询中奖信息查询接口配置项AppSecret异常：" + error);
                    uni.hideLoading();
                  });
              } else {
                uni.showToast({
                  title: "查询中奖信息查询接口配置项AppId失败！",
                  icon: "none",
                  duration: 1998,
                });
              }
            })
            .catch((error) => {
              console.error("查询中奖信息查询接口配置项AppId异常：" + error);
              uni.hideLoading();
            });
        } else {
          uni.showToast({
            title: "缺少必要查询条件，请联系管理员！",
            icon: "none",
            duration: 1998,
          });
        }
      },
      // 通过第三方站点查询开奖号码
      queryLotteryRewardInfo(appId, appSecret, dCode, nType) {
        const self = this;
        const lotteryCodeMap = {
          1: "cjdlt",
          2: "ssq",
          3: "pl3",
          4: "pl5",
          5: "qxc",
        };
        uni
          .request({
            url: "https://www.mxnzp.com/api/lottery/common/aim_lottery",
            data: {
              app_id: appId,
              app_secret: appSecret,
              expect: dCode,
              code: lotteryCodeMap[parseInt(nType)],
            },
            method: "GET",
          })
          .then((res) => {
            // 外部接口返回示例
            // const egObj = {
            //   openCode: "05,26,33,35,15+09+01",
            //   code: "cjdlt",
            //   expect: "2024032",
            //   name: "超级大乐透",
            //   time: "2024-03-23 21:26:16",
            // };
            if (res && res?.length > 1) {
              const resCode = res[1]?.data?.code || null;
              const resMsg = res[1]?.data?.msg || "-";
              const resData = res[1]?.data?.data || {};
              if (resCode === 10027) {
                uni.showToast({
                  title: "暂未开奖，请晚些时候再查询！",
                  icon: "none",
                  duration: 1998,
                });
              } else if (resData?.openCode) {
                self.formatWinningNumber(resData.openCode, nType);
              } else {
                // #ifdef MP-WEIXIN
                uni.showToast({
                  title: `查询失败！报错信息：${resMsg}`,
                  icon: "none",
                  duration: 1998,
                });
                // #endif
                // #ifdef H5
                uni.showToast({
                  title: `第三方站点开奖号码查询失败！报错信息：${resMsg}`,
                  icon: "none",
                  duration: 1998,
                });
                // #endif
              }
            } else {
              uni.showToast({
                title: "外部接口异常，请联系管理员！",
                icon: "none",
                duration: 1998,
              });
            }
          })
          .catch((error) => {
            uni.hideLoading();
            uni.showToast({
              title: `开奖号码查询出现异常，请联系管理员！报错信息：${error}`,
              icon: "none",
              duration: 1998,
            });
          });
      },
      // 格式化中奖号码，原格式为逗号+加号拼接，转换成我的逗号+横杠来拼接
      formatWinningNumber(winNum, type) {
        // 将第一个匹配的加号替换为减号，第二个匹配的加号替换为逗号
        const originalString = winNum.replace(/\+/, "-").replace(/\+/, ",");
        // 以 - 分割字符串为两部分
        const splitByDash = originalString.split("-");
        let resultString = "";
        if (splitByDash?.length > 1) {
          // 以逗号分割第一个数组并从小到大排序
          const firstArray = ["1", "2", 1, 2].includes(type)
            ? splitByDash[0]
              .split(",")
              .map(Number)
              .sort((a, b) => a - b)
            : splitByDash[0].split(",").map(Number);
          // 以逗号分割第二个数组并从小到大排序
          const secondArray = ["1", "2", 1, 2].includes(type)
            ? splitByDash[1]
              .split(",")
              .map(Number)
              .sort((a, b) => a - b)
            : splitByDash[1].split(",").map(Number);
          // 将两个数组分别通过逗号组合成新的字符串
          const firstString = firstArray.join(",");
          const secondString = secondArray.join(",");
          // 将两个字符串通过-连接
          resultString = firstString + "-" + secondString;
        } else {
          resultString = splitByDash[0]
            .split(",")
            .map(Number)
            // .sort((a, b) => a - b)
            .join(",");
        }

        // 保存结果字符串
        this.saveWinningNumber(resultString);
      },
      // 保存中奖号码
      saveWinningNumber(winNum) {
        const self = this;
        const saveParams = {
          lotteryId: self.formParams.lotteryId,
          winningNumber: winNum,
        };
        editLog(saveParams)
          .then((res) => {
            if (res?.code === 200) {
              // 目前仅支持大乐透双色球对比开奖结果
              if ([1, 2].includes(self.formParams.numberType)) {
                self.checkIsGetReward(
                  self.formParams.lotteryId,
                  self.formParams.numberType,
                  winNum
                );
              } else {
                uni.showToast({
                  title: `开奖号码: ${winNum} (该类型不支持比对中奖信息)`,
                  icon: "none",
                  duration: 4444,
                });
                self.$refs.paging.refresh();
              }
            } else {
              uni.showToast({
                title: "开奖号码保存失败！",
                icon: "none",
                duration: 1998,
              });
            }
          })
          .finally(() => {
            self.formParams = {
              lotteryId: "",
              dateCode: "",
              numberType: "",
            };
            self.$refs.inputDialog.close();
            self.isNeedInitDialog = false;
            uni.hideLoading();
          });
      },
      // 查询号码详情并检查是否中奖
      checkIsGetReward(logId, numTp, winNum) {
        const self = this;
        getLogInfo(logId).then((res) => {
          if (res?.code === 200) {
            if (res?.data) {
              const recordNumStrList = res?.data?.recordNumber?.split("/") || [];
              const chaseNumStrList = res?.data?.chaseNumber?.split("/") || [];
              let totalRewardCount = 0;
              let totalRewardPrize = 0;
              recordNumStrList.forEach((item) => {
                const resultTmp = checkLotteryResult(numTp, item, winNum);
                if (resultTmp?.prizeLevel > 0) {
                  totalRewardCount = totalRewardCount + 1;
                  totalRewardPrize = totalRewardPrize + resultTmp?.prizeAmount;
                }
              });
              chaseNumStrList.forEach((item) => {
                const resultTmp = checkLotteryResult(numTp, item, winNum);
                if (resultTmp?.prizeLevel > 0) {
                  totalRewardCount = totalRewardCount + 1;
                  totalRewardPrize = totalRewardPrize + resultTmp?.prizeAmount;
                }
              });
              if (totalRewardCount > 0) {
                const numTypeText = numTp === 1 ? "大乐透" : numTp === 2 ? "双色球" : "";
                showConfirm(
                  `恭喜您中奖了！本期所购${numTypeText}中共计${totalRewardCount}注号码中奖，初步预计奖金￥${totalRewardPrize}！是否需要为您记录中奖信息？`
                ).then((res) => {
                  if (res?.confirm) {
                    self.saveRewardInfo(logId, "Y", totalRewardPrize);
                  }
                });
                // // #ifdef H5
                // uni.showToast({
                //   title: `恭喜您中奖了！本期所购${numTypeText}中共计${totalRewardCount}注号码中奖，初步预计奖金￥${totalRewardPrize}！`,
                //   icon: "none",
                //   duration: 1998,
                // });
                // // #endif
                // // #ifdef MP-WEIXIN
                // uni.showToast({
                //   title: `恭喜您${totalRewardCount}注${numTypeText}中奖，初步预计奖金￥${totalRewardPrize}！`,
                //   icon: "none",
                //   duration: 1998,
                // });
                // // #endif
              } else {
                uni.showToast({
                  title: "开奖号码保存成功！本期未中奖！",
                  icon: "none",
                  duration: 1998,
                });
                self.$refs.paging.refresh();
              }
            } else {
              uni.showToast({
                title: "开奖号码保存成功！未查询到本期购买记录！",
                icon: "none",
                duration: 1998,
              });
            }
          } else {
            uni.showToast({
              title: "开奖号码保存成功！本期购买记录查询失败！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      },
      // 保存中奖信息
      saveRewardInfo(lotteryId, isWin, winningPrice) {
        const self = this;
        const saveParams = {
          lotteryId,
          isWin,
          winningPrice,
        };
        editLog(saveParams).then((res) => {
          if (res?.code === 200) {
            uni.showToast({
              title: "中奖信息保存成功！",
              icon: "none",
              duration: 1998,
            });
            self.$refs.paging.refresh();
          } else {
            uni.showToast({
              title: "中奖信息保存失败！",
              icon: "none",
              duration: 1998,
            });
          }
        });
      },
      // 二级菜单按钮点击
      handleFabTrigger(e) {
        if (e?.index === 0) {
          this.logFilterType = 1;
          this.resetSearchFilter();
        }
        if (e?.index === 1) {
          this.logFilterType = 2;
          this.isShowDrawer = true;
        }
        if (e?.index === 2) {
          this.logFilterType = 0;
          this.resetSearchFilter();
        }
        this.$refs.fab.close();
      },
      // tab切换，快速筛选
      handleTabChange(index) {
        this.queryParams = {
          pageNum: 1,
          pageSize: 10,
          numberType: null,
          isWin: null,
        };
        if (index === 0) {
          this.resetSearchFilter();
        }
        if (index === 1) {
          this.searchByNumberType(1);
        }
        if (index === 2) {
          this.searchByNumberType(2);
        }
        if (index === 3) {
          this.searchByWinType("Y");
        }
      },
      // 重置快速筛选条件，也就是查询全部初始状态数据
      resetSearchFilter() {
        this.setSearchFilterParams("reset");
        if (this.$refs.paging) {
          this.$refs.paging.reload();
        }
      },
      // 通过号码类型查询的快速筛选
      searchByNumberType(numberType) {
        const self = this;
        this.queryParams = {
          ...self.queryParams,
          numberType,
        };
        this.$refs.paging.reload();
      },
      // 通过是否中奖查询的快速筛选
      searchByWinType(winType) {
        const self = this;
        this.queryParams = {
          ...self.queryParams,
          isWin: winType,
        };
        this.$refs.paging.reload();
      },
      // 关闭高级筛选弹窗
      handleDrawerClose() {
        this.isShowDrawer = false;
      },
      // 提交高级筛选查询条件
      handleDrawerSubmit() {
        this.isShowDrawer = false;
        this.$refs.paging.reload();
      },
      // 设置高级筛选的查询参数
      setSearchFilterParams(type, value) {
        const self = this;
        if (type === "reset") {
          this.queryParams = {
            pageNum: 1,
            pageSize: 10,
            numberType: null,
            isWin: null,
            beginCreateTime: null,
            endCreateTime: null,
          };
          this.searchFilterDateType = null;
        } else {
          this.queryParams = {
            ...self.queryParams,
            pageNum: 1,
            pageSize: 10,
            [type]: value,
          };
        }
      },
      //  设置高级筛选的日期查询参数
      setSearchFilterDateParams(type) {
        const self = this;
        const formatStr = "yyyy-MM-DD";
        this.searchFilterDateType = type;
        if (type === "thisWeek") {
          const startOfWeek = moment().startOf("week").format(formatStr);
          const endOfWeek = moment().endOf("week").format(formatStr);
          this.queryParams = {
            ...self.queryParams,
            pageNum: 1,
            pageSize: 10,
            beginCreateTime: startOfWeek,
            endCreateTime: endOfWeek,
          };
        }
        if (type === "thisMonth") {
          const startOfMonth = moment().startOf("month").format(formatStr);
          const endOfMonth = moment().endOf("month").format(formatStr);
          this.queryParams = {
            ...self.queryParams,
            pageNum: 1,
            pageSize: 10,
            beginCreateTime: startOfMonth,
            endCreateTime: endOfMonth,
          };
        }
        if (type === "latestWeek") {
          const startLatestWeek = moment()
            .subtract(6, "days")
            .startOf("day")

            .format(formatStr);
          const endLatestWeek = moment().endOf("day").format(formatStr);
          this.queryParams = {
            ...self.queryParams,
            pageNum: 1,
            pageSize: 10,
            beginCreateTime: startLatestWeek,
            endCreateTime: endLatestWeek,
          };
        }
        if (type === "latestMonth") {
          const startLatestMonth = moment()
            .subtract(29, "days")
            .startOf("day")

            .format(formatStr);
          const endLatestMonth = moment().endOf("day").format(formatStr);
          this.queryParams = {
            ...self.queryParams,
            pageNum: 1,
            pageSize: 10,
            beginCreateTime: startLatestMonth,
            endCreateTime: endLatestMonth,
          };
        }
      },
    },
  };
</script>

<style lang="less">
  @import url("./index.less");
</style>
