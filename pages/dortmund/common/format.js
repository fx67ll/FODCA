// 多特蒙德移动端共用的业务展示口径，避免列表、抽屉各自维护中文标签。

// 常规比赛结果固定为胜平负三值；空值表示尚未登记
export const MATCH_RESULT_OPTIONS = Object.freeze([
  { text: '主队胜', value: '0' },
  { text: '平局', value: '1' },
  { text: '客队胜', value: '2' },
]);

// 倍率赛果为可多选编码，与 Web 端及后端 DortmundModuleConfig 保持一致
export const ODDS_RESULT_OPTIONS = Object.freeze([
  { text: '主胜', value: 'HW' },
  { text: '平局', value: 'DR' },
  { text: '客胜', value: 'AW' },
  { text: '让分主胜', value: 'HH' },
  { text: '让分平局', value: 'HD' },
  { text: '让分客胜', value: 'HA' },
]);

export const VERIFICATION_OPTIONS = Object.freeze([
  { text: '未核验', value: 'U' },
  { text: '已达成', value: 'Y' },
  { text: '未达成', value: 'N' },
]);

// 空金额统一展示 0，避免移动端卡片出现不友好的 null/undefined
export function formatNumber(value, fractionDigits = 2) {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return String(value);
  }
  return parsed.toFixed(fractionDigits).replace(/\.?0+$/, '');
}

// 偏差金额保留符号，0 不显示正负号
export function formatSignedNumber(value, fractionDigits = 2) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed === 0) {
    return '0';
  }
  const text = Math.abs(parsed)
    .toFixed(fractionDigits)
    .replace(/\.?0+$/, '');
  return (parsed > 0 ? '+' : '-') + text;
}

export function matchResultLabel(value) {
  if (value === null || value === undefined || value === '') {
    return '未登记';
  }
  const matched = MATCH_RESULT_OPTIONS.find(item => String(item.value) === String(value));
  return matched ? matched.text : String(value);
}

export function oddsResultLabels(value) {
  const tokens = String(value || '')
    .split(/[,，;；、\s]+/)
    .map(item => item.trim().toUpperCase())
    .filter(Boolean);
  return tokens.map(token => {
    const matched = ODDS_RESULT_OPTIONS.find(item => item.value === token);
    return matched ? matched.text : token;
  });
}

export function verificationLabel(value) {
  if (value === 'Y') return '已达成';
  if (value === 'N') return '未达成';
  return '未核验';
}

export function verificationClass(value) {
  if (value === 'Y') return 'is-success';
  if (value === 'N') return 'is-failed';
  return 'is-pending';
}

export function adoptionLabel(value) {
  return value === 'Y' ? '已采用' : '未采用';
}

export function selectionTypeLabel(value) {
  const token = String(value || '').toUpperCase();
  const matched = ODDS_RESULT_OPTIONS.find(item => item.value === token);
  return matched ? matched.text : token || '待定';
}

export function normalizeDateTime(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : '未记录';
}

// 核验接口只返回最终状态，前端补一条本地时间；不能直接使用 ISO 字符串，否则会按 UTC 显示。
export function formatLocalDateTime(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = number => String(number).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

// 卡片入场动画按当前页内序号递增，限制最大延迟避免长列表出现等待
export function cardAnimationDelay(index) {
  return `${Math.min(index, 8) * 45}ms`;
}
