Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    visible: false,
    loading: false,
    authorize: 'open'
  },

  methods: {
    /**
     * 显示授权弹窗
     * @param {Object} options 配置项
     * @param {string} options.authorize 当前授权状态：'open' 开放 | 'close' 关闭，默认为 'open'
     */
    show(options = {}) {
      const { authorize = 'open' } = options

      this.setData({
        visible: true,
        loading: false,
        authorize: authorize === 'close' ? 'close' : 'open'
      })
    },

    /**
     * 隐藏弹窗
     */
    hide() {
      this.setData({
        visible: false,
        loading: false
      })
    },

    /**
     * 关闭按钮 / 返回按钮 / 遮罩点击
     */
    onClose() {
      if (this.data.loading) return
      this.hide()
      this.triggerEvent('close')
    },

    /**
     * 遮罩点击
     */
    onMaskClick() {
      this.onClose()
    },

    /**
     * 选择授权选项
     */
    onSelectOption(e) {
      if (this.data.loading) return
      const { value } = e.currentTarget.dataset
      if (!value || value === this.data.authorize) return
      this.setData({ authorize: value })
    },

    /**
     * 点击"创作者激励规则"链接
     */
    onTapRule() {
      this.triggerEvent('taprule')
    },

    /**
     * 用户点击"保存"按钮
     */
    onConfirm() {
      if (this.data.loading) return
      this.triggerEvent('confirm', { authorize: this.data.authorize })
    },

    /**
     * 阻止冒泡空函数
     */
    noop() {}
  }
})