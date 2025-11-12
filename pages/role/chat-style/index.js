import SystemInfo from '../../../utils/system'
import { getChatStyleList, restorePlotChatStyle } from '../../../services/role/index'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    plotId: null,
    scrollTop: 0,
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    // 当前选中的tab: 0-模版, 1-我创建的
    activeTab: 0,
    // 模版列表
    templateList: [],
    // 我创建的列表
    myStyleList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      plotId: options.plotId,
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  /**
   * 切换tab
   */
  onTabChange(event) {
    const index = event.currentTarget.dataset.index
    this.setData({
      activeTab: index
    })
    this.getStyleList()
  },

  /**
   * 导入风格
   */
  onImportStyle(event) {
    const { id } = event.currentTarget.dataset
    const list = this.data.activeTab === 0 ? this.data.templateList : this.data.myStyleList
    const styleInfo = list.find(item => item.id === id)
    const prevPage = getCurrentPages()[getCurrentPages().length - 2]
    prevPage.confirmChatStyle({
      ...styleInfo
    })
    wx.navigateBack()
  },

  /**
   * 还原设置
   */ 
  onResetSettings() {
    wx.showModal({
      title: '提示',
      content: '确定要还原设置吗？',
      success: (res) => {
        restorePlotChatStyle({
          plotId: this.data.plotId
        }).then(res => {
          wx.showToast({
            title: '已还原',
            icon: 'success'
          })
        })
      }
    })
  },

  /**
   * 创建对话模板
   */
  onCreateTemplate() {
    console.log('创建对话模板')
    wx.navigateTo({
      url: '/pages/role/chat-style/add/index'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getStyleList()
  },
  getStyleList() {
    getChatStyleList({
      ifSystem: this.data.activeTab === 0
    }).then(res => {
      const key = this.data.activeTab === 0 ? 'templateList' : 'myStyleList'
      this.setData({
        [key]: [...res]
      })
    })
  }
})

