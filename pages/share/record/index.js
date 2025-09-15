import Toast from 'tdesign-miniprogram/toast/index'
import { getShareRecord } from '../../../services/usercenter/index'
Page({
  data: {
    recordList: [], // 邀请记录列表数据
    page: 1, // 当前页码
    pageSize: 10, // 每页条数
    total: 0, // 总记录数
    hasMore: true, // 是否还有更多数据
    loadMoreStatus: 0, // 加载更多状态，0: 默认状态，1: 加载中，2: 已全部加载，3: 加载失败
    refreshing: false, // 是否处于下拉刷新状态
    loadingProps: {
      size: '50rpx'
    }
  },

  onLoad: function () {
    // 获取邀请记录数据
    this.getRecordList(true)
  },

  // 获取邀请记录列表
  getRecordList: function (isReset = false) {
    // 如果是重置，则重置页码为1
    if (isReset) {
      this.setData({
        page: 1,
        recordList: [],
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

    getShareRecord()
      .then((res) => {
        const data = (res.list || []).map((item) => {
          item.invitedTime = item.invitedTime.replace('T', ' ')
          return item
        })

        const hasMore = data.length === this.data.pageSize
        this.setData({
          recordList: [...this.data.recordList, ...data],
          page: this.data.page + 1,
          hasMore: hasMore,
          loadMoreStatus: hasMore ? 0 : 2, // 0: 默认状态，2: 已全部加载
          refreshing: false // 结束刷新状态
        })
      })
      .finally(() => {
        this.setData({
          refreshing: false
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

    // 重置并获取新的邀请记录数据
    this.getRecordList(true)
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
    this.getRecordList()
  },

  // 重试加载
  onRetryLoad: function () {
    if (this.data.loadMoreStatus === 3) {
      this.getRecordList()
    }
  }
})
