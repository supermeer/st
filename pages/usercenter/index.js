import userStore from '../../store/user'
import Message from 'tdesign-miniprogram/message/index'
Page({
  data: {
    // 历史记录、我的订单、联系客服、邀请好友、关于我们
    userCenterItems: [
      {
        icon: '/static/usercenter/history.png',
        title: '历史记录',
        desc: '查看历史记录',
        url: '/pages/chat/history/index'
      },
      {
        icon: '/static/usercenter/order.png',
        title: '我的订单',
        url: '/pages/order/myOrders/index'
      },
      {
        icon: '/static/usercenter/cs.png',
        title: '联系客服',
        url: '',
        hideArr: true
      },
      {
        icon: '/static/usercenter/visit.png',
        title: '邀请好友',
        desc: '分享新用户，获取次数',
        url: '/pages/share/index'
      },
      {
        icon: '/static/usercenter/about.png',
        title: '关于我们',
        url: '/pages/common/aboutus/index'
      }
    ]
  },

  onLoad() {
    userStore.bind(this)
  },

  onShow() {
    this.getTabBar().init()
    userStore.refreshVipInfo()
  },

  onClickCell({ currentTarget }) {
    const url = currentTarget.dataset.url
    // 如果url为空，则跳转到客服页面
    if (!url) {
      const App = getApp()
      wx.openCustomerServiceChat({
        extInfo: { url: App.globalData.wxCustomerService.url },
        corpId: App.globalData.wxCustomerService.corpId,
        success(res) {},
        fail(err) {
          console.log(err)
        }
      })
    } else {
      wx.navigateTo({
        url: url
      })
    }
  },

  // 点击立即续费
  onVipRenewClick(e) {
    this.navigateToVipPage()
  },

  // 点击详情
  onTimesDetailClick() {
    wx.navigateTo({
      url: '/pages/vip/times-detail/index'
    })
  },

  // 跳转到VIP套餐页面
  navigateToVipPage() {
    wx.navigateTo({
      url: '/pages/vip/packages/index'
    })
  }
})
