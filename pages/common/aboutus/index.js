import { logoff } from '../../../services/usercenter/index'
import userStore from '../../../store/user'
const app = getApp()
Page({
  data: {
    itemList: [
      {
        header: true,
        title: '我的',
      },
      {
        title: '全局设定',
        desc: '设置所有智能体对你的称呼',
        url: '/pages/role/my-setting/index?isGlobal=true'
      },
      {
        title: '始终全屏展示对话',
        desc: '',
        url: '',
        isSwitch: true,
        switchOptions: {
          checked: false,
          getChecked: () => {
            return wx.getStorageSync('alwaysFullScreen') === 'true'
          },
          onChange: (checked) => {
            wx.setStorageSync('alwaysFullScreen', checked ? 'true' : 'false')
          }
        }
      },
      
      {
        title: '我的订单',
        desc: '',
        url: '/pages/order/myOrders/index'
      },

      {
        header: true,
        title: '关于我们',
      },
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
        desc: '',
        url: ''
      }
    ]
  },

  onLoad() {
    const accountInfo = wx.getAccountInfoSync();
    const itemList = this.data.itemList.map(item => {
      const newItem = { ...item }
      if (newItem.title === '版本号') {
        newItem.desc = accountInfo.miniProgram.version
      }
      if (newItem.isSwitch && newItem.switchOptions?.getChecked) {
        newItem.switchOptions = {
          ...newItem.switchOptions,
          checked: newItem.switchOptions.getChecked()
        }
      }
      return newItem
    })
    this.setData({ itemList })
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
  },
  onSwitchChange(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    const item = this.data.itemList[index]
    if (item?.switchOptions?.onChange) {
      item.switchOptions.onChange(value)
      const itemList = [...this.data.itemList]
      itemList[index].switchOptions.checked = value
      this.setData({ itemList })
    }
  }
})
