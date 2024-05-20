# FODCA
fx67ll One Data Center App  

*Tip: 运行请先安装 `moment` & `underscore`*

## 0.3.17.20240520  
* 新增打卡记录统计  
* 新增中奖金额统计  
* 打卡记录BUG待修复：如果记录的是当天的打卡，统计数据就会有异常  

## 0.3.16.20240514
* 优化新增打卡记录的备注界面  
* 优化搜索按钮和一键回顶按钮的排布  
* 打卡记录新增快速筛选功能，完整功能未完成  

## 0.3.15.20240513
* 新增历史号码记录列表的二级菜单按钮，新增快速筛选和高级筛选功能  

## 0.3.14.20240506
* 新增历史号码记录简单筛选的功能  

## 0.3.13.20240423
* 新增连续购买记录中自动上传期号的功能  

## 0.3.12.20240422
* 修复微信拷贝自动生成号码的时候，未转换格式导致复制带上字符串双引号的问题  

## 0.3.11.20240418
* 新增超管可以从后台配置每日固定追号的功能，后续完善后开放给所有级别用户  
* 修复非超管账号，上传号码记录时，第一列会默认设置为固定追号的问题  

## 0.3.10.20240416
* 修复生成过往高频号码的相关问题  
* 修复H5设置界面异常的问题  
* 修复OCR识别结果如果为空会显示上一次结果缓存的问题  

## 0.3.9.20240415
* 新增每日号码开关设置，能够生成一注过往高频数字组成的号码  
* 切换之前所使用的`uniCloud`上传，改为使用个人服务器上传

## 0.3.8.20240407
* 外快盈亏入口新增配置项控制  

## 0.3.7.20240327
* 修复H5拷贝到剪切板成功之后没有提示的问题  
* 修复修改历史号码详情的时候，选择没有中奖，依然需要填写中奖金额的问题  
* 新增查询开奖信息之后自动判断是否中奖以及中奖金额的功能  
* 新增保存开奖信息之后，再重复点击三次查询开奖信息按钮，允许强制重新查询开奖信息的功能  

## 0.3.6.20240326
* 修复IOS系统进入历史号码记录列表自动弹出键盘的问题  
* 修复保存成功中奖号码之后没有自动刷新列表数据的问题  
* 所有列表新增一键回顶功能  
* 优化中奖标识显示不够精准的问题  

## 0.3.5.20240325
* 彩票管理新增彩票期号字段
* 添加最基础的中奖信息手动查询功能  
* 修复路由异常导致修改失败的问题  

## 0.3.4.20231214
* 完成打卡工时统计的功能   

## 0.3.3.20231212
* 完成打卡记录整体功能   
* 待新增打卡工时统计的功能

## 0.3.2.20231207
* 完善打卡记录整体功能    

## 0.3.1.20231206
* 新增打卡工时统计页面  

## 0.3.0.20231206
* 增加历史打卡记录页面  

## 0.2.1.20231019
* 优化H5登录页，小程序和H5登录页分别使用不同样式  

## 0.2.0.20231011
* 完善H5备案信息的展示  
* 经过一段时间的稳定测试，已经可以作为第二个小版本发布~

## 0.1.14.20230920
* 添加H5端备案信息  
* 优化部分页面展示细节  
* 调整个人信息修改页面的位置  

## 0.1.13.20230905
* 优化布局

## 0.1.12.20230904
* 小目标自省

## 0.1.11.20230902
* 微信小程序添加拍照后OCR识别的功能  
* 完善百度OCR识别之后中奖信息的展示，并添加复制解析后的结果的功能

## 0.1.10.20230831
* 添加配置查询  
* 添加历史号码记录修改页面

## 0.1.9.20230830
* 添加历史号码左滑可以重新拷贝至剪切板的功能  
* 修复微信图表动态高度错误的问题  
 
## 0.1.8.20230829
* 引入百度OCR识别用于中奖信息识别 (*接口已全部测试调通，待完善功能逻辑*)  
* 后续尝试直接获取每日中奖信息识别  

## 0.1.7.20230822
* 优化外快盈亏管理页面  

## 0.1.6.20230817  
* 增加外快盈亏管理页面  

## 0.1.5.20230816
* 修复微信版本相关问题  
* 增加历史号码记录页面  

## 0.1.4.20230815  
* 优化各类接口重复调用的逻辑
* 对接彩票号码记录管理的接口  

## 0.1.3.20230814
* 优化登录界面出现的逻辑  
* 对接彩票生成配置管理的接口  

## 0.1.1.20230813
* 整合之前个人日常使用的彩票工具  

## 0.1.0.20230812
* 初始化个人 APP 代码底座  