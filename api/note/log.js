import request from '@/utils/request';

// 查询富文本记录列表
export function listNoteLog(query) {
  return request({
    // url: '/note/log/getNoteLogListForApp',
    url: '/note/log/getNoteLogListForApp',
    method: 'get',
    params: query,
  });
}

// 新增富文本本记录
export function addNoteLog(data) {
  return request({
    url: '/note/log/addNoteLogForApp',
    method: 'post',
    data: data,
  });
}

// 修改富文本本记录
export function updateNoteLog(data) {
  return request({
    url: '/note/log/editNoteLogForApp',
    method: 'put',
    data: data,
  });
}

// 删除富文本本记录
export function delNoteLog(noteId) {
  return request({
    url: '/note/log/deleteNoteLogByIdForApp/' + noteId,
    method: 'delete',
  });
}
