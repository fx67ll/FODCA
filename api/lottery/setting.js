import request from '@/utils/request';

// 查询号码生成配置详细
export function getSetting() {
  return request({
    url: '/lottery/setting/getLotterySettingConfigForApp',
    method: 'get',
  });
}

// 修改号码生成配置
export function updateSetting(data) {
  return request({
    url: '/lottery/setting/editLotterySettingConfigForApp',
    method: 'put',
    data: data,
  });
}

// 新增号码生成配置
export function addSetting(data) {
  return request({
    url: '/lottery/setting/addLotterySettingConfigForApp',
    method: 'post',
    data: data,
  });
}

// 查询固定追号信息
export function getChaseNumberSetting(query) {
  return request({
    url: '/lottery/chase/getLotteryChaseSettingsForApp',
    method: 'get',
    params: query,
  });
}
