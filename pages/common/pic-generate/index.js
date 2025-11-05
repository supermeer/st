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
    // 图片风格列表
    styleList: [
      {
        id: 'anime',
        name: '日漫风',
        image: '/static/role-bg/xxg_bg_mini.jpg'
      },
      {
        id: 'cute',
        name: '可爱风',
        image: '/static/role-bg/xxg_bg_mini.jpg'
      },
      {
        id: 'realistic',
        name: '写实风',
        image: '/static/role-bg/xxg_bg_mini.jpg'
      },
      {
        id: 'creative',
        name: '创意',
        image: '/static/role-bg/xxg_bg_mini.jpg'
      },
      {
        id: 'chinese',
        name: '国风',
        image: '/static/role-bg/xxg_bg_mini.jpg'
      }
    ],
    // 选中的风格
    selectedStyle: '',
    // 文字描述
    description: '',
    // 最大字数
    maxLength: 300,
    // 优化提示词开关
    optimizePrompt: false,
    optimizeForm: {
      visible: false,
    }
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
   * 选择风格
   */
  onSelectStyle(e) {
    const { id } = e.currentTarget.dataset
    this.setData({
      selectedStyle: id
    })
  },

  /**
   * 文字描述输入
   */
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    })
  },

  onOptimizeBtnTap() {
    if (!this.data.description.length) {
      return
    }
    this.setData({
      'optimizeForm.visible': true
    })
  },

  onOptimizeConfirm(e) {
    const { optimizedText } = e.detail
    this.setData({
      description: optimizedText,
      'optimizeForm.visible': false
    })
  },
  onOptimizeCancel() {
    this.setData({
      'optimizeForm.visible': false
    })
  },

  /**
   * 生成图片
   */
  onGenerate() {
    const { selectedStyle, description, optimizePrompt } = this.data

    // 验证
    if (!description.trim()) {
      wx.showToast({
        title: '请输入文字描述',
        icon: 'none'
      })
      return
    }

    // 准备生成参数
    const params = {
      style: selectedStyle,
      description,
      optimizePrompt
    }

    // 跳转到生成结果页面
    wx.navigateTo({
      url: `/pages/common/pic-generate/result/index?params=${encodeURIComponent(JSON.stringify(params))}`
    })
  }
})

