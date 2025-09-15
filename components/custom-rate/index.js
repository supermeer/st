Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 评分值
    value: {
      type: Number | String,
      value: 0
    },
    // 是否只读
    readonly: {
      type: Boolean,
      value: false
    },
    // 评分显示模式：score(图标)、chinese(文字)
    displayMode: {
      type: String,
      value: 'score'
    },
    // 星星数量
    count: {
      type: Number,
      value: 5
    },
    // 标题
    title: {
      type: String,
      value: '好评度'
    },
    // 星星大小
    size: {
      type: String,
      value: '25'
    },
    // 星星间距
    gap: {
      type: String,
      value: '20'
    },
    // 评分等级
    levels: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: '',
    icon: '',
    color: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 图标评分变化事件
     */
    onRateChange(e) {
      const value = e.detail.value
      this.setData({ value: value })
      // 通知父组件值变化
      this.triggerEvent('change', { value: this.data.levels[value - 1] })
    },

    /**
     * 文字评分变化事件
     */
    onTextRateChange(e) {
      console.log(e, 'onTextRateChange')
      if (this.data.readonly) return
      const value = e.currentTarget.dataset.value
      this.setData({ value: value })

      // 通知父组件值变化
      this.triggerEvent('change', { value })
    }
  },

  /**
   * 组件生命周期
   */
  attached() {}
})
