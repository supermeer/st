// pages/contentadd/theme/index.js
Page({
  data: {
    activeTab: '0', // 当前激活的标签页
    themeList: [], // 主题风格列表
    hasLoaded: false, // 是否已加载过数据
    loadMoreStatus: 0, // 加载更多状态：0-加载前，1-加载中，2-加载完成，3-加载失败
    loading: false, // 是否正在加载中
    tabLoading: false, // tab切换时的加载状态
    listIsEmpty: false, // 列表是否为空
    scrollTop: 0 // 滚动位置
  },

  pageNo: 1, // 当前页码
  pageSize: 10, // 每页数量
  totalCount: 0, // 总记录数

  onLoad: function (options) {
    // 初始化页面数据
    this.setData({
      loadMoreStatus: 0,
      tabLoading: true // 初始加载时显示loading
    })
    this.loadThemeList(true)
  },

  // 标签页切换事件
  onTabsChange(e) {
    // 阻止事件冒泡，防止触发其他页面的onTabsChange
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    const activeTab = e.detail.value
    this.pageNo = 1
    this.setData({
      activeTab,
      themeList: [],
      loadMoreStatus: 0,
      tabLoading: true, // 开始加载时显示tab loading
      hasLoaded: false // 重置加载状态
    })

    // 将scroll-view滚动到顶部
    this.scrollToTop()

    // 切换标签页后重新加载数据
    this.loadThemeList(true)
  },

  // 将滚动区域滚动到顶部
  scrollToTop() {
    // 方法1: 通过设置随机scrollTop触发滚动
    this.setData({
      scrollTop: Math.random() * 10 // 设置一个随机值，强制触发滚动更新
    })

    // 方法2: 通过API控制滚动
    wx.createSelectorQuery()
      .select('#themeScrollView')
      .node()
      .exec((res) => {
        const scrollView = res[0]?.node
        if (scrollView) {
          scrollView.scrollTo({
            top: 0,
            behavior: 'instant'
          })
        }
      })
  },

  // 上拉加载更多
  onReachBottom() {
    console.log('触发上拉加载更多', this.data.loadMoreStatus)
    const { themeList } = this.data
    if (themeList.length >= this.totalCount) {
      console.log('已全部加载完成，总数：', this.totalCount)
      this.setData({
        loadMoreStatus: 2 // 已全部加载
      })
      return
    }
    if (this.data.loadMoreStatus !== 0) {
      console.log('当前状态不允许加载：', this.data.loadMoreStatus)
      return
    }
    this.loadThemeList(false)
  },

  // 重试加载
  onRetryLoad() {
    console.log('触发重试加载')
    this.loadThemeList(false)
  },

  // 加载主题风格列表
  loadThemeList(reset = true) {
    const { loadMoreStatus, themeList = [] } = this.data
    if (loadMoreStatus !== 0 && !reset) {
      console.log('当前状态不允许加载更多')
      return
    }
    this.setData({
      loadMoreStatus: 1,
      loading: true
      // 保持tabLoading状态不变，由外部调用控制
    })

    // 模拟网络请求延迟
    setTimeout(() => {
      try {
        // 根据当前标签页类型获取不同的主题风格
        const tabType = this.data.activeTab
        const params = {
          tabType,
          pageNum: reset ? 1 : this.pageNo + 1,
          pageSize: this.pageSize
        }

        // 模拟数据，实际应从API获取
        const mockData = this.getMockThemeData(
          params.tabType,
          params.pageNum,
          params.pageSize
        )

        // 模拟总记录数 (根据标签页类型设置不同的总记录数)
        const totalCount = 7 // 每个分类下都有7个风格
        this.totalCount = totalCount

        // 如果没有数据且是刷新操作
        if (mockData.length === 0 && reset) {
          this.setData({
            themeList: [],
            hasLoaded: true,
            loadMoreStatus: 2, // 设置为已全部加载
            loading: false,
            tabLoading: false, // 无数据时，隐藏tab loading
            listIsEmpty: true
          })
          return
        }

        // 更新列表数据
        const _themeList = reset ? mockData : themeList.concat(mockData)
        const _loadMoreStatus = _themeList.length === totalCount ? 2 : 0 // 已到达末尾设为2，否则设为0
        this.pageNo = params.pageNum

        this.setData({
          themeList: _themeList,
          loadMoreStatus: _loadMoreStatus,
          hasLoaded: true,
          loading: false,
          tabLoading: false, // 加载完成，隐藏tab loading
          listIsEmpty: _themeList.length === 0
        })
      } catch (error) {
        console.error('加载数据失败', error)
        this.setData({
          loadMoreStatus: 3, // 设置为加载失败状态
          loading: false,
          tabLoading: false, // 加载失败，隐藏tab loading
          hasLoaded: true
        })

        // 显示加载失败提示
        console.log('加载失败，请重试')
      }
    }, 800)
  },

  // 获取模拟主题数据
  getMockThemeData(tabType, pageNo, pageSize) {
    const result = []
    const offset = (pageNo - 1) * pageSize

    // 主题分类及其下面的风格列表
    const themeCategories = [
      {
        name: '商务风格',
        styles: [
          {
            name: '经典商务',
            description: '传统稳重的商务风格，适合正式会议和商务谈判'
          },
          {
            name: '现代商务',
            description: '融合现代元素的商务风格，简洁而专业'
          },
          {
            name: '简约商务',
            description: '去除繁琐装饰的商务风格，突出内容重点'
          },
          {
            name: '高端商务',
            description: '精致典雅的高端商务风格，彰显品牌实力'
          },
          {
            name: '传统商务',
            description: '经典传统的商务风格，体现企业文化底蕴'
          },
          {
            name: '国际商务',
            description: '国际化视野的商务风格，适合跨国企业'
          },
          {
            name: '科技商务',
            description: '融入科技元素的商务风格，展现创新活力'
          }
        ]
      },
      {
        name: '创意风格',
        styles: [
          {
            name: '艺术创意',
            description: '富有艺术气息的创意风格，激发灵感与想象'
          },
          {
            name: '时尚创意',
            description: '紧跟潮流的时尚创意风格，展现个性魅力'
          },
          {
            name: '科技创意',
            description: '融合科技元素的创意风格，未来感十足'
          },
          {
            name: '年轻创意',
            description: '充满活力的年轻创意风格，适合年轻群体'
          },
          {
            name: '潮流创意',
            description: '把握潮流脉搏的创意风格，引领时代趋势'
          },
          { name: '插画创意', description: '手绘插画风格的创意设计，温暖有趣' },
          {
            name: '几何创意',
            description: '运用几何元素的创意风格，简洁而富有张力'
          }
        ]
      },
      {
        name: '简约风格',
        styles: [
          { name: '极简白', description: '纯净简洁的白色主调，营造清爽空间感' },
          {
            name: '现代简约',
            description: '现代简约美学，注重功能性与美观性的平衡'
          },
          { name: '北欧简约', description: '北欧风格的简约设计，温馨而实用' },
          { name: '日式简约', description: '日式禅意的简约风格，宁静致远' },
          { name: '清新简约', description: '清新自然的简约风格，给人舒适感受' },
          { name: '冷色简约', description: '冷色调的简约风格，理性而专业' },
          { name: '暖色简约', description: '暖色调的简约风格，温馨而亲和' }
        ]
      }
    ]

    const category = themeCategories[parseInt(tabType)]

    // 模拟最多3页数据
    if (pageNo > 3) return []

    // 计算当前页应该返回的风格数量
    const totalStyles = category.styles.length
    const maxItems =
      pageNo === 3
        ? Math.max(0, totalStyles - offset)
        : Math.min(pageSize, totalStyles - offset)

    for (let i = 0; i < maxItems; i++) {
      const styleIndex = offset + i
      if (styleIndex >= totalStyles) break

      const style = category.styles[styleIndex]
      result.push({
        id: `${tabType}-${styleIndex + 1}`,
        name: style.name,
        description: style.description
      })
    }

    return result
  },

  // 点击主题项选择
  onThemeItemClick(e) {
    const theme = e.currentTarget.dataset.theme
    console.log('选择了主题', theme)

    // 将选中的主题传递给上一页
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2] // 获取上一页面实例
    if (prevPage) {
      prevPage.setData({
        selectedTheme: theme
      })
    }

    // 直接返回上一页
    wx.navigateBack()
  }
})
