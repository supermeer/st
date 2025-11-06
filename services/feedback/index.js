import request from '../request/http'

/**
 * 提交意见反馈
 * @param {Object} data - 反馈数据
 * @param {string} data.content - 反馈内容
 * @param {Array} data.images - 图片列表
 * @returns {Promise}
 */
export function submitFeedback(data) {
  return request.post('/api/v1/server/feedback/submit', data)
}

