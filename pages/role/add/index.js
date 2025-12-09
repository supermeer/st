import SystemInfo from '../../../utils/system'
import { createCharacter, getCurrentPlotByCharacterId } from '../../../services/role/index'
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
      name: '',
      gender: '',
      description: '',
      descriptionPrompt: '',
      avatarUrl: '',
      scene: '',
      prologue: '',
      styleId: null,
      userAddressedAs: '',
      identity: '',
      personaGender: null,
      defaultBackgroundImage: null,
      backgroundImage: null
    },
    isDev: false,
    styleForm: {
      id: null,
      name: ''
    },
    genderList: ['男', '女', '其他'],
    currentBg: '',
    showUploader: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({
        isDev: true
      })
    }

    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

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

  async onUploadSuccess(e) {
    const { tempFilePath, signature } = e.detail
    const bg = signature && signature.uploadUrl ? signature.uploadUrl.split('?')[0] : tempFilePath
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
    const { formData, isDev } = this.data
    
    // 表单验证
    if (!formData.name) {
      wx.showToast({
        title: '请输入名称',
        icon: 'none'
      })
      return
    }
    
    if (!formData.descriptionPrompt ) {
      wx.showToast({
        title: '请输入角色描述',
        icon: 'none'
      })
      return
    }

    if (isDev && !formData.description) {
      wx.showToast({
        title: '请输入角色概述',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '创建中...',
      mask: true
    })
    
    createCharacter({
      ...formData,
      description: formData.description || formData.descriptionPrompt
    }).then(id => {
      wx.hideLoading()
      wx.showToast({
        title: '创建成功',
        icon: 'success',
        duration: 1000
      })

      const tipDialog = this.selectComponent('#tip-dialog')
      tipDialog.show({
        content: '智能体创建成功！',
        cancelText: '返回',
        confirmText: '去聊天',
        onCancel: () => {
          wx.navigateBack()
        },
        onConfirm: async () => {
          const res = await getCurrentPlotByCharacterId(id)
          wx.redirectTo({
            url: `/pages/chat/index?plotId=${ res && res.plotId ? res.plotId : ''}&characterId=${id}`
          })
        }
      })

    })
  }
})

