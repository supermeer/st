Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    iconSrc: {
      type: String,
      value: ''
    },
    content: {
      type: String,
      value: ''
    },
    buttonText: {
      type: String,
      value: '查看活动'
    },
    maskClosable: {
      type: Boolean,
      value: true
    }
  },
  data: {
    visible: false,
    overrideTitle: '',
    overrideIconSrc: '',
    overrideContent: '',
    overrideButtonText: ''
  },
  methods: {
    show(options = {}) {
      const { title, iconSrc, content, buttonText, confirmAction } = options
      this.setData({
        visible: true,
        overrideTitle: typeof title === 'string' ? title : '',
        overrideIconSrc: typeof iconSrc === 'string' ? iconSrc : '',
        overrideContent: typeof content === 'string' ? content : '',
        overrideButtonText: typeof buttonText === 'string' ? buttonText : ''
      })
    },
    hide() {
      this.setData({ visible: false })
    },
    handleConfirm() {
      const payload = {
        title: this.data.overrideTitle || this.data.title,
        iconSrc: this.data.overrideIconSrc || this.data.iconSrc,
        content: this.data.overrideContent || this.data.content,
        buttonText: this.data.overrideButtonText || this.data.buttonText
      }
      this.hide()
      this.triggerEvent('confirm', payload)
    },
    handleMaskClick() {
      if (!this.data.maskClosable) return
      this.hide()
      this.triggerEvent('close')
    }
  }
})
