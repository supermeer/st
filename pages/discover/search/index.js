import SystemInfo from '../../../utils/system'
import Toast from 'tdesign-miniprogram/toast/index'
import { getCharacterList, getCurrentPlotByCharacterId } from '../../../services/role/index'

const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10 // 最多保存10条历史记录

Page({
  data: {
    // 页面信息
    pageInfo: {
      navHeight: 0,
      safeAreaTop: 0,
      safeAreaBottom: 0,
    },

    // 搜索关键词
    keyword: '',
    
    // 历史搜索记录
    historyList: [],

    // 热门搜索（可以从后端获取）
    hotList: [
      '霸道总裁',
      '温柔医生',
      '校园白月光',
      '古风公子',
      '吸血鬼男友',
      '神秘侦探',
      '现代王子',
      '运动少年',
      '都市精英',
      '温柔学长',
    ],

    // 是否显示清空历史按钮
    showClearBtn: false,

    // 搜索状态：'default'-默认状态(显示历史和热门), 'result'-显示结果
    searchStatus: 'default',

    // 搜索结果
    roleList: [],
    
    // 搜索结果是否为空
    listIsEmpty: false,

    // 搜索加载中
    searching: false,

    // 当前搜索的关键词
    currentSearchKeyword: '',

    // 下拉刷新
    refreshing: false,
    loadingProps: {
      size: '50rpx',
    },

    // 加载状态
    loadMoreStatus: 0, // 0-加载前，1-加载中，2-加载完成，3-加载失败

    // 滚动状态
    isScrollTop: true, // 是否在顶部

    // 分页参数
    pageNo: 1,
    pageSize: 10,
    totalCount: 0,
  },

  onLoad: function (options) {
    // 获取页面信息
    const pageInfo = SystemInfo.getPageInfo()
    
    this.setData({
      pageInfo
    })

    // 加载历史搜索记录
    this.loadHistory()

    // 如果传入了搜索关键词，自动填充
    if (options.keyword) {
      this.setData({
        keyword: options.keyword
      })
    }
  },

  // 加载历史搜索记录
  loadHistory() {
    try {
      const historyStr = wx.getStorageSync(HISTORY_KEY)
      const historyList = historyStr ? JSON.parse(historyStr) : []
      this.setData({
        historyList,
        showClearBtn: historyList.length > 0
      })
    } catch (error) {
      console.error('加载历史记录失败:', error)
      this.setData({
        historyList: [],
        showClearBtn: false
      })
    }
  },

  // 保存历史搜索记录
  saveHistory(keyword) {
    if (!keyword || !keyword.trim()) return

    const trimmedKeyword = keyword.trim()
    let historyList = [...this.data.historyList]

    // 如果已存在，先删除
    const index = historyList.indexOf(trimmedKeyword)
    if (index > -1) {
      historyList.splice(index, 1)
    }

    // 添加到最前面
    historyList.unshift(trimmedKeyword)

    // 最多保存 MAX_HISTORY 条
    if (historyList.length > MAX_HISTORY) {
      historyList = historyList.slice(0, MAX_HISTORY)
    }

    // 保存到本地存储
    try {
      wx.setStorageSync(HISTORY_KEY, JSON.stringify(historyList))
      this.setData({
        historyList,
        showClearBtn: historyList.length > 0
      })
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  },

  // 输入框值改变
  onKeywordChange(e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  // 点击搜索按钮
  onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入搜索内容',
      })
      return
    }

    this.doSearch(keyword)
  },

  // 执行搜索
  async doSearch(keyword) {
    // 保存到历史记录
    this.saveHistory(keyword)

    // 设置搜索状态
    this.setData({
      searching: true,
      searchStatus: 'result',
      currentSearchKeyword: keyword,
      roleList: [],
      listIsEmpty: false,
      loadMoreStatus: 0,
    })

    // 重置分页
    this.data.pageNo = 1

    // 加载搜索结果
    await this.loadRoleList(true)
  },

  // 点击历史记录项
  onHistoryClick(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({
      keyword
    })
    this.doSearch(keyword)
  },

  // 点击热门搜索项
  onHotClick(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({
      keyword
    })
    this.doSearch(keyword)
  },

  // 清空搜索框
  onClearKeyword() {
    this.setData({
      keyword: '',
      searchStatus: 'default',
      roleList: [],
      listIsEmpty: false,
      currentSearchKeyword: '',
      loadMoreStatus: 0,
    })
    this.data.pageNo = 1
  },

  // 显示清空历史确认弹窗
  onShowClearDialog() {
    wx.showModal({
      title: '提示',
      content: '确定要清空所有历史搜索记录吗？',
      confirmText: '清空',
      confirmColor: '#FA5151',
      success: (res) => {
        if (res.confirm) {
          this.clearHistory()
        }
      }
    })
  },

  // 清空历史记录
  clearHistory() {
    try {
      wx.removeStorageSync(HISTORY_KEY)
      this.setData({
        historyList: [],
        showClearBtn: false
      })
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已清空历史记录',
      })
    } catch (error) {
      console.error('清空历史记录失败:', error)
      Toast({
        context: this,
        selector: '#t-toast',
        message: '清空失败，请重试',
      })
    }
  },

  // 监听滚动
  onScroll(e) {
    const scrollTop = e.detail.scrollTop
    const isScrollTop = scrollTop <= 10 // 容忍10px的误差
    
    // 只在状态改变时更新，避免频繁setData
    if (this.data.isScrollTop !== isScrollTop) {
      this.setData({
        isScrollTop
      })
    }
  },

  // 下拉刷新
  onRefresh() {
    if (this.data.refreshing) return

    this.setData({
      refreshing: true,
    })

    this.data.pageNo = 1
    this.loadRoleList(true)
  },

  // 刷新超时
  onTimeout() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '刷新超时',
    })

    this.setData({
      refreshing: false,
    })
  },

  // 上拉加载更多
  onLoadMore() {
    const { roleList, loadMoreStatus, totalCount } = this.data
    
    if (roleList.length >= totalCount) {
      this.setData({
        loadMoreStatus: 2, // 已全部加载
      })
      return
    }

    if (loadMoreStatus !== 0) return

    this.loadRoleList(false)
  },

  // 重试加载
  onRetryLoad() {
    if (this.data.loadMoreStatus === 3) {
      this.loadRoleList(false)
    }
  },

  // 加载角色列表
  async loadRoleList(isRefresh = false) {
    if (isRefresh) {
      this.data.pageNo = 1
    } else {
      this.data.pageNo += 1
    }

    // 设置加载状态
    this.setData({
      loadMoreStatus: 1,
      searching: isRefresh && this.data.searchStatus === 'result',
    })

    try {
      // 构建请求参数
      const params = {
        current: this.data.pageNo,
        size: this.data.pageSize,
        ifSystem: true,
        characterName: this.data.currentSearchKeyword || '', // 搜索关键词
      }
      const res = await getCharacterList(params)
      const newList = isRefresh ? [...res.records] : [...this.data.roleList, ...res.records]
      this.setData({
        totalCount: res.total || 0,
      })

      this.setData({
        roleList: newList,
        loadMoreStatus: newList.length >= this.data.totalCount ? 2 : 0,
        listIsEmpty: newList.length === 0,
        refreshing: false,
        searching: false,
      })
    } catch (error) {
      console.error('加载角色列表失败:', error)
      
      this.setData({
        loadMoreStatus: 3,
        refreshing: false,
        searching: false,
      })

      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载失败，请重试',
      })
    }
  },

  // 点击角色卡片
  async onRoleClick(e) {
    const id = e.currentTarget.dataset.id
    try {
      const res = await getCurrentPlotByCharacterId(id)
      wx.navigateTo({
        url: `/pages/chat/index?plotId=${res && res.plotId ? res.plotId : ''}&characterId=${id}`
      })
    } catch (error) {
      console.error('获取角色信息失败:', error)
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载失败，请重试',
      })
    }
  },

  // 取消搜索，返回上一页
  onCancel() {
    wx.navigateBack()
  },
})
