import userStore from '../../store/user'
Page(
  Object.assign({}, userStore.data, {
    data: {
      // 聊天列表数据
      chatList: []
    },
    onLoad: function () {
      userStore.bind(this)
    },
    onShow: function () {
      // 更新 tabBar 高亮状态
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().init()
      }
      // 加载聊天列表
      this.loadChatList()
    },
    
    /**
     * 加载聊天列表
     */
    loadChatList() {
      // TODO: 调用接口获取聊天列表
      console.log('加载聊天列表')
    },
    
    /**
     * 点击聊天项，进入聊天会话
     */
    onChatItemClick(e) {
      const { id } = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/chat/session/index?id=${id}`
      })
    }
  })
)

