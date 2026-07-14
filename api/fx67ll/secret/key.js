import request from '@/utils/request';
import { getFingerprint } from '@/utils/fingerprint.js';

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

/**
 * 下发第三方凭据密文 + 一次性令牌（阶段三·4.5）
 * @param {string} credentialType 凭据类型 lotteryReward / ocr
 * @returns {Promise} { cipherCredential, credentialToken }
 */
export function credentialForApp(credentialType) {
  return request({
    url: '/secret/key/credentialForApp',
    method: 'post',
    data: { credentialType: credentialType, fingerprint: getFingerprint() },
  });
}

/**
 * 一次性令牌换取明文凭据（阶段三·4.5）
 * @param {string} credentialToken 凭据令牌
 * @returns {Promise} { plainCredential } plainCredential 为 JSON 字符串 {appId, appSecret}
 */
export function decryptForApp(credentialToken) {
  return request({
    url: '/secret/key/decryptForApp',
    method: 'post',
    data: { credentialToken: credentialToken, fingerprint: getFingerprint() },
  });
}

/**
 * 一站式获取第三方凭据明文（credentialForApp → decryptForApp，阶段三封装）
 * @param {string} credentialType 凭据类型 lotteryReward / ocr
 * @returns {Promise<{appId:string, appSecret:string}>} 明文凭据对象
 */
export function getCredential(credentialType) {
  return credentialForApp(credentialType).then(res => {
    if (!res || !res.cipherCredential || !res.credentialToken) {
      return Promise.reject({ msg: '获取凭据密文失败' });
    }
    return decryptForApp(res.credentialToken).then(decRes => {
      if (!decRes || !decRes.plainCredential) {
        return Promise.reject({ msg: '解密凭据失败' });
      }
      try {
        return JSON.parse(decRes.plainCredential);
      } catch (e) {
        return Promise.reject({ msg: '凭据格式错误' });
      }
    });
  });
}
