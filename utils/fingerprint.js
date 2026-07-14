import sha256 from 'crypto-js/sha256';
import Utf8 from 'crypto-js/enc-utf8';

/**
 * 设备指纹工具（阶段三·4.4 配套）
 *
 * 一键登录的 loginToken/oneClickLogin 与第三方凭据接口均需传设备指纹，
 * 后端用它绑定一次性令牌、限频、失败锁定。
 *
 * 取值策略：
 * - MP-WEIXIN：用系统信息（deviceId/model/system/brand 等）拼接 hash
 * - H5：用 UA + 屏幕分辨率 + 时区 + canvas 指纹拼接 hash
 *
 * 指纹缓存到 storage，避免每次调用重新计算（canvas 指纹计算较重）。
 */

const FINGERPRINT_STORAGE_KEY = 'App-Fingerprint';

/**
 * 获取设备指纹（带缓存）
 * @returns {string} 指纹串
 */
export function getFingerprint() {
  // #ifdef MP-WEIXIN
  return getMpFingerprint();
  // #endif
  // #ifdef H5
  return getH5Fingerprint();
  // #endif
  // #ifndef MP-WEIXIN || H5
  return 'unknown-platform';
  // #endif
}

/**
 * 小程序端设备指纹
 * 用系统信息拼接，新基础库 deviceId 可能取不到，降级用其他字段保证稳定
 */
function getMpFingerprint() {
  let cached = uni.getStorageSync(FINGERPRINT_STORAGE_KEY);
  if (cached) {
    return cached;
  }
  let info = {};
  try {
    info = uni.getSystemInfoSync();
  } catch (e) {
    info = {};
  }
  // 拼接设备特征：deviceId 优先，配合机型/系统/品牌保证唯一性与稳定性
  const raw = [
    info.deviceId || '',
    info.model || '',
    info.system || '',
    info.platform || '',
    info.brand || '',
    info.pixelRatio || '',
    info.screenWidth || '',
    info.screenHeight || '',
  ].join('|');
  const fp = sha256(raw + '|fx67ll-mp-salt').toString();
  uni.setStorageSync(FINGERPRINT_STORAGE_KEY, fp);
  return fp;
}

/**
 * H5 端浏览器指纹
 * UA + 屏幕分辨率 + 时区 + canvas 指纹拼接 hash
 */
function getH5Fingerprint() {
  let cached = uni.getStorageSync(FINGERPRINT_STORAGE_KEY);
  if (cached) {
    return cached;
  }
  const ua = navigator.userAgent || '';
  const screen = window.screen ? [window.screen.width, window.screen.height, window.screen.colorDepth].join('x') : '';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const language = navigator.language || '';
  const canvas = getCanvasFingerprint();
  const raw = [ua, screen, timezone, language, canvas].join('|');
  const fp = sha256(raw + '|fx67ll-h5-salt').toString();
  uni.setStorageSync(FINGERPRINT_STORAGE_KEY, fp);
  return fp;
}

/**
 * canvas 指纹：绘制特定文字图形取 toDataURL，不同设备/浏览器渲染细微差异形成指纹
 * @returns {string} canvas 指纹串，不支持 canvas 返回空
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 30;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return '';
    }
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('fx67ll-fingerprint-971023', 2, 2);
    ctx.strokeStyle = '#42b983';
    ctx.arc(120, 15, 8, 0, Math.PI * 2);
    ctx.stroke();
    return canvas.toDataURL();
  } catch (e) {
    return '';
  }
}
