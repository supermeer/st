import SystemInfo from '../../../utils/system'
import { formatTime } from '../../../utils/util'
import { getMyPointDetails } from '../../../services/vip/index'
Page({
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    filterIndex: 0,
    filterOptions: [
      { label: '全部', value: '' },
      { label: '收入', value: '1' },
      { label: '支出', value: '2' }
    ],
    changeType: '',
    showDropdown: false,
    list: [],
    loading: false,
    noMore: false,
    current: 1,
    size: 20
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
    this.setData({
      loading: true
    })
    getMyPointDetails({
      current: this.data.current,
      size: this.data.size,
      changeType: this.data.changeType
    }).then(res => {
      const { records = [], pages, current } = res
      const formattedRecords = records.map((item) => ({
        ...item,
        formattedTime: item.createTime
          ? formatTime(item.createTime, 'YYYY.MM.DD HH:mm')
          : ''
      }))
      const newList = this.data.current === 1
        ? formattedRecords
        : [...this.data.list, ...formattedRecords]
      this.setData({
        list: newList,
        noMore: current >= pages,
        loading: false
      })
    }).catch(err => {
      console.error('加载数据失败:', err)
      this.setData({
        loading: false
      })
    })
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
      showDropdown: false,
      changeType: this.data.filterOptions[index].value,
      current: 1,
      list: [],
      noMore: false
    })
    this.loadData()
  },

  onItemTap(e) {
    const { item } = e.currentTarget.dataset
    // 只有角色类型的条目才能点击进入详情
    if (item.characterId) {
      wx.navigateTo({
        url: `/pages/points/role-detail/index?roleId=${item.characterId}&roleName=${encodeURIComponent(item.characterName)}&dialogCount=${item.dialogCount}`
      })
    }
  },

  loadMore() {
    if (this.data.loading || this.data.noMore) return
    this.setData({
      current: this.data.current + 1
    })
    this.loadData()
  }
})
