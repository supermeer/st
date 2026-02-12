import { setGlobalModel } from '../../services/usercenter/index'
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {},

  data: {
    visible: false,
    title: '模型切换',
    subtitle: '不同模型，智能体对话效果及积分消耗都会不同哦~',
    cancelText: '返回',
    confirmText: '确认',
    modelOptions: [],
    selectedOption: null,
    currentValue: null,
    loading: false
  },

  methods: {
    show(options = {}) {
      const {
        title = '模型切换',
        subtitle = '不同模型，智能体对话效果及积分消耗都会不同哦~',
        modelOptions = [],
        currentValue = null,
        cancelText = '返回',
        confirmText = '确认',
        onCancel,
        onConfirm
      } = options

      this._onCancel = onCancel
      this._onConfirm = onConfirm

      const finalModelOptions = (Array.isArray(modelOptions) ? modelOptions : []).map(opt => {
        const speedLevel = Number(opt.speedLevel || 0)
        const qualityLevel = Number(opt.qualityLevel || 0)
        return {
          ...opt,
          speedLevel: Number.isFinite(speedLevel) ? speedLevel : 0,
          qualityLevel: Number.isFinite(qualityLevel) ? qualityLevel : 0,
          disabled: Boolean(opt.status != 1)
        }
      })

      const byCurrent = finalModelOptions.find(opt => opt.id === currentValue && !opt.disabled) || null
      const firstEnabled = finalModelOptions.find(opt => !opt.disabled) || null
      const selectedOption = byCurrent || firstEnabled

      this.setData({
        visible: true,
        title,
        subtitle,
        modelOptions: finalModelOptions,
        selectedOption,
        currentValue,
        cancelText,
        confirmText
      })
    },

    hide() {
      this.setData({
        visible: false
      })
      this._onCancel = null
      this._onConfirm = null
    },

    handleSelectOption(e) {
      const { index } = e.currentTarget.dataset
      const selectedOption = this.data.modelOptions[index]

      if (!selectedOption || selectedOption.disabled) return

      this.setData({
        selectedOption
      })
    },

    handleCancel() {
      if (typeof this._onCancel === 'function') {
        this._onCancel()
      } else {
        this.triggerEvent('cancel')
      }
      this.hide()
    },

    async handleConfirm() {
      if (!this.data.selectedOption) {
        wx.showToast({
          title: '请选择模型',
          icon: 'none'
        })
        return
      }

      if (this.data.selectedOption.disabled) {
        wx.showToast({
          title: '该模型暂不可用',
          icon: 'none'
        })
        return
      }

      await setGlobalModel({modelId: this.data.selectedOption.id})

      if (typeof this._onConfirm === 'function') {
        this._onConfirm(this.data.selectedOption.id, this.data.selectedOption)
      } else {
        this.triggerEvent('confirm', {
          value: this.data.selectedOption.id,
          option: this.data.selectedOption
        })
      }

      this.hide()
    },

    handleClose() {
      this.handleCancel()
    },

    handleMaskClick() {
      this.handleCancel()
    },

    preventMove() {
      return false
    }
  }
})
