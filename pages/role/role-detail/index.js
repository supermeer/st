import SystemInfo from '../../../utils/system'
import {
  getCharacterDetail,
  shareCharacter,
  getStoryDetail
} from '../../../services/role/index'
import {
  followUser,
  unfollowUser,
  getCurrentPlotByGroupChatId
} from '../../../services/group/index'
import {
  getPlotDetail,
  updatePlot,
  getMemoryType,
  createStory,
  createPlot
} from '../../../services/ai/chat'
import userStore from '../../../store/user'
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
      prologue: '' //开场白
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
      persona: {}
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
    memoryOptions: [],
    showBG: true,
    // 创作者信息
    creatorInfo: {
      creatorUserId: null,
      creatorNickname: '',
      creatorAvatar: '',
    },
    isFollowed: false,
    isOwnCreator: false,
    // 关联群聊列表
    publicGroupChats: []
  },

  // 防抖定时器（记忆力滑块）
  memoryDebounceTimer: null,
  // 记忆力滑块原始值（失败回滚用）
  memoryOriginalValue: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({
        showBG: false
      })
    }
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
    getCharacterDetail(id).then((res) => {
      const merged = {
        ...this.data.roleInfo,
        ...res
      }
      const desc = merged.description || ''
      const needFold = desc.length > 120
      const display =
        needFold && !this.data.descriptionExpanded
          ? desc.slice(0, 120) + '…'
          : desc
      const currentUserId = userStore.data?.userInfo?.id
      const creatorId = res.creatorUserId || null
      this.setData({
        roleInfo: merged,
        descriptionNeedFold: needFold,
        descriptionDisplay: display,
        // 设置创作者信息
        creatorInfo: {
          creatorUserId: creatorId,
          creatorNickname: res.creatorNickname || '',
          creatorAvatar: res.creatorAvatar || '',
        },
        isFollowed: res.isFollowedCreator || false,
        isOwnCreator: !!(currentUserId && creatorId && currentUserId == creatorId),
        // 关联群聊列表
        publicGroupChats: res.publicGroupChats || []
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
            persona: {
              ...(res.defaultPersona || {})
            }
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
        const prologueDisplay =
          prologueNeedFold && !this.data.prologueExpanded
            ? prologue.slice(0, 120) + '…'
            : prologue
        this.setData({
          prologueNeedFold,
          prologueDisplay
        })
      } else {
        const identity = res.plotDetailVO?.persona?.identity || ''
        const identityNeedFold = identity.length > 30
        const identityDisplay =
          identityNeedFold && !this.data.identityExpanded
            ? identity.slice(0, 30) + '…'
            : identity
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
        const prologueDisplay =
          prologueNeedFold && !this.data.prologueExpanded
            ? prologue.slice(0, 120) + '…'
            : prologue
        this.setData({
          prologueNeedFold,
          prologueDisplay
        })
      }
    })
  },
  getMemoryType() {
    return getMemoryType().then((res) => {
      this.setData({
        memoryOptions: res || []
      })
    })
  },
  onTabChange(event) {
    const tab = event.currentTarget.dataset.tab
    // if (tab == 3) {
    //   wx.navigateTo({
    //     url: `/pages/role/story/index?roleId=${this.data.roleInfo.id}`
    //   })
    //   return
    // }
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
  // onChatStyle() {
  //   wx.navigateTo({
  //     url: `/pages/role/chat-style/index?currentBg=${this.data.currentBg}`
  //   })
  // },
  // confirmChatStyle(e) {
  //   this.setData({
  //     plotInfo: {
  //       ...this.data.plotInfo,
  //       chatStyle: {
  //         id: e.id,
  //         title: e.title
  //       }
  //     }
  //   })
  // },
  onChatVoice() {
    wx.navigateTo({
      url: `/pages/role/voice-list/index?characterId=${this.data.roleInfo.id || ''}&voiceId=${this.data.roleInfo.userVoiceId || this.data.roleInfo.voiceId || ''}`
    })
  },

  confirmRoleVoice(voice) {
    let voiceForm = {}
    if (voice.voiceId === this.data.roleInfo.voiceId) {
      voiceForm = {
        userVoiceId: null,
        uservoiceName: null,
        ...voice
      }
    } else {
      voiceForm = {
        userVoiceId: voice.voiceId,
        uservoiceName: voice.voiceName
      }
    }
    this.setData({
      roleInfo: {
        ...this.data.roleInfo,
        ...voiceForm
      }
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
  onChangeStory() {
    wx.navigateTo({
      url: `/pages/role/story/index?roleId=${this.data.roleInfo.id}`
    })
  },
  onPlotSelect() {
    wx.navigateTo({
      url: `/pages/role/plot/index?roleId=${this.data.roleInfo.id}`
    })
  },
  newStoryAction() {
    const storyDialog = this.selectComponent('#story-dialog')
    storyDialog.show({
      onConfirm: (data) => {
        createStory({
          ...data,
          characterId: this.data.roleInfo.id
        }).then((res) => {
          if (res.code == 200) {
            wx.showToast({ title: '创建成功', icon: 'success' })
            this.setData({
              storyInfo: { ...this.data.storyInfo, ...res.data }
            })
          }
        })
      },
      roles: [{id: this.data.roleInfo.id, avatar: this.data.currentBg}]
    })
  },
  // 折叠/展开：设定
  toggleDescription() {
    const expanded = !this.data.descriptionExpanded
    const desc = this.data.roleInfo.description || ''
    const display =
      this.data.descriptionNeedFold && !expanded
        ? desc.slice(0, 120) + '…'
        : desc
    this.setData({
      descriptionExpanded: expanded,
      descriptionDisplay: display
    })
  },
  // 折叠/展开：开场白
  togglePrologue() {
    const expanded = !this.data.prologueExpanded
    const pro = this.data.storyInfo.prologue || ''
    const display =
      this.data.prologueNeedFold && !expanded ? pro.slice(0, 120) + '…' : pro
    this.setData({
      prologueExpanded: expanded,
      prologueDisplay: display
    })
  },
  // 折叠/展开：我是谁
  toggleIdentity() {
    const expanded = !this.data.identityExpanded
    const identity = this.data.plotInfo.persona?.identity || ''
    const display =
      this.data.identityNeedFold && !expanded
        ? identity.slice(0, 30) + '…'
        : identity
    this.setData({
      identityExpanded: expanded,
      identityDisplay: display
    })
  },
  // 关注创作者
  async onFollow() {
    const creatorId = this.data.creatorInfo.creatorUserId
    if (!creatorId) {
      wx.showToast({ title: '创作者信息不存在', icon: 'none' })
      return
    }
    if (this.data.isOwnCreator) {
      wx.showToast({ title: '不能关注自己', icon: 'none' })
      return
    }
    try {
      await followUser(creatorId)
      this.setData({ isFollowed: true })
      wx.showToast({ title: '关注成功', icon: 'success' })
    } catch (error) {
      console.error('关注失败:', error)
    }
  },
  // 取关创作者
  async onUnfollow() {
    const creatorId = this.data.creatorInfo.creatorUserId
    if (!creatorId) {
      wx.showToast({ title: '创作者信息不存在', icon: 'none' })
      return
    }
    try {
      await unfollowUser(creatorId)
      this.setData({ isFollowed: false })
      wx.showToast({ title: '已取消关注', icon: 'success' })
    } catch (error) {
      console.error('取关失败:', error)
    }
  },
  async onShareAppMessage() {
    const { id, isSystem } = this.data.roleInfo || {}
    shareCharacter({characterId: id})
    let path = `/pages/chat/index?characterId=${id}&isShare=${true}`
    if (isSystem != 1) {
      path = '/pages/home/home'
    }
    return {
      title: '星语酒馆',
      path,
      imageUrl: '/images/global-share.jpg'
    }
  },
  // 点击关联群聊
  async onGroupClick(e) {
    const { groupchatid } = e.currentTarget.dataset
    if (!groupchatid) {
      return
    }
    const res = await getCurrentPlotByGroupChatId(groupchatid)
    let plotId = res && res.plotId ? res.plotId : ''
    if (!plotId) {
      plotId = await createPlot({
        groupChatId: groupchatid
      })
    }
    wx.navigateTo({
      url: `/pages/chat/index?groupId=${groupchatid}&plotId=${plotId || ''}`
    })
  }
})
