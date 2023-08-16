import request from '@/utils/request';

// 查询固定追号配置详细
export function getSetting() {
  return request({
    url: '/lottery/setting/getLotterySettingConfigForApp',
    method: 'get',
  });
}

// 修改固定追号配置
export function updateSetting(data) {
  return request({
    url: '/lottery/setting/editLotterySettingConfigForApp',
    method: 'put',
    data: data,
  });
}

// 新增固定追号配置
export function addSetting(data) {
  return request({
    url: '/lottery/setting/addLotterySettingConfigForApp',
    method: 'post',
    data: data,
  });
}
