Component({
  properties: {},
  data: {
    visible: false,
    inviteCode: '',
    errorMsg: ''
  },
  methods: {
    show() {
      this.setData({ 
        visible: true, 
        inviteCode: '',
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
