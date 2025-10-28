import systemInfo from '../../utils/system'
Component({
  lifetimes: {
    attached: function () {
      this.getPageInfo()
    }
  },
  data: {
    msgList: [],
    isLogin: false,
    userInfo: {},
    keyboardHeight: 0,
    contentHeight: '100%',
    safeAreaBottom: 0,
    tabbarHeight: 0,
    intoViewId: 0,
    navHeight: 0,
    safeAreaTop: 0,
    refresherTriggered: false,
    isLoadingMore: false,
    topMsg: null,
    hasMore: true, // 是否还有更多数据
    pullDownStatus: 'pull', // pull: 下拉加载更多, release: 松开加载更多, loading: 加载中, nomore: 没有更多
    scrollAnimation: true, // 是否启用滚动动画
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
    scrollToView(id) {
      // this.setData({ intoViewId: '' })
      setTimeout(() => {
        this.setData({ intoViewId: id })
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
    },
    // 监听下拉动作
    onPulling(e) {
      // 当下拉距离超过阈值时，显示"松开加载更多"
      const threshold = 50
      if (e.detail.dy > threshold && this.data.pullDownStatus === 'pull' && !this.data.isLoadingMore) {
        this.setData({
          pullDownStatus: 'release'
        })
      } else if (e.detail.dy <= threshold && this.data.pullDownStatus === 'release' && !this.data.isLoadingMore) {
        this.setData({
          pullDownStatus: 'pull'
        })
      }
    },
    // 监听恢复动作（取消下拉）
    onRestore() {
      if (!this.data.isLoadingMore && this.data.hasMore) {
        this.setData({
          pullDownStatus: 'pull'
        })
      }
    },
    // 下拉刷新处理
    onLoadMore() {
      // 防止重复加载或没有更多数据
      if (this.data.isLoadingMore || !this.data.hasMore) {
        return
      }
      
      this.setData({
        isLoadingMore: true,
        refresherTriggered: true,
        pullDownStatus: 'loading',
        topMsg: this.data.msgList[0]
      })
      this.triggerEvent('loadMore', {}, { bubbles: true, composed: true })
    },
    // 停止下拉刷新状态（供父组件调用）
    stopRefresh() {
      this.setData({
        refresherTriggered: false,
        isLoadingMore: false,
        pullDownStatus: this.data.hasMore ? 'pull' : 'nomore'
      })
    },
    // 没有更多数据处理
    noMoreHandle() {
      this.setData({
        isLoadingMore: false,
        hasMore: false,
        pullDownStatus: 'nomore',
        refresherTriggered: false
      })
    },
    // 加载更多数据成功
    loadMoreHandle(msgs) {
      // 禁用滚动动画，避免 refresher 复位动画和 scrollToView 动画冲突
      this.setData(
        {
          scrollAnimation: false
        },
        () => {
          this.setData(
            {
              isLoadingMore: false,
              refresherTriggered: false,
              pullDownStatus: this.data.hasMore ? 'pull' : 'nomore',
            },
            () => {
              // 滚动完成后延迟恢复动画，确保位置已固定
              setTimeout(() => {
                this.setData({
                  msgList: [...msgs, ...this.data.msgList]
                })
                this.scrollToView(`msg-${this.data.topMsg.id}`)
                setTimeout(() => {
                  this.setData({ scrollAnimation: true })
                }, 100)
              }, 100)
            }
          )
        }
      )
    },
    // 重置加载状态（供父组件调用，例如切换会话时）
    resetLoadStatus() {
      this.setData({
        hasMore: true,
        pullDownStatus: 'pull',
        isLoadingMore: false,
        refresherTriggered: false
      })
    },
    // 加载完消息
    getMsgListHandle(msgs) {
      this.setData({
        msgList: msgs
      })
      this.scrollToBottom()
    }
  }
})
