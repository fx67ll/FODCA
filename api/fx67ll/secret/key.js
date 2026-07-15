import request from '@/utils/request';

// 查询秘钥配置（单个）
export function getSecretConfig(query) {
  return request({
    url: '/secret/key/getSecretKeyConfigForApp',
    method: 'get',
    params: query,
  });
}

// 批量查询秘钥配置（POST，一次请求查多个键，仅白名单内非敏感键返回明文）
export function getSecretConfigBatch(secretKeys) {
  return request({
    url: '/secret/key/getSecretKeyConfigForApp',
    method: 'post',
    data: { secretKeys },
  });
}

// 检查登录资格（小程序端，wxCode 换白名单校验，只返回布尔不暴露 openid）
export function checkLoginEligibility(wxCode) {
  return request({
    url: '/auth/app/checkLoginEligibility',
    method: 'post',
    headers: { isToken: false },
    data: { loginType: 'main', wxCode: wxCode },
  });
}
