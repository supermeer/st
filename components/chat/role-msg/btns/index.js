import { ttsMessage } from '../../../../services/tts/index'
Component({
  properties: {
    btns: Array,
    message: Object,
    disabled: {
      type: Boolean,
      value: false
    },
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
  observers: {
    'message.loading': function (newVal, oldVal) {
      if (newVal === false && oldVal === true) {
        if (wx.getStorageSync('autoPlayAudio') === 'true') {
          this.playAudio()
        }
      }
    },
  },
  data: {
    showTip: false,
    isPlaying: false,
    audioUrl: null
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
    async playAudio() {
      if (!this.properties.message.id) {
        return
      }
      let audioUrl = this.data.audioUrl || this.properties.message.audioUrl
      if (!audioUrl) {
        audioUrl = await ttsMessage({messageId: this.properties.message.id})
        this.setData({
          audioUrl
        })
      }

      this.setData({
        isPlaying: true
      })
      const innerAudioContext = wx.createInnerAudioContext({
        useWebAudioImplement: true
      })
      innerAudioContext.src = audioUrl
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
