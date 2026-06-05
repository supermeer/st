import SystemInfo from '../../../utils/system'
import { submitFeedback, getFeedbackTypes } from '../../../services/feedback/index'

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
      content: ''
    },
    categories: [],
    imageUrl: '',
    maxLength: 5000,
    isSubmitting: false,
    showUploader: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
    getFeedbackTypes().then(res => {
      this.setData({
        categories: res
      })
    })
  },

  /**
   * 反馈内容输入
   */
  onContentInput(event) {
    this.setData({
      'formData.content': event.detail.value
    })
  },

  /**
   * 切换反馈分类选中状态
   */
  onCategoryToggle(event) {
    const index = event.currentTarget.dataset.index
    const categories = this.data.categories.map((item, i) => {
      if (i === index) return { ...item, checked: !item.checked }
      return item
    })
    this.setData({ categories })
  },

  /**
   * 联系客服
   */
  onContactService() {
    this.selectComponent('#csDialog').show()
  },

  /**
   * 删除图片
   */
  onImageRemove(event) {
    this.setData({
      imageUrl: null
    })
  },

  /**
   * 打开图片上传器
   */
  onOpenUploader() {
    this.setData({ showUploader: true })
  },

  /**
   * 自定义图片上传成功（image-uploader）
   */
  onUploadSuccess(e) {
    const { tempFilePath, signature } = e.detail || {}
    const remoteUrl = signature && signature.uploadUrl ? (signature.uploadUrl.split('?')[0]) : ''
    this.setData({
      imageUrl: remoteUrl || '',
      showUploader: false
    })
  },

  /**
   * 自定义图片上传失败
   */
  onUploadFail(e) {
    const message = (e && e.message) || '上传失败'
    wx.showToast({ title: message, icon: 'none' })
    this.setData({ showUploader: false })
  },

  /**
   * 取消上传
   */
  onUploadCancel() {
    this.setData({ showUploader: false })
  },

  /**
   * 提交反馈
   */
  async onSubmit() {
    const { content } = this.data.formData
    const { imageUrl, isSubmitting } = this.data

    // 防止重复提交
    if (isSubmitting) {
      return
    }

    // 验证必填项
    if (!content.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }

    // 验证字数限制
    if (content.length > this.data.maxLength) {
      wx.showToast({
        title: `反馈内容不能超过${this.data.maxLength}字`,
        icon: 'none'
      })
      return
    }

    this.setData({ isSubmitting: true })

    try {
      const typeIds = this.data.categories.filter(item => item.checked).map(item => item.id)

      const data = {
        content: content.trim(),
        typeIds,
        imageUrl: this.data.imageUrl
      }

      await submitFeedback(data)

      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      })

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)

    } catch (error) {
      console.error('提交反馈失败:', error)
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
      this.setData({ isSubmitting: false })
    }
  }
})

