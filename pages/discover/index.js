import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import Toast from 'tdesign-miniprogram/toast/index'

Page(
  Object.assign({}, userStore.data, {
    data: {
      // 页面信息
      pageInfo: {
        navHeight: 0,
        safeAreaBottom: 0,
      },
      scrollHeight: 0,

      // 导航标签
      navList: [
        { label: '新朋友', value: 'new' },
        { label: '古今对话', value: 'history' },
        { label: '亲果朋友', value: 'friend' },
        { label: '回到从前', value: 'back' },
      ],
      activeNav: 'new',
      navScrollLeft: 0,

      // 筛选标签
      tagList: [
        { label: '#每次喜欢喵', value: 'like' },
        { label: '#情绪价值', value: 'emotion' },
        { label: '#家门生活', value: 'life' },
        { label: '#超理想', value: 'ideal' },
      ],
      activeTag: '',
      tagScrollLeft: 0,

      // 角色列表
      roleList: [],
      
      // 下拉刷新
      refreshing: false,
      loadingProps: {
        size: '50rpx',
      },

      // 加载状态
      loadMoreStatus: 0, // 0-加载前，1-加载中，2-加载完成，3-加载失败
      listIsEmpty: false,

      // 滚动状态
      isScrollTop: true, // 是否在顶部
    },

    // 分页参数
    pageNo: 1,
    pageSize: 10,
    totalCount: 0,

    onLoad: function () {
      userStore.bind(this)
      
      // 获取页面信息
      const pageInfo = SystemInfo.getPageInfo()
      const scrollHeight = `calc(100vh - ${pageInfo.navHeight}px - 72rpx - 82rpx)`
      
      this.setData({
        pageInfo,
        scrollHeight
      })

      // 加载数据
      this.loadRoleList(true)
    },

    onShow: function () {
      // 更新 tabBar 高亮状态
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().init()
      }
    },

    // 导航标签切换
    onNavChange(e) {
      const value = e.currentTarget.dataset.value
      const index = e.currentTarget.dataset.index
      if (value === this.data.activeNav) return

      this.setData({
        activeNav: value,
        roleList: [],
        loadMoreStatus: 0,
      })
      this.pageNo = 1
      this.loadRoleList(true)
      
      // 滚动到选中标签的中间位置
      this.scrollToNavTab(index)
    },

    // 滚动导航标签到中间
    scrollToNavTab(index) {
      const query = wx.createSelectorQuery().in(this)
      
      // 获取scroll-view的宽度
      query.select('.nav-scroll').boundingClientRect()
      // 获取当前点击的tab的位置信息
      query.select(`#nav-tab-${index}`).boundingClientRect()
      // 获取nav-tabs的左边界位置
      query.select('.nav-tabs').boundingClientRect()
      
      query.exec((res) => {
        if (res[0] && res[1] && res[2]) {
          const scrollViewWidth = res[0].width // scroll-view的宽度
          const tabRect = res[1] // 当前tab的位置
          const tabsRect = res[2] // tabs容器的位置
          
          // 计算tab相对于tabs容器的左边距
          const tabLeft = tabRect.left - tabsRect.left
          // 计算tab的中心点
          const tabCenter = tabLeft + tabRect.width / 2
          // 计算需要滚动的距离，让tab中心对齐scroll-view中心
          const scrollLeft = tabCenter - scrollViewWidth / 2
          
          this.setData({
            navScrollLeft: Math.max(0, scrollLeft) // 不能小于0
          })
        }
      })
    },

    // 筛选标签切换
    onTagChange(e) {
      const value = e.currentTarget.dataset.value
      const index = e.currentTarget.dataset.index
      const activeTag = value === this.data.activeTag ? '' : value

      this.setData({
        activeTag,
        roleList: [],
        loadMoreStatus: 0,
      })
      this.pageNo = 1
      this.loadRoleList(true)
      
      // 滚动到选中标签的中间位置
      if (activeTag) {
        this.scrollToTag(index)
      }
    },

    // 滚动标签到中间
    scrollToTag(index) {
      const query = wx.createSelectorQuery().in(this)
      
      // 获取scroll-view的宽度
      query.select('.tags-scroll').boundingClientRect()
      // 获取当前点击的tag的位置信息
      query.select(`#tag-item-${index}`).boundingClientRect()
      // 获取tags容器的左边界位置（使用第一个tag-item作为参考）
      query.select('#tag-item-0').boundingClientRect()
      
      query.exec((res) => {
        if (res[0] && res[1] && res[2]) {
          const scrollViewWidth = res[0].width // scroll-view的宽度
          const tagRect = res[1] // 当前tag的位置
          const firstTagRect = res[2] // 第一个tag的位置
          
          // 计算tag相对于第一个tag的左边距
          const tagLeft = tagRect.left - firstTagRect.left
          // 计算tag的中心点
          const tagCenter = tagLeft + tagRect.width / 2
          // 计算需要滚动的距离，让tag中心对齐scroll-view中心
          const scrollLeft = tagCenter - scrollViewWidth / 2
          
          this.setData({
            tagScrollLeft: Math.max(0, scrollLeft) // 不能小于0
          })
        }
      })
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

    // 搜索
    onSearch() {
      wx.navigateTo({
        url: '/pages/discover/search/index'
      })
    },

    // 接收搜索结果（从搜索页面返回时调用）
    onSearchResult(keyword) {
      console.log('搜索关键词:', keyword)
      
      // TODO: 这里可以根据搜索关键词过滤角色列表
      Toast({
        context: this,
        selector: '#t-toast',
        message: `搜索: ${keyword}`,
      })

      // 重置列表并加载搜索结果
      this.setData({
        roleList: [],
        loadMoreStatus: 0,
      })
      this.pageNo = 1
      this.loadRoleList(true)
    },

    // 下拉刷新
    onRefresh() {
      if (this.data.refreshing) return

      this.setData({
        refreshing: true,
      })

      this.pageNo = 1
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
      const { roleList, loadMoreStatus } = this.data
      
      if (roleList.length >= this.totalCount) {
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
        this.pageNo = 1
      } else {
        this.pageNo += 1
      }

      // 设置加载状态
      this.setData({
        loadMoreStatus: 1,
      })

      try {
        // 模拟数据
        const mockData = this.getMockData()
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 800))

        const newList = isRefresh ? mockData : [...this.data.roleList, ...mockData]
        this.totalCount = 30 // 模拟总数

        this.setData({
          roleList: newList,
          loadMoreStatus: newList.length >= this.totalCount ? 2 : 0,
          listIsEmpty: newList.length === 0,
          refreshing: false,
        })
      } catch (error) {
        console.error('加载角色列表失败:', error)
        
        this.setData({
          loadMoreStatus: 3,
          refreshing: false,
        })

        Toast({
          context: this,
          selector: '#t-toast',
          message: '加载失败，请重试',
        })
      }
    },

    // 获取模拟数据
    getMockData() {
      const names = ['沈川爱', '程野', '校园白月光', '吸血鬼男友', '霸道总裁', '温柔医生', '神秘侦探', '古风公子', '现代王子', '运动少年']
      const tags = ['#都市豪婿幡', '#鸟啥竹号', '#喵适合线', '#情绪价值', '#每次喜欢', '#家门生活']
      const images = [
        'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png',
        'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png',
        'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png',
        'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/chat_bg.png',
      ]

      const list = []
      for (let i = 0; i < this.pageSize; i++) {
        const index = (this.pageNo - 1) * this.pageSize + i
        if (index >= 30) break // 模拟最多30条数据

        list.push({
          id: index + 1,
          name: names[index % names.length],
          image: images[index % images.length],
          verified: Math.random() > 0.5,
          tags: [
            tags[Math.floor(Math.random() * tags.length)],
            tags[Math.floor(Math.random() * tags.length)],
            tags[Math.floor(Math.random() * tags.length)],
          ].slice(0, 3),
        })
      }

      return list
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
  })
)
