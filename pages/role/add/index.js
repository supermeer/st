import SystemInfo from '../../../utils/system'
import { createCharacter } from '../../../services/role/index'
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
      defaultBackgroundImage: null
    },
    styleForm: {
      id: null,
      name: ''
    },
    genderList: ['男', '女', '其他']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // TODO: 上传图片到服务器
        this.setData({
          'formData.avatar': tempFilePath
        })
      }
    })
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
      url: '/pages/role/my-setting/index'
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
    const backgroundSheet = this.selectComponent('#backgroundSheet')
    if (backgroundSheet) {
      backgroundSheet.show({
        title: '聊天背景',
        cancelText: '创建专属背景',
        confirmText: '设为背景',
        backgrounds: [],
        selectedId: this.data.formData.chatBackground,
        onConfirm: (background) => {
          if (background) {
            this.setData({
              'formData.chatBackground': background.id
            })
          }
        },
        onCancel: () => {
          // wx.navigateTo({
          //   url: '/pages/common/pic-generate/index'
          // })
        }
      })
    }
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
    
    if (!formData.description) {
      wx.showToast({
        title: '请输入角色描述',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '创建中...',
      mask: true
    })
    
    createCharacter(formData).then(res => {
      console.log(res, 'res----------')
      wx.hideLoading()
      wx.showToast({
        title: '创建成功',
        icon: 'success',
        duration: 1000
      })
      wx.navigateBack()
    })
  }
})

