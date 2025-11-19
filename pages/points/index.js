
import { createOrderAndPrepay } from '../../services/order/index'

Page({
  data: {
    currentPoints: 3000,
    expireDate: '2025.04.12',
    selectedIndex: 2,
    plans: [
      { points: 600, price: 6 },
      { points: 3000, price: 30 },
      { points: 6000, price: 60 },
      { points: 10000, price: 100 },
      { points: 30000, price: 300 },
      { points: 50000, price: 500 }
    ]
  },

  onLoad() {},

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
      count: 1
    })
      .then((res) => {
        wx.requestPayment({
          ...res,
          success: () => {
            wx.hideLoading()
            wx.showToast({
              title: '支付成功',
              icon: 'success'
            })
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

  handleAgreementTap() {
    wx.navigateTo({
      url: '/pages/common/agreement/index'
    })
  },

  goDetail() {
    // 预留收支明细跳转
  }
})

