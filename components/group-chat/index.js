import systemInfo from '../../utils/system'
import GroupChatService from '../../services/ai/group-chat'
import {
  feedGroupChunk,
  flushGroupChunk,
  resolveRoleMeta
} from '../../utils/groupChunkParser'
const { formatMessage } = require('../../utils/msgHandler')

Component({
  properties: {
    // { id, name, avatarUrl, roles: [...] }
    groupInfo: {
      type: Object,
      value: {}
    },
    showBack: {
      type: Boolean,
      value: false
    }
  },
  pageLifetimes: {
    show() {
      this.getPageInfo()
      this.setData({
        keepFullScreen: wx.getStorageSync('alwaysFullScreen') === 'true'
      })
      this.setData({ keyboardHeight: 0, contentHeight: '100%' })
      if (wx && wx.onKeyboardHeightChange) {
        if (this._keyboardHeightListener && wx.offKeyboardHeightChange) {
          wx.offKeyboardHeightChange(this._keyboardHeightListener)
        }
        this._keyboardHeightListener = (res) => {
          this.onKeyboardHeightChange({ detail: res.height })
        }
        wx.onKeyboardHeightChange(this._keyboardHeightListener)
      }
    },
    hide() {
      if (this._keyboardHeightListener && wx && wx.offKeyboardHeightChange) {
        wx.offKeyboardHeightChange(this._keyboardHeightListener)
      }
    }
  },
  data: {
    keepFullScreen: false,
    roles: [],
    activeRoleId: '',
    msgList: [],
    latestMsgId: null,
    keyboardHeight: 0,
    contentHeight: '100%',
    safeAreaBottom: 0,
    navHeight: 0,
    safeAreaTop: 0,
    intoViewId: 0,
    refresherTriggered: false,
    isLoadingMore: false,
    hasMore: true,
    scrollAnimation: true,
    isGenerating: false,
    userScrolled: false,
    _isAutoScrolling: false,
    // 分页
    pagination: { size: 10, current: 1 }
  },
  methods: {
    onBack() {
      if (this.properties.showBack === false) {
        wx.switchTab({ url: '/pages/home/home' })
        return
      }
      wx.navigateBack()
    },

    getPageInfo() {
      const pageInfo = systemInfo.getPageInfo()
      this.setData({
        safeAreaTop: pageInfo.safeAreaTop,
        navHeight: pageInfo.navHeight,
        safeAreaBottom: pageInfo.safeAreaBottom
      })
    },

    initGroup() {
      const { roles = [], name = '群聊' } = this.properties.groupInfo || {}
      this.setData({ roles })
      this.triggerEvent('currentBgChange', { bg: '' })
    },

    onRoleTap(e) {
      const { id, name } = e.detail || {}
      // 点击角色：跳到该角色对应的剧情/详情；这里先 toast 占位
      wx.showToast({ title: `${name}`, icon: 'none' })
    },

    onKeyboardHeightChange(e) {
      const keyboardHeight =
        typeof e.detail === 'number' ? e.detail : e.detail.keyboardHeight || 0
      this.setData({ keyboardHeight })
      if (keyboardHeight > 0) {
        setTimeout(() => this.scrollToBottom(true), 400)
      }
    },

    onInputLineChange() {
      this.scrollToBottom()
    },

    scrollToBottom(force = false) {
      const now = Date.now()
      if (!force) {
        if (this._lastAutoScrollTime && now - this._lastAutoScrollTime < 120) {
          return
        }
        if (this._isAutoScrolling) return
      }
      this._lastAutoScrollTime = now
      this._isAutoScrolling = true
      this.setData({ intoViewId: '' })
      this._autoScrollTimer = setTimeout(() => {
        this.setData({ intoViewId: 'bottom-anchor' })
        this._resetAutoScrollFlagTimer = setTimeout(() => {
          this._isAutoScrolling = false
          this._resetAutoScrollFlagTimer = null
        }, 300)
      }, 0)
    },

    onScroll(e) {
      const { scrollTop, scrollHeight } = e.detail
      if (!this._scrollViewHeight) {
        const query = this.createSelectorQuery()
        query
          .select('.message-list')
          .boundingClientRect()
          .exec((res) => {
            if (res && res[0]) {
              this._scrollViewHeight = res[0].height
              this._handleScrollState(scrollTop, scrollHeight)
            }
          })
      } else {
        this._handleScrollState(scrollTop, scrollHeight)
      }
    },

    _handleScrollState(scrollTop, scrollHeight) {
      const viewHeight = this._scrollViewHeight || 500
      const isScrollable = scrollHeight > viewHeight + 1
      if (!isScrollable) return
      const last = typeof this._lastScrollTop === 'number' ? this._lastScrollTop : scrollTop
      const delta = scrollTop - last
      this._lastScrollTop = scrollTop
      if (this._isAutoScrolling) return
      if (this.data.isGenerating) {
        const distanceToBottom = scrollHeight - scrollTop - viewHeight
        if (distanceToBottom > 150 && !this.data.userScrolled) {
          this.setData({ userScrolled: true })
        }
      }
      if (Math.abs(delta) > 5 && delta > 0 && this._pendingMaskEnable) {
        // 顶部蒙版占位逻辑，群聊暂不实现
      }
    },

    /**
     * 用户点击发送
     * 复用现有 input-box 的 sendMessage 事件格式：{ content, imageList }
     */
    sendMessage(e) {
      const { content, imageList = [] } = e.detail || {}
      if (!content && (!imageList || imageList.length === 0)) return
      this.setData({ userScrolled: false })

      // 先 push 用户消息
      const userMsg = {
        id: `u_${Date.now()}`,
        senderType: 1,
        content,
        images: (imageList || []).map((i) => i.localUrl || i.url),
        time: Date.now()
      }
      this.setData({ msgList: [...this.data.msgList, userMsg] })
      this.scrollToBottom()

      this._startStream({ content, imageList })
    },

    /**
     * 启动群聊流式请求
     */
    _startStream({ content, imageList }) {
      // 流式状态：把 isGenerating 设为 true
      this.setData({ isGenerating: true })

      // 解析器状态保存在 this._parserState 中
      this._parserState = { buffer: '', currentRole: null }

      // 防抖刷新
      let updateTimer = null
      let pendingUpdate = false
      const flushUpdate = () => {
        if (pendingUpdate) {
          this.setData({ msgList: this.data.msgList })
          pendingUpdate = false
        }
      }
      const scheduleUpdate = () => {
        if (!updateTimer) {
          updateTimer = setTimeout(() => {
            flushUpdate()
            updateTimer = null
          }, 50)
        }
        pendingUpdate = true
      }

      // 把一段已"闭合"的某角色消息真正落地到 msgList
      const appendCompletedRole = ({ roleName, content: text }) => {
        const meta = resolveRoleMeta(this.data.roles, roleName)
        const aiMsg = {
          id: `a_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          senderType: 2,
          content: text,
          htmlContent: formatMessage(text || ''),
          thinkContent: '',
          thinkHtmlContent: '',
          mainContent: text || '',
          hasThinking: false,
          isThinking: false,
          loading: false,
          error: false,
          time: Date.now(),
          // 群聊专有字段
          roleMeta: meta,
          roleName: meta.name,
          avatarUrl: meta.avatarUrl,
          groupRoleId: meta.id
        }
        this.setData({ msgList: [...this.data.msgList, aiMsg] })
        // 标记当前正在说话的角色（用于底部 role-bar 高亮）
        if (meta.id) {
          this.setData({ activeRoleId: meta.id })
        }
      }

      GroupChatService.sendMessage(
        {
          groupId: this.properties.groupInfo.id,
          userMessage: content || '',
          imageList: (imageList || []).map((i) => i.fileKey || i.localUrl)
        },
        (eventData) => {
          const payload = eventData && eventData.payload
          if (!payload) return
          const { type, msg } = payload

          if (type === 'text') {
            // 群聊：每次 chunk 都喂给解析器，解析器可能吐出多条已闭合的角色消息
            const { state, completed } = feedGroupChunk(this._parserState, msg)
            this._parserState = state
            completed.forEach(appendCompletedRole)
          } else if (type === 'thinking') {
            // 思考过程：可以挂到最后一条 AI 消息上（如果存在）
            const last = this.data.msgList[this.data.msgList.length - 1]
            if (last && last.senderType === 2) {
              last.thinkContent = (last.thinkContent || '') + (msg || '')
              last.thinkHtmlContent = formatMessage(last.thinkContent || '')
              last.isThinking = true
              last.hasThinking = true
              scheduleUpdate()
            }
          } else if (type === 'roleStart') {
            // 后端主动告知下一个发言角色：{ roleId }
            if (msg) {
              this.setData({ activeRoleId: msg })
            }
          } else if (type === 'aiMessageId' || type === 'userMessageId') {
            // 单聊里的 ID 同步，群聊可暂时忽略
          }

          if (!this.data.userScrolled) this.scrollToBottom()
        }
      )
        .then(() => {
          if (updateTimer) {
            clearTimeout(updateTimer)
            updateTimer = null
          }
          flushUpdate()
          // 把 buffer 中剩余的最后一段也补上
          const tail = flushGroupChunk(this._parserState)
          tail.forEach(appendCompletedRole)
          this._parserState = { buffer: '', currentRole: null }

          // 关闭"生成中"标志（按"还有任何消息在 loading"判断；
          // 群聊里 addAIMessage 已经把 loading 设为 false，这里直接结束即可）
          this.setData({ isGenerating: false, activeRoleId: '' })
          setTimeout(() => this.scrollToBottom(true), 50)
        })
        .catch((err) => {
          if (updateTimer) clearTimeout(updateTimer)
          this.setData({ isGenerating: false, activeRoleId: '' })
          if (err && err.code === 402) {
            const dialog = this.selectComponent('#pointsRechargeDialog')
            dialog && dialog.show()
          } else {
            wx.showToast({ title: '群聊暂时不可用', icon: 'none' })
          }
        })
    },

    onButtonClick() {
      // 群聊场景暂不实现回溯 / 重说等高级按钮
    },

    onFreeCopy() {},
    hideFreeCopy() {}
  },

  lifetimes: {
    attached() {
      this.initGroup()
    }
  }
})