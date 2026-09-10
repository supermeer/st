import SystemInfo from '../../../utils/system'
import {
  getGroupDetail,
  getCurrentPlotByGroupChatId
} from '../../../services/group/index'
import {
  createPlot
} from '../../../services/ai/chat'
Page({
  data: {
    pageInfo: {},
    paddingBtm: 0,
    groupForm: {
      id: null,
      type: '',
      plotId: null
    },
    shareForm: {
      id: null,
      type: '',
      plotId: null,
      isShare: false
    },
    currentBg: '',
    showBG: true
  },
  onLoad(e) {
    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({
        showBG: false
      })
    }
    const { groupId, plotId, isShare, id } = e
    const pageInfo = SystemInfo.getPageInfo()
    if (!isShare) {
      this.setData({
        groupForm: {
          type: '',
          id: groupId || null,
          plotId: plotId || null
        },
        'shareForm.isShare': isShare,
        pageInfo: { ...pageInfo, ...this.data.pageInfo },
        paddingBtm: `${pageInfo.safeAreaBottom}px`
      })
    } else {
      this.setData({
        shareForm: {
          type: '',
          id: groupId || null,
          plotId: plotId || null,
          isShare: true
        },
        pageInfo: { ...pageInfo, ...this.data.pageInfo },
        paddingBtm: `${pageInfo.safeAreaBottom}px`
      })
      const authRef =
        this.selectComponent('auth') || this.selectComponent('#auth')
      authRef && authRef.login()
    }
  },
  loginSuccess() {
    this.getCurrentPlotByGroupChatId(this.data.shareForm.id)
  },
  async getCurrentPlotByGroupChatId(id) {
    if (!id) return
    const res = getCurrentPlotByGroupChatId(id)
    let plotId = res && res.plotId ? res.plotId : ''
    if (!plotId) {
      plotId = await createPlot({
        groupChatId: id
      })
    }
    this.setData({
      groupForm: {
        ...this.data.groupForm,
        ...this.data.shareForm,
        plotId: plotId
      }
    })
    // 拉一次群聊基础信息，渲染群成员
    this.fetchGroupDetail(id)
  },
  fetchGroupDetail(id) {
    if (!id) return
    getGroupDetail(id)
      .then((res) => {
        const data = res || {}
        const rawMembers = Array.isArray(data.characterIds) ? data.characterIds : []
        const rawAvatars = Array.isArray(data.avatarUrls) ? data.avatarUrls : []
        const rawNames = Array.isArray(data.characterNames) ? data.characterNames : []
        console.log('[groupDetail]', {
          characterIds: rawMembers,
          avatarUrls: rawAvatars,
          characterNames: rawNames
        })
        const roles = rawMembers.map((cid, index) => ({
          id: cid,
          name: rawNames[index] || data.name || `角色${index + 1}`,
          avatarUrl: rawAvatars[index] || ''
        }))
        this.setData({
          groupForm: {
            ...this.data.groupForm,
            ...data,
            roles
          }
        })
      })
      .catch((err) => {
        console.error('[fetchGroupDetail] failed:', err)
      })
  },
  changePlot(event) {
    const { plotId, type, groupId } = event
    this.setData({
      groupForm: {
        ...this.data.groupForm,
        plotId: plotId,
        type: type,
        id: groupId
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
    const { id, plotId } = this.data.groupForm || {}
    const path = `/pages/group/chat/index?groupId=${id}${plotId ? `&plotId=${plotId}` : ''}`
    return {
      title: '星语酒馆',
      path,
      imageUrl: '/images/global-share.jpg'
    }
  }
})