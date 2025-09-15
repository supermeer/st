import userStore from '../../../store/user'
import ChatService from '../../../services/ai/chat'

const marked = require('../../../miniprogram_npm/marked/index.js')
Page({
  data: {
    showOpenVipDialog: false,
    msgForm: {
      userMessage: '',
      imageList: []
    },
    messageList: [
      // {
      //   role: 'assistant',
      //   content: '你好，我是你的智能助手，有什么可以帮你的吗？',
      //   time: new Date().getTime(),
      //   loading: false,
      //   htmlContent: '<p>你好，我是你的智能助手，有什么可以帮你的吗？</p>'
      // }
    ],
    inputValue: '', // 输入框的值
    loading: false, // 是否正在加载
    intoViewId: '', // 用于锚点滚动的目标id
    sessionId: '', // 会话ID
    streamTask: null, // 流式请求任务
    isLoading: false, // 是否正在加载
    keyboardHeight: 0 // 键盘高度（px）
  },

  onLoad(options) {
    this.setData({ sessionId: options.sessionId })
    const content = wx.getStorageSync('commentContent')
    const imageKeys = wx.getStorageSync('imageKeys')
    const images = wx.getStorageSync('imageList') || []
    const rateScore = wx.getStorageSync('rateScore')
    if (!options.isCreate || (!content && !imageKeys.length)) {
      this.loadSessionDetail(options.sessionId)
    } else {
      this.setData({
        messageList: [
          {
            senderType: 1,
            content,
            images,
            loading: false
          }
        ],
        msgForm: {
          userMessage: content,
          imageList: imageKeys,
          rateScore: rateScore || undefined
        }
      })
      this.sendMessage()
    }
  },

  onShow() {},

  onReady() {},

  onResize() {},

  onUnload() {
    // 移除键盘高度监听
    if (wx.offKeyboardHeightChange && this._keyboardHeightListener) {
      wx.offKeyboardHeightChange(this._keyboardHeightListener)
    }
  },
  copyContent(e) {
    const index = e.currentTarget.dataset.index
    wx.setClipboardData({
      data: this.data.messageList[index].content
    })
  },
  resend(e) {
    const index = e.currentTarget.dataset.index
    const message = this.data.messageList[index]
    this.setData({
      msgForm: {
        userMessage: message.content,
        imageList: message.images,
        rateScore: message.rateScore
      }
    })
    this.sendMessage()
  },
  // 加载会话详情
  loadSessionDetail(sessionId) {
    wx.showLoading({ title: '加载中...' })

    ChatService.getSessionDetail(sessionId)
      .then((res) => {
        if (res) {
          // 处理每条消息，将markdown转换为HTML
          const messages = res.map((msg) => {
            if (msg.senderType === 2 && msg.content) {
              return {
                ...msg,
                htmlContent: marked(msg.content)
              }
            }
            return msg
          })
          this.setData({ messageList: messages })
          this.scrollToBottom()
        }
      })
      .catch((err) => {
        wx.showToast({
          title: '加载历史记录失败',
          icon: 'none',
          duration: 2000
        })
      })
      .finally(() => {
        wx.hideLoading()
      })
  },

  // 输入框行数变化（auto-height）时触发
  onInputLineChange(e) {
    // e.detail = { height, lineCount }
    // 输入框变高时，保持消息区域自动滚动到底部，避免底部消息被遮挡
    this.scrollToBottom()
  },
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  sendAction() {
    if (this.data.inputValue.trim() === '') {
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      msgForm: {
        userMessage: this.data.inputValue
      },
      messageList: [
        ...this.data.messageList,
        {
          senderType: 1,
          content: this.data.inputValue
        }
      ]
    })
    this.sendMessage()
  },
  // 发送消息
  sendMessage() {
    if (this.data.isLoading) return
    this.setData({
      isLoading: true
    })
    const newMessage = {
      senderType: 2,
      content: '',
      htmlContent: '',
      error: false,
      loading: true
    }
    this.setData({
      messageList: [...this.data.messageList, newMessage]
    })

    this.scrollToBottom()
    const service = ChatService.sendMessage(
      {
        chatId: this.data.sessionId,
        ...this.data.msgForm
      },
      (eventData) => {
        const msg = eventData.payload.msg
        const latestMessage =
          this.data.messageList[this.data.messageList.length - 1]
        if (!latestMessage.loading) {
          const newMessage = {
            senderType: 2,
            content: msg,
            htmlContent: marked(msg),
            loading: true
          }
          this.setData({
            messageList: [...this.data.messageList, newMessage]
          })
        } else {
          latestMessage.content += msg
          latestMessage.htmlContent = marked(latestMessage.content)
          this.setData({
            messageList: this.data.messageList
          })
        }
        // this.scrollToBottom()
      }
    )
      .then((res) => {
        this.setData({
          inputValue: ''
        })
        wx.removeStorage('commentContent')
        wx.removeStorage('imageKeys')
        wx.removeStorage('imageList')
        wx.removeStorage('rateScore')
      })
      .catch((err) => {
        // const latestMessage =
        //   this.data.messageList[this.data.messageList.length - 1]
        // latestMessage.error = true
        // latestMessage.content = err.msg
        // latestMessage.htmlContent = marked(err.msg)
        // latestMessage.errorCode = err.code
        this.setData({
          // 去除回复消息
          messageList: [...this.data.messageList.slice(0, -1)]
        })

        setTimeout(() => {
          const lastUserMsg =
            this.data.messageList[this.data.messageList.length - 1]
          lastUserMsg.error = true
          // lastUserMsg.content = err && err.msg ? err.msg : '获取回复失败，请稍后重试'
          lastUserMsg.errorCode = err && err.code ? err.code : null
          if (err && err.code === 402) {
            this.setData({
              showOpenVipDialog: true,
              msgForm: {
                userMessage: lastUserMsg.content
              },
              messageList: this.data.messageList
            })
          }
        }, 100)
      })
      .finally(() => {
        const latestMessage =
          this.data.messageList[this.data.messageList.length - 1]
        latestMessage.loading = false
        this.setData({
          isLoading: false,
          messageList: this.data.messageList
        })
        userStore.refreshVipInfo()
        this.scrollToBottom()
      })
  },

  // 滚动到底部（使用锚点方式更稳定）
  scrollToBottom() {
    // 通过切换 intoViewId 触发滚动，避免相同值不生效
    this.setData({ intoViewId: '' })
    setTimeout(() => {
      this.setData({ intoViewId: 'bottom-anchor' })
    }, 0)
  },

  // 输入框聚焦
  onInputFocus() {
    // 聚焦后延时滚动，确保键盘动画完成
    setTimeout(() => {
      this.scrollToBottom()
    }, 150)
  },

  onKeyboardHeightChange(e) {
    setTimeout(() => {
      this.setData({
        keyboardHeight: e.detail.height || 0
      })
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    }, e.detail.duration || 0)
  },
  onOpenVip() {
    wx.navigateTo({
      url: '/pages/vip/packages/index'
    })
    this.setData({
      showOpenVipDialog: false
    })
  },
  onCancel() {
    this.setData({
      showOpenVipDialog: false
    })
  }
})
