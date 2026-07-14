import request from '@/utils/request';

// 查询每日号码记录列表
export function getLogList(query) {
  return request({
    url: '/lottery/log/getLotteryLogListForApp',
    method: 'get',
    params: query,
  });
}

// 查询指定彩种最近一条"有期号"的记录（自动跳过 dateCode 为空的脏数据，按 create_time 倒序取第一条）
// 用于期号计算时向前回溯基准记录，适配全部彩种，由调用方传 numberType 区分
export function getLatestLogWithDateCode(query) {
  return request({
    url: '/lottery/log/getLatestLogWithDateCodeForApp',
    method: 'get',
    params: query,
  });
}

// 新增每日号码记录
export function addLog(data) {
  return request({
    url: '/lottery/log/addLotteryLogForApp',
    method: 'post',
    data: data,
  });
}

// 批量新增每日号码记录（一个事务按入参顺序写入，用于周五一键三连等场景）
export function batchAddLog(data) {
  return request({
    url: '/lottery/log/batchAddLotteryLogForApp',
    method: 'post',
    data: data,
  });
}

// 删除每日号码记录
export function delLog(lotteryId) {
  return request({
    url: '/lottery/log/deleteLogByIdForApp/' + lotteryId,
    method: 'delete',
  });
}

// 查询号码记录详情
export function getLogInfo(lotteryId) {
  return request({
    url: `/lottery/log/getLotteryLogInfoForApp/${lotteryId}`,
    method: 'get',
  });
}

// 修改每日号码记录
export function editLog(data) {
  return request({
    url: '/lottery/log/editLotteryLogForApp',
    method: 'put',
    data: data,
  });
}

// 合并同期号同类型的每日号码记录（后台事务完成合并+删除旧数据，入参为待合并主键数组）
export function mergeLog(data) {
  return request({
    url: '/lottery/log/mergeLotteryLogForApp',
    method: 'post',
    data: data,
  });
}

// 查询历史号码记录中奖数据统计
export function listTotalReward(query) {
  return request({
    url: '/lottery/log/getLotteryTotalReward',
    method: 'get',
    params: query,
  });
}

// 查询历史号码出现频率统计
export function listHistoryStatistics(query) {
  return request({
    url: '/lottery/log/getLotteryHistoryStatistics',
    method: 'get',
    params: query,
  });
}

// 中奖信息查询（后端代理 mxnzp，凭据不下发前端）
export function queryRewardForApp(expect, numberType) {
  return request({
    url: '/lottery/log/queryRewardForApp',
    method: 'get',
    params: { expect, numberType },
  });
}

// 百度 OCR 识别（后端代理百度 OCR，凭据不下发前端）
export function queryOcrForApp(imageUrl) {
  return request({
    url: '/lottery/log/queryOcrForApp',
    method: 'post',
    params: { imageUrl },
  });
}
