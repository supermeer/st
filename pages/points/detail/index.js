import SystemInfo from '../../../utils/system'
Page({
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    filterIndex: 0,
    filterOptions: [
      { label: '全部', value: 'all' },
      { label: '收入', value: 'income' },
      { label: '支出', value: 'expense' }
    ],
    showDropdown: false,
    list: [],
    filteredList: [],
    loading: false,
    noMore: false,
    page: 1,
    pageSize: 20
  },

  onLoad(options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
    this.loadData()
  },

  onShow() {
    // 页面显示时刷新数据
  },

  loadData() {
    // TODO: 调用接口获取数据
    // 模拟数据
    const mockList = [
      { id: '1', title: '沈川寒', type: 'role', points: -14320, date: '2025.04.12 12:12', roleId: 'role_1', avatar: '', dialogCount: 100 },
      { id: '2', title: '李大炮', type: 'role', points: -2330, date: '2025.04.12 12:12', roleId: 'role_2', avatar: '', dialogCount: 50 },
      { id: '3', title: '积分充值', type: 'recharge', points: 600, date: '2025.04.12 12:12' },
      { id: '4', title: '李大炮', type: 'role', points: -20, date: '2025.04.12 12:12', roleId: 'role_2', avatar: '', dialogCount: 5 },
      { id: '5', title: '闻大炮', type: 'role', points: -20, date: '2025.04.12 12:12', roleId: 'role_3', avatar: '', dialogCount: 5 },
      { id: '6', title: '积分充值', type: 'recharge', points: 600, date: '2025.04.12 12:12' },
      { id: '7', title: '开通会员赠送', type: 'gift', points: 1000, date: '2025.04.12 12:12' },
      { id: '8', title: '沈川寒', type: 'role', points: -14320, date: '2025.04.12 12:12', roleId: 'role_1', avatar: '', dialogCount: 100 },
      { id: '9', title: '李大炮', type: 'role', points: -2330, date: '2025.04.12 12:12', roleId: 'role_2', avatar: '', dialogCount: 50 },
      { id: '10', title: '积分充值', type: 'recharge', points: 600, date: '2025.04.12 12:12' },
      { id: '11', title: '闻大炮', type: 'role', points: -20, date: '2025.04.12 12:12', roleId: 'role_3', avatar: '', dialogCount: 5 },
      { id: '12', title: '积分充值', type: 'recharge', points: 600, date: '2025.04.12 12:12' },
      { id: '13', title: '开通会员赠送', type: 'gift', points: 1000, date: '2025.04.12 12:12' },
    ]

    this.setData({
      list: mockList,
      noMore: true
    })
    this.filterList()
  },

  filterList() {
    const { list, filterIndex, filterOptions } = this.data
    const filterValue = filterOptions[filterIndex].value

    let filteredList = list
    if (filterValue === 'income') {
      filteredList = list.filter(item => item.points > 0)
    } else if (filterValue === 'expense') {
      filteredList = list.filter(item => item.points < 0)
    }

    this.setData({ filteredList })
  },

  toggleDropdown() {
    this.setData({ showDropdown: !this.data.showDropdown })
  },

  closeDropdown() {
    this.setData({ showDropdown: false })
  },

  selectFilter(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      filterIndex: index,
      showDropdown: false
    })
    this.filterList()
  },

  onItemTap(e) {
    const { item } = e.currentTarget.dataset
    // 只有角色类型的条目才能点击进入详情
    if (item.type === 'role') {
      wx.navigateTo({
        url: `/pages/points/role-detail/index?roleId=${item.roleId}&roleName=${encodeURIComponent(item.title)}&dialogCount=${item.dialogCount}&totalPoints=${Math.abs(item.points)}`
      })
    }
  },

  loadMore() {
    if (this.data.loading || this.data.noMore) return
    // TODO: 加载更多数据
  }
})
