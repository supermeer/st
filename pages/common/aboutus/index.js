import { logoff } from '../../../services/usercenter/index'
import userStore from '../../../store/user'
const app = getApp()
Page({
  data: {
    itemList: [
      {
        title: '隐私协议',
        desc: '',
        url: '/pages/common/agreement/index?type=3'
      },
      {
        title: '免责声明',
        desc: '',
        url: '/pages/common/agreement/index?type=2'
      },
      {
        title: '用户协议',
        desc: '',
        url: '/pages/common/agreement/index?type=1'
      },
      {
        title: '版本号',
        desc: '1.0.0',
        url: ''
      }
    ]
  },

  onLoad() {
    // 获取版本号
    if (app.globalData && app.globalData.version) {
      this.setData({
        version: app.globalData.version
      })
    }
  },
  logoff() {
    this.logoffDialogRef = this.selectComponent('#logoff-dialog')
    this.logoffDialogRef.show()
  },
  closeLogoffDialog() {
    this.logoffDialogRef.hide()
  },
  confirmLogoffDialog() {
    wx.showLoading({
      title: '注销中...',
      mask: true
    })
    logoff()
      .then((res) => {
        this.logoffDialogRef.hide()
        wx.showToast({
          title: '注销成功',
          icon: 'success'
        })
        userStore.clearAuth()
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/home/home'
          })
        }, 1000)
      })
      .finally(() => {
        setTimeout(() => {
          wx.hideLoading()
        }, 1500)
      })
  },
  onClickCell(e) {
    const { url } = e.currentTarget.dataset
    if (url) {
      wx.navigateTo({ url })
    }
  }
})
