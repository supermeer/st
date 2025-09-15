Component({
  properties: {
    cancelTitle: {
      type: String,
      value: ''
    },
    confirmTitle: {
      type: String,
      value: ''
    }
  },
  data: {},

  methods: {
    cancel() {
      this.triggerEvent('cancel')
    },
    confirm() {
      this.triggerEvent('confirm')
    }
  }
})
