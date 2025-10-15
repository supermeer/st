import systemInfo from '../../utils/system'
Component({
  properties: {
    messageList: Array
  },
  observers: {
    'messageList': function(newVal) {
      if (newVal && newVal.length > 0) {
        // 消息列表更新时，延迟滚动到底部，确保 DOM 已更新
        setTimeout(() => {
          this.scrollToBottom()
        }, 100)
      }
    }
  },
  lifetimes: {
    attached: function () {
      this.getPageInfo()
    }
  },
  data: {
    isLogin: false,
    userInfo: {},
    keyboardHeight: 0,
    contentHeight: '100%',
    safeAreaBottom: 0,
    tabbarHeight: 0,
    intoViewId: 0,
    navHeight: 0,
    safeAreaTop: 0
  },
  methods: {
    getPageInfo() {
      const pageInfo = systemInfo.getPageInfo()
      this.setData({
        safeAreaTop: pageInfo.safeAreaTop,
        navHeight: pageInfo.navHeight,
        safeAreaBottom: pageInfo.safeAreaBottom,
        tabbarHeight: pageInfo.tabbarHeight
      })
    },
    goLogin() {
      this.setData({ isLogin: true })
    },
    onKeyboardHeightChange(e) {
      const keyboardHeight = typeof e.detail === 'number' ? e.detail : (e.detail.keyboardHeight || 0)
      this.setData({
        keyboardHeight
      })
      if (keyboardHeight > 0) {
        this.setData({
          contentHeight: `calc(100% - ${keyboardHeight}px + ${this.data.tabbarHeight}rpx + ${this.data.safeAreaBottom}px)`
        })
        setTimeout(() => {
          this.scrollToBottom()
        }, 400);
      } else {
        this.setData({
          contentHeight: '100%'
        })
      }
    },
    onInputLineChange() {
      this.scrollToBottom()
    },
     // 滚动到底部（使用锚点方式更稳定）
    scrollToBottom() {
      // 通过切换 intoViewId 触发滚动，避免相同值不生效
      this.setData({ intoViewId: '' })
      setTimeout(() => {
        this.setData({ intoViewId: 'bottom-anchor' })
      }, 0)
    },
    hideTabbar() {
      this.triggerEvent('hideTabbar')
    },
    showTabbar() {
      this.triggerEvent('showTabbar')
    },
    goRoleInfo() {
      wx.navigateTo({
        url: '/pages/role/role-detail/index'
      })
    }
  }
})
