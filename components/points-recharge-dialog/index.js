import { createOrderAndPrepay } from '../../services/order/index'

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
    remainPoints: {
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

      if (!plan) {
        wx.showToast({
          title: '请选择充值方案',
          icon: 'none'
        })
        return
      }

      wx.showLoading({
        title: '处理中...',
        mask: true
      })

      createOrderAndPrepay({
        openId: wx.getStorageSync('openId'),
        orderType: 1,
        // 按当前约定不对 price 做额外处理
        count: 1
      })
        .then((res) => {
          wx.requestPayment({
            ...res,
            success: () => {
              wx.hideLoading()
              this.hide()

              const resultDialog = this.selectComponent('#rechargeResultDialog')
              if (resultDialog && res.orderNumber) {
                resultDialog.show({
                  orderNumber: res.orderNumber,
                  points: plan.points
                })
              }
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({
                title: '支付失败',
                icon: 'none'
              })
            }
          })
        })
        .catch(() => {
          wx.hideLoading()
          wx.showToast({
            title: '下单失败',
            icon: 'none'
          })
        })
    },
    onRechargeResultClose() {
      // 目前仅关闭结果弹窗，必要时可以在这里补充刷新积分等逻辑
    },
    handleAgreementTap() {
      this.triggerEvent('agreement')
    },

    handleMaskClick() {
      // this.close()
    }
  }
})
