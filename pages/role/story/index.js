import SystemInfo from '../../../utils/system'
import { getPlotListByCharacterId, getCharacterDetail } from '../../../services/role/index'
import { deletePlot, setCurrentPlot } from '../../../services/ai/chat'
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
    roleInfo: {
      id: null,
      name: '',
      avatar: '',
      description: ''
    },
    plotList: [],
    currentPlotId: null,
    currentBg: '',
    showBG: true
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
    if (options.roleId) {
      this.setData({
        roleInfo: {
          ...this.data.roleInfo,
          id: options.roleId
        }
      })
      this.loadPlotList(options.roleId)
      this.loadCharacterInfo(options.roleId)
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  loadCharacterInfo(roleId) {
    getCharacterDetail(roleId).then(res => {
      let currentBg = res.backgroundImage
      if (res.currentPlotId) {
        currentBg = res.plotDetailVO.backgroundImage
      }
      this.setData({
        roleInfo: { ...this.data.roleInfo, ...res },
        currentPlotId: res.currentPlotId || null,
        currentBg: currentBg || ''
      })
    })
  },
  /**
   * 加载剧情列表
   */
  loadPlotList(roleId) {
    getPlotListByCharacterId(roleId).then(res => {
      this.setData({
        plotList: [...res.list || []].map(item => ({
          ...item,
          time: this.formatTime(item.updateTime)
        })),
        currentPlotId: res.currentPlotId || null
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
  async onPlotTap(event) {
    const id = event.currentTarget.dataset.id
    const plot = this.data.plotList.find(item => item.id === id)
    if (plot.ifCurrent) {
      return
    }
    try {
      await setCurrentPlot({ plotId: id, characterId: this.data.roleInfo.id })
      Toast({
        context: this,
        selector: '#t-toast',
        message: '剧情切换成功',
      })
      wx.navigateTo({
        url: `/pages/chat/index?plotId=${id}&characterId=${this.data.roleInfo.id}`
      })
    } catch (error) {
      console.error('设置当前剧情失败:', error)
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.message || '设置当前剧情失败，请重试',
      })
    }
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
      // 重新加载剧情列表
      if (this.data.roleInfo.id) {
        this.loadPlotList(this.data.roleInfo.id)
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
    if (this.data.roleInfo.id) {
      this.loadPlotList(this.data.roleInfo.id)
    }
  }
})

