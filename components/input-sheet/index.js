Component({
  properties: {},

  data: {
    visible: false,
    title: '创建新剧情',
    label: '剧情名称',
    placeholder: '请输入',
    cancelText: '取消',
    confirmText: '保存',
    inputValue: '',
    maxlength: 50
  },

  methods: {
    /**
     * 显示输入框弹窗
     * @param {Object} options 配置项
     * @param {String} options.title 标题
     * @param {String} options.label 输入框标签
     * @param {String} options.placeholder 输入框占位符
     * @param {String} options.cancelText 取消按钮文字
     * @param {String} options.confirmText 确认按钮文字
     * @param {String} options.value 输入框默认值
     * @param {Number} options.maxlength 最大输入长度
     * @param {Function} options.onCancel 取消回调
     * @param {Function} options.onConfirm 确认回调，参数为输入的值
     */
    show(options = {}) {
      const {
        title = '创建新剧情',
        label = '剧情名称',
        placeholder = '请输入',
        cancelText = '取消',
        confirmText = '保存',
        value = '',
        maxlength = 50,
        onCancel,
        onConfirm
      } = options

      // 保存回调函数到组件实例
      this._onCancel = onCancel
      this._onConfirm = onConfirm

      this.setData({
        visible: true,
        title,
        label,
        placeholder,
        cancelText,
        confirmText,
        inputValue: value,
        maxlength
      })
    },

    /**
     * 隐藏弹窗
     */
    hide() {
      this.setData({
        visible: false,
        inputValue: ''
      })
      // 清除回调函数
      this._onCancel = null
      this._onConfirm = null
    },

    // 输入框变化
    handleInput(e) {
      this.setData({
        inputValue: e.detail.value
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
        this._onConfirm(this.data.inputValue)
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

