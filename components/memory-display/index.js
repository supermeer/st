Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    // 当前记忆值
    currentMemory: {
      type: Number,
      value: 0
    },
    // 记忆选项列表
    memoryOptions: {
      type: Array,
      value: []
    }
  },

  data: {
    selectedIndex: 0,
    selectedOption: null
  },

  observers: {
    'currentMemory, memoryOptions': function(currentMemory, memoryOptions) {
      this._updateSelectedOption()
    }
  },

  methods: {
    /**
     * 根据 currentMemory 和 memoryOptions 找到对应的选项和索引
     */
    _updateSelectedOption() {
      const { currentMemory, memoryOptions } = this.data
      
      if (!memoryOptions || memoryOptions.length === 0) {
        this.setData({
          selectedIndex: 0,
          selectedOption: null
        })
        return
      }

      // 找到匹配的选项
      const index = memoryOptions.findIndex(opt => opt.value === currentMemory)
      const selectedIndex = index >= 0 ? index : 0
      const selectedOption = memoryOptions[selectedIndex] || null

      this.setData({
        selectedIndex,
        selectedOption
      })
    }
  }
})
