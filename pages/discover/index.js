import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import Toast from 'tdesign-miniprogram/toast/index'
import { getCharacterType, getCharacterTag, getCharacterList, getCurrentPlotByCharacterId } from '../../services/role/index'
import { getModelList, getGlobalModelId, isSpringFestivalExpired, getActivity } from '../../services/usercenter/index'
import { getGroupList } from '../../services/group/index'

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
      showGroupRedDot: true,

      sortField: 'browseCount',
      sortOrder: 'desc',
      orderOptions: [
        {
          value: 'browseCount',
          text: '热门排序',
        },
        {
          value: 'publishTime',
          text: '最新排序',
        }
      ],
      // 筛选标签
      tagList: [],
      activeTags: [], // 改为数组支持多选
      tagScrollLeft: 0,
      activeForm: {
        current: 0,
        list: [
          {
            url: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/SpringFestival_26/invite.jpg',
            type: 'invite'
          }
        ],
        duration: 500,
        interval: 3000,
        autoplay: true,
      },
      // 角色列表
      roleList: [],
      
      // 群聊列表
      groupList: [
        {
          id: 'group_1',
          name: '修仙聊天群',
          description: '修仙问道，共赴长生之路',
          backgroundImage: 'https://picsum.photos/702/380?random=1',
          memberCount: 128,
          messageCount: 3582,
          ifHot: true,
          tags: ['修仙', '玄幻', '古风']
        },
        {
          id: 'group_2',
          name: '现代都市日常',
          description: '繁华都市中的温馨故事',
          backgroundImage: 'https://picsum.photos/702/380?random=2',
          memberCount: 256,
          messageCount: 8934,
          ifHot: true,
          tags: ['都市', '日常', '治愈']
        },
        {
          id: 'group_3',
          name: '星际冒险小队',
          description: '探索宇宙未知，挑战星辰大海',
          backgroundImage: 'https://picsum.photos/702/380?random=3',
          memberCount: 64,
          messageCount: 1205,
          ifHot: false,
          tags: ['科幻', '冒险', '星际']
        },
        {
          id: 'group_4',
          name: '校园青春物语',
          description: '青春不留遗憾，一起成长吧',
          backgroundImage: 'https://picsum.photos/702/380?random=4',
          memberCount: 189,
          messageCount: 4521,
          ifHot: false,
          tags: ['校园', '青春', '纯爱']
        },
        {
          id: 'group_5',
          name: '异世界转生团',
          description: '穿越异世界，开启第二人生',
          backgroundImage: 'https://picsum.photos/702/380?random=5',
          memberCount: 312,
          messageCount: 10234,
          ifHot: true,
          tags: ['异世界', '转生', '冒险']
        },
        {
          id: 'group_6',
          name: '古风言情专区',
          description: '诗词歌赋，诉说千古情缘',
          backgroundImage: 'https://picsum.photos/702/380?random=6',
          memberCount: 98,
          messageCount: 2156,
          ifHot: false,
          tags: ['古风', '言情', '虐恋']
        },
        {
          id: 'group_7',
          name: '悬疑探案组',
          description: '抽丝剥茧，揭开真相的面纱',
          backgroundImage: 'https://picsum.photos/702/380?random=7',
          memberCount: 145,
          messageCount: 3890,
          ifHot: false,
          tags: ['悬疑', '推理', '烧脑']
        },
        {
          id: 'group_8',
          name: '二次元同好会',
          description: 'ACG爱好者的聚集地',
          backgroundImage: 'https://picsum.photos/702/380?random=8',
          memberCount: 520,
          messageCount: 15890,
          ifHot: true,
          tags: ['二次元', '动漫', '游戏']
        },
        {
          id: 'group_9',
          name: '职场成长日记',
          description: '职场小白进阶之路',
          backgroundImage: 'https://picsum.photos/702/380?random=9',
          memberCount: 76,
          messageCount: 1890,
          ifHot: false,
          tags: ['职场', '成长', '励志']
        },
        {
          id: 'group_10',
          name: '奇幻冒险大陆',
          description: '魔法与剑的世界，等你探索',
          backgroundImage: 'https://picsum.photos/702/380?random=10',
          memberCount: 234,
          messageCount: 6780,
          ifHot: true,
          tags: ['奇幻', '冒险', '魔法']
        }
      ],
      
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
      discountForm: {
        visible: false,
        picUrl: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/SpringFestival_26/gemini_activity.png'
      },
      showBG: true
    },


    onLoad: function () {
      const ev = wx.getStorageSync('aE')
      if (ev == '0') {
        this.setData({
          showBG: false
        })
      }
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
      this.getSpringFestivalExpired()
      userStore.refreshPointInfo()
      
      // 检查是否需要显示群聊红点
      this.checkGroupRedDot()
    },

    onShow: function () {
      // 更新 tabBar 高亮状态
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().init()
      }

      setTimeout(() => {
        this.setData({
        activeForm: {
          ...this.data.activeForm,
          autoplay: true
        }
      })
      }, 300);
    },

    onHide() {
      this.setData({
        activeForm: {
          ...this.data.activeForm,
          autoplay: false
        }
      })
    },

    onRank() {
      wx.navigateTo({
        url: '/pages/discover/rank/index'
      })
    },

    getSpringFestivalExpired() {
      isSpringFestivalExpired().then(res => {
        if(!res && this.data.showBG) {
          const list = [
            {
              url: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/SpringFestival_26/banner_1.jpg',
              type: 'discount'
              // url: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/SpringFestival_26/activity.gif'
            },
            {
              url: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/SpringFestival_26/banner_2.jpg',
              type: 'point'
            },
            {
              url: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/SpringFestival_26/banner_3.jpg',
              type: 'vip'
            },
            ...this.data.activeForm.list
          ]
          this.setData({
            activeForm: {
              ...this.data.activeForm,
              list: [...list]
            }
          })
        }
      })
    },

    async getCharacterType() {
      const res = await getCharacterType()
      // 在navList第二个位置添加群聊标签
      const navList = [...res.slice(0, 1), { id: 'group', name: '群聊' }, ...res.slice(1)]
      this.setData({
        navList: navList
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

      // 如果切换到群聊标签，隐藏红点并标记已查看
      if (value === 'group') {
        this.setData({
          showGroupRedDot: false,
        })
        // 标记已查看过群聊
        wx.setStorageSync('hasSeenGroup', true)
      }

      this.setData({
        activeNav: value,
        roleList: [],
        groupList: [],
        loadMoreStatus: 0,
      }, () => {
        this.updateShowSwiper()
      })
      this.data.pageNo = 1

      if (value === 'group') {
        this.loadGroupList(true)
      } else {
        this.loadRoleList(true)
      }
      
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
      this.setData({
        sortField: e.detail
      })
      this.loadRoleList(true)
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

      if (this.data.activeNav === 'group') {
        this.loadGroupList(true)
      } else {
        this.loadRoleList(true)
      }
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
      const { roleList, groupList, loadMoreStatus, totalCount } = this.data
      
      const currentList = this.data.activeNav === 'group' ? groupList : roleList
      
      if (currentList.length >= totalCount) {
        this.setData({
          loadMoreStatus: 2, // 已全部加载
        })
        return
      }

      if (loadMoreStatus !== 0) return

      if (this.data.activeNav === 'group') {
        this.loadGroupList(false)
      } else {
        this.loadRoleList(false)
      }
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
          sortOrder: this.data.sortOrder,
          sortField: this.data.sortField,
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

    // 检查群聊红点
    checkGroupRedDot() {
      const hasSeenGroup = wx.getStorageSync('hasSeenGroup')
      if (hasSeenGroup) {
        this.setData({
          showGroupRedDot: false
        })
      }
    },

    // 加载群聊列表
    async loadGroupList(isRefresh = false) {
      if (isRefresh) {
        this.data.pageNo = 1
      } else {
        this.setData({
          pageNo: this.data.pageNo + 1
        })
      }

      this.setData({
        loadMoreStatus: 1,
      })

      try {
        let records = []
        try {
          const res = await getGroupList({})
          records = res && res.records ? res.records : []
        } catch (e) {
          // 接口不存在时使用测试数据
          records = []
        }
        
        // 如果接口没有返回数据，使用测试数据
        const mockGroupList = [
          {
            id: 'group_1',
            name: '修仙聊天群',
            description: '修仙问道，共赴长生之路',
            backgroundImage: 'https://picsum.photos/702/380?random=1',
            memberCount: 128,
            messageCount: 3582,
            browseCount: 12580,
            ifHot: true,
            tags: ['修仙', '玄幻', '古风'],
            members: [
              { id: 'm1', portrait: 'https://i.pravatar.cc/100?img=1' },
              { id: 'm2', portrait: 'https://i.pravatar.cc/100?img=2' },
              { id: 'm3', portrait: 'https://i.pravatar.cc/100?img=3' },
              { id: 'm4', portrait: 'https://i.pravatar.cc/100?img=4' },
              { id: 'm5', portrait: 'https://i.pravatar.cc/100?img=5' },
              { id: 'm6', portrait: 'https://i.pravatar.cc/100?img=6' }
            ]
          },
          {
            id: 'group_2',
            name: '现代都市日常',
            description: '繁华都市中的温馨故事',
            backgroundImage: 'https://picsum.photos/702/380?random=2',
            memberCount: 256,
            messageCount: 8934,
            browseCount: 25680,
            ifHot: true,
            tags: ['都市', '日常', '治愈'],
            members: [
              { id: 'm7', portrait: 'https://i.pravatar.cc/100?img=7' },
              { id: 'm8', portrait: 'https://i.pravatar.cc/100?img=8' },
              { id: 'm9', portrait: 'https://i.pravatar.cc/100?img=9' }
            ]
          },
          {
            id: 'group_3',
            name: '星际冒险小队',
            description: '探索宇宙未知，挑战星辰大海',
            backgroundImage: 'https://picsum.photos/702/380?random=3',
            memberCount: 64,
            messageCount: 1205,
            browseCount: 8920,
            ifHot: false,
            tags: ['科幻', '冒险', '星际'],
            members: [
              { id: 'm10', portrait: 'https://i.pravatar.cc/100?img=10' },
              { id: 'm11', portrait: 'https://i.pravatar.cc/100?img=11' },
              { id: 'm12', portrait: 'https://i.pravatar.cc/100?img=12' },
              { id: 'm13', portrait: 'https://i.pravatar.cc/100?img=13' },
              { id: 'm14', portrait: 'https://i.pravatar.cc/100?img=14' }
            ]
          },
          {
            id: 'group_4',
            name: '校园青春物语',
            description: '青春不留遗憾，一起成长吧',
            backgroundImage: 'https://picsum.photos/702/380?random=4',
            memberCount: 189,
            messageCount: 4521,
            browseCount: 15600,
            ifHot: false,
            tags: ['校园', '青春', '纯爱'],
            members: [
              { id: 'm15', portrait: 'https://i.pravatar.cc/100?img=15' },
              { id: 'm16', portrait: 'https://i.pravatar.cc/100?img=16' },
              { id: 'm17', portrait: 'https://i.pravatar.cc/100?img=17' }
            ]
          },
          {
            id: 'group_5',
            name: '异世界转生团',
            description: '穿越异世界，开启第二人生',
            backgroundImage: 'https://picsum.photos/702/380?random=5',
            memberCount: 312,
            messageCount: 10234,
            browseCount: 38900,
            ifHot: true,
            tags: ['异世界', '转生', '冒险'],
            members: [
              { id: 'm18', portrait: 'https://i.pravatar.cc/100?img=18' },
              { id: 'm19', portrait: 'https://i.pravatar.cc/100?img=19' },
              { id: 'm20', portrait: 'https://i.pravatar.cc/100?img=20' },
              { id: 'm21', portrait: 'https://i.pravatar.cc/100?img=21' },
              { id: 'm22', portrait: 'https://i.pravatar.cc/100?img=22' },
              { id: 'm23', portrait: 'https://i.pravatar.cc/100?img=23' },
              { id: 'm24', portrait: 'https://i.pravatar.cc/100?img=24' },
              { id: 'm25', portrait: 'https://i.pravatar.cc/100?img=25' }
            ]
          },
          {
            id: 'group_6',
            name: '古风言情专区',
            description: '诗词歌赋，诉说千古情缘',
            backgroundImage: 'https://picsum.photos/702/380?random=6',
            memberCount: 98,
            messageCount: 2156,
            browseCount: 7800,
            ifHot: false,
            tags: ['古风', '言情', '虐恋'],
            members: [
              { id: 'm26', portrait: 'https://i.pravatar.cc/100?img=26' },
              { id: 'm27', portrait: 'https://i.pravatar.cc/100?img=27' }
            ]
          },
          {
            id: 'group_7',
            name: '悬疑探案组',
            description: '抽丝剥茧，揭开真相的面纱',
            backgroundImage: 'https://picsum.photos/702/380?random=7',
            memberCount: 145,
            messageCount: 3890,
            browseCount: 11200,
            ifHot: false,
            tags: ['悬疑', '推理', '烧脑'],
            members: [
              { id: 'm28', portrait: 'https://i.pravatar.cc/100?img=28' },
              { id: 'm29', portrait: 'https://i.pravatar.cc/100?img=29' },
              { id: 'm30', portrait: 'https://i.pravatar.cc/100?img=30' },
              { id: 'm31', portrait: 'https://i.pravatar.cc/100?img=31' }
            ]
          },
          {
            id: 'group_8',
            name: '二次元同好会',
            description: 'ACG爱好者的聚集地',
            backgroundImage: 'https://picsum.photos/702/380?random=8',
            memberCount: 520,
            messageCount: 15890,
            browseCount: 45600,
            ifHot: true,
            tags: ['二次元', '动漫', '游戏'],
            members: [
              { id: 'm32', portrait: 'https://i.pravatar.cc/100?img=32' },
              { id: 'm33', portrait: 'https://i.pravatar.cc/100?img=33' },
              { id: 'm34', portrait: 'https://i.pravatar.cc/100?img=34' },
              { id: 'm35', portrait: 'https://i.pravatar.cc/100?img=35' },
              { id: 'm36', portrait: 'https://i.pravatar.cc/100?img=36' },
              { id: 'm37', portrait: 'https://i.pravatar.cc/100?img=37' },
              { id: 'm38', portrait: 'https://i.pravatar.cc/100?img=38' }
            ]
          },
          {
            id: 'group_9',
            name: '职场成长日记',
            description: '职场小白进阶之路',
            backgroundImage: 'https://picsum.photos/702/380?random=9',
            memberCount: 76,
            messageCount: 1890,
            browseCount: 6200,
            ifHot: false,
            tags: ['职场', '成长', '励志'],
            members: [
              { id: 'm39', portrait: 'https://i.pravatar.cc/100?img=39' },
              { id: 'm40', portrait: 'https://i.pravatar.cc/100?img=40' },
              { id: 'm41', portrait: 'https://i.pravatar.cc/100?img=41' }
            ]
          },
          {
            id: 'group_10',
            name: '奇幻冒险大陆',
            description: '魔法与剑的世界，等你探索',
            backgroundImage: 'https://picsum.photos/702/380?random=10',
            memberCount: 234,
            messageCount: 6780,
            browseCount: 19800,
            ifHot: true,
            tags: ['奇幻', '冒险', '魔法'],
            members: [
              { id: 'm42', portrait: 'https://i.pravatar.cc/100?img=42' },
              { id: 'm43', portrait: 'https://i.pravatar.cc/100?img=43' },
              { id: 'm44', portrait: 'https://i.pravatar.cc/100?img=44' },
              { id: 'm45', portrait: 'https://i.pravatar.cc/100?img=45' },
              { id: 'm46', portrait: 'https://i.pravatar.cc/100?img=46' }
            ]
          }
        ]

        const finalRecords = records.length > 0 ? records : mockGroupList
        const newList = isRefresh ? [...finalRecords] : [...this.data.groupList, ...finalRecords]
        const totalCount = records.length > 0 ? (records.length) : mockGroupList.length

        this.setData({
          totalCount: totalCount,
          groupList: newList,
          loadMoreStatus: newList.length >= totalCount ? 2 : 0,
          listIsEmpty: newList.length === 0,
          refreshing: false,
        })
      } catch (error) {
        console.error('加载群聊列表失败:', error)
        
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

    // 点击群聊卡片
    onGroupClick(e) {
      const { id } = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/group/chat/index?groupId=${id}`
      })
    },

    updateShowSwiper() {
      const firstNavId = this.data.navList && this.data.navList.length > 0 ? this.data.navList[0].id : ''
      // 群聊标签时不显示轮播图
      const showSwiper = !!firstNavId && this.data.activeNav === firstNavId && this.data.activeNav !== 'group'

      if (this.data.showSwiper !== showSwiper) {
        this.setData({
          showSwiper,
        })
      }
    },

    async onActivityClick() {
      const {list, current} = this.data.activeForm
      const item = list[current]
      const { type } = item
      if (type === 'discount') {
        this.setData({
          discountForm: {
            ...this.data.discountForm,
            visible: true
          }
        })
      }
      if (type === 'vip') {
        wx.navigateTo({
          url: '/pages/vip/packages/index'
        })
      }
      if (type === 'point') {
        const dialog = this.selectComponent('#pointsRechargeDialog')
        if (dialog) {
          dialog.show()
        }
      }
      if (type === 'invite') {
        const richtext = await getActivity({activityType: 1})
        const richtextDialog = this.selectComponent('#richtextDialog')
        richtextDialog.show({
          isShare: true,
          contentNodes: richtext.content || '',
          buttons: [
            { text: '添加客服', variant: 'outline', type: 'cs' },
            { text: '去分享', type: 'share' }
          ]
        })
      }
    },
    discountOverlayClick() {
      this.setData({
        discountForm: {
          ...this.data.discountForm,
          visible: false
        }
      })
    },
    handleDiscountClick() {
      Promise.all([getGlobalModelId(), getModelList()]).then(res => {
        const [id , list] = res
        const modelSheetRef = this.selectComponent('#modelSheet')
        modelSheetRef.show({
          modelOptions: [...list],
          currentValue: id,
          onConfirm: (id, item) => {
            wx.showToast({
            title: '保存成功！',
            icon: 'none',
            duration: 1500
          })
          }
        })
      })
    },
    richtextAction({ detail }) {
      const { type } = detail
      if (type === 'cs') {
        const app = getApp()
        wx.openCustomerServiceChat({
          extInfo: { url: app.globalData.wxCustomerService.url },
          corpId: app.globalData.wxCustomerService.corpId,
          success(res) {}
        })
      }
      if (type === 'share') {
        this.setData({
          isInvite: true
        })
      }
    },
    // 点击角色卡片
    async onRoleClick(e) {
      const id = e.currentTarget.dataset.id
      const res = await getCurrentPlotByCharacterId(id)
      wx.navigateTo({
        url: `/pages/chat/index?plotId=${ res && res.plotId ? res.plotId : ''}&characterId=${id}&isDiscover=${true}`
      })
    },
  })
)
