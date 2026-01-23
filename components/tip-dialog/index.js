Component({
  properties: {},

  data: {
    visible: false,
    hideTopIcon: false,
    contentAlign: '',
    title: null,
    content: '回溯后，该条消息之后的对话将被清除，且不可撤回。',
    cancelText: '取消',
    confirmText: '确认'
  },

  methods: {
    /**
     * 显示对话框
     * @param {Object} options 配置项
     * @param {String} options.content 提示内容
     * @param {String} options.cancelText 取消按钮文字
     * @param {String} options.confirmText 确认按钮文字
     * @param {Function} options.onCancel 取消回调
     * @param {Function} options.onConfirm 确认回调
     */
    show(options = {}) {
      const {
        title = null,
        hideTopIcon = false,
        contentAlign = '',
        content = '回溯后，该条消息之后的对话将被清除，且不可撤回。',
        cancelText = '取消',
        confirmText = '确认',
        onCancel,
        onConfirm
      } = options

      // 保存回调函数到组件实例
      this._onCancel = onCancel
      this._onConfirm = onConfirm

      this.setData({
        visible: true,
        title,
        contentAlign,
        hideTopIcon,
        content,
        cancelText,
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
      // 清除回调函数
      this._onCancel = null
      this._onConfirm = null
    },

    // 取消按钮回调
    handleCancel() {
      if (typeof this._onCancel === 'function') {
        this._onCancel()
      }
      this.hide()
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
      this.handleCancel()
    }
  }
})

