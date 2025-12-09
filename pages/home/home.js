import SystemInfo from '../../utils/system'
import { getHomePlotMessage } from '../../services/ai/chat'
// "plugins": {
//   "WechatSI": {
//     "version": "0.3.1",
//     "provider": "wx069ba97219f66d99"
//   }
// }
// text() {
//   var plugin = requirePlugin('WechatSI')
//   let manager = plugin.getRecordRecognitionManager()
//   manager.onStop = function (res) {
//     console.log(res, 'onStop')
//   }
//   manager.onStart = function (res) {
//     console.log(res, 'onStart')
//   }
//   manager.onError = function (res) {
//     console.log(res, 'onError')
//   }
//   manager.start({ duration: 30000, lang: 'zh_CN' })
// },
// pages/home/home.js
Page({
  data: {
    isLogin: false,
    pageInfo: {},
    paddingBtm: 0,
    roleForm: {
      id: null,
      type: '',
      plotId: null
    },
    currentBg: null
  },
  onLoad() {
    const getPageInfo = () => {
      this.setData({
        pageInfo: { ...SystemInfo.getPageInfo(), ...this.data.pageInfo }
      })
      // calc({{pageInfo.safeAreaBottom}}px + {{pageInfo.tabbarHeight}}rpx);
      this.setData({
        paddingBtm: `calc(${this.data.pageInfo.safeAreaBottom || 47}px + ${this.data.pageInfo.tabbarHeight || 100}rpx)`
      })
    }
    getPageInfo()
    if (!this.data.pageInfo.safeAreaBottom) {
      setTimeout(() => {
        getPageInfo()
      }, 300);
    }
  },
  onShow() {
    this.getTabBar().init()
    this.getTabBar().setInterceptor(() => {
      if (!this.data.isLogin) {
        this.goLogin()
        return false
      }
      return true
    })
    const token = wx.getStorageSync('token')
    if (!token) {
      this.setData({ isLogin: false })
      const authRef =
        this.selectComponent('auth') || this.selectComponent('#auth')
      authRef && authRef.login()
      return
    }
    this.setData({ isLogin: true })
    this.getHomePlotMessage()
  },
  getHomePlotMessage() {
    getHomePlotMessage().then(res => {
      if (res.plotId && this.data.roleForm.plotId === res.plotId) {

        return
      }
      this.setData({
        roleForm: {
          type: res.type,
          id: res.characterId || null,
          plotId: res.plotId || null
        }
      })
    })
  },
  // 显式点击登录按钮
  goLogin() {
    const authRef =
      this.selectComponent('auth') || this.selectComponent('#auth')
    authRef && authRef.login()
  },
  loginSuccess() {
    this.setData({ isLogin: true })
    this.getHomePlotMessage()
  },
  hideTabbar() {
    this.setData({
      paddingBtm: 0
    })
    this.getTabBar().hide()
  },
  showTabbar() {
    this.setData({
      paddingBtm: `calc(${this.data.pageInfo.safeAreaBottom || 47}px + ${this.data.pageInfo.tabbarHeight || 100}rpx)`
    })
    this.getTabBar().show()
  },
  changePlot(event) {
    const { plotId, type, characterId } = event
    this.setData({
      roleForm: {
        ...this.data.roleForm,
        plotId: plotId,
        type: type,
        id: characterId
      }
    })
  },
  setCurrentBg(e) {
    this.setData({
      currentBg: e
    })
  },
})
