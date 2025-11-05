import { promptOptimization } from '../../services/ai/tools'

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    // 是否显示组件
    visible: {
      type: Boolean,
      value: false
    },
    // 原始文本内容
    originalText: {
      type: String,
      value: ''
    }
  },

  data: {
    // 优化后的文本
    optimizedText: '',
    // 是否正在优化中
    loading: false,
    // 输入框内容
    inputText: '',
    // 错误状态
    error: false,
    errorMessage: ''
  },

  lifetimes: {
    attached() {}
  },

  observers: {
    visible: function (newVal) {
      console.log(111, newVal)
      // 当显示状态变化时
      if (newVal && this.data.originalText) {
        this.setData({
          inputText: this.data.originalText,
          optimizedText: '',
          error: false,
          errorMessage: ''
        })
        this.optimizeText()
      }
    }
  },

  methods: {
    // 关闭弹窗
    onClose() {
      this.triggerEvent('close')
    },

    // 确认按钮
    onConfirm() {
      const { optimizedText } = this.data
      if (optimizedText) {
        this.triggerEvent('confirm', {
          originalText: this.data.inputText,
          optimizedText: optimizedText
        })
        this.onClose()
      } else {
        wx.showToast({
          title: '请先优化文本',
          icon: 'none'
        })
      }
    },

    // 优化文本
    async optimizeText() {
      const { inputText } = this.data
      if (!inputText.trim()) {
        wx.showToast({
          title: '请输入要优化的文本',
          icon: 'none'
        })
        return
      }

      this.setData({ 
        loading: true,
        error: false,
        errorMessage: ''
      })
      this.setData({
        loading: false,
        optimizedText: '111a;dfa倒垃圾发啦代理费',
        error: false,
      })
      return
      promptOptimization({
        prompt: inputText
      })
        .then((res) => {
          this.setData({ 
            optimizedText: res, 
            loading: false,
            error: false 
          })
        })
        .catch((err) => {
          console.error('优化文本失败:', err)
          this.setData({
            error: true,
            errorMessage: err.message || '优化失败，请重试',
            loading: false,
            optimizedText: ''
          })
        })
    },

    // 输入框内容变化
    onInputChange(e) {
      this.setData({
        inputText: e.detail.value
      })
    },

    // 阻止事件冒泡
    onTouchMove() {
      return false
    }
  }
})
