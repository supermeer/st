Component({
  properties: {
    btns: Array,
    disabled: {
      type: Boolean,
      value: false
    },
    audioUrl: String,
    isLatest: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    attached: function () {
      const tipMark = wx.getStorageSync('tipMark')
      this.setData({
        showTip: !tipMark
      })
    }
  },
  data: {
    showTip: false,
    isPlaying: false
  },
  methods: {
    onBtnClick(e) {
      // 直接触发事件，让父组件 role-msg 统一处理 disabled 逻辑
      const action = e.currentTarget.dataset.action;
      if (action === 'play') {
        this.playAudio()
        return
      }
      this.triggerEvent('buttonClick', { action, current: this });
    },
    playAudio() {
      if (!this.properties.audioUrl) {
        return
      }
      this.setData({
        isPlaying: true
      })
      const innerAudioContext = wx.createInnerAudioContext({
        useWebAudioImplement: true
      })
      innerAudioContext.src = this.properties.audioUrl
      innerAudioContext.play() // 播放
      innerAudioContext.onEnded(() => {
        this.setData({
          isPlaying: false
        })
        innerAudioContext.destroy()
      })
      // innerAudioContext.pause() // 暂停
      // innerAudioContext.stop() // 停止
      // innerAudioContext.destroy()
    },
    closeTip() {
      this.setData({
        showTip: false
      })
      wx.setStorageSync('tipMark', true)
    }
  }
})