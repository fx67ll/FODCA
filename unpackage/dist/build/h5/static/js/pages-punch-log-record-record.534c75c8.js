(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-punch-log-record-record"],{"088b":function(t,e,a){"use strict";a("7a82");var n=a("4ea4").default;Object.defineProperty(e,"__esModule",{value:!0}),e.addPunchLog=function(t){return(0,i.default)({url:"/punch/log/addPunchLogForApp",method:"post",data:t})},e.delPunchLog=function(t){return(0,i.default)({url:"/punch/log/deletePunchLogByIdForApp/"+t,method:"delete"})},e.getPunchLogInfo=function(t){return(0,i.default)({url:"/punch/log/getPunchLogInfoForApp/"+t,method:"get"})},e.getPunchLogList=function(t){return(0,i.default)({url:"/punch/log/getPunchLogListForApp",method:"get",params:t})},e.getWorkTotalTime=function(t){return(0,i.default)({url:"/punch/log/getWorkTotalTime",method:"get",params:t})},e.updatePunchLog=function(t){return(0,i.default)({url:"/punch/log/editPunchLogForApp",method:"put",data:t})};var i=n(a("e3d7"))},"0d68":function(t,e,a){var n=a("48af");n.__esModule&&(n=n.default),"string"===typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);var i=a("4f06").default;i("302bd1b8",n,!0,{sourceMap:!1,shadowMode:!1})},"0e2b":function(t,e,a){"use strict";a("7a82");var n=a("4ea4").default;Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var i=n(a("a523")),o=a("088b"),r=a("aa92"),c=n(a("f735"));a("0f3c");var d={components:{punchDrawer:i.default},data:function(){return{punchWorkHours:0,targetWorkHours:3e5,chartData:{series:[{name:"本月工时进度",color:"#2ecc71",data:0}]},chartOpts:{title:{name:"0%",fontSize:35,color:"#2ecc71",offsetY:-8},subtitle:{name:"本月工时进度",fontSize:25,color:"#999999"},extra:{arcbar:{type:"circle",width:23,backgroundColor:"#E9E9E9",startAngle:1.5,endAngle:.25,gap:2}}},isShowAddDrawer:!1}},onReady:function(){this.queryPunchLogTotalTime()},computed:{getChartMarginTop:function(){return"".concat((uni.getSystemInfoSync().windowHeight-400)/2,"px")}},methods:{queryPunchLogTotalTime:function(){var t=this,e=t.queryWeekdaysCount();this.targetWorkHours=8.5*e,(0,r.getInfo)().then((function(e){var a=null===e||void 0===e?void 0:e.user,n=null==a||""==a.userName||null==a.userName?"":a.userName,i={pageNum:1,pageSize:999999999};"fx67ll"===n&&(i.updateBy=n),(0,o.getWorkTotalTime)(i).then((function(e){var a;if(200===(null===e||void 0===e?void 0:e.code))if(null!==e&&void 0!==e&&e.rows&&(null===e||void 0===e||null===(a=e.rows)||void 0===a?void 0:a.length)>0){console.log(null===e||void 0===e?void 0:e.rows);var n=null===e||void 0===e?void 0:e.rows[0];t.punchWorkHours=null===n||void 0===n?void 0:n.totalWorkHours.toFixed(1),t.chartData.series[0].data=((null===n||void 0===n?void 0:n.totalWorkHours)/t.targetWorkHours).toFixed(3),t.chartOpts.title.name="".concat((t.punchWorkHours/t.targetWorkHours*100).toFixed(1),"%"),t.chartData.series[0].name="".concat((0,c.default)().month()+1,"月工时进度"),t.chartOpts.subtitle.name="".concat((0,c.default)().month()+1,"月工时进度")}else uni.showToast({title:"暂无工时统计数据！",icon:"none",duration:1998});else uni.showToast({title:"工时统计查询失败！",icon:"none",duration:1998})}))}))},queryWeekdaysCount:function(){for(var t=(0,c.default)().year(),e=(0,c.default)().month()+1,a=new Date(t,e-1,1),n=new Date(t,e,0),i=0,o=new Date(a);o<=n;o.setDate(o.getDate()+1))0!==o.getDay()&&6!==o.getDay()&&i++;return i},showPunchDrawerForAddLog:function(){this.isShowAddDrawer=!0},setIsShowDrawer:function(t){this.isShowAddDrawer=t},goToHistoryLogList:function(){this.$tab.navigateTo("/pages/punch/log/index/index")}}};e.default=d},"0ed7":function(t,e,a){"use strict";a.r(e);var n=a("c5f3"),i=a("99ad");for(var o in i)["default"].indexOf(o)<0&&function(t){a.d(e,t,(function(){return i[t]}))}(o);a("8e28");var r=a("f0c5"),c=Object(r["a"])(i["default"],n["b"],n["c"],!1,null,"0119a4c8",null,!1,n["a"],void 0);e["default"]=c.exports},"0f3d":function(t,e,a){"use strict";a.r(e);var n=a("acde"),i=a("9045");for(var o in i)["default"].indexOf(o)<0&&function(t){a.d(e,t,(function(){return i[t]}))}(o);a("bafd");var r=a("f0c5"),c=Object(r["a"])(i["default"],n["b"],n["c"],!1,null,"52aa369c",null,!1,n["a"],void 0);e["default"]=c.exports},"233e":function(t,e,a){"use strict";a("7a82");var n=a("4ea4").default;Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var i=n(a("3835")),o=n(a("c7eb")),r=n(a("1da1"));a("a9e3"),a("ac1f");var c={props:{withHeader:{type:Boolean,default:!0},wrapperClosable:{type:Boolean,default:!0},modal:{type:Boolean,default:!0},radius:{type:Boolean,default:!1},isGesture:{type:Boolean,default:!1},beforeClose:Function,showClose:{type:Boolean,default:!0},title:{type:String,default:"我是标题"},top:{type:[Number,String],default:0},visible:Boolean,width:{type:[Number,String],default:"50%"},height:{type:[Number,String],default:"30%"},isShowTabBar:{type:Boolean,default:!1},mode:{type:String,default:"right"}},computed:{getWidth:function(){var t=this.width;return t}},watch:{show:{handler:function(t){this.$emit("update:visible",t)}},visible:{handler:function(t){var e=this;return(0,r.default)((0,o.default)().mark((function a(){return(0,o.default)().wrap((function(a){while(1)switch(a.prev=a.next){case 0:t?(e._change("show","mask",t),e.getDrawerWidth()):e._change("mask","show",t);case 1:case"end":return a.stop()}}),a)})))()},immediate:!0}},data:function(){return{style:{},isMove:!0,show:!1,mask:this.visible,watchTimer:null,start:{x:null,y:null},move:{x:null,y:null},drawerWidth:0,drawerHeight:0,moveDisX:null,moveDisY:null}},methods:{getDrawerWidth:function(){var t=this;this.$nextTick((function(){uni.createSelectorQuery().in(t).select(".zb-drawer__container").boundingClientRect((function(e){t.drawerWidth=e.width,t.drawerHeight=e.height})).exec()}))},getAngle:function(t,e){return 180*Math.atan2(e,t)/Math.PI},getLineAngle:function(t,e,a,n){var i=t-a,o=e-n;if(!i&&!o)return 0;var r=(180+180*Math.atan2(-o,-i)/Math.PI+360)%360;return 360-r},getDirection:function(t,e,a,n){var i=a-t,o=n-e,r=this.getAngle(i,o);return r>=-135&&r<=-45?"下滑":r>45&&r<135?"上滑":r>=135&&r<=180||r>=-180&&r<-135?"右滑":r>=-45&&r<=45?"左滑":void 0},touchstart:function(t){this.isMove=!1;var e=(0,i.default)(t.changedTouches,1),a=e[0];this.start.x=a.clientX,this.start.y=a.clientY},touchend:function(t){var e=this;this.isMove=!0,"left"!==this.mode&&"right"!==this.mode||(Math.abs(this.moveDisX)>this.drawerWidth/2?this._change("mask","show",!1):this.style={transform:"translateX(0px)"}),"top"!==this.mode&&"bottom"!==this.mode||(Math.abs(this.moveDisY)>this.drawerHeight/2?this._change("mask","show",!1):this.style={transform:"translateY(0px)"}),setTimeout((function(){e.style={},e.moveDisY=0,e.moveDisX=0}),100)},touchmove:function(t){if(this.isGesture&&(!this.top||"top"!==this.mode)){var e=(0,i.default)(t.changedTouches,1),a=e[0];this.move.x=a.clientX,this.move.y=a.clientY,this.moveDisX=this.move.x-this.start.x,this.moveDisY=this.move.y-this.start.y;var n=this.getDirection(this.move.x,this.move.y,this.start.x,this.start.y);"左滑"===n&&"left"===this.mode||"右滑"===n&&"right"===this.mode?this.style={transform:"translateX(".concat(this.moveDisX,"px)")}:("上滑"===n&&"top"===this.mode||"下滑"===n&&"bottom"===this.mode)&&(this.style={transform:"translateY(".concat(this.moveDisY,"px)")})}},_change:function(t,e,a){var n=this;this[t]=a,this.watchTimer&&clearTimeout(this.watchTimer),this.watchTimer=setTimeout((function(){n[e]=a,n.$emit("change",a)}),a?50:300)},close:function(t){var e=this;if(this.beforeClose&&"function"===typeof this.beforeClose)return this.beforeClose((function(){e._change("mask","show",!1)}),t);this.wrapperClosable&&"mask"===t&&this._change("mask","show",!1),"cancel"===t&&this._change("mask","show",!1),this.$emit("closeDrawer")}}};e.default=c},"48af":function(t,e,a){var n=a("24fb");e=n(!1),e.push([t.i,".flex-box[data-v-52aa369c]{display:flex;flex-direction:column;align-items:center;justify-content:center}.text-ellipsis[data-v-52aa369c]{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.text-ellipsis-two[data-v-52aa369c]{text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.status_bar[data-v-52aa369c]{height:0;width:100%;z-index:10}.top-nav[data-v-52aa369c]{width:100%;height:%?88?%;position:fixed;top:0;background-color:#fff;display:flex;justify-content:space-between;align-items:center;z-index:10}.top-nav .top-nav-back[data-v-52aa369c]{width:25%}.top-nav .top-nav-back .top-nav-back-icon[data-v-52aa369c]{padding:%?15?% %?15?% %?15?% %?30?%}.top-nav .top-nav-title[data-v-52aa369c]{width:45%;text-align:center;font-size:%?34?%;color:#000}.top-nav .top-nav-btn[data-v-52aa369c]{width:calc(25% - %?30?%);text-align:right;margin-right:%?30?%;font-size:%?28?%;color:#838383;position:relative;top:%?3?%}.top-nav-fake[data-v-52aa369c]{width:100%;height:%?88?%}.top-nav-search[data-v-52aa369c]{width:100%;height:%?80?%;background-color:#fff;position:fixed;top:%?88?%;z-index:10}.top-nav-search .nav-search-box[data-v-52aa369c]{width:calc(100% - %?30?% * 2);height:%?72?%;background-color:#f8f8f8;margin:calc(%?80?% - %?72?%) auto 0 auto;border-radius:%?50?%;display:flex;justify-content:space-between;align-items:center}.top-nav-search .nav-search-box .nav-search-icon[data-v-52aa369c]{position:relative;left:%?26?%;top:%?-2?%}.top-nav-search .nav-search-box .nav-search-input[data-v-52aa369c]{width:calc(100% - %?80?%);height:100%;font-size:%?24?%}.top-nav-search .nav-search-box .nav-input-placeholder[data-v-52aa369c]{font-size:%?28?%;color:#c8c8c8}.nav-search-box-invoice[data-v-52aa369c]{width:calc(100% - %?30?% * 2);margin:0 auto;display:flex;justify-content:space-between;align-items:center}.nav-search-box-invoice .nav-search-box[data-v-52aa369c]{width:calc(100% - %?140?%)}.nav-search-box-invoice .nav-search-filter[data-v-52aa369c]{width:%?140?%;font-size:%?28?%;color:#313131;display:flex;justify-content:flex-end;align-items:center;position:relative;top:%?10?%}.nav-search-box-invoice .nav-search-filter .nav-search-filter-text[data-v-52aa369c]{margin-right:%?8?%}.nav-search-box-invoice .nav-search-filter .nav-search-filter-icon[data-v-52aa369c]{margin-right:%?20?%;position:relative;top:%?1?%}.top-nav-tab[data-v-52aa369c]{width:100%;height:%?100?%;background-color:#fff;position:fixed;top:calc(%?88?% + %?80?%);z-index:10}.top-nav-tab .nav-tab-box[data-v-52aa369c]{margin:0 auto}.top-nav-tab .nav-tab-box-two[data-v-52aa369c]{width:75%}.top-nav-tab .nav-tab-box-four[data-v-52aa369c]{width:100%}.top-nav-tab .nav-tab-box-three[data-v-52aa369c]{width:100%}.top-nav-fake-high[data-v-52aa369c]{width:100%;height:calc(%?88?% + %?80?% + %?100?%)}.top-nav-fake-middle[data-v-52aa369c]{width:100%;height:calc(%?88?% + %?80?%)}.fx67ll-punch-box[data-v-52aa369c]{padding:%?10?%}.fx67ll-punch-box .fx67ll-chart-punch[data-v-52aa369c]{width:100%}.fx67ll-punch-box .fx67ll-txt-target[data-v-52aa369c]{color:#999;text-align:center;font-size:%?68?%;margin-top:%?58?%}.fx67ll-punch-box .fx67ll-txt-target span[data-v-52aa369c]:first-child{color:#2ecc71;padding-right:%?18?%}.fx67ll-punch-box .fx67ll-txt-target span[data-v-52aa369c]:last-child{padding-left:%?18?%}.fx67ll-punch-box .fx67ll-punch-btn[data-v-52aa369c]{width:80%;margin:0 auto;margin-top:%?88?%;display:flex;justify-content:space-between;align-items:center}.fx67ll-punch-box .fx67ll-punch-btn .fx67ll-btn-record[data-v-52aa369c]{width:calc(100% - %?60?%);line-height:%?100?%}.fx67ll-punch-box .fx67ll-punch-btn .fx67ll-btn-history[data-v-52aa369c]{width:%?60?%;height:%?60?%;padding:0 %?10?% 0 %?20?%}",""]),t.exports=e},"71f9":function(t,e,a){var n=a("9f57");n.__esModule&&(n=n.default),"string"===typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);var i=a("4f06").default;i("5c6d5a5a",n,!0,{sourceMap:!1,shadowMode:!1})},"76bb":function(t,e,a){var n=a("24fb");e=n(!1),e.push([t.i,'@charset "UTF-8";\r\n/**\r\n * uni-app内置的常用样式变量\r\n */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.zb-drawer__wrapper[data-v-0119a4c8]{position:fixed;top:0;right:0;bottom:0;left:0;overflow:hidden;margin:0;z-index:11}.content--visible_top[data-v-0119a4c8]{border-bottom-left-radius:%?8?%;border-bottom-right-radius:%?8?%}.content--visible_bottom[data-v-0119a4c8]{border-top-left-radius:%?20?%;border-top-right-radius:%?20?%}.mask[data-v-0119a4c8]{position:absolute;top:0;left:0;bottom:0;right:0;z-index:1;opacity:0;background-color:rgba(0,0,0,.4);transition:opacity .3s}.mask__visible[data-v-0119a4c8]{opacity:1}.zb-drawer__body[data-v-0119a4c8]{padding:%?10?% %?20?% %?0?%}.zb_drawer__header[data-v-0119a4c8]{display:flex;align-items:center;padding:%?20?% %?28?%;flex-direction:row;box-shadow:inset 0 -1px 0 0 #f0f0f0}.zb_drawer__header .title[data-v-0119a4c8]{flex:1;text-align:center;text-indent:%?42?%;word-spacing:%?5?%;font-size:%?34?%}.zb_drawer__header .close-wrap[data-v-0119a4c8]{position:relative;flex-shrink:0;overflow:hidden}.zb_drawer__header .close[data-v-0119a4c8]{width:%?50?%;display:flex;align-items:center;justify-content:center;height:%?50?%;cursor:pointer}.zb_drawer__header .before[data-v-0119a4c8],\r\n.zb_drawer__header .after[data-v-0119a4c8]{position:absolute;left:%?30?%;content:" ";height:%?30?%;width:%?4?%;background-color:#333}.zb_drawer__header .close[data-v-0119a4c8]:before,\r\n.zb_drawer__header .close[data-v-0119a4c8]:after{position:absolute;left:%?30?%;content:" ";height:%?30?%;width:%?4?%;background-color:#333}.zb_drawer__header .before[data-v-0119a4c8]{-webkit-transform:rotate(45deg);transform:rotate(45deg)}.zb_drawer__header .after[data-v-0119a4c8]{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.zb_drawer__header .close[data-v-0119a4c8]:before{-webkit-transform:rotate(45deg);transform:rotate(45deg)}.zb_drawer__header .close[data-v-0119a4c8]:after{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.zb-drawer__container[data-v-0119a4c8]{outline:0;height:100%;position:absolute;width:200px;z-index:2;display:flex;flex-direction:column;background-color:#fff}.animation[data-v-0119a4c8]{transition:-webkit-transform .3s ease;transition:transform .3s ease;transition:transform .3s ease,-webkit-transform .3s ease}.zb-drawer_top[data-v-0119a4c8]{top:0;right:0;left:0;-webkit-transform:translateY(-100%);transform:translateY(-100%)}.zb-drawer_bottom[data-v-0119a4c8]{bottom:0;right:0;left:0;-webkit-transform:translateY(100%);transform:translateY(100%)}.zb-drawer_right[data-v-0119a4c8]{right:0;top:0;bottom:0;-webkit-transform:translateX(100%);transform:translateX(100%)}.zb-drawer_left[data-v-0119a4c8]{top:0;left:0;bottom:0;-webkit-transform:translateX(-100%);transform:translateX(-100%)}.content--visible[data-v-0119a4c8]{-webkit-transform:translateX(0);transform:translateX(0)}.content--visible_Y[data-v-0119a4c8]{-webkit-transform:translateY(0);transform:translateY(0)}.zb_drawer__body[data-v-0119a4c8]{flex:1;display:flex;flex-direction:column;overflow:hidden}',""]),t.exports=e},"84c4":function(t,e,a){var n=a("76bb");n.__esModule&&(n=n.default),"string"===typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);var i=a("4f06").default;i("8a51f6f8",n,!0,{sourceMap:!1,shadowMode:!1})},"8e28":function(t,e,a){"use strict";var n=a("84c4"),i=a.n(n);i.a},9045:function(t,e,a){"use strict";a.r(e);var n=a("0e2b"),i=a.n(n);for(var o in n)["default"].indexOf(o)<0&&function(t){a.d(e,t,(function(){return n[t]}))}(o);e["default"]=i.a},"99ad":function(t,e,a){"use strict";a.r(e);var n=a("233e"),i=a.n(n);for(var o in n)["default"].indexOf(o)<0&&function(t){a.d(e,t,(function(){return n[t]}))}(o);e["default"]=i.a},"9f57":function(t,e,a){var n=a("24fb");e=n(!1),e.push([t.i,".flex-box[data-v-611d7b7d]{display:flex;flex-direction:column;align-items:center;justify-content:center}.text-ellipsis[data-v-611d7b7d]{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.text-ellipsis-two[data-v-611d7b7d]{text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.status_bar[data-v-611d7b7d]{height:0;width:100%;z-index:10}.top-nav[data-v-611d7b7d]{width:100%;height:%?88?%;position:fixed;top:0;background-color:#fff;display:flex;justify-content:space-between;align-items:center;z-index:10}.top-nav .top-nav-back[data-v-611d7b7d]{width:25%}.top-nav .top-nav-back .top-nav-back-icon[data-v-611d7b7d]{padding:%?15?% %?15?% %?15?% %?30?%}.top-nav .top-nav-title[data-v-611d7b7d]{width:45%;text-align:center;font-size:%?34?%;color:#000}.top-nav .top-nav-btn[data-v-611d7b7d]{width:calc(25% - %?30?%);text-align:right;margin-right:%?30?%;font-size:%?28?%;color:#838383;position:relative;top:%?3?%}.top-nav-fake[data-v-611d7b7d]{width:100%;height:%?88?%}.top-nav-search[data-v-611d7b7d]{width:100%;height:%?80?%;background-color:#fff;position:fixed;top:%?88?%;z-index:10}.top-nav-search .nav-search-box[data-v-611d7b7d]{width:calc(100% - %?30?% * 2);height:%?72?%;background-color:#f8f8f8;margin:calc(%?80?% - %?72?%) auto 0 auto;border-radius:%?50?%;display:flex;justify-content:space-between;align-items:center}.top-nav-search .nav-search-box .nav-search-icon[data-v-611d7b7d]{position:relative;left:%?26?%;top:%?-2?%}.top-nav-search .nav-search-box .nav-search-input[data-v-611d7b7d]{width:calc(100% - %?80?%);height:100%;font-size:%?24?%}.top-nav-search .nav-search-box .nav-input-placeholder[data-v-611d7b7d]{font-size:%?28?%;color:#c8c8c8}.nav-search-box-invoice[data-v-611d7b7d]{width:calc(100% - %?30?% * 2);margin:0 auto;display:flex;justify-content:space-between;align-items:center}.nav-search-box-invoice .nav-search-box[data-v-611d7b7d]{width:calc(100% - %?140?%)}.nav-search-box-invoice .nav-search-filter[data-v-611d7b7d]{width:%?140?%;font-size:%?28?%;color:#313131;display:flex;justify-content:flex-end;align-items:center;position:relative;top:%?10?%}.nav-search-box-invoice .nav-search-filter .nav-search-filter-text[data-v-611d7b7d]{margin-right:%?8?%}.nav-search-box-invoice .nav-search-filter .nav-search-filter-icon[data-v-611d7b7d]{margin-right:%?20?%;position:relative;top:%?1?%}.top-nav-tab[data-v-611d7b7d]{width:100%;height:%?100?%;background-color:#fff;position:fixed;top:calc(%?88?% + %?80?%);z-index:10}.top-nav-tab .nav-tab-box[data-v-611d7b7d]{margin:0 auto}.top-nav-tab .nav-tab-box-two[data-v-611d7b7d]{width:75%}.top-nav-tab .nav-tab-box-four[data-v-611d7b7d]{width:100%}.top-nav-tab .nav-tab-box-three[data-v-611d7b7d]{width:100%}.top-nav-fake-high[data-v-611d7b7d]{width:100%;height:calc(%?88?% + %?80?% + %?100?%)}.top-nav-fake-middle[data-v-611d7b7d]{width:100%;height:calc(%?88?% + %?80?%)}.fx67ll-punch-drawer[data-v-611d7b7d]{padding:%?60?%}.fx67ll-punch-drawer .fx67ll-punch-item[data-v-611d7b7d]{width:80%;margin:0 auto;display:flex;justify-content:space-between;align-items:center;margin-bottom:%?40?%}.fx67ll-punch-drawer .fx67ll-punch-item .fx67ll-punch-item-title[data-v-611d7b7d]{font-size:%?36?%}.fx67ll-punch-drawer .fx67ll-punch-item .fx67ll-punch-item-picker[data-v-611d7b7d]{position:relative;top:2px}.fx67ll-punch-drawer .fx67ll-punch-item .fx67ll-punch-item-picker .fx67ll-punch-item-text[data-v-611d7b7d]{font-size:%?36?%;color:#2ecc71}.fx67ll-punch-drawer .fx67ll-punch-item .fx67ll-punch-item-remark[data-v-611d7b7d]{width:50%}.fx67ll-punch-drawer .fx67ll-punch-btn[data-v-611d7b7d]{width:100%;margin:0;margin-top:%?80?%;display:flex;justify-content:space-between;align-items:center}.fx67ll-punch-drawer .fx67ll-punch-btn .fx67ll-btn-submit[data-v-611d7b7d]{width:calc(100% - %?200?%)}.fx67ll-punch-drawer .fx67ll-punch-btn .fx67ll-btn-cancel[data-v-611d7b7d]{width:%?160?%}",""]),t.exports=e},a523:function(t,e,a){"use strict";a.r(e);var n=a("ccd3"),i=a("dc10");for(var o in i)["default"].indexOf(o)<0&&function(t){a.d(e,t,(function(){return i[t]}))}(o);a("c94a");var r=a("f0c5"),c=Object(r["a"])(i["default"],n["b"],n["c"],!1,null,"611d7b7d",null,!1,n["a"],void 0);e["default"]=c.exports},acde:function(t,e,a){"use strict";a.d(e,"b",(function(){return i})),a.d(e,"c",(function(){return o})),a.d(e,"a",(function(){return n}));var n={qiunDataCharts:a("417f").default,uniIcons:a("b540").default},i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-uni-view",{staticClass:"fx67ll-punch-box"},[t.isShowAddDrawer?t._e():a("v-uni-view",{staticClass:"fx67ll-chart-punch",style:{marginTop:""+t.getChartMarginTop},attrs:{id:"fx67ll-wx-punch-chart"}},[a("qiun-data-charts",{attrs:{type:"arcbar",opts:t.chartOpts,chartData:t.chartData}})],1),t.isShowAddDrawer?t._e():a("v-uni-view",{staticClass:"fx67ll-txt-target"},[a("span",[t._v(t._s(t.punchWorkHours))]),a("span",[t._v("/")]),a("span",[t._v(t._s(t.targetWorkHours))])]),t.isShowAddDrawer?t._e():a("v-uni-view",{staticClass:"fx67ll-punch-btn"},[a("v-uni-button",{staticClass:"fx67ll-btn-record",attrs:{type:"primary"},on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.showPunchDrawerForAddLog.apply(void 0,arguments)}}},[t._v("记录打卡时间")]),a("uni-icons",{staticClass:"fx67ll-btn-history",attrs:{type:"medal-filled",size:32},on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.goToHistoryLogList.apply(void 0,arguments)}}})],1),a("punchDrawer",{attrs:{isShowPunchDrawer:t.isShowAddDrawer,isAdd:!0},on:{hideDrawer:function(e){arguments[0]=e=t.$handleEvent(e),t.setIsShowDrawer.apply(void 0,arguments)}}})],1)},o=[]},bafd:function(t,e,a){"use strict";var n=a("0d68"),i=a.n(n);i.a},c5f3:function(t,e,a){"use strict";a.d(e,"b",(function(){return n})),a.d(e,"c",(function(){return i})),a.d(e,"a",(function(){}));var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-uni-view",{directives:[{name:"show",rawName:"v-show",value:t.show,expression:"show"}],staticClass:"zb-drawer__wrapper",on:{touchmove:function(e){e.stopPropagation(),e.preventDefault(),arguments[0]=e=t.$handleEvent(e),function(){}.apply(void 0,arguments)}}},[a("v-uni-view",{staticClass:"mask",class:{mask__visible:t.show&&t.mask&&t.modal},on:{click:function(e){e.stopPropagation(),arguments[0]=e=t.$handleEvent(e),t.close("mask")}}}),a("v-uni-view",{staticClass:"zb-drawer__container",class:["zb-drawer_"+t.mode,{animation:t.isMove,"content--visible":t.mask&&("left"===t.mode||"right"===t.mode),"content--visible_Y":t.mask&&("top"===t.mode||"bottom"===t.mode),"content--visible_top":t.radius&&"top"===t.mode,"content--visible_bottom":t.radius&&"bottom"===t.mode}],style:[{top:!!(t.top>0||t.top)&&t.top,width:"left"===t.mode||"right"===t.mode?t.getWidth:"100%",height:"top"===t.mode||"bottom"===t.mode?t.height:"100%"},t.style],on:{touchstart:function(e){arguments[0]=e=t.$handleEvent(e),t.touchstart.apply(void 0,arguments)},touchend:function(e){arguments[0]=e=t.$handleEvent(e),t.touchend.apply(void 0,arguments)},touchmove:function(e){arguments[0]=e=t.$handleEvent(e),t.touchmove.apply(void 0,arguments)},click:function(e){e.stopPropagation(),arguments[0]=e=t.$handleEvent(e)}}},[t.withHeader?a("v-uni-view",{staticClass:"zb_drawer__header"},[t._t("title",[a("v-uni-view",{staticClass:"title"},[t._v(t._s(t.title))])]),t.showClose?a("v-uni-view",{staticClass:"close-wrap",on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.close("cancel")}}},[a("v-uni-view",{staticClass:"close"})],1):t._e()],2):t._e(),a("v-uni-view",{staticClass:"zb_drawer__body"},[t._t("default")],2)],1)],1)},i=[]},c94a:function(t,e,a){"use strict";var n=a("71f9"),i=a.n(n);i.a},ccd3:function(t,e,a){"use strict";a.d(e,"b",(function(){return i})),a.d(e,"c",(function(){return o})),a.d(e,"a",(function(){return n}));var n={zbDrawer:a("0ed7").default,uniEasyinput:a("608e").default},i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("zb-drawer",{attrs:{mode:"bottom",title:t.drawerTitle,wrapperClosable:!1,visible:t.isShowPunchDrawer,radius:!0,height:t.drawerHeight,"before-close":t.handleDrawerClose},on:{"update:visible":function(e){arguments[0]=e=t.$handleEvent(e),t.isShowPunchDrawer=e}}},[a("v-uni-view",{staticClass:"fx67ll-punch-drawer"},[a("v-uni-view",{staticClass:"fx67ll-punch-item"},[a("v-uni-view",{staticClass:"fx67ll-punch-item-title"},[t._v("打卡类型")]),a("v-uni-view",{staticClass:"fx67ll-punch-item-picker"},[a("v-uni-picker",{attrs:{value:t.punchTypeIndex,range:t.punchTypeArr},on:{change:function(e){arguments[0]=e=t.$handleEvent(e),t.punchTypeChange.apply(void 0,arguments)}}},[a("v-uni-view",{staticClass:"fx67ll-punch-item-text"},[t._v(t._s(t.punchTypeArr[t.punchTypeIndex]))])],1)],1)],1),a("v-uni-view",{staticClass:"fx67ll-punch-item"},[a("v-uni-view",{staticClass:"fx67ll-punch-item-title"},[t._v("打卡日期")]),a("v-uni-view",{staticClass:"fx67ll-punch-item-picker"},[a("v-uni-picker",{attrs:{mode:"date",value:t.punchDate,start:t.startPunchDate,end:t.endPunchDate},on:{change:function(e){arguments[0]=e=t.$handleEvent(e),t.punchDateChange.apply(void 0,arguments)}}},[a("v-uni-view",{staticClass:"fx67ll-punch-item-text"},[t._v(t._s(t.punchDate))])],1)],1)],1),a("v-uni-view",{staticClass:"fx67ll-punch-item"},[a("v-uni-view",{staticClass:"fx67ll-punch-item-title"},[t._v("打卡时间")]),a("v-uni-view",{staticClass:"fx67ll-punch-item-picker"},[a("v-uni-picker",{attrs:{mode:"time",value:t.punchTime,start:"00:00",end:"23:59"},on:{change:function(e){arguments[0]=e=t.$handleEvent(e),t.punchTimeChange.apply(void 0,arguments)}}},[a("v-uni-view",{staticClass:"fx67ll-punch-item-text"},[t._v(t._s(t.punchTime))])],1)],1)],1),a("v-uni-view",{staticClass:"fx67ll-punch-item"},[a("v-uni-view",{staticClass:"fx67ll-punch-item-title"},[t._v("打卡备注")]),a("v-uni-view",{staticClass:"fx67ll-punch-item-remark"},[a("uni-easyinput",{attrs:{value:t.punchRemark,placeholder:"请输入...",maxlength:"1023"},on:{input:function(e){arguments[0]=e=t.$handleEvent(e),t.punchRemarkChange.apply(void 0,arguments)}}})],1)],1),a("v-uni-view",{staticClass:"fx67ll-punch-btn"},[a("v-uni-button",{staticClass:"fx67ll-btn-submit",attrs:{type:"primary"},on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.submitPunchLogForm.apply(void 0,arguments)}}},[t._v(t._s(t.isAdd?"新增":"修改")+"打卡记录")]),a("v-uni-button",{staticClass:"fx67ll-btn-cancel",attrs:{type:"warn"},on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.closeDrawer.apply(void 0,arguments)}}},[t._v("取消")])],1)],1)],1)},o=[]},d387:function(t,e,a){"use strict";a("7a82");var n=a("4ea4").default;Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var i=n(a("5530"));a("99af"),a("d401"),a("d3b7"),a("25f0"),a("e25e");var o=a("088b"),r=n(a("f735"));a("0f3c");var c={props:{isShowPunchDrawer:{type:Boolean,required:!0,default:!1},isAdd:{type:Boolean,required:!0,default:!0},punchInfo:{type:Object,required:!1,default:{}}},data:function(){var t=this.getPunchDate({format:!0});return{timer:null,drawerHeight:"360px",drawerTitle:(0,r.default)().format("YYYY-MM-DD hh:mm:ss dddd"),punchTypeArr:["上班打卡","下班打卡"],punchTypeIndex:0,punchDate:t,punchTime:(0,r.default)().format("HH:mm"),punchRemark:""}},watch:{isShowPunchDrawer:function(t,e){t?(this.punchTime=(0,r.default)().format("HH:mm"),this.getDefaultPunchType(),this.punchRemark=""):this.$emit("hideDrawer",t)},punchInfo:function(t,e){if(!this.isAdd&&null!==t&&void 0!==t&&t.punchId&&null!==t&&void 0!==t&&t.punchType&&null!==t&&void 0!==t&&t.updateTime){var a=t.punchType,n=t.updateTime,i=t.punchRemark;this.punchTypeIndex="1"===a?0:"2"===a?1:2,this.punchDate=n.substr(0,10),this.punchTime=n.substring(11,16),this.punchRemark=i||""}}},computed:{startPunchDate:function(){return this.getPunchDate("start")},endPunchDate:function(){return this.getPunchDate("end")}},mounted:function(){r.default.locale("zh-cn"),this.showNowTime()},destroyed:function(){clearInterval(this.timer),this.timer=null},methods:{showNowTime:function(){var t=this;this.timer=setInterval((function(){t.drawerTitle=(0,r.default)().format("YYYY-MM-DD hh:mm:ss dddd")}),1e3)},punchTypeChange:function(t){console.log("picker发送选择改变，携带值为",t.detail.value),this.punchTypeIndex=t.detail.value},getDefaultPunchType:function(){var t=(0,r.default)(),e=(0,r.default)().hour(12).minute(0).second(0);t.isBefore(e)?this.punchTypeIndex=0:this.punchTypeIndex=1},punchDateChange:function(t){this.punchDate=t.detail.value},punchTimeChange:function(t){this.punchTime=t.detail.value},punchRemarkChange:function(t){this.punchRemark=t},getPunchDate:function(t){var e=new Date,a=e.getFullYear(),n=e.getMonth()+1,i=e.getDate();return"start"===t?a-=60:"end"===t&&(a+=2),n=n>9?n:"0"+n,i=i>9?i:"0"+i,"".concat(a,"-").concat(n,"-").concat(i)},submitPunchLogForm:function(){var t=this,e={punchType:(parseInt(t.punchTypeIndex,10)+1).toString(),updateTime:"".concat(t.punchDate," ").concat(t.punchTime,":00}"),punchRemark:t.punchRemark},a=t.isAdd?e:(0,i.default)((0,i.default)({},t.punchInfo),e);t.isAdd?(0,o.addPunchLog)(a).then((function(e){t.isNetworkLoading=!1,200===(null===e||void 0===e?void 0:e.code)?(t.isShowPunchDrawer=!1,uni.showToast({title:"打卡时间记录成功！",icon:"none",duration:1998})):uni.showToast({title:"打卡时间记录失败，请联系管理员！",icon:"none",duration:1998})})):(0,o.updatePunchLog)(a).then((function(e){t.isNetworkLoading=!1,200===(null===e||void 0===e?void 0:e.code)?(t.isShowPunchDrawer=!1,uni.showToast({title:"修改成功！",icon:"none",duration:1998}),t.$emit("reloadPunchList")):uni.showToast({title:"修改失败，请联系管理员！",icon:"none",duration:1998})}))},closeDrawer:function(){this.$emit("hideDrawer",!1)}}};e.default=c},dc10:function(t,e,a){"use strict";a.r(e);var n=a("d387"),i=a.n(n);for(var o in n)["default"].indexOf(o)<0&&function(t){a.d(e,t,(function(){return n[t]}))}(o);e["default"]=i.a}}]);