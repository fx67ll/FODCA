import request from '@/utils/request';

// 查询外快盈亏数值模拟版本记录列表
export function getSimulateVersionList(query) {
  return request({
    url: '/dortmund/extra/simulate/version/getSimulateVersionListForApp',
    method: 'get',
    params: query,
  });
}

// 新增外快盈亏数值模拟版本记录
export function addSimulateVersion(data) {
  return request({
    url: '/dortmund/extra/simulate/version/addSimulateVersionForApp',
    method: 'post',
    data: data,
  });
}

// 修改外快盈亏数值模拟版本记录（用于版本启用停用）
export function updateSimulateVersion(data) {
  return request({
    url: '/dortmund/extra/simulate/version/updateSimulateVersionForApp',
    method: 'post',
    data: data,
  });
}

// 作废外快盈亏数值模拟版本记录（软删除，作废后不在列表中展示）
export function invalidateSimulateVersion(data) {
  return request({
    url: '/dortmund/extra/simulate/version/invalidateSimulateVersionForApp',
    method: 'post',
    data: data,
  });
}

// 查询外快盈亏数值模拟轮次记录列表
export function getSimulateList(query) {
  return request({
    url: '/dortmund/extra/simulate/getSimulateListForApp',
    method: 'get',
    params: query,
  });
}

// 新增外快盈亏数值模拟轮次记录
export function addSimulate(data) {
  return request({
    url: '/dortmund/extra/simulate/addSimulateForApp',
    method: 'post',
    data: data,
  });
}

// 删除外快盈亏数值模拟轮次记录
export function delSimulate(simId) {
  return request({
    url: '/dortmund/extra/simulate/deleteSimulateByIdForApp/' + simId,
    method: 'delete',
  });
}
