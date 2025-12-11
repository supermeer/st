import updateManager from './common/updateManager'
import { config } from "./config/index"
import userStore from './store/user'
// app.js（App() 外部）
const originalPage = Page
Page = function (pageConfig) {
  // 原始页面配置
  const originalOnShareAppMessage = pageConfig.onShareAppMessage
  // 全局注入分享配置
  pageConfig.onShareAppMessage = function () {
    // 使用原始的分享方法（如果存在）
    if (originalOnShareAppMessage) {
      return originalOnShareAppMessage.call(this)
    }

    // 获取当前页面路径
    // const pages = getCurrentPages()
    // const currentPage = pages[pages.length - 1]
    // const path = currentPage.route
    // return {
    //   title: '星语酒馆',
    //   path: `/${path}?isShare=true`, // 自动携带当前页面路径
    //   imageUrl: '/images/global-share.jpg'
    // }
    return {
      title: '星语酒馆',
      path: `/pages/home/home`, // 自动携带当前页面路径
      imageUrl: '/images/global-share.jpg'
    }
  }
  // 分享到朋友圈，不支持自定义path
  // pageConfig.onShareTimeline = function () {
  //   return {
  //     title: '朋友圈标题',
  //     query: 'id=123', // 参数通过query传递（仅限当前页面）
  //     imageUrl: '' // 自定义图片路径，可以是本地文件或者网络文件，支持png、jpg，图片长宽比1：1，默认使用小程序logo
  //   }
  // }
  // 调用原始Page方法
  originalPage(pageConfig)
}

App({
  globalData: {
    userInfo: {
      vipPackage: null,
      avatar: '/static/avatar.png',
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: ''
    },
    // 微信客服
    wxCustomerService: {
      // url: 'https://work.weixin.qq.com/kfid/kfcf1d68a9b8fe22358',
      url: 'https://work.weixin.qq.com/kfid/kfc4c8cfdf03c22699d',
      corpId: 'ww1e592fef17bb94fd'
    },
    tabbarHeight: 100,
    navHeight: 0, // 导航栏高度
    statusBarHeight: 0, // 状态栏高度
    safeAreaTop: 0,
    safeAreaBottom: 0,
    menuButtonInfo: null
  },
  onLaunch: function () {
    // 使用 westore 初始化用户登录态与信息
    userStore.initFromLocal()
  },
  onShow: function () {
    updateManager()
    // 获取系统信息和导航栏高度
    this.getNavHeight()
    if (!this.globalData.safeAreaBottom) {
      setTimeout(() => {
        this.getNavHeight()
      }, 300);
    }
    const accountInfo = wx.getAccountInfoSync();
    let aE = 0
    if (accountInfo.miniProgram.envVersion === 'release') {
      aE = 1
    }
    if (config.baseUrl === 'http://192.168.1.44:19000') {
      aE = 1
    }
    wx.setStorageSync('aE', aE)
  },
  // 获取导航栏高度
  getNavHeight() {
    try {
      const windowInfo = wx.getWindowInfo()
      const safeArea = windowInfo.safeArea
      this.globalData.safeAreaTop = safeArea.top
      const sb = (!!windowInfo.windowHeight && !!safeArea.bottom) ? (windowInfo.windowHeight - safeArea.bottom) : 0
      this.globalData.safeAreaBottom = sb
      this.globalData.statusBarHeight = safeArea.top
      this.globalData.navHeight = safeArea.top + 44
      this.globalData.tabbarHeight = 100
      return {
        safeAreaTop: this.globalData.safeAreaTop,
        safeAreaBottom: sb,
        statusBarHeight: this.globalData.statusBarHeight,
        navHeight: this.globalData.navHeight,
        tabbarHeight: this.globalData.tabbarHeight
      }
    } catch (e) {
      return {}
    }
  }
}) 
