Page({
  data: {
    lockEnabled: false,
    lockType: 'gesture', // currently saved type
    mode: 'settings', // 'settings' | 'set_gesture' | 'set_pin'
    hasGesture: false,
    hasPin: false,
    // Gesture setup
    gestureStep: 'first', // 'first' | 'confirm'
    gestureStatus: 'normal',
    gestureHint: '请绘制图案（至少4个点）',
    // PIN setup
    pinStep: 'first', // 'first' | 'confirm'
    pinInput: '',
    pinStatus: 'normal',
    pinHint: '请设置6位密码',
    pinDots: [0, 1, 2, 3, 4, 5],
    numPad: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'],
  },

  _firstGesture: null,
  _firstPin: null,
  _canvas: null,
  _ctx: null,
  _canvasWidth: 0,
  _canvasHeight: 0,
  _circles: [],
  _selectedCircles: [],
  _canvasRect: null,
  _lockStarted: false,

  onLoad() {
    const lockEnabled = !!wx.getStorageSync('lockEnabled')
    const lockType = wx.getStorageSync('lockType') || 'gesture'
    const hasGesture = !!wx.getStorageSync('lockPattern')
    const hasPin = !!wx.getStorageSync('lockPin')
    this.setData({ lockEnabled, lockType, hasGesture, hasPin })
  },

  toggleLock(e) {
    const enabled = e.detail.value
    if (!enabled) {
      wx.showModal({
        title: '关闭屏幕锁',
        content: '确定要关闭屏幕锁吗？',
        confirmColor: '#EF4444',
        success: (res) => {
          if (res.confirm) {
            wx.removeStorageSync('lockEnabled')
            this.setData({ lockEnabled: false })
          } else {
            this.setData({ lockEnabled: true })
          }
        }
      })
      return
    }
    const hasGesture = !!wx.getStorageSync('lockPattern')
    const hasPin = !!wx.getStorageSync('lockPin')
    if (!hasGesture && !hasPin) {
      wx.showToast({ title: '请先设置锁屏方式', icon: 'none' })
      this.setData({ lockEnabled: false })
      return
    }
    wx.setStorageSync('lockEnabled', '1')
    this.setData({ lockEnabled: true })
  },

  startSetGesture() {
    this._firstGesture = null
    this._selectedCircles = []
    this.setData({
      mode: 'set_gesture',
      gestureStep: 'first',
      gestureStatus: 'normal',
      gestureHint: '请绘制图案（至少4个点）'
    })
    setTimeout(() => { this.initCanvas() }, 150)
  },

  startSetPin() {
    this._firstPin = null
    this.setData({
      mode: 'set_pin',
      pinStep: 'first',
      pinInput: '',
      pinStatus: 'normal',
      pinHint: '请设置6位密码'
    })
  },

  cancelSetMode() {
    this.setData({ mode: 'settings' })
  },

  // ----- Canvas (same logic as lock page) -----
  initCanvas() {
    wx.createSelectorQuery()
      .in(this)
      .select('#set-canvas')
      .boundingClientRect((rect) => {
        if (!rect) return
        this._canvasRect = rect
        wx.createSelectorQuery()
          .in(this)
          .select('#set-canvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (!res[0] || !res[0].node) return
            const { node: canvas, width, height } = res[0]
            const dpr = wx.getWindowInfo().pixelRatio
            canvas.width = width * dpr
            canvas.height = height * dpr
            const ctx = canvas.getContext('2d')
            ctx.scale(dpr, dpr)
            this._canvas = canvas
            this._ctx = ctx
            this._canvasWidth = width
            this._canvasHeight = height
            this.computeCircles()
            this.drawGesture()
          })
      })
      .exec()
  },

  computeCircles() {
    const w = this._canvasWidth
    const h = this._canvasHeight
    const cellW = w / 3
    const cellH = h / 3
    const r = Math.min(cellW, cellH) * 0.22
    this._circles = []
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        this._circles.push({
          cx: col * cellW + cellW / 2,
          cy: row * cellH + cellH / 2,
          r
        })
      }
    }
  },

  drawGesture(currentTouch) {
    if (!this._ctx) return
    const ctx = this._ctx
    const w = this._canvasWidth
    const h = this._canvasHeight
    const circles = this._circles
    const selected = this._selectedCircles
    const status = this.data.gestureStatus
    const mainColor = status === 'error' ? '#EF4444' : status === 'success' ? '#10B981' : '#8B5CF6'
    const dimColor = 'rgba(255,255,255,0.25)'

    ctx.clearRect(0, 0, w, h)

    if (selected.length >= 2) {
      ctx.save()
      ctx.strokeStyle = mainColor
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.moveTo(circles[selected[0]].cx, circles[selected[0]].cy)
      for (let i = 1; i < selected.length; i++) {
        ctx.lineTo(circles[selected[i]].cx, circles[selected[i]].cy)
      }
      ctx.stroke()
      ctx.restore()
    }

    if (currentTouch && selected.length > 0) {
      const last = circles[selected[selected.length - 1]]
      ctx.save()
      ctx.strokeStyle = mainColor
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.4
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(last.cx, last.cy)
      ctx.lineTo(currentTouch.x, currentTouch.y)
      ctx.stroke()
      ctx.restore()
    }

    circles.forEach((circle, i) => {
      const isSelected = selected.includes(i)
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2)
        ctx.fillStyle = status === 'error' ? 'rgba(239,68,68,0.12)' : status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(139,92,246,0.15)'
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2)
      ctx.strokeStyle = isSelected ? mainColor : dimColor
      ctx.lineWidth = isSelected ? 2.5 : 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(circle.cx, circle.cy, circle.r * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = isSelected ? mainColor : 'rgba(255,255,255,0.3)'
      ctx.fill()
    })
  },

  getCircleAtPoint(x, y) {
    for (let i = 0; i < this._circles.length; i++) {
      const dx = x - this._circles[i].cx
      const dy = y - this._circles[i].cy
      if (Math.sqrt(dx * dx + dy * dy) <= this._circles[i].r * 1.5) return i
    }
    return -1
  },

  onTouchStart(e) {
    if (this.data.gestureStatus === 'success') return
    this._selectedCircles = []
    this._lockStarted = true
    const touch = e.touches[0]
    const rect = this._canvasRect
    if (!rect) return
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    const idx = this.getCircleAtPoint(x, y)
    if (idx >= 0) this._selectedCircles = [idx]
    this.drawGesture({ x, y })
    this.setData({ gestureStatus: 'drawing' })
  },

  onTouchMove(e) {
    if (!this._lockStarted || this.data.gestureStatus === 'success') return
    const touch = e.touches[0]
    const rect = this._canvasRect
    if (!rect) return
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    const idx = this.getCircleAtPoint(x, y)
    if (idx >= 0 && !this._selectedCircles.includes(idx)) {
      this._selectedCircles.push(idx)
    }
    this.drawGesture({ x, y })
  },

  onTouchEnd() {
    if (!this._lockStarted || this.data.gestureStatus === 'success') return
    this._lockStarted = false

    if (this._selectedCircles.length < 4) {
      this._selectedCircles = []
      this.setData({ gestureStatus: 'normal', gestureHint: '至少需要连接4个点，请重试' })
      this.drawGesture()
      return
    }

    this.drawGesture(null)

    if (this.data.gestureStep === 'first') {
      this._firstGesture = JSON.stringify(this._selectedCircles)
      this._selectedCircles = []
      this.setData({
        gestureStep: 'confirm',
        gestureStatus: 'normal',
        gestureHint: '请再次绘制确认'
      })
      setTimeout(() => { this.drawGesture() }, 100)
    } else {
      const current = JSON.stringify(this._selectedCircles)
      if (current === this._firstGesture) {
        wx.setStorageSync('lockPattern', this._firstGesture)
        wx.setStorageSync('lockType', 'gesture')
        wx.setStorageSync('lockEnabled', '1')
        this.setData({
          gestureStatus: 'success',
          gestureHint: '手势密码设置成功',
          lockEnabled: true,
          lockType: 'gesture',
          hasGesture: true
        })
        wx.showToast({ title: '设置成功', icon: 'success' })
        setTimeout(() => { this.setData({ mode: 'settings' }) }, 1500)
      } else {
        this._selectedCircles = []
        this.setData({ gestureStatus: 'error', gestureHint: '两次绘制不一致，请重新开始' })
        setTimeout(() => {
          this._firstGesture = null
          this.setData({
            gestureStep: 'first',
            gestureStatus: 'normal',
            gestureHint: '请绘制图案（至少4个点）'
          })
          this.drawGesture()
        }, 1200)
      }
    }
  },

  // ----- PIN setup -----
  onNumTap(e) {
    if (this.data.pinStatus === 'success') return
    const num = e.currentTarget.dataset.num
    let pinInput = this.data.pinInput
    if (num === 'del') {
      pinInput = pinInput.slice(0, -1)
    } else if (num !== '' && pinInput.length < 6) {
      pinInput += num
    }
    this.setData({ pinInput, pinStatus: 'normal' })

    if (pinInput.length === 6) {
      if (this.data.pinStep === 'first') {
        this._firstPin = pinInput
        this.setData({
          pinStep: 'confirm',
          pinInput: '',
          pinHint: '请再次输入密码确认'
        })
      } else {
        if (pinInput === this._firstPin) {
          wx.setStorageSync('lockPin', pinInput)
          wx.setStorageSync('lockType', 'pin')
          wx.setStorageSync('lockEnabled', '1')
          this.setData({
            pinStatus: 'success',
            pinInput: '',
            lockEnabled: true,
            lockType: 'pin',
            hasPin: true
          })
          wx.showToast({ title: '设置成功', icon: 'success' })
          setTimeout(() => { this.setData({ mode: 'settings', pinHint: '请设置6位密码' }) }, 1500)
        } else {
          this.setData({ pinInput: '', pinStatus: 'error', pinHint: '两次输入不一致，请重新开始' })
          setTimeout(() => {
            this._firstPin = null
            this.setData({ pinStep: 'first', pinStatus: 'normal', pinHint: '请设置6位密码' })
          }, 1200)
        }
      }
    }
  },

  clearGesture() {
    wx.showModal({
      title: '清除手势密码',
      content: '确定清除已设置的手势密码吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('lockPattern')
          const hasPin = !!wx.getStorageSync('lockPin')
          if (!hasPin) {
            wx.removeStorageSync('lockEnabled')
            this.setData({ lockEnabled: false })
          }
          this.setData({ hasGesture: false })
          wx.showToast({ title: '已清除', icon: 'success' })
        }
      }
    })
  },

  clearPin() {
    wx.showModal({
      title: '清除数字密码',
      content: '确定清除已设置的数字密码吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('lockPin')
          const hasGesture = !!wx.getStorageSync('lockPattern')
          if (!hasGesture) {
            wx.removeStorageSync('lockEnabled')
            this.setData({ lockEnabled: false })
          }
          this.setData({ hasPin: false })
          wx.showToast({ title: '已清除', icon: 'success' })
        }
      }
    })
  }
})
