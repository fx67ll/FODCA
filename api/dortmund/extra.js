import request from '@/utils/request';

// 查询外快盈亏记录列表
export function getExtraList(query) {
  return request({
    url: '/dortmund/extra/getExtraListForApp',
    method: 'get',
    params: query,
  });
}

// 新增外快盈亏记录
export function addExtra(data) {
  return request({
    url: '/dortmund/extra/addExtraForApp',
    method: 'post',
    data: data,
  });
}

// 删除外快盈亏记录
export function delExtra(extraId) {
  return request({
    url: '/dortmund/extra/deleteExtraByIdForApp/' + extraId,
    method: 'delete',
  });
}
