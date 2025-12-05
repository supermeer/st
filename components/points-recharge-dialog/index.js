import { createOrderAndPrepay, getPricingPlan } from '../../services/order/index'
import userStore from '../../store/user'

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
    plans: []
  },
  lifetimes: {
    attached() {
      userStore.bindTo(this, 'pointsRechargeDialog')
      userStore.initFromLocal()
    }
  },
  methods: {
    show(options = {}) {
      this.setData({ visible: true, selectedIndex: 0 })
      this.getPricingPlan()
    },
    getPricingPlan() {
      getPricingPlan({
        type: 1
      })
        .then((res) => {
          this.setData({ plans: (res || []).map(item => ({
            ...item,
            price: ((item.amountInFen || 0) / 100.0).toFixed(1)
          })) })
        })
        .catch((err) => {
          console.error(err)
        })
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

      const resultDialog = this.selectComponent('#rechargeResultDialog')
      if (resultDialog) {
        resultDialog.show({
          orderNumber: 12224,
          points: plan.point
        })
      }
      return
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
                  points: plan.point
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
    onRechargeResultClose(e) {
      // 充值成功后刷新积分信息
      userStore.refreshPointInfo()
      // 触发充值完成事件，返回充值结果给父组件
      this.triggerEvent('recharge-success')
      e.detail.success && this.close()
    },
    handleAgreementTap() {
      wx.navigateTo({
        url: '/pages/common/agreement/index?type=1'
      })
    }
  }
})
