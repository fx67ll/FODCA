import request from "@/utils/request";

// 查询打卡记录列表
export function getPunchLogList(query) {
  return request({
    url: "/punch/log/getPunchLogListForApp",
    method: "get",
    params: query,
  });
}

// 查询打卡记录详细
export function getPunchLogInfo(punchId) {
  return request({
    url: "/punch/log/getPunchLogInfoForApp/" + punchId,
    method: "get",
  });
}

// 查询打卡工时统计
export function getWorkTotalTime(query) {
  return request({
    url: "/punch/log/getWorkTotalTime",
    method: "get",
    params: query,
  });
}

// 查询缺卡记录列表
export function getPunchLostLog(query) {
  return request({
    url: "/punch/log/getPunchLostLog",
    method: "get",
    params: query,
  });
}

// 新增打卡记录
export function addPunchLog(data) {
  return request({
    url: "/punch/log/addPunchLogForApp",
    method: "post",
    data: data,
  });
}

// 修改打卡记录
export function updatePunchLog(data) {
  return request({
    url: "/punch/log/editPunchLogForApp",
    method: "put",
    data: data,
  });
}

// 删除打卡记录
export function delPunchLog(punchId) {
  return request({
    url: "/punch/log/deletePunchLogByIdForApp/" + punchId,
    method: "delete",
  });
}
