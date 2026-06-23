import SystemInfo from '../../../utils/system'
import { 
  getCharacterTag,
  getCurrentPlotByCharacterId
} from '../../../services/role/index'
import { verifyUrls } from '../../../services/file/index'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    formData: {
      id: null,
      name: '',
      description: '',
      plotName: '',
      plotSetting: '',
      prologue: '',
      prologueCharacterId: null,
      userAddressedAs: '',
      identity: '',
      personaGender: '',
      backgroundImage: null,
      tagIds: []
    },
    voiceForm: {
      showMark: false,
      voiceId: null,
      voiceName: ''
    },
    showUploader: false,
    currentBg: '',
    
    tagOptions: [],
    selectedTagList: [],
    maxTagSelect: 4,
    showTagSelector: false,
    tempTagIds: [],
    tagSelectorOptions: [],

    selectedCharacters: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const voiceMark = wx.getStorageSync('voiceNewMark')
    if (!voiceMark) {
      this.setData({
        'voiceForm.showMark': true
      })
    }

    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })

    this.initMetaOptions()

    const nav = this.selectComponent('#groupAddNav')
    if (nav) {
      nav.setBackAction(this.backAction)
    }
  },

  backAction() {
    const tipDialog = this.selectComponent('#tip-dialog')
    let content = '退出当前页面后，编辑的内容不会被保存，确认退出？'
    tipDialog.show({
      title: '提示',
      content,
      cancelText: '取消',
      confirmText: '确认',
      onCancel: () => {},
      onConfirm: async () => {
        wx.navigateBack()
      }
    })
  },

  initMetaOptions() {
    getCharacterTag()
      .then((tagOptions) => {
        this.setData(
          {
            tagOptions: Array.isArray(tagOptions) ? tagOptions : []
          },
          () => {
            this.syncSelectedMeta()
          }
        )
      })
      .catch(() => {})
  },

  normalizeIdList(list) {
    return (Array.isArray(list) ? list : [])
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v))
  },

  buildSelectedOptions(options, selectedIds) {
    const set = new Set(this.normalizeIdList(selectedIds))
    return (Array.isArray(options) ? options : []).map((o) => ({
      ...o,
      selected: set.has(Number(o.id))
    }))
  },

  syncSelectedMeta() {
    const { tagOptions, formData } = this.data
    const tagIds = this.normalizeIdList(formData.tagIds)

    const selectedTagList = (tagOptions || []).filter(
      (t) => tagIds.indexOf(Number(t.id)) !== -1
    )

    const tagSelectorOptions = this.buildSelectedOptions(
      this.data.tagOptions,
      this.data.tempTagIds
    )

    this.setData({
      selectedTagList,
      tagSelectorOptions,
      'formData.tagIds': tagIds
    })
  },

  onOpenTagSelector() {
    const tagIds = this.normalizeIdList(this.data.formData.tagIds)
    const tagSelectorOptions = this.buildSelectedOptions(
      this.data.tagOptions,
      tagIds
    )
    this.setData({
      showTagSelector: true,
      tempTagIds: tagIds,
      tagSelectorOptions
    })
  },

  onCloseTagSelector() {
    this.setData({
      showTagSelector: false
    })
  },

  onToggleTagInSelector(e) {
    const { id } = e.currentTarget.dataset
    const normalizedId = Number(id)
    if (Number.isNaN(normalizedId)) {
      return
    }
    const tempTagIds = [...this.normalizeIdList(this.data.tempTagIds)]
    const idx = tempTagIds.indexOf(normalizedId)
    if (idx !== -1) {
      tempTagIds.splice(idx, 1)
      this.setData({
        tempTagIds,
        tagSelectorOptions: this.buildSelectedOptions(
          this.data.tagOptions,
          tempTagIds
        )
      })
      return
    }
    if (tempTagIds.length >= this.data.maxTagSelect) {
      wx.showToast({
        title: `最多选择${this.data.maxTagSelect}个标签`,
        icon: 'none'
      })
      return
    }
    tempTagIds.push(normalizedId)
    this.setData({
      tempTagIds,
      tagSelectorOptions: this.buildSelectedOptions(
        this.data.tagOptions,
        tempTagIds
      )
    })
  },

  onConfirmTagSelector() {
    this.setData(
      {
        'formData.tagIds': [...(this.data.tempTagIds || [])],
        showTagSelector: false
      },
      () => {
        this.syncSelectedMeta()
      }
    )
  },

  onRemoveSelectedTag(e) {
    const { id } = e.currentTarget.dataset
    const normalizedId = Number(id)
    if (Number.isNaN(normalizedId)) {
      return
    }
    const tagIds = [...(this.data.formData.tagIds || [])]
    const idx = tagIds.indexOf(normalizedId)
    if (idx !== -1) {
      tagIds.splice(idx, 1)
      this.setData(
        {
          'formData.tagIds': tagIds
        },
        () => {
          this.syncSelectedMeta()
        }
      )
    }
  },

  onTouchMove() {},

  /**
   * 输入框变化
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const value = e.detail.value || ''
    this.setData({
      [`formData.${field}`]: value
    })
  },

  /**
   * 文本域变化
   */
  onTextareaChange(e) {
    const { field } = e.currentTarget.dataset
    const value = e.detail.value || ''
    this.setData({
      [`formData.${field}`]: value
    })
  },

  /**
   * 选择开场白角色
   */
  onSelectPrologueCharacter() {
    wx.showToast({
      title: '角色选择组件待接入',
      icon: 'none'
    })
  },

  /**
   * 添加角色
   */
  onAddCharacters() {
    wx.showToast({
      title: '角色选择组件待接入',
      icon: 'none'
    })
  },

  /**
   * 对我的设定
   */
  onUserSettings() {
    wx.navigateTo({
      url: `/pages/role/my-setting/index?gender=${this.data.formData.personaGender}&userAddressedAs=${this.data.formData.userAddressedAs}&identity=${this.data.formData.identity}`
    })
  },

  confirmUserSettings(e) {
    const { userAddressedAs, identity, personaGender } = e
    this.setData({
      'formData.userAddressedAs': userAddressedAs,
      'formData.identity': identity,
      'formData.personaGender': personaGender
    })
  },

  /**
   * 角色声音
   */
  onRoleVoice() {
    wx.setStorageSync('voiceNewMark', true)
    this.setData({
      'voiceForm.showMark': false
    })
    wx.navigateTo({
      url: `/pages/role/voice-list/index?characterId=${this.data.formData.id || ''}&voiceId=${this.data.voiceForm.voiceId || ''}&from=group`
    })
  },

  confirmRoleVoice(voice) {
    this.setData({
      voiceForm: {
        ...this.data.voiceForm,
        ...voice
      }
    })
  },

  /**
   * 聊天背景
   */
  onChatBackground() {
    this.setData({
      showUploader: true
    })
  },

  async onUploadSuccess(e) {
    const { tempFilePath, signature } = e.detail
    const bg =
      signature && signature.uploadUrl
        ? signature.uploadUrl.split('?')[0]
        : tempFilePath
    const res = await verifyUrls([signature.fileKey])
    const fileRes = res && res[0] ? res[0] : {}
    if (fileRes && !fileRes.illegal) {
      this.setData({
        showUploader: false,
        currentBg: tempFilePath,
        'formData.backgroundImage': bg
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您上传的图片包含敏感信息。'
      })
      this.setData({
        showUploader: false,
        currentBg: null,
        'formData.backgroundImage': null
      })
    }
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
   * 提交表单
   */
  onSubmit() {
    const { formData } = this.data

    if (!formData.name) {
      wx.showToast({
        title: '请输入群名称',
        icon: 'none'
      })
      return
    }
    if (!formData.description) {
      wx.showToast({
        title: '请输入群简介',
        icon: 'none'
      })
      return
    }
    if (!formData.plotName) {
      wx.showToast({
        title: '请输入剧情名称',
        icon: 'none'
      })
      return
    }
    if (!formData.plotSetting) {
      wx.showToast({
        title: '请输入剧情设定',
        icon: 'none'
      })
      return
    }
    if (!formData.prologue) {
      wx.showToast({
        title: '请输入开场白',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...',
      mask: true
    })

    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1000
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    }, 1000)
  }
})
