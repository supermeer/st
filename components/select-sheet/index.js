Component({
  properties: {},

  data: {
    visible: false,
    title: '选择',
    dataId: '',
    pageSize: 10,
    // 列表数据
    list: [],
    // 当前页码
    currentPage: 1,
    // 总页数
    totalPages: 1,
    // 总数据量
    total: 0,
    // 加载状态
    loading: false
  },

  methods: {
    /**
     * 显示选择弹窗
     * @param {Object} options 配置项
     * @param {String} options.title 标题
     * @param {String} options.dataId 数据ID，用于获取数据
     * @param {Number} options.pageSize 每页显示数量
     * @param {Function} options.fetchData 自定义数据获取函数，参数为 { dataId, page, pageSize }，返回 Promise<{ list, total }>
     * @param {Function} options.onSelect 选择回调，参数为选中的项
     * @param {Function} options.onClose 关闭回调
     */
    show(options = {}) {
      const {
        title = '选择',
        dataId = '',
        pageSize = 10,
        fetchData,
        onSelect,
        onClose
      } = options

      // 检查 dataId 是否改变
      const isDataIdChanged = this._currentDataId && this._currentDataId !== dataId
      
      if (isDataIdChanged) {
        // ID 改变，清空所有缓存和数据
        console.log(`ID 改变: ${this._currentDataId} -> ${dataId}，清空缓存`)
        this._pageCache = {}
        this.setData({
          currentPage: 1,
          list: [],
          total: 0,
          totalPages: 1
        })
      } else if (!this._currentDataId) {
        // 第一次打开，初始化缓存
        console.log(`首次打开，ID: ${dataId}`)
        this._pageCache = {}
      } else {
        // ID 相同，保留缓存和当前状态
        console.log(`ID 相同: ${dataId}，保留缓存`)
      }

      // 保存当前的 dataId
      this._currentDataId = dataId
      
      // 保存回调函数和配置到组件实例
      this._fetchData = fetchData
      this._onSelect = onSelect
      this._onClose = onClose

      this.setData({
        visible: true,
        title,
        dataId,
        pageSize
      }, () => {
        // 显示后立即加载数据（如果有缓存会直接使用）
        this.loadData()
      })
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
      if (this.data.currentPage <= 1) {
        return
      }
      
      this.setData({
        currentPage: this.data.currentPage - 1
      }, () => {
        this.loadData()
      })
    },

    // 下一页
    handleNextPage() {
      if (this.data.currentPage >= this.data.totalPages) {
        return
      }
      
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.loadData()
      })
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

