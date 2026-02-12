Component({
  properties: {},

  data: {
    visible: false,
    content: '抱歉！我走神啦！\n原谅我这一次好不好呀~',
    confirmText: '再给你一次机会'
  },

  methods: {
    show(options = {}) {
      const {
        title = null,
        content = '抱歉！我走神啦！\n原谅我这一次好不好呀~',
        confirmText = '再给你一次机会',
        onConfirm
      } = options

      this._onConfirm = onConfirm

      this.setData({
        visible: true,
        content,
        confirmText
      })
    },

    /**
     * 隐藏对话框
     */
    hide() {
      this.setData({
        visible: false
      })
      this._onConfirm = null
    },
    
    // 确认按钮回调
    handleConfirm() {
      if (typeof this._onConfirm === 'function') {
        this._onConfirm()
      }
      this.hide()
    },

    // 点击遮罩层
    handleMaskClick() {
      this.hide()
    }
  }
})

