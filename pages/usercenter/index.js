import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet'
import {
  getCharacterList,
  getCurrentPlotByCharacterId,
  deleteCharacter,
  applyCharacterPublished,
  unpublishChar
} from '../../services/role/index'
import {
  redeemInviteCode,
  getActivity
} from '../../services/usercenter/index'
import Dialog from 'tdesign-miniprogram/dialog';

function isPrivateRoleByPublishStatus(role) {
  const ps = role?.publishStatus
  return ps === 0 || ps === '0' || !ps
}

function getRoleStatusBadge(role) {
  const raw =
    role?.publishStatus

  const value = raw === undefined || raw === null ? '' : String(raw)

  const statusMap = {
    0: { text: '', className: '' },
    1: { text: '审核中', className: 'status-pending' },
    2: { text: '', className: '' },
    3: { text: '已驳回', className: 'status-rejected' },
    4: { text: '已下架', className: 'status-offline' },
    pending: { text: '审核中', className: 'status-pending' },
    passed: { text: '', className: 'status-approved' },
    reject: { text: '已驳回', className: 'status-rejected' },
    offline: { text: '已下架', className: 'status-offline' }
  }

  if (value && statusMap[value]) return statusMap[value]
  if (value && statusMap[value.toLowerCase?.()])
    return statusMap[value.toLowerCase()]

  if (role?.auditStatusText)
    return { text: String(role.auditStatusText), className: 'status-pending' }
  if (role?.statusText)
    return { text: String(role.statusText), className: 'status-pending' }

  return { text: '', className: '' }
}

Page({
  data: {
    roleList: [],
    privateRoleList: [],
    publicRoleList: [],
    isDev: false,
    pageInfo: {},
    editingRole: null,
    editingRoleInfo: null,
    roleTypeList: [
      {
        name: '私密',
        value: '1',
        count: 0
      },
      {
        name: '公开',
        value: '2',
        count: 0
      }
    ],
    activeRoleType: '1',
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

  onShow(e) {
    const inviteCode = wx.getStorageSync('friend_inviteCode')
    if (inviteCode && inviteCode.length > 0) {
      this.selectComponent('#inviteCodeDialog').show({
        code: inviteCode
      })
      wx.removeStorageSync('friend_inviteCode')
    }
    this.getTabBar().init()
    userStore.refreshVipInfo()
    userStore.refreshPointInfo()
    this.getCharacterList()
  },

  syncRoleListByPublishStatus(allRoleList) {
    const privateRoleList = (allRoleList || []).filter(
      (item) => item && isPrivateRoleByPublishStatus(item)
    )
    const publicRoleList = (allRoleList || []).filter(
      (item) => !item || !isPrivateRoleByPublishStatus(item)
    )

    const roleTypeList = (this.data.roleTypeList || []).map((t) => {
      if (t.value === '1') return { ...t, count: privateRoleList.length }
      if (t.value === '2') return { ...t, count: publicRoleList.length }
      return t
    })

    const roleList = this.data.activeRoleType === '1' ? privateRoleList : publicRoleList

    this.setData({
      privateRoleList,
      publicRoleList,
      roleTypeList,
      roleList
    })
  },

  getCharacterList() {
    getCharacterList({
      ifSystem: false,
      size: 10000,
      current: 1
    }).then((res) => {
      const allRoleList = (res?.records || []).map((role) => {
        return {
          ...role,
          _statusBadge: getRoleStatusBadge(role)
        }
      })

      this.syncRoleListByPublishStatus(allRoleList)
    })
  },

  // 点击角色卡片
  async onRoleClick(e) {
    const id = e.currentTarget.dataset.id
    const res = await getCurrentPlotByCharacterId(id)
    wx.navigateTo({
      url: `/pages/chat/index?plotId=${res && res.plotId ? res.plotId : ''}&characterId=${id}`
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
    })
      .then((res) => {
        console.log(res, 'res')
        userStore.refreshPointInfo()
        this.selectComponent('#inviteCodeDialog').hide()
        this.selectComponent('#rechargeResultDialog').show({
          points: 50,
          success: true
        })
      })
      .catch((err) => {
        this.selectComponent('#inviteCodeDialog').setError(
          err.msg || err || '兑换失败，请稍后重试'
        )
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

  onRoleTypeChange(e) {
    const value = e.currentTarget.dataset.value
    if (value === this.data.activeRoleType) return

    const roleList = value === '1'
      ? (this.data.privateRoleList || [])
      : (this.data.publicRoleList || [])

    this.setData({
      activeRoleType: value,
      roleList
    })
  },

  async onActivityClick() {
    const richtext = await getActivity({activityType: 2})
    console.log(richtext.content)
    const richtextDialog = this.selectComponent('#richtextDialog')
    richtextDialog.show({
      contentNodes: richtext.content || '',
      buttons: [
        { text: '添加客服', variant: 'outline', type: 'cs' },
        { text: '去创建', type: 'create' }
      ]
    })
  },

  async onInviteClick() {
    const richtext = await getActivity({activityType: 1})
    const richtextDialog = this.selectComponent('#richtextDialog')
    richtextDialog.show({
      isShare: true,
      contentNodes: richtext.content || '',
      buttons: [
        { text: '添加客服', variant: 'outline', type: 'cs' },
        { text: '去分享', type: 'share' }
      ]
    })
  },

  async richtextAction({ detail }) {
    const { type } = detail
    if (type === 'cs') {
      const app = getApp()
      wx.openCustomerServiceChat({
        extInfo: { url: app.globalData.wxCustomerService.url },
        corpId: app.globalData.wxCustomerService.corpId,
        success(res) {}
      })
    }
    if (type === 'create') {
      wx.navigateTo({
        url: '/pages/role/add/index'
      })
    }
  },

  createRole() {
    wx.navigateTo({
      url: '/pages/role/add/index'
    })
  },

  onLongPress(e) {
    const id = e.currentTarget.dataset.id
    const info = this.data.roleList.find((item) => item.id == id)

    let publishStatus = info.publishStatus

    this.setData({
      editingRole: id,
      editingRoleInfo: info || {}
    })
    let items = []
    if (publishStatus == 0 || !publishStatus) {
      items = [
        ...items,
        '编辑',
        '发布智能体',
        '删除'
      ]
    }
    if (publishStatus == 1) {
      wx.showToast({
        title: '智能体正在审核中，无法进行操作',
        icon: 'none',
        duration: 2500
      })
      return
    }
    if (publishStatus == 2) {
      items.push('下架智能体')
    }
    if (publishStatus == 3) {
      items = [
        ...items,
        '编辑',
        '发布智能体',
        '删除'
      ]
    }
    if (publishStatus == 4) {
      items = [
        ...items,
        '发布智能体'
      ]
    }
    ActionSheet.show({
      theme: ActionSheetTheme.List,
      selector: '#actionSheet',
      context: this,
      cancelText: '取消',
      items
    })
  },
  handleSelected(e) {
    const type = e.detail.selected
    if (type === '删除') {
      const deleteRequest = () => {
        deleteCharacter({
          id: this.data.editingRole
        }).then((res) => {
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
      wx.navigateTo({
        url: `/pages/role/add/index?id=${this.data.editingRole}&publishStatus=${this.data.editingRoleInfo.publishStatus}`
      })
      return
    }

    if (type === '发布智能体') {
      if (!this.data.editingRoleInfo.backgroundImage) {
        const dialogConfig = {
          context: this,
          title: '提示',
          closeOnOverlayClick: true,
          content: '智能体发布需要专属形象，请先给智能体创建专属形象',
          confirmBtn: '确定'
        };

        Dialog.confirm(dialogConfig)
        return
      }
      if (
        !this.data.editingRoleInfo.tagNames ||
        this.data.editingRoleInfo.tagNames.length == 0 ||
        !this.data.editingRoleInfo.typeNames ||
        this.data.editingRoleInfo.typeNames.length == 0 
      ) {
        const dialogConfig = {
          context: this,
          title: '提示',
          closeOnOverlayClick: true,
          content: '智能体发布需要补充标签和类型，请先在编辑页的【高级设定】中添加智能体标签和类型',
          confirmBtn: '确定'
        };

        Dialog.confirm(dialogConfig)
        return
      }
      const tipDialog = this.selectComponent('#tip-dialog')
      tipDialog.show({
        hideTopIcon: true,
        contentAlign: 'justify',
        content:
          '版权声明：\n请确认此智能体是您的原创智能体，不侵犯他人的图像、IP或其他权益。侵犯他人权益的智能体无法获得认证，影响您使用本平台的服务。\n\n1、创建的智能体为本人独立创作，不存在抄袭、剽窃等任何形式的侵权，也不侵犯肖像权等他人权益。\n2、同意平台管理规则，如因智能体引发的法律纠纷或争议均由本人承担责任。\n\n',
        cancelText: '取消',
        confirmText: '同意并发布',
        onConfirm: () => {
          applyCharacterPublished({characterId: this.data.editingRole})
          .then(res => {
            wx.showToast({
              title: '提交发布成功！',
              icon: 'none',
              duration: 2500
            })
            this.getCharacterList()
          })
        }
      })
    }

    if (type === '下架智能体') {
      const tipDialog = this.selectComponent('#tip-dialog')
      tipDialog.show({
        hideTopIcon: true,
        contentAlign: 'left',
        content:
          '下架智能体，所有人将无法搜索TA。但不影响已聊天用户。',
        cancelText: '取消',
        confirmText: '继续下架',
        onConfirm: () => {
          unpublishChar({characterId: this.data.editingRole})
          .then(res => {
            wx.showToast({
              title: '下架成功',
              icon: 'none',
              duration: 2500
            })
            this.getCharacterList()
          })
        }
      })
    }
  }
})
