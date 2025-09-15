/**
 * 协议页面测试示例
 * 展示如何在不同场景下使用协议页面
 */

import {
  navigateToAgreement,
  navigateToServiceAgreement,
  navigateToPrivacyAgreement,
  navigateToUserAgreement,
  navigateToVipAgreement,
  navigateToRenewAgreement,
  AGREEMENT_TYPES
} from '../../../utils/agreement'

// 示例1：在按钮点击事件中跳转到协议页面
function handleAgreementClick() {
  // 跳转到服务协议
  navigateToServiceAgreement()
}

// 示例2：根据用户选择跳转到不同协议
function handleAgreementTypeSelect(type) {
  switch (type) {
    case 'service':
      navigateToServiceAgreement()
      break
    case 'privacy':
      navigateToPrivacyAgreement()
      break
    case 'user':
      navigateToUserAgreement()
      break
    case 'vip':
      navigateToVipAgreement()
      break
    case 'renew':
      navigateToRenewAgreement()
      break
    default:
      navigateToServiceAgreement()
  }
}

// 示例3：在表单验证失败时跳转到协议页面
function handleFormValidation() {
  const hasAgreed = false // 模拟用户未同意协议

  if (!hasAgreed) {
    wx.showModal({
      title: '提示',
      content: '请先阅读并同意用户协议',
      confirmText: '查看协议',
      success: (res) => {
        if (res.confirm) {
          navigateToUserAgreement()
        }
      }
    })
    return false
  }

  return true
}

// 示例4：在VIP购买页面跳转到相关协议
function handleVipPurchase() {
  wx.showActionSheet({
    itemList: ['查看VIP协议', '查看自动续费协议', '查看服务协议'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          navigateToVipAgreement()
          break
        case 1:
          navigateToRenewAgreement()
          break
        case 2:
          navigateToServiceAgreement()
          break
      }
    }
  })
}

// 示例5：使用通用跳转函数
function handleCustomAgreement() {
  // 可以传入自定义的协议类型
  navigateToAgreement('custom', {
    success: () => {
      console.log('跳转成功')
    },
    fail: (err) => {
      console.error('跳转失败', err)
    }
  })
}

// 示例6：在页面加载时检查协议版本
async function checkAgreementVersion() {
  try {
    // 这里可以调用API检查协议版本
    // const version = await getAgreementVersion('service')

    // 如果版本过期，提示用户查看新协议
    wx.showModal({
      title: '协议更新',
      content: '用户协议已更新，请查看最新版本',
      confirmText: '查看',
      success: (res) => {
        if (res.confirm) {
          navigateToUserAgreement()
        }
      }
    })
  } catch (error) {
    console.error('检查协议版本失败:', error)
  }
}

// 导出示例函数
export {
  handleAgreementClick,
  handleAgreementTypeSelect,
  handleFormValidation,
  handleVipPurchase,
  handleCustomAgreement,
  checkAgreementVersion
}
