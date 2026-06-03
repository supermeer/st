import SystemInfo from '../../../utils/system'
import Toast from 'tdesign-miniprogram/toast/index'
import { getCurrentPlotByCharacterId, getCharacterRanking } from '../../../services/role/index'

Page({
  data: {
    pageInfo: {
      navHeight: 0,
      safeAreaBottom: 0,
    },
    activeTab: 'hot', // hot | wow | new
    dateText: '',

    list: [],
    pageNo: 1,
    pageSize: 10,
    totalCount: 0,
    loadMoreStatus: 0,
    listIsEmpty: false,
  },

  onLoad(options) {
    const pageInfo = SystemInfo.getPageInfo()
    const type = options && options.type ? options.type : 'hot'
    this.setData({
      pageInfo,
      activeTab: type,
      dateText: this.formatDate(new Date()),
    })
    this.loadList(true)
  },

  formatDate(d) {
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${y}年${m}月${day}日`
  },

  onTabChange(e) {
    const type = e.currentTarget.dataset.type
    if (type === this.data.activeTab) return
    this.setData({ activeTab: type, list: [], pageNo: 1, totalCount: 0, loadMoreStatus: 0 })
    this.loadList(true)
  },

  async loadList(isRefresh = false) {
    if (isRefresh) {
      this.data.pageNo = 1
    } else {
      if (this.data.loadMoreStatus === 1) return
      this.setData({ pageNo: this.data.pageNo + 1 })
    }

    this.setData({ loadMoreStatus: 1 })

    try {
      const res = await getCharacterRanking({type: this.data.activeTab})
      const newList = isRefresh ? (res.list || []) : [...this.data.list, ...(res.list || [])]
      this.setData({
        list: newList,
        totalCount: res.total || 0,
        loadMoreStatus: newList.length >= (res.total || 0) ? 2 : 0,
        listIsEmpty: newList.length === 0,
      })
    } catch (e) {
      console.error('loadList error', e)
      this.setData({ loadMoreStatus: 3 })
      Toast({ context: this, selector: '#t-toast', message: '加载失败，请重试' })
    }
  },

  onLoadMore() {
    const { list, totalCount, loadMoreStatus } = this.data
    if (list.length >= totalCount || loadMoreStatus !== 0) return
    this.loadList(false)
  },

  onRetryLoad() {
    if (this.data.loadMoreStatus === 3) this.loadList(false)
  },

  async onRoleClick(e) {
    const id = e.currentTarget.dataset.id
    try {
      const res = await getCurrentPlotByCharacterId(id)
      wx.navigateTo({ url: `/pages/chat/index?plotId=${res && res.plotId ? res.plotId : ''}&characterId=${id}&isDiscover=${true}` })
    } catch (e) {
      Toast({ context: this, selector: '#t-toast', message: '进入失败，请重试' })
    }
  },
})
