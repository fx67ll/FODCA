(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-register"],{"12e3":function(t,n,e){"use strict";e.r(n);var a=e("aa05"),i=e("d891");for(var o in i)["default"].indexOf(o)<0&&function(t){e.d(n,t,(function(){return i[t]}))}(o);e("96b2");var r=e("f0c5"),s=Object(r["a"])(i["default"],a["b"],a["c"],!1,null,"32b743da",null,!1,a["a"],void 0);n["default"]=s.exports},"5c951":function(t,n,e){"use strict";e("7a82");var a=e("4ea4").default;Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var i=a(e("c7eb")),o=a(e("1da1")),r=e("aa92"),s={data:function(){return{codeUrl:"",captchaEnabled:!0,globalConfig:getApp().globalData.config,registerForm:{username:"",password:"",confirmPassword:"",code:"",uuid:""}}},created:function(){this.getCode()},methods:{handleUserLogin:function(){this.$tab.navigateTo("/pages/login")},getCode:function(){var t=this;(0,r.getCodeImg)().then((function(n){t.captchaEnabled=void 0===n.captchaEnabled||n.captchaEnabled,t.captchaEnabled&&(t.codeUrl="data:image/gif;base64,"+n.img,t.registerForm.uuid=n.uuid)}))},handleRegister:function(){var t=this;return(0,o.default)((0,i.default)().mark((function n(){return(0,i.default)().wrap((function(n){while(1)switch(n.prev=n.next){case 0:""===t.registerForm.username?t.$modal.msgError("请输入您的账号"):""===t.registerForm.password?t.$modal.msgError("请输入您的密码"):""===t.registerForm.confirmPassword?t.$modal.msgError("请再次输入您的密码"):t.registerForm.password!==t.registerForm.confirmPassword?t.$modal.msgError("两次输入的密码不一致"):""===t.registerForm.code&&t.captchaEnabled?t.$modal.msgError("请输入验证码"):(t.$modal.loading("注册中，请耐心等待..."),t.register());case 1:case"end":return n.stop()}}),n)})))()},register:function(){var t=this;return(0,o.default)((0,i.default)().mark((function n(){return(0,i.default)().wrap((function(n){while(1)switch(n.prev=n.next){case 0:(0,r.register)(t.registerForm).then((function(n){t.$modal.closeLoading(),uni.showModal({title:"系统提示",content:"恭喜你，您的账号 "+t.registerForm.username+" 注册成功！",success:function(t){t.confirm&&uni.redirectTo({url:"/pages/login"})}})})).catch((function(){t.captchaEnabled&&t.getCode()}));case 1:case"end":return n.stop()}}),n)})))()},registerSuccess:function(t){var n=this;this.$store.dispatch("GetInfo").then((function(t){n.$tab.reLaunch("/pages/index")}))}}};n.default=s},"96b2":function(t,n,e){"use strict";var a=e("9a03"),i=e.n(a);i.a},"9a03":function(t,n,e){var a=e("a64e");a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.i,a,""]]),a.locals&&(t.exports=a.locals);var i=e("4f06").default;i("942fb014",a,!0,{sourceMap:!1,shadowMode:!1})},a64e:function(t,n,e){var a=e("24fb");n=a(!1),n.push([t.i,'@charset "UTF-8";\r\n/**\r\n * uni-app内置的常用样式变量\r\n */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */uni-page-body[data-v-32b743da]{background-color:#fff}body.?%PAGE?%[data-v-32b743da]{background-color:#fff}.normal-login-container[data-v-32b743da]{width:100%}.normal-login-container .logo-content[data-v-32b743da]{width:100%;font-size:21px;text-align:center;padding-top:15%}.normal-login-container .logo-content uni-image[data-v-32b743da]{border-radius:4px}.normal-login-container .logo-content .title[data-v-32b743da]{margin-left:10px}.normal-login-container .login-form-content[data-v-32b743da]{text-align:center;margin:20px auto;margin-top:15%;width:80%}.normal-login-container .login-form-content .input-item[data-v-32b743da]{margin:20px auto;background-color:#f5f6f7;height:45px;border-radius:20px}.normal-login-container .login-form-content .input-item .icon[data-v-32b743da]{font-size:%?38?%;margin-left:10px;color:#999}.normal-login-container .login-form-content .input-item .input[data-v-32b743da]{width:100%;font-size:14px;line-height:20px;text-align:left;padding-left:15px}.normal-login-container .login-form-content .register-btn[data-v-32b743da]{margin-top:40px;height:45px}.normal-login-container .login-form-content .xieyi[data-v-32b743da]{color:#333;margin-top:20px}.normal-login-container .login-form-content .login-code[data-v-32b743da]{height:38px;float:right}.normal-login-container .login-form-content .login-code .login-code-img[data-v-32b743da]{height:38px;position:absolute;margin-left:10px;width:%?200?%}',""]),t.exports=n},aa05:function(t,n,e){"use strict";e.d(n,"b",(function(){return a})),e.d(n,"c",(function(){return i})),e.d(n,"a",(function(){}));var a=function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("v-uni-view",{staticClass:"normal-login-container"},[e("v-uni-view",{staticClass:"logo-content align-center justify-center flex"},[e("v-uni-image",{staticStyle:{width:"150rpx",height:"150rpx"},attrs:{src:t.globalConfig.appInfo.logo,mode:"widthFix"}})],1),e("v-uni-view",{staticClass:"login-form-content"},[e("v-uni-view",{staticClass:"input-item flex align-center"},[e("v-uni-view",{staticClass:"iconfont icon-user icon"}),e("v-uni-input",{staticClass:"input",attrs:{type:"text",placeholder:"请输入账号",maxlength:"30"},model:{value:t.registerForm.username,callback:function(n){t.$set(t.registerForm,"username",n)},expression:"registerForm.username"}})],1),e("v-uni-view",{staticClass:"input-item flex align-center"},[e("v-uni-view",{staticClass:"iconfont icon-password icon"}),e("v-uni-input",{staticClass:"input",attrs:{type:"password",placeholder:"请输入密码",maxlength:"20"},model:{value:t.registerForm.password,callback:function(n){t.$set(t.registerForm,"password",n)},expression:"registerForm.password"}})],1),e("v-uni-view",{staticClass:"input-item flex align-center"},[e("v-uni-view",{staticClass:"iconfont icon-password icon"}),e("v-uni-input",{staticClass:"input",attrs:{type:"password",placeholder:"请输入重复密码",maxlength:"20"},model:{value:t.registerForm.confirmPassword,callback:function(n){t.$set(t.registerForm,"confirmPassword",n)},expression:"registerForm.confirmPassword"}})],1),t.captchaEnabled?e("v-uni-view",{staticClass:"input-item flex align-center",staticStyle:{width:"60%",margin:"0px"}},[e("v-uni-view",{staticClass:"iconfont icon-code icon"}),e("v-uni-input",{staticClass:"input",attrs:{type:"number",placeholder:"请输入验证码",maxlength:"4"},model:{value:t.registerForm.code,callback:function(n){t.$set(t.registerForm,"code",n)},expression:"registerForm.code"}}),e("v-uni-view",{staticClass:"login-code"},[e("v-uni-image",{staticClass:"login-code-img",attrs:{src:t.codeUrl},on:{click:function(n){arguments[0]=n=t.$handleEvent(n),t.getCode.apply(void 0,arguments)}}})],1)],1):t._e(),e("v-uni-view",{staticClass:"action-btn"},[e("v-uni-button",{staticClass:"register-btn cu-btn block bg-blue lg round",on:{click:function(n){arguments[0]=n=t.$handleEvent(n),t.handleRegister()}}},[t._v("注册")])],1)],1),e("v-uni-view",{staticClass:"xieyi text-center"},[e("v-uni-text",{staticClass:"text-blue",on:{click:function(n){arguments[0]=n=t.$handleEvent(n),t.handleUserLogin.apply(void 0,arguments)}}},[t._v("使用已有账号登录")])],1)],1)},i=[]},d891:function(t,n,e){"use strict";e.r(n);var a=e("5c951"),i=e.n(a);for(var o in a)["default"].indexOf(o)<0&&function(t){e.d(n,t,(function(){return a[t]}))}(o);n["default"]=i.a}}]);