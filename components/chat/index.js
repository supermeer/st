Component({
  properties: {
    messageList: Array
  },
  data: {
    isLogin: false,
    userInfo: {}
  },
  methods: {
    goLogin() {
      this.setData({ isLogin: true })
    }
  }
})
