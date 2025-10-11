Component({
    properties: {
      messageList: Array,
      isLogin: Boolean,
      userInfo: Object
    },
    data: {
        inputType: 0, // 0： 默认 1: 文本, 2: 语音
        showInspiration: false, // 是否显示灵感
        inspirationList: [
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？"
        ], // 灵感列表
        showBoard: false,
        inputConfig: {
          maxHeight: 150
        },
        keyboardHeight: 0,
        inputValue: '',
        focus: false, // 控制键盘弹起
    },
    methods: {
        changeInputType(e) {
          const type = e.currentTarget.dataset.type
          this.setData({
            focus: type == 1, // 切换到输入模式时拉起键盘
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
          setTimeout(() => {
            this.setData({
              inputType: type
            })
          }, 13)
        },
        onInputBlur() {
          this.setData({
            inputType: 0,
            focus: false // 收起键盘
          })
          // 手动触发键盘收起事件，确保高度恢复
          this.triggerEvent('keyboardHeightChange', 0)
        },
        onKeyboardHeightChange(e) {
          const keyboardHeight = e.detail.height || 0
          setTimeout(() => {
            this.triggerEvent('keyboardHeightChange', keyboardHeight)
          }, e.detail.duration || 0)
        },
        onInput(e) {
          this.setData({
            inputValue: e.detail.value
          })
        },
        onInputLineChange() {
          this.triggerEvent('inputLineChange')
        },
        showInspiration() {
          if (this.data.showInspiration) {
            this.setData({
              showInspiration: false
            })
            this.triggerEvent('showTabbar')
            return
          }
          this.setData({
            showInspiration: true,
            showBoard: false
          })
          this.triggerEvent('hideTabbar')
        },
        editInspiration(e) {
          const index = e.currentTarget.dataset.index
          this.setData({
            showInspiration: false,
            inputValue: this.data.inspirationList[index]
          })
          this.triggerEvent('showTabbar')
        },
        showBoard() {
          if (this.data.showBoard) {
            this.setData({
              showBoard: false
            })
            this.triggerEvent('showTabbar')
            return
          }
          this.setData({
            showBoard: true,
            showInspiration: false
          })
          this.triggerEvent('hideTabbar')
        },
        restart() {
          this.setData({
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
        },
        uploadImage() {
          this.setData({
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
        },
        storyList() {
          this.setData({
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
        },
        report() {
          this.setData({
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
        }
    }
  })
  