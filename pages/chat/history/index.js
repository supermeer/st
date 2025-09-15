// pages/chat/history/index.js
import Toast from 'tdesign-miniprogram/toast/index'
import { getCategoryList } from '../../../services/home/home'
import ChatService from '../../../services/ai/chat'

Page({
  data: {
    activeTab: '0', // 当前激活的标签页
    categoryList: [], // 分类列表
    chatList: [], // 聊天记录列表
    hasLoaded: false, // 是否已加载过数据

    loading: false, // 是否正在加载中
    tabLoading: false, // tab切换时的loading状态
    listIsEmpty: false, // 列表是否为空
    scrollTop: 0 // 滚动位置
  },

  onLoad: function (options) {
    this.getCategoryList()
  },

  getCategoryList() {
    getCategoryList().then((res) => {
      this.setData({
        categoryList: res || []
      })
      this.onTabsChange({
        detail: {
          value: this.data.categoryList[0].id
        }
      })
    })
  },

  // 标签页切换事件
  onTabsChange(e) {
    // 阻止事件冒泡，防止触发其他页面的onTabsChange
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    const activeTab = e.detail.value
    this.setData({
      activeTab,
      chatList: [],
      tabLoading: true // 开始tab切换loading
    })

    // 将scroll-view滚动到顶部
    this.scrollToTop()

    // 切换标签页后重新加载数据
    this.loadChatList()
  },

  // 将滚动区域滚动到顶部
  scrollToTop() {
    // 方法1: 通过设置随机scrollTop触发滚动
    this.setData({
      scrollTop: Math.random() * 10 // 设置一个随机值，强制触发滚动更新
    })

    // 方法2: 通过API控制滚动
    wx.createSelectorQuery()
      .select('#chatScrollView')
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

  // 加载聊天记录列表（一次性加载，无分页）
  loadChatList() {
    this.setData({
      loading: true
    })

    ChatService.getSessionList({
      menuId: this.data.activeTab
    })
      .then((res) => {
        const list = Array.isArray(res) ? res : []
        const newList = list.map((item) => {
          return {
            ...item,
            createTime: this.formatDate(new Date(item.createTime))
          }
        })
        this.setData({
          chatList: newList,
          hasLoaded: true,
          loading: false,
          tabLoading: false,
          listIsEmpty: list.length === 0
        })
      })
      .catch(() => {
        this.setData({
          loading: false,
          tabLoading: false,
          hasLoaded: true
        })
        Toast({
          context: this,
          selector: '#t-toast',
          message: '加载失败，请重试',
          icon: 'close-circle'
        })
      })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 点击聊天记录项
  onChatItemClick(e) {
    const id = e.currentTarget.dataset.id
    // 跳转到聊天详情页
    wx.navigateTo({
      url: `/pages/chat/session/index?sessionId=${id}`
    })
  }
})
