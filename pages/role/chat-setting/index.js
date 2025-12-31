import SystemInfo from '../../../utils/system'
import Message from 'tdesign-miniprogram/message/index';
import { getPlotDetail, updatePlot, getMemoryType } from '../../../services/ai/chat'
import { QUOTE_GRADIENT_OPTIONS } from '../../../utils/msgHandler'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    keepFullScreen: false,
    quoteGradientName: '金青渐变',
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
    backgroundList: [],
    showUploader: false,
    // 记忆力说明遮罩层
    showMemoryDescOverlay: false,
    // 记忆选项列表
    memoryOptions: []
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
    this.getMemoryType()
  },
  onShow() {
    const savedId = wx.getStorageSync('quoteGradient') || 'gold-cyan'
    const option = QUOTE_GRADIENT_OPTIONS.find(opt => opt.id === savedId)
    this.setData({
      keepFullScreen: wx.getStorageSync('alwaysFullScreen') === 'true',
      quoteGradientName: option ? option.name : '金青渐变'
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

  getMemoryType() {
    return getMemoryType().then(res => {
      this.setData({
        memoryOptions: res || []
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
    
    this.setData({
      'plotInfo.ifReasoning': !this.data.plotInfo.ifReasoning
    })
    
    const success = await this.saveChatSettings()
    if (!success) {
      // 请求失败，回滚状态
      this.setData({
        'plotInfo.ifReasoning': this.data.plotInfo.ifReasoning
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
   * 记忆加强弹窗
   */
  onMemoryStrength() {
    const memorySheet = this.selectComponent('#memorySheet')
    if (memorySheet) {
      memorySheet.show({
        currentCount: this.data.plotInfo.memoryCount,
        plotId: this.data.plotInfo.id,
        memoryOptions: [...this.data.memoryOptions],
        onConfirm: async (count) => {
          try {
            wx.showLoading({
              title: '保存中...',
              mask: true
            })
            await updatePlot({
              id: this.data.plotInfo.id,
              memoryCount: count
            })
            this.setData({
              'plotInfo.memoryCount': count
            })
            wx.hideLoading()
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1200
            })
          } catch (error) {
            wx.hideLoading()
            wx.showToast({
              title: '保存失败',
              icon: 'error',
              duration: 1500
            })
            console.error('更新记忆选项失败:', error)
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

    this.setData({
      showUploader: true
    })


    // const backgroundSheet = this.selectComponent('#backgroundSheet')
    // if (backgroundSheet) {
    //   backgroundSheet.show({
    //     title: '聊天背景',
    //     // cancelText: '创建专属背景',
    //     confirmText: '设为背景',
    //     backgrounds: this.data.backgroundList,
    //     selectedId: this.data.chatBackground.id,
    //     onConfirm: (background) => {
    //       if (background) {
    //         this.setData({
    //           chatBackground: background
    //         })
    //         this.saveChatSettings()
    //       }
    //     },
    //     onCancel: () => {
    //       // wx.navigateTo({
    //       //   url: '/pages/common/pic-generate/index'
    //       // })
    //     }
    //   })
    // }
  },

  async onUploadSuccess(e) {
    const { tempFilePath, signature } = e.detail
    
    this.setData({
      showUploader: false
    })
    await updatePlot({
      id: this.data.plotInfo.id,
      backgroundImage: signature.uploadUrl.split('?')[0]
    })
    this.setData({
      currentBg: tempFilePath
    })
  },

  onUploadFail(e) {
    const { message } = e
    wx.showToast({ title: message, icon: 'none' })
    this.setData({ showUploader: false })
  },

  onUploadCancel() {
    this.setData({ showUploader: false })
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

  onSwitchChange(e) {
    const { value } = e.detail
    this.setData({
      keepFullScreen: value
    })
    wx.setStorageSync('alwaysFullScreen', value ? 'true' : 'false')
  },

  onGradientPicker() {
    wx.showActionSheet({
      itemList: QUOTE_GRADIENT_OPTIONS.map(opt => opt.name),
      success: (res) => {
        const selected = QUOTE_GRADIENT_OPTIONS[res.tapIndex]
        if (selected) {
          wx.setStorageSync('quoteGradient', selected.id)
          this.setData({
            quoteGradientName: selected.name
          })
          wx.showToast({
            title: '已切换为' + selected.name,
            icon: 'none'
          })
        }
      }
    })
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

