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
    roleInfo: {
      name: '沈川寒',
      avatar: 'https://img.zcool.cn/community/01c8b25e8f8f8da801219c779e8c95.jpg@1280w_1l_2o_100sh.jpg',
      description: '便利店的温柔店员'
    },
    storyList: [
      {
        id: 1,
        title: '相遇那天',
        description: '这是你们第一次相遇的故事，一个平凡却又特别的下午...',
        time: '2024-01-15'
      },
      {
        id: 2,
        title: '深夜的便利店',
        description: '夜深了，便利店里只有你们两个人，温暖的灯光照亮了这个寂静的夜晚...',
        time: '2024-01-20',
        active: true
      },
      {
        id: 3,
        title: '雨天的约定',
        description: '突如其来的大雨，让你们躲在了同一个屋檐下...',
        time: '2024-01-25'
      },
      {
        id: 4,
        title: '未知的冒险',
        description: '解锁条件：完成前面的故事章节',
        time: '2024-02-01'
      },
      {
        id: 5,
        title: '神秘的礼物',
        description: '解锁条件：达成特殊成就',
        time: '2024-02-10'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取传递的参数
    if (options.roleId) {
      this.loadStoryList(options.roleId)
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  /**
   * 加载故事列表
   */
  loadStoryList(roleId) {
    // TODO: 调用接口获取故事列表
    console.log('加载故事列表:', roleId)
  },

  /**
   * 点击故事项
   */
  onStoryTap(event) {
    const id = event.currentTarget.dataset.id
    const story = this.data.storyList.find(item => item.id === id)

    // TODO: 跳转到故事详情页
    console.log('查看故事:', id)
    wx.showToast({
      title: '故事详情页开发中',
      icon: 'none'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  }
})

