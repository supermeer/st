import SystemInfo from '../../utils/system'
import {
  getCurrentPlotByCharacterId,
  getCharacterDetail
} from '../../services/role/index'
Page({
  data: {
    pageInfo: {},
    paddingBtm: 0,
    roleForm: {
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
    const { plotId, characterId, isShare, id } = e
    const pageInfo = SystemInfo.getPageInfo()
    if (!isShare) {
      this.setData({
        roleForm: {
          type: '',
          id: characterId || null,
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
          id: characterId || null,
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
    this.getCurrentPlotByCharacterId(this.data.shareForm.id)
  },
  getCurrentPlotByCharacterId(id) {
    getCurrentPlotByCharacterId(id).then((res) => {
      this.setData({
        roleForm: {
          ...this.data.roleForm,
          ...this.data.shareForm,
          plotId: res && res.plotId ? res.plotId : null
        }
      })
    })
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
    let path = `/pages/chat/index?characterId=${id}&isShare=${true}`
    const characterDetail = await getCharacterDetail(id)
    if (characterDetail.isSystem != 1) {
      path = '/pages/home/home'
    }
    return {
      title: '星语酒馆',
      path,
      imageUrl: '/images/global-share.jpg'
    }
  }
})
