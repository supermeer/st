import SystemInfo from '../../utils/system'
// "plugins": {
//   "WechatSI": {
//     "version": "0.3.1",
//     "provider": "wx069ba97219f66d99"
//   }
// }
// text() {
//   var plugin = requirePlugin('WechatSI')
//   let manager = plugin.getRecordRecognitionManager()
//   manager.onStop = function (res) {
//     console.log(res, 'onStop')
//   }
//   manager.onStart = function (res) {
//     console.log(res, 'onStart')
//   }
//   manager.onError = function (res) {
//     console.log(res, 'onError')
//   }
//   manager.start({ duration: 30000, lang: 'zh_CN' })
// },
// pages/home/home.js
Page({
  data: {
    messageList: [
      {
        senderType: 1,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },{
        senderType: 1,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      },
      {
        senderType: 2,
        content:
          '咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟咿呀咿呀哟',
        images: [
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png',
          'https://yoursx-static-1371529546.cos.ap-guangzhou.myqcloud.com/order_bg.png'
        ]
      }
    ],
    pageInfo: {},
    paddingBtm: 0
  },
  onLoad() {
    this.setData({
      pageInfo: { ...SystemInfo.getPageInfo(), ...this.data.pageInfo }
    })
    // calc({{pageInfo.safeAreaBottom}}px + {{pageInfo.tabbarHeight}}rpx);
    this.setData({
      paddingBtm: `calc(${this.data.pageInfo.safeAreaBottom}px + ${this.data.pageInfo.tabbarHeight}rpx)`
    })
  },
  onShow() {
    this.getTabBar().init()
  },
  hideTabbar() {
    this.setData({
      paddingBtm: 0
    })
    this.getTabBar().hide()
  },
  showTabbar() {
    this.setData({
      paddingBtm: `calc(${this.data.pageInfo.safeAreaBottom}px + ${this.data.pageInfo.tabbarHeight}rpx)`
    })
    this.getTabBar().show()
  }
})
