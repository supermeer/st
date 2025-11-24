import systemInfo from '../../utils/system'
import ChatService from '../../services/ai/chat'
import { getPlotMessage, createPlot, forkPlotFromMessage, rollbackPlotMessage } from '../../services/ai/chat'
import { getCharacterDetail } from '../../services/role/index'
const { formatMessage } = require('../../utils/msgHandler')
Component({
  properties: {
    roleInfo: {
      type: Object,
      value: {}
    },
    showBack: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    attached: function () {
      this.getPageInfo()
      this.getRoleInfo()
    }
  },
  // 监听roleInfo变化
  observers: {
    'roleInfo.id': function (newVal) {
      if (newVal) {
        this.getRoleInfo()
      }
    },
    'roleInfo.plotId': function (newVal) {
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
          'pagination': {
            size: 10,
            current: 1,
            plotId: null
          },
          'chatDetail': {
            ...this.data.chatDetail,
            plotId: null
          },
          msgList: []
        })
      }
    },
    'msgList': function (newVal) {
      if (newVal.length > 0) {
        this.setData({
          latestMsgId: newVal[newVal.length - 1].id
        })
      }
      // 检查是否有消息正在生成中
      const isGenerating = newVal.some(msg => msg.loading === true)
      this.setData({
        isGenerating: isGenerating
      })
    }
  },
  data: {
    roleDetail: {
      name: '',
      avatarUrl: '',
      description: ''
    },
    avatarUrl: null,
    currentStoryDetail: {

    },
    chatDetail: {
      plotId: null,
      updateTime: null
    },
    msgList: [],
    latestMsgId: null,
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
    isGenerating: true, // 是否有对话正在生成中
    maskVisible: false, // 蒙版是否显示
    maskButtonTop: 0, // 蒙版按钮 top 位置
    maskButtonLeft: 0, // 蒙版按钮 left 位置
    maskButtonRight: 0, // 蒙版按钮 right 位置（用户消息）
    currentMaskMessageId: null, // 当前显示蒙版的消息 ID
    currentMessageType: 'role', // 当前消息类型：role 或 user
    operatingForm: {
      operate: '',
      msgId: null // 只存储消息 ID，不存储引用
    },
    // 分页相关
    pagination: {
      size: 10, // 每页数量
      current: 1, // 当前页码
      plotId: null // 剧情ID
    }
  },
  methods: {
    // 处理子组件蒙版显示/隐藏事件
    onMaskShow(e) {
      const { show, buttonTop, buttonLeft, buttonRight, messageId, messageType } = e.detail
      
      if (show) {
        this.setData({
          maskVisible: true,
          maskButtonTop: buttonTop,
          maskButtonLeft: buttonLeft || 0,
          maskButtonRight: buttonRight || 0,
          currentMaskMessageId: messageId,
          currentMessageType: messageType || 'role'
        })
      } else {
        this.hideMask()
      }
    },
    
    // 滚动时隐藏蒙版
    onScroll(e) {
      if (this.data.maskVisible) {
        this.hideMask()
      }
    },
    
    // 隐藏蒙版
    hideMask() {
      this.setData({
        maskVisible: false,
        currentMaskMessageId: null
      })
    },
    
    // 阻止事件冒泡
    stopPropagation() {
      // 阻止点击事件传递到蒙版
    },
    
    // 阻止滚动穿透
    preventMove() {
      return false
    },
    
    // 蒙版按钮点击事件
    onMaskButtonClick(e) {
      const action = e.currentTarget.dataset.action
      
      // 关闭蒙版
      this.hideMask()
      
      // 触发按钮点击事件
      this.onButtonClick({
        detail: {
          action: action
        },
        currentTarget: {
          dataset: {
            action: action
          }
        }
      })
    },
    
    onBack() {
      wx.navigateBack()
    },
    getPageInfo() {
      const pageInfo = systemInfo.getPageInfo()
      this.setData({
        safeAreaTop: pageInfo.safeAreaTop,
        navHeight: pageInfo.navHeight,
        safeAreaBottom: pageInfo.safeAreaBottom,
        tabbarHeight: pageInfo.tabbarHeight
      })
    },
    getRoleInfo() {
      if (!this.properties.roleInfo.id) {
        return
      }
      getCharacterDetail(this.properties.roleInfo.id).then(res => {
        this.setData({
          roleDetail: {
            ...this.data.roleDetail,
            ...res
          },
          currentStoryDetail: {
            ...this.data.currentStoryDetail,
            ...res.defaultStoryDetail
          }
        })
        let bg = res.backgroundImage
        if (!res.currentPlotId) {
          const defaultMsg = {
            senderType: 2,  // AI/角色消息
            content: this.data.currentStoryDetail.prologue,  
            htmlContent: formatMessage(this.data.currentStoryDetail.prologue),
            loading: false,
            time: Date.now()
          }
          
          this.setData({
            msgList: [...this.data.msgList, defaultMsg]
          })
        } else {
          if (res.currentPlotId === this.data.chatDetail.plotId && res.plotDetailVO.updateTime > this.data.chatDetail.updateTime) {
            this.setData({
              'pagination.current': 1
            })
            this.getMessageList()
          }
          bg = res.plotDetailVO.backgroundImage
          this.setData({
            chatDetail: {
              ...this.data.chatDetail,
              updateTime: res.plotDetailVO.updateTime
            },
            currentStoryDetail: {
              ...this.data.currentStoryDetail,
              ...res.plotDetailVO
            },
          })

        }
        const currentPage = getCurrentPages()[getCurrentPages().length - 1]
        currentPage.setCurrentBg(bg)
        this.setData({
          avatarUrl: bg
        })
      })
    },
    getNewMessage() {
      // 重新加载数据 从第一页开始
      this.setData({
        msgList: [],
        'pagination.current': 1
      })
      this.getMessageList()
    },
    async sendMessage(e) {
      if (!this.data.chatDetail.plotId) {
        const plotId = await ChatService.createPlot({ characterId: this.properties.roleInfo.id})
        this.setData({
          chatDetail: {
            ...this.data.chatDetail,
            plotId: plotId
          },
          'pagination.plotId': plotId
        })
      }
      const { content, imageList = [] } = e.detail;
      const msg = this.addUserMessage(content, imageList)
      this.setData({
        operatingForm: {
          operate: 'sendMessage',
          msgId: msg.id
        }
      })
      this.generateRequest('sendMessage', {
        content: content,
        imageList: imageList
      })
    },
    
    generateRequest(type, requestData) {
      const { content, imageList } = requestData;
      let fileKeys = [];
      if (imageList && imageList.length > 0) {
        fileKeys = imageList.map(item => item.fileKey);
      }
      this.addAIMessage()
      ChatService.sendMessage(
        {
          userMessage: content || '',
          imageList: fileKeys,
          plotId: this.data.chatDetail.plotId
        },
        (eventData) => {
        const msg = eventData.payload.msg
        const url = eventData.payload.url
        const type = eventData.payload.type
        const latestMessage =
          this.data.msgList[this.data.msgList.length - 1]
        if (!latestMessage.loading) {
          this.addAIMessage()
        } else {
          if (type === 'text') {
            latestMessage.content += msg || ''
            latestMessage.htmlContent = formatMessage(latestMessage.content || '')
            latestMessage.url = url
            latestMessage.isThinking = false
          } 
          if (type === 'thinking') {
            latestMessage.thinkContent += msg || ''
            latestMessage.thinkHtmlContent = formatMessage(latestMessage.thinkContent || '')
            latestMessage.isThinking = true
            latestMessage.hasThinking = true
          }
          if (type === 'aiMessageId') {
            latestMessage.id = msg
          }
          if (type === 'userMessageId' && this.data.msgList.length >= 2) {
            const userMsg = this.data.msgList[this.data.msgList.length - 2]
            userMsg.id = msg
          }
          this.setData({
            msgList: this.data.msgList
          })
        }
        this.scrollToBottom()
      })
        .then((res) => {
          this.setData({
            operatingForm: {
              operate: '',
              msgId: null
            },
          })
          const lastMsg = this.data.msgList[this.data.msgList.length - 1]
          lastMsg.loading = false
          this.setData({
              msgList: [...this.data.msgList]
          })
        })
        .catch((err) => {
          // 找到要标记错误的消息
          const msgIndex = this.data.msgList.findIndex(m => m.id === this.data.operatingForm.msgId)
          if (msgIndex !== -1) {
            // 更新该消息的 error 状态
            const updatedMsgList = [...this.data.msgList]
            updatedMsgList[msgIndex].error = true
            this.setData({
              msgList: [...updatedMsgList.slice(0, -1)] // 删除最后一条 AI 消息
            })
          } else {
            // 如果找不到，只删除最后一条消息
            this.setData({
              msgList: [...this.data.msgList.slice(0, -1)]
            })
          }
        })

    },
    
    goLogin() {
      this.setData({ isLogin: true })
    },
    getLatestMsgId() {
      if (this.data.msgList.length === 0) {
        return null
      }
      const latestMsg = this.data.msgList[this.data.msgList.length - 1]
      if (latestMsg.senderType === 2) {
        return latestMsg.id
      }
      return null
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
        url: `/pages/role/role-detail/index?characterId=${this.properties.roleInfo.id}&plotId=${this.data.chatDetail.plotId || ''}`
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
      
      // 如果没有plotId，无法加载消息
      if (!this.data.pagination.plotId) {
        this.noMoreHandle()
        return
      }
      
      this.setData({
        isLoadingMore: true,
        refresherTriggered: true,
        pullDownStatus: 'loading',
        topMsg: this.data.msgList[0]
      })
      
      // 加载下一页数据
      this.loadMoreMessages()
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
    // 获取消息列表
    getMessageList() {
      if (!this.data.pagination.plotId) {
        this.setData({
          msgList: []
        })
        return
      }
      
      // 重置分页
      this.resetPagination()
      getPlotMessage({
        size: this.data.pagination.size,
        current: this.data.pagination.current,
        plotId: this.data.pagination.plotId
      }).then(res => {
        let messageList = []
        if (res && res.records && Array.isArray(res.records)) {
          messageList = res.records
        } else if (Array.isArray(res)) {
          messageList = res
        }
        
        // 格式化消息内容
        const formattedMessages = messageList.map(msg => {
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
        
        // 更新分页状态
        const pagination = {
          current: res.current || this.data.pagination.current,
          size: res.size || this.data.pagination.size,
          plotId: this.data.pagination.plotId
        }
        
        // 判断是否还有更多数据：current < pages
        const hasMore = res.current && res.pages ? res.current < res.pages : messageList.length >= pagination.size
        
        this.setData({
          msgList: formattedMessages,
          pagination: pagination,
          hasMore: hasMore
        })
        setTimeout(() => {
          this.scrollToBottom()
        }, 100)
      }).catch(err => {
        console.error('获取消息列表失败:', err)
        this.setData({
          msgList: []
        })
      })
    },
    // 加载更多消息
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
      }).then(res => {
        // 根据返回格式获取消息列表：res.records
        let newMessages = []
        if (res && res.records && Array.isArray(res.records)) {
          newMessages = res.records
        } else if (Array.isArray(res)) {
          newMessages = res
        }
        
        // 格式化消息内容
        const formattedMessages = newMessages.map(msg => {
          if (msg.senderType === 2 && msg.content) {
            return {
              ...msg,
              htmlContent: formatMessage(msg.content)
            }
          }
          return msg
        })
        
        if (formattedMessages.length === 0) {
          // 没有更多数据
          this.noMoreHandle()
        } else {
          // 更新分页信息
          const pagination = {
            ...this.data.pagination,
            current: res.current || nextPage,
            size: res.size || this.data.pagination.size
          }
          
          // 判断是否还有更多数据：current < pages
          const hasMore = res.current && res.pages ? res.current < res.pages : formattedMessages.length >= pagination.size
          
          this.setData({
            pagination: pagination,
            hasMore: hasMore
          })
          
          // 将新消息插入到列表前面
          this.loadMoreHandle(formattedMessages)
        }
      }).catch(err => {
        console.error('加载更多消息失败:', err)
        this.stopRefresh()
      })
    },
    // 重置分页
    resetPagination() {
      this.setData({
        'pagination.current': 1,
        hasMore: true,
        pullDownStatus: 'pull',
        isLoadingMore: false,
        refresherTriggered: false
      })
    },
    /**
     * 添加用户消息
     * @param {string} userMessage - 用户消息内容
     * @param {Array} imageList - 图片列表
     */
    addUserMessage(userMessage, imageList = []) {
      let images = []
      if (imageList && Array.isArray(imageList)) {
        images = imageList.map(item => item.localUrl);
      }
      
      const userMsg = {
        id: Date.now(),
        senderType: 1,  // 用户消息
        content: userMessage,
        images,
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
        senderType: 2,  // AI/角色消息
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
    },

    /**
     * 处理重新发送消息
     * @param {object} e - 事件对象
     */
    onRetry(e) {
      const { operate, msgId } = this.data.operatingForm
      const msg = this.data.msgList.find(m => m.id === msgId)
      switch (operate) {
        case 'sendMessage':
          this.generateRequest('sendMessage', msg.content)
          // 重置最后一条消息的error状态
          msg.error = false
          this.setData({
            msgList: this.data.msgList
          })
          break;
        case 'continue':
          this.generateRequest('continue', '', msgId)
          msg.error = false
          this.setData({
            msgList: this.data.msgList
          })
          break;
        default:
          break;
      }
    },
    
    onButtonClick(e) {
      if (e.detail.action === 'rollback') {
        const include = e.detail.include
        const rollbackRequest = () => {
          rollbackPlotMessage({
            includeCurrent: include,
            messageId: e.detail.messageId
          }).then(() => {
            this.getNewMessage()
          })
        }
        if (!include) {
          const tipDialog = this.selectComponent('#tip-dialog')
          tipDialog.show({
            content: '回溯后，该条消息之后的对话将被清除，且不可撤回。',
            cancelText: '取消',
            confirmText: '确认',
            onConfirm: () => {
              rollbackRequest()
            }
          })
        } else {
          rollbackRequest()
        }
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
            forkPlotFromMessage ({
              title: inputValue,
              messageId: e.detail.messageId
            }).then(res => {              
              const currentPage = getCurrentPages()[getCurrentPages().length - 1]
              currentPage.changePlot({
                characterId: this.properties.roleInfo.id,
                plotId: res,
                type: 'history'
              })
            })
          }
        })
      } else if (e.detail.action === 'like') {
        e.detail.current.handleLike();
      } else if (e.detail.action === 'dislike') {
        e.detail.current.handleDislike();
      } else if (e.detail.action === 'play') {
        e.detail.current.handlePlay();
      } else if (e.detail.action === 'retry') {
        const messageId = e.detail.messageId
        
        const selectSheet = this.selectComponent('#select-sheet')
        selectSheet.show({
          mode: 'retry',
          title: '重说',
          messageId: messageId,
          plotId: this.data.chatDetail.plotId,
          onUse: (result) => {
            console.log('使用重说结果:', result)
            // 刷新消息列表以显示替换后的内容
            this.getNewMessage()
          },
          onClose: () => {
            console.log('关闭重说弹窗')
          }
        })
        
      } else if (e.detail.action === 'continue') {
        this.setData({
          operatingForm: {
            operate: 'continue',
            msgId: e.detail.messageId
          }
        })
        this.generateRequest('continue', '', e.detail.current.id)
      } else if (e.detail.action === 'restart') {
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
            const characterId = this.properties.roleInfo.id
            createPlot ({
              title: inputValue,
              characterId: characterId
            }).then(res => {              
              const currentPage = getCurrentPages()[getCurrentPages().length - 1]
              currentPage.changePlot({
                characterId: characterId,
                plotId: res,
                type: 'new'
              })
            })
          }
        })
      }
      // e.detail.current.closeSwipeCell();
    }
  }
})
