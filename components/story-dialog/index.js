Component({
  properties: {},

  data: {
    visible: false,
    roles: [],
    formData: {
      plotName: '',
      plotSetting: '',
      prologue: '',
      prologueCharacterId: null
    }
  },

  methods: {
    /**
     * 显示弹窗
     * @param {Object} options 配置项
     * @param {Array} options.roles 开场白角色列表 [{ id, name, avatarUrl, prologue }]
     * @param {Function} options.onCancel 取消回调
     * @param {Function} options.onConfirm 确认回调，参数为 { plotName, plotSetting, prologue, prologueCharacterId }
     */
    show(options = {}) {
      const { roles = [], onCancel, onConfirm } = options

      this._onCancel = onCancel
      this._onConfirm = onConfirm

      this.setData({
        visible: true,
        roles,
        formData: {
          plotName: '',
          plotSetting: '',
          prologue: '',
          prologueCharacterId: null
        }
      })
    },

    /**
     * 隐藏弹窗
     */
    hide() {
      this.setData({
        visible: false
      })
      this._onCancel = null
      this._onConfirm = null
    },

    /**
     * 关闭按钮
     */
    handleClose() {
      this._handleCancel()
    },

    /**
     * 点击遮罩
     */
    handleMaskClick() {
      this._handleCancel()
    },

    /**
     * 内部取消处理
     */
    _handleCancel() {
      if (typeof this._onCancel === 'function') {
        this._onCancel()
      }
      this.hide()
    },

    /**
     * 输入框变化
     */
    onInputChange(e) {
      const { field } = e.currentTarget.dataset
      const value = e.detail.value || ''
      this.setData({
        [`formData.${field}`]: value
      })
    },

    /**
     * 文本域变化
     */
    onTextareaChange(e) {
      const { field } = e.currentTarget.dataset
      const value = e.detail.value || ''
      this.setData({
        [`formData.${field}`]: value
      })
    },

    /**
     * 清除输入框
     */
    onClearInput(e) {
      const { field } = e.currentTarget.dataset
      this.setData({
        [`formData.${field}`]: ''
      })
    },

    /**
     * 选择开场白角色
     */
    onSelectPrologueCharacter(e) {
      const { id, name } = e.currentTarget.dataset

      if (id === 'player') {
        // 选择玩家作为开场白
        this.setData({
          'formData.prologueCharacterId': 'player',
          'formData.prologue': '由玩家开启群聊第一句话。'
        })
      } else {
        // 选择群成员作为开场白，回填该角色的开场白
        const character = this.data.roles.find(c => c.id == id)
        if (character) {
          this.setData({
            'formData.prologueCharacterId': character.id,
            'formData.prologue': character.prologue || `你好，我是${name}。`
          })
        }
      }
    },

    /**
     * 保存
     */
    onConfirm() {
      const { formData } = this.data

      if (!formData.plotName) {
        wx.showToast({
          title: '请输入故事名称',
          icon: 'none'
        })
        return
      }
      if (!formData.plotSetting) {
        wx.showToast({
          title: '请输入故事设定',
          icon: 'none'
        })
        return
      }
      if (!formData.prologue) {
        wx.showToast({
          title: '请输入开场白',
          icon: 'none'
        })
        return
      }

      if (typeof this._onConfirm === 'function') {
        this._onConfirm({
          plotName: formData.plotName,
          plotSetting: formData.plotSetting,
          prologue: formData.prologue,
          prologueCharacterId: formData.prologueCharacterId
        })
      }

      this.hide()
    }
  }
})