import userStore from '../../store/user'
import SystemInfo from '../../utils/system'
import ActionSheet, { ActionSheetTheme } from 'tdesign-miniprogram/action-sheet'
import {
  getUserGroupChatList,
  getCurrentPlotByGroupChatId,
  applyPublish,
  getAuditRejectReason as getGroupAuditRejectReason,
  unpublishGroup,
  deleteGroup
} from '../../services/group/index'
import {
  createPlot
} from '../../services/ai/chat'
import {
  getCharacterList,
  getCurrentPlotByCharacterId,
  deleteCharacter,
  applyCharacterPublished,
  getAuditRejectReason,
  unpublishChar,
  updateCharacter
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

// 通用：智能体 / 群聊复用同一份状态映射
function getItemStatusBadge(item) {
  return getRoleStatusBadge(item)
}

// 判断是否为私密（草稿/未发布）
function isPrivateByPublishStatus(item) {
  const ps = item?.publishStatus
  return ps === 0 || ps === '0' || !ps
}

Page({
  data: {
    activeMainTab: 'role',
    roleList: [],
    privateRoleList: [],
    publicRoleList: [],
    groupList: [],
    privateGroupList: [],
    publicGroupList: [],
    isDev: false,
    pageInfo: {},
    editingRole: null,
    editingRoleInfo: null,
    editingGroup: null,
    editingGroupInfo: null,
    groupActionType: null,
    authorizeLoading: false,
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
    groupTypeList: [
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
    activeGroupType: '1',
    showGroupRedDot: true,
    contentHeight: '100vh',
    wxCode: 'XYJG_8647902'
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
    this.checkGroupRedDot()
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
    this.checkGroupRedDot()
    this.getCharacterList()
    this.getGroupList()
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
  goEditProfile() {
    wx.navigateTo({
      url: '/pages/usercenter/edit/index'
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

  // 星耀集入口
  onStarYaoJiClick() {
    wx.navigateTo({
      url: '/pages/star-yao-ji/index'
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

  // 一级 tab 切换：智能体 / 群聊
  onMainTabChange(e) {
    const value = e.currentTarget.dataset.value
    if (value === this.data.activeMainTab) return

    // 切到群聊，标记已查看、清掉红点；与 discover 同 key 互通
    if (value === 'group') {
      this.setData({ showGroupRedDot: false })
      wx.setStorageSync('hasSeenGroup', true)
    }

    this.setData({ activeMainTab: value })
  },

  // 群聊二级 tab 切换：私密 / 公开
  onGroupTypeChange(e) {
    const value = e.currentTarget.dataset.value
    if (value === this.data.activeGroupType) return

    const groupList = value === '1'
      ? (this.data.privateGroupList || [])
      : (this.data.publicGroupList || [])

    this.setData({
      activeGroupType: value,
      groupList
    })
  },

  // 同步群聊红点状态（与 discover 共享 hasSeenGroup）
  checkGroupRedDot() {
    const hasSeenGroup = wx.getStorageSync('hasSeenGroup')
    if (hasSeenGroup && this.data.showGroupRedDot) {
      this.setData({ showGroupRedDot: false })
    }
  },

  // 加载群聊列表（私密 + 公开分别请求一次，复用 discover 已有的接口）
  getGroupList() {
    Promise.all([
      getUserGroupChatList({ current: 1, size: 1000, isPublished: false }),
      getUserGroupChatList({ current: 1, size: 1000, isPublished: true })
    ]).then(([privateRes, publicRes]) => {
      const privateRecords = ((privateRes && privateRes.records) || []).map((item) => ({
        ...item,
        _statusBadge: getItemStatusBadge(item)
      }))
      const publicRecords = ((publicRes && publicRes.records) || []).map((item) => ({
        ...item,
        _statusBadge: getItemStatusBadge(item)
      }))

      const groupTypeList = (this.data.groupTypeList || []).map((t) => {
        if (t.value === '1') return { ...t, count: privateRecords.length }
        if (t.value === '2') return { ...t, count: publicRecords.length }
        return t
      })

      const groupList = this.data.activeGroupType === '1' ? privateRecords : publicRecords

      this.setData({
        privateGroupList: privateRecords,
        publicGroupList: publicRecords,
        groupTypeList,
        groupList
      })
    }).catch((err) => {
      console.error('加载群聊列表失败:', err)
    })
  },

  // 点击群聊卡片
  async onGroupClick(e) {
    const { groupchatid } = e.currentTarget.dataset
    const res = await getCurrentPlotByGroupChatId(groupchatid)
    let plotId = res && res.plotId ? res.plotId : ''
    if (!plotId) {
      plotId = await createPlot({
        groupChatId: groupchatid
      })
    }
    wx.navigateTo({
      url: `/pages/chat/index?groupId=${groupchatid}&plotId=${plotId || ''}`
    })
  },

  // 群聊为空时的创建按钮，复用 TabBar 的创建选择弹窗
  onCreateGroup() {
    const tabBar = this.getTabBar()
    if (tabBar) {
      const dialog = tabBar.selectComponent('#createSelectDialog')
      if (dialog) {
        dialog.show()
      }
    }
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
      // 通过 TabBar 显示创建选择弹窗
      const tabBar = this.getTabBar()
      if (tabBar) {
        const dialog = tabBar.selectComponent('#createSelectDialog')
        if (dialog) {
          dialog.show()
        }
      }
    }
  },

  createRole() {
    // 用户中心空状态的创建按钮，通过 TabBar 显示创建选择弹窗
    const tabBar = this.getTabBar()
    if (tabBar) {
      const dialog = tabBar.selectComponent('#createSelectDialog')
      if (dialog) {
        dialog.show()
      }
    }
  },

  onGroupLongPress(e) {
    const id = e.currentTarget.dataset.id
    const info = (this.data.groupList || []).find((item) => item.groupChatId == id)

    let publishStatus = info?.publishStatus

    this.setData({
      editingGroup: id,
      editingGroupInfo: info || {},
      groupActionType: 'group'
    })

    let items = []

    // 0 / 未提交（草稿/私密）
    if (publishStatus == 0 || !publishStatus) {
      items = ['编辑', '发布群聊', '删除']
    }
    // 1 审核中：阻断
    if (publishStatus == 1) {
      wx.showToast({
        title: '群聊正在审核中，无法进行操作',
        icon: 'none',
        duration: 2500
      })
      this.setData({ groupActionType: null })
      return
    }
    // 2 已发布：支持下架
    if (publishStatus == 2) {
      items = ['编辑', '下架群聊']
    }
    // 3 已驳回：可以重新编辑/删除/发布
    if (publishStatus == 3) {
      items = ['编辑', '发布群聊', '删除']
    }
    // 4 已下架：可以重新发布
    if (publishStatus == 4) {
      items = ['编辑', '发布群聊']
    }

    ActionSheet.show({
      theme: ActionSheetTheme.List,
      selector: '#actionSheet',
      context: this,
      cancelText: '取消',
      items
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
    let items = ['音色设置']
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
      items.unshift('群聊授权')
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

    if (this.data.groupActionType === 'group') {
      if (type === '编辑') {
        const groupId = this.data.editingGroup
        getCurrentPlotByGroupChatId(groupId).then((plotRes) => {
          const plotId = plotRes && plotRes.plotId ? plotRes.plotId : ''
          wx.navigateTo({
            url: `/pages/group/add/index?id=${groupId}&plotId=${plotId}`
          })
        }).catch(() => {
          wx.navigateTo({
            url: `/pages/group/add/index?id=${groupId}`
          })
        })
        this.setData({ groupActionType: null })
        return
      }
      if (type === '删除') {
        const groupId = this.data.editingGroup
        const tipDialog = this.selectComponent('#tip-dialog')
        tipDialog.show({
          content: '删除后，该群聊将无法恢复，确认删除？',
          cancelText: '取消',
          confirmText: '确认',
          onConfirm: () => {
            deleteGroup({ groupChatId: groupId })
              .then(() => {
                wx.showToast({ title: '已删除', icon: 'success' })
                this.getGroupList()
              })
              .catch((err) => {
                wx.showToast({
                  title: err || '删除失败，请稍后重试',
                  icon: 'none'
                })
              })
              .finally(() => {
                this.setData({ groupActionType: null })
              })
          },
          onCancel: () => {
            this.setData({ groupActionType: null })
          }
        })
        return
      }
      if (type === '发布群聊') {
        const groupId = this.data.editingGroup
        const tipDialog = this.selectComponent('#tip-dialog')
        tipDialog.show({
          hideTopIcon: true,
          contentAlign: 'justify',
          content:
            '版权声明：\n请确认此群聊是您的原创群聊，不侵犯他人的IP或其他权益。侵犯他人权益的群聊无法获得认证，影响您使用本平台的服务。\n\n1、创建的群聊为本人独立创作，不存在抄袭、剽窃等任何形式的侵权，也不侵犯肖像权等他人权益。\n2、同意平台管理规则，如因群聊引发的法律纠纷或争议均由本人承担责任。\n\n',
          cancelText: '取消',
          confirmText: '同意并发布',
          onConfirm: () => {
            applyPublish({ groupChatId: groupId })
              .then(() => {
                wx.showToast({
                  title: '提交发布成功！',
                  icon: 'none',
                  duration: 2500
                })
                this.getGroupList()
              })
              .catch((err) => {
                wx.showToast({
                  title: err?.msg || '发布失败，请稍后重试',
                  icon: 'none'
                })
              })
              .finally(() => {
                this.setData({ groupActionType: null })
              })
          },
          onCancel: () => {
            this.setData({ groupActionType: null })
          }
        })
        return
      }
      if (type === '下架群聊') {
        const groupId = this.data.editingGroup
        const tipDialog = this.selectComponent('#tip-dialog')
        tipDialog.show({
          hideTopIcon: true,
          contentAlign: 'left',
          content:
            '下架群聊，所有人将无法搜索TA。但不影响已加入的用户。',
          cancelText: '取消',
          confirmText: '继续下架',
          onConfirm: () => {
            unpublishGroup({ groupChatId: groupId })
              .then(() => {
                wx.showToast({
                  title: '下架成功',
                  icon: 'none',
                  duration: 2500
                })
                this.getGroupList()
              })
              .catch((err) => {
                wx.showToast({
                  title: err?.msg || '下架失败，请稍后重试',
                  icon: 'none'
                })
              })
              .finally(() => {
                this.setData({ groupActionType: null })
              })
          },
          onCancel: () => {
            this.setData({ groupActionType: null })
          }
        })
        return
      }
      this.setData({ groupActionType: null })
      return
    }

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
        url: `/pages/role/add/index?id=${this.data.editingRole}&publishStatus=${this.data.editingRoleInfo.publishStatus}&from=usercenter`
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
    if (type === '群聊授权') {
      this.openAuthorizeDialog()
      return
    }
    if (type === '音色设置') {
      wx.navigateTo({
        url: `/pages/role/voice-list/index?characterId=${this.data.editingRole}&from=usercenter`
      })
    }
  },
  confirmRoleVoice(voice) {
    this.getCharacterList()
  },
  async showRejectReason(e) {
    const { role = {} } = e.currentTarget.dataset
    const res = await getAuditRejectReason({
      characterId: role.id
    })
    const tipDialog = this.selectComponent('#reject-dialog')
    tipDialog.show({
      title: '驳回原因',
      hideTopIcon: true,
      content: res,
      cancelText: '取消',
      confirmText: '去修改',
      onConfirm: () => {
        wx.navigateTo({
          url: `/pages/role/add/index?id=${role.id}&publishStatus=${role.publishStatus}`
        })
      }
    })
  },
  async showGroupRejectReason(e) {
    const { group = {} } = e.currentTarget.dataset
    const groupChatId = group.groupChatId
    if (!groupChatId) {
      wx.showToast({ title: '群聊信息缺失', icon: 'none' })
      return
    }
    const res = await getGroupAuditRejectReason({ groupChatId })
    const tipDialog = this.selectComponent('#reject-dialog')
    tipDialog.show({
      title: '驳回原因',
      hideTopIcon: true,
      content: res || '暂无驳回原因',
      cancelText: '取消',
      confirmText: '去修改',
      onConfirm: () => {
        wx.navigateTo({
          url: `/pages/group/add/index?id=${groupChatId}&publishStatus=${group.publishStatus}`
        })
      }
    })
  },
  copyAction() {
    wx.setClipboardData({
      data: this.data.wxCode,
      success: () => {
        wx.showToast({
          title: '已复制到粘贴板',
          icon: 'none'
        })
      }
    })
    // this.hide()
  },
  idCopyAction() {
    wx.setClipboardData({
      data: userStore.data.userInfo.uid + "",
      success: () => {
        wx.showToast({
          title: '已复制到粘贴板',
          icon: 'none'
        })
      }
    })
  },
  openAuthorizeDialog() {
    const id = this.data.editingRole
    const role = this.data.roleList.find((item) => item.id == id)
    if (!id) {
      wx.showToast({ title: '智能体信息缺失', icon: 'none' })
      return
    }
    this.setData({
      authorizeLoading: false
    })

    const dialog = this.selectComponent('#authorize-dialog')
    dialog.setData({ loading: false })
    dialog.show({
      name: role?.name || '',
      authorize: 'open'
    })
  },

  // 用户点击授权弹窗的"确认"
  // detail.authorize: 'open' 开放 -> 调 applyPublish；'close' 关闭 -> 调 /unpublish
  onAuthorizeConfirm(e) {
    const id = this.data.editingRole
    const role = this.data.roleList.find((item) => item.id == id)
    const ifGroupChat = role?.ifGroupChat

    const authorize = (e && e.detail && e.detail.authorize) == 'open' ? true : false

    const dialog = this.selectComponent('#authorize-dialog')

    this.setData({
      authorizeLoading: true
    })
    if (dialog) dialog.setData({ loading: true })
    updateCharacter({
      id,
      ifGroupChat: authorize
    }).then(res => {
      wx.showToast({
        title: authorize ? '授权成功' : '取消授权成功',
        icon: 'success'
      })
      this.getCharacterList()
    })
    .catch(err => {
      wx.showToast({
        title: err?.msg || (authorize ? '授权失败，请稍后重试' : '取消授权失败，请稍后重试'),
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({
        authorizeLoading: false
      })
      if (dialog) {
        dialog.setData({ loading: false })
        dialog.hide()
      }
    })
  }
})
