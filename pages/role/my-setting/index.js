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
    roleId: null,
    chatInfo: {
      name: '沈川寒',
      avatar: 'https://img.zcool.cn/community/01c8b25e8f8f8da801219c779e8c95.jpg@1280w_1l_2o_100sh.jpg',
      identity: '便利店的温柔店员'
    },
    formData: {
      userAddressedAs: '',
      personaGender: '',
      identity: ''
    },
    isGlobal: false,
    globalDesc: '对已设置好的智能体不作变更，仅对后续新聊天的智能体作默认设置。'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取传递的参数
    if (options.chatId) {
      this.loadChatSettings(options.chatId)
    }
    if (options.isGlobal) {
      this.setData({
        isGlobal: true
      })
    }
    if (options.roleId) {
      this.setData({
        roleId: options.roleId
      })
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  /**
   * 加载对话设定
   */
  loadChatSettings(chatId) {
    // TODO: 调用接口获取已保存的对话设定
    console.log('加载对话设定:', chatId)
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
      'formData.personaGender': gender
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
    const { userAddressedAs, personaGender, identity } = this.data.formData

    // 验证必填项
    if (!userAddressedAs.trim()) {
      wx.showToast({
        title: '请输入称呼',
        icon: 'none'
      })
      return
    }

    if (!personaGender) {
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

    if (!this.data.roleId) {
      // 直接调用上一页面传递的回调函数
      const prevPage = getCurrentPages()[getCurrentPages().length - 2]
      prevPage.confirmUserSettings({
        userAddressedAs: userAddressedAs,
        identity: identity,
        personaGender: personaGender
      })
      wx.navigateBack()
      return
    }

    // TODO: 调用接口保存对话设定
    console.log('保存对话设定:', this.data.formData)

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      }
    })
  }
})

