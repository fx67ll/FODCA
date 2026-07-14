import request from '@/utils/request';

// 查询秘钥配置列表
export function getSecretConfig(query) {
  return request({
    url: '/secret/key/getSecretKeyConfigForApp',
    method: 'get',
    params: query,
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
