Component({
  properties: {
    message: Object,
    disabled: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
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
      const action = e.currentTarget.dataset.action;
      this.triggerEvent('buttonClick', { action, current: this, messageId: this.properties.message.id, include: true });
    },
    closeSwipeCell() {
      // 通过 id 获取侧滑组件实例
      const swipeCell = this.selectComponent('#swipeCell');
      if (swipeCell && swipeCell.close) {
        swipeCell.close();
      }
    },
    handleRollback() {
      console.log('执行撤回操作');
      // 实现撤回逻辑
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
