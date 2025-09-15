import Toast from 'tdesign-miniprogram/toast/index'
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

  onLoad: function () {},

  onShow: function () {
    this.getTabBar().init()
  }
})
