(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-mine-index"],{"339b":function(n,i,t){"use strict";t.r(i);var e=t("c882"),a=t.n(e);for(var o in e)["default"].indexOf(o)<0&&function(n){t.d(i,n,(function(){return e[n]}))}(o);i["default"]=a.a},"3b78":function(n,i,t){var e=t("ca57");e.__esModule&&(e=e.default),"string"===typeof e&&(e=[[n.i,e,""]]),e.locals&&(n.exports=e.locals);var a=t("4f06").default;a("5f372f6c",e,!0,{sourceMap:!1,shadowMode:!1})},"697f":function(n,i,t){"use strict";t.d(i,"b",(function(){return a})),t.d(i,"c",(function(){return o})),t.d(i,"a",(function(){return e}));var e={uniIcons:t("b540").default},a=function(){var n=this,i=n.$createElement,t=n._self._c||i;return t("v-uni-view",{staticClass:"mine-container",style:{height:n.windowHeight+"px"}},[t("v-uni-view",{staticClass:"header-section"},[t("v-uni-view",{staticClass:"flex padding justify-between"},[t("v-uni-view",{staticClass:"flex align-center"},[n.avatar?n._e():t("v-uni-view",{staticClass:"cu-avatar xl round bg-white"},[t("v-uni-view",{staticClass:"iconfont icon-people text-gray icon"})],1),n.avatar?t("v-uni-image",{staticClass:"cu-avatar xl round",attrs:{src:n.avatar,mode:"widthFix"},on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.handleToAvatar.apply(void 0,arguments)}}}):n._e(),n.name?n._e():t("v-uni-view",{staticClass:"login-tip",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.handleToLogin.apply(void 0,arguments)}}},[n._v("点击登录")]),n.name?t("v-uni-view",{staticClass:"user-info",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.handleToInfo.apply(void 0,arguments)}}},[t("v-uni-view",{staticClass:"u_title"},[n._v(n._s(n.name))])],1):n._e()],1),t("v-uni-view",{staticClass:"flex align-center",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.handleToInfo.apply(void 0,arguments)}}},[t("v-uni-text",[n._v("个人信息")]),t("v-uni-view",{staticClass:"iconfont icon-right"})],1)],1)],1),t("v-uni-view",{staticClass:"content-section"},[t("v-uni-view",{staticClass:"mine-actions grid col-4 text-center"},[t("v-uni-view",{staticClass:"action-item",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.goFx67ll(0)}}},[t("v-uni-view",[t("uni-icons",{attrs:{color:"#2ecc71",type:"star",size:"32"}})],1),t("v-uni-text",{staticClass:"text"},[n._v(n._s(n.globalConfig.appInfo.author_info[0].title))])],1),t("v-uni-view",{staticClass:"action-item",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.goFx67ll(1)}}},[t("v-uni-view",[t("uni-icons",{attrs:{color:"#2ecc71",type:"medal",size:"32"}})],1),t("v-uni-text",{staticClass:"text"},[n._v(n._s(n.globalConfig.appInfo.author_info[1].title))])],1),t("v-uni-view",{staticClass:"action-item",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.goFx67ll(2)}}},[t("v-uni-view",[t("uni-icons",{attrs:{color:"#2ecc71",type:"fire",size:"32"}})],1),t("v-uni-text",{staticClass:"text"},[n._v(n._s(n.globalConfig.appInfo.author_info[2].title))])],1),t("v-uni-view",{staticClass:"action-item",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.goFx67ll(3)}}},[t("v-uni-view",[t("uni-icons",{attrs:{color:"#2ecc71",type:"hand-up",size:"32"}})],1),t("v-uni-text",{staticClass:"text"},[n._v(n._s(n.globalConfig.appInfo.author_info[3].title))])],1)],1),t("v-uni-view",{staticClass:"menu-list"},[t("v-uni-view",{staticClass:"list-cell list-cell-arrow",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.handleToLogHistory.apply(void 0,arguments)}}},[t("v-uni-view",{staticClass:"menu-item-box"},[t("v-uni-view",[t("uni-icons",{attrs:{color:"#2ecc71",type:"wallet",size:"20"}})],1),t("v-uni-view",[n._v("历史号码记录")])],1)],1),t("v-uni-view",{staticClass:"list-cell list-cell-arrow",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.handleToExtraManagement.apply(void 0,arguments)}}},[t("v-uni-view",{staticClass:"menu-item-box"},[t("v-uni-view",[t("uni-icons",{attrs:{color:"#2ecc71",type:"gift",size:"20"}})],1),t("v-uni-view",[n._v("外快盈亏管理")])],1)],1),t("v-uni-view",{staticClass:"list-cell list-cell-arrow",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.handleToEditInfo.apply(void 0,arguments)}}},[t("v-uni-view",{staticClass:"menu-item-box"},[t("v-uni-view",[t("uni-icons",{attrs:{color:"#2ecc71",type:"staff",size:"20"}})],1),t("v-uni-view",[n._v("编辑资料")])],1)],1),t("v-uni-view",{staticClass:"list-cell list-cell-arrow",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.handleAbout.apply(void 0,arguments)}}},[t("v-uni-view",{staticClass:"menu-item-box"},[t("v-uni-view",[t("uni-icons",{attrs:{color:"#2ecc71",type:"paperclip",size:"20"}})],1),t("v-uni-view",[n._v("关于我们")])],1)],1),t("v-uni-view",{staticClass:"list-cell list-cell-arrow",on:{click:function(i){arguments[0]=i=n.$handleEvent(i),n.handleToSetting.apply(void 0,arguments)}}},[t("v-uni-view",{staticClass:"menu-item-box"},[t("v-uni-view",[t("uni-icons",{attrs:{color:"#2ecc71",type:"gear",size:"20"}})],1),t("v-uni-view",[n._v("应用设置")])],1)],1)],1)],1)],1)},o=[]},"72ac":function(n,i,t){"use strict";t.r(i);var e=t("697f"),a=t("339b");for(var o in a)["default"].indexOf(o)<0&&function(n){t.d(i,n,(function(){return a[n]}))}(o);t("b509");var c=t("f0c5"),s=Object(c["a"])(a["default"],e["b"],e["c"],!1,null,"59ea9a20",null,!1,e["a"],void 0);i["default"]=s.exports},b509:function(n,i,t){"use strict";var e=t("3b78"),a=t.n(e);a.a},c882:function(n,i,t){"use strict";t("7a82"),Object.defineProperty(i,"__esModule",{value:!0}),i.default=void 0,t("99af");var e={data:function(){return{name:this.$store.state.user.name,version:getApp().globalData.config.appInfo.version,globalConfig:getApp().globalData.config}},computed:{avatar:function(){return this.$store.state.user.avatar},windowHeight:function(){return uni.getSystemInfoSync().windowHeight-50}},methods:{handleToInfo:function(){this.$tab.navigateTo("/pages/mine/info/index")},handleToLogHistory:function(){this.$tab.navigateTo("/pages/lottery/log/index")},handleToExtraManagement:function(){this.$tab.navigateTo("/pages/dortmund/extra/index")},handleToEditInfo:function(){this.$tab.navigateTo("/pages/mine/info/edit")},handleToSetting:function(){this.$tab.navigateTo("/pages/mine/setting/index")},handleToLogin:function(){this.$tab.reLaunch("/pages/login")},handleToAvatar:function(){this.$tab.navigateTo("/pages/mine/avatar/index")},handleLogout:function(){var n=this;this.$modal.confirm("确定注销并退出系统吗？").then((function(){n.$store.dispatch("LogOut").then((function(){n.$tab.reLaunch("/pages/index")}))}))},handleAbout:function(){this.$tab.navigateTo("/pages/mine/about/index")},goFx67ll:function(n){var i=this.globalConfig.appInfo.author_info[n];this.$tab.navigateTo("/pages/common/webview/index?title=".concat(i.title,"&url=").concat(i.url))}}};i.default=e},ca57:function(n,i,t){var e=t("24fb");i=e(!1),i.push([n.i,'@charset "UTF-8";\r\n/**\r\n * uni-app内置的常用样式变量\r\n */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */uni-page-body[data-v-59ea9a20]{background-color:#f5f6f7}body.?%PAGE?%[data-v-59ea9a20]{background-color:#f5f6f7}.mine-container[data-v-59ea9a20]{width:100%;height:100%}.mine-container .header-section[data-v-59ea9a20]{padding:15px 15px 45px 15px;background-color:#2ecc71;color:#fff}.mine-container .header-section .login-tip[data-v-59ea9a20]{font-size:18px;margin-left:10px}.mine-container .header-section .cu-avatar[data-v-59ea9a20]{border:2px solid #eaeaea}.mine-container .header-section .cu-avatar .icon[data-v-59ea9a20]{font-size:40px}.mine-container .header-section .user-info[data-v-59ea9a20]{margin-left:15px}.mine-container .header-section .user-info .u_title[data-v-59ea9a20]{font-size:18px;line-height:30px}.mine-container .content-section[data-v-59ea9a20]{position:relative;top:-50px}.mine-container .content-section .mine-actions[data-v-59ea9a20]{margin:15px 15px;padding:20px 0;border-radius:8px;background-color:#fff}.mine-container .content-section .mine-actions .action-item .icon[data-v-59ea9a20]{font-size:28px}.mine-container .content-section .mine-actions .action-item .text[data-v-59ea9a20]{display:block;font-size:13px;margin:8px 0}',""]),n.exports=i}}]);