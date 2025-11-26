Component({
  properties: {
    message: Object,
    isLatest: Boolean,
    disabled: {
      type: Boolean,
      value: false
    },
  },
  data: {
    thinkingExpanded: false  // UI 状态：思考过程是否展开
  },
  longPressTimer: null,       // 长按定时器
  methods: {
    // 切换思考过程的展开/收起（纯 UI 逻辑，子组件自己处理）
    toggleThinking() {
      this.setData({
        thinkingExpanded: !this.data.thinkingExpanded
      })
    },
    
    // 重新发送消息（通知父组件）
    onRetry() {
      this.triggerEvent('retry', { 
        messageId: this.properties.message.id 
      })
    },
    
    onButtonClick(e) {
      // 检查是否禁用
      if (this.properties.disabled) {
        wx.showToast({
          title: '对话生成中，请稍候...',
          icon: 'none',
          duration: 1500
        })
        return
      }
      const action = e.currentTarget.dataset.action || e.detail.action;
      this.triggerEvent('buttonClick', { action, current: this, messageId: this.properties.message.id });
    },
    
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
      if (!this.properties.message.id || this.properties.message.loading || this.properties.message.error) {
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
          
          // 计算按钮位置（在消息上方）
          const buttonTop = rect.top - 80 // 按钮高度约 60px + 间距 20px
          const buttonLeft = rect.left + 24 // 与消息左对齐
          // 通知父组件显示蒙版和按钮位置
          this.triggerEvent('maskShow', {
            show: true,
            buttonTop: Math.max(buttonTop, 20), // 确保不超出屏幕顶部
            buttonLeft: buttonLeft,
            messageId: this.properties.message.id,
            messageType: 'role' // 标记为 AI 消息
          })
        }
      })
    },
    
    // 手指离开屏幕
    onTouchEnd() {
      // 清除定时器（如果有）
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
    },
    
  }
})
