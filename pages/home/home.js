import SystemInfo from '../../utils/system'
import { getHomePlotMessage } from '../../services/ai/chat'
import { getCharacterDetail } from '../../services/role/index'

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
    currentBg: null
  },
  onLoad(e) {
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
    if (!token) {
      this.setData({ isLogin: false })
      const authRef =
        this.selectComponent('auth') || this.selectComponent('#auth')
      authRef && authRef.login()
      return
    }
    this.setData({ isLogin: true })
    this.getHomePlotMessage()

    this.activeHandle()
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
        title: '喊上你的搭子',
        iconSrc: '/static/activity/active-rank.png',
        content: 'TA消费\n你躺赚积分'
      }
      dialog.show(options)
    }
  },
  onActivityConfirm() {
    const activeMark = wx.getStorageSync('activeMark')
    const richtextDialog = this.selectComponent('#richtextDialog')
    if (activeMark == 3) {
      richtextDialog.show({
        buttons: [
          { text: '添加客服', variant: 'outline', type: 'cs' },
          { text: '分享邀请码', type: 'share' }
        ]
      })
    }
    if (activeMark == 6) {
      richtextDialog.show({
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
  loginSuccess() {
    this.setData({ isLogin: true })
    this.getHomePlotMessage()
    if (this.data.inviteForm.isInvite) {
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
  setCurrentBg(e) {
    this.setData({
      currentBg: e
    })
  },
  async onShareAppMessage() {
    const { id } = this.data.roleForm || {}
    let path = `/pages/chat/index?characterId=${id}&isShare=${true}`
    if (this.data.isInvite) {
      path = `/pages/home/home?inviteCode=123&isInvite=${true}`
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
