import SystemInfo from '../../utils/system'
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
    messageList: [],
    pageInfo: {},
    paddingBtm: 0,
    loadMoreCount: 0, // 记录加载次数
    maxLoadCount: 3 // 最多加载3次，之后显示没有更多
  },
  onLoad() {
    this.setData({
      pageInfo: { ...SystemInfo.getPageInfo(), ...this.data.pageInfo }
    })
    // calc({{pageInfo.safeAreaBottom}}px + {{pageInfo.tabbarHeight}}rpx);
    this.setData({
      paddingBtm: `calc(${this.data.pageInfo.safeAreaBottom}px + ${this.data.pageInfo.tabbarHeight}rpx)`
    })
    this.getMessageList()
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
  },
  // 显式点击登录按钮
  goLogin() {
    const authRef =
      this.selectComponent('auth') || this.selectComponent('#auth')
    authRef && authRef.login()
  },
  loginSuccess() {
    this.setData({ isLogin: true })
  },
  getMessageList() {
    const messageList = [
      
      {
        senderType: 1,
        id: 1,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        id: 2,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        id: 3,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        id: 4,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        id: 5,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        id: 6,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },
      {
        senderType: 2,
        id: 7,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      }
    ]
    this.setData({
      messageList
    })
    const chatComponent = this.selectComponent('.chat-container')
    if (chatComponent && chatComponent.getMsgListHandle) {
      chatComponent.getMsgListHandle(messageList)
    }
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
  },
  onLoadMore() {
    console.log('加载更多消息')
    const chatComponent = this.selectComponent('.chat-container')
    
    // 检查是否还有更多数据
    if (this.data.loadMoreCount >= this.data.maxLoadCount) {
      // 没有更多数据了
      if (chatComponent && chatComponent.noMoreHandle) {
        chatComponent.noMoreHandle()
      }
      return
    }
    
    // 模拟异步加载历史消息
    setTimeout(() => {
      // 在消息列表前面插入历史消息（旧消息）
      const newMsgs = []
      // 每次加载2条历史消息
      for (let i = 0; i < 2; i++) {
        newMsgs.push({
          senderType: 1,
          id: new Date().getTime() + i,
          content: `这是第${this.data.loadMoreCount + 1}次加载的历史消息 ${i + 1}：` + new Date().toLocaleTimeString()
        })
      }
      
      this.setData({
        messageList: [
          ...newMsgs,
          ...this.data.messageList
        ],
        loadMoreCount: this.data.loadMoreCount + 1
      })
      
      // 加载完成后，通知组件更新
      if (chatComponent && chatComponent.loadMoreHandle) {
        chatComponent.loadMoreHandle(newMsgs)
      }
    }, 1500) // 模拟网络延迟
  }
})
