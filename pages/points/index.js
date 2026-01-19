import userStore from '../../store/user'
import { createOrderAndPrepay, getPricingPlan } from '../../services/order/index'

Page({
  data: {
    expireDate: '2025.04.12',
    selectedIndex: -1,
    plans: []
  },

  onLoad() {
    userStore.bind(this)
  },

  onShow() {
    userStore.refreshPointInfo()
    this.getPricingPlan()
  },

  selectPlan(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ selectedIndex: index })
  },

  getPricingPlan() {
    getPricingPlan({
      type: 1
    })
      .then((res) => {
        this.setData({
          plans: (res || []).map(item => ({
            ...item,
            price: ((item.amountInFen || 0) / 100.0).toFixed(2)
          })),
          selectedIndex: 0
        })
      })
      .catch((err) => {
        console.error(err)
      })
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
      orderType: plan.orderType,
      count: 1
    })
      .then((res) => {
        wx.requestPayment({
          ...res,
          success: () => {
            wx.hideLoading()
            this.showRechargeResultDialog({
              orderNumber: res.orderNumber,
              points: plan.point
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
      url: '/pages/common/agreement/index?type=1'
    })
  },

  pointCharge() {
    const dialog = this.selectComponent('#pointsRechargeDialog')
    if (dialog) {
      dialog.show()
    }
  },
  vipCharge() {
    wx.navigateTo({
      url: "/pages/vip/packages/index"
    })
  },
  invite() {

  },
  author() {

  },

  goDetail() {
    wx.navigateTo({
      url: '/pages/points/detail/index'
    })
  },

  showRechargeResultDialog(options) {
    const dialog = this.selectComponent('#rechargeResultDialog')
    if (dialog) {
      dialog.show(options)
    }
  },

  onDialogClose() {
    userStore.refreshPointInfo()
  }
})

