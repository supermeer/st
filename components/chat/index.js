import systemInfo from '../../utils/system'
import ChatService from '../../services/ai/chat'
const { formatMessage } = require('../../utils/msgHandler')
Component({
  lifetimes: {
    attached: function () {
      this.getPageInfo()
    }
  },
  data: {
    msgList: [],
    isLogin: false,
    userInfo: {},
    keyboardHeight: 0,
    contentHeight: '100%',
    safeAreaBottom: 0,
    tabbarHeight: 0,
    intoViewId: 0,
    navHeight: 0,
    safeAreaTop: 0,
    refresherTriggered: false,
    isLoadingMore: false,
    topMsg: null,
    hasMore: true, // 是否还有更多数据
    pullDownStatus: 'pull', // pull: 下拉加载更多, release: 松开加载更多, loading: 加载中, nomore: 没有更多
    scrollAnimation: true, // 是否启用滚动动画
    operatingForm: {
      operate: '',
      msg: null
    }
  },
  methods: {
    getPageInfo() {
      const pageInfo = systemInfo.getPageInfo()
      this.setData({
        safeAreaTop: pageInfo.safeAreaTop,
        navHeight: pageInfo.navHeight,
        safeAreaBottom: pageInfo.safeAreaBottom,
        tabbarHeight: pageInfo.tabbarHeight
      })
    },
    sendMessage(e) {
      const msg = this.addUserMessage(e.detail.content)
      this.setData({
        operatingForm: {
          operate: 'sendMessage',
          msg: msg
        }
      })
      ChatService.sendMessage(
        {
          chatId: this.data.sessionId,
          content: e.detail.content
        },
        (eventData) => {
        const msg = eventData.payload.msg
        const url = eventData.payload.url
        const latestMessage =
          this.data.messageList[this.data.messageList.length - 1]
        if (!latestMessage.loading) {
          const newMessage = {
            senderType: 2,
            content: msg || '',
            htmlContent: marked(msg || ''),
            url: url,
            loading: true
          }
          this.setData({
            messageList: [...this.data.messageList, newMessage]
          })
        } else {
          latestMessage.content += msg || ''
          latestMessage.htmlContent = marked(latestMessage.content || '')
          latestMessage.url = url
          this.setData({
            messageList: this.data.messageList
          })
        }
        // this.scrollToBottom()
      })
        .then((res) => {
          this.setData({
            inputValue: '',
            operatingForm: {
              operate: '',
              msg: null
            }
          })

        })
        .catch((err) => {
          // const latestMessage =
          //   this.data.messageList[this.data.messageList.length - 1]
          // latestMessage.error = true
          // latestMessage.content = err.msg
          // latestMessage.htmlContent = marked(err.msg)
          // latestMessage.errorCode = err.code
          this.setData({
            messageList: [...this.data.messageList.slice(0, -1)],
            operatingForm: {
              operate: '',
              msg: {
                ...this.data.operatingForm.msg,
                error: true,
                errorMsg: err.msg
              }
            }
          })
        })
    },
    goLogin() {
      this.setData({ isLogin: true })
    },
    onKeyboardHeightChange(e) {
      const keyboardHeight = typeof e.detail === 'number' ? e.detail : (e.detail.keyboardHeight || 0)
      this.setData({
        keyboardHeight
      })
      if (keyboardHeight > 0) {
        this.setData({
          contentHeight: `calc(100% - ${keyboardHeight}px + ${this.data.tabbarHeight}rpx + ${this.data.safeAreaBottom}px)`
        })
        setTimeout(() => {
          this.scrollToBottom()
        }, 400);
      } else {
        this.setData({
          contentHeight: '100%'
        })
      }
    },
    onInputLineChange() {
      this.scrollToBottom()
    },
     // 滚动到底部（使用锚点方式更稳定）
    scrollToBottom() {
      // 通过切换 intoViewId 触发滚动，避免相同值不生效
      this.setData({ intoViewId: '' })
      setTimeout(() => {
        this.setData({ intoViewId: 'bottom-anchor' })
      }, 0)
    },
    scrollToView(id) {
      // this.setData({ intoViewId: '' })
      setTimeout(() => {
        this.setData({ intoViewId: id })
      }, 0)
    },
    hideTabbar() {
      this.triggerEvent('hideTabbar')
    },
    showTabbar() {
      this.triggerEvent('showTabbar')
    },
    goRoleInfo() {
      wx.navigateTo({
        url: '/pages/role/role-detail/index'
      })
    },
    // 监听下拉动作
    onPulling(e) {
      // 当下拉距离超过阈值时，显示"松开加载更多"
      const threshold = 50
      if (e.detail.dy > threshold && this.data.pullDownStatus === 'pull' && !this.data.isLoadingMore) {
        this.setData({
          pullDownStatus: 'release'
        })
      } else if (e.detail.dy <= threshold && this.data.pullDownStatus === 'release' && !this.data.isLoadingMore) {
        this.setData({
          pullDownStatus: 'pull'
        })
      }
    },
    // 监听恢复动作（取消下拉）
    onRestore() {
      if (!this.data.isLoadingMore && this.data.hasMore) {
        this.setData({
          pullDownStatus: 'pull'
        })
      }
    },
    // 下拉刷新处理
    onLoadMore() {
      // 防止重复加载或没有更多数据
      if (this.data.isLoadingMore || !this.data.hasMore) {
        return
      }
      
      this.setData({
        isLoadingMore: true,
        refresherTriggered: true,
        pullDownStatus: 'loading',
        topMsg: this.data.msgList[0]
      })
      this.triggerEvent('loadMore', {}, { bubbles: true, composed: true })
    },
    // 停止下拉刷新状态（供父组件调用）
    stopRefresh() {
      this.setData({
        refresherTriggered: false,
        isLoadingMore: false,
        pullDownStatus: this.data.hasMore ? 'pull' : 'nomore'
      })
    },
    // 没有更多数据处理
    noMoreHandle() {
      this.setData({
        isLoadingMore: false,
        hasMore: false,
        pullDownStatus: 'nomore',
        refresherTriggered: false
      })
    },
    // 加载更多数据成功
    loadMoreHandle(msgs) {
      // 禁用滚动动画，避免 refresher 复位动画和 scrollToView 动画冲突
      this.setData(
        {
          scrollAnimation: false
        },
        () => {
          this.setData(
            {
              isLoadingMore: false,
              refresherTriggered: false,
              pullDownStatus: this.data.hasMore ? 'pull' : 'nomore',
            },
            () => {
              // 滚动完成后延迟恢复动画，确保位置已固定
              setTimeout(() => {
                this.setData({
                  msgList: [...msgs, ...this.data.msgList]
                })
                this.scrollToView(`msg-${this.data.topMsg.id}`)
                setTimeout(() => {
                  this.setData({ scrollAnimation: true })
                }, 100)
              }, 100)
            }
          )
        }
      )
    },
    // 重置加载状态（供父组件调用，例如切换会话时）
    resetLoadStatus() {
      this.setData({
        hasMore: true,
        pullDownStatus: 'pull',
        isLoadingMore: false,
        refresherTriggered: false
      })
    },
    // 加载完消息
    getMsgListHandle(msgs) {
      this.setData({
        msgList: msgs
      })
      this.scrollToBottom()
    },
    /**
     * 解析消息内容，提取思考过程和正式内容
     * @param {string} content - 原始消息内容
     * @returns {object} - { thinkContent: string, mainContent: string, hasThinking: boolean }
     */
    parseThinkingContent(content) {
      // 先尝试匹配完整的 <think>...</think>
      const thinkRegex = /<think>([\s\S]*?)<\/think>/
      const match = content.match(thinkRegex)
      
      if (match) {
        // 思考已完成
        const thinkContent = match[1].trim()
        const mainContent = content.replace(thinkRegex, '').trim()
        return {
          thinkContent,
          mainContent,
          hasThinking: true
        }
      }
      
      // 如果没有完整匹配，检查是否有未闭合的 <think> 标签（思考中）
      const openThinkRegex = /<think>([\s\S]*?)$/
      const openMatch = content.match(openThinkRegex)
      
      if (openMatch) {
        // 思考中，提取已有的思考内容
        const thinkContent = openMatch[1].trim()
        return {
          thinkContent,
          mainContent: '', // 思考中时还没有正式内容
          hasThinking: false // 还未完成，所以 hasThinking 为 false
        }
      }
      
      return {
        thinkContent: '',
        mainContent: content,
        hasThinking: false
      }
    },

    /**
     * 添加用户消息
     * @param {string} userMessage - 用户消息内容
     */
    addUserMessage(userMessage) {
      const userMsg = {
        id: Date.now(),
        senderType: 2,  // 用户消息
        content: userMessage,
        time: Date.now()
      }
      
      this.setData({
        msgList: [...this.data.msgList, userMsg]
      })

      this.scrollToBottom()
      return userMsg
    },

    /**
     * 添加 AI 消息（初始为 loading 状态）
     */
    addAIMessage() {
      const aiMsg = {
        id: Date.now(),
        senderType: 1,  // AI/角色消息
        content: '',
        htmlContent: '',
        rawContent: '', // 原始内容（包含 <think> 标签）
        thinkContent: '', // 思考过程内容
        thinkHtmlContent: '', // 思考过程 HTML
        mainContent: '', // 正式回复内容
        hasThinking: false, // 是否有思考过程
        isThinking: false, // 是否正在思考中
        loading: true,
        time: Date.now()
      }
      
      this.setData({
        msgList: [...this.data.msgList, aiMsg]
      })
      
      this.scrollToBottom()
    },
    /**
     * 流式更新消息内容（会自动解析 <think> 标签）
     * @param {string} chunk - 新增的内容片段
     */
    updateStreamMessage(chunk) {
      const msgList = this.data.msgList
      const lastMsg = msgList[msgList.length - 1]
      
      if (lastMsg && lastMsg.senderType === 1) {  // AI消息
        // 累加原始内容
        lastMsg.rawContent = (lastMsg.rawContent || '') + chunk
        
        // 检测思考开始
        if (!lastMsg.isThinking && lastMsg.rawContent.includes('<think>')) {
          lastMsg.isThinking = true
        }
        
        // 解析思考过程和正式内容
        const parsed = this.parseThinkingContent(lastMsg.rawContent)
        lastMsg.hasThinking = parsed.hasThinking
        lastMsg.thinkContent = parsed.thinkContent
        lastMsg.mainContent = parsed.mainContent
        
        // 检测思考结束
        if (lastMsg.isThinking && lastMsg.rawContent.includes('</think>')) {
          lastMsg.isThinking = false
        }
        
        // 转换为 HTML
        // 思考中或思考完成都需要转换 HTML
        if (parsed.thinkContent) {
          lastMsg.thinkHtmlContent = formatMessage(parsed.thinkContent)
        }
        if (parsed.mainContent) {
          lastMsg.htmlContent = formatMessage(parsed.mainContent)
        }
        
        this.setData({ msgList })
      }
    },

    /**
     * 完成消息接收
     */
    finishMessage() {
      const msgList = this.data.msgList
      const lastMsg = msgList[msgList.length - 1]
      
      if (lastMsg && lastMsg.senderType === 1) {  // AI消息
        lastMsg.loading = false
        // 最终内容设置
        lastMsg.content = lastMsg.mainContent || lastMsg.rawContent || ''
        this.setData({ msgList })
        this.scrollToBottom()
      }
    },

    /**
     * 消息发送失败处理
     * @param {string} errorMsg - 错误信息
     */
    messageError(errorMsg) {
      const msgList = this.data.msgList
      if (msgList.length > 0) {
        const lastMsg = msgList[msgList.length - 1]
        
        // 如果最后一条是 AI 消息，标记为错误状态
        if (lastMsg.senderType === 1) {
          lastMsg.loading = false
          lastMsg.error = true
        }
        // 如果最后一条是用户消息，也标记错误（向后兼容）
        else if (lastMsg.senderType === 2) {
          lastMsg.error = true
        }
        
        this.setData({ msgList })
      }
    },
    /**
     * 处理重新发送消息
     * @param {object} e - 事件对象
     */
    onRetry(e) {
      const messageId = e.detail.messageId
      const msgList = this.data.msgList
      const msgIndex = msgList.findIndex(m => m.id === messageId)
      
      if (msgIndex !== -1) {
        const errorMsg = msgList[msgIndex]
        
        // 重置错误消息的状态
        errorMsg.error = false
        errorMsg.errorMsg = ''
        errorMsg.loading = true
        errorMsg.content = ''
        errorMsg.htmlContent = ''
        errorMsg.mainContent = ''
        errorMsg.rawContent = ''
        
        this.setData({ msgList })
        
        // 通知父组件（页面）重新发送
        this.triggerEvent('retryMessage', { messageId })
      }
    },
    
    onButtonClick(e) {
      if (e.detail.action === 'rollback') {
        const currentMsg = e.detail.current;
        const tipDialog = this.selectComponent('#tip-dialog')
        tipDialog.show({
          content: '回溯后，该条消息之后的对话将被清除，且不可撤回。',
          cancelText: '取消',
          confirmText: '确认',
          onCancel: () => {
            // 取消操作，对话框会自动关闭
          },
          onConfirm: () => {
            // 确认回溯
            currentMsg.handleRollback();
          }
        })
      } else if (e.detail.action === 'newPlot') {
        const inputSheet = this.selectComponent('#input-sheet')
        inputSheet.show({
          title: '创建新剧情',
          label: '剧情名称',
          placeholder: '请输入',
          cancelText: '取消',
          confirmText: '保存',
          value: '',
          onCancel: () => {
            // 取消操作，对话框会自动关闭
          },
          onConfirm: (inputValue) => {
            // 处理输入的值
            console.log('输入框的值:', inputValue)
            this.triggerEvent('inputSheetConfirm', { value: inputValue })
          }
        })
      } else if (e.detail.action === 'like') {
        e.detail.current.handleLike();
      } else if (e.detail.action === 'dislike') {
        e.detail.current.handleDislike();
      } else if (e.detail.action === 'play') {
        e.detail.current.handlePlay();
      } else if (e.detail.action === 'retry') {
        // e.detail.current.handleRetry();
        this.setData({
          operatingForm: {
            operate: 'retry',
            msg: e.detail.current
          }
        })
        const selectSheet = this.selectComponent('#select-sheet')
        selectSheet.show({
          title: '重说',
          dataId: 2,
          pageSize: 4,
          fetchData: () => {
            return Promise.resolve({ list: ['重新生成','很长的提示词很长的提示词很长的提示词很长的提示词很长的提示词很长的提示词很长的提示词','2344343', '34444444', '23433'], total: 14 })
          },
          onSelect: (item) => {
            console.log('选择的值:', item)
          },
          onClose: () => {
            console.log('关闭了')
          }
        })
        
      } else if (e.detail.action === 'continue') {
        e.detail.current.handleContinue();
        this.setData({
          operatingForm: {
            operate: 'continue',
            msg: e.detail.current
          }
        })
      }
      // e.detail.current.closeSwipeCell();
    }
  }
})
