(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-common-webview-index"],{3998:function(t,e,n){"use strict";n.d(e,"b",(function(){return i})),n.d(e,"c",(function(){return r})),n.d(e,"a",(function(){}));var i=function(){var t=this.$createElement,e=this._self._c||t;return this.params.url?e("v-uni-view",[e("v-uni-web-view",{attrs:{"webview-styles":this.webviewStyles,src:""+this.params.url}})],1):this._e()},r=[]},"6eaa":function(t,e,n){"use strict";n.r(e);var i=n("3998"),r=n("9a4f");for(var a in r)["default"].indexOf(a)<0&&function(t){n.d(e,t,(function(){return r[t]}))}(a);var u=n("f0c5"),s=Object(u["a"])(r["default"],i["b"],i["c"],!1,null,null,null,!1,i["a"],void 0);e["default"]=s.exports},9476:function(t,e,n){"use strict";n("7a82"),Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var i={data:function(){return{params:{},webviewStyles:{progress:{color:"#FF3333"}}}},props:{src:{type:[String],default:null}},onLoad:function(t){this.params=t,t.title&&uni.setNavigationBarTitle({title:t.title})}};e.default=i},"9a4f":function(t,e,n){"use strict";n.r(e);var i=n("9476"),r=n.n(i);for(var a in i)["default"].indexOf(a)<0&&function(t){n.d(e,t,(function(){return i[t]}))}(a);e["default"]=r.a}}]);