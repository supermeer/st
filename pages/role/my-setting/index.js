import SystemInfo from '../../../utils/system'
import { createPersona, getPersonaDetail, updatePersona } from '../../../services/role/index'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    storyId: null,
    avatarUrl: null,
    formData: {
      userAddressedAs: '',
      gender: '',
      identity: '',
      id: null
    },
    isGlobal: false,
    globalDesc: '对已设置好的智能体不作变更，仅对后续新聊天的智能体作默认设置。'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取传递的参数
    if (options.personaId) {
      this.setData({
        formData: {
          ...this.data.formData,
          id: options.personaId
        }
      })
      this.loadChatSettings()
    }
    if (options.avatarUrl) {
      this.setData({
        avatarUrl: options.avatarUrl
      })
    }
    if (options.isGlobal) {
      this.setData({
        isGlobal: true
      })
    }
    if (options.storyId) {
      this.setData({
        storyId: options.storyId
      })
    }
    if (options.gender || options.userAddressedAs || options.identity) {
      this.setData({
        formData: {
          ...this.data.formData,
          gender: options.gender || this.data.formData.gender,
          userAddressedAs: options.userAddressedAs || this.data.formData.userAddressedAs,
          identity: options.identity || this.data.formData.identity
        }
      })
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  loadChatSettings() {
    getPersonaDetail(this.data.formData.id)
    .then(res => {
      this.setData({
        formData: {
          ...this.data.formData,
          ...res
        }
      })
    })
  },

  /**
   * 称呼输入
   */
  onUserAddressedAsInput(event) {
    this.setData({
      'formData.userAddressedAs': event.detail.value
    })
  },

  /**
   * 性别选择
   */
  onGenderChange(event) {
    const gender = event.currentTarget.dataset.gender
    this.setData({
      'formData.gender': gender
    })
  },

  /**
   * 描述输入
   */
  onIdentityInput(event) {
    this.setData({
      'formData.identity': event.detail.value
    })
  },

  /**
   * 提交表单
   */
  onSubmit() {
    const { userAddressedAs, gender, identity } = this.data.formData

    // 验证必填项
    if (!userAddressedAs.trim()) {
      wx.showToast({
        title: '请输入称呼',
        icon: 'none'
      })
      return
    }

    if (!gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return
    }

    if (!identity.trim()) {
      wx.showToast({
        title: '请描述一下自己',
        icon: 'none'
      })
      return
    }
    
    if (this.data.formData.id) {
      updatePersona({
        ...this.data.formData,
      })
      .then(res => {
        wx.showToast({
          title: '更新成功',
          icon: 'success',
          duration: 1000
        })  
        wx.navigateBack()
      })
      return
    }

    if (!this.data.storyId) {
      // 直接调用上一页面传递的回调函数
      const prevPage = getCurrentPages()[getCurrentPages().length - 2]
      prevPage.confirmUserSettings({
        userAddressedAs: userAddressedAs,
        identity: identity,
        personaGender: gender
      })
      wx.navigateBack()
      return
    }

    createPersona({
      ...this.data.formData,
      storyId: this.data.storyId
    })
    .then(res => {
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1000
      })
      wx.navigateBack()
    })
  }
})

