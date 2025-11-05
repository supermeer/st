import SystemInfo from '../../../../utils/system'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    // 生成状态: generating(生成中), success(成功), failed(失败)
    status: 'generating',
    // 生成进度 0-100
    progress: 0,
    // 预估时间
    estimatedTime: '3分钟',
    // 生成的图片URL
    imageUrl: '',
    // 头像URL（裁剪后的）
    avatarUrl: '',
    // 生成参数（从上一页传入）
    generateParams: null,
    // 失败错误信息
    errorMessage: '',
    // 图片卡片样式
    imageCardStyle: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })

    // 计算图片卡片尺寸
    this.calculateImageCardSize()

    // 解析传入的参数
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params))
        this.setData({
          generateParams: params
        })
      } catch (e) {
        console.error('解析参数失败:', e)
      }
    }
  },

  /**
   * 计算图片卡片尺寸
   * 保持屏幕宽高比，同时确保不超出可用空间
   */
  calculateImageCardSize() {
    const systemInfo = wx.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const screenHeight = systemInfo.windowHeight
    const safeAreaBottom = this.data.pageInfo.safeAreaBottom || 0

    // 计算其他元素占用的高度（px）
    const navBarHeight = 44 + (systemInfo.statusBarHeight || 0) // 导航栏
    const avatarHeight = 240 // 头像区域：320rpx
    const footerBtnHeight = 96 // 按钮区域：96rpx
    const ratio = screenWidth / screenHeight

    // 计算图片容器可用空间（px）
    this.setData({
      imageCardStyle: `height: calc(100vh - ${navBarHeight}px - ${avatarHeight}rpx - ${footerBtnHeight}rpx - ${safeAreaBottom}px); width: calc(${ratio} * 100vh - ${navBarHeight * ratio}px - ${avatarHeight * ratio}rpx - ${footerBtnHeight * ratio}rpx - ${safeAreaBottom * ratio}px)`
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 开始生成图片
    this.startGenerate()
  },

  /**
   * 开始生成图片
   */
  startGenerate() {
    // TODO: 调用AI生成图片接口
    console.log('开始生成图片:', this.data.generateParams)

    // 模拟进度更新（测试用）
    // 生产环境应该调用真实的API，并根据API返回的状态更新进度
    this.simulateProgress()
    
    /* 真实API接口示例：
    wx.request({
      url: 'your-api-url',
      method: 'POST',
      data: this.data.generateParams,
      success: (res) => {
        if (res.data.success) {
          // 开始轮询任务状态
          this.pollTaskStatus(res.data.taskId)
        } else {
          this.handleGenerateError(res.data.message || '生成失败')
        }
      },
      fail: (err) => {
        this.handleGenerateError('网络请求失败，请检查网络连接')
      }
    })
    */
  },

  /**
   * 模拟进度更新（仅用于测试）
   * 注意：这是测试代码，生产环境应该删除此方法，使用真实的API轮询
   */
  simulateProgress() {
    const timer = setInterval(() => {
      let progress = this.data.progress + Math.floor(Math.random() * 10) + 5
      
      if (progress >= 100) {
        progress = 100
        clearInterval(timer)
        
        // 模拟生成结果
        // 测试时可以修改概率：
        // Math.random() > 0.2  = 80%成功，20%失败
        // Math.random() > 0.5  = 50%成功，50%失败（方便测试失败情况）
        // Math.random() > 0.8  = 20%成功，80%失败（主要测试失败情况）
        const isSuccess = Math.random() > 0.1
        
        setTimeout(() => {
          if (isSuccess) {
            // 生成成功
            this.setData({
              status: 'success',
              progress: 100,
              // TODO: 这里应该是真实的图片URL
              imageUrl: '/static/role-bg/xxg_bg_mini.jpg'
            })
          } else {
            // 生成失败
            this.handleGenerateError('生成失败，请稍后重试')
          }
        }, 500)
        return
      }
      
      this.setData({ 
        progress: progress
      })
    }, 300)
    
    this.progressTimer = timer
  },

  /**
   * 处理生成错误
   */
  handleGenerateError(errorMsg) {
    this.setData({
      status: 'failed',
      errorMessage: errorMsg || '生成失败，请稍后重试'
    })
    
    // 显示错误提示
    wx.showToast({
      title: errorMsg || '生成失败',
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * 返回对话
   */
  onBackToChat() {
    // 返回到对话页面
    wx.navigateBack({
      delta: 2
    })
  },

  /**
   * 使用该图片作为背景
   */
  onUseAsBackground() {
    const { imageUrl } = this.data
    
    if (!imageUrl) {
      wx.showToast({
        title: '图片不存在',
        icon: 'none'
      })
      return
    }

    // TODO: 保存图片为背景
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    })

    // 延迟返回
    setTimeout(() => {
      this.onBackToChat()
    }, 1500)
  },

  /**
   * 重新生成
   */
  onRegenerate() {
    // 重置所有状态
    this.setData({
      status: 'generating',
      progress: 0,
      errorMessage: '',
      imageUrl: ''
    })
    
    // 开始生成
    this.startGenerate()
  },

  /**
   * 设置头像
   */
  onSetAvatar() {
    const { imageUrl } = this.data
    
    if (!imageUrl) {
      wx.showToast({
        title: '图片不存在',
        icon: 'none'
      })
      return
    }

    // 跳转到裁剪页面
    wx.navigateTo({
      url: `/pages/common/cropper/index?src=${encodeURIComponent(imageUrl)}`,
      events: {
        // 监听裁剪完成事件
        cropperDone: (data) => {
          console.log('裁剪完成:', data)
          // 更新头像显示
          if (data.localPath || data.remoteUrl) {
            this.setData({
              avatarUrl: data.localPath || data.remoteUrl
            })
            
            // TODO: 这里可以调用接口保存用户头像
            wx.showToast({
              title: '头像设置成功',
              icon: 'success'
            })
          }
        }
      }
    })
  },

  /**
   * 保存图片到相册
   */
  onSaveImage() {
    const { imageUrl } = this.data
    
    if (!imageUrl) {
      wx.showToast({
        title: '图片不存在',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...',
      mask: true
    })

    // TODO: 下载并保存图片
    wx.downloadFile({
      url: imageUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading()
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              })
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清理定时器
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
    }
  }
})

