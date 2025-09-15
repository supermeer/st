/**
 * 协议相关工具函数
 */

/**
 * 跳转到协议页面
 * @param {string} type - 协议类型
 * @param {Object} options - 其他参数
 */
export function navigateToAgreement(type = 'service', options = {}) {
  const url = `/pages/vip/agreement/index?type=${type}`
  wx.navigateTo({
    url,
    ...options
  })
}

/**
 * 跳转到服务协议
 */
export function navigateToServiceAgreement() {
  navigateToAgreement('service')
}

/**
 * 跳转到隐私协议
 */
export function navigateToPrivacyAgreement() {
  navigateToAgreement('privacy')
}

/**
 * 跳转到隐私政策（别名，保持向后兼容）
 */
export function navigateToPrivacyPolicy() {
  navigateToAgreement('privacy')
}

/**
 * 跳转到用户协议
 */
export function navigateToUserAgreement() {
  navigateToAgreement('user')
}

/**
 * 跳转到VIP协议
 */
export function navigateToVipAgreement() {
  navigateToAgreement('vip')
}

/**
 * 跳转到自动续费协议
 */
export function navigateToRenewAgreement() {
  navigateToAgreement('renew')
}

/**
 * 协议类型映射
 */
export const AGREEMENT_TYPES = {
  SERVICE: 'service',
  PRIVACY: 'privacy',
  USER: 'user',
  VIP: 'vip',
  RENEW: 'renew'
}

/**
 * 协议类型名称映射
 */
export const AGREEMENT_NAMES = {
  [AGREEMENT_TYPES.SERVICE]: '服务协议',
  [AGREEMENT_TYPES.PRIVACY]: '隐私协议',
  [AGREEMENT_TYPES.USER]: '用户协议',
  [AGREEMENT_TYPES.VIP]: 'VIP协议',
  [AGREEMENT_TYPES.RENEW]: '自动续费协议'
}
