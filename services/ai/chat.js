import request from '../request/http'

// AI对话服务API
const ChatService = {
  /**
   * 发送消息
   * @param {string} sessionId - 会话ID
   * @param {string} content - 消息内容
   * @returns {Promise} - 返回Promise对象
   */
  sendMessage(data, onChunk) {
    return request.post('/api/v1/server/plot/generateContent', data, {
      enableChunked: true,
      onChunk
    })
  },

  /**
   * 创建新会话
   * @returns {Promise} - 返回Promise对象
   */
  createSession(data) {
    return request.post('/api/v1/server/chat/createChat', data)
  },

  /**
   * 获取历史会话列表
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Promise} - 返回Promise对象
   */
  getSessionList(params) {
    return request.get('/api/v1/server/chat/getChatList', params)
  },

  /**
   * 获取会话详情
   * @param {string} sessionId - 会话ID
   * @returns {Promise} - 返回Promise对象
   */
  getSessionDetail(sessionId) {
    return request.get(`/api/v1/server/chat/getChatMessage?chatId=${sessionId}`)
  },

  /**
   * 删除会话
   * @param {string} sessionId - 会话ID
   * @returns {Promise} - 返回Promise对象
   */
  deleteSession(sessionId) {
    return request.delete(`/api/v1/ai/session/${sessionId}`)
  }
}

export function getBlogList(params) {
  return request.get('/api/v1/ai/blog/list', params)
}

export function getStyleList() {
  return request.get('/api/v1/server/menu/getBaowenStyle')
}

export function getBloggerType() {
  return request.get('/api/v1/server/menu/getBloggerType')
}

export function getCommentCategory(params) {
  return request.get('/api/v1/server/menu/getCommentCategory', params)
}

export function getHomePlotMessage() {
  return request.get('/api/v1/server/plot/getDefaultPlotMessage')
}

export default ChatService
