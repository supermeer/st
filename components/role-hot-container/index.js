function formatCount(value) {
  const n = Number(value) || 0
  if (n >= 10000) {
    return `${Math.floor((n / 10000) * 10) / 10}w`
  }
  if (n >= 1000) {
    return `${Math.floor((n / 1000) * 10) / 10}k`
  }
  return String(n)
}

Component({
  properties: {
    chatCount: {
      type: Number,
      value: 0
    },
    roleHot: {
      type: Number,
      value: 0
    }
  },
  data: {
    chatCountText: '0',
    roleHotText: '0'
  },
  observers: {
    chatCount(value) {
      this.setData({ chatCountText: formatCount(value) })
    },
    roleHot(value) {
      this.setData({ roleHotText: formatCount(value) })
    }
  }
})
