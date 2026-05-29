Component({
  data: {
    wxCode: 'XYJG_8647902'
  },
  methods: {
    show() {
      const dialog = this.selectComponent('#dialog')
      dialog.show({
        title: '添加微信客服',
        hideTopIcon: true,
        content: '',
        cancelText: '关闭',
        confirmText: ''
      })
    },
    hide() {
      this.selectComponent('#dialog').hide()
    },
    copyAction() {
      wx.setClipboardData({
        data: this.data.wxCode,
        success: () => {
          wx.showToast({
            title: '已复制到粘贴板',
            icon: 'none'
          })
        }
      })
    }
  }
})
