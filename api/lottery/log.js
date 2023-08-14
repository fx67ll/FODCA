import request from '@/utils/request';

// 查询每日号码记录列表
export function listLog(query) {
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
