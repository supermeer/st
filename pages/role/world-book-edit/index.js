import SystemInfo from '../../../utils/system'

Page({
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    currentBg: '',
    mode: 'add',
    formData: {
      title: '',
      msgType: 'system',
      content: ''
    },
    typeOptions: [
      { label: '系统', value: 'system' },
      { label: 'AI', value: 'ai' },
      { label: '用户', value: 'user' }
    ]
  },

  onLoad(options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })

    // 获取上一页面传递的数据
    const eventChannel = this.getOpenerEventChannel()
    if (eventChannel && eventChannel.on) {
      eventChannel.on('acceptDataFromOpenerPage', (data) => {
        const { background, mode, item } = data
        const updateData = {
          currentBg: background || '',
          mode: mode || 'add'
        }

        // 如果是编辑模式，填充表单数据
        if (mode === 'edit' && item) {
          updateData.formData = {
            title: item.title || '',
            msgType: item.msgType || 'system',
            content: item.content || ''
          }
        }

        this.setData(updateData)
      })
    }
  },

  /**
   * 输入标题
   */
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  /**
   * 选择类型
   */
  onTypeSelect(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      'formData.msgType': type
    })
  },

  /**
   * 输入内容
   */
  onContentInput(e) {
    this.setData({
      'formData.content': e.detail.value
    })
  },

  /**
   * 保存
   */
  onSave() {
    const { formData } = this.data

    // 验证
    if (!formData.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }

    if (!formData.content.trim()) {
      wx.showToast({
        title: '请输入提示词',
        icon: 'none'
      })
      return
    }

    // 通过 eventChannel 传递数据给上一页
    const eventChannel = this.getOpenerEventChannel()
    if (eventChannel && eventChannel.emit) {
      eventChannel.emit('acceptDataFromEditPage', {
        item: {
          title: formData.title.trim(),
          msgType: formData.msgType,
          content: formData.content.trim()
        }
      })
    }

    wx.navigateBack()
  }
})
