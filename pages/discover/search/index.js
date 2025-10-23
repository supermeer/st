import SystemInfo from '../../../utils/system'
import Toast from 'tdesign-miniprogram/toast/index'

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
    searchResults: [],
    
    // 搜索结果是否为空
    searchIsEmpty: false,

    // 搜索加载中
    searching: false,

    // 当前搜索的关键词
    currentSearchKeyword: '',
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
      searchResults: [],
      searchIsEmpty: false
    })

    try {
      // TODO: 调用实际的搜索接口
      // const results = await searchAPI(keyword)
      
      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟搜索结果
      const results = this.getMockSearchResults(keyword)

      this.setData({
        searching: false,
        searchResults: results,
        searchIsEmpty: results.length === 0
      })

    } catch (error) {
      console.error('搜索失败:', error)
      
      this.setData({
        searching: false,
        searchIsEmpty: true
      })

      Toast({
        context: this,
        selector: '#t-toast',
        message: '搜索失败，请重试',
      })
    }
  },

  // 获取模拟搜索结果
  getMockSearchResults(keyword) {
    const names = ['沈川爱', '程野', '校园白月光', '吸血鬼男友', '霸道总裁', '温柔医生', '神秘侦探', '古风公子', '现代王子', '运动少年']
    const tags = ['#都市豪婿', '#情绪价值', '#每次喜欢', '#家门生活', '#超理想']
    const images = [
      'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png',
      'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png',
      'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png',
      'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png',
    ]

    // 模拟搜索：根据关键词返回匹配的结果
    const results = []
    const matchCount = Math.floor(Math.random() * 8) + 3 // 3-10个结果

    for (let i = 0; i < matchCount; i++) {
      results.push({
        id: i + 1,
        name: names[i % names.length] + (keyword.includes(names[i % names.length].slice(0, 2)) ? '' : ` - ${keyword}`),
        image: images[i % images.length],
        verified: Math.random() > 0.5,
        tags: [
          tags[Math.floor(Math.random() * tags.length)],
          tags[Math.floor(Math.random() * tags.length)],
          tags[Math.floor(Math.random() * tags.length)],
        ].slice(0, 3),
      })
    }

    return results
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
      searchResults: [],
      searchIsEmpty: false,
      currentSearchKeyword: ''
    })
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

  // 点击角色卡片
  onRoleClick(e) {
    const id = e.currentTarget.dataset.id
    console.log('点击角色:', id)
    
    // TODO: 跳转到角色详情页
    Toast({
      context: this,
      selector: '#t-toast',
      message: '角色详情页开发中',
    })
  },

  // 取消搜索，返回上一页
  onCancel() {
    wx.navigateBack()
  },
})
