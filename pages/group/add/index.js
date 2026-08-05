import SystemInfo from '../../../utils/system'
import { verifyUrls } from '../../../services/file/index'
import GroupChatService from '../../../services/ai/group-chat'

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
      storyTitle: '',
      scene: '',
      plotSetting: '',
      prologue: '',
      prologueCharacterId: '',
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
  onSelectPrologueCharacter(e) {
    const { id } = e.currentTarget.dataset
    const character = this.data.selectedCharacters.find(c => c.id == id)
    this.setData({
      'formData.prologueCharacterId': character?.id || null
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
    const selectedRoles = encodeURIComponent(JSON.stringify(this.data.selectedCharacters))
    wx.navigateTo({
      url: `/pages/group/role-select/index?selectedRoles=${selectedRoles}`
    })
  },

  /**
   * 接收角色选择返回的数据
   */
  onRoleSelectBack(selectedRoles) {
    this.setData({
      selectedCharacters: selectedRoles || []
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
  async onSubmit() {
    const { formData, selectedCharacters } = this.data

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
    if (!selectedCharacters || selectedCharacters.length == 0) {
      wx.showToast({
        title: '请选择角色',
        icon: 'none'
      })
      return
    }
    if (!formData.storyTitle) {
      wx.showToast({
        title: '请输入故事名称',
        icon: 'none'
      })
      return
    }
    if (!formData.scene) {
      wx.showToast({
        title: '请输入故事设定',
        icon: 'none'
      })
      return
    }
    // if (!formData.prologue) {
    //   wx.showToast({
    //     title: '请输入开场白',
    //     icon: 'none'
    //   })
    //   return
    // }

    wx.showLoading({
      title: '保存中...',
      mask: true
    })

    try {
      const params = {
        name: formData.name,
        description: formData.description,
        characterIds: selectedCharacters.map(c => c.id),
        defaultBackgroundImage: formData.backgroundImage || '',
        prologue: formData.prologue,
        prologueCharacterId: formData.prologueCharacterId || undefined
      }

      const res = await GroupChatService.createGroupChat(params)

      wx.hideLoading()
      wx.showToast({
        title: '创建成功',
        icon: 'success',
        duration: 1000
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    } catch (err) {
      wx.hideLoading()
      console.error('创建群聊失败:', err)
    }
  }
})
