import ChatService, { getCommentCategory } from '../../services/ai/chat'

// index.js
Page({
  data: {
    title: '', // 从上级页面传入的标题
    rateScore: 0, // 评分
    commentContent: '', // 评价内容
    originCommentContent: '', // 原始评价内容
    maxCommentLength: 500, // 最大评价长度
    imageList: [], // 上传的图片列表
    maxImageCount: 2, // 最大上传图片数量
    remainTimes: 10,
    categoryInfo: {
      commentLevel: [],
      commentType: '',
      template: '',
      id: null
    },
    formData: {
      menuId: null,
      rateScore: null,
      commentPlatformId: null
    },
    sizeLimit: {
      size: 5,
      unit: 'MB',
      message: '图片大小不超过 {sizeLimit} MB'
    },
    showVipDialog: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        'formData.menuId': options.id
      })
      this.getCommentCategory()
    }
    // 获取从上级页面传入的参数
    if (options.title) {
      this.setData({
        title: options.title
      })
    }
  },
  // 根据类型获取模板、图标、等信息
  getCommentCategory() {
    getCommentCategory({
      menuId: this.data.formData.menuId
    }).then((res) => {
      this.setData({
        categoryInfo: {
          ...res,
          commentLevel: JSON.parse(res.commentLevel)
        },
        formData: {
          ...this.data.formData,
          commentPlatformId: res.id
        }
      })
    })
  },
  // 评分变化处理
  onRateChange(e) {
    this.setData({
      'formData.rateScore': e.detail.value
    })
  },

  // 清空按钮点击处理
  onClearBtnTap() {
    this.setData({
      commentContent: '',
      originCommentContent: ''
    })
    wx.showToast({
      title: '已清空',
      icon: 'success',
      duration: 1500
    })
  },

  // 评价内容输入
  onCommentInput(e) {
    let value = e.detail.value
    if (value.length > this.data.maxCommentLength) {
      value = value.substring(0, this.data.maxCommentLength)
      wx.nextTick(() => {
        this.setData({
          commentContent: value
        })
      })
      return
    }
    this.setData({
      commentContent: value
    })
  },

  onCommentBlur(e) {
    let value = e.detail.value

    // 双重保险：在失焦时再次校验长度
    if (value.length > this.data.maxCommentLength) {
      value = value.substring(0, this.data.maxCommentLength)
      this.setData({
        commentContent: value
      })
    }
  },
  onUndoClick() {
    this.setData({
      commentContent: this.data.originCommentContent,
      originCommentContent: ''
    })
  },

  onTemplateClick() {
    this.setData({
      originCommentContent: this.data.commentContent,
      commentContent: this.data.categoryInfo.template
    })
  },

  // 查看历史记录
  viewHistory() {
    wx.navigateTo({
      url: '/pages/chat/history/index'
    })
  },

  // 立即生成
  generateContent() {
    const { commentContent, imageList, formData } = this.data
    // 校验是否有上传中的文件
    const uploadingFiles = imageList.filter((file) => file.status === 'loading')
    if (uploadingFiles.length > 0) {
      wx.showToast({
        title: '请等待上传完成',
        icon: 'none'
      })
      return
    }

    if (!formData.rateScore && formData.rateScore !== 0) {
      wx.showToast({
        title: '请评分',
        icon: 'none'
      })
      return
    }
    if (!commentContent.trim() && imageList.length === 0) {
      wx.showToast({
        title: '请输入评价内容或上传图片',
        icon: 'none'
      })
      return
    }

    // 提交数据到服务器
    wx.showLoading({
      title: '生成中...',
      mask: true
    })
    ChatService.createSession({
      menuId: formData.menuId,
      commentPlatformId: formData.commentPlatformId
    })
      .then((res) => {
        const sessionId = res
        wx.setStorageSync('commentContent', commentContent)
        wx.setStorageSync('rateScore', formData.rateScore)
        wx.setStorageSync(
          'imageKeys',
          imageList.map((item) => item.fileKey) || []
        )
        wx.setStorageSync(
          'imageList',
          imageList.map((item) => item.url)
        )
        wx.redirectTo({
          url: `/pages/chat/session/index?sessionId=${sessionId}&isCreate=true`
        })
      })
      .catch((err) => {
        if (err.code === 402) {
          this.setData({
            showVipDialog: true
          })
        }
      })
      .finally(() => {
        wx.hideLoading()
      })
  },
  onOpenVip() {
    wx.navigateTo({
      url: '/pages/vip/packages/index'
    })
    this.setData({
      showVipDialog: false
    })
  },
  onCancel() {
    this.setData({
      showVipDialog: false
    })
  },
  handleRemove(e) {
    const { index } = e.detail
    const { imageList } = this.data
    imageList.splice(index, 1)
    this.setData({
      imageList
    })
  },
  onFilesChange(e) {
    const { files } = e.detail
    this.setData({ imageList: files })
  }
})
