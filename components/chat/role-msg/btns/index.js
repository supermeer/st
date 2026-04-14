import { ttsMessage } from '../../../../services/tts/index'

let globalAudioCtx = null
let globalPlayingComp = null
let globalPlayToken = 0


Component({
  properties: {
    btns: Array,
    message: Object,
    roleDetail: Object,
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
    },
    detached: function () {
      if (globalPlayingComp === this && globalAudioCtx) {
        try { globalAudioCtx.stop() } catch (e) {}
        try { globalAudioCtx.destroy() } catch (e) {}
        globalAudioCtx = null
        globalPlayingComp = null
      }
    }
  },
  observers: {
    'message.loading': function (newVal, oldVal) {
      if (newVal === false && this.properties.isLatest) {
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
    // async playAudio() {
    //   if (!this.properties.message.id) {
    //     return
    //   }
    //   let audioUrl = this.data.audioUrl || this.properties.message.audioUrl
    //   if (!audioUrl) {
    //     const { fileUrl } = await ttsMessage({messageId: this.properties.message.id})
    //     audioUrl = fileUrl
    //     this.setData({
    //       audioUrl
    //     })
    //   }

    //   this.setData({
    //     isPlaying: true
    //   })
    //   const innerAudioContext = wx.createInnerAudioContext({
    //     useWebAudioImplement: true
    //   })
    //   innerAudioContext.src = audioUrl
    //   innerAudioContext.play() // 播放
    //   innerAudioContext.onEnded(() => {
    //     this.setData({
    //       isPlaying: false
    //     })
    //     innerAudioContext.destroy()
    //   })
    //   // innerAudioContext.pause() // 暂停
    //   // innerAudioContext.stop() // 停止
    //   // innerAudioContext.destroy()
    // },
    async playAudio() {
      const messageId = this.properties.message.id
      const voiceId = this.properties.roleDetail.userVoiceId || this.properties.roleDetail.voiceId
      if (!messageId || !voiceId) return

      const myToken = ++globalPlayToken

      // 如果点的是正在播放的这条：当作“停止”
      if (globalPlayingComp === this && globalAudioCtx) {
        try { globalAudioCtx.stop() } catch (e) {}
        try { globalAudioCtx.destroy() } catch (e) {}
        globalAudioCtx = null
        globalPlayingComp = null
        this.setData({ isPlaying: false })
        return
      }

      // 播放新条目前：停止/销毁旧的，并复位旧UI
      if (globalAudioCtx) {
        try { globalAudioCtx.stop() } catch (e) {}
        try { globalAudioCtx.destroy() } catch (e) {}
        globalAudioCtx = null
      }
      if (globalPlayingComp && globalPlayingComp !== this) {
        globalPlayingComp.setData({ isPlaying: false })
      }
      globalPlayingComp = this

      // 获取音频URL（注意：异步，可能乱序返回）
      let audioUrl = this.data.audioUrl || this.properties.message.audioUrl
      if (!audioUrl) {
        const { fileUrl } = await ttsMessage({ messageId })
        // 如果在等待期间用户又点了别的消息，直接放弃（不播放、不抢状态）
        if (myToken !== globalPlayToken) return

        audioUrl = fileUrl
        this.setData({ audioUrl })
      } else {
        // 同样做一次token校验，避免极端情况下状态被旧调用覆盖
        if (myToken !== globalPlayToken) return
      }

      // 开始播放（再校验一次：确保当前组件仍然是“最新播放请求”）
      if (myToken !== globalPlayToken) return
      this.setData({ isPlaying: true })

      const ctx = wx.createInnerAudioContext({ useWebAudioImplement: true })
      globalAudioCtx = ctx
      ctx.src = audioUrl

      const cleanup = () => {
        // 只清理当前这一轮创建的ctx，避免旧回调把新播放干掉
        if (globalAudioCtx === ctx) {
          globalAudioCtx = null
          globalPlayingComp = null
        }
        // 只有当组件还活着，且还是当前组件时再改UI更安全
        try { this.setData({ isPlaying: false }) } catch (e) {}
        try { ctx.destroy() } catch (e) {}
      }

      ctx.onEnded(cleanup)
      ctx.onStop(cleanup)
      ctx.onError(cleanup)

      ctx.play()
    },
    closeTip() {
      this.setData({
        showTip: false
      })
      wx.setStorageSync('tipMark', true)
    }
  }
})
