import SystemInfo from '../../../utils/system'
import Message from 'tdesign-miniprogram/message/index';
import { getPlotDetail, updatePlot } from '../../../services/ai/chat'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    roleInfo: {
      id: null,
      name: '',
      avatar: ''
    },
    plotInfo: {
      totalMemory: 30,
      name: '',
      avatar: '',
      id: null,
      ifReasoning: false,
      memoryCount: 0,
      memoryLevel: 'basic' // 记忆等级：basic, good, deep, super
    },
    currentBg: '',
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
    ],
    // 记忆力说明遮罩层
    showMemoryDescOverlay: false
  },

  // 防抖定时器
  memoryDebounceTimer: null,
  // 记忆力滑块的原始值（用于失败回滚）
  memoryOriginalValue: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.plotId) {
      this.setData({
        plotInfo: {
          ...this.data.plotInfo,
          id: options.plotId
        }
      })
      this.getPlotInfo(options.plotId)
    }
    if (options.roleName) {
      this.setData({
        roleInfo: {
          ...this.data.roleInfo,
          name: options.roleName
        }
      })
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  getPlotInfo(plotId) {
    getPlotDetail(plotId).then(res => {
      this.setData({
        plotInfo: {
          ...this.data.plotInfo,
          ...res
        },
        currentBg: res.backgroundImage
      })
    })
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
    const newValue = event.detail.checked
    const oldValue = this.data.plotInfo.ifReasoning
    
    this.setData({
      'plotInfo.ifReasoning': newValue
    })
    
    const success = await this.saveChatSettings()
    if (!success) {
      // 请求失败，回滚状态
      this.setData({
        'plotInfo.ifReasoning': oldValue
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

  onMemoryDesc() {
    this.setData({
      showMemoryDescOverlay: true
    })
  },

  onCloseMemoryDesc() {
    this.setData({
      showMemoryDescOverlay: false
    })
  },

  /**
   * 记忆力滑块变化（带防抖）
   */
  onMemoryChange(event) {
    const value = event.detail.value
    
    // 如果是第一次滑动，保存原始值
    if (this.memoryOriginalValue === null) {
      this.memoryOriginalValue = this.data.plotInfo.memoryCount
    }
    
    this.setData({
      'plotInfo.memoryCount': value
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
          'plotInfo.memoryCount': this.memoryOriginalValue
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
          'plotInfo.memoryCount': this.memoryOriginalValue
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
   * 记忆加强弹窗
   */
  onMemoryStrength() {
    const memorySheet = this.selectComponent('#memorySheet')
    if (memorySheet) {
      memorySheet.show({
        title: '记忆力增强',
        subtitle: '最大对话长度，将影响每次对话所消耗的积分值。',
        selectedId: this.data.plotInfo.memoryLevel || 'basic',
        onConfirm: async (option) => {
          const oldLevel = this.data.plotInfo.memoryLevel
          this.setData({
            'plotInfo.memoryLevel': option.id
          })
          const success = await this.saveMemoryLevel(option.id)
          if (!success) {
            // 保存失败，回滚
            this.setData({
              'plotInfo.memoryLevel': oldLevel
            })
          }
        }
      })
    }
  },

  /**
   * 保存记忆等级
   */
  async saveMemoryLevel(memoryLevel) {
    try {
      wx.showLoading({
        title: '保存中...',
        mask: true
      })

      await updatePlot({
        id: this.data.plotInfo.id,
        memoryLevel
      })
      
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
      console.error('保存记忆等级失败:', error)
      
      return false
    }
  },

  /**
   * 选择聊天背景
   */
  onSelectBackground() {
    const backgroundSheet = this.selectComponent('#backgroundSheet')
    if (backgroundSheet) {
      backgroundSheet.show({
        title: '聊天背景',
        cancelText: '创建专属背景',
        confirmText: '设为背景',
        backgrounds: this.data.backgroundList,
        selectedId: this.data.chatBackground.id,
        onConfirm: (background) => {
          if (background) {
            this.setData({
              chatBackground: background
            })
            this.saveChatSettings()
          }
        },
        onCancel: () => {
          wx.navigateTo({
            url: '/pages/common/pic-generate/index'
          })
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

      await updatePlot({
        id: this.data.plotInfo.id,
        ifReasoning: this.data.plotInfo.ifReasoning,
        memoryCount: this.data.plotInfo.memoryCount
      })
      
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

