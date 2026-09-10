import SystemInfo from '../../../utils/system'
import { deletePlot, setCurrentPlot, createStory } from '../../../services/ai/chat'
import { getGroupDetail } from '../../../services/group/index'
import { getStoryList } from '../../../services/ai/group-chat'
import ChatService from '../../../services/ai/chat'
import Toast from 'tdesign-miniprogram/toast/index'
import dayjs from 'dayjs'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    groupInfo: {
      id: null,
      name: '',
      avatarUrls: [],
      description: ''
    },
    storyList: [],
    currentStoryId: null,
    currentBg: '',
    showBG: true,
    roles: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({
        showBG: false
      })
    }
    // 获取传递的参数
    if (options.groupId) {
      this.setData({
        groupInfo: {
          ...this.data.groupInfo,
          id: options.groupId
        }
      })
      this.loadGroupInfo(options.groupId)
      this.loadStoryList(options.groupId)
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  loadGroupInfo(groupId, plotId) {
    getGroupDetail(groupId, plotId || '').then(res => {
      const roles = Array.isArray(res.characterInfos)
        ? res.characterInfos.map((c) => ({
            id: c.id,
            name: c.name || c.nickname || '',
            avatar: c.avatarUrl || c.avatar || ''
          }))
        : []
      this.setData({
        groupInfo: {
          ...this.data.groupInfo,
          ...res,
          avatarUrls: res.avatarUrls || this.data.groupInfo.avatarUrls || [],
          description: res.description || this.data.groupInfo.description || ''
        },
        currentBg: res.backgroundImage || '',
        currentStoryId: res.plotDetailVO?.storyId || null,
        roles
      })
    })
  },
  /**
   * 加载故事列表
   */
  loadStoryList(groupId) {
    getStoryList({ groupChatId: groupId }).then(res => {
      const list = Array.isArray(res) ? res : (res.list || [])
      this.setData({
        storyList: list.map(item => ({
          ...item,
          time: this.formatTime(item.updateTime)
        }))
      })
    })
  },

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
  // 如果是当前故事，直接跳转到聊天页面，如果不是，则根据story创建新剧情，跳转到聊天页面
  async onStoryTap(event) {
    const id = event.currentTarget.dataset.id
    if (id === this.data.currentStoryId) {
      return
    }
    const plotId = await ChatService.createPlot({
      groupChatId: this.data.groupInfo.id || '',
      storyId: id || '',
    })
    wx.redirectTo({
      url: `/pages/chat/index?plotId=${plotId || ''}&groupId=${this.data.groupInfo.id}`
    })
  },
  
  /**
   * 删除故事
   */
  onDeletePlot(e) {
    const { id } = e.currentTarget.dataset
    
    const tipDialog = this.selectComponent('#tip-dialog')
    tipDialog.show({
      content: '删除后，该剧情的所有对话将被清除，且不可撤回。',
      cancelText: '取消',
      confirmText: '删除',
      onCancel: () => {
        // 取消操作，对话框会自动关闭
      },
      onConfirm: () => {
        // 确认删除
        this.deletePlot(id)
      }
    })
  },
  
  /**
   * 执行删除操作
   */
  async deletePlot(id) {
    try {
      await deletePlot({ id })
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除成功',
      })
      // 重新加载故事列表
      if (this.data.groupInfo.id) {
        this.loadStoryList(this.data.groupInfo.id)
      }
      // 关闭滑动
      this.closeSwipeCell(id)
    } catch (error) {
      console.error('删除剧情失败:', error)
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.message || '删除失败，请重试',
      })
    }
  },
  
  /**
   * 关闭滑动单元格
   */
  closeSwipeCell(id) {
    const swipeCell = this.selectComponent(`#swipeCell-${id}`)
    if (swipeCell) {
      swipeCell.close()
    }
  },
  
  onShow() {
    if (this.data.groupInfo.id) {
      this.loadStoryList(this.data.groupInfo.id)
    }
  },

  /**
   * 创建新故事 - 弹出创建故事弹窗
   */
  onCreateStory() {
    const storyDialog = this.selectComponent('#story-dialog')
    if (!storyDialog) {
      wx.showToast({ title: '弹窗未就绪', icon: 'none' })
      return
    }
    storyDialog.show({
      onConfirm: (data) => {
        this.createStory(data)
      },
      roles: this.data.roles || []
    })
  },

  /**
   * 调用创建故事接口，成功后刷新故事列表
   */
  async createStory(data) {
    try {
      const res = await createStory({
        ...data,
        groupChatId: this.data.groupInfo.id
      })
      if (res && (res.code == 200 || res.code === undefined)) {
        wx.showToast({ title: '创建成功', icon: 'success' })
        // 刷新故事列表
        if (this.data.groupInfo.id) {
          this.loadStoryList(this.data.groupInfo.id)
        }
      } else {
        wx.showToast({
          title: (res && res.message) || '创建失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('创建故事失败:', error)
      wx.showToast({
        title: (error && error.message) || '创建失败，请重试',
        icon: 'none'
      })
    }
  }
})

