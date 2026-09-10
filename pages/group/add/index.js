import SystemInfo from '../../../utils/system'
import { verifyUrls } from '../../../services/file/index'
import GroupChatService from '../../../services/ai/group-chat'
import { getGroupDetail } from '../../../services/group/index'
import {
  createPlot,
  updatePlot,
  getCurrentPlotByGroupChatId
} from '../../../services/ai/chat'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isEdit: false,
    pageTitle: '创建群聊',
    submitBtnText: '保存设定',
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    formData: {
      id: null,
      storyId: null,
      plotId: null,
      name: '',
      description: '',
      storyTitle: '',
      title: '',
      scene: '',
      plotSetting: '',
      prologue: '',
      prologueCharacterId: '',
      userAddressedAs: '',
      identity: '',
      personaGender: '',
      backgroundImage: null
    },
    showUploader: false,
    currentBg: '',

    selectedCharacters: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })

    const nav = this.selectComponent('#groupAddNav')
    if (nav) {
      nav.setBackAction(this.backAction)
    }

    if (options && options.id) {
      this.setData({
        isEdit: true,
        pageTitle: '编辑群聊',
        submitBtnText: '保存修改',
        'formData.id': options.id,
        'formData.plotId': options.plotId || null
      })
      this.loadGroupForEdit(options.id, options.plotId || null)
    }
  },

  /**
   * 编辑模式：从详情接口回填表单
   */
  loadGroupForEdit(groupId, plotId) {
    getGroupDetail(groupId, plotId).then((res) => {
      if (!res) return

      // 角色成员：detail 用 avatar 字段，role-select 用 avatarUrl 字段，统一映射成 avatarUrl
      const selectedCharacters = (res.characterInfos || []).map((c) => ({
        id: c.id,
        name: c.name,
        avatarUrl: c.avatar || c.avatarUrl || ''
      }))

      const story = res.plotDetailVO && res.plotDetailVO.story
        ? res.plotDetailVO.story
        : res.defaultStoryDetail || {}

      const persona = (res.plotDetailVO && res.plotDetailVO.persona) || res.defaultPersona || {}

      const backgroundImage =
        (res.plotDetailVO && res.plotDetailVO.backgroundImage) ||
        res.backgroundImage ||
        ''

      this.setData({
        selectedCharacters,
        currentBg: backgroundImage,
        formData: {
          ...this.data.formData,
          id: groupId,
          storyId: story.id || null,
          plotId: res.currentPlotId || plotId || null,
          name: res.name || '',
          description: res.description || '',
          storyTitle: story.title || '',
          title: story.title || '',
          scene: story.scene || '',
          prologue: story.prologue || '',
          prologueCharacterId: story.prologueCharacterId || '',
          userAddressedAs: persona.userAddressedAs || '',
          identity: persona.identity || '',
          personaGender: persona.gender || '',
          backgroundImage
        }
      })
    }).catch((err) => {
      console.error('加载群聊详情失败:', err)
    })
  },

  backAction() {
    const tipDialog = this.selectComponent('#tip-dialog')
    let content = this.data.isEdit
      ? '退出当前页面后，修改的内容不会被保存，确认退出？'
      : '退出当前页面后，编辑的内容不会被保存，确认退出？'
    tipDialog.show({
      title: '提示',
      content,
      cancelText: '取消',
      confirmText: '确认',
      onCancel: () => {},
      onConfirm: async () => {
        wx.navigateBack()
      }
    })
  },

  onTouchMove() {},

  /**
   * 输入框变化
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const value = e.detail.value || ''
    this.setData({
      [`formData.${field}`]: value
    })
  },

  /**
   * 文本域变化
   */
  onTextareaChange(e) {
    const { field } = e.currentTarget.dataset
    const value = e.detail.value || ''
    this.setData({
      [`formData.${field}`]: value
    })
  },

  /**
   * 选择开场白角色
   */
  onSelectPrologueCharacter(e) {
    const { id } = e.currentTarget.dataset
    const character = this.data.selectedCharacters.find(c => c.id == id)
    this.setData({
      'formData.prologueCharacterId': this.data.formData.prologueCharacterId == character.id ? null : character.id,
    })
  },

  /**
   * 移除群成员
   */
  onRemoveCharacter(e) {
    const { id } = e.currentTarget.dataset
    const selectedCharacters = [...this.data.selectedCharacters]
    const index = selectedCharacters.findIndex((c) => c.id === id)
    if (index !== -1) {
      selectedCharacters.splice(index, 1)
      this.setData({ selectedCharacters })
    }
  },

  /**
   * 添加角色
   */
  onAddCharacters() {
    const selectedRoles = encodeURIComponent(JSON.stringify(this.data.selectedCharacters))
    wx.navigateTo({
      url: `/pages/group/role-select/index?selectedRoles=${selectedRoles}`
    })
  },

  /**
   * 接收角色选择返回的数据
   */
  onRoleSelectBack(selectedRoles) {
    console.log('onRoleSelectBack', selectedRoles)
    this.setData({
      selectedCharacters: selectedRoles || []
    })
  },

  /**
   * 对我的设定
   */
  onUserSettings() {
    wx.navigateTo({
      url: `/pages/role/my-setting/index?gender=${this.data.formData.personaGender}&userAddressedAs=${this.data.formData.userAddressedAs}&identity=${this.data.formData.identity}`
    })
  },

  confirmUserSettings(e) {
    const { userAddressedAs, identity, personaGender } = e
    this.setData({
      'formData.userAddressedAs': userAddressedAs,
      'formData.identity': identity,
      'formData.personaGender': personaGender
    })
  },

  /**
   * 聊天背景
   */
  onChatBackground() {
    this.setData({
      showUploader: true
    })
  },

  async onUploadSuccess(e) {
    const { tempFilePath, signature } = e.detail
    const bg =
      signature && signature.uploadUrl
        ? signature.uploadUrl.split('?')[0]
        : tempFilePath
    const res = await verifyUrls([signature.fileKey])
    const fileRes = res && res[0] ? res[0] : {}
    if (fileRes && !fileRes.illegal) {
      this.setData({
        showUploader: false,
        currentBg: tempFilePath,
        'formData.backgroundImage': bg
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您上传的图片包含敏感信息。'
      })
      this.setData({
        showUploader: false,
        currentBg: null,
        'formData.backgroundImage': null
      })
    }
  },

  onUploadFail(e) {
    const { message } = e
    wx.showToast({ title: message, icon: 'none' })
    this.setData({ showUploader: false })
  },

  onUploadCancel() {
    this.setData({ showUploader: false })
  },

  /**
   * 提交表单
   */
  async onSubmit() {
    const { formData, selectedCharacters, isEdit } = this.data

    if (!formData.name) {
      wx.showToast({
        title: '请输入群名称',
        icon: 'none'
      })
      return
    }
    if (!formData.description) {
      wx.showToast({
        title: '请输入群简介',
        icon: 'none'
      })
      return
    }
    if (!selectedCharacters || selectedCharacters.length < 2) {
      wx.showToast({
        title: '请选择至少2个角色',
        icon: 'none'
      })
      return
    }
    if (!formData.storyTitle) {
      wx.showToast({
        title: '请输入故事名称',
        icon: 'none'
      })
      return
    }
    if (!formData.scene) {
      wx.showToast({
        title: '请输入故事设定',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...',
      mask: true
    })

    try {
      const params = {
        groupChatId: formData.id || undefined,
        name: formData.name,
        description: formData.description,
        characterIds: selectedCharacters.map(c => c.id),
        defaultBackgroundImage: formData.backgroundImage || '',
        prologue: formData.prologue,
        storyTitle: formData.storyTitle,
        title: formData.storyTitle,
        scene: formData.scene,
        prologueCharacterId: formData.prologueCharacterId || undefined
      }
      let method = GroupChatService.createGroupChat
      if (isEdit) {
        method = GroupChatService.updateGroupChat
      }

      const res = await method(params)

      wx.hideLoading()

      const tipDialog = this.selectComponent('#tip-dialog')
      let content = '有任何问题，可添加客服微信咨询。'

      // 编辑模式：同步开场白角色到 plot（参照新增接口走 updatePlot）
      const onAfterChatSuccess = async () => {
        try {
          let plotId = formData.plotId
          if (!plotId) {
            const cur = await getCurrentPlotByGroupChatId(res.groupChatId || formData.id)
            plotId = cur && cur.plotId
          }
          if (plotId && formData.prologueCharacterId) {
            await updatePlot({
              id: plotId,
              prologueCharacterId: formData.prologueCharacterId
            })
          }
        } catch (e) {
          console.error('更新开场白角色失败:', e)
        }

        wx.redirectTo({
          url: `/pages/chat/index?plotId=${formData.plotId || ''}&groupId=${res.groupChatId || formData.id}`
        })
      }

      const onAfterCreatePlot = async () => {
        const plotRes = await createPlot({
          groupChatId: res.groupChatId,
          storyId: res.defaultStoryId,
        })
        wx.redirectTo({
          url: `/pages/chat/index?plotId=${plotRes || ''}&groupId=${res.groupChatId}`
        })
      }

      tipDialog.show({
        title: `${isEdit ? '更新成功' : '创建成功'}`,
        content,
        cancelText: '添加客服',
        confirmText: '去聊天',
        onCancel: () => {
          // wx.navigateBack()
          const app = getApp()
          wx.openCustomerServiceChat({
            extInfo: { url: app.globalData.wxCustomerService.url },
            corpId: app.globalData.wxCustomerService.corpId,
            success(res) {}
          })
        },
        onConfirm: isEdit ? onAfterChatSuccess : onAfterCreatePlot
      })
    } catch (err) {
      wx.hideLoading()
      console.error(`${this.data.isEdit ? '更新' : '创建'}群聊失败:`, err)
    }
  }
})
