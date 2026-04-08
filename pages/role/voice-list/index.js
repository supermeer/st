import SystemInfo from '../../../utils/system'

const FAVORITE_STORAGE_KEY = 'roleVoiceFavoriteIds'
const DEFAULT_BG = '/static/images/empty-data.png'
const DEFAULT_AUDIO_URL = 'https://img.tukuppt.com/newpreview_music/08/98/74/5c88b75889c744149.mp3'

const VOICE_LIST = [
  {
    id: 101,
    name: '星夜·清冷御姐',
    gender: '女声',
    tags: ['性感', '御姐', '成熟'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 102,
    name: '晚风·温柔少女',
    gender: '女声',
    tags: ['可爱', '轻柔', '年轻'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 103,
    name: '雾海·知性女声',
    gender: '女声',
    tags: ['知性', '成熟', '治愈'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 104,
    name: '琥珀·元气甜妹',
    gender: '女声',
    tags: ['元气', '可爱', '活泼'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 105,
    name: '白露·清冷少女',
    gender: '女声',
    tags: ['高冷', '空灵', '年轻'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 106,
    name: '绯樱·慵懒御音',
    gender: '女声',
    tags: ['慵懒', '性感', '御姐'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 201,
    name: '曜石·沉稳大叔',
    gender: '男声',
    tags: ['磁性', '大叔', '成熟'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 202,
    name: '青锋·少年音',
    gender: '男声',
    tags: ['少年', '清爽', '轻快'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 203,
    name: '夜巡·冷峻男声',
    gender: '男声',
    tags: ['低沉', '禁欲', '克制'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 204,
    name: '川穹·温柔青年',
    gender: '男声',
    tags: ['温柔', '治愈', '磁性'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 205,
    name: '赤霄·热血少年',
    gender: '男声',
    tags: ['热血', '少年', '活力'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 206,
    name: '寒川·腹黑低音',
    gender: '男声',
    tags: ['腹黑', '低沉', '成熟'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 301,
    name: '极光·空灵中性',
    gender: '其他声',
    tags: ['空灵', '中性', '梦幻'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 302,
    name: '棱镜·机械合成',
    gender: '其他声',
    tags: ['机械', '未来感', '独特'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 303,
    name: '月蚀·神秘中性',
    gender: '其他声',
    tags: ['神秘', '中性', '空灵'],
    audioUrl: DEFAULT_AUDIO_URL
  },
  {
    id: 304,
    name: '零式·电子播报',
    gender: '其他声',
    tags: ['电子', '系统', '冷静'],
    audioUrl: DEFAULT_AUDIO_URL
  }
]

Page({
  data: {
    scrollTop: 0,
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    currentBg: '',
    backgroundPlaceholder: DEFAULT_BG,
    showBG: true,
    activeTab: 0,
    genderTabs: ['男声', '女声', '其他声'],
    activeGender: '男声',
    availableTags: ['全部'],
    activeTag: '全部',
    allVoiceList: [],
    visibleVoiceList: [],
    favoriteIds: [],
    currentVoiceId: null,
    selectedVoiceId: null,
    playingVoiceId: null,
    selectedVoice: null,
    initialVoice: null,
    emptyTip: '暂无声音'
  },

  onLoad(options) {
    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({
        showBG: false
      })
    }

    const selectedVoice = this.parseSelectedVoice(options.selectedVoice)
    const favoriteIds = this.getFavoriteIds()
    const mergedVoiceList = this.mergeSelectedVoice(VOICE_LIST, selectedVoice)
    const allVoiceList = this.decorateVoiceList(mergedVoiceList, favoriteIds)
    const preferredGender = selectedVoice && selectedVoice.gender
      ? this.normalizeGender(selectedVoice.gender)
      : allVoiceList[0]
        ? allVoiceList[0].gender
        : '男声'
    const nextGender = this.getFallbackGender(allVoiceList, preferredGender)
    const listState = this.buildVisibleVoiceState({
      allVoiceList,
      activeTab: 0,
      activeGender: nextGender,
      activeTag: '全部',
      currentVoiceId: selectedVoice ? selectedVoice.id : null,
      selectedVoiceId: selectedVoice ? selectedVoice.id : null
    })

    this.setData({
      currentBg: options.currentBg || DEFAULT_BG,
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() },
      favoriteIds,
      allVoiceList,
      currentVoiceId: selectedVoice ? selectedVoice.id : null,
      selectedVoiceId: selectedVoice ? selectedVoice.id : null,
      selectedVoice: selectedVoice,
      initialVoice: selectedVoice,
      activeGender: nextGender,
      availableTags: listState.availableTags,
      activeTag: listState.activeTag,
      visibleVoiceList: listState.visibleVoiceList,
      emptyTip: listState.emptyTip
    })

    const nav = this.selectComponent('#roleVoiceNav')
    if (nav) {
      nav.setBackAction(this.backAction)
    }
  },

  parseSelectedVoice(selectedVoice) {
    if (!selectedVoice) {
      return null
    }
    try {
      const voice = JSON.parse(decodeURIComponent(selectedVoice))
      if (!voice || voice.id === undefined || voice.id === null) {
        return null
      }
      return {
        ...voice,
        gender: this.normalizeGender(voice.gender),
        tags: Array.isArray(voice.tags) ? voice.tags : [],
        audioUrl: voice.audioUrl || DEFAULT_AUDIO_URL
      }
    } catch (error) {
      return null
    }
  },

  normalizeGender(gender) {
    if (gender === '男' || gender === '男性' || gender === '男生') {
      return '男声'
    }
    if (gender === '女' || gender === '女性' || gender === '女生') {
      return '女声'
    }
    if (gender === '其他' || gender === '中性' || gender === '未知') {
      return '其他声'
    }
    return gender || '男声'
  },

  mergeSelectedVoice(list, selectedVoice) {
    const normalizedList = (Array.isArray(list) ? list : []).map((item) => ({
      ...item,
      gender: this.normalizeGender(item.gender),
      tags: Array.isArray(item.tags) ? item.tags : [],
      audioUrl: item.audioUrl || DEFAULT_AUDIO_URL
    }))
    if (!selectedVoice || !selectedVoice.id) {
      return normalizedList
    }
    const exists = normalizedList.some((item) => Number(item.id) === Number(selectedVoice.id))
    if (exists) {
      return normalizedList
    }
    return [
      {
        id: selectedVoice.id,
        name: selectedVoice.name || '当前已选声音',
        gender: this.normalizeGender(selectedVoice.gender),
        tags: Array.isArray(selectedVoice.tags) ? selectedVoice.tags : [],
        audioUrl: selectedVoice.audioUrl || DEFAULT_AUDIO_URL
      },
      ...normalizedList
    ]
  },

  getFavoriteIds() {
    const ids = wx.getStorageSync(FAVORITE_STORAGE_KEY)
    return Array.isArray(ids) ? ids.map((item) => Number(item)).filter((item) => !Number.isNaN(item)) : []
  },

  decorateVoiceList(list, favoriteIds) {
    const favoriteSet = new Set(favoriteIds)
    return (Array.isArray(list) ? list : []).map((item) => ({
      ...item,
      favorite: favoriteSet.has(Number(item.id))
    }))
  },

  getCurrentBaseList() {
    const { allVoiceList, activeTab } = this.data
    if (activeTab === 1) {
      return allVoiceList.filter((item) => item.favorite)
    }
    return allVoiceList
  },

  getAvailableTags(list, gender) {
    const tagMap = {}
    ;(Array.isArray(list) ? list : [])
      .filter((item) => item.gender === gender)
      .forEach((item) => {
        ;(item.tags || []).forEach((tag) => {
          tagMap[tag] = true
        })
      })
    return ['全部', ...Object.keys(tagMap)]
  },

  getFallbackGender(list, preferredGender) {
    const sourceList = Array.isArray(list) ? list : []
    if (sourceList.some((item) => item.gender === preferredGender)) {
      return preferredGender
    }
    const firstItem = sourceList[0]
    return firstItem ? firstItem.gender : preferredGender || '男声'
  },

  buildVisibleVoiceState({ allVoiceList, activeTab, activeGender, activeTag, currentVoiceId, selectedVoiceId }) {
    const baseList = activeTab === 1
      ? (Array.isArray(allVoiceList) ? allVoiceList : []).filter((item) => item.favorite)
      : (Array.isArray(allVoiceList) ? allVoiceList : [])
    const nextGender = this.getFallbackGender(baseList, activeGender)
    const availableTags = this.getAvailableTags(baseList, nextGender)
    const nextActiveTag = availableTags.indexOf(activeTag) === -1 ? '全部' : activeTag
    const visibleVoiceList = baseList
      .filter((item) => {
        const matchGender = item.gender === nextGender
        const matchTag = nextActiveTag === '全部' || (item.tags || []).indexOf(nextActiveTag) !== -1
        return matchGender && matchTag
      })
      .map((item) => ({
        ...item,
        isCurrent: Number(item.id) === Number(currentVoiceId),
        selected: Number(item.id) === Number(selectedVoiceId),
        isPlaying: Number(item.id) === Number(this.data.playingVoiceId)
      }))

    return {
      activeGender: nextGender,
      availableTags,
      activeTag: nextActiveTag,
      visibleVoiceList,
      emptyTip: activeTab === 1 ? '暂未收藏声音，长按卡片即可收藏' : '当前筛选条件下暂无声音'
    }
  },

  refreshVisibleVoiceList() {
    const listState = this.buildVisibleVoiceState({
      allVoiceList: this.data.allVoiceList,
      activeTab: this.data.activeTab,
      activeGender: this.data.activeGender,
      activeTag: this.data.activeTag,
      currentVoiceId: this.data.currentVoiceId,
      selectedVoiceId: this.data.selectedVoiceId
    })

    this.setData(listState)
  },

  onTabChange(event) {
    const { index } = event.currentTarget.dataset
    this.setData({
      activeTab: Number(index) || 0
    }, () => {
      this.refreshVisibleVoiceList()
    })
  },

  onGenderChange(event) {
    const { gender } = event.currentTarget.dataset
    if (!gender || gender === this.data.activeGender) {
      return
    }
    this.setData({
      activeGender: gender,
      activeTag: '全部'
    }, () => {
      this.refreshVisibleVoiceList()
    })
  },

  onTagChange(event) {
    const { tag } = event.currentTarget.dataset
    this.setData({
      activeTag: tag || '全部'
    }, () => {
      this.refreshVisibleVoiceList()
    })
  },

  onSelectVoice(event) {
    const { id } = event.currentTarget.dataset
    const selectedVoice = this.data.allVoiceList.find((item) => Number(item.id) === Number(id))
    if (!selectedVoice) {
      return
    }
    this.setData({
      selectedVoiceId: selectedVoice.id,
      selectedVoice
    }, () => {
      this.refreshVisibleVoiceList()
    })
  },

  onToggleFavorite(event) {
    const { id } = event.currentTarget.dataset
    if (id === undefined || id === null) {
      return
    }
    const currentIds = [...this.data.favoriteIds]
    const targetId = Number(id)
    const idx = currentIds.indexOf(targetId)
    const isFavorite = idx !== -1
    if (isFavorite) {
      currentIds.splice(idx, 1)
    } else {
      currentIds.push(targetId)
    }
    wx.setStorageSync(FAVORITE_STORAGE_KEY, currentIds)
    this.setData({
      favoriteIds: currentIds,
      allVoiceList: this.decorateVoiceList(this.data.allVoiceList, currentIds)
    }, () => {
      this.refreshVisibleVoiceList()
      wx.showToast({
        title: isFavorite ? '已取消收藏' : '已收藏',
        icon: 'none'
      })
    })
  },

  onPlayVoice(event) {
    const { id } = event.currentTarget.dataset
    const targetVoice = this.data.allVoiceList.find((item) => Number(item.id) === Number(id))
    if (!targetVoice || !targetVoice.audioUrl) {
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
    innerAudioContext.src = voice.audioUrl
    innerAudioContext.autoplay = true

    innerAudioContext.onPlay(() => {
      this.setData({
        playingVoiceId: voice.id
      }, () => {
        this.refreshVisibleVoiceList()
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
    }, () => {
      if (needRefresh) {
        this.refreshVisibleVoiceList()
      }
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
      }
    })
  },

  onSaveSettings() {
    const prevPage = getCurrentPages()[getCurrentPages().length - 2]
    if (!prevPage || typeof prevPage.confirmRoleVoice !== 'function') {
      wx.navigateBack()
      return
    }
    prevPage.confirmRoleVoice(this.data.selectedVoice || null)
    wx.navigateBack()
  },
  backAction() {
    const tipDialog = this.selectComponent('#tip-dialog')
    let content = '是否保存当前设置？'
    tipDialog.show({
      title: '',
      content,
      cancelText: '取消',
      confirmText: '保存',
      onCancel: () => {
      },
      onConfirm: async () => {
        wx.navigateBack()
      }
    })
  }
})
