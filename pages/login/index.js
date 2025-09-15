import { Toast } from 'tdesign-miniprogram'
import { login as wxLoginApi } from '../../services/usercenter/index'
import {
  navigateToServiceAgreement,
  navigateToPrivacyPolicy
} from '../../utils/agreement'
import userStore from '../../store/user'

Page({
  data: {
    agreement: false
  },

  login() {
    if (!this.data.agreement) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请阅读并勾选用户协议'
      })
      return
    }

    wx.login({
      success: (res) => {
        if (res.code) {
          wxLoginApi({ code: res.code })
            .then((result) => {
              userStore.setLoginSuccess(result)
              // 返回上一页或者跳转首页
              if (getCurrentPages().length > 1) {
                wx.navigateBack()
              } else {
                wx.switchTab?.({ url: '/pages/home/home' }) ||
                  wx.reLaunch({ url: '/pages/home/home' })
              }
            })
            .catch((error) => {
              Toast({
                context: this,
                selector: '#t-toast',
                message: error?.message || '登录失败，请稍后重试'
              })
            })
        }
      },
      fail: () => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '登录失败，请检查网络后重试'
        })
      }
    })
  },
  agreementChange(e) {
    this.setData({
      agreement: e.detail.checked
    })
  },

  onLoad() {},
  onShow() {},
  navigateToServiceAgreement() {
    navigateToServiceAgreement()
  },
  navigateToPrivacyPolicy() {
    navigateToPrivacyPolicy()
  },

  init() {
    this.fetUseriInfoHandle?.()
  }
})
