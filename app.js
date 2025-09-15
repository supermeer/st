import updateManager from './common/updateManager'
import request from './services/request/http'
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
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const path = currentPage.route
    return {
      title: 'yous X',
      path: `/${path}?isShare=true`, // 自动携带当前页面路径
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
    navHeight: 0, // 导航栏高度
    statusBarHeight: 0, // 状态栏高度
    menuButtonInfo: null, // 胶囊按钮信息
    contentHeight: 0 // 内容区域高度
  },
  onLaunch: function () {
    // 使用 westore 初始化用户登录态与信息
    userStore.initFromLocal()
    // 获取系统信息和导航栏高度
    this.getNavHeight()
  },
  onShow: function () {
    updateManager()
    // wx.navigateTo({
    //   url: '/pages/contentadd/index'
    // })
  },
  // 获取导航栏高度
  getNavHeight() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect()

      // 计算导航栏高度
      const statusBarHeight = systemInfo.statusBarHeight
      const navHeight =
        (menuButtonInfo.top - statusBarHeight) * 2 +
        menuButtonInfo.height +
        statusBarHeight

      // 设置到全局数据
      this.globalData.navHeight = navHeight
      this.globalData.statusBarHeight = statusBarHeight
      this.globalData.menuButtonInfo = menuButtonInfo
      this.globalData.contentHeight = systemInfo.windowHeight - navHeight

      return {
        navHeight,
        statusBarHeight,
        menuButtonInfo,
        contentHeight: systemInfo.windowHeight - navHeight
      }
    } catch (e) {
      console.error('获取导航栏高度失败', e)
      return null
    }
  }
})
