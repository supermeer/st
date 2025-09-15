import { Toast } from 'tdesign-miniprogram'
import { getPackages } from '../../../services/order/index'
import userStore from '../../../store/user'
Page({
  data: {
    selectedPackage: null,
    packages: []
  },

  onLoad: function (options) {
    this.getPackages()
    userStore.bind(this)
  },

  getPackages() {
    getPackages().then((res) => {
      const data = (res || []).map((item) => ({
        ...item,
        amountInYuan: (item.amountInFen / 100).toFixed(2),
        originAmountInYuan: (item.originAmount / 100).toFixed(2),
        benefitInfoArr: JSON.parse(item.benefitInfo || '[]')
      }))
      if (data.length) {
        this.setData({
          selectedPackage: data[0],
          packages: data
        })
      }
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

  // 返回按钮点击
  onBackClick: function () {
    // 导航栏组件内部已处理返回逻辑，这里可以添加额外处理
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

    // 将选中的套餐信息传递到订单确认页面
    const packageInfo = JSON.stringify(selectedPackage)

    wx.navigateTo({
      url: `/pages/vip/order-confirm/index?package=${encodeURIComponent(
        packageInfo
      )}`
    })
  },

  // 点击服务协议
  serviceTap: function (e) {
    wx.navigateTo({
      url: '/pages/common/agreement/index?type=1'
    })
  }
})
