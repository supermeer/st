import SystemInfo from '../../../utils/system'
import { createPersona, getPersonaDetail, updatePersona, getDefaultPersona, updateDefaultPersona } from '../../../services/role/index'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    avatarUrl: null,
    plotId: null,
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
      this.getGlobalPersona()
    }
    if (options.plotId) {
      this.setData({
        plotId: options.plotId
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
  
  getGlobalPersona() {
    getDefaultPersona()
    .then(res => {
      this.setData({
        formData: {
          ...this.data.formData,
          ...res
        }
      })
    })
  },

  updateGlobalPersona() {
    updateDefaultPersona(this.data.formData)
    .then(res => {
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        duration: 1000
      })
      wx.navigateBack()
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
    
    if (this.data.isGlobal) {
      this.updateGlobalPersona()
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

    if (!this.data.plotId) {
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
      plotId: this.data.plotId
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

