import SystemInfo from '../../../utils/system'
import { getChatStyleList } from '../../../services/role/index'

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
    console.log(event, '=====')
    const prevPage = getCurrentPages()[getCurrentPages().length - 2]
    prevPage.confirmUserSettings({
      userAddressedAs: userAddressedAs,
      identity: identity,
      personaGender: personaGender
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
        if (res.confirm) {
          wx.showToast({
            title: '已还原',
            icon: 'success'
          })
        }
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

