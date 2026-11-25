import request from '@/utils/request';

// 查询当前登录用户的比赛历史卡片列表
export function getMatchList(query) {
  return request({
    url: '/dortmund/match/getMatchListForApp',
    method: 'get',
    params: query,
  });
}

// 查询比赛详情，含主客队、赛季、赛果和倍率赛果
export function getMatchInfo(matchId) {
  return request({
    url: '/dortmund/match/getMatchInfoForApp/' + matchId,
    method: 'get',
  });
}

// 查询比赛当前有效倍率版本；无有效版本时 data 为 null，界面展示空状态
export function getActiveOdds(matchId) {
  return request({
    url: '/dortmund/match/getActiveOddsForApp/' + matchId,
    method: 'get',
  });
}

// 移动端仅补录或修正比赛赛果与倍率赛果，不覆盖比赛编排字段
export function updateMatchResult(data) {
  return request({
    url: '/dortmund/match/updateMatchResultForApp',
    method: 'post',
    data: data,
  });
}
