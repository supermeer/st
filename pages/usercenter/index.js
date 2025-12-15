import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import { getCharacterList, getCurrentPlotByCharacterId } from '../../services/role/index'
Page({
  data: {
    roleList: [],
    isDev: false,
    pageInfo: {},
    contentHeight: '100vh'
  },

  onLoad() {
    userStore.bind(this)
    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({
        isDev: true
      })
    }
    this.setData({
      pageInfo: { ...SystemInfo.getPageInfo(), ...this.data.pageInfo }
    })
    this.setData({
      contentHeight: `calc(100vh - ${this.data.pageInfo.safeAreaBottom || 0}px - ${this.data.pageInfo.tabbarHeight || 100}rpx - ${this.data.pageInfo.navHeight}px)`
    })
  },

  onShow() {
    this.getTabBar().init()
    userStore.refreshVipInfo()
    userStore.refreshPointInfo()
    this.getCharacterList()
  },
  getCharacterList() {
    getCharacterList(
      {
        ifSystem: false,
        size: 10000,
        current: 1
      }
    ).then(res => {
      this.setData({
        'roleList': [...res.records]
      })
    })
  },

  // 点击角色卡片
  async onRoleClick(e) {
    const id = e.currentTarget.dataset.id
    const res = await getCurrentPlotByCharacterId(id)
    wx.navigateTo({
      url: `/pages/chat/index?plotId=${ res && res.plotId ? res.plotId : ''}&characterId=${id}`
    })
  },
  onUserInfoClick() {
    wx.navigateTo({
      url: '/pages/common/aboutus/index'
    })
  },
  onVipRenewClick() {
    if (this.data.isDev) return
    wx.navigateTo({
      url: '/pages/vip/packages/index'
    })
  },

  onScoreClick() {
    if (this.data.isDev) return
    wx.navigateTo({
      url: '/pages/points/index'
    })
  },

  // 积分充值按钮
  onPointsRechargeClick() {
    const dialog = this.selectComponent('#pointsRechargeDialog')
    if (dialog) {
      dialog.show()
    }
  }
})
