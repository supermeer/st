import SystemInfo from '../../../utils/system'
import { getCharacterDetail, getStoryDetail } from '../../../services/role/index'
import { getPlotDetail, updatePlot } from '../../../services/ai/chat'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    roleInfo: {
      id: null,
      name: '',
      isSystem: false,
      gender: '',
      avatarUrl: '',
      description: '',
      tags: []
    },
    storyInfo: {
      id: null,
      prologue: '', //开场白
    },
    plotInfo: {
      id: null,
      title: '暂无',
      totalMemory: 30,
      memoryCount: 0,
      chatStyle: {
        id: null,
        title: ''
      },
      persona: {
      },
    },
    scrollTop: 0,
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    currentTab: '1',
    memoryValue: 23,
    // 文本折叠控制
    descriptionExpanded: false,
    descriptionNeedFold: false,
    descriptionDisplay: '',
    prologueExpanded: false,
    prologueNeedFold: false,
    prologueDisplay: ''
  },

  // 防抖定时器（记忆力滑块）
  memoryDebounceTimer: null,
  // 记忆力滑块原始值（失败回滚用）
  memoryOriginalValue: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取传递的参数
    if (options.characterId) {
      this.setData({
        roleInfo: {
          ...this.data.roleInfo,
          id: options.characterId
        }
      })
    }
    if (options.storyId) {
      this.setData({
        storyInfo: {
          ...this.data.storyInfo,
          id: options.storyId
        }
      })
    }
    if (options.plotId) {
      this.setData({
        plotInfo: {
          ...this.data.plotInfo,
          id: options.plotId
        }
      })
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  onShow() {
    if (this.data.roleInfo.id) {
      this.loadRoleDetail(this.data.roleInfo.id)
    }
    if (this.data.storyInfo.id) {
      this.loadStoryDetail(this.data.storyInfo.id)
    }
    if (this.data.plotInfo.id) {
      this.loadPlotDetail(this.data.plotInfo.id)
    }
  },
  loadRoleDetail(id) {
    getCharacterDetail(id).then(res => {
      const merged = {
        ...this.data.roleInfo,
        ...res
      }
      const desc = merged.description || ''
      const needFold = desc.length > 120
      const display = needFold && !this.data.descriptionExpanded ? desc.slice(0, 120) + '…' : desc
      this.setData({
        roleInfo: merged,
        descriptionNeedFold: needFold,
        descriptionDisplay: display
      })
      if (!this.data.plotInfo.id) {
        this.setData({
          plotInfo: {
            ...this.data.plotInfo,
            ...res.defaultChatStyleDetail,
            id: null
          }
        })
      }
    })
  },
  loadStoryDetail(id) {
    getStoryDetail(id).then(res => {
      const merged = {
        ...this.data.storyInfo,
        ...res
      }
      const pro = merged.prologue || ''
      const needFold = pro.length > 120
      const display = needFold && !this.data.prologueExpanded ? pro.slice(0, 120) + '…' : pro
      this.setData({
        storyInfo: merged,
        prologueNeedFold: needFold,
        prologueDisplay: display
      })
    })
  },
  loadPlotDetail(id) {
    getPlotDetail(id).then(res => {
      this.setData({
        plotInfo: {
          ...this.data.plotInfo,
          ...res
        }
      })
    })
  },
  onTabChange(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab == 3) {
      wx.navigateTo({
        url: `/pages/role/story/index?roleId=${this.data.roleInfo.id}`
      })
      return
    }
    this.setData({ currentTab: tab })
  },
  memoryChange(e) {
    const value = e.detail.value

    // 首次滑动时记录原始值
    if (this.memoryOriginalValue === null) {
      this.memoryOriginalValue = this.data.plotInfo.memoryCount
    }

    // 先更新本地展示
    this.setData({
      'plotInfo.memoryCount': value
    })

    // 防抖保存
    if (this.memoryDebounceTimer) {
      clearTimeout(this.memoryDebounceTimer)
    }
    this.memoryDebounceTimer = setTimeout(async () => {
      try {
        wx.showLoading({
          title: '保存中...',
          mask: true
        })
        await updatePlot({
          id: this.data.plotInfo.id,
          memoryCount: this.data.plotInfo.memoryCount
        })
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1200
        })
      } catch (error) {
        wx.hideLoading()
        // 回滚到原始值
        if (this.memoryOriginalValue !== null) {
          this.setData({
            'plotInfo.memoryCount': this.memoryOriginalValue
          })
        }
        wx.showToast({
          title: '保存失败',
          icon: 'error',
          duration: 1500
        })
        console.error('更新记忆力失败:', error)
      } finally {
        // 重置原始值
        this.memoryOriginalValue = null
      }
    }, 800)
  },
  onDialogSetting() {
    wx.navigateTo({
      url: `/pages/role/chat-setting/index?plotId=${this.data.plotInfo.id}`
    })
  },
  onNewChatStyle() {
    if (!this.data.plotInfo.id) {
      return
    }
    wx.navigateTo({
      url: '/pages/role/chat-style/add/index'
    })
  },
  onChatStyle() {
    wx.navigateTo({
      url: '/pages/role/chat-style/index'
    })
  },
  onMySetting() {
    wx.navigateTo({
      url: '/pages/role/my-setting/index'
    })
  },
  onPlotSelect() {
    wx.navigateTo({
      url: `/pages/role/story/index?roleId=${this.data.roleInfo.id}`
    })
  },
  // 折叠/展开：设定
  toggleDescription() {
    const expanded = !this.data.descriptionExpanded
    const desc = this.data.roleInfo.description || ''
    const display = this.data.descriptionNeedFold && !expanded ? desc.slice(0, 120) + '…' : desc
    this.setData({
      descriptionExpanded: expanded,
      descriptionDisplay: display
    })
  },
  // 折叠/展开：开场白
  togglePrologue() {
    const expanded = !this.data.prologueExpanded
    const pro = this.data.storyInfo.prologue || ''
    const display = this.data.prologueNeedFold && !expanded ? pro.slice(0, 120) + '…' : pro
    this.setData({
      prologueExpanded: expanded,
      prologueDisplay: display
    })
  }
})

