import request from '@/utils/request';

// 查询每日号码记录列表
export function getLogList(query) {
  return request({
    url: '/lottery/log/getLotteryLogListForApp',
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
    params: query
  })
}
