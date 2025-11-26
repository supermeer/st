Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {},

  data: {
    visible: false,
    title: '记忆力增强',
    subtitle: '最大对话长度，将影响每次对话所消耗的积分值。',
    cancelText: '返回',
    confirmText: '保存',
    memoryOptions: [],
    selectedOption: null,
    currentOptionId: null // 用于标记"当前"选中的选项
  },

  methods: {
    /**
     * 显示记忆力设置弹窗
     * @param {Object} options 配置项
     * @param {String} options.title 标题
     * @param {String} options.subtitle 副标题
     * @param {Array} options.memoryOptions 记忆选项列表，格式：[{id, name, description, icon}]
     * @param {String} options.selectedId 当前选中的记忆选项ID
     * @param {String} options.cancelText 取消按钮文字
     * @param {String} options.confirmText 确认按钮文字
     * @param {Function} options.onCancel 取消回调
     * @param {Function} options.onConfirm 确认回调，参数为选中的记忆选项对象
     */
    show(options = {}) {
      const {
        title = '记忆力增强',
        subtitle = '最大对话长度，将影响每次对话所消耗的积分值。',
        memoryOptions = this._getDefaultOptions(),
        selectedId = null,
        cancelText = '返回',
        confirmText = '保存',
        onCancel,
        onConfirm
      } = options

      // 保存回调函数到组件实例
      this._onCancel = onCancel
      this._onConfirm = onConfirm

      // 找到当前选中的记忆选项
      const selectedOption = memoryOptions.find(opt => opt.id === selectedId) || memoryOptions[0] || null

      this.setData({
        visible: true,
        title,
        subtitle,
        memoryOptions,
        selectedOption,
        currentOptionId: selectedId,
        cancelText,
        confirmText
      })
    },

    /**
     * 获取默认的记忆选项
     */
    _getDefaultOptions() {
      return [
        {
          id: 'basic',
          name: '基础记忆',
          description: '记要点不记细节，简单唠嗑够用～',
          icon: '/static/chat/memory_basic.png'
        },
        {
          id: 'good',
          name: '较好记忆',
          description: '话题不脱节，日常聊天超顺畅！',
          icon: '/static/chat/memory_good.png'
        },
        {
          id: 'deep',
          name: '深度记忆',
          description: '越聊越懂你，像熟朋友一样～但提升积分消耗速度哦！',
          icon: '/static/chat/memory_deep.png'
        },
        {
          id: 'super',
          name: '超强记忆',
          description: '连你随口说的细节都记得，互动超有默契！但超吃积分!!',
          icon: '/static/chat/memory_super.png'
        }
      ]
    },

    /**
     * 隐藏弹窗
     */
    hide() {
      this.setData({
        visible: false
      })
      // 清除回调函数
      this._onCancel = null
      this._onConfirm = null
    },

    // 选择记忆选项
    handleSelectOption(e) {
      const { index } = e.currentTarget.dataset
      const selectedOption = this.data.memoryOptions[index]
      
      this.setData({
        selectedOption
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
      if (!this.data.selectedOption) {
        wx.showToast({
          title: '请选择记忆选项',
          icon: 'none'
        })
        return
      }
      if (typeof this._onConfirm === 'function') {
        this._onConfirm(this.data.selectedOption)
      }
      this.hide()
    },

    // 关闭按钮
    handleClose() {
      this.handleCancel()
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
