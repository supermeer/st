// 导入系统信息工具
import systemInfo from '../../utils/system'

Component({
  options: {
    multipleSlots: true // 启用多slot支持
  },
  properties: {
    // 标题
    title: {
      type: String,
      value: ''
    },
    customLeft: {
      type: Boolean,
      value: false
    },
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      value: true
    },
    showLeftLogo: {
      type: Boolean,
      value: false
    },
    // 自定义返回按钮图标
    backIcon: {
      type: String,
      value: '/static/icons/back.png'
    },
    // 是否显示首页按钮
    showHome: {
      type: Boolean,
      value: false
    },
    // 自定义首页按钮图标
    homeIcon: {
      type: String,
      value: '/static/icons/home.png'
    },
    // 是否透明背景
    transparent: {
      type: Boolean,
      value: true
    },
    // 自定义背景色
    bgColor: {
      type: String,
      value: ''
    },
    // 标题颜色
    titleColor: {
      type: String,
      value: '#000000'
    },
    // 自定义左侧插槽宽度，默认与右侧胶囊按钮同宽
    leftSlotWidth: {
      type: Number,
      value: 87
    }
  },

  data: {
    statusBarHeight: 20,
    navContentHeight: 44,
    navHeight: 64,
    menuButtonWidth: 87,
    menuButtonInfo: null
  },

  lifetimes: {
    attached: function () {
      this.initNavigation()
    }
  },

  methods: {
    // 初始化导航栏
    initNavigation: function () {
      try {
        // 从全局获取导航栏信息
        const navInfo = systemInfo.getNavInfo()

        if (navInfo) {
          // 使用全局导航栏信息
          this.setData({
            statusBarHeight: navInfo.statusBarHeight,
            navHeight: navInfo.navHeight,
            menuButtonInfo: navInfo.menuButtonInfo,
            // 计算内容区高度（导航高度减去状态栏高度）
            navContentHeight: navInfo.navHeight - navInfo.statusBarHeight,
            // 胶囊按钮宽度
            menuButtonWidth:
              this.properties.leftSlotWidth ||
              (navInfo.menuButtonInfo ? navInfo.menuButtonInfo.width + 8 : 87)
          })
        } else {
          // fallback到原有逻辑
          const systemInfoSync = wx.getSystemInfoSync()
          const statusBarHeight = systemInfoSync.statusBarHeight
          const navContentHeight = 44
          const navHeight = statusBarHeight + navContentHeight

          this.setData({
            statusBarHeight: statusBarHeight,
            navContentHeight: navContentHeight,
            navHeight: navHeight,
            menuButtonWidth: this.properties.leftSlotWidth || 87
          })
        }
      } catch (e) {
        console.error('获取导航栏信息失败', e)
      }
    },

    // 返回上一页
    onBack: function () {
      this.triggerEvent('back')
      wx.navigateBack({
        delta: 1
      })
    },

    // 返回首页
    onHome: function () {
      this.triggerEvent('home')
      wx.switchTab({
        url: '/pages/home/home'
      })
    }
  }
})
