Component({
  properties: {
    message: Object,
    disabled: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  longPressTimer: null,
  methods: {
    // 长按事件处理
    onLongPress(e) {
      // 检查是否禁用
      if (this.properties.disabled) {
        wx.showToast({
          title: '对话生成中，请稍候...',
          icon: 'none',
          duration: 1500
        })
        return
      }
      
      // 检查消息是否有效
      if (!this.properties.message.id) {
        return
      }
      
      // 震动反馈
      wx.vibrateShort({ type: 'light' })
      
      // 获取消息元素位置
      const query = this.createSelectorQuery()
      query.select(`#msg-content-${this.properties.message.id}`).boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec((res) => {
        if (res[0]) {
          const rect = res[0]
          const screenWidth = wx.getSystemInfoSync().windowWidth
          
          // 计算按钮位置（在消息上方，右对齐）
          const buttonTop = rect.top - 80
          const buttonRight = screenWidth - rect.right + 24 // 从右侧计算
          
          // 通知父组件显示蒙版和按钮位置
          this.triggerEvent('maskShow', {
            show: true,
            buttonTop: Math.max(buttonTop, 20),
            buttonRight: buttonRight, // 使用 right 而不是 left
            messageId: this.properties.message.id,
            messageType: 'user' // 标记为用户消息
          })
        }
      })
    },
    
    // 手指离开屏幕
    onTouchEnd() {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
    },
    
    onButtonClick(e) {
      const action = e.currentTarget.dataset.action;
      this.triggerEvent('buttonClick', { action, current: this, messageId: this.properties.message.id, include: true });
    },
    previewImage(e) {
      const { current } = e.currentTarget.dataset
      const urls = this.properties.message.images.map((img) => (typeof img === 'string' ? img : img.url))
      wx.previewImage({
        urls: urls,
        current: current
      })
    },
  }
})
