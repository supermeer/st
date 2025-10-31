import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import Toast from 'tdesign-miniprogram/toast/index'
import Dialog from 'tdesign-miniprogram/dialog/index'
import ChatService from '../../services/ai/chat'
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
        // mock假数据
        const chatList = [
          {
            id: 1,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            isTop: true,
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 2,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 3,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧开始聊天吧开始聊天吧开始聊天吧开始聊天吧开始聊天吧开始聊天吧开始聊天吧开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 4,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 5,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 6,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 7,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 8,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 9,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 10,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 11,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 12,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
          {
            id: 13,
            name: '未命名角色',
            avatar: '/static/chat/default-avatar.png',
            lastMessage: '开始聊天吧',
            time: new Date().getTime(),
            timeText: this.formatTime(new Date().getTime())
          },
        ]
        this.setData({
          chatList,
          refreshing: false
        })
        // const res = await ChatService.getSessionList(params)
        
        // if (res.code === 200 && res.data) {
        //   const chatList = (res.data.records || []).map(item => ({
        //     id: item.id,
        //     name: item.roleName || '未命名角色',
        //     avatar: item.roleAvatar || '/static/chat/default-avatar.png',
        //     lastMessage: item.lastMessage || '开始聊天吧',
        //     time: item.updateTime || item.createTime,
        //     timeText: this.formatTime(item.updateTime || item.createTime)
        //   }))
          
        //   this.setData({
        //     chatList,
        //     refreshing: false
        //   })
        // } else {
        //   throw new Error(res.msg || '获取聊天列表失败')
        // }
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
      wx.navigateTo({
        url: `/pages/chat/session/index?id=${id}`
      })
    },
    onTopChat(e) {
      const { id } = e.currentTarget.dataset
      console.log(id)
      Toast({
        context: this,
        selector: '#t-toast',
        message: '置顶成功',
      })
      const chatList = this.data.chatList.filter(item => item.id !== id)
      this.setData({ chatList })
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
        // 调用删除接口
        // const res = await ChatService.deleteSession(id)
        
        // 暂时直接从列表中移除
        const chatList = this.data.chatList.filter(item => item.id !== id)
        this.setData({ chatList })
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '删除成功',
        })
      } catch (error) {
        console.error('删除聊天失败:', error)
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '删除失败，请重试',
        })
      }
    }
  })
)

