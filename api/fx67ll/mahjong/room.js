import request from '@/utils/request';

// 查询麻将室详细
export function getMahjongRoomInfo(mahjongRoomId) {
  return request({
    url: '/mahjong/room/getMahjongRoomInfoForApp/' + mahjongRoomId,
    method: 'get',
  });
}
