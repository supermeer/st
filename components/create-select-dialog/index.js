Component({
  options: {
    multipleSlots: true
  },
  properties: {},
  data: {
    visible: false,
    options: [
      {
        type: 'character',
        label: '创建角色卡',
        description: '量身打造专属人设，随时随地和心仪角色畅聊互动',
        icon: '/static/images/character-icon.png',
        url: '/pages/role/add/index',
        isNew: false
      },
      {
        type: 'group',
        label: '创建群聊',
        description: '自由拉不同世界观的角色入群，看他们互怼、创建有趣剧情',
        icon: '/static/images/group-icon.png',
        url: '/pages/group/add/index',
        isNew: true
      }
    ],
    _onSelect: null
  },
  methods: {
    show(options = {}) {
      const { onSelect } = options
      this._onSelect = onSelect

      if (options.options) {
        this.setData({
          visible: true,
          options: options.options
        })
      } else {
        this.setData({ visible: true })
      }
    },
    hide() {
      this.setData({ visible: false })
      this._onSelect = null
    },
    handleSelect(e) {
      const { item } = e.currentTarget.dataset
      if (item.disabled) return

      if (typeof this._onSelect === 'function') {
        this._onSelect(item)
      }

      if (item.url) {
        wx.navigateTo({
          url: item.url
        })
      }

      this.hide()
    },
    handleClose() {
      this.hide()
    },
    handleMaskClick() {
      this.hide()
    },
    preventBubble() {
      // 阻止事件冒泡
    }
  }
})
