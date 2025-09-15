import {
  generateInvitationCode,
  getShareRecord
} from '../../services/usercenter/index'
import { getShareMenus } from '../../services/home/home'
import userStore from '../../store/user'

const INVITE_STATUS = {
  INVITE: 'invite',
  SUCCESS: 'success',
  SUPPORT: 'support',
  SUPPORT_SUCCESS: 'support_success',
  //   不需要邀请
  // DONTNEED_INVITE: 'dontneed_invite',
  INVITED: 'invited'
}

Page({
  data: {
    navConfig: {
      showBack: true,
      showLeftLogo: false
    },
    INVITE_STATUS,
    isLogin: false,
    inviteStatus: INVITE_STATUS.INVITE,
    inviteTitle: '邀好友，免费用',
    safeAreaTop: 0,
    isShare: true,
    invitationCode: '',
    safeAreaBottom: 0,
    barrageList: [],
    successList: [],
    tracks: [],
    entranceList: []
  },
  loginSuccess() {
    if (this.data.userInfo.phone) {
      // 已注册
      this.setData({
        inviteStatus: INVITE_STATUS.INVITED
      })
      // this.getRecord()
      this.getMenus()
    } else {
      // 未注册
      this.setData({
        inviteStatus: INVITE_STATUS.SUPPORT
      })
    }
    this.getInviteTitle()
  },
  bindPhoneSuccess() {
    this.setData({
      inviteStatus: INVITE_STATUS.SUPPORT_SUCCESS
    })
    this.getMenus()
    this.getInviteTitle()
    wx.showToast({
      title: '注册成功',
      icon: 'success'
    })
  },
  onReady: function () {},
  // 添加弹幕（防重叠核心）
  addBarrage(text) {
    if (!text || text.length === 0) {
      return
    }
    const containerWidth = 620 // 屏幕宽度(rpx)，可通过wx.getSystemInfo获取
    const textWidth = text.length * 20 + 48 // 估算宽度：字数*20 + 左右padding

    // 1. 选择可用轨道（找出右边界最小的轨道）
    let bestTrackIndex = -1
    let minRightEdge = Infinity
    this.data.tracks.forEach((track, index) => {
      if (track.rightEdge < minRightEdge) {
        minRightEdge = track.rightEdge
        bestTrackIndex = index
      }
    })

    // 2. 动态调整延迟避免重叠（关键！）
    const safeDelay =
      minRightEdge > 0
        ? Math.max(0, (minRightEdge / containerWidth) * 8) // 基于位置计算安全延迟
        : Math.random() * 3 // 初始随机延迟

    // 3. 更新轨道右边界
    this.data.tracks[bestTrackIndex].rightEdge = containerWidth + textWidth
    setTimeout(() => {
      this.data.tracks[bestTrackIndex].rightEdge = 0 // 动画结束后重置轨道
    }, 6000)

    // 4. 生成弹幕数据
    const newItem = {
      id: Date.now(),
      text,
      top: 15 + bestTrackIndex * 30, // 轨道位置：15%, 45%, 75%
      animation: `barrageMove 6s linear ${safeDelay}s infinite`
    }

    // 5. 更新渲染数据（最多保留15条）
    const newList = [...this.data.barrageList, newItem]
    if (newList.length > 15) newList.shift()
    this.setData({ barrageList: newList })
  },
  onShareAppMessage: async function () {
    const { invitationCode } = await generateInvitationCode()
    const currentPage = getCurrentPages()[getCurrentPages().length - 1]
    const path = currentPage.route
    return {
      title: '邀好友，免费用',
      path: `/${path}?invitationCode=${invitationCode}&isShare=true`
    }
  },
  onLoad: function (options) {
    userStore.bind(this)
    const windowInfo = wx.getWindowInfo()
    this.setData({
      safeAreaTop: windowInfo.safeArea.top,
      safeAreaBottom: windowInfo.safeArea.bottom,
      tracks: new Array(5).fill(0).map(() => ({ rightEdge: 0 }))
    })
    const { invitationCode, isShare } = options
    if (isShare) {
      this.setData({
        isShare: true,
        'navConfig.showBack': false,
        'navConfig.showLeftLogo': true,
        inviteStatus: INVITE_STATUS.SUPPORT,
        invitationCode
      })
      this.getInviteTitle()
      this.login()
    } else {
      this.getRecord()
    }
  },
  getRecord() {
    getShareRecord().then((res) => {
      let inviteStatus = INVITE_STATUS.INVITE
      let successList = []
      if (res && res.list && res.list.length > 0) {
        inviteStatus = INVITE_STATUS.SUCCESS
        successList = [...res.list]
      }
      this.setData({
        isShare: false,
        'navConfig.showBack': true,
        'navConfig.showLeftLogo': false,
        inviteStatus,
        successList
      })
      successList.forEach((item) => {
        this.addBarrage(item.nickname)
      })
      this.getInviteTitle()
    })
  },
  getMenus() {
    getShareMenus().then((res) => {
      this.setData({
        entranceList: res
      })
    })
  },
  onEntranceItemClick(e) {
    const { index } = e.currentTarget.dataset
    const item = this.data.entranceList[index]
    if (item.code === 'XiaoHongShu') {
      wx.navigateTo({
        url: `/pages/contentadd/blog/index?id=${item.id}&title=${item.name}`
      })
    } else {
      wx.navigateTo({
        url: `/pages/contentadd/index?id=${item.id}&code=${item.code}&title=${item.name}`
      })
    }
  },
  getInviteTitle() {
    let title = ''
    switch (this.data.inviteStatus) {
      case INVITE_STATUS.INVITE:
        title = '邀好友，免费用'
        break
      case INVITE_STATUS.SUPPORT:
        title = '邀好友，免费用'
        break
      case INVITE_STATUS.SUPPORT_SUCCESS:
        title = '注册成功！'
        break
      case INVITE_STATUS.SUCCESS:
        title = '邀请成功！'
        break
      case INVITE_STATUS.INVITED:
        title = '您已注册，不满足条件'
        break
    }
    this.setData({
      inviteTitle: title
    })
  },
  onInviteRecordClick() {
    wx.navigateTo({
      url: '/pages/share/record/index'
    })
  },
  onBottomButtonClick() {
    if (
      this.data.inviteStatus === INVITE_STATUS.INVITE ||
      this.data.inviteStatus === INVITE_STATUS.SUCCESS ||
      this.data.inviteStatus === INVITE_STATUS.INVITED
    ) {
    } else if (this.data.inviteStatus === INVITE_STATUS.SUPPORT) {
      const authRef = this.selectComponent('#shareAuth')
      authRef && authRef.showPhoneLogin()
    } else if (this.data.inviteStatus === INVITE_STATUS.SUPPORT_SUCCESS) {
      // 返回主页
      wx.switchTab({
        url: '/pages/home/home'
      })
    }
  },
  login() {
    const authRef = this.selectComponent('#shareAuth')
    authRef && authRef.login()
  },
  getPhoneNumber(e) {
    const authRef =
      this.selectComponent('shareAuth') || this.selectComponent('#shareAuth')
    authRef &&
      authRef.onGetPhoneNumber({
        ...e,
        invitationCode: this.data.invitationCode
      })
  }
})
