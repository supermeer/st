
import { getMemoryType } from '../../services/ai/chat'
import { updatePlot } from '../../services/ai/chat'
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {},

  data: {
    visible: false,
    title: '记忆力增强',
    subtitle: '最大对话长度，将影响每次对话所消耗的积分值。',
    cancelText: '返回',
    confirmText: '保存',
    memoryOptions: [],
    selectedOption: null,
    currentCount: null, // 用于标记"当前"选中的选项
    loading: false,
    plotId: null,
    startTime: null
  },

  methods: {
    async _fetchMemoryOptions() {
      try {
        this.setData({ loading: true })
        const response = await getMemoryType()
        if (response && Array.isArray(response)) {
          return response || []
        } else {
          return []
        }
      } catch (error) {
        wx.showToast({
          title: '加载记忆选项失败，使用默认选项',
          icon: 'none',
          duration: 2000
        })
        return []
      } finally {
        this.setData({ loading: false })
      }
    },

    /**
     * 显示记忆力设置弹窗
     * @param {Object} options 配置项
     * @param {String} options.title 标题
     * @param {String} options.subtitle 副标题
     * @param {Array} options.memoryOptions 记忆选项列表，格式：[{id, name, description, icon}]，不提供时从接口获取
     * @param {String} options.currentCount 当前选中的记忆选项
     * @param {String} options.cancelText 取消按钮文字
     * @param {String} options.confirmText 确认按钮文字
     * @param {Function} options.onCancel 取消回调
     * @param {Function} options.onConfirm 确认回调，参数为选中的记忆选项对象
     */
    async show(options = {}) {
      wx.reportEvent('memory_sheet_show', {
        title: '智能体记忆力增强显示'
      })
      this.setData({
        startTime: Date.now()
      })
      const {
        title = '记忆力增强',
        subtitle = '最大对话长度，将影响每次对话所消耗的积分值。',
        memoryOptions = null,
        currentCount = null,
        cancelText = '返回',
        confirmText = '保存',
        onCancel,
        onConfirm,
        plotId
      } = options

      // 保存回调函数到组件实例
      this._onCancel = onCancel
      this._onConfirm = onConfirm

      // 如果没有提供记忆选项，从接口获取
      let finalMemoryOptions = memoryOptions
      if (!memoryOptions) {
        finalMemoryOptions = await this._fetchMemoryOptions()
      }

      // 找到当前选中的记忆选项
      const selectedOption = finalMemoryOptions.find(opt => opt.value === currentCount) || finalMemoryOptions[0] || null

      this.setData({
        visible: true,
        title,
        subtitle,
        memoryOptions: finalMemoryOptions,
        selectedOption,
        currentCount,
        cancelText,
        confirmText,
        plotId
      })
    },
    /**
     * 隐藏弹窗
     */
    hide() {
      this.setData({
        visible: false
      })
      // 清除回调函数
      this._onCancel = null
      this._onConfirm = null
    },

    // 选择记忆选项
    handleSelectOption(e) {
      const { index } = e.currentTarget.dataset
      const selectedOption = this.data.memoryOptions[index]
      
      this.setData({
        selectedOption
      })
    },

    // 取消按钮回调
    handleCancel() {
      if (typeof this._onCancel === 'function') {
        this._onCancel()
      }
      this.hide()
    },
    
    // 确认按钮回调
    async handleConfirm() {
      wx.reportEvent('memory_sheet_confirm', {
        // 从打开到确认的耗时 秒
        title: '智能体记忆力确认',
        costTime: (Date.now() - this.data.startTime) / 1000
      })
      console.log(this.data.selectedOption)
      if (!this.data.selectedOption) {
        wx.showToast({
          title: '请选择记忆选项',
          icon: 'none'
        })
        return
      }
      if (typeof this._onConfirm === 'function') {
        this._onConfirm(this.data.selectedOption.value)
        this.hide()
      } else {
        await updatePlot({
          id: this.data.plotId,
          memoryCount: this.data.selectedOption.value
        })
        this.hide()
      }
    },

    // 关闭按钮
    handleClose() {
      this.handleCancel()
    },

    // 点击遮罩层
    handleMaskClick() {
      this.handleCancel()
    },

    // 阻止事件冒泡
    preventMove() {
      return false
    }
  }
})

