Component({
  properties: {},
  data: {
    visible: false,
    inviteCode: '',
    errorMsg: ''
  },
  methods: {
    show(options) {
      this.setData({ 
        visible: true,
        inviteCode: options?.code || '',
        errorMsg: ''
      })
    },
    hide() {
      this.setData({ visible: false })
    },
    onInputChange(e) {
      this.setData({ 
        inviteCode: e.detail.value,
        errorMsg: ''
      })
    },
    handleCancel() {
      this.hide()
      this.triggerEvent('cancel')
    },
    handleConfirm() {
      const { inviteCode } = this.data

      if (!inviteCode || !inviteCode.trim()) {
        this.setData({ errorMsg: '请输入邀请码' })
        return
      }

      this.triggerEvent('confirm', { inviteCode: inviteCode.trim() })
    },
    setError(msg) {
      this.setData({ errorMsg: msg })
    },
    clearError() {
      this.setData({ errorMsg: '' })
    }
  }
})
