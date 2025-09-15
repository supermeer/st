import request from '../request/http'

/**
 * 获取协议内容
 * @param {string} type - 协议类型：service(服务协议)、privacy(隐私协议)、user(用户协议)、vip(VIP协议)、renew(自动续费协议)
 * @returns {Promise} 返回协议内容
 */
export function getAgreementContent(type) {
  return request.get('/api/agreement/content', { type })
}

/**
 * 获取协议列表
 * @returns {Promise} 返回协议列表
 */
export function getAgreementList() {
  return request.get('/api/agreement/list')
}

/**
 * 获取协议详情
 * @param {string} id - 协议ID
 * @returns {Promise} 返回协议详情
 */
export function getAgreementDetail(id) {
  return request.get(`/api/agreement/detail/${id}`)
}

/**
 * 更新协议内容（管理员功能）
 * @param {Object} data - 协议数据
 * @returns {Promise} 返回更新结果
 */
export function updateAgreementContent(data) {
  return request.post('/api/agreement/update', data)
}

/**
 * 获取协议版本信息
 * @param {string} type - 协议类型
 * @returns {Promise} 返回版本信息
 */
export function getAgreementVersion(type) {
  return request.get('/api/agreement/version', { type })
}
