import userStore from '../../store/user'
Page(
  Object.assign({}, userStore.data, {
    data: {
    },
    onLoad: function () {
      userStore.bind(this)
    },
    onShow: function () {
      // 更新 tabBar 高亮状态
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().init()
      }
    }
  })
)
