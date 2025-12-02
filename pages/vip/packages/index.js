import { Toast } from 'tdesign-miniprogram'
import { getPackages, createOrderAndPrepay, getPricingPlan } from '../../../services/order/index'
import { getQuotaInfo } from '../../../services/usercenter/index'
import userStore from '../../../store/user'
import SystemInfo from '../../../utils/system'

Page({
  data: {
    selectedPackage: null,
    packages: [],
    quotaInfo: {
      imageGenCurrent: 40,
      imageGenMember: 80,
      video1Current: 10,
      video1Member: 20,
      video2Current: 5,
      video2Member: 7,
      downloadMember: 4
    },
    scrollTop: 0,
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    }
  },

  onLoad: function (options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
    this.getPricingPlan()
    this.getQuotaInfo()
    userStore.bind(this)
  },

  getPricingPlan() {
    getPricingPlan({type: 0}).then((res) => {
      const data = (res || []).map((item) => ({
        ...item,
        amountInYuan: (item.amountInFen / 100).toFixed(0)
      }))
      if (data.length) {
        this.setData({
          selectedPackage: data[0],
          packages: data
        })
      }
    })
  },

  getQuotaInfo() {
    getQuotaInfo().then((res) => {
      // 根据实际接口返回的数据结构来设置
      // 这里假设接口返回的数据结构，需要根据实际情况调整
      this.setData({
        quotaInfo: {
          imageGenCurrent: res.imageGenCurrent || 40,
          imageGenMember: res.imageGenMember || 80,
          video1Current: res.video1Current || 10,
          video1Member: res.video1Member || 20,
          video2Current: res.video2Current || 5,
          video2Member: res.video2Member || 7,
          downloadMember: res.downloadMember || 4
        }
      })
    }).catch(() => {
      // 如果接口失败，使用默认值
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
      orderType: 1,
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
