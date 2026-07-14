import request from '@/utils/request';

/**
 * APP 一键登录接口封装（阶段三·4.4）
 *
 * 流程：loginToken 派发一次性令牌 → oneClickLogin 用令牌换 JWT。
 * 两接口均匿名（isToken: false），令牌安全靠后端频率限制+一次性+短时效+失败锁定。
 */

/**
 * 派发一次性登录令牌
 * @param {Object} data { loginType: 'main'|'guest', wxCode: 小程序code(main必传), fingerprint: 设备指纹 }
 * @returns {Promise} 返回 loginToken
 */
export function loginToken(data) {
  return request({
    url: '/auth/app/loginToken',
    method: 'post',
    headers: { isToken: false },
    data: data,
  });
}

/**
 * 一键登录换 JWT
 * @param {Object} data { loginToken: 一次性令牌, fingerprint: 设备指纹 }
 * @returns {Promise} 返回 token（JWT）
 */
export function oneClickLogin(data) {
  return request({
    url: '/auth/app/oneClickLogin',
    method: 'post',
    headers: { isToken: false },
    data: data,
  });
}
