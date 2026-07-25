import SystemInfo from '../../../utils/system'
import { getGroupDetail } from '../../../services/group/index'
Page({
  data: {
    pageInfo: {},
    paddingBtm: 0,
    groupInfo: {},
    currentBg: '',
    showBG: true
  },
  onLoad(e) {
    const ev = wx.getStorageSync('aE')
    if (ev == '0') {
      this.setData({ showBG: false })
    }
    const { groupId, name } = e
    const pageInfo = SystemInfo.getPageInfo()
    this.setData({
      groupInfo: {
        id: groupId,
        name: name || '群聊',
        roles: []
      },
      pageInfo: { ...pageInfo, ...this.data.pageInfo },
      paddingBtm: `${pageInfo.safeAreaBottom}px`
    })
    this.fetchGroupDetail(groupId)
  },
  fetchGroupDetail(id) {
    if (!id) return
    getGroupDetail(id)
      .then((res) => {
        const data = res || {}
        const rawMembers = data.roles || data.members || data.characterList || []
        const roles = rawMembers.map((m) => ({
          id: m.id,
          name: m.name || m.roleName || '',
          avatarUrl: m.avatarUrl || m.portrait || ''
        }))
        this.setData({
          groupInfo: {
            ...this.data.groupInfo,
            ...data,
            id,
            name: data.name || data.groupName || this.data.groupInfo.name,
            roles
          }
        })
      })
      .catch(() => {
        // 接口未就绪时不阻断页面渲染
      })
  },
  onCurrentBgChange(e) {
    this.setData({ currentBg: e.detail.bg || '' })
  },
  async onShareAppMessage() {
    const { id, name } = this.data.groupInfo || {}
    return {
      title: name || '星语酒馆',
      path: `/pages/group/chat/index?groupId=${id}`,
      imageUrl: '/images/global-share.jpg'
    }
  }
})