import { queryOrderStatus } from '../../services/order/index'
import userStore from '../../store/user'

Component({
  data: {
    visible: false,
    status: 0, // 0 查询中 1 成功 2 失败
    points: 0,
    orderNumber: '',
    pollTimer: null
  },
  // 卸载弹窗后清空状态
  onUnload() {
    this.clearPollingTimer()
    this.setData({
      visible: false,
      status: 0,
      points: 0,
      orderNumber: '',
      pollTimer: null
    })
  },
  methods: {
    show(options = {}) {
      const { orderNumber, points = 0, success = false } = options
      if (success) {
       this.setData({
        visible: true,
        status: 1,
        points
       })
        return
      }
      if (!orderNumber) {
        return
      }
      this.clearPollingTimer()
      this.setData({
        visible: true,
        status: 0,
        orderNumber,
        points
      })
      const pollTimer = setInterval(() => {
        this.checkStatus()
      }, 2000)
      this.setData({ pollTimer })
    },
    hide() {
      this.clearPollingTimer()
      this.setData({ visible: false })
    },
    clearPollingTimer() {
      if (this.data.pollTimer) {
        clearInterval(this.data.pollTimer)
        this.setData({ pollTimer: null })
      }
    },
    checkStatus() {
      const { orderNumber } = this.data
      if (!orderNumber) return
      queryOrderStatus(orderNumber)
        .then((res) => {
          this.handleResponse(res)
        })
        .catch((err) => {
          this.clearPollingTimer()
          this.setData({ status: 2 })
        })
    },
    handleResponse(res) {
      if (res === 1) {
        this.clearPollingTimer()
        userStore.refreshPointInfo()
        this.setData({ status: 1 })
      } else if (res === 2) {
        this.clearPollingTimer()
        this.setData({ status: 2 })
      }
    },
    handleConfirm() {
      this.hide()
      this.triggerEvent('close', { success: this.data.status === 1 })
    },
    handleMaskClick() {
    //   this.hide()
    //   this.triggerEvent('close')
    }
  }
})
