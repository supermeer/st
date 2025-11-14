Component({
  properties: {
    userAvatar: {
      type: String,
      value: ''
    },
    userName: {
      type: String,
      value: ''
    },
    userLevel: {
      type: String,
      value: ''
    }
  },
  data: {
    visible: false,
    selectedIndex: 0,
    plans: [
      { points: 600, price: 6 },
      { points: 3000, price: 30 },
      { points: 6000, price: 60 },
      { points: 10000, price: 100 },
      { points: 30000, price: 300 },
      { points: 50000, price: 500 }
    ]
  },
  methods: {
    show(options = {}) {
      const { plans } = options
      if (Array.isArray(plans) && plans.length) {
        this.setData({ plans, selectedIndex: 0 })
      }
      this.setData({ visible: true })
    },
    hide() {
      this.setData({ visible: false })
    },
    close() {
      this.hide()
      this.triggerEvent('close')
    },
    selectPlan(e) {
      const { index } = e.currentTarget.dataset
      this.setData({ selectedIndex: index })
    },
    handleRecharge() {
      const { plans, selectedIndex } = this.data
      const plan = plans[selectedIndex]
      this.triggerEvent('recharge', { plan })
    },
    handleAgreementTap() {
      this.triggerEvent('agreement')
    }
  }
})
