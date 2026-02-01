import SystemInfo from '../../../utils/system'
import {
  createCharacter,
  updateCharacter,
  getCurrentPlotByCharacterId,
  getCharacterDetail,
  getCharacterType,
  getAuditRejectReason,
  getCharacterTag
} from '../../../services/role/index'
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
      gender: '',
      description: '',
      descriptionPrompt: '',
      prompt: null,
      avatarUrl: '',
      scene: '',
      prologue: '',
      styleId: null,
      userAddressedAs: '',
      identity: '',
      personaGender: null,
      defaultBackgroundImage: null,
      backgroundImage: null,
      typeIds: [],
      tagIds: []
    },
    worldBookList: [],
    styleForm: {
      id: null,
      name: ''
    },
    genderList: ['男', '女', '其他'],
    currentBg: '',
    showUploader: false,
    showAdvancedSetting: false,

    typeOptions: [],
    tagOptions: [],
    selectedTagList: [],
    maxTypeSelect: 4,
    maxTagSelect: 4,
    showTagSelector: false,
    tempTagIds: [],
    tagSelectorOptions: [],
    rejectReason: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.reportEvent('role_add_page_enter', {
      isCreate: !options.id
    })
    const { id, publishStatus } = options
    if (id) {
      this.setData({
        'formData.id': id
      })
      this.getCharacterById(id)

      if (publishStatus == '3') {
        this.getRejectReason(id)
      }
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })

    this.initMetaOptions()
  },

  initMetaOptions() {
    Promise.all([getCharacterType(), getCharacterTag()])
      .then(([typeOptions, tagOptions]) => {
        // 去掉type.name === 推荐的 item
        const typesList = (typeOptions || []).filter(item => item.name !== '推荐')
        this.setData(
          {
            typeOptions: typesList,
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
    const typeIds = this.normalizeIdList(formData.typeIds)

    const selectedTagList = (tagOptions || []).filter(
      (t) => tagIds.indexOf(Number(t.id)) !== -1
    )

    const typeOptionsWithSelected = this.buildSelectedOptions(
      this.data.typeOptions,
      typeIds
    )

    const tagSelectorOptions = this.buildSelectedOptions(
      this.data.tagOptions,
      this.data.tempTagIds
    )

    this.setData({
      selectedTagList,
      typeOptions: typeOptionsWithSelected,
      tagSelectorOptions,
      'formData.tagIds': tagIds,
      'formData.typeIds': typeIds
    })
  },

  getRejectReason(id) {
    getAuditRejectReason({
      characterId: id
    }).then((res) => {
      this.setData({
        rejectReason: res
      })
    })
  },

  getCharacterById(id) {
    getCharacterDetail(id).then((res) => {
      const { userAddressedAs, identity, gender } = res.defaultPersona || {}
      const { scene, prologue } = res.defaultStoryDetail || {}

      const typeIds = Array.isArray(res.typeIds)
        ? res.typeIds
        : Array.isArray(res.characterTypeIds)
          ? res.characterTypeIds
          : Array.isArray(res.types)
            ? res.types.map((t) => t.id)
            : []

      const tagIds = Array.isArray(res.tagIds)
        ? res.tagIds
        : Array.isArray(res.characterTagIds)
          ? res.characterTagIds
          : Array.isArray(res.tags)
            ? res.tags.map((t) => t.id)
            : []

      const normalizedTypeIds = (typeIds || [])
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v))
      const normalizedTagIds = (tagIds || [])
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v))

      this.setData(
        {
          formData: {
            ...this.data.formData,
            ...res,
            userAddressedAs: userAddressedAs || '',
            identity: identity || '',
            personaGender: gender || '',
            scene: scene || '',
            prologue: prologue || '',
            descriptionPrompt: res.descriptionPrompt || res.description || '',
            typeIds: normalizedTypeIds,
            tagIds: normalizedTagIds
          },
          currentBg: res.backgroundImage,
          worldBookList: res.prompt ? JSON.parse(res.prompt) : []
        },
        () => {
          this.syncSelectedMeta()
        }
      )
    })
  },

  onToggleType(e) {
    const { id } = e.currentTarget.dataset
    const normalizedId = Number(id)
    if (Number.isNaN(normalizedId)) {
      return
    }
    const typeIds = [...this.normalizeIdList(this.data.formData.typeIds)]
    const idx = typeIds.indexOf(normalizedId)
    if (idx !== -1) {
      typeIds.splice(idx, 1)
      this.setData({
        'formData.typeIds': typeIds,
        typeOptions: this.buildSelectedOptions(this.data.typeOptions, typeIds)
      })
      return
    }
    if (typeIds.length >= this.data.maxTypeSelect) {
      wx.showToast({
        title: `最多选择${this.data.maxTypeSelect}个类型`,
        icon: 'none'
      })
      return
    }
    typeIds.push(normalizedId)
    this.setData({
      'formData.typeIds': typeIds,
      typeOptions: this.buildSelectedOptions(this.data.typeOptions, typeIds)
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
   * 选择头像
   */
  onChooseAvatar() {
    // wx.chooseImage({
    //   count: 1,
    //   sizeType: ['compressed'],
    //   sourceType: ['album', 'camera'],
    //   success: (res) => {
    //     const tempFilePath = res.tempFilePaths[0]
    //     // TODO: 上传图片到服务器
    //     this.setData({
    //       'formData.avatar': tempFilePath
    //     })
    //   }
    // })
  },

  /**
   * 选择性别
   */
  onSelectGender() {
    wx.showActionSheet({
      itemList: this.data.genderList,
      success: (res) => {
        this.setData({
          'formData.gender': this.data.genderList[res.tapIndex]
        })
      }
    })
  },

  onAdvancedSetting() {
    this.setData({
      showAdvancedSetting: true
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
   * 对话风格
   */
  onChatStyle() {
    wx.navigateTo({
      url: '/pages/role/chat-style/index'
    })
  },
  confirmChatStyle(e) {
    this.setData({
      styleForm: {
        ...this.data.styleForm,
        ...e
      },
      formData: {
        ...this.data.formData,
        styleId: e.id
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
    // const backgroundSheet = this.selectComponent('#backgroundSheet')
    // if (backgroundSheet) {
    //   backgroundSheet.show({
    //     title: '聊天背景',
    //     // cancelText: '创建专属背景',
    //     confirmText: '设为背景',
    //     backgrounds: [],
    //     selectedId: this.data.formData.chatBackground,
    //     onConfirm: (background) => {
    //       if (background) {
    //         this.setData({
    //           'formData.chatBackground': background.id
    //         })
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

  onWorldBook() {
    wx.navigateTo({
      url: '/pages/role/world-book/index',
      success: (res) => {
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          background: this.data.formData.backgroundImage,
          worldBookList: this.data.worldBookList
        })
      }
    })
  },

  // 上一页面需要实现 confirmWorldBook 方法接收保存的数据
  confirmWorldBook(list) {
    this.setData({
      worldBookList: list,
      'formData.prompt': JSON.stringify(list || [])
    })
  },
  async onUploadSuccess(e) {
    const { tempFilePath, signature } = e.detail
    const bg =
      signature && signature.uploadUrl
        ? signature.uploadUrl.split('?')[0]
        : tempFilePath
    this.setData({
      showUploader: false,
      currentBg: tempFilePath,
      'formData.defaultBackgroundImage': bg,
      'formData.backgroundImage': bg
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
   * 提交表单
   */
  onSubmit() {
    wx.reportEvent('role_add_page_submit', {
      isCreate: !this.data.formData.id
    })
    const { formData } = this.data

    // 表单验证
    if (!formData.name) {
      wx.showToast({
        title: '请输入名称',
        icon: 'none'
      })
      return
    }
    if (!formData.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return
    }
    if (!formData.descriptionPrompt) {
      wx.showToast({
        title: '请输入智能体设定',
        icon: 'none'
      })
      return
    }

    if (!formData.description) {
      wx.showToast({
        title: '请输入角色描述',
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

    const method = formData.id ? updateCharacter : createCharacter

    wx.showLoading({
      title: `${method === updateCharacter ? '更新中...' : '创建中...'}`,
      mask: true
    })

    method({
      ...formData,
      description: formData.description || formData.descriptionPrompt
    }).then((id) => {
      const characterId = formData.id || id
      wx.hideLoading()
      wx.showToast({
        title: `${method === updateCharacter ? '更新成功' : '创建成功'}`,
        icon: 'success',
        duration: 1000
      })

      const tipDialog = this.selectComponent('#tip-dialog')
      let content = '有任何问题，可添加客服微信咨询。'
      tipDialog.show({
        title: `${method === updateCharacter ? '更新成功' : '创建成功'}`,
        content,
        cancelText: '添加客服',
        confirmText: '去聊天',
        onCancel: () => {
          wx.navigateBack()
          const app = getApp()
          wx.openCustomerServiceChat({
            extInfo: { url: app.globalData.wxCustomerService.url },
            corpId: app.globalData.wxCustomerService.corpId,
            success(res) {}
          })
        },
        onConfirm: async () => {
          const res = await getCurrentPlotByCharacterId(characterId)
          wx.redirectTo({
            url: `/pages/chat/index?plotId=${res && res.plotId ? res.plotId : ''}&characterId=${characterId}`
          })
        }
      })
    })
  }
})
