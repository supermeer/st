// pages/role/add/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      name: '',
      description: '',
      avatar: '',
      personality: '',
      tags: []
    },
    tagList: ['热情', '温柔', '幽默', '理性', '感性', '活泼', '沉稳'],
    selectedTags: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
   * 标签选择
   */
  onTagClick(e) {
    const { tag } = e.currentTarget.dataset
    const selectedTags = [...this.data.selectedTags]
    const index = selectedTags.indexOf(tag)
    
    if (index > -1) {
      selectedTags.splice(index, 1)
    } else {
      selectedTags.push(tag)
    }
    
    this.setData({
      selectedTags,
      'formData.tags': selectedTags
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
   * 提交表单
   */
  onSubmit() {
    const { formData } = this.data
    
    // 表单验证
    if (!formData.name) {
      wx.showToast({
        title: '请输入角色名称',
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
    console.log('提交角色信息:', formData)
    
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  }
})

