import { retellMessage, setCurrentMessage } from '../../services/ai/chat'
const { formatMessage } = require('../../utils/msgHandler')

Component({
  properties: {},

  data: {
    visible: false,
    title: '选择',
    mode: 'normal', // 'normal' 或 'retry' (流式重说模式)
    
    // 普通模式数据
    dataId: '',
    pageSize: 10,
    list: [],
    
    // 重说模式数据
    messageId: '', // 被重说的消息ID
    currentIndex: 0, // 当前展示的重说结果索引
    retryResults: [], // 所有重说结果 [{content, htmlContent, loading, messageId}, ...]
    canUse: false, // 是否可以使用该条
    
    // 通用数据
    currentPage: 1,
    totalPages: 1,
    total: 0,
    loading: false
  },

  methods: {
    /**
     * 显示选择弹窗
     * @param {Object} options 配置项
     * @param {String} options.mode 模式：'normal' 或 'retry'
     * @param {String} options.title 标题
     * @param {String} options.messageId 重说模式下的消息ID
     * @param {String} options.dataId 普通模式下的数据ID
     * @param {Number} options.pageSize 每页显示数量
     * @param {Function} options.fetchData 自定义数据获取函数
     * @param {Function} options.onSelect 选择回调
     * @param {Function} options.onUse 使用回调（重说模式）
     * @param {Function} options.onClose 关闭回调
     */
    show(options = {}) {
      const {
        mode = 'normal',
        title = '选择',
        messageId = '',
        plotId = '',
        dataId = '',
        pageSize = 10,
        fetchData,
        onSelect,
        onUse,
        onClose
      } = options

      // 保存回调函数和配置到组件实例
      this._fetchData = fetchData
      this._onSelect = onSelect
      this._onUse = onUse
      this._onClose = onClose

      if (mode === 'retry') {
        // 重说模式（最多3条）
        this.setData({
          visible: true,
          mode: 'retry',
          title,
          messageId,
          plotId,
          currentIndex: 0,
          retryResults: [],
          canUse: false,
          loading: false,
          currentPage: 1,
          totalPages: 3
        }, () => {
          // 立即生成第一条
          this.generateRetry()
        })
      } else {
        // 普通模式（保留原有逻辑）
        const isDataIdChanged = this._currentDataId && this._currentDataId !== dataId
        
        if (isDataIdChanged) {
          console.log(`ID 改变: ${this._currentDataId} -> ${dataId}，清空缓存`)
          this._pageCache = {}
          this.setData({
            currentPage: 1,
            list: [],
            total: 0,
            totalPages: 1
          })
        } else if (!this._currentDataId) {
          console.log(`首次打开，ID: ${dataId}`)
          this._pageCache = {}
        }

        this._currentDataId = dataId
        
        this.setData({
          visible: true,
          mode: 'normal',
          title,
          dataId,
          pageSize,
          plotId
        }, () => {
          this.loadData()
        })
      }
    },

    /**
     * 隐藏弹窗
     */
    hide() {
      this.setData({
        visible: false
      })
      // 清除回调函数（保留缓存和 dataId，以便下次打开时判断）
      this._fetchData = null
      this._onSelect = null
      this._onClose = null
      // 注意：不清除 _pageCache 和 _currentDataId，保留以便下次打开时复用
    },

    // 加载数据
    async loadData() {
      if (this.data.loading) return

      const currentPage = this.data.currentPage
      
      // 检查缓存
      if (this._pageCache && this._pageCache[currentPage]) {
        console.log(`使用缓存数据，第 ${currentPage} 页`)
        const cachedData = this._pageCache[currentPage]
        this.setData({
          list: cachedData.list,
          total: cachedData.total,
          totalPages: cachedData.totalPages,
          loading: false
        })
        return
      }

      // 缓存不存在，加载新数据
      console.log(`加载新数据，第 ${currentPage} 页`)
      this.setData({ loading: true })

      try {
        let result
        
        // 如果提供了自定义的 fetchData 函数，则使用它
        if (typeof this._fetchData === 'function') {
          result = await this._fetchData({
            dataId: this.data.dataId,
            plotId: this.data.plotId,
            page: this.data.currentPage,
            pageSize: this.data.pageSize
          })
        } else {
          // 否则使用默认的模拟数据
          result = await this.fetchDataFromAPI()
        }
        
        const totalPages = Math.ceil(result.total / this.data.pageSize)
        
        // 保存到缓存
        if (!this._pageCache) {
          this._pageCache = {}
        }
        this._pageCache[currentPage] = {
          list: result.list,
          total: result.total,
          totalPages: totalPages
        }
        setTimeout(() => {
          this.setData({
            list: result.list,
            total: result.total,
            totalPages: totalPages,
            loading: false
          })
        }, 3000);
      } catch (error) {
        console.error('加载数据失败:', error)
        this.setData({ loading: false })
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    // 模拟API调用（实际使用时通过 fetchData 参数替换）
    fetchDataFromAPI() {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟数据
          const pageSize = this.data.pageSize
          const currentPage = this.data.currentPage
          const total = 100 // 模拟总数据量
          
          const list = []
          const start = (currentPage - 1) * pageSize
          
          for (let i = 0; i < pageSize && start + i < total; i++) {
            list.push({
              id: start + i + 1,
              content: `选项内容 ${start + i + 1}：这是一个示例文本内容`
            })
          }
          
          resolve({
            list,
            total
          })
        }, 300)
      })
    },

    // 选择项目
    handleSelectItem(e) {
      const { item } = e.currentTarget.dataset
      
      // 触发选择回调
      if (typeof this._onSelect === 'function') {
        this._onSelect(item)
      }
      
      // 关闭弹窗
      this.hide()
    },

    // 上一页
    handlePrevPage() {
      if (this.data.mode === 'retry') {
        // 重说模式：返回上一条
        if (this.data.currentIndex <= 0) {
          return
        }
        this.setData({
          currentIndex: this.data.currentIndex - 1,
          currentPage: this.data.currentIndex // 用于显示页码，totalPages保持为3
        })
      } else {
        // 普通模式
        if (this.data.currentPage <= 1) {
          return
        }
        this.setData({
          currentPage: this.data.currentPage - 1
        }, () => {
          this.loadData()
        })
      }
    },

    // 下一页
    handleNextPage() {
      if (this.data.mode === 'retry') {
        // 重说模式：生成下一条（最多3条）
        const nextIndex = this.data.currentIndex + 1
        
        // 检查是否超过3条限制
        if (nextIndex >= 3) {
          return
        }
        
        // 如果已有缓存结果，直接切换
        if (nextIndex < this.data.retryResults.length) {
          this.setData({
            currentIndex: nextIndex,
            currentPage: nextIndex + 1
          })
        } else {
          // 生成新的一条
          this.generateRetry()
        }
      } else {
        // 普通模式
        if (this.data.currentPage >= this.data.totalPages) {
          return
        }
        this.setData({
          currentPage: this.data.currentPage + 1
        }, () => {
          this.loadData()
        })
      }
    },

    // 关闭弹窗
    handleClose() {
      if (typeof this._onClose === 'function') {
        this._onClose()
      }
      this.hide()
    },

    // 点击遮罩层
    handleMaskClick() {
      this.handleClose()
    },

    // 阻止事件冒泡
    preventMove() {
      return false
    },

    // 阻止点击事件冒泡
    preventBubble() {
      // 阻止事件冒泡到遮罩层
    },

    // 生成重说内容
    generateRetry() {
      if (this.data.loading) return
      
      // 检查是否已达到3条限制
      if (this.data.retryResults.length >= 3) {
        wx.showToast({
          title: '已达到最大重说次数',
          icon: 'none'
        })
        return
      }
      
      this.setData({ 
        loading: true,
        canUse: false
      })

      // 创建新的结果对象
      const newResult = {
        content: '',
        htmlContent: '',
        loading: true,
        messageId: '' // 服务端返回的新消息ID
      }
      
      const newIndex = this.data.retryResults.length
      const updatedResults = [...this.data.retryResults, newResult]
      
      this.setData({
        retryResults: updatedResults,
        currentIndex: newIndex,
        currentPage: newIndex + 1
      })

      retellMessage(
        { messageId: this.data.messageId, plotId: this.data.plotId },
        (eventData) => {
          // console.log('retellMessage chunk:', eventData.payload.msg);
          const msg = eventData.payload.msg
          const type = eventData.payload.type
          const currentResult = this.data.retryResults[newIndex]
          
          if (!currentResult) return
          
          if (type === 'text') {
            currentResult.content += msg || ''
            currentResult.htmlContent = formatMessage(currentResult.content)
          }
          
          if (type === 'aiMessageId') {
            currentResult.messageId = msg
          }
          
          this.setData({
            retryResults: this.data.retryResults
          })
        }
      )
        .then(() => {
          const currentResult = this.data.retryResults[newIndex]
          if (currentResult) {
            currentResult.loading = false
          }
          
          this.setData({
            retryResults: this.data.retryResults,
            loading: false,
            canUse: true // 生成完成后可以使用
          })
        })
        .catch((err) => {
          console.error('重说失败:', err)
          // 删除失败的结果
          const filteredResults = this.data.retryResults.filter((_, idx) => idx !== newIndex)
          this.setData({
            retryResults: filteredResults,
            currentIndex: Math.max(0, newIndex - 1),
            currentPage: Math.max(1, newIndex),
            totalPages: filteredResults.length,
            loading: false,
            canUse: filteredResults.length > 0 && !filteredResults[Math.max(0, newIndex - 1)]?.loading
          })
          
          wx.showToast({
            title: '生成失败',
            icon: 'none'
          })
        })
    },

    // 使用该条
    handleUse() {
      if (!this.data.canUse || this.data.loading) {
        return
      }
      
      const currentResult = this.data.retryResults[this.data.currentIndex]
      if (!currentResult || !currentResult.content) {
        wx.showToast({
          title: '内容为空',
          icon: 'none'
        })
        return
      }

      wx.showLoading({ title: '替换中...' })
      
      setCurrentMessage({
        messageId: this.data.messageId,
        content: currentResult.content
      })
        .then(() => {
          wx.hideLoading()
          wx.showToast({
            title: '已替换',
            icon: 'success'
          })
          
          // 触发使用回调
          if (typeof this._onUse === 'function') {
            this._onUse({
              originalMessageId: this.data.messageId,
              newContent: currentResult.content,
              newMessageId: currentResult.messageId
            })
          }
          
          // 关闭弹窗
          this.hide()
        })
        .catch((err) => {
          wx.hideLoading()
          console.error('替换失败:', err)
          wx.showToast({
            title: '替换失败',
            icon: 'none'
          })
        })
    },

    /**
     * 清除所有缓存（外部调用）
     * 用于需要强制刷新数据的场景
     */
    clearCache() {
      console.log('清除所有缓存')
      this._pageCache = {}
      this._currentDataId = null
      this.setData({
        currentPage: 1,
        list: [],
        total: 0,
        totalPages: 1
      })
    }
  }
})

