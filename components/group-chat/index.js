import systemInfo from '../../utils/system'
import GroupChatService, {
  getPlotMessage
} from '../../services/ai/group-chat'
import { resolveRoleMeta } from '../../utils/groupChunkParser'
const { formatMessage } = require('../../utils/msgHandler')

Component({
  properties: {
    // { id, name, avatarUrls, characterIds, roles: [...], plotId }
    groupInfo: {
      type: Object,
      value: {}
    },
    showBack: {
      type: Boolean,
      value: false
    }
  },
  observers: {
    'groupInfo.roles'(roles) {
      if (Array.isArray(roles)) {
        this.setData({ roles: roles.map((r) => ({ ...r })) })
      }
    },
    'groupInfo.plotId': function (newVal) {
      if (newVal) {
        this.setData({
          chatDetail: {
            ...this.data.chatDetail,
            plotId: newVal
          },
          'pagination.plotId': newVal
        })
        this.resetPagination()
        this.getMessageList()
      } else {
        this.setData({
          pagination: {
            size: 10,
            current: 1,
            plotId: null
          },
          chatDetail: {
            ...this.data.chatDetail,
            plotId: null
          },
          msgList: []
        })
      }
    }
  },
  pageLifetimes: {
    show() {
      console.log(this.properties.groupInfo, '=======')
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
    chatDetail: {
      plotId: null,
      updateTime: null
    },
    // 分页
    pagination: { size: 10, current: 1, plotId: null }
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
    async sendMessage(e) {
      const { content, imageList = [] } = e.detail || {}
      if (!content && (!imageList || imageList.length === 0)) return

      // 首次发送时，若还没有 plotId，则先创建一个群聊剧情
      if (!this.data.chatDetail.plotId) {
        try {
          const plotId = await GroupChatService.createPlot({
            groupId: this.properties.groupInfo.id
          })
          this.setData({
            chatDetail: {
              ...this.data.chatDetail,
              plotId: plotId
            },
            'pagination.plotId': plotId
          })
        } catch (err) {
          console.error('[group-chat] createPlot failed:', err)
          wx.showToast({ title: '创建剧情失败', icon: 'none' })
          return
        }
      }

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
     * 把一个 speaker_start 推送成"待填充"的占位 AI 消息，并加入 msgList
     */
    _pushSpeakerPlaceholder({ speakerId, speakerName }) {
      const meta = resolveRoleMeta(this.data.roles, speakerName || speakerId)
      const aiMsg = {
        id: speakerId || `a_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        senderType: 2,
        content: '',
        htmlContent: '',
        thinkContent: '',
        thinkHtmlContent: '',
        mainContent: '',
        hasThinking: false,
        isThinking: false,
        loading: true,
        error: false,
        time: Date.now(),
        // 群聊专有字段
        roleMeta: meta,
        roleName: meta.name,
        avatarUrl: meta.avatarUrl,
        groupRoleId: meta.id
      }
      this.setData({
        msgList: [...this.data.msgList, aiMsg],
        activeRoleId: meta.id || speakerId || ''
      })
    },

    /**
     * 启动群聊流式请求
     *
     * 流式事件约定（后端单次返回内可能有多个发言者）：
     *   { eventType: 'speaker_start', msg: { speakerId, name } }   群成员开始说话
     *   { eventType: 'text',          msg: '增量正文' }             累加到当前说话者
     *   { eventType: 'thinking',      msg: '增量思考' }             累加到当前说话者的思考段
     *   { eventType: 'speaker_end',   msg: { speakerId } }          群成员说话结束（标记 loading=false）
     *   { eventType: 'aiMessageId',   msg: 'xxx' }                 可选：覆盖占位消息的 id
     *   { eventType: 'userMessageId', msg: 'xxx' }                 可选：覆盖用户消息的 id
     *   { eventType: 'modelStatus',   msg: { modelId, status } }   模型状态
     */
    _startStream({ content, imageList }) {
      this.setData({ isGenerating: true })

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

      // 当前正在说话的角色对应的 msgList 下标
      let currentSpeakerIdx = -1

      const resolveSpeakerInfo = (raw) => {
        // msg 可能是字符串（speakerId）或对象 { speakerId, name }
        if (raw && typeof raw === 'object') {
          return {
            speakerId: raw.speakerId || raw.id || raw.roleId || '',
            name: raw.name || raw.roleName || ''
          }
        }
        return { speakerId: raw || '', name: '' }
      }

      GroupChatService.sendMessage(
        {
          groupId: this.properties.groupInfo.id,
          userMessage: content || '',
          imageList: (imageList || []).map((i) => i.fileKey || i.localUrl),
          plotId: this.data.chatDetail.plotId
        },
        (eventData) => {
          const payload = eventData && eventData.payload
          if (!payload) return
          // 兼容后端可能用 eventType 或 type
          const eventType = payload.eventType || payload.type
          const { msg } = payload

          if (eventType === 'speaker_start') {
            const { speakerId, name } = resolveSpeakerInfo(msg)
            this._pushSpeakerPlaceholder({ speakerId, speakerName: name })
            currentSpeakerIdx = this.data.msgList.length - 1
          } else if (eventType === 'text') {
            // 把增量文本追加到当前说话者；若还没有 speaker_start 兜底建一个
            if (currentSpeakerIdx < 0) {
              this._pushSpeakerPlaceholder({ speakerId: '', speakerName: '' })
              currentSpeakerIdx = this.data.msgList.length - 1
            }
            const cur = this.data.msgList[currentSpeakerIdx]
            if (cur && cur.senderType === 2) {
              cur.content = (cur.content || '') + (msg || '')
              cur.mainContent = cur.content
              cur.htmlContent = formatMessage(cur.content || '')
              cur.isThinking = false
              scheduleUpdate()
            }
          } else if (eventType === 'thinking') {
            // 思考过程：挂到当前说话者（如果存在）
            const target =
              currentSpeakerIdx >= 0
                ? this.data.msgList[currentSpeakerIdx]
                : this.data.msgList[this.data.msgList.length - 1]
            if (target && target.senderType === 2) {
              target.thinkContent = (target.thinkContent || '') + (msg || '')
              target.thinkHtmlContent = formatMessage(target.thinkContent || '')
              target.isThinking = true
              target.hasThinking = true
              scheduleUpdate()
            }
          } else if (eventType === 'speaker_end') {
            const { speakerId } = resolveSpeakerInfo(msg)
            // 优先按 speakerId 匹配；否则就关闭最近一个仍在 loading 的 AI 消息
            let targetIdx = -1
            if (speakerId) {
              targetIdx = this.data.msgList.findIndex(
                (m) => m.senderType === 2 && m.loading && m.id === speakerId
              )
            }
            if (targetIdx < 0) {
              for (let i = this.data.msgList.length - 1; i >= 0; i--) {
                const m = this.data.msgList[i]
                if (m.senderType === 2 && m.loading) {
                  targetIdx = i
                  break
                }
              }
            }
            if (targetIdx >= 0) {
              this.data.msgList[targetIdx].loading = false
              this.data.msgList[targetIdx].isThinking = false
              // 标记下一个追加文本时的"当前说话者"为空
              currentSpeakerIdx = -1
              scheduleUpdate()
            }
          } else if (eventType === 'aiMessageId') {
            // 把最新一条 AI 消息的 id 同步为后端真实 id
            for (let i = this.data.msgList.length - 1; i >= 0; i--) {
              if (this.data.msgList[i].senderType === 2) {
                this.data.msgList[i].id = msg
                break
              }
            }
          } else if (eventType === 'userMessageId' && this.data.msgList.length >= 2) {
            // 把倒数第二条（用户消息）的 id 同步为后端真实 id
            const userMsg = this.data.msgList[this.data.msgList.length - 2]
            userMsg.id = msg
          } else if (eventType === 'modelStatus') {
            // 模型状态：{ modelId, status } —— 群聊暂不弹窗
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

          // 流结束后，确保所有 AI 消息都退出 loading 态
          const list = this.data.msgList.map((m) =>
            m.senderType === 2 && m.loading ? { ...m, loading: false, isThinking: false } : m
          )
          this.setData({
            msgList: list,
            isGenerating: false,
            activeRoleId: ''
          })
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

    // 下拉刷新处理
    onLoadMore() {
      if (this.data.isLoadingMore || !this.data.hasMore) {
        return
      }
      if (!this.data.pagination.plotId) {
        this.noMoreHandle()
        return
      }
      this.setData({
        isLoadingMore: true,
        refresherTriggered: true,
        topMsg: this.data.msgList[0]
      })
      this.loadMoreMessages()
    },
    stopRefresh() {
      this.setData({
        refresherTriggered: false,
        isLoadingMore: false
      })
    },
    noMoreHandle() {
      this.setData({
        isLoadingMore: false,
        hasMore: false,
        refresherTriggered: false
      })
    },
    loadMoreHandle(msgs) {
      const topMsg = this.data.topMsg
      const topMsgId = topMsg && topMsg.id ? topMsg.id : null
      this._isAutoScrolling = true
      this.setData(
        {
          scrollAnimation: false,
          msgList: [...msgs, ...this.data.msgList],
          isLoadingMore: false,
          refresherTriggered: false
        },
        () => {
          if (topMsgId) {
            this.scrollToView(`msg-${topMsgId}`)
          }
          setTimeout(() => {
            this._isAutoScrolling = false
            this.setData({ scrollAnimation: true })
          }, 200)
        }
      )
    },
    resetLoadStatus() {
      this.setData({
        hasMore: true,
        isLoadingMore: false,
        refresherTriggered: false
      })
    },
    getMsgListHandle(msgs) {
      this.setData({ msgList: msgs })
      this.scrollToBottom()
    },
    getMessageList() {
      if (!this.data.pagination.plotId) {
        this.setData({ msgList: [] })
        return
      }
      this.resetPagination()
      getPlotMessage({
        size: this.data.pagination.size,
        current: this.data.pagination.current,
        plotId: this.data.pagination.plotId
      })
        .then((res) => {
          let messageList = []
          if (res && res.records && Array.isArray(res.records)) {
            messageList = res.records
          } else if (Array.isArray(res)) {
            messageList = res
          }
          const formattedMessages = messageList.map((msg) => {
            if (msg.senderType === 2 && msg.content) {
              return {
                ...msg,
                thinkContent: msg.reasoningContent || '',
                thinkHtmlContent: formatMessage(msg.reasoningContent || ''),
                htmlContent: formatMessage(msg.content),
                mainContent: msg.content,
                hasThinking: !!msg.reasoningContent
              }
            }
            return msg
          })
          const pagination = {
            current: res.current || this.data.pagination.current,
            size: res.size || this.data.pagination.size,
            plotId: this.data.pagination.plotId
          }
          const hasMore =
            res.current && res.pages
              ? res.current < res.pages
              : messageList.length >= pagination.size
          this.setData({
            msgList: formattedMessages,
            pagination: pagination,
            hasMore: hasMore
          })
          setTimeout(() => {
            this.scrollToBottom(true)
          }, 100)
        })
        .catch((err) => {
          console.error('[group-chat] 获取消息列表失败:', err)
          this.setData({ msgList: [] })
        })
    },
    loadMoreMessages() {
      if (!this.data.pagination.plotId) {
        this.noMoreHandle()
        return
      }
      const nextPage = this.data.pagination.current + 1
      getPlotMessage({
        size: this.data.pagination.size,
        current: nextPage,
        plotId: this.data.pagination.plotId
      })
        .then((res) => {
          let newMessages = []
          if (res && res.records && Array.isArray(res.records)) {
            newMessages = res.records
          } else if (Array.isArray(res)) {
            newMessages = res
          }
          const formattedMessages = newMessages.map((msg) => {
            if (msg.senderType === 2 && msg.content) {
              return { ...msg, htmlContent: formatMessage(msg.content) }
            }
            return msg
          })
          if (formattedMessages.length === 0) {
            this.noMoreHandle()
          } else {
            const pagination = {
              ...this.data.pagination,
              current: res.current || nextPage,
              size: res.size || this.data.pagination.size
            }
            const hasMore =
              res.current && res.pages
                ? res.current < res.pages
                : formattedMessages.length >= pagination.size
            this.setData({ pagination: pagination, hasMore: hasMore })
            this.loadMoreHandle(formattedMessages)
          }
        })
        .catch((err) => {
          console.error('[group-chat] 加载更多消息失败:', err)
          this.stopRefresh()
        })
    },
    resetPagination() {
      this.setData({
        'pagination.current': 1,
        hasMore: true,
        isLoadingMore: false,
        refresherTriggered: false
      })
    },
    scrollToView(id) {
      setTimeout(() => {
        this.setData({ intoViewId: id })
      }, 0)
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