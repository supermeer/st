import TabMenu from './data'

Component({
  data: {
    active: 0,
    defaultColor: '#aaa',
    activeColor: '#fff',
    list: TabMenu,
    visible: true,
    sliderPosition: {
      x: 0,
      width: 0,
      radius: 24,
      scaleX: 1
    },
    // 拦截器 判断是否可以跳转
    interceptor: null
  },

  lifetimes: {
    attached() {}
  },

  onLoad() {
    this.init()
  },

  methods: {
    setInterceptor(interceptor) {
      this.setData({ interceptor })
    },

    onChange(event) {
      const index = event.currentTarget.dataset.id
      const item = this.data.list[index]
      // if (this.data.interceptor && !this.data.interceptor()) {
      //   return
      // }
      
      // 根据配置决定使用哪种跳转方式
      if (item.isNavigate) {
        wx.navigateTo({ url: item.url })
      } else {
        wx.switchTab({ url: item.url })
      }
    },

    // 初始化方法
    init() {
      const page = getCurrentPages().pop()
      const route = page ? page.route.split('?')[0] : ''
      const active = this.data.list.findIndex(
        (item) =>
          (item.url.startsWith('/') ? item.url.substr(1) : item.url) ===
          `${route}`
      )
      // 如果找到匹配的 tab，更新高亮状态（>=0 表示找到了）
      if (active >= 0) {
        this.setData({ active })
      }
    },
    hide() {
      this.setData({ visible: false })
    },
    show() {
      this.setData({ visible: true })
    }
  }
})
