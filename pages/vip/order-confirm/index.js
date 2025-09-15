import { createOrderAndPrepay } from '../../../services/order/index'
const app = getApp()

Page({
  data: {
    package: null,
    quantity: 1,
    maxQuantity: 12,
    totalPrice: 0,
    discountPrice: 0,
    finalPrice: 0
  },

  onLoad: function (options) {
    // amountInFen: 1
    // amountInYuan: "0.01"
    // benefitInfo: "["<p><span style=\"font-size: 16px;letter-spacing: 0.4px;\">可用次数</span><span style=\"color: rgb(66, 144, 247); font-size: 19px;\"><strong>100</strong></span><span style=\"font-size: 16px;\">次</span></p >","<p><span style=\"font-size: 16px;letter-spacing: 0.4px;\">历史记录</span><span style=\"color: rgb(66, 144, 247); font-size: 19px;\"><strong>30</strong></span><span style=\"font-size: 16px;\">天</span></p >"]"
    // benefitInfoArr: (2) ["<p><span style="font-size: 16px;letter-spacing: 0.…span><span style="font-size: 16px;">次</span></p >", "<p><span style="font-size: 16px;letter-spacing: 0.…span><span style="font-size: 16px;">天</span></p >"]
    // createTime: "2025-08-14T09:22:06.000+00:00"
    // cycleDays: 30
    // cycleQuota: 100
    // deleted: 0
    // description: "30天会员，次数100"
    // discountInfo: "限时折扣"
    // id: 1
    // orderType: 101
    // originAmount: 1000
    // originAmountInYuan: "10.00"
    // title: "VIP月卡100"
    // updateTime: "2025-08-20T22:56:52.000+00:00"
    // 接收传入的套餐信息
    if (options && options.package) {
      try {
        const packageInfo = JSON.parse(decodeURIComponent(options.package))
        const quantity = parseInt(options.quantity || 1)
        this.setData({
          package: packageInfo
        })
        this.updateQuantity(quantity)
      } catch (e) {
        console.error('解析套餐信息失败', e)
        wx.showToast({
          title: '套餐信息无效',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } else {
      wx.showToast({
        title: '缺少套餐信息',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 返回按钮点击
  onBackClick: function () {
    // 导航栏组件内部已处理返回逻辑，这里可以添加额外处理
  },

  // 减少数量
  decreaseQuantity: function () {
    if (this.data.quantity > 1) {
      const newQuantity = this.data.quantity - 1
      this.updateQuantity(newQuantity)
    }
  },

  // 增加数量
  increaseQuantity: function () {
    if (this.data.quantity >= this.data.maxQuantity) {
      return
    }
    const newQuantity = this.data.quantity + 1
    this.updateQuantity(newQuantity)
  },

  // 更新数量和价格
  updateQuantity: function (newQuantity) {
    const packageInfo = this.data.package

    // 计算新价格
    const totalPrice = packageInfo.originAmountInYuan * newQuantity
    const discountPrice =
      (packageInfo.originAmountInYuan - packageInfo.amountInYuan) * newQuantity
    const finalPrice = packageInfo.amountInYuan * newQuantity

    this.setData({
      quantity: newQuantity,
      totalPrice: totalPrice,
      discountPrice: discountPrice.toFixed(2),
      finalPrice: finalPrice.toFixed(2)
    })
  },
  // 随机字符串，长度为32个字符以下
  getRandomString(length) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      result += characters.charAt(randomIndex)
    }
    return result
  },

  // 立即下单
  submitOrder: function () {
    wx.showLoading({
      title: '处理订单中...',
      mask: true
    })

    createOrderAndPrepay({
      openId: wx.getStorageSync('openId'),
      orderType: this.data.package.orderType,
      count: this.data.quantity
    })
      .then((res) => {
        wx.requestPayment({
          ...res,
          success() {
            wx.navigateTo({
              url: `/pages/vip/payment-status/index?orderNumber=${res.orderNumber}`
            })
          },
          fail() {
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })
          },
          complete() {
            wx.hideLoading()
          }
        })
      })
      .catch((err) => {
        setTimeout(() => {
          wx.hideLoading()
        }, 2000)
      })
      .finally(() => {
        // wx.hideLoading()
      })
  }
})
