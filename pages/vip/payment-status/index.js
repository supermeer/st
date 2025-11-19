import { Toast } from 'tdesign-miniprogram'
import { queryOrderStatus } from '../../../services/order/index'
import userStore from '../../../store/user'

const app = getApp()

Page({
  data: {
    paymentInfo: {
      status: 0 // 0 支付中 1 支付成功 2 支付失败
    },
    orderNumber: '', // 订单号
    pollTimer: null // 轮询计时器
  },

  onLoad: function (options) {
    const orderNumber = options.orderNumber

    // 接收传入的订单号
    if (orderNumber) {
      this.setData({
        orderNumber
      })

      // 开始轮询支付状态
      this.startPollingPaymentStatus()
    } else {
      // 如果没有订单号，显示错误提示
      Toast({
        context: this,
        selector: '#t-toast',
        message: '缺少订单信息',
        theme: 'error'
      })
    }
  },

  onUnload: function () {
    // 页面卸载时清除轮询
    this.clearPollingTimer()
  },

  // 开始轮询支付状态
  startPollingPaymentStatus: function () {
    // 清除可能存在的轮询计时器
    this.clearPollingTimer()

    // 设置为支付中状态
    this.setData({
      paymentInfo: {
        status: 0
      }
    })

    // 创建新的轮询，每3秒查询一次
    const pollTimer = setInterval(() => {
      this.checkPaymentStatus()
    }, 2000)

    this.setData({
      pollTimer: pollTimer
    })
  },

  // 清除轮询计时器
  clearPollingTimer: function () {
    if (this.data.pollTimer) {
      clearInterval(this.data.pollTimer)
      this.setData({
        pollTimer: null
      })
    }
  },

  // 查询支付状态
  checkPaymentStatus: function () {
    const orderNumber = this.data.orderNumber

    queryOrderStatus(orderNumber)
      .then((res) => {
        this.handlePaymentResponse(res)
      })
      .catch((err) => {})
      .finally(() => {})
  },

  // 处理支付状态响应
  handlePaymentResponse: function (response) {
    console.log(response)
    if (response === 1) {
      // 支付成功，停止轮询
      this.clearPollingTimer()
      // 更新全局 VIP 状态
      userStore.refreshVipInfo()
      // 更新页面状态为支付成功
      this.setData({
        paymentInfo: {
          status: 1
        }
      })
    }
    if (response === 2) {
      this.clearPollingTimer()
      this.setData({
        paymentInfo: {
          status: 2
        }
      })
    }
  },

  // 返回主页
  goBack: function () {
    wx.navigateBack()
  },

  // 添加客服微信
  contactCustomerService: function () {
    wx.openCustomerServiceChat({
      extInfo: { url: app.globalData.wxCustomerService.url },
      corpId: app.globalData.wxCustomerService.corpId,
      success(res) {}
    })
  }
})
