Page({
  data: {
    lockType: 'gesture', // 'gesture' | 'pin'
    gestureStatus: 'normal', // 'normal' | 'drawing' | 'error' | 'success'
    gestureHint: '请绘制解锁图案',
    pinInput: '',
    pinStatus: 'normal', // 'normal' | 'error' | 'success'
    pinHint: '请输入密码',
    pinDots: [0, 1, 2, 3, 4, 5],
    numPad: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'],
    hasGesture: false,
    hasPin: false,
  },

  _canvas: null,
  _ctx: null,
  _canvasWidth: 0,
  _canvasHeight: 0,
  _circles: [],
  _selectedCircles: [],
  _canvasRect: null,
  _lockStarted: false,
  _errorCount: 0,

  onLoad() {
    const lockType = wx.getStorageSync('lockType') || 'gesture'
    const hasGesture = !!wx.getStorageSync('lockPattern')
    const hasPin = !!wx.getStorageSync('lockPin')

    let activeType = lockType
    if (activeType === 'gesture' && !hasGesture && hasPin) activeType = 'pin'
    if (activeType === 'pin' && !hasPin && hasGesture) activeType = 'gesture'

    this.setData({ lockType: activeType, hasGesture, hasPin })
  },

  onReady() {
    if (this.data.lockType === 'gesture') {
      this.initCanvas()
    }
  },

  initCanvas() {
    wx.createSelectorQuery()
      .in(this)
      .select('#lock-canvas')
      .boundingClientRect((rect) => {
        if (!rect) return
        this._canvasRect = rect
        wx.createSelectorQuery()
          .in(this)
          .select('#lock-canvas')
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
    const mainColor = status === 'error' ? '#EF4444' : '#8B5CF6'
    const dimColor = 'rgba(255,255,255,0.25)'

    ctx.clearRect(0, 0, w, h)

    // Connection lines between selected circles
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

    // Line to current touch position
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

    // Draw circles
    circles.forEach((circle, i) => {
      const isSelected = selected.includes(i)

      if (isSelected) {
        ctx.beginPath()
        ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2)
        ctx.fillStyle = status === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(139,92,246,0.15)'
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
    const circles = this._circles
    for (let i = 0; i < circles.length; i++) {
      const dx = x - circles[i].cx
      const dy = y - circles[i].cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= circles[i].r * 1.5) return i
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
    this.setData({ gestureStatus: 'drawing', gestureHint: '请绘制解锁图案' })
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
      this.setData({ gestureStatus: 'normal', gestureHint: '至少需要连接4个点' })
      this.drawGesture()
      return
    }

    this.drawGesture(null)
    this.verifyGesture()
  },

  verifyGesture() {
    const pattern = JSON.stringify(this._selectedCircles)
    const stored = wx.getStorageSync('lockPattern')

    if (pattern === stored) {
      this.setData({ gestureStatus: 'success', gestureHint: '解锁成功' })
      setTimeout(() => { wx.navigateBack() }, 500)
    } else {
      this._errorCount++
      const remaining = 5 - this._errorCount
      if (remaining <= 0) {
        this.setData({ gestureStatus: 'error', gestureHint: '尝试次数已达上限' })
        if (this.data.hasPin) {
          setTimeout(() => { this.switchLockType() }, 1500)
        }
        return
      }
      this.setData({ gestureStatus: 'error', gestureHint: `图案不正确，还可尝试 ${remaining} 次` })
      setTimeout(() => {
        this._selectedCircles = []
        this.setData({ gestureStatus: 'normal', gestureHint: '请重新绘制图案' })
        this.drawGesture()
      }, 1000)
    }
  },

  onNumTap(e) {
    if (this.data.pinStatus === 'success') return
    const num = e.currentTarget.dataset.num
    let pinInput = this.data.pinInput
    if (num === 'del') {
      pinInput = pinInput.slice(0, -1)
    } else if (num !== '' && pinInput.length < 6) {
      pinInput += num
    }
    this.setData({ pinInput, pinStatus: 'normal', pinHint: '请输入密码' })
    if (pinInput.length === 6) this.verifyPin(pinInput)
  },

  verifyPin(pin) {
    const stored = wx.getStorageSync('lockPin')
    if (pin === stored) {
      this.setData({ pinStatus: 'success', pinHint: '解锁成功' })
      setTimeout(() => { wx.navigateBack() }, 500)
    } else {
      this._errorCount++
      const remaining = 5 - this._errorCount
      if (remaining <= 0) {
        this.setData({ pinInput: '', pinStatus: 'error', pinHint: '尝试次数已达上限' })
        return
      }
      this.setData({ pinInput: '', pinStatus: 'error', pinHint: `密码错误，还可尝试 ${remaining} 次` })
    }
  },

  switchLockType() {
    const newType = this.data.lockType === 'gesture' ? 'pin' : 'gesture'
    this._errorCount = 0
    this.setData({
      lockType: newType,
      pinInput: '',
      pinStatus: 'normal',
      pinHint: '请输入密码',
      gestureStatus: 'normal',
      gestureHint: '请绘制解锁图案'
    })
    if (newType === 'gesture') {
      this._selectedCircles = []
      setTimeout(() => { this.initCanvas() }, 100)
    }
  },

  onForgot() {
    wx.showModal({
      title: '忘记密码',
      content: '重置密码将清除屏幕锁，确定继续吗？',
      confirmColor: '#8B5CF6',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('lockEnabled')
          wx.removeStorageSync('lockPattern')
          wx.removeStorageSync('lockPin')
          wx.removeStorageSync('lockType')
          wx.reLaunch({ url: '/pages/home/home' })
        }
      }
    })
  }
})
