export default [
  {
    img: '/static/tabbar/yf.svg',
    activeImg: '/static/tabbar/yf-active.svg',
    text: '缘分',
    url: '/pages/home/home'
  },
  {
    img: '/static/tabbar/fx.svg',
    activeImg: '/static/tabbar/fx-active.svg',
    text: '发现',
    url: '/pages/discover/index'
  },
  {
    img: '',
    icon: 'add-circle',
    text: '',
    url: '/pages/role/add/index',
    isNavigate: true  // 标记这个按钮使用 navigateTo 而不是 switchTab
  },
  {
    img: '/static/tabbar/xx.svg',
    activeImg: '/static/tabbar/xx-active.svg',
    text: '聊天',
    url: '/pages/chat-list/index'
  },
  {
    img: '/static/tabbar/wd.svg',
    activeImg: '/static/tabbar/wd-active.svg',
    text: '我的',
    url: '/pages/usercenter/index'
  }
]
