import SystemInfo from '../../../utils/system'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    roleInfo: {
      name: '沈川寒',
      gender: '♂',
      avatar: 'https://img.zcool.cn/community/01c8b25e8f8f8da801219c779e8c95.jpg@1280w_1l_2o_100sh.jpg',
      description: '工作于便利店的店员。在便利店工作的名叫山，工作精神饱满，穿着便利店工作服，元气十足。温柔的笑容能治愈每个人。只在晚班工作，所以很少见到白天的太阳。因为白天要睡觉，所以晚上工作。喜欢独处，喜欢独自一个人的时光。',
      greeting: '下午好，便利店，目光轻轻扫过顾客，【便利店后门的废弃室外沙发上】"啊化妆不来了，要坐会？"',
      memory: '记忆',
      story: '故事'
    },
    scrollTop: 0,
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    currentTab: '1',
    memoryValue: 23
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取传递的参数
    if (options.id) {
      this.loadRoleDetail(options.id)
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  /**
   * 加载角色详情
   */
  loadRoleDetail(id) {
    // TODO: 调用接口获取角色详情
    console.log('加载角色详情:', id)
  },
  onShow() {
  },
  onTabChange(event) {
    const tab = event.currentTarget.dataset.tab
    if (tab == 3) {
      wx.navigateTo({
        url: '/pages/role/story/index'
      })
      return
    }
    this.setData({ currentTab: tab })
  },
  memoryChange(e) {
    const value = e.detail.value
    this.setData({ 
      memoryValue: value,
      memoryLabel: value + '%'
    })
  }
})

