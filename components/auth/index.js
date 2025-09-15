import {
  login,
  bindPhoneNumber,
  checkPhoneStatus
} from '../../services/usercenter/index'
import { config } from '../../config/index'
import { Toast } from 'tdesign-miniprogram'
import userStore from '../../store/user'

Component({
  properties: {
    checkPhone: {
      type: Boolean,
      value: true
    }
  },
  data: {
    visible: false,
    phoneLogin: false, // 是否显示手机号绑定
    // 登录中
    loggingInfo: {
      logging: false,
      text: '登录中',
      logErr: false
    }
  },
  lifetimes: {
    attached: function () {
      // 不在挂载时自动登录，保持为显式触发
    }
  },
  methods: {
    close() {
      this.setData({ visible: false })
    },

    show() {
      this.setData({
        visible: true,
        phoneLogin: false
      })
    },
    login() {
      this.setData({
        loggingInfo: {
          logging: true,
          text: '登录中',
          logErr: false
        },
        phoneLogin: false,
        visible: true
      })
      userStore.setLoginMark(true)
      wx.login({
        success: (res) => {
          if (res.code) {
            login({ code: config.useMock ? 'test' : res.code })
              .then((result) => {
                userStore.setLoginSuccess(result)
                let tempPhoneLogin = false
                if (this.data.checkPhone && !result.user.phone) {
                  tempPhoneLogin = true
                } else {
                  this.triggerEvent('loginSuccess')
                }
                this.setData({
                  loggingInfo: {
                    logging: false,
                    text: '登录成功',
                    logErr: false
                  },
                  visible: tempPhoneLogin ? true : false,
                  phoneLogin: tempPhoneLogin
                })
              })
              .catch((error) => {
                this.setData({
                  loggingInfo: {
                    logging: false,
                    text: '登录失败',
                    logErr: true
                  }
                })
              })
              .finally(() => {
                userStore.setLoginMark(false)
              })
          } else {
            this.setData({
              loggingInfo: {
                logging: false,
                text: '登录中',
                logErr: true
              }
            })
            userStore.setLoginMark(false)
          }
        },
        fail: () => {
          this.setData({
            loggingInfo: {
              logging: false,
              text: '登录中',
              logErr: true
            }
          })
          userStore.setLoginMark(false)
        }
      })
    },

    // 显示手机号绑定界面
    showPhoneLogin(loginData) {
      this.setData({
        visible: true,
        phoneLogin: true,
        loginData
      })
    },
    // 获取手机号
    onGetPhoneNumber(e) {
      if (e.detail.errMsg !== 'getPhoneNumber:ok') {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '获取手机号失败，请重试'
        })
        return
      }
      bindPhoneNumber({
        code: e.detail.code,
        invitationCode: e.invitationCode || undefined
      })
        .then((res) => {
          userStore.updateUser({
            phone: res
          })
          this.triggerEvent('loginSuccess')
          this.triggerEvent('bindPhoneSuccess')
          this.close()
        })
        .catch((error) => {
          Toast({
            context: this,
            selector: '#t-toast',
            message: error.message || '绑定手机号失败，请重试'
          })
        })
    },

    close() {
      this.setData({
        visible: false,
        phoneLogin: false
      })
    },

    // 检查登录状态
    checkLoginStatus() {
      const token = wx.getStorageSync('token')

      if (!token) {
        // 没有token，显示登录界面
        this.show()
        return Promise.resolve(false)
      }

      // 检查是否绑定手机号
      return checkPhoneStatus()
        .then((res) => {
          if (!res.hasBindPhone) {
            // 需要绑定手机号，显示手机号绑定界面
            wx.login({
              success: (loginRes) => {
                if (loginRes.code) {
                  this.showPhoneLogin({
                    code: loginRes.code
                  })
                }
              }
            })
            return false
          }
          return true
        })
        .catch(() => {
          // 接口请求失败，默认未登录
          this.show()
          return false
        })
    }
  }
})
