import SystemInfo from '../../../utils/system'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    chatInfo: {
      name: '沈川寒',
      avatar: 'https://img.zcool.cn/community/01c8b25e8f8f8da801219c779e8c95.jpg@1280w_1l_2o_100sh.jpg'
    },
    // 今日对话
    todayChat: {
      used: 0,
      total: 100
    },
    // 对话模式
    chatMode: {
      baseModel: 'default', // default: 默认角色扮演模型
      deepThinking: false, // 深度思考模型
      longConversation: false // 长对话模式
    },
    // 智能体记忆力
    memory: {
      general: 32 // 一般记忆 0-100
    },
    // 聊天背景
    chatBackground: {
      id: 'default',
      name: '默认背景',
      image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png'
    },
    // 背景列表
    backgroundList: [
      {
        id: 'default',
        name: '默认背景',
        image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png'
      },
      {
        id: 'bg1',
        name: '星空',
        image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png'
      },
      {
        id: 'bg2',
        name: '森林',
        image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png'
      }
    ]
  },

  // 防抖定时器
  memoryDebounceTimer: null,
  // 记忆力滑块的原始值（用于失败回滚）
  memoryOriginalValue: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取传递的参数
    if (options.roleId) {
      this.loadChatSettings(options.roleId)
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  /**
   * 加载对话设定
   */
  loadChatSettings(roleId) {
    // TODO: 调用接口获取已保存的对话设定
    console.log('加载对话设定:', roleId)
  },

  /**
   * 提升对话上限
   */
  onUpgradeLimit() {
    // TODO: 跳转到VIP页面或显示升级弹窗
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  /**
   * 切换基础模型
   */
  onBaseModelChange(event) {
    const model = event.currentTarget.dataset.model
    this.setData({
      'chatMode.baseModel': model
    })
    this.saveChatSettings()
  },

  /**
   * 切换深度思考模型
   */
  async onDeepThinkingChange(event) {
    const newValue = event.detail.value
    const oldValue = this.data.chatMode.deepThinking
    
    this.setData({
      'chatMode.deepThinking': newValue
    })
    
    const success = await this.saveChatSettings()
    if (!success) {
      // 请求失败，回滚状态
      this.setData({
        'chatMode.deepThinking': oldValue
      })
    }
  },

  /**
   * 切换长对话模式
   */
  async onLongConversationChange(event) {
    const newValue = event.detail.value
    const oldValue = this.data.chatMode.longConversation
    
    this.setData({
      'chatMode.longConversation': newValue
    })
    
    const success = await this.saveChatSettings()
    if (!success) {
      // 请求失败，回滚状态
      this.setData({
        'chatMode.longConversation': oldValue
      })
    }
  },

  /**
   * 记忆力滑块变化（带防抖）
   */
  onMemoryChange(event) {
    const value = event.detail.value
    
    // 如果是第一次滑动，保存原始值
    if (this.memoryOriginalValue === null) {
      this.memoryOriginalValue = this.data.memory.general
    }
    
    this.setData({
      'memory.general': value
    })
    
    // 清除之前的定时器
    if (this.memoryDebounceTimer) {
      clearTimeout(this.memoryDebounceTimer)
    }
    
    // 设置新的定时器，800ms后执行保存
    this.memoryDebounceTimer = setTimeout(async () => {
      const success = await this.saveChatSettings()
      if (!success && this.memoryOriginalValue !== null) {
        // 请求失败，回滚到原始状态
        this.setData({
          'memory.general': this.memoryOriginalValue
        })
      }
      // 重置原始值
      this.memoryOriginalValue = null
    }, 800)
  },

  /**
   * 记忆力滑块变化结束
   */
  async onMemoryChangeEnd(event) {
    // 清除防抖定时器
    if (this.memoryDebounceTimer) {
      clearTimeout(this.memoryDebounceTimer)
      this.memoryDebounceTimer = null
    }
    
    // 立即保存
    const success = await this.saveChatSettings()
    if (!success) {
      // 请求失败，回滚到原始值
      if (this.memoryOriginalValue !== null) {
        this.setData({
          'memory.general': this.memoryOriginalValue
        })
      }
      wx.showModal({
        title: '保存失败',
        content: '记忆力设置保存失败，已恢复原值',
        showCancel: false
      })
    }
    
    // 重置原始值
    this.memoryOriginalValue = null
  },

  /**
   * 专区唤起
   */
  onMemoryStrength() {
    // TODO: 跳转到记忆专区
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  /**
   * 选择聊天背景
   */
  onSelectBackground() {
    const backgroundSheet = this.selectComponent('#backgroundSheet')
    if (backgroundSheet) {
      backgroundSheet.show({
        title: '选择聊天背景',
        backgrounds: this.data.backgroundList,
        selectedId: this.data.chatBackground.id,
        onConfirm: (background) => {
          if (background) {
            this.setData({
              chatBackground: background
            })
            this.saveChatSettings()
          }
        }
      })
    }
  },

  /**
   * 保存设置（异步）
   * @returns {Promise<boolean>} 返回是否保存成功
   */
  async saveChatSettings() {
    try {
      wx.showLoading({
        title: '保存中...',
        mask: true
      })
      
      // TODO: 调用接口保存设置
      console.log('保存设置:', {
        chatMode: this.data.chatMode,
        memory: this.data.memory,
        chatBackground: this.data.chatBackground
      })
      
      // 模拟异步请求
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 模拟可能的失败情况（实际使用时删除这段）
      // if (Math.random() > 0.8) {
      //   throw new Error('网络错误')
      // }
      
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      })
      
      return true
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'error',
        duration: 2000
      })
      console.error('保存设置失败:', error)
      
      return false
    }
  },

  /**
   * 页面卸载时清理定时器
   */
  onUnload() {
    if (this.memoryDebounceTimer) {
      clearTimeout(this.memoryDebounceTimer)
      this.memoryDebounceTimer = null
    }
  }
})

