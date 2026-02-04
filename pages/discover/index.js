import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import Toast from 'tdesign-miniprogram/toast/index'
import { getCharacterType, getCharacterTag, getCharacterList, getCurrentPlotByCharacterId } from '../../services/role/index'

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
      navList: [],
      activeNav: '',
      showSwiper: false,
      navScrollLeft: 0,

      orderValue: 'hot',
      orderOptions: [
        {
          value: 'hot',
          text: '热门排序',
        },
        {
          value: 'new',
          text: '最新排序',
        }
      ],
      // 筛选标签
      tagList: [],
      activeTags: [], // 改为数组支持多选
      tagScrollLeft: 0,
      activeForm: {
        current: 0,
        list: [1,2,3],
        duration: 500,
        interval: 3000,
        autoplay: true,
      },
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
      // 分页参数
      pageNo: 1,
      pageSize: 10,
      totalCount: 0,
    },


    onLoad: function () {
      userStore.bind(this)
      
      // 获取页面信息
      const pageInfo = SystemInfo.getPageInfo()
      const scrollHeight = `calc(100vh - ${pageInfo.navHeight}px - 72rpx - 82rpx)`
      
      this.setData({
        pageInfo,
        scrollHeight
      })
      this.getCharacterType()
      this.getCharacterTag()
      // 注意：loadRoleList会在getCharacterType中设置第一个nav后自动调用
    },

    onShow: function () {
      // 更新 tabBar 高亮状态
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().init()
      }
    },

    async getCharacterType() {
      const res = await getCharacterType()
      this.setData({
        navList: res
      })
      // 默认选中第一个
      if (res && res.length > 0 && !this.data.activeNav) {
        this.setData({
          activeNav: res[0].id,
          showSwiper: true,
        })
        // 重新加载列表
        this.data.pageNo = 1
        this.loadRoleList(true)
      } else {
        this.updateShowSwiper()
      }
    },
    async getCharacterTag() {
      const res = await getCharacterTag()
      this.setData({
        tagList: res
      })
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
      }, () => {
        this.updateShowSwiper()
      })
      this.data.pageNo = 1
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

    // 筛选标签切换（多选）
    onTagChange(e) {
      const value = e.currentTarget.dataset.value
      const index = e.currentTarget.dataset.index
      const activeTags = [...this.data.activeTags]
      
      // 查找当前tag是否已选中
      const tagIndex = activeTags.indexOf(value)
      if (tagIndex > -1) {
        // 已选中，则移除
        activeTags.splice(tagIndex, 1)
      } else {
        // 未选中，则添加
        activeTags.push(value)
      }

      this.setData({
        activeTags,
        roleList: [],
        loadMoreStatus: 0,
      })
      this.data.pageNo = 1
      this.loadRoleList(true)
      
      // 滚动到选中标签的中间位置
      if (activeTags.length > 0 && activeTags.includes(value)) {
        this.scrollToTag(index)
      }
    },

    onOrderChange(e) {
      console.log(e, '------')
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
      this.data.pageNo = 1
      this.loadRoleList(true)
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
        // this.data.pageNo += 1
        this.setData({
          pageNo: this.data.pageNo + 1
        })
      }

      // 设置加载状态
      this.setData({
        loadMoreStatus: 1,
      })

      try {
        // 构建请求参数
        const params = {
          current: this.data.pageNo,
          size: this.data.pageSize,
          ifSystem: true,
          characterTypeIds: this.data.activeNav,
          characterTagIds: this.data.activeTags.join(','),
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

    onActiveChange(e) {
      this.setData({
        activeForm: {
          ...this.data.activeForm,
          current: e.detail.current,
        }
      })
    },

    updateShowSwiper() {
      const firstNavId = this.data.navList && this.data.navList.length > 0 ? this.data.navList[0].id : ''
      const showSwiper = !!firstNavId && this.data.activeNav === firstNavId

      if (this.data.showSwiper !== showSwiper) {
        this.setData({
          showSwiper,
        })
      }
    },

    // 点击角色卡片
    async onRoleClick(e) {
      const id = e.currentTarget.dataset.id
      const res = await getCurrentPlotByCharacterId(id)
      wx.navigateTo({
        url: `/pages/chat/index?plotId=${ res && res.plotId ? res.plotId : ''}&characterId=${id}`
      })
    },
  })
)
