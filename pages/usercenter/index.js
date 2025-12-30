import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet';
import { getCharacterList, getCurrentPlotByCharacterId, deleteCharacter } from '../../services/role/index'
import { redeemInviteCode } from '../../services/usercenter/index'  
Page({
  data: {
    roleList: [],
    isDev: false,
    pageInfo: {},
    editingRole: null,
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
  onInviteCodeClick() {
    this.selectComponent('#inviteCodeDialog').show()
  },
  // 处理确认
  onInviteConfirm(e) {
    const { inviteCode } = e.detail
    // 调用接口验证邀请码...
    redeemInviteCode({
      invitationCode: inviteCode
    }).then(res => {
      console.log(res, 'res')
      userStore.refreshPointInfo()
      this.selectComponent('#inviteCodeDialog').hide()
      this.selectComponent('#rechargeResultDialog').show({
        points: 50,
        success: true
      })
    }).catch(err => {
      this.selectComponent('#inviteCodeDialog').setError(err.msg || err || '兑换失败，请稍后重试')
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
  },

  onLongPress(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      editingRole: id
    })
    ActionSheet.show({
      theme: ActionSheetTheme.List,
      selector: '#actionSheet',
      context: this,
      cancelText: '取消',
      items: ['编辑', '删除'],
    });
  },
  handleSelected(e) {
    const type = e.detail.selected
    if (type === '删除') {
      const deleteRequest = () => {
        deleteCharacter({
          id: this.data.editingRole
        }).then(res => {
          this.getCharacterList()
        })
      }
      const tipDialog = this.selectComponent('#tip-dialog')
      tipDialog.show({
        content: '删除后，您与该智能体的所有对话将被清除，且不可撤回。',
        cancelText: '取消',
        confirmText: '确认',
        onConfirm: () => {
          deleteRequest()
        }
      })

      return
    }

    if (type === '编辑') {
      
    }
  }
})
