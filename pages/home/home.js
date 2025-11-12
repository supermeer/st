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
    backgrounds: [
      {
        id: 1,
        name: '背景1',
        image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
      },
      {
        id: 2,
        name: '背景2',
        image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
      },
      {
        id: 3,
        name: '背景3',
        image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
      },
      {
        id: 4,
        name: '背景4',
        image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
      },
      {
        id: 5,
        name: '背景5',
        image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
      },
      {
        id: 6,
        name: '背景6',
        image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
      },
    ],
    roleForm: {
      id: null,
      type: '',
      plotId: null
    } 
  },
  onLoad() {
    this.setData({
      pageInfo: { ...SystemInfo.getPageInfo(), ...this.data.pageInfo }
    })
    // calc({{pageInfo.safeAreaBottom}}px + {{pageInfo.tabbarHeight}}rpx);
    this.setData({
      paddingBtm: `calc(${this.data.pageInfo.safeAreaBottom}px + ${this.data.pageInfo.tabbarHeight}rpx)`
    })
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
      paddingBtm: `calc(${this.data.pageInfo.safeAreaBottom}px + ${this.data.pageInfo.tabbarHeight}rpx)`
    })
    this.getTabBar().show()
  }
})
