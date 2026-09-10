import request from '../request/http'

export function getGroupList(params) {
    return request.get('/api/v1/server/group/getGroupList', params)
}

export function getGroupDetail(groupId, plotId) {
    return request.get(`/api/v1/server/groupChat/getGroupChatDetail?groupChatId=${groupId}&plotId=${plotId}`)
}

export function getGroupDetailByParams(params) {
    return request.get(`/api/v1/server/groupChat/getGroupChatDetail`, params)
}

export function getGroupChatList(params) {
    return request.get('/api/v1/server/group/getGroupChatList', params)
}

export function applyPublish(data) {
    return request.post('/api/v1/server/groupChat/applyPublish', data)
}

// 群聊驳回原因
export function getAuditRejectReason(params) {
    return request.get('/api/v1/server/groupChat/getAuditRejectReason', params)
}

// 下架群聊（公开群聊下架，对齐角色 unpublishChar）
export function unpublishGroup(data) {
    return request.post('/api/v1/server/groupChat/unpublish', data)
}

// 删除群聊（对齐角色 deleteCharacter）
export function deleteGroup(data) {
    return request.post('/api/v1/server/groupChat/deleteGroupChat', data)
}

// 群聊列表接口（用户端）
export function getUserGroupChatList(params) {
    return request.get('/api/v1/server/groupChat/getGroupChatList', params)
}

export function getCurrentPlotByGroupChatId(groupChatId) {
    return request.get(`/api/v1/server/plot/getCurrentPlotByGroupChatId?groupChatId=${groupChatId}`)
}

// 关注用户
export function followUser(targetUserId) {
    return request.post('/api/v1/user/follow/follow', { targetUserId })
}

// 取关用户
export function unfollowUser(targetUserId) {
    return request.post('/api/v1/user/follow/unfollow', { targetUserId })
}

export function shareGroup(data) {
    // return request.post('/api/v1/server/character/shareCharacter', data)
}
