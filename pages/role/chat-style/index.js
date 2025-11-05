import SystemInfo from '../../../utils/system'

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
    templateList: [
      {
        id: 1,
        name: '风格名称',
        dialogCount: 12
      },
      {
        id: 2,
        name: '风格名称',
        dialogCount: 12
      },
      {
        id: 3,
        name: '风格名称',
        dialogCount: 12
      },
      {
        id: 4,
        name: '风格名称',
        dialogCount: 12
      },
      {
        id: 5,
        name: '风格名称',
        dialogCount: 12
      },
      {
        id: 6,
        name: '风格名称',
        dialogCount: 12
      },
      {
        id: 7,
        name: '风格名称',
        dialogCount: 12
      },
      {
        id: 8,
        name: '风格名称',
        dialogCount: 12
      },
      {
        id: 9,
        name: '风格名称',
        dialogCount: 12
      },
      {
        id: 10,
        name: '风格名称',
        dialogCount: 12
      }
    ],
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
  },

  /**
   * 导入风格
   */
  onImportStyle(event) {
    const id = event.currentTarget.dataset.id
    console.log('导入风格:', id)
    wx.showToast({
      title: '导入成功',
      icon: 'success'
    })
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

  }
})

