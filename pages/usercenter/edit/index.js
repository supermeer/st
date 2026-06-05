import userStore from '../../../store/user'
import { verifyUrls } from '../../../services/file/index'
import { updateUserInfo } from '../../../services/usercenter/index'

Page({
  data: {
    userInfo: {},
    nickname: '',
    previewAvatar: '',
    uploaded: { remoteUrl: '', fileKey: '' },
    saving: false,
    defaultAvatar: '/static/usercenter/default-avatar.png'
  },

  onLoad() {
    userStore.bind(this)
    const u = userStore.data?.userInfo || {}
    this.setData({
      userInfo: u,
      nickname: u.nickname || ''
    })
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  onChangeAvatar() {
    const that = this
    wx.navigateTo({
      url: '/pages/common/cropper/index',
      events: {
        cropperDone: async function (detail) {
          const { localPath, remoteUrl, fileKey } = detail || {}
          if (!fileKey) {
            wx.showToast({ title: '上传失败，请重试', icon: 'none' })
            return
          }
          try {
            const res = await verifyUrls([fileKey])
            const fileRes = res && res[0] ? res[0] : {}
            if (fileRes && !fileRes.illegal) {
              that.setData({
                previewAvatar: localPath,
                uploaded: { remoteUrl, fileKey }
              })
            } else {
              wx.showModal({ title: '提示', content: '您上传的图片包含敏感信息。' })
              that.setData({ previewAvatar: '', uploaded: { remoteUrl: '', fileKey: '' } })
            }
          } catch (e) {
            wx.showToast({ title: '校验失败，请重试', icon: 'none' })
          }
        }
      }
    })
  },

  async onSave() {
    const nickname = (this.data.nickname || '').trim()
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    try {
      const avatarUrl = this.data.uploaded.remoteUrl || this.data.userInfo.avatarUrl || ''
      const payload = { nickname, avatarUrl }
      await updateUserInfo(payload)
      userStore.updateUser(payload)
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  }
})
