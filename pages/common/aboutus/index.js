import { logoff, getModelList, getGlobalModelId } from '../../../services/usercenter/index'
import userStore from '../../../store/user'
import { QUOTE_GRADIENT_OPTIONS } from '../../../utils/msgHandler'
const app = getApp()
Page({
  data: {
    itemList: [
      {
        header: true,
        title: '我的',
      },
      {
        title: '对话模型',
        desc: '',
        isModel: true,
        showDot: false,
        url: '/pages/role/my-setting/index?isGlobal=true'
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
        title: '对话字体颜色',
        desc: '',
        url: '',
        isGradientPicker: true,
        getGradientDesc: () => {
          const savedId = wx.getStorageSync('quoteGradient') || 'gold-cyan'
          const option = QUOTE_GRADIENT_OPTIONS.find(opt => opt.id === savedId)
          return option ? option.name : '金青渐变'
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
    ],
    currentModel: null,
    modelList: []
  },

  onLoad() {
    this.updateItemList()
    const newModelMark = wx.getStorageSync('newModelMark')
    if (!newModelMark) {
      wx.setStorageSync('newModelMark', true)
      this.data.itemList[1].showDot = true
      this.setData({
        itemList: [...this.data.itemList]
      })
    }
    getModelList().then(res => {
      this.setData({
        modelList: res || []
      })
      this.setCurrentModel()
    })
  },
  onShow() {
    getGlobalModelId().then(res => {
      this.setData({
        currentModel: {
          ...(this.data.currentModel || {}),
          id: res
        }
      })
      this.setCurrentModel()
    })
  },
  setCurrentModel() {
    if (!this.data.currentModel || !this.data.currentModel.id || this.data.modelList.length === 0) {
      return
    }
    const res = this.data.modelList.filter(item => item.id === this.data.currentModel.id)
    if (res && res.length > 0) {
      this.updateItemModelName(res[0].modelName) 
      this.setData({
        currentModel: {
          ...res[0]
        }
      })
    }
  },
  updateItemList() {
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
      if (newItem.isGradientPicker && newItem.getGradientDesc) {
        newItem.desc = newItem.getGradientDesc()
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
    const { url, index } = e.currentTarget.dataset
    if (index === 1) {
      this.onModelSelect()
      return
    }
    if (url) {
      wx.navigateTo({ url })
    }
  },
  async onModelSelect() {
    this.modelSheetRef = this.selectComponent('#modelSheet')
    this.modelSheetRef.show({
      modelOptions: [...this.data.modelList],
      currentValue: this.data.currentModel.id,
      onConfirm: (id, item) => {
        this.updateItemModelName(item.modelName)
      }
    })
    this.data.itemList[1].showDot = false
    this.setData({
      itemList: [...this.data.itemList]
    })
    wx.setStorageSync('newModelMark', true)
  },
  updateItemModelName(name) {
    const itemList = [...this.data.itemList]
    itemList[1].desc = name
    this.setData({
      itemList: [...itemList]
    })
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
  },
  onGradientPicker() {
    const savedId = wx.getStorageSync('quoteGradient') || 'gold-cyan'
    wx.showActionSheet({
      itemList: QUOTE_GRADIENT_OPTIONS.map(opt => opt.name),
      success: (res) => {
        const selected = QUOTE_GRADIENT_OPTIONS[res.tapIndex]
        if (selected) {
          wx.setStorageSync('quoteGradient', selected.id)
          this.updateItemList()
          wx.showToast({
            title: '已切换为' + selected.name,
            icon: 'none'
          })
        }
      }
    })
  }
})
