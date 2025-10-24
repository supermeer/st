import { uploadFile } from '../../../utils/fileUploader'

// index.js - 图片圆形裁剪上传
Page({
  data: {
    // 显示图像
    imageSrc: '',
    // 舞台尺寸
    stageWidth: 0,
    stageHeight: 0,
    // 裁剪圆直径
    cropSize: 300,
    // mask 计算
    maskTop: 0,
    maskBottom: 0,
    maskSide: 0,

    // 交互参数
    scale: 1,
    minScale: 0.5,
    maxScale: 3,
    translateX: 0,
    translateY: 0,

    // 原图尺寸
    imageNaturalWidth: 0,
    imageNaturalHeight: 0,

    // 适配与展示尺寸
    fitScale: 1,
    displayWidth: 0,
    displayHeight: 0,

    // 手势缓存
    _touching: false,
    _lastTouches: [],
    _lastDistance: 0,
    _lastCenter: { x: 0, y: 0 },

    // 其他
    ifPublic: true
  },

  onLoad(options) {
    const { src = '' } = options || {}
    if (src) {
      this.setData({ imageSrc: decodeURIComponent(src) })
      this.$loadImageInfo(decodeURIComponent(src))
    }
    this.initStage()
  },

  onReady() {
    // nothing
  },

  initStage() {
    const sys = wx.getSystemInfoSync()
    const stageWidth = sys.windowWidth
    const stageHeight = sys.windowHeight - 100 // 预留底部工具栏

    const cropSize = Math.min(stageWidth * 0.7, stageHeight * 0.7)
    const maskTop = (stageHeight - cropSize) / 2
    const maskBottom = maskTop
    const maskSide = (stageWidth - cropSize) / 2

    this.setData({ stageWidth, stageHeight, cropSize, maskTop, maskBottom, maskSide })

    // 居中通过 CSS 的 translate(-50%, -50%)，因此初始偏移为 0
    this.setData({ translateX: 0, translateY: 0 })
  },

  onChooseImage() {
    const chooseWithMedia = () => {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const file = res.tempFiles && res.tempFiles[0]
          const path = file && (file.tempFilePath || file.path)
          if (path) {
            this.setData({ imageSrc: path, scale: 1, translateX: 0, translateY: 0 })
            this.$loadImageInfo(path)
          } else {
            wx.showToast({ title: '未获取到图片', icon: 'none' })
          }
        },
        fail: () => {
          // 兜底到 chooseImage
          chooseWithImage()
        }
      })
    }

    const chooseWithImage = () => {
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const path = (res.tempFilePaths && res.tempFilePaths[0]) || ''
          if (path) {
            this.setData({ imageSrc: path, scale: 1, translateX: 0, translateY: 0 })
            this.$loadImageInfo(path)
          } else {
            wx.showToast({ title: '未获取到图片', icon: 'none' })
          }
        },
        fail: () => {
          wx.showToast({ title: '选择失败', icon: 'none' })
        }
      })
    }

    if (typeof wx.chooseMedia === 'function') {
      chooseWithMedia()
    } else {
      chooseWithImage()
    }
  },

  $loadImageInfo(path) {
    if (!path) return
    wx.getImageInfo({
      src: path,
      success: (info) => {
        const fitScale = Math.max(
          this.data.cropSize / (info.width || 1),
          this.data.cropSize / (info.height || 1)
        ) || 1
        const displayWidth = Math.round(info.width * fitScale * this.data.scale)
        const displayHeight = Math.round(info.height * fitScale * this.data.scale)
        this.setData({
          imageNaturalWidth: info.width,
          imageNaturalHeight: info.height,
          fitScale,
          displayWidth,
          displayHeight
        })
      }
    })
  },

  $updateDisplaySize(nextScale) {
    const min = this.data.minScale
    const max = this.data.maxScale
    const scale = Math.max(min, Math.min(max, typeof nextScale === 'number' ? nextScale : this.data.scale))
    const displayWidth = Math.round(this.data.imageNaturalWidth * this.data.fitScale * scale)
    const displayHeight = Math.round(this.data.imageNaturalHeight * this.data.fitScale * scale)
    this.setData({ scale, displayWidth, displayHeight })
  },

  onTouchStart(e) {
    if (!this.data.imageSrc) return
    const touches = e.touches
    this.setData({ _touching: true, _lastTouches: touches })
    if (touches.length === 2) {
      const d = this.$distance(touches[0], touches[1])
      const c = this.$center(touches[0], touches[1])
      this.setData({ _lastDistance: d, _lastCenter: c })
    }
  },

  onTouchMove(e) {
    if (!this.data._touching || !this.data.imageSrc) return
    const touches = e.touches

    if (touches.length === 1 && this.data._lastTouches.length === 1) {
      // 单指拖动
      const dx = touches[0].clientX - this.data._lastTouches[0].clientX
      const dy = touches[0].clientY - this.data._lastTouches[0].clientY
      this.setData({ translateX: this.data.translateX + dx, translateY: this.data.translateY + dy, _lastTouches: touches })
    } else if (touches.length === 2) {
      // 双指缩放
      const newDistance = this.$distance(touches[0], touches[1])
      const scaleChange = newDistance / (this.data._lastDistance || newDistance)
      let newScale = this.data.scale * scaleChange
      // 以双指中心为参考，做轻微平移，提升手感
      const newCenter = this.$center(touches[0], touches[1])
      const cx = newCenter.clientX - this.data._lastCenter.clientX
      const cy = newCenter.clientY - this.data._lastCenter.clientY

      this.$updateDisplaySize(newScale)
      this.setData({ translateX: this.data.translateX + cx, translateY: this.data.translateY + cy, _lastTouches: touches, _lastDistance: newDistance, _lastCenter: newCenter })
    } else {
      this.setData({ _lastTouches: touches })
    }
  },

  onTouchEnd() {
    this.setData({ _touching: false, _lastTouches: [], _lastDistance: 0 })
  },

  onScaleChange(e) {
    const v = Number(e.detail.value)
    this.$updateDisplaySize(v)
  },

  async onConfirm() {
    if (!this.data.imageSrc) {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }

    wx.showLoading({ title: '处理中...', mask: true })
    try {
      const tempPath = await this.$exportCircle()
      const res = await uploadFile({ filePath: tempPath, ifPublic: true, onStatusChange: () => {} })

      // 通过 EventChannel 返回
      const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel()
      eventChannel && eventChannel.emit('cropperDone', { localPath: tempPath, remoteUrl: res.remoteUrl, fileKey: res.fileKey })

      wx.showToast({ title: '已上传', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    } catch (err) {
      wx.showToast({ title: '处理失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  $distance(a, b) {
    const dx = a.clientX - b.clientX
    const dy = a.clientY - b.clientY
    return Math.sqrt(dx * dx + dy * dy)
  },

  $center(a, b) {
    return { clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 }
  },

  async $exportCircle() {
    const query = wx.createSelectorQuery()
    query.select('#previewCanvas').fields({ node: true, size: true }).exec()
    const res = await new Promise((resolve) => query.exec(resolve))
    const canvas = res && res[0] && res[0].node
    if (!canvas) throw new Error('canvas not found')

    const dpr = wx.getSystemInfoSync().pixelRatio || 2
    const size = Math.floor(this.data.cropSize * dpr)
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // 清空并建立裁剪圆形路径
    ctx.clearRect(0, 0, size, size)
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    // 计算图片绘制参数
    const { translateX, translateY, scale, imageNaturalWidth, imageNaturalHeight, cropSize, fitScale } = this.data

    // translateX/Y 为相对舞台中心的偏移
    const offsetX = translateX
    const offsetY = translateY

    // 计算图像当前显示尺寸（至少覆盖裁剪区域）
    const baseFitScale = fitScale || Math.max(cropSize / imageNaturalWidth, cropSize / imageNaturalHeight)
    const drawWidth = imageNaturalWidth * baseFitScale * scale * dpr
    const drawHeight = imageNaturalHeight * baseFitScale * scale * dpr

    // 偏移转到 canvas 尺寸空间（dpr 缩放）并以画布中心对齐
    const dx = (offsetX * dpr) + (size - drawWidth) / 2
    const dy = (offsetY * dpr) + (size - drawHeight) / 2

    // 绘制图片
    const img = canvas.createImage()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = this.data.imageSrc
    })
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight)

    ctx.restore()

    // 输出文件
    const tempPath = await new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvas,
        x: 0,
        y: 0,
        width: size,
        height: size,
        destWidth: size,
        destHeight: size,
        fileType: 'png',
        quality: 1,
        success: (r) => resolve(r.tempFilePath),
        fail: reject
      })
    })

    return tempPath
  }
})
