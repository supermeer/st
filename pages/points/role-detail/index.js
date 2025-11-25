Page({
  data: {
    roleInfo: {
      roleId: '',
      name: '',
      avatar: '',
      dialogCount: 0,
      totalPoints: 0
    },
    consumeList: [],
    loading: false,
    noMore: false,
    page: 1,
    pageSize: 20
  },

  onLoad(options) {
    const { roleId, roleName, dialogCount, totalPoints, avatar } = options
    this.setData({
      roleInfo: {
        roleId: roleId || '',
        name: decodeURIComponent(roleName || ''),
        avatar: avatar ? decodeURIComponent(avatar) : '',
        dialogCount: parseInt(dialogCount) || 0,
        totalPoints: parseInt(totalPoints) || 0
      }
    })
    this.loadData()
  },

  loadData() {
    const { roleInfo } = this.data
    // TODO: 调用接口获取该角色的消耗明细
    // 模拟数据
    const mockList = [
      { id: '1', title: '对话消耗', count: 1, points: 10, date: '2025.04.12 12:12' },
      { id: '2', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '3', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '4', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '5', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '6', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '7', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '8', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '9', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '10', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '11', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '12', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '13', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '14', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '15', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '16', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '17', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '18', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '19', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
      { id: '20', title: '对话消耗', count: 1, points: 20, date: '2025.04.12 12:12' },
    ]

    this.setData({
      consumeList: mockList,
      noMore: true
    })
  },

  loadMore() {
    if (this.data.loading || this.data.noMore) return
    // TODO: 加载更多数据
  }
})
