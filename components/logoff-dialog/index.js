Component({
  data: {
    visible: false,
    sharePersonNum: 2,
    freeTimes: 5
  },
  methods: {
    close() {
      this.setData({ visible: false })
      this.triggerEvent('close')
    },
    confirm() {
      this.triggerEvent('confirm')
    },
    show() {
      this.setData({ visible: true })
    },
    hide() {
      this.setData({ visible: false })
    }
  }
})
