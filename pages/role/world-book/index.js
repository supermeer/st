import SystemInfo from '../../../utils/system'

Page({
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    currentBg: '',
    worldBookList: [],
    typeOptions: [
      { label: '系统', value: 'system', color: '#667eea' },
      { label: 'AI', value: 'ai', color: '#6c5ce7' },
      { label: '用户', value: 'user', color: 'rgb(253, 171, 11)' }
    ]
  },

  onLoad(options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })

    // 获取上一页面传递的数据
    const eventChannel = this.getOpenerEventChannel()
    if (eventChannel && eventChannel.on) {
      eventChannel.on('acceptDataFromOpenerPage', (data) => {
        const { background, worldBookList } = data
        this.setData({
          currentBg: background || '',
          worldBookList: worldBookList || []
        })
      })
    }
  },

  /**
   * 获取类型配置
   */
  getTypeConfig(type) {
    return this.data.typeOptions.find(item => item.value === type) || this.data.typeOptions[2]
  },

  /**
   * 上移条目
   */
  onMoveUp(e) {
    const { index } = e.currentTarget.dataset
    if (index <= 0) return

    const list = [...this.data.worldBookList]
    const temp = list[index]
    list[index] = list[index - 1]
    list[index - 1] = temp

    this.setData({ worldBookList: list })
  },

  /**
   * 下移条目
   */
  onMoveDown(e) {
    const { index } = e.currentTarget.dataset
    const list = [...this.data.worldBookList]
    if (index >= list.length - 1) return

    const temp = list[index]
    list[index] = list[index + 1]
    list[index + 1] = temp

    this.setData({ worldBookList: list })
  },

  /**
   * 新增条目
   */
  onAddItem() {
    wx.navigateTo({
      url: '/pages/role/world-book-edit/index',
      events: {
        acceptDataFromEditPage: (data) => {
          if (data && data.item) {
            const list = [...this.data.worldBookList, data.item]
            this.setData({ worldBookList: list })
          }
        }
      },
      success: (res) => {
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          background: this.data.currentBg,
          mode: 'add'
        })
      }
    })
  },

  /**
   * 编辑条目
   */
  onEditItem(e) {
    const { index } = e.currentTarget.dataset
    const item = this.data.worldBookList[index]

    wx.navigateTo({
      url: '/pages/role/world-book-edit/index',
      events: {
        acceptDataFromEditPage: (data) => {
          if (data && data.item) {
            const list = [...this.data.worldBookList]
            list[index] = data.item
            this.setData({ worldBookList: list })
          }
        }
      },
      success: (res) => {
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          background: this.data.currentBg,
          mode: 'edit',
          item
        })
      }
    })
  },

  /**
   * 删除条目
   */
  onDeleteItem(e) {
    const { index } = e.currentTarget.dataset
    const tipDialog = this.selectComponent('#tip-dialog')
    
    tipDialog.show({
      content: '确定要删除这个条目吗？',
      cancelText: '取消',
      confirmText: '删除',
      onConfirm: () => {
        const list = [...this.data.worldBookList]
        list.splice(index, 1)
        this.setData({ worldBookList: list })
      }
    })
  },

  /**
   * 保存
   */
  onSave() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    
    if (prevPage && prevPage.confirmWorldBook) {
      prevPage.confirmWorldBook(this.data.worldBookList)
    }

    wx.navigateBack()
  }
})
