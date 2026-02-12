import { Toast } from 'tdesign-miniprogram'
import { createOrderAndPrepay, getPricingPlan } from '../../../services/order/index'
import { isSpringFestivalExpired } from '../../../services/usercenter/index'
import userStore from '../../../store/user'
import SystemInfo from '../../../utils/system'
Page({
  data: {
    selectedPackage: null,
    packages: [],
    isSpringFestival: false,
    scrollTop: 0,
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    test: '<p style="position: absolute; right: 0; top: 0; background: #ffc107; color: #FFFFFF;font-size: 12px;padding: 2px 12px; border-bottom-left-radius: 12px; border-top-right-radius: 8px;">推荐</p>'
  },

  onLoad: function (options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
    this.getPricingPlan()
    this.getIfSpringFestival()
    userStore.bind(this)
  },

  getPricingPlan() {
    getPricingPlan({type: 0}).then((res) => {
      const data = (res || []).map((item) => ({
        ...item,
        benefitInfo: JSON.parse(item.benefitInfo || "[]"),
        amountInYuan: (item.amountInFen / 100).toFixed(2)
      }))
      if (data.length) {
        this.setData({
          selectedPackage: data[0],
          packages: data
        })
      }
    })
  },

  getIfSpringFestival() {
    isSpringFestivalExpired().then(res => {
      this.setData({
        isSpringFestival: !res
      })
    })
  },

  // 选择套餐
  onSelectPackage: function (e) {
    const packageId = e.currentTarget.dataset.id
    this.setData({
      selectedPackage:
        this.data.packages.find((item) => item.id === packageId) ||
        this.data.packages[0]
    })
  },

  // 立即开通
  onPurchase: function () {
    const selectedPackage = this.data.selectedPackage

    if (!selectedPackage) {
      Toast({
        message: '请选择套餐',
        duration: 2000
      })
      return
    }
    createOrderAndPrepay({
      openId: wx.getStorageSync('openId'),
      orderType: selectedPackage.orderType,
      count: 1
    })
      .then((res) => {
        wx.requestPayment({
          ...res,
          success: () => {
            wx.hideLoading()
            wx.navigateTo({
              url: `/pages/vip/payment-status/index?orderNumber=${res.orderNumber}`
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
      .catch((err) => {
        console.error(err)
        wx.hideLoading()
        wx.showToast({
          title: '支付失败',
          icon: 'none'
        })
      })
  },

  // 点击服务协议
  serviceTap: function (e) {
    wx.navigateTo({
      url: '/pages/common/agreement/index?type=1'
    })
  }
})
