(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-lottery-statistics-statistics","pages-mine-info-index~pages-punch-log-statistics-statistics"],{"00e6":function(t,e,i){"use strict";var a=i("d86a"),n=i.n(a);n.a},"0509":function(t,e,i){"use strict";i("7a82");var a=i("4ea4").default;Object.defineProperty(e,"__esModule",{value:!0}),e.addLog=function(t){return(0,n.default)({url:"/lottery/log/addLotteryLogForApp",method:"post",data:t})},e.delLog=function(t){return(0,n.default)({url:"/lottery/log/deleteLogByIdForApp/"+t,method:"delete"})},e.editLog=function(t){return(0,n.default)({url:"/lottery/log/editLotteryLogForApp",method:"put",data:t})},e.getLogInfo=function(t){return(0,n.default)({url:"/lottery/log/getLotteryLogInfoForApp/".concat(t),method:"get"})},e.getLogList=function(t){return(0,n.default)({url:"/lottery/log/getLotteryLogListForApp",method:"get",params:t})},e.listTotalReward=function(t){return(0,n.default)({url:"/lottery/log/getLotteryTotalReward",method:"get",params:t})};var n=a(i("e3d7"))},"158c":function(t,e,i){"use strict";i.r(e);var a=i("a336"),n=i("41df");for(var o in n)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return n[t]}))}(o);i("abe0");var r=i("f0c5"),d=Object(r["a"])(n["default"],a["b"],a["c"],!1,null,"4573fa13",null,!1,a["a"],void 0);e["default"]=d.exports},"199a":function(t,e,i){"use strict";var a=i("6d38"),n=i.n(a);n.a},"1c3e":function(t,e,i){"use strict";i("7a82"),Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0,i("a9e3");var a={name:"UniBadge",emits:["click"],props:{type:{type:String,default:"error"},inverted:{type:Boolean,default:!1},isDot:{type:Boolean,default:!1},maxNum:{type:Number,default:99},absolute:{type:String,default:""},offset:{type:Array,default:function(){return[0,0]}},text:{type:[String,Number],default:""},size:{type:String,default:"small"},customStyle:{type:Object,default:function(){return{}}}},data:function(){return{}},computed:{width:function(){return 8*String(this.text).length+12},classNames:function(){var t=this.inverted,e=this.type,i=this.size,a=this.absolute;return[t?"uni-badge--"+e+"-inverted":"","uni-badge--"+e,"uni-badge--"+i,a?"uni-badge--absolute":""].join(" ")},positionStyle:function(){if(!this.absolute)return{};var t=this.width/2,e=10;this.isDot&&(t=5,e=5);var i="".concat(-t+this.offset[0],"px"),a="".concat(-e+this.offset[1],"px"),n={rightTop:{right:i,top:a},rightBottom:{right:i,bottom:a},leftBottom:{left:i,bottom:a},leftTop:{left:i,top:a}},o=n[this.absolute];return o||n["rightTop"]},dotStyle:function(){return this.isDot?{width:"10px",minWidth:"0",height:"10px",padding:"0",borderRadius:"10px"}:{}},displayValue:function(){var t=this.isDot,e=this.text,i=this.maxNum;return t?"":Number(e)>i?"".concat(i,"+"):e}},methods:{onClick:function(){this.$emit("click")}}};e.default=a},"21c9":function(t,e,i){"use strict";i.d(e,"b",(function(){return a})),i.d(e,"c",(function(){return n})),i.d(e,"a",(function(){}));var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("v-uni-view",{staticClass:"uni-section"},[i("v-uni-view",{staticClass:"uni-section-header",on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.onClick.apply(void 0,arguments)}}},[t.type?i("v-uni-view",{staticClass:"uni-section-header__decoration",class:t.type}):t._t("decoration"),i("v-uni-view",{staticClass:"uni-section-header__content"},[i("v-uni-text",{staticClass:"uni-section__content-title",class:{distraction:!t.subTitle},style:{"font-size":t.titleFontSize,color:t.titleColor}},[t._v(t._s(t.title))]),t.subTitle?i("v-uni-text",{staticClass:"uni-section-header__content-sub",style:{"font-size":t.subTitleFontSize,color:t.subTitleColor}},[t._v(t._s(t.subTitle))]):t._e()],1),i("v-uni-view",{staticClass:"uni-section-header__slot-right"},[t._t("right")],2)],2),i("v-uni-view",{staticClass:"uni-section-content",style:{padding:t._padding}},[t._t("default")],2)],1)},n=[]},"2a0c":function(t,e,i){"use strict";i.r(e);var a=i("9ae1"),n=i.n(a);for(var o in a)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return a[t]}))}(o);e["default"]=n.a},"2bda":function(t,e,i){var a=i("24fb");e=a(!1),e.push([t.i,'@charset "UTF-8";\r\n/**\r\n * uni-app内置的常用样式变量\r\n */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.uni-badge--x[data-v-1693f0ea]{display:inline-block;position:relative}.uni-badge--absolute[data-v-1693f0ea]{position:absolute}.uni-badge--small[data-v-1693f0ea]{-webkit-transform:scale(.8);transform:scale(.8);-webkit-transform-origin:center center;transform-origin:center center}.uni-badge[data-v-1693f0ea]{display:flex;overflow:hidden;box-sizing:border-box;-webkit-font-feature-settings:"tnum";font-feature-settings:"tnum";min-width:20px;justify-content:center;flex-direction:row;height:20px;padding:0 4px;line-height:18px;color:#fff;border-radius:100px;background-color:#909399;background-color:initial;border:1px solid #fff;text-align:center;font-family:Helvetica Neue,Helvetica,sans-serif;font-size:12px;z-index:999;cursor:pointer}.uni-badge--info[data-v-1693f0ea]{color:#fff;background-color:#909399}.uni-badge--primary[data-v-1693f0ea]{background-color:#2979ff}.uni-badge--success[data-v-1693f0ea]{background-color:#4cd964}.uni-badge--warning[data-v-1693f0ea]{background-color:#f0ad4e}.uni-badge--error[data-v-1693f0ea]{background-color:#dd524d}.uni-badge--inverted[data-v-1693f0ea]{padding:0 5px 0 0;color:#909399}.uni-badge--info-inverted[data-v-1693f0ea]{color:#909399;background-color:initial}.uni-badge--primary-inverted[data-v-1693f0ea]{color:#2979ff;background-color:initial}.uni-badge--success-inverted[data-v-1693f0ea]{color:#4cd964;background-color:initial}.uni-badge--warning-inverted[data-v-1693f0ea]{color:#f0ad4e;background-color:initial}.uni-badge--error-inverted[data-v-1693f0ea]{color:#dd524d;background-color:initial}',""]),t.exports=e},3861:function(t,e,i){var a=i("5cc2");a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);var n=i("4f06").default;n("6cf0e146",a,!0,{sourceMap:!1,shadowMode:!1})},"38ee":function(t,e,i){"use strict";i("7a82"),Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var a={name:"uniList","mp-weixin":{options:{multipleSlots:!1}},props:{stackFromEnd:{type:Boolean,default:!1},enableBackToTop:{type:[Boolean,String],default:!1},scrollY:{type:[Boolean,String],default:!1},border:{type:Boolean,default:!0},renderReverse:{type:Boolean,default:!1}},created:function(){this.firstChildAppend=!1},methods:{loadMore:function(t){this.$emit("scrolltolower")},scroll:function(t){this.$emit("scroll",t)}}};e.default=a},"3b2d":function(t,e,i){"use strict";i.r(e);var a=i("21c9"),n=i("92c3");for(var o in n)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return n[t]}))}(o);i("d43d");var r=i("f0c5"),d=Object(r["a"])(n["default"],a["b"],a["c"],!1,null,"1f994d7c",null,!1,a["a"],void 0);e["default"]=d.exports},"3b61":function(t,e,i){var a=i("24fb");e=a(!1),e.push([t.i,'@charset "UTF-8";\r\n/**\r\n * uni-app内置的常用样式变量\r\n */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.uni-list-item[data-v-4573fa13]{display:flex;font-size:16px;position:relative;justify-content:space-between;align-items:center;background-color:#fff;flex-direction:row;cursor:pointer}.uni-list-item--disabled[data-v-4573fa13]{opacity:.3}.uni-list-item--hover[data-v-4573fa13]{background-color:#f1f1f1!important}.uni-list-item__container[data-v-4573fa13]{position:relative;display:flex;flex-direction:row;padding:12px 15px;padding-left:15px;flex:1;overflow:hidden}.container--right[data-v-4573fa13]{padding-right:0}.uni-list--border[data-v-4573fa13]{position:absolute;top:0;right:0;left:0}.uni-list--border[data-v-4573fa13]:after{position:absolute;top:0;right:0;left:0;height:1px;content:"";-webkit-transform:scaleY(.5);transform:scaleY(.5);background-color:#e5e5e5}.uni-list-item__content[data-v-4573fa13]{display:flex;padding-right:8px;flex:1;color:#3b4144;flex-direction:column;justify-content:space-between;overflow:hidden}.uni-list-item__content--center[data-v-4573fa13]{justify-content:center}.uni-list-item__content-title[data-v-4573fa13]{font-size:14px;color:#3b4144;overflow:hidden}.uni-list-item__content-note[data-v-4573fa13]{margin-top:%?6?%;color:#999;font-size:12px;overflow:hidden}.uni-list-item__extra[data-v-4573fa13]{display:flex;flex-direction:row;justify-content:flex-end;align-items:center}.uni-list-item__header[data-v-4573fa13]{display:flex;flex-direction:row;align-items:center}.uni-list-item__icon[data-v-4573fa13]{margin-right:%?18?%;flex-direction:row;justify-content:center;align-items:center}.uni-list-item__icon-img[data-v-4573fa13]{display:block;height:26px;width:26px;margin-right:10px}.uni-icon-wrapper[data-v-4573fa13]{display:flex;align-items:center;padding:0 10px}.flex--direction[data-v-4573fa13]{flex-direction:column;align-items:normal}.flex--justify[data-v-4573fa13]{justify-content:normal}.uni-list--lg[data-v-4573fa13]{height:40px;width:40px}.uni-list--base[data-v-4573fa13]{height:26px;width:26px}.uni-list--sm[data-v-4573fa13]{height:20px;width:20px}.uni-list-item__extra-text[data-v-4573fa13]{color:#999;font-size:12px}.uni-ellipsis-1[data-v-4573fa13]{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.uni-ellipsis-2[data-v-4573fa13]{overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',""]),t.exports=e},"419a":function(t,e,i){"use strict";i.d(e,"b",(function(){return a})),i.d(e,"c",(function(){return n})),i.d(e,"a",(function(){}));var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("v-uni-view",{staticClass:"uni-badge--x"},[t._t("default"),t.text?i("v-uni-text",{staticClass:"uni-badge",class:t.classNames,style:[t.positionStyle,t.customStyle,t.dotStyle],on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.onClick()}}},[t._v(t._s(t.displayValue))]):t._e()],2)},n=[]},"41df":function(t,e,i){"use strict";i.r(e);var a=i("55d8"),n=i.n(a);for(var o in a)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return a[t]}))}(o);e["default"]=n.a},"55d8":function(t,e,i){"use strict";i("7a82");var a=i("4ea4").default;Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n=a(i("3835"));i("a9e3"),i("c975");var o={name:"UniListItem",emits:["click","switchChange"],props:{direction:{type:String,default:"row"},title:{type:String,default:""},note:{type:String,default:""},ellipsis:{type:[Number,String],default:0},disabled:{type:[Boolean,String],default:!1},clickable:{type:Boolean,default:!1},showArrow:{type:[Boolean,String],default:!1},link:{type:[Boolean,String],default:!1},to:{type:String,default:""},showBadge:{type:[Boolean,String],default:!1},showSwitch:{type:[Boolean,String],default:!1},switchChecked:{type:[Boolean,String],default:!1},badgeText:{type:String,default:""},badgeType:{type:String,default:"success"},badgeStyle:{type:Object,default:function(){return{}}},rightText:{type:String,default:""},thumb:{type:String,default:""},thumbSize:{type:String,default:"base"},showExtraIcon:{type:[Boolean,String],default:!1},extraIcon:{type:Object,default:function(){return{type:"",color:"#000000",size:20,customPrefix:""}}},border:{type:Boolean,default:!0},customStyle:{type:Object,default:function(){return{padding:"",backgroundColor:"#FFFFFF"}}},keepScrollPosition:{type:Boolean,default:!1}},watch:{"customStyle.padding":{handler:function(t){"number"==typeof t&&(t+="");var e=t.split(" ");if(1===e.length){var i=e[0];this.padding={top:i,right:i,bottom:i,left:i}}else if(2===e.length){var a=(0,n.default)(e,2),o=a[0],r=a[1];this.padding={top:o,right:r,bottom:o,left:r}}else if(4===e.length){var d=(0,n.default)(e,4),s=d[0],l=d[1],c=d[2],u=d[3];this.padding={top:s,right:l,bottom:c,left:u}}},immediate:!0}},data:function(){return{isFirstChild:!1,padding:{top:"",right:"",bottom:"",left:""}}},mounted:function(){this.list=this.getForm(),this.list&&(this.list.firstChildAppend||(this.list.firstChildAppend=!0,this.isFirstChild=!0))},methods:{getForm:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"uniList",e=this.$parent,i=e.$options.name;while(i!==t){if(e=e.$parent,!e)return!1;i=e.$options.name}return e},onClick:function(){""===this.to?(this.clickable||this.link)&&this.$emit("click",{data:{}}):this.openPage()},onSwitchChange:function(t){this.$emit("switchChange",t.detail)},openPage:function(){-1!==["navigateTo","redirectTo","reLaunch","switchTab"].indexOf(this.link)?this.pageApi(this.link):this.pageApi("navigateTo")},pageApi:function(t){var e=this,i={url:this.to,success:function(t){e.$emit("click",{data:t})},fail:function(t){e.$emit("click",{data:t})}};switch(t){case"navigateTo":uni.navigateTo(i);break;case"redirectTo":uni.redirectTo(i);break;case"reLaunch":uni.reLaunch(i);break;case"switchTab":uni.switchTab(i);break;default:uni.navigateTo(i)}}}};e.default=o},"5cc2":function(t,e,i){var a=i("24fb");e=a(!1),e.push([t.i,'@charset "UTF-8";\r\n/**\r\n * uni-app内置的常用样式变量\r\n */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.uni-section[data-v-1f994d7c]{background-color:#fff}.uni-section .uni-section-header[data-v-1f994d7c]{position:relative;display:flex;flex-direction:row;align-items:center;padding:12px 10px;font-weight:400}.uni-section .uni-section-header__decoration[data-v-1f994d7c]{margin-right:6px;background-color:#2979ff}.uni-section .uni-section-header__decoration.line[data-v-1f994d7c]{width:4px;height:12px;border-radius:10px}.uni-section .uni-section-header__decoration.circle[data-v-1f994d7c]{width:8px;height:8px;border-top-right-radius:50px;border-top-left-radius:50px;border-bottom-left-radius:50px;border-bottom-right-radius:50px}.uni-section .uni-section-header__decoration.square[data-v-1f994d7c]{width:8px;height:8px}.uni-section .uni-section-header__content[data-v-1f994d7c]{display:flex;flex-direction:column;flex:1;color:#333}.uni-section .uni-section-header__content .distraction[data-v-1f994d7c]{flex-direction:row;align-items:center}.uni-section .uni-section-header__content-sub[data-v-1f994d7c]{margin-top:2px}.uni-section .uni-section-header__slot-right[data-v-1f994d7c]{font-size:14px}.uni-section .uni-section-content[data-v-1f994d7c]{font-size:14px}',""]),t.exports=e},"690a":function(t,e,i){"use strict";i.d(e,"b",(function(){return a})),i.d(e,"c",(function(){return n})),i.d(e,"a",(function(){}));var a=function(){var t=this.$createElement,e=this._self._c||t;return e("v-uni-view",{staticClass:"uni-list uni-border-top-bottom"},[this.border?e("v-uni-view",{staticClass:"uni-list--border-top"}):this._e(),this._t("default"),this.border?e("v-uni-view",{staticClass:"uni-list--border-bottom"}):this._e()],2)},n=[]},"69ed":function(t,e,i){"use strict";i.d(e,"b",(function(){return n})),i.d(e,"c",(function(){return o})),i.d(e,"a",(function(){return a}));var a={qiunDataCharts:i("417f").default,uniSection:i("3b2d").default,uniList:i("c712").default,uniListItem:i("158c").default},n=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("v-uni-view",{staticClass:"fx67ll-statistics-box"},[t.logTotalList&&t.logTotalList.length>0?i("v-uni-view",[i("qiun-data-charts",{attrs:{type:"pie",opts:t.chartOpts,chartData:t.chartData}})],1):t._e(),t.logTotalList&&t.logTotalList.length>0?i("v-uni-view",t._l(t.logTotalList,(function(t){return i("v-uni-view",{key:t.key,staticClass:"fx67ll-statistics-item"},[i("uni-section",{attrs:{title:t.lotteryType,type:"line"}},[i("uni-list",[i("uni-list-item",{attrs:{title:"中奖金额",rightText:"￥"+t.totalWinningAmount}}),i("uni-list-item",{attrs:{title:"总花费金额",rightText:"￥"+2*t.totalNumbers}}),i("uni-list-item",{attrs:{title:"中奖期数",rightText:t.winningTickets}}),i("uni-list-item",{attrs:{title:"总购买期数",rightText:t.totalTickets}}),i("uni-list-item",{attrs:{title:"总购买注数",rightText:t.totalNumbers}})],1)],1)],1)})),1):t._e(),t.logTotalList&&0!==t.logTotalList.length||t.logTotalLoading?t._e():i("v-uni-view",{staticClass:"no-data",class:{"fade-show":!t.logTotalLoading}},[i("img",{attrs:{src:"/static/images/no-data.png"}})])],1)},o=[]},"6d38":function(t,e,i){var a=i("ffe1");a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);var n=i("4f06").default;n("312f3f9a",a,!0,{sourceMap:!1,shadowMode:!1})},9197:function(t,e,i){"use strict";i.r(e);var a=i("419a"),n=i("ea73");for(var o in n)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return n[t]}))}(o);i("00e6");var r=i("f0c5"),d=Object(r["a"])(n["default"],a["b"],a["c"],!1,null,"1693f0ea",null,!1,a["a"],void 0);e["default"]=d.exports},"92c3":function(t,e,i){"use strict";i.r(e);var a=i("a177"),n=i.n(a);for(var o in a)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return a[t]}))}(o);e["default"]=n.a},"96b4":function(t,e,i){"use strict";i.r(e);var a=i("38ee"),n=i.n(a);for(var o in a)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return a[t]}))}(o);e["default"]=n.a},"9a1e":function(t,e,i){var a=i("24fb");e=a(!1),e.push([t.i,".flex-box[data-v-5d4523d8]{display:flex;flex-direction:column;align-items:center;justify-content:center}.text-ellipsis[data-v-5d4523d8]{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.text-ellipsis-two[data-v-5d4523d8]{text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.no-data[data-v-5d4523d8]{width:%?320?%;height:%?320?%;margin:0 auto;margin-top:%?320?%}.no-data img[data-v-5d4523d8]{width:100%;height:100%}.nav-tab-box[data-v-5d4523d8]{margin:0 auto}.nav-tab-box-two[data-v-5d4523d8]{width:75%}.nav-tab-box-four[data-v-5d4523d8]{width:100%}.nav-tab-box-three[data-v-5d4523d8]{width:100%}.status_bar[data-v-5d4523d8]{height:0;width:100%;z-index:10}.top-nav[data-v-5d4523d8]{width:100%;height:%?88?%;position:fixed;top:0;background-color:#fff;display:flex;justify-content:space-between;align-items:center;z-index:10}.top-nav .top-nav-back[data-v-5d4523d8]{width:25%}.top-nav .top-nav-back .top-nav-back-icon[data-v-5d4523d8]{padding:%?15?% %?15?% %?15?% %?30?%}.top-nav .top-nav-title[data-v-5d4523d8]{width:45%;text-align:center;font-size:%?34?%;color:#000}.top-nav .top-nav-btn[data-v-5d4523d8]{width:calc(25% - %?30?%);text-align:right;margin-right:%?30?%;font-size:%?28?%;color:#838383;position:relative;top:%?3?%}.top-nav-fake[data-v-5d4523d8]{width:100%;height:%?88?%}.top-nav-search[data-v-5d4523d8]{width:100%;height:%?80?%;background-color:#fff;position:fixed;top:%?88?%;z-index:10}.top-nav-search .nav-search-box[data-v-5d4523d8]{width:calc(100% - %?30?% * 2);height:%?72?%;background-color:#f8f8f8;margin:calc(%?80?% - %?72?%) auto 0 auto;border-radius:%?50?%;display:flex;justify-content:space-between;align-items:center}.top-nav-search .nav-search-box .nav-search-icon[data-v-5d4523d8]{position:relative;left:%?26?%;top:%?-2?%}.top-nav-search .nav-search-box .nav-search-input[data-v-5d4523d8]{width:calc(100% - %?80?%);height:100%;font-size:%?24?%}.top-nav-search .nav-search-box .nav-input-placeholder[data-v-5d4523d8]{font-size:%?28?%;color:#c8c8c8}.nav-search-box-invoice[data-v-5d4523d8]{width:calc(100% - %?30?% * 2);margin:0 auto;display:flex;justify-content:space-between;align-items:center}.nav-search-box-invoice .nav-search-box[data-v-5d4523d8]{width:calc(100% - %?140?%)}.nav-search-box-invoice .nav-search-filter[data-v-5d4523d8]{width:%?140?%;font-size:%?28?%;color:#313131;display:flex;justify-content:flex-end;align-items:center;position:relative;top:%?10?%}.nav-search-box-invoice .nav-search-filter .nav-search-filter-text[data-v-5d4523d8]{margin-right:%?8?%}.nav-search-box-invoice .nav-search-filter .nav-search-filter-icon[data-v-5d4523d8]{margin-right:%?20?%;position:relative;top:%?1?%}.top-nav-tab[data-v-5d4523d8]{width:100%;height:%?100?%;background-color:#fff;position:fixed;top:calc(%?88?% + %?80?%);z-index:10}.top-nav-tab .nav-tab-box[data-v-5d4523d8]{margin:0 auto}.top-nav-tab .nav-tab-box-two[data-v-5d4523d8]{width:75%}.top-nav-tab .nav-tab-box-four[data-v-5d4523d8]{width:100%}.top-nav-tab .nav-tab-box-three[data-v-5d4523d8]{width:100%}.top-nav-fake-high[data-v-5d4523d8]{width:100%;height:calc(%?88?% + %?80?% + %?100?%)}.top-nav-fake-middle[data-v-5d4523d8]{width:100%;height:calc(%?88?% + %?80?%)}@-webkit-keyframes fadeInOut-data-v-5d4523d8{0%{opacity:0}25%{opacity:.15}50%{opacity:.3}75%{opacity:.75}100%{opacity:1}}@keyframes fadeInOut-data-v-5d4523d8{0%{opacity:0}25%{opacity:.15}50%{opacity:.3}75%{opacity:.75}100%{opacity:1}}.fade-show[data-v-5d4523d8]{-webkit-animation:fadeInOut-data-v-5d4523d8 .4s forwards;\n  /* Chrome, Safari, newer versions of Opera */-moz-animation:fadeInOut-data-v-5d4523d8 .4s forwards;\n  /* Firefox */-o-animation:fadeInOut-data-v-5d4523d8 .4s forwards;\n  /* Older versions of Opera */animation:fadeInOut-data-v-5d4523d8 .4s forwards;opacity:1}@-webkit-keyframes fadeInOutSecond-data-v-5d4523d8{0%{opacity:0}50%{opacity:0}75%{opacity:.5}100%{opacity:1}}@keyframes fadeInOutSecond-data-v-5d4523d8{0%{opacity:0}50%{opacity:0}75%{opacity:.5}100%{opacity:1}}.fade-show-second[data-v-5d4523d8]{-webkit-animation:fadeInOutSecond-data-v-5d4523d8 .6s forwards;\n  /* Chrome, Safari, newer versions of Opera */-moz-animation:fadeInOutSecond-data-v-5d4523d8 .6s forwards;\n  /* Firefox */-o-animation:fadeInOutSecond-data-v-5d4523d8 .6s forwards;\n  /* Older versions of Opera */animation:fadeInOutSecond-data-v-5d4523d8 .6s forwards;opacity:1}@-webkit-keyframes fadeInOutThird-data-v-5d4523d8{0%{opacity:0}75%{opacity:0}85%{opacity:.5}100%{opacity:1}}@keyframes fadeInOutThird-data-v-5d4523d8{0%{opacity:0}75%{opacity:0}85%{opacity:.5}100%{opacity:1}}.fade-show-third[data-v-5d4523d8]{-webkit-animation:fadeInOutThird-data-v-5d4523d8 .8s forwards;\n  /* Chrome, Safari, newer versions of Opera */-moz-animation:fadeInOutThird-data-v-5d4523d8 .8s forwards;\n  /* Firefox */-o-animation:fadeInOutThird-data-v-5d4523d8 .8s forwards;\n  /* Older versions of Opera */animation:fadeInOutThird-data-v-5d4523d8 .8s forwards;opacity:1}.fx67ll-statistics-box .fx67ll-statistics-item[data-v-5d4523d8]{margin:%?23?% 0}",""]),t.exports=e},"9ae1":function(t,e,i){"use strict";i("7a82");var a=i("4ea4").default;Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n=a(i("5530"));i("d3b7"),i("d81d"),i("a434"),i("e25e");var o=i("0509"),r={data:function(){return{logTotalList:[],logTotalLoading:!1,chartOpts:{legend:{fontSize:16,itemGap:20},color:["#91CB74","#EE6666"],padding:[5,5,5,5],enableScroll:!1,extra:{pie:{activeOpacity:.5,activeRadius:10,offsetAngle:0,labelWidth:15,border:!0,borderWidth:3,borderColor:"#FFFFFF"}}},chartData:{series:[{data:[{name:"已中奖",value:0},{name:"未中奖",value:0}]}]}}},onLoad:function(){this.getTotalReward()},methods:{getTotalReward:function(){var t=this;this.logTotalLoading=!0,uni.showLoading({title:"查询数据中..."}),this.logTotalList=[],(0,o.listTotalReward)().then((function(e){var i,a,o,r,d;200===(null===e||void 0===e?void 0:e.code)?null!==e&&void 0!==e&&e.rows&&(null===e||void 0===e||null===(i=e.rows)||void 0===i?void 0:i.length)>0?(t.logTotalList=e.rows.map((function(t,e){var i=(0,n.default)((0,n.default)({},t),{},{key:e});return i})),t.logTotalList.splice(0,0,t.logTotalList.splice(-1)[0]),3===(null===e||void 0===e||null===(a=e.rows)||void 0===a?void 0:a.length)&&(t.chartData.series=[{data:[{name:"已中奖",value:parseInt((null===e||void 0===e||null===(o=e.rows[2])||void 0===o?void 0:o.totalWinningAmount)||0)},{name:"未中奖",value:parseInt(2*((null===e||void 0===e||null===(r=e.rows[2])||void 0===r?void 0:r.totalNumbers)||0)-((null===e||void 0===e||null===(d=e.rows[2])||void 0===d?void 0:d.totalWinningAmount)||0))}]}])):uni.showToast({title:"暂无更多数据！",icon:"none",duration:1998}):uni.showToast({title:"查询历史统计记录失败！",icon:"none",duration:1998})})).finally((function(){uni.hideLoading(),t.logTotalLoading=!1}))}}};e.default=r},a177:function(t,e,i){"use strict";i("7a82"),Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var a={name:"UniSection",emits:["click"],props:{type:{type:String,default:""},title:{type:String,required:!0,default:""},titleFontSize:{type:String,default:"14px"},titleColor:{type:String,default:"#333"},subTitle:{type:String,default:""},subTitleFontSize:{type:String,default:"12px"},subTitleColor:{type:String,default:"#999"},padding:{type:[Boolean,String],default:!1}},computed:{_padding:function(){return"string"===typeof this.padding?this.padding:this.padding?"10px":""}},watch:{title:function(t){uni.report&&""!==t&&uni.report("title",t)}},methods:{onClick:function(){this.$emit("click")}}};e.default=a},a336:function(t,e,i){"use strict";i.d(e,"b",(function(){return n})),i.d(e,"c",(function(){return o})),i.d(e,"a",(function(){return a}));var a={uniIcons:i("b540").default,uniBadge:i("9197").default},n=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("v-uni-view",{staticClass:"uni-list-item",class:{"uni-list-item--disabled":t.disabled},style:{"background-color":t.customStyle.backgroundColor},attrs:{"hover-class":!t.clickable&&!t.link||t.disabled||t.showSwitch?"":"uni-list-item--hover"},on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.onClick.apply(void 0,arguments)}}},[t.isFirstChild?t._e():i("v-uni-view",{staticClass:"border--left",class:{"uni-list--border":t.border}}),i("v-uni-view",{staticClass:"uni-list-item__container",class:{"container--right":t.showArrow||t.link,"flex--direction":"column"===t.direction},style:{paddingTop:t.padding.top,paddingLeft:t.padding.left,paddingRight:t.padding.right,paddingBottom:t.padding.bottom}},[t._t("header",[i("v-uni-view",{staticClass:"uni-list-item__header"},[t.thumb?i("v-uni-view",{staticClass:"uni-list-item__icon"},[i("v-uni-image",{staticClass:"uni-list-item__icon-img",class:["uni-list--"+t.thumbSize],attrs:{src:t.thumb}})],1):t.showExtraIcon?i("v-uni-view",{staticClass:"uni-list-item__icon"},[i("uni-icons",{attrs:{customPrefix:t.extraIcon.customPrefix,color:t.extraIcon.color,size:t.extraIcon.size,type:t.extraIcon.type}})],1):t._e()],1)]),t._t("body",[i("v-uni-view",{staticClass:"uni-list-item__content",class:{"uni-list-item__content--center":t.thumb||t.showExtraIcon||t.showBadge||t.showSwitch}},[t.title?i("v-uni-text",{staticClass:"uni-list-item__content-title",class:[0!==t.ellipsis&&t.ellipsis<=2?"uni-ellipsis-"+t.ellipsis:""]},[t._v(t._s(t.title))]):t._e(),t.note?i("v-uni-text",{staticClass:"uni-list-item__content-note"},[t._v(t._s(t.note))]):t._e()],1)]),t._t("footer",[t.rightText||t.showBadge||t.showSwitch?i("v-uni-view",{staticClass:"uni-list-item__extra",class:{"flex--justify":"column"===t.direction}},[t.rightText?i("v-uni-text",{staticClass:"uni-list-item__extra-text"},[t._v(t._s(t.rightText))]):t._e(),t.showBadge?i("uni-badge",{attrs:{type:t.badgeType,text:t.badgeText,"custom-style":t.badgeStyle}}):t._e(),t.showSwitch?i("v-uni-switch",{attrs:{disabled:t.disabled,checked:t.switchChecked},on:{change:function(e){arguments[0]=e=t.$handleEvent(e),t.onSwitchChange.apply(void 0,arguments)}}}):t._e()],1):t._e()])],2),t.showArrow||t.link?i("uni-icons",{staticClass:"uni-icon-wrapper",attrs:{size:16,color:"#bbb",type:"arrowright"}}):t._e()],1)},o=[]},abe0:function(t,e,i){"use strict";var a=i("cb48"),n=i.n(a);n.a},c2e1:function(t,e,i){"use strict";var a=i("ff91"),n=i.n(a);n.a},c712:function(t,e,i){"use strict";i.r(e);var a=i("690a"),n=i("96b4");for(var o in n)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return n[t]}))}(o);i("199a");var r=i("f0c5"),d=Object(r["a"])(n["default"],a["b"],a["c"],!1,null,"6fce09b0",null,!1,a["a"],void 0);e["default"]=d.exports},cb48:function(t,e,i){var a=i("3b61");a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);var n=i("4f06").default;n("de4b4036",a,!0,{sourceMap:!1,shadowMode:!1})},d43d:function(t,e,i){"use strict";var a=i("3861"),n=i.n(a);n.a},d86a:function(t,e,i){var a=i("2bda");a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);var n=i("4f06").default;n("118e1c50",a,!0,{sourceMap:!1,shadowMode:!1})},e28f:function(t,e,i){"use strict";i.r(e);var a=i("69ed"),n=i("2a0c");for(var o in n)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return n[t]}))}(o);i("c2e1");var r=i("f0c5"),d=Object(r["a"])(n["default"],a["b"],a["c"],!1,null,"5d4523d8",null,!1,a["a"],void 0);e["default"]=d.exports},ea73:function(t,e,i){"use strict";i.r(e);var a=i("1c3e"),n=i.n(a);for(var o in a)["default"].indexOf(o)<0&&function(t){i.d(e,t,(function(){return a[t]}))}(o);e["default"]=n.a},ff91:function(t,e,i){var a=i("9a1e");a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);var n=i("4f06").default;n("dbdeb07e",a,!0,{sourceMap:!1,shadowMode:!1})},ffe1:function(t,e,i){var a=i("24fb");e=a(!1),e.push([t.i,'@charset "UTF-8";\r\n/**\r\n * uni-app内置的常用样式变量\r\n */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.uni-list[data-v-6fce09b0]{display:flex;background-color:#fff;position:relative;flex-direction:column}.uni-list--border[data-v-6fce09b0]{position:relative;z-index:-1}.uni-list--border-top[data-v-6fce09b0]{position:absolute;top:0;right:0;left:0;height:1px;-webkit-transform:scaleY(.5);transform:scaleY(.5);background-color:#e5e5e5;z-index:1}.uni-list--border-bottom[data-v-6fce09b0]{position:absolute;bottom:0;right:0;left:0;height:1px;-webkit-transform:scaleY(.5);transform:scaleY(.5);background-color:#e5e5e5}',""]),t.exports=e}}]);