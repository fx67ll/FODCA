import request from '@/utils/request';

// 查询已上架公告列表
export function listNoticeLog(query) {
  return request({
    url: '/system/notice/public/list',
    method: 'get',
    params: query,
  });
}

// 查询已上架公告详细
export function getNoticeLog(noticeId) {
  return request({
    url: '/system/notice/public/' + noticeId,
    method: 'get',
  });
}

// 查询最新一条已上架公告
export function latestNoticeLog() {
  return request({
    url: '/system/notice/public/latest',
    method: 'get',
  });
}

// 以下为 App 端公告管理接口（仅限 fx67ll 超级管理员）

// 查询通知公告列表（管理员视角，含所有状态）
export function listNoticeLogForApp(query) {
  return request({
    url: '/system/notice/getNoticeListForApp',
    method: 'get',
    params: query,
  });
}

// 查询通知公告详细
export function getNoticeLogForApp(noticeId) {
  return request({
    url: '/system/notice/getNoticeInfoForApp/' + noticeId,
    method: 'get',
  });
}

// 新增通知公告
export function addNoticeLogForApp(data) {
  return request({
    url: '/system/notice/addNoticeForApp',
    method: 'post',
    data: data,
  });
}

// 修改通知公告
export function editNoticeLogForApp(data) {
  return request({
    url: '/system/notice/editNoticeForApp',
    method: 'put',
    data: data,
  });
}

// 删除通知公告
export function delNoticeLogForApp(noticeIds) {
  return request({
    url: '/system/notice/deleteNoticeByIdForApp/' + noticeIds,
    method: 'delete',
  });
}
