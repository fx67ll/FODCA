import request from '@/utils/request';

// 查询当前登录用户的回报组合卡片列表，分页参数由 APP 专用接口解析
export function getReturnCombinationList(query) {
  return request({
    url: '/dortmund/return/getReturnCombinationListForApp',
    method: 'get',
    params: query,
  });
}

// 查询回报组合详情，含组合内比赛与已上传图片
export function getReturnCombinationInfo(combinationId) {
  return request({
    url: '/dortmund/return/getReturnCombinationInfoForApp/' + combinationId,
    method: 'get',
  });
}

// 按比赛已登记的倍率赛果重新核验单条已采用回报组合
export function verifyReturnCombination(combinationId) {
  return request({
    url: '/dortmund/return/verifyReturnCombinationForApp/' + combinationId,
    method: 'post',
  });
}

// APP 上传回报组合图片时使用的接口路径，供 uni.uploadFile 直接拼接 baseUrl
export const RETURN_IMAGE_UPLOAD_URL = '/dortmund/return/uploadReturnImageForApp/';
