Component({
  options: {
    multipleSlots: true
  },

  data: {
    isChecked1: false,
    isChecked2: false,
    canConfirm: false
  },

  lifetimes: {
    attached() {
      const hasConfirmed = wx.getStorageSync('minorConfirmed')
      if (hasConfirmed) {
        this.setData({
          isChecked1: true,
          isChecked2: true,
          canConfirm: true
        })
      }
    }
  },

  methods: {
    /**
     * 显示弹窗
     */
    show(options = {}) {
      const { onConfirm, onCancel } = options
      this._onConfirm = onConfirm
      this._onCancel = onCancel

      const hasConfirmed = wx.getStorageSync('minorConfirmed')
      this.setData({
        visible: true,
        isChecked1: false,
        isChecked2: false,
        canConfirm: false
      })
    },

    /**
     * 隐藏弹窗
     */
    hide() {
      this.setData({
        visible: false
      })
      this._onConfirm = null
      this._onCancel = null
    },

    /**
     * 切换协议1勾选状态
     */
    toggleAgreement1() {
      this.setData({
        isChecked1: !this.data.isChecked1
      })
      this.updateCanConfirm()
    },

    /**
     * 切换协议2勾选状态
     */
    toggleAgreement2() {
      this.setData({
        isChecked2: !this.data.isChecked2
      })
      this.updateCanConfirm()
    },

    /**
     * 更新确认按钮状态
     */
    updateCanConfirm() {
      const canConfirm = this.data.isChecked1 && this.data.isChecked2
      this.setData({ canConfirm })
    },

    /**
     * 查看AI用户协议
     */
    viewAgreement2(e) {
      e && e.stopPropagation && e.stopPropagation()
      wx.navigateTo({
        url: '/pages/common/agreement/index?type=2'
      })
    },

    /**
     * 确认按钮点击
     */
    handleConfirm() {
      if (!this.data.isChecked1 || !this.data.isChecked2) {
        wx.showToast({
          title: '请勾选全部协议',
          icon: 'none',
          duration: 2000
        })
        return
      }

      wx.setStorageSync('minorConfirmed', true)
      this.hide()

      if (typeof this._onConfirm === 'function') {
        this._onConfirm()
      }
    },

    /**
     * 取消按钮点击（下次再冲）
     */
    handleCancel() {
      this.hide()
      if (typeof this._onCancel === 'function') {
        this._onCancel()
      }
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.reLaunch({
            url: '/pages/home/home',
            complete: () => {
              setTimeout(() => {
                wx.exitMiniProgram({})
              }, 100)
            }
          })
        }
      })
    }
  }
})