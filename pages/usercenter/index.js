import userStore from '../../store/user'
import { getCharacterList, getCurrentPlotByCharacterId } from '../../services/role/index'
Page({
  data: {
    roleList: [],
    isDev: false
  },

  onLoad() {
    userStore.bind(this)
    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({
        isDev: true
      })
    }
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
