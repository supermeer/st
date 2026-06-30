import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import { getHomePlotMessage } from '../../services/ai/chat'
import { getCharacterDetail, shareCharacter } from '../../services/role/index'
import { redeemInviteCode, getActivity, getMinorReminderConfig, confirmAdultIdentity } from '../../services/usercenter/index'

Page({
  data: {
    isLogin: false,
    pageInfo: {},
    paddingBtm: 0,
    roleForm: {
      id: null,
      type: '',
      plotId: null
    },
    isInvite: false,
    inviteForm: {
      isInvite: false,
      inviteCode: null
    },
    currentBg: null,
    showBG: true
  },
  onLoad(e) {
    this.testMinorDialog()
    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({
        showBG: false
      })
    }
    const { isInvite, inviteCode } = e
    this.setData({
      inviteForm: {
        isInvite,
        inviteCode
      }
    })
    const getPageInfo = () => {
      this.setData({
        pageInfo: { ...SystemInfo.getPageInfo(), ...this.data.pageInfo }
      })
      // calc({{pageInfo.safeAreaBottom}}px + {{pageInfo.tabbarHeight}}rpx);
      this.setData({
        paddingBtm: `calc(${this.data.pageInfo.safeAreaBottom || 0}px + ${this.data.pageInfo.tabbarHeight || 100}rpx)`
      })
    }
    getPageInfo()
    if (!this.data.pageInfo.safeAreaBottom) {
      setTimeout(() => {
        getPageInfo()
      }, 300)
    }
    this.activeHandle()
  },
  onShow() {
    this.getTabBar().init()
    this.getTabBar().setInterceptor(() => {
      if (!this.data.isLogin) {
        this.goLogin()
        return false
      }
      return true
    })
    const token = wx.getStorageSync('token')
    if (!token || !userStore.data.userInfo.uid) {
      this.setData({ isLogin: false })
      const authRef =
        this.selectComponent('auth') || this.selectComponent('#auth')
      authRef && authRef.login()
      return
    }
    this.redeemInviteCodeFun()
    this.setData({ isLogin: true })
    this.getHomePlotMessage()
  },
  activeHandle() {
    let activeMark = wx.getStorageSync('activeMark')
    const dialog = this.selectComponent('#activityDialog')
    if (!dialog) return
    let options = {}
    if (activeMark == 3) {
      options = {
        title: '创作者激励',
        iconSrc: '/static/activity/active-score.png',
        content: '智能体人气越高\n奖励越香'
      }
      dialog.show(options)
    } else if (activeMark == 6) {
      options = {
        isShare: true,
        title: '喊上你的搭子',
        iconSrc: '/static/activity/active-rank.png',
        content: 'TA消费\n你躺赚积分'
      }
      dialog.show(options)
    }
  },
  async onActivityConfirm() {
    const activeMark = wx.getStorageSync('activeMark')
    const richtextDialog = this.selectComponent('#richtextDialog')
    if (activeMark == 6) {
      const richtext = await getActivity({activityType: 1})
      richtextDialog.show({
        isShare: true,
        contentNodes: richtext.content || '',
        buttons: [
          { text: '添加客服', variant: 'outline', type: 'cs' },
          { text: '去分享', type: 'share' }
        ]
      })
    }
    if (activeMark == 3) {
      const richtext = await getActivity({activityType: 2})
      richtextDialog.show({
        contentNodes: richtext.content || '',
        buttons: [
          { text: '添加客服', variant: 'outline', type: 'cs' },
          { text: '去发布', type: 'publish' }
        ]
      })
    }
  },
  richtextAction({ detail }) {
    const { type } = detail
    if (type === 'cs') {
      const app = getApp()
      wx.openCustomerServiceChat({
        extInfo: { url: app.globalData.wxCustomerService.url },
        corpId: app.globalData.wxCustomerService.corpId,
        success(res) {}
      })
    }
    if (type === 'share') {
      this.setData({
        isInvite: true
      })
    }
    if (type === 'publish') {
      wx.switchTab({
        url: '/pages/usercenter/index'
      })
    }
  },
  getHomePlotMessage() {
    getHomePlotMessage().then((res) => {
      if (res.plotId && this.data.roleForm.plotId === res.plotId) {
        return
      }
      this.setData({
        roleForm: {
          type: res.type,
          id: res.characterId || null,
          plotId: res.plotId || null
        }
      })
    })
  },
  // 显式点击登录按钮
  goLogin() {
    const authRef =
      this.selectComponent('auth') || this.selectComponent('#auth')
    authRef && authRef.login()
  },
  async loginSuccess() {
    this.setData({ isLogin: true })
    this.getHomePlotMessage()
    this.redeemInviteCodeFun()
    // 检查未成年人提醒弹窗
    this.checkMinorReminder()
  },
  // 检查未成年人提醒弹窗
  async checkMinorReminder() {
    // 如果已经确认过，直接返回
    if (wx.getStorageSync('minorConfirmed')) {
      return
    }
    try {
      const res = await getMinorReminderConfig()
      if (res && res.showMinorReminder) {
        // 显示未成年人提醒弹窗
        const dialog = this.selectComponent('#minorTipDialog')
        if (dialog) {
          dialog.show({
            onConfirm: async () => {
              // 确认后同步到后端
              await this.syncMinorConfirm()
            },
            onCancel: () => {
              // 取消后的处理
              console.log('用户取消未成年人确认')
            }
          })
        }
      }
    } catch (err) {
      console.error('获取未成年人提醒配置失败', err)
    }
  },
  testMinorDialog() {
    const dialog = this.selectComponent('#minorTipDialog')
    if (dialog) {
      dialog.show({
        onConfirm: async () => {
          await this.syncMinorConfirm()
        },
      })
      onCancel: () => {
        console.log('用户取消未成年人确认')
      }
    }
  },
  // 同步未成年人确认到后端
  async syncMinorConfirm() {
    try {
      await confirmAdultIdentity({
        confirmed: true,
        confirmTime: Date.now()
      })
      wx.setStorageSync('minorConfirmed', true)
    } catch (err) {
      console.error('同步未成年人确认失败', err)
    }
  },
  async redeemInviteCodeFun() {
    if (this.data.inviteForm.isInvite) {
      // await redeemInviteCode({
      //   invitationCode: this.data.inviteForm.inviteCode
      // })
      // this.setData({
      //   inviteForm: {
      //     isInvite: false,
      //     inviteCode: null
      //   }
      // })
      wx.setStorageSync('friend_inviteCode', this.data.inviteForm.inviteCode)
      wx.switchTab({
        url: '/pages/usercenter/index',
      })
      this.setData({
        inviteForm: {
          isInvite: false,
          inviteCode: null
        }
      })

    }
  },
  hideTabbar() {
    this.setData({
      paddingBtm: 0
    })
    this.getTabBar().hide()
  },
  showTabbar() {
    this.setData({
      paddingBtm: `calc(${this.data.pageInfo.safeAreaBottom || 0}px + ${this.data.pageInfo.tabbarHeight || 100}rpx)`
    })
    this.getTabBar().show()
  },
  changePlot(event) {
    const { plotId, type, characterId } = event
    this.setData({
      roleForm: {
        ...this.data.roleForm,
        plotId: plotId,
        type: type,
        id: characterId
      }
    })
  },
  onCurrentBgChange(e) {
    this.setCurrentBg(e.detail.bg)
  },
  setCurrentBg(e) {
    this.setData({
      currentBg: e
    })
  },
  async onShareAppMessage() {
    const { id } = this.data.roleForm || {}
    shareCharacter({characterId: id})
    let path = `/pages/chat/index?characterId=${id}&isShare=${true}`
    if (this.data.isInvite) {
      const code = await getApp().getInviteCode()
      path = `/pages/home/home?inviteCode=${code}&isInvite=${true}`
      console.log(path)
    } else {
      const characterDetail = await getCharacterDetail(id)
      if (characterDetail.isSystem != 1) {
        path = '/pages/home/home'
      }
    }
    return {
      title: '星语酒馆',
      path,
      imageUrl: '/images/global-share.jpg'
    }
  }
})
