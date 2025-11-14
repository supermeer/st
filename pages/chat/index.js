import SystemInfo from '../../utils/system'

Page({
  data: {
    pageInfo: {},
    paddingBtm: 0,
    roleForm: {
      id: null,
      type: '',
      plotId: null
    },
    currentBg: ''
  },
  onLoad(e) {
    const { plotId, characterId } = e
    const pageInfo = SystemInfo.getPageInfo()
    this.setData({
      roleForm: {
        type: '',
        id: characterId || null,
        plotId: plotId || null
      },
      pageInfo: { ...pageInfo, ...this.data.pageInfo },
      paddingBtm: `${pageInfo.safeAreaBottom}px`
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
  setCurrentBg(e) {
    this.setData({
      currentBg: e
    })
  },
})