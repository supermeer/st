import SystemInfo from '../../../utils/system'
import { submitFeedback } from '../../../services/feedback/index'

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
    imageFiles: [],
    maxLength: 500,
    isSubmitting: false
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
   * 反馈内容输入
   */
  onContentInput(event) {
    this.setData({
      'formData.content': event.detail.value
    })
  },

  /**
   * 图片上传成功
   */
  onImageSuccess(event) {
    const { remoteUrl, fileKey } = event.detail
    console.log('图片上传成功:', remoteUrl)
  },

  /**
   * 图片列表变化
   */
  onImageChange(event) {
    const files = event.detail.files || []
    this.setData({
      imageFiles: files
    })
  },

  /**
   * 删除图片
   */
  onImageRemove(event) {
    const { index } = event.detail
    const newFiles = [...this.data.imageFiles]
    newFiles.splice(index, 1)
    this.setData({
      imageFiles: newFiles
    })
  },

  /**
   * 提交反馈
   */
  async onSubmit() {
    const { content } = this.data.formData
    const { imageFiles, isSubmitting } = this.data

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

    // 检查是否有图片正在上传
    const uploading = imageFiles.some(file => file.status === 'loading')
    if (uploading) {
      wx.showToast({
        title: '图片上传中，请稍候',
        icon: 'none'
      })
      return
    }

    this.setData({ isSubmitting: true })

    try {
      // 获取已上传成功的图片URL
      const images = imageFiles
        .filter(file => file.status === 'done' && file.remoteUrl)
        .map(file => file.remoteUrl)

      const data = {
        content: content.trim(),
        images
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

