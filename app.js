import updateManager from './common/updateManager'
import { config } from './config/index'
import userStore from './store/user'
import { generateInvitationCode, visitPages } from './services/usercenter/index'
// app.js（App() 外部）
let _isFirstAppShow = true  // 首次启动标志
let _appWasHidden = false   // App 进入后台标志
let _pendingLockCheck = false // 待处理的锁屏检测

function checkAndShowLock() {
  const lockEnabled = wx.getStorageSync('lockEnabled')
  if (!lockEnabled) return false
  const pages = getCurrentPages()
  if (pages.length === 0) return false
  const currentRoute = pages[pages.length - 1].route
  if (currentRoute === 'pages/lock/index' || currentRoute === 'pages/lock/set/index') return false
  wx.navigateTo({ url: '/pages/lock/index' })
  return true
}

const originalPage = Page
Page = function (pageConfig) {
  // 全局注入锁屏检查：仅在 _pendingLockCheck 为 true 时触发（首次启动或从后台返回）
  const originalOnShow = pageConfig.onShow
  pageConfig.onShow = function () {
    if (_pendingLockCheck) {
      _pendingLockCheck = false
      if (checkAndShowLock()) return
    }
    if (originalOnShow) originalOnShow.call(this)
  }
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
    inviteCode: '',
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
    let pageLog = wx.getStorageSync('pageLog')
    if (pageLog !== 'DONE') {
      !pageLog && (pageLog = [])
      wx.onAppRoute((res) => {
        console.log(res, '========')
        if (pageLog.length >= 10) {
          wx.setStorageSync('pageLog', 'DONE')
          return
        }
        pageLog.push(res.page.window.navigationBarTitleText)
        if (
          pageLog.length == 2 ||
          pageLog.length == 5 ||
          pageLog.length == 10
        ) {
          // 上报
          visitPages({
            count: pageLog.length,
            pages: pageLog
          })
        }
        wx.setStorageSync('pageLog', pageLog)
      })
    }
    // 使用 westore 初始化用户登录态与信息
    userStore.initFromLocal()
  },
  onShow: function () {
    // 屏幕锁检测：仅在首次启动或 App 从后台返回时触发
    if (_isFirstAppShow || _appWasHidden) {
      _isFirstAppShow = false
      _appWasHidden = false
      const pages = getCurrentPages()
      if (pages.length === 0) {
        // 页面尚未加载，延迟到第一个页面 onShow 处理
        _pendingLockCheck = true
      } else {
        if (checkAndShowLock()) return
      }
    }
    updateManager()
    // 获取系统信息和导航栏高度
    this.getNavHeight()
    let activeMark = wx.getStorageSync('activeMark')
    if (!activeMark) {
      activeMark = 1
    } else if (activeMark < 7) {
      activeMark++
    }
    wx.setStorageSync('activeMark', activeMark)
    if (!this.globalData.safeAreaBottom) {
      setTimeout(() => {
        this.getNavHeight()
      }, 300)
    }
    const accountInfo = wx.getAccountInfoSync()
    let aE = 0
    if (accountInfo.miniProgram.envVersion === 'release') {
      aE = 1
    }
    if (
      config.baseUrl === 'http://192.168.1.44:19000' ||
      config.baseUrl === 'http://10.0.106.58:19000' ||
      config.baseUrl === 'https://www.yours-x.com/character-test'
    ) {
      aE = 1
    }
    wx.setStorageSync('aE', aE)
  },
  onHide: function () {
    _appWasHidden = true
  },
  async getInviteCode() {
    return new Promise(async (res, rej) => {
      let inviteCode = wx.getStorageSync('inviteCode')
      if (!inviteCode || inviteCode.length == 0) {
        const res = await generateInvitationCode()
        inviteCode = res.invitationCode
        wx.setStorageSync('inviteCode', inviteCode)
      }
      res(inviteCode)
    })
  },
  // 获取导航栏高度
  getNavHeight() {
    try {
      const windowInfo = wx.getWindowInfo()
      const statusBarHeight = windowInfo.statusBarHeight
      const safeArea = windowInfo.safeArea
      this.globalData.safeAreaTop = safeArea.top
      const sb =
        !!windowInfo.windowHeight && !!safeArea.bottom
          ? windowInfo.windowHeight - safeArea.bottom
          : 0
      this.globalData.safeAreaBottom = sb
      this.globalData.statusBarHeight = statusBarHeight
      this.globalData.navHeight = statusBarHeight + 44
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
