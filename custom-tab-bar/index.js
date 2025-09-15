import TabMenu from './data'

Component({
  data: {
    active: 0,
    list: TabMenu,
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
      if (this.data.interceptor && !this.data.interceptor()) {
        return
      }
      wx.switchTab({ url: this.data.list[index].url })
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
      this.setData({ active })
    }
  }
})
