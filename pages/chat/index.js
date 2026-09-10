import SystemInfo from '../../utils/system'
import {
  getCurrentPlotByCharacterId,
  getCharacterDetail,
  shareCharacter,
  enterFromDiscover
} from '../../services/role/index'
import {
  createPlot
} from '../../services/ai/chat'
import { getCurrentPlotByGroupChatId, getGroupDetail } from '../../services/group/index'
Page({
  data: {
    pageInfo: {},
    paddingBtm: 0,
    plotInfo: {
      id: null,
      type: '',
      isGroupChat: false
    },
    roleForm: {
      id: null,
      type: ''
    },
    groupForm: {
      id: null,
      type: ''
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
    const { plotId, characterId, isShare, id, isDiscover = false, groupId } = e
    this.setData({
      plotInfo: {
        ...this.data.plotInfo,
        isGroupChat: !!groupId,
        id: plotId || null
      }
    })
    const pageInfo = SystemInfo.getPageInfo()
    isDiscover && enterFromDiscover({id: characterId, characterId})
    if (!isShare) {
      this.setData({
        roleForm: {
          type: '',
          id: characterId || null
        },
        groupForm: {
          id: groupId || null,
          type: 'group'
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
    if (this.data.plotInfo.isGroupChat) {
      this.getCurrentPlotByGroupId(this.data.groupForm.id)
    } else {
      this.getCurrentPlotByCharacterId(this.data.shareForm.id)
    }
  },
  async getCurrentPlotByGroupId(id) {
    const res = getCurrentPlotByGroupChatId(id)
    let plotId = res && res.plotId ? res.plotId : ''
    if (!plotId) {
      plotId = await createPlot({
        groupChatId: id
      })
    }
    this.setData({
      plotInfo: {
        ...this.data.plotInfo,
        id: plotId
      }
    })
  },
  getCurrentPlotByCharacterId(id) {
    getCurrentPlotByCharacterId(id).then((res) => {
      this.setData({
        plotInfo: {
          ...this.data.plotInfo,
          id: res && res.plotId ? res.plotId : null
        },
        roleForm: {
          ...this.data.roleForm,
          ...this.data.shareForm
        }
      })
    })
  },
  changePlot(event) {
    const { plotId, type, characterId } = event
    this.setData({
      plotInfo: {
        ...this.data.plotInfo,
        id: plotId || null
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
    const groupId = this.data.groupForm.id || ''
    shareCharacter({characterId: id})
    let path = `/pages/chat/index?characterId=${id || ''}&groupId=${groupId || ''}&isShare=${true}`
    let isSystem = false;
    if (id) {
      const characterDetail = await getCharacterDetail(id)
      isSystem = characterDetail.isSystem == 1
    } else {
      const groupInfo = await getGroupDetail(groupId)
      isSystem = groupInfo.isSystem == 1
    }
    if (!isSystem) {
      path = '/pages/home/home'
    }
    return {
      title: '星语酒馆',
      path,
      imageUrl: '/images/global-share.jpg'
    }
  }
})
