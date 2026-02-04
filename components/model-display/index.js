Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    currentValue: {
      type: String,
      value: ''
    },
    modelOptions: {
      type: Array,
      value: []
    }
  },

  data: {
    selectedIndex: 0,
    selectedOption: null
  },

  observers: {
    'currentValue, modelOptions': function(currentValue, modelOptions) {
      this._updateSelectedOption()
    }
  },

  methods: {
    _updateSelectedOption() {
      const { currentValue, modelOptions } = this.data

      if (!modelOptions || modelOptions.length === 0) {
        this.setData({
          selectedIndex: 0,
          selectedOption: null
        })
        return
      }

      const index = modelOptions.findIndex(opt => opt.value === currentValue)
      const selectedIndex = index >= 0 ? index : 0
      const selectedOption = modelOptions[selectedIndex] || null

      this.setData({
        selectedIndex,
        selectedOption
      })
    }
  }
})
