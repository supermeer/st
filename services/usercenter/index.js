import request from '../request/http'
import { config } from '../../config/index'

/**
 * 微信登录
 * @param {Object} data - 登录参数
 * @param {string} data.code - 微信登录code
 * @returns {Promise}
 */
export function login(data) {
  return request.post('/api/v1/auth/wx/login', data)
}

/**
 * 绑定手机号
 * @param {Object} data - 绑定参数
 * @param {string} data.encryptedData - 包括敏感数据在内的完整用户信息的加密数据
 * @param {string} data.iv - 加密算法的初始向量
 * @param {string} data.code - 微信登录code
 * @returns {Promise}
 */
export function bindPhoneNumber(data) {
  if (config.useMock) {
    return mockBindPhoneNumber()
  }
  return request.post('/api/v1/user/user/bindingPhone', data)
}

export function getMyVipInfo() {
  return request.get('/api/v1/user/vip/getMyVipInfo')
}

export function redeemInviteCode(data) {
  return request.post(`/api/v1/user/vip/redeemInviteCode?invitationCode=${data.invitationCode}`, data)
}

export function getQuotaInfo() {
  return request.get('/api/v1/user/vip/getQuotaInfo')
}

// 1、用户服务协议  2、免责声明 3、隐私政策 4、小程序隐私保护指引
export function getAgreement(agreementType) {
  return request.get(
    `/api/v1/user/user/getAgreement?agreementType=${agreementType}`
  )
}

export function logoff() {
  return request.post('/api/v1/user/user/cancelAccount')
}

export function generateInvitationCode() {
  return request.post('/api/v1/user/user/generateInvitationCode')
}

export function getShareRecord() {
  return request.get('/api/v1/user/user/invitedUserList')
}

/**
 * 检查用户是否绑定手机号
 * @returns {Promise}
 */
export function checkPhoneStatus() {
  if (config.useMock) {
    return mockCheckPhoneStatus()
  }
  return request.get('/api/user/phone/status')
}

function mockBindPhoneNumber() {
  const { delay } = require('../_utils/delay')
  return delay().then(() => ({
    success: true,
    phoneNumber: '134****8888'
  }))
}

function mockCheckPhoneStatus() {
  const { delay } = require('../_utils/delay')
  return delay().then(() => ({
    hasBindPhone: false
  }))
}
