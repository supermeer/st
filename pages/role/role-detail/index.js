import SystemInfo from '../../../utils/system'
import { getCharacterDetail, getStoryDetail } from '../../../services/role/index'
import { getPlotDetail, updatePlot, getMemoryType } from '../../../services/ai/chat'
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
      memoryOptionId: null, // 记忆力选项ID
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
    prologueDisplay: '',
    // 我是谁折叠控制
    identityExpanded: false,
    identityNeedFold: false,
    identityDisplay: '',
    currentBg: '',
    // 记忆力说明遮罩层
    showMemoryDescOverlay: false,
    memoryOptions: []
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
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  async onShow() {
    if (this.data.roleInfo.id) {
      await this.getMemoryType()
      this.loadRoleDetail(this.data.roleInfo.id)
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
      const plotId = res.currentPlotId
      if (!res.currentPlotId) {
        this.setData({
          currentBg: res.backgroundImage,
          plotInfo: {
            ...this.data.plotInfo,
            chatStyle: res.defaultChatStyleDetail,
            memoryCount: 0,
            memoryOptionId: null,
            id: null,
            persona: {}
          },
          identityNeedFold: false,
          identityDisplay: '',
          identityExpanded: false,
          storyInfo: {
            ...this.data.storyInfo,
            ...res.defaultStoryDetail
          }
        })
        // 处理开场白折叠
        const prologue = res.defaultStoryDetail?.prologue || ''
        const prologueNeedFold = prologue.length > 120
        const prologueDisplay = prologueNeedFold && !this.data.prologueExpanded ? prologue.slice(0, 120) + '…' : prologue
        this.setData({
          prologueNeedFold,
          prologueDisplay
        })
      } else {
        const identity = res.plotDetailVO?.persona?.identity || ''
        const identityNeedFold = identity.length > 30
        const identityDisplay = identityNeedFold && !this.data.identityExpanded ? identity.slice(0, 30) + '…' : identity
        this.setData({
          plotInfo: {
            ...this.data.plotInfo,
            ...res.plotDetailVO,
            id: plotId
          },
          storyInfo: {
            ...this.data.storyInfo,
            ...res.plotDetailVO.story
          },
          currentBg: res.plotDetailVO.backgroundImage,
          identityNeedFold: identityNeedFold,
          identityDisplay: identityDisplay
        })
        // 处理开场白折叠
        const prologue = res.plotDetailVO?.story?.prologue || ''
        const prologueNeedFold = prologue.length > 120
        const prologueDisplay = prologueNeedFold && !this.data.prologueExpanded ? prologue.slice(0, 120) + '…' : prologue
        this.setData({
          prologueNeedFold,
          prologueDisplay
        })
      }
    })
  },
  getMemoryType() {
    return getMemoryType().then(res => {
      this.setData({
        memoryOptions: res || []
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

  async onMemorySetting() {
    if (!this.data.plotInfo.id) {
      wx.showToast({
        title: '请先选择剧情',
        icon: 'none'
      })
      return
    }
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
        this.setData({
          'plotInfo.memoryCount': this.memoryOriginalValue || 0
        })
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
      url: `/pages/role/chat-setting/index?plotId=${this.data.plotInfo.id}&roleName=${this.data.roleInfo.name}`
    })
  },
  onNewChatStyle() {
    if (!this.data.plotInfo.id) {
      return
    }
    wx.navigateTo({
      url: `/pages/role/chat-style/add/index?currentBg=${this.data.currentBg}`
    })
  },
  onChatStyle() {
    wx.navigateTo({
      url: `/pages/role/chat-style/index?currentBg=${this.data.currentBg}`
    })
  },
  onMySetting() {
    if (!this.data.plotInfo.id) {
      return
    }
    wx.navigateTo({
      url: `/pages/role/my-setting/index?personaId=${this.data.plotInfo.persona?.id || ''}&storyId=${this.data.storyInfo.id}&avatarUrl=${this.data.currentBg}&plotId=${this.data.plotInfo.id}`
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
  },
  // 折叠/展开：我是谁
  toggleIdentity() {
    const expanded = !this.data.identityExpanded
    const identity = this.data.plotInfo.persona?.identity || ''
    const display = this.data.identityNeedFold && !expanded ? identity.slice(0, 30) + '…' : identity
    this.setData({
      identityExpanded: expanded,
      identityDisplay: display
    })
  }
})

