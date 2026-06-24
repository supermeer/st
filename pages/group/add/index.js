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
      backgroundImage: null
    },
    showUploader: false,
    currentBg: '',
    
    selectedCharacters: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })

    const nav = this.selectComponent('#groupAddNav')
    if (nav) {
      nav.setBackAction(this.backAction)
    }

    // 测试数据
    this.setData({
      selectedCharacters: [
        { id: 1, name: '测试角色1', avatarUrl: 'https://picsum.photos/200' },
        { id: 2, name: '测试角色2', avatarUrl: 'https://picsum.photos/201' },
        { id: 3, name: '测试角色3', avatarUrl: '' }
      ]
    })
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
   * 移除群成员
   */
  onRemoveCharacter(e) {
    const { id } = e.currentTarget.dataset
    const selectedCharacters = [...this.data.selectedCharacters]
    const index = selectedCharacters.findIndex((c) => c.id === id)
    if (index !== -1) {
      selectedCharacters.splice(index, 1)
      this.setData({ selectedCharacters })
    }
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
