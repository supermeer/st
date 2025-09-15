import { getCategoryList } from '../../services/home/home'
import userStore from '../../store/user'
// pages/home/home.js
Page(
  Object.assign({}, userStore.data, {
    data: {
      isLogin: false,
      currentCategoryId: '',
      currentCategoryDesc: '',
      currentCategoryCode: '',
      categoryList: [],
      categoryItemList: [],
      historyCategoryMap: []
    },
    onLoad: function () {
      userStore.bind(this)
    },
    onShow: function () {
      this.getTabBar().setInterceptor(() => {
        if (!this.data.isLogin) {
          this.goLogin()
          return false
        }
        return true
      })
      this.getTabBar().init()
      if (!this.data.categoryList.length) {
        this.initCategoryData()
      }
      userStore.refreshVipInfo()
      // 判断是否已登录，未登录则显示弹窗
      const token = wx.getStorageSync('token')
      const phone = wx.getStorageSync('user')?.phone
      if (!token || !phone) {
        this.setData({ isLogin: false })
        const authRef =
          this.selectComponent('auth') || this.selectComponent('#auth')
        authRef && authRef.login()
        return
      }
      // 已登录则初始化数据
      this.setData({ isLogin: true })
    },

    // 显式点击登录按钮
    goLogin() {
      const authRef =
        this.selectComponent('auth') || this.selectComponent('#auth')
      authRef && authRef.showPhoneLogin()
    },

    // 初始化分类数据
    initCategoryData: function () {
      getCategoryList().then((res) => {
        this.setData({
          categoryList: res || []
        })
        this.getCategoryItemList(this.data.categoryList[0].id)
        this.setData({
          currentCategoryId: this.data.categoryList[0].id,
          currentCategoryDesc: this.data.categoryList[0].description,
          currentCategoryCode: this.data.categoryList[0].code
        })
      })
    },
    getCategoryItemList(id) {
      if (this.data.historyCategoryMap[id]) {
        this.setData({
          categoryItemList: this.data.historyCategoryMap[id]
        })
        return
      }
      getCategoryList({ parentId: id }).then((res) => {
        this.data.historyCategoryMap[id] = res || []
        this.setData({
          categoryItemList: res || []
        })
      })
    },
    loginSuccess() {
      if (this.data.userInfo.phone) {
        this.setData({
          isLogin: true
        })
      }
      this.initCategoryData()
    },

    // Tab切换事件
    onTabsChange(e) {
      this.getCategoryItemList(e.detail.value)
      const currentCategory = this.data.categoryList.find(
        (item) => item.id === e.detail.value
      )
      this.setData({
        currentCategoryId: e.detail.value,
        currentCategoryDesc: currentCategory.description,
        currentCategoryCode: currentCategory.code
      })
    },
    // 分享按钮点击事件
    onShareClick() {
      this.shareDialogRef = this.selectComponent('#share-dialog')
      this.shareDialogRef.show()
    },
    // 确认分享弹窗
    confirmShareDialog() {
      this.selectComponent('#share-dialog').close()
    },
    // 关闭分享弹窗
    closeShareDialog() {
      this.shareDialogRef.hide()
    },

    // Tab点击事件
    onTabsClick(e) {
      console.log('onTabsClick', e.detail)
    },

    // 跳转到分类详情
    navToCategoryDetail(e) {
      if (!this.data.isLogin) {
        this.goLogin()
        return
      }
      const currentCategory = this.data.categoryItemList.find(
        (item) => item.id == e.currentTarget.dataset.id
      )
      if (!currentCategory) {
        return
      }
      if (this.data.currentCategoryCode === 'XieBaoWen') {
        wx.navigateTo({
          url: `/pages/contentadd/blog/index?id=${currentCategory.id}&title=${currentCategory.name}`
        })
      } else if (this.data.currentCategoryCode === 'XiePingJia') {
        wx.navigateTo({
          url: `/pages/contentadd/index?id=${currentCategory.id}&code=${currentCategory.code}&title=${currentCategory.name}`
        })
      }
    },

    // VIP点击事件
    vipClick() {
      console.log('VIP点击')
      // 实现VIP点击逻辑
    }
  })
)
