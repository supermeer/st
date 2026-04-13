import SystemInfo from '../../../utils/system'

import {
  getCharacterDetail
} from '../../../services/role/index'
import {
  getVoiceList,
  setCharacterVoice,
  getVoiceTypes,
  getVoiceTags,
  addFavoriteVoice,
  removeFavoriteVoice,
  resetCharacterVoice
} from '../../../services/tts/index'
Page({
  data: {
    characterId: null,
    scrollTop: 0,
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    currentBg: '',
    showBG: true,
    activeTab: 0,
    voiceTypes: [],
    activeType: '',
    voiceTags: [],
    activeTag: '',
    voiceList: [],
    currentVoiceId: null,
    selectedVoiceId: null,
    defaultVoiceId: null,
    defaultVoiceName: null,
    playingVoiceId: null,
    emptyTip: '暂无声音'
  },

  onLoad(options) {
    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({
        showBG: false
      })
    }

    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })

    const { characterId, voiceId } = options
    characterId && this.setData({characterId})
    !characterId && voiceId && this.setData({currentVoiceId: voiceId, selectedVoiceId: voiceId}) 
    if (characterId) {
      this.getRoleInfo(characterId)
    }
    this.getVoiceList()
    // this.getTags()
    this.getTypes()

    const nav = this.selectComponent('#roleVoiceNav')
    if (nav) {
      nav.setBackAction(this.backAction)
    }
  },

  getRoleInfo(id) {
    getCharacterDetail(id)
    .then(res => {
      this.setData({
        currentBg: res.backgroundImage || ''
      })
      this.setData({
        defaultVoiceId: res.voiceId,
        defaultVoiceName: res.voiceName
      })
      const voiceId = res.userVoiceId || res.voiceId
      if (voiceId) {
        this.setData({
          currentVoiceId: voiceId || '',
          selectedVoiceId: voiceId || ''
        })
      }
    })
  },
  getVoiceList() {
    getVoiceList({onlyFavorite: this.data.activeTab == 1 ? true : false, voiceTypeIds: this.data.activeType || ''}).then(res => {
      this.setData({
        voiceList: res
      })
    })
  },
  getTypes() {
    getVoiceTypes().then(res => {
      this.setData({
        voiceTypes: res
      })
    })
  },
  getTags() {
    getVoiceTags().then(res => {
      this.setData({
        voiceTags: res
      })
    })
  },

  onTabChange(event) {
    const { index } = event.currentTarget.dataset
    this.setData({
      activeTab: Number(index) || 0
    }, () => {
      this.getVoiceList()
    })
  },

  onTypeChange(event) {
    const { type } = event.currentTarget.dataset
    this.setData({
      activeType: type === this.data.activeType ? '' : type,
      activeTag: ''
    }, () => {
      this.getVoiceList()
    })
  },

  onTagChange(event) {
    const { tag } = event.currentTarget.dataset
    this.setData({
      activeTag: tag || '全部'
    }, () => {
      this.getVoiceList()
    })
  },

  onSelectVoice(event) {
    const { id } = event.currentTarget.dataset
    this.setData({
      selectedVoiceId: id
    })
  },

  onToggleFavorite(event) {
    const { id } = event.currentTarget.dataset
    if (id === undefined || id === null) {
      return
    }
    const item = this.data.voiceList.find(item => item.id === id)
    let req = addFavoriteVoice
    if (item.isFavorite) {
      req = removeFavoriteVoice
    }
    req({voiceId: item.id}).then(res => {
      this.getVoiceList()
    })
  },

  onPlayVoice(event) {
    const { id } = event.currentTarget.dataset
    const targetVoice = this.data.voiceList.find((item) => Number(item.id) === Number(id))
    if (!targetVoice || !targetVoice.sampleUrl) {
      wx.showToast({
        title: '暂无试听音频',
        icon: 'none'
      })
      return
    }

    if (Number(this.data.playingVoiceId) === Number(targetVoice.id)) {
      this.stopVoiceAudio()
      return
    }

    this.playVoiceAudio(targetVoice)
  },

  playVoiceAudio(voice) {
    this.stopVoiceAudio(false)
    const innerAudioContext = wx.createInnerAudioContext({
      useWebAudioImplement: true
    })
    this.innerAudioContext = innerAudioContext
    innerAudioContext.src = voice.sampleUrl
    innerAudioContext.autoplay = true

    innerAudioContext.onPlay(() => {
      this.setData({
        playingVoiceId: voice.id
      })
    })

    innerAudioContext.onEnded(() => {
      this.stopVoiceAudio()
    })

    innerAudioContext.onStop(() => {
      this.stopVoiceAudio(false)
    })

    innerAudioContext.onError(() => {
      this.stopVoiceAudio()
      wx.showToast({
        title: '播放失败，请稍后重试',
        icon: 'none'
      })
    })

    innerAudioContext.play()
  },

  stopVoiceAudio(needRefresh = true) {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy()
      this.innerAudioContext = null
    }
    if (this.data.playingVoiceId === null) {
      return
    }
    this.setData({
      playingVoiceId: null
    })
  },

  onUnload() {
    this.stopVoiceAudio(false)
  },

  onHide() {
    this.stopVoiceAudio(false)
  },

  onResetSettings() {
    const tipDialog = this.selectComponent('#tip-dialog')
    tipDialog.show({
      content: '确认恢复默认设置？',
      cancelText: '取消',
      confirmText: '立即恢复',
      onConfirm: () => {
        if (!this.data.characterId) {
          this.callBack({voiceId: this.data.defaultVoiceId, voiceName: this.data.defaultVoiceName})
          return
        }
        resetCharacterVoice({characterId: this.data.characterId})
        .then(res => {
          this.callBack({voiceId: this.data.defaultVoiceId, voiceName: this.data.defaultVoiceName})
        })
      }
    })
  },
  callBack(v) {
    let voice = v
    if (!voice) {
      voice = this.data.voiceList.find(item => item.id === this.data.selectedVoiceId)
    }
    if(!voice) {
      return
    }
    const prevPage = getCurrentPages()[getCurrentPages().length - 2]
    if (!prevPage || typeof prevPage.confirmRoleVoice !== 'function') {
      wx.navigateBack()
      return
    }
    prevPage.confirmRoleVoice({voiceId: voice.id, voiceName: voice.voiceName})
    wx.navigateBack()
  },
  onSaveSettings() {
    if (!this.data.selectedVoiceId) {
      wx.showToast({
        title: '您还未选择语音',
        icon: 'none'
      })
      return
    }
    if (this.data.characterId) {
      // 直接保存
      setCharacterVoice({
        voiceId: this.data.selectedVoiceId,
        characterId: this.data.characterId
      })
      .then(res => {
        this.callBack()
      })
    } else {
      this.callBack()
    }
  },
  backAction() {
    if (!this.data.selectedVoiceId || this.data.selectedVoiceId === this.data.currentVoiceId) {
      wx.navigateBack()
      return
    }
    const tipDialog = this.selectComponent('#tip-dialog')
    let content = '是否保存当前设置？'
    tipDialog.show({
      title: '',
      content,
      cancelText: '取消',
      confirmText: '保存',
      onCancel: () => {
        wx.navigateBack()
      },
      onConfirm: async () => {
        if (this.data.characterId) {
          await setCharacterVoice({ voiceId:this.data.selectedVoiceId,characterId: this.data.characterId })
        }
        this.callBack({voiceId: this.data.defaultVoiceId, voiceName: this.data.defaultVoiceName})
      }
    })
  }
})
