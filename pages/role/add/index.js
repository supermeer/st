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
    // {<br/>    "name" : "角色卡1",<br/>    "gender": "男",<br/>    "description":"角色描述（展示用）",<br/>    "descriptionPrompt":"角色描述（提示词用）",<br/>    // 故事相关<br/>    "storyTitle":"故事标题",<br/>    "scene":"故事场景",<br/>    "prologue":"故事开场白",<br/>    //对话风格相关<br/>    "styleTitle":"风格标题",<br/>    "styleDescription":"风格描述",<br/>    "chatExample":"大模型回复示例",<br/>    //对我的设定相关<br/>    "userAddressedAs":"哥哥",<br/>    "identity":"用户是一个996社畜",<br/>    "personaGender":"男",<br/>    "defaultBackgroundImage":"默认背景图片"<br/>}
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
    const { value } = e.detail
    this.setData({
      [`formData.${field}`]: value
    })
  },

  /**
   * 文本域变化
   */
  onTextareaChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail.value
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
        ...styleForm,
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
        backgrounds: [
          {
            id: 'default',
            name: '默认背景',
            image: 'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png'
          }
        ],
        selectedId: this.data.formData.chatBackground,
        onConfirm: (background) => {
          if (background) {
            this.setData({
              'formData.chatBackground': background.id
            })
          }
        },
        onCancel: () => {
          wx.navigateTo({
            url: '/pages/common/pic-generate/index'
          })
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
    
    // TODO: 调用接口保存角色信息
    console.log('提交智能体信息:', formData)
    
    wx.showLoading({
      title: '创建中...',
      mask: true
    })
    
    // 模拟异步请求
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '创建成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        }
      })
    }, 1000)
  }
})

