// 引入API服务
const Toast = require('tdesign-miniprogram/toast/index')
import { getOrderList } from '../../../services/order/index'

Page({
  data: {
    orderList: [], // 订单列表数据
    page: 1, // 当前页码
    pageSize: 1000, // 每页条数
    total: 0, // 总订单数
    hasMore: true, // 是否还有更多数据
    loadMoreStatus: 0, // 加载更多状态，0: 默认状态，1: 加载中，2: 已全部加载，3: 加载失败
    refreshing: false, // 是否处于下拉刷新状态
    loadingProps: {
      size: '50rpx'
    }
  },

  onLoad: function () {
    // 获取订单数据
    this.getOrderList(true)
  },

  // 获取订单列表
  getOrderList: async function (isReset = false) {
    // 如果是重置，则重置页码为1
    if (isReset) {
      this.setData({
        page: 1,
        orderList: [],
        hasMore: true,
        loadMoreStatus: 0
      })
    }

    // 如果没有更多数据，则不再请求
    if (!this.data.hasMore && !isReset) {
      return
    }

    // 设置加载中状态
    this.setData({
      loadMoreStatus: 1
    })

    const res = await this.requestOrderList(this.data.page, this.data.pageSize)

    const data = res.map((item) => {
      const date = new Date(item.createTime)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const formattedDate = `${year}年${month}月${day}日 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
      return {
        ...item,
        createTime: formattedDate
      }
    })

    // 判断是否还有更多数据
    const hasMore = data.length === this.data.pageSize

    this.setData({
      orderList: [...this.data.orderList, ...data],
      page: this.data.page + 1,
      hasMore: hasMore,
      loadMoreStatus: hasMore ? 0 : 2, // 0: 默认状态，2: 已全部加载
      refreshing: false // 结束刷新状态
    })
  },

  // 获取模拟数据
  requestOrderList: function (page, pageSize) {
    return new Promise((resolve, reject) => {
      getOrderList({
        page: page,
        pageSize: pageSize
      }).then((res) => {
        resolve(res)
      })
    })
  },

  // 下拉刷新回调
  onRefresh: function () {
    if (this.data.refreshing) {
      return
    }

    this.setData({
      refreshing: true
    })

    // 重置并获取新的订单数据
    this.getOrderList(true)
  },

  // 下拉刷新超时
  onTimeout: function () {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '刷新超时'
    })

    this.setData({
      refreshing: false
    })
  },

  // 上拉加载更多
  onLoadMore: function () {
    if (this.data.loadMoreStatus !== 0) return
    this.getOrderList()
  },

  // 重试加载
  onRetryLoad: function () {
    if (this.data.loadMoreStatus === 3) {
      this.getOrderList()
    }
  },

  // 返回按钮点击
  onBackClick: function () {
    // 导航栏组件内部已处理返回逻辑，这里可以添加额外处理
  },

  // 首页按钮点击
  onHomeClick: function () {
    // 导航栏组件内部已处理返回首页逻辑，这里可以添加额外处理
  },

  // 付款
  onPay: function (e) {
    const orderId = e.currentTarget.dataset.id
    Toast({
      context: this,
      selector: '#t-toast',
      message: `订单 ${orderId} 付款中...`
    })
  },

  // 确认收货
  onConfirmReceipt: function (e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认收货',
      content: '确定已收到此订单商品？',
      success: (res) => {
        if (res.confirm) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '确认收货成功'
          })
          // 这里应该调用接口更新订单状态，然后刷新页面
          this.getOrderList(true)
        }
      }
    })
  }
})
