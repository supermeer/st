import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import {
  getMyAchievements,
  getStarShowcase
} from '../../services/usercenter/index'
import { getUserGroupChatList } from '../../services/group/index'

/**
 * 星耀集 / 创作者中心
 *
 * 入口：个人中心 - 星耀集入口
 *
 * 功能：
 *  1. 顶部展示当前用户头像和昵称（含徽章）
 *  2. 三栏统计卡：我的智能体 / 我的群聊 / 收益明细
 *  3. 我的收益：智能体收益、群聊收益、粉丝数
 *  4. 我的战绩：公开智能体数 + 已打败比例 + 智能体列表
 */

const MOCK_INCOME = {
  characterIncome: 456,
  groupIncome: 456,
  fanCount: 78
}

const MOCK_STATS = {
  roleCount: 15,
  groupCount: 8,
  todayIncome: 120
}

const MOCK_ROLE_ACHIEVEMENTS = [
  {
    id: 'r1',
    name: '时雾',
    backgroundImage: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/background/f5c5b5ede5454926a873ae6b05342a89.jpg',
    avatar: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/background/f5c5b5ede5454926a873ae6b05342a89.jpg',
    tags: ['曾上榜 2025年6月「人气道」榜单']
  },
  {
    id: 'r2',
    name: '星辰大海',
    backgroundImage: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/background/f5c5b5ede5454926a873ae6b05342a89.jpg',
    avatar: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/background/f5c5b5ede5454926a873ae6b05342a89.jpg',
    tags: ['曾上榜 2025年7月「灵感道」榜单']
  },
  {
    id: 'r3',
    name: '云端恋人',
    backgroundImage: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/background/f5c5b5ede5454926a873ae6b05342a89.jpg',
    avatar: 'https://character-static-1371529546.cos.ap-guangzhou.myqcloud.com/background/f5c5b5ede5454926a873ae6b05342a89.jpg',
    tags: []
  }
]

Page({
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    userInfo: {},
    userBadge: {
      icon: '⭐',
      text: '群聊内测官'
    },
    announcementText: '点击查看群聊内测官福利～',
    stats: {
      roleCount: 0,
      groupCount: 0,
      todayIncome: 0
    },
    income: {
      characterIncome: 0,
      groupIncome: 0,
      fanCount: 0
    },
    publicRoleCount: 0,
    beatPercent: 0,
    roleAchievements: [],
    // scroll-view 的动态高度：100vh - 自定义导航栏 - 固定头部 - 安全区
    scrollHeight: 600
  },

  onLoad(options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  onReady() {
    this.measureScrollHeight()
  },

  /**
   * 测量固定头部的高度，动态设置 scroll-view 高度
   * 避免硬编码导致不同机型出现空白或截断
   */
  measureScrollHeight() {
    const sysInfo = wx.getSystemInfoSync()
    const windowHeight = sysInfo.windowHeight || 667
    const navHeight = this.data.pageInfo.navHeight || 44
    const safeAreaBottom = this.data.pageInfo.safeAreaBottom || 0

    const query = wx.createSelectorQuery().in(this)
    query.select('#creator-header').boundingClientRect()
    query.exec((res) => {
      const headerHeight = res && res[0] ? res[0].height : 0
      const scrollHeight = Math.max(
        200,
        windowHeight - navHeight - headerHeight - safeAreaBottom
      )
      this.setData({ scrollHeight })
    })
  },

  onShow() {
    userStore.bind(this)
    this.loadAll()
  },

  /**
   * 加载所有数据
   */
  loadAll() {
    this.loadUserInfo()
    this.loadStarShowcase()
  },

  /**
   * 加载星耀展示
   */
  loadStarShowcase() {
    getStarShowcase({ userId: userStore.data.userInfo.id }).then((res) => {
      console.log(res)
    })
  },

  /**
   * 加载当前用户信息
   */
  loadUserInfo() {
    const userInfo = userStore.data.userInfo || {}
    this.setData({ userInfo })
  },

  /**
   * 公告行点击
   */
  onAnnouncementClick() {
    wx.showToast({
      title: '公告详情，敬请期待',
      icon: 'none'
    })
  },

  /**
   * 统计卡整体点击 - 跳转到对应列表
   */
  onStatCardClick(e) {
    const { type } = e.currentTarget.dataset || {}
    if (type === 'role') {
      wx.switchTab({
        url: '/pages/usercenter/index'
      })
    } else if (type === 'group') {
      wx.switchTab({
        url: '/pages/usercenter/index'
      })
    } else if (type === 'income') {
      wx.navigateTo({
        url: '/pages/points/detail/index'
      })
    }
  },

  /**
   * 创建智能体按钮
   */
  onCreateRoleClick() {
    wx.navigateTo({
      url: '/pages/role/add/index'
    })
  },

  /**
   * 创建群聊按钮
   */
  onCreateGroupClick() {
    wx.navigateTo({
      url: '/pages/group/add/index'
    })
  },

  /**
   * 查看收益明细
   */
  onViewIncomeClick() {
    wx.navigateTo({
      url: '/pages/points/detail/index'
    })
  },

  /**
   * 点击智能体战绩项
   */
  onAchievementClick(e) {
    const { item } = e.currentTarget.dataset || {}
    if (!item || !item.id) return

    getCurrentPlotByCharacterId(item.id)
      .then((res) => {
        wx.navigateTo({
          url: `/pages/chat/index?plotId=${res && res.plotId ? res.plotId : ''}&characterId=${item.id}`
        })
      })
      .catch(() => {
        wx.navigateTo({
          url: `/pages/chat/index?characterId=${item.id}`
        })
      })
  }
})