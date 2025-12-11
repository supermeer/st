import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import Toast from 'tdesign-miniprogram/toast/index'
import { getChatList, deleteChat, topChat } from '../../services/ai/chat'
import dayjs from 'dayjs'

Page(
  Object.assign({}, userStore.data, {
    data: {
      // 页面信息
      pageInfo: {
        navHeight: 0,
        safeAreaBottom: 0,
        tabbarHeight: 0,
      },
      scrollHeight: 0,
      
      // 聊天列表数据
      chatList: [],
      
      // 下拉刷新
      refreshing: false,
      loadingProps: {
        size: '50rpx',
      },
      
      // 滚动状态
      isScrollTop: true // 是否在顶部
    },
    onLoad: function () {
      userStore.bind(this)
      
      // 获取页面信息
      const pageInfo = SystemInfo.getPageInfo()
      const scrollHeight = `calc(100vh - ${pageInfo.navHeight}px)`
      
      this.setData({
        pageInfo,
        scrollHeight
      })
    },
    
    onShow: function () {
      // 更新 tabBar 高亮状态
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().init()
      }
      // 加载聊天列表
      this.loadChatList()
    },
    
    /**
     * 监听滚动
     */
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
    
    /**
     * 下拉刷新
     */
    onRefresh() {
      if (this.data.refreshing) return

      this.setData({
        refreshing: true,
      })

      this.loadChatList()
    },

    /**
     * 刷新超时
     */
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
    
    /**
     * 加载聊天列表
     */
    async loadChatList() {
      try {
        const params = {
          pageNo: 1,
          pageSize: 100
        }
        const res = await getChatList(params)
        // 格式化时间
        const chatList = res.map(item => {
          return {
            ...item,
            timeText: this.formatTime(item.createTime)
          }
        })
        this.setData({
          chatList,
          refreshing: false
        })
      } catch (error) {
        console.error('加载聊天列表失败:', error)
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: error.message || '加载失败，请重试',
        })
        
        this.setData({
          refreshing: false
        })
      }
    },
    
    /**
     * 格式化时间显示
     */
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const now = dayjs()
      const time = dayjs(timestamp)
      const diffDays = now.diff(time, 'day')
      if (diffDays === 0) {
        // 今天，显示时:分
        return time.format('HH:mm')
      } else if (diffDays === 1) {
        // 昨天
        return '昨天'
      } else if (diffDays < 7) {
        // 一周内，显示星期
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        return weekdays[time.day()]
      } else if (now.year() === time.year()) {
        // 今年，显示月-日
        return time.format('MM-DD')
      } else {
        // 往年，显示年-月-日
        return time.format('YYYY-MM-DD')
      }
    },
    
    /**
     * 点击聊天项，进入聊天会话
     */
    onChatItemClick(e) {
      const { id } = e.currentTarget.dataset
      const plot = this.data.chatList.find(item => item.plotId === id)
      wx.navigateTo({
        url: `/pages/chat/index?plotId=${id}&characterId=${plot.characterId}`
      })
    },
    onTopChat(e) {
      const { id } = e.currentTarget.dataset
      const plot = this.data.chatList.find(item => item.plotId === id)
      const isTop = !plot.isTop
      this.topChat({
        characterId: plot.characterId,
        plotId: plot.plotId,
        isTop
      })
    },
    /**
     * 删除聊天
     */
    onDeleteChat(e) {
      const { id } = e.currentTarget.dataset
      
      const tipDialog = this.selectComponent('#tip-dialog')
      tipDialog.show({
        content: '删除后，您与该智能体的所有对话将被清除，且不可撤回。',
        cancelText: '取消',
        confirmText: '删除',
        onCancel: () => {
          // 取消操作，对话框会自动关闭
        },
        onConfirm: () => {
          // 确认删除
          this.deleteChat(id)
        }
      })
    },
    /**
     * 执行删除操作
     */
    async deleteChat(id) {
      try {
        await deleteChat({ characterId: id })
        Toast({
          context: this,
          selector: '#t-toast',
          message: '删除成功',
        })
        this.loadChatList()
        
      } catch (error) {
        console.error('删除聊天失败:', error)
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '删除失败，请重试',
        })
      }
    },
    // 置顶
    async topChat({ characterId, plotId, isTop }) {
      try {
        await topChat({ characterId, isTop })
        Toast({
          context: this,
          selector: '#t-toast',
          message: isTop ? '置顶成功' : '取消置顶成功',
        })
        this.loadChatList()
        // 右滑关闭
        this.closeSwipeCell(plotId)
      } catch (error) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: isTop ? '置顶失败，请重试' : '取消置顶失败，请重试',
        })
      }
    },
    closeSwipeCell(id) {
      const swipeCell = this.selectComponent(`#swipeCell-${id}`)
      if (swipeCell) {
        swipeCell.close()
      }
    }
  })
)

