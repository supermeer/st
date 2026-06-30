import request from '../request/http'

export function getGroupList(params) {
    return request.get('/api/v1/server/group/getGroupList', params)
}

export function getGroupDetail(groupId) {
    return request.get(`/api/v1/server/group/getGroupDetail?groupId=${groupId}`)
}

export function getGroupChatList(params) {
    return request.get('/api/v1/server/group/getGroupChatList', params)
}
