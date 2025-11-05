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
    maxLoadCount: 3, // 最多加载3次，之后显示没有更多
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
    ] 
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
    // wx.navigateTo({
    //   url: '/pages/common/pic-generate/index',
    // })
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
        senderType: 2,
        id: 1,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 2,
        id: 2,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 2,
        id: 3,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 2,
        id: 4,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 2,
        id: 5,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 2,
        id: 6,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },
      {
        senderType: 1,
        id: 7,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },
      {
        senderType: 2,
        id: 8,
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
          senderType: 2,
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
  },
  
  // 测试思考过程功能
  testThinkingProcess() {
    
    // const backgroundSheet = this.selectComponent('#backgroundSheet')
    
    // backgroundSheet.show({
    //   title: '聊天背景',
    //   backgrounds: this.data.backgrounds,
    //   selectedId: this.data.currentBackgroundId,
    //   cancelText: '创建专属背景',
    //   confirmText: '设为背景',
    //   onCancel: () => {
    //     console.log('用户取消选择')
    //   },
    //   onConfirm: (selectedBackground) => {
    //     if (selectedBackground) {
    //       console.log('选中的背景:', selectedBackground)
    //       this.setData({
    //         currentBackgroundId: selectedBackground.id
    //       })
    //       // 保存到本地存储或服务器
    //       wx.setStorageSync('chatBackground', selectedBackground.id)
    //     }
    //   }
    // })
    // return
    const chatComponent = this.selectComponent('.chat-container')
    // chatComponent.messageError('网络连接失败，请稍后重试')
    // console.log(this.data.messageList, 'messageList..................')
    // return
    if (!chatComponent) return
    
    // 1. 添加用户消息
    chatComponent.addUserMessage('请帮我分析一下如何提升用户体验')
    
    // 2. 添加 AI 消息（初始为 loading 状态）
    chatComponent.addAIMessage()
    
    // 3. 模拟后端返回带有 <think> 标签的流式内容
    const fullResponse = `<think>
让我仔细思考一下这个问题...

首先，用户体验（UX）是一个多维度的概念，包括：
- 界面设计的美观性
- 交互的流畅性
- 功能的易用性
- 响应速度
- 用户反馈机制

我需要从这几个方面给出具体的建议。
</think>

关于提升用户体验，我有以下几点建议：

## 1. 界面设计优化
- **简洁明了**：避免过度设计，保持界面简洁
- **视觉层次**：合理使用颜色、大小、间距来建立视觉层次
- **一致性**：保持整个应用的设计风格统一

## 2. 交互体验提升
- **即时反馈**：用户操作后立即给予反馈
- **流畅动画**：使用自然的过渡动画
- **容错设计**：提供撤销、确认等机制

## 3. 性能优化
- **快速加载**：优化资源加载速度
- **响应迅速**：减少操作延迟
- **离线支持**：关键功能支持离线使用

## 4. 用户引导
- **新手教程**：为新用户提供引导
- **帮助文档**：完善的帮助系统
- **智能提示**：(在合适的时机给予提示)

希望这些"建议"对你有帮助！`
    
    let currentIndex = 0
    let isInThinking = false
    let thinkingEnded = false
    
    // 4. 模拟流式输出（更真实的流式效果）
    const streamChunk = () => {
      if (currentIndex >= fullResponse.length) {
        // 5. 完成消息
        chatComponent.finishMessage()
        return
      }
      
      // 检测是否在思考过程中
      const currentContent = fullResponse.slice(0, currentIndex)
      if (currentContent.includes('<think>') && !currentContent.includes('</think>')) {
        isInThinking = true
      } else if (currentContent.includes('</think>')) {
        isInThinking = false
        thinkingEnded = true
      }
      
      // 根据不同阶段调整输出速度和块大小
      let chunkSize, delay
      
      if (isInThinking) {
        // 思考阶段：较慢，模拟深度思考
        chunkSize = Math.floor(Math.random() * 3) + 2  // 2-4 个字符
        delay = Math.floor(Math.random() * 40) + 60    // 60-100ms 延迟
      } else {
        // 正式回复阶段：较快，模拟流畅输出
        chunkSize = Math.floor(Math.random() * 8) + 5  // 5-12 个字符
        delay = Math.floor(Math.random() * 30) + 30    // 30-60ms 延迟
      }
      
      // 特殊处理：标签完整输出
      const remaining = fullResponse.slice(currentIndex)
      if (remaining.startsWith('<think>')) {
        chunkSize = 7  // 完整输出 <think>
      } else if (remaining.startsWith('</think>')) {
        chunkSize = 8  // 完整输出 </think>
        delay = 100    // 思考结束后稍微停顿
      }
      
      // 输出当前块
      const chunk = fullResponse.slice(currentIndex, currentIndex + chunkSize)
      chatComponent.updateStreamMessage(chunk)
      currentIndex += chunkSize
      
      // 继续下一块
      setTimeout(streamChunk, delay)
    }
    
    // 开始流式输出（初始延迟模拟网络请求）
    setTimeout(() => {
      streamChunk()
    }, 300)
  }
})
