Component({
  properties: {},

  data: {
    visible: false,
    title: '选择背景',
    cancelText: '取消',
    confirmText: '确定',
    backgrounds: [],
    selectedBackground: null,
    aspectRatio: 2 // 背景图宽高比，2:1 横向比例
  },

  methods: {
    /**
     * 显示背景选择弹窗
     * @param {Object} options 配置项
     * @param {String} options.title 标题
     * @param {Array} options.backgrounds 背景列表，格式：[{id, image, name}]
     * @param {String} options.selectedId 当前选中的背景ID
     * @param {String} options.cancelText 取消按钮文字
     * @param {String} options.confirmText 确认按钮文字
     * @param {Function} options.onCancel 取消回调
     * @param {Function} options.onConfirm 确认回调，参数为选中的背景对象
     */
    show(options = {}) {
      const {
        title = '选择背景',
        backgrounds = [],
        selectedId = null,
        cancelText = '取消',
        confirmText = '确定',
        onCancel,
        onConfirm
      } = options

      // 保存回调函数到组件实例
      this._onCancel = onCancel
      this._onConfirm = onConfirm

      // 找到当前选中的背景
      const selectedBackground = backgrounds.find(bg => bg.id === selectedId) || null

      this.setData({
        visible: true,
        title,
        backgrounds,
        selectedBackground,
        cancelText,
        confirmText
      })
    },

    /**
     * 隐藏弹窗
     */
    hide() {
      this.setData({
        visible: false,
        selectedBackground: null
      })
      // 清除回调函数
      this._onCancel = null
      this._onConfirm = null
    },

    // 选择背景
    handleSelectBackground(e) {
      const { index } = e.currentTarget.dataset
      const selectedBackground = this.data.backgrounds[index]
      
      this.setData({
        selectedBackground
      })
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
        this._onConfirm(this.data.selectedBackground)
      }
      this.hide()
    },

    // 点击遮罩层
    handleMaskClick() {
      this.handleCancel()
    },

    // 阻止事件冒泡
    preventMove() {
      return false
    }
  }
})

