import SystemInfo from '../../../utils/system'
import { createCharacter, updateCharacter, getCurrentPlotByCharacterId, getCharacterDetail } from '../../../services/role/index'
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
      backgroundImage: null
    },
    worldBookList: [],
    styleForm: {
      id: null,
      name: ''
    },
    genderList: ['男', '女', '其他'],
    currentBg: '',
    showUploader: false,
    showAdvancedSetting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({
        'formData.id': id
      })
      this.getCharacterById(id)
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  getCharacterById(id) {
    getCharacterDetail(id)
    .then(res => {
      const { scene, prologue } = res.defaultStoryDetail || {}
      this.setData({
        formData: {
          ...this.data.formData,
          ...res,
          scene: scene || '',
          prologue: prologue || '',
          descriptionPrompt: res.descriptionPrompt || res.description || '',
        },
        currentBg: res.backgroundImage,
        worldBookList: res.prompt ? JSON.parse(res.prompt) : []
      })
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
    const { formData } = this.data
    
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
        title: '请输入智能体设定',
        icon: 'none'
      })
      return
    }

    // if (!formData.description) {
    //   wx.showToast({
    //     title: '请输入角色描述',
    //     icon: 'none'
    //   })
    //   return
    // }
    
    const method = formData.id ? updateCharacter : createCharacter

    wx.showLoading({
      title: `${method === updateCharacter ? '更新中...' : '创建中...'}`,
      mask: true
    })
    
    method({
      ...formData,
      description: formData.description || formData.descriptionPrompt
    }).then(id => {
      const characterId = formData.id || id
      wx.hideLoading()
      wx.showToast({
        title: `${method === updateCharacter ? '更新成功' : '创建成功'}`,
        icon: 'success',
        duration: 1000
      })

      const tipDialog = this.selectComponent('#tip-dialog')
      tipDialog.show({
        content: `${method === updateCharacter ? '更新成功' : '创建成功'}`,
        cancelText: '返回',
        confirmText: '去聊天',
        onCancel: () => {
          wx.navigateBack()
        },
        onConfirm: async () => {
          const res = await getCurrentPlotByCharacterId(characterId)
          wx.redirectTo({
            url: `/pages/chat/index?plotId=${ res && res.plotId ? res.plotId : ''}&characterId=${characterId}`
          })
        }
      })

    })
  }
})

