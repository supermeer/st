import request from '../request/http'

/**
 * 群聊服务层
 *
 * 注意：当前后端协议尚未确定，下面所有接口的 URL / payload 都是占位实现，
 * 与现有单聊接口保持命名一致的风格，方便后期对齐真接口时一处替换即可。
 */

const GroupChatService = {
  /**
   * 群聊发送消息（流式）
   * 约定：onChunk 的 eventData.payload 结构与单聊保持一致，
   *    { type: 'text'|'thinking'|'aiMessageId'|'userMessageId'|'roleStart'|'done', msg: string }
   * 其中：
   *   - type: 'text'         增量正文（内部含 GROUP_SEPARATOR 分隔多角色）
   *   - type: 'roleStart'    提示某个角色开始说话（msg 形如 "{roleId}"）
   *   - type: 'done'         流结束
   *   - 其余 type 沿用单聊语义
   */
  sendMessage(data, onChunk) {
    return request.post(
      '/api/v1/server/group/generateContent',
      data,
      {
        enableChunked: true,
        onChunk
      }
    )
  },

  /**
   * 获取群聊历史消息
   * 期望返回：{ records: [...], current, size, pages } 或 [...]
   */
  getMessageList(params) {
    return request.get('/api/v1/server/group/getMessage', params)
  },

  /**
   * 获取群聊基础信息（含群成员列表）
   */
  getGroupDetail(groupId) {
    return request.get(`/api/v1/server/group/getDetail?groupId=${groupId}`)
  },

  /**
   * 创建群聊
   */
  createGroupChat(data) {
    return request.post('/api/v1/server/groupChat/createGroupChat', data)
  }
}

export default GroupChatService