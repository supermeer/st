const { Store } = require('../miniprogram_npm/westore/index.js')
import { getMyVipInfo } from '../services/usercenter/index'

const DEFAULT_USER = {
  avatarUrl: '',
  nickname: '',
  phone: '',
  state: '',
  id: null,
  openId: null
}

const DEFAULT_VIP_INFO = {
  giftRemaining: 0,
  monthlyExpireTime: 0,
  monthlyRemaining: 0,
  ifVip: false,
  monthlyRemainingDays: 0,
  formattedMonthlyExpireTime: ''
}

function clone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (e) {
    return obj
  }
}

class UserStore extends Store {
  constructor() {
    super()
    // 手动管理视图绑定，避免数据被覆盖
    this.views = {}
    this._westoreViewId = 0
    this.data = {
      userInfo: {},
      loginMark: false,
      vipInfo: {}
    }
  }

  // 重写 bind 方法，只绑定用户相关字段，避免覆盖页面其他数据
  bind(view, key) {
    // 不调用父类的 bind 方法，避免 this.data 被重定向到 view.data
    // 而是手动管理绑定关系
    if (typeof key === 'string') {
      this.views[key] = view
    } else {
      this.views[this._westoreViewId++] = view
    }

    // 确保默认值存在
    this._injectDefaultsIfMissing()

    // 只同步用户相关数据到视图，不覆盖页面的其他数据
    const userData = {
      userInfo: this.data.userInfo,
      loginMark: this.data.loginMark,
      vipInfo: this.data.vipInfo
    }

    if (typeof key === 'string' && this.views[key]) {
      this.views[key].setData(userData)
    } else {
      view.setData(userData)
    }
  }

  // 绑定到页面/组件，并确保必要字段存在
  bindTo(view, key) {
    this.bind(view, key)
  }

  // 重写 update 方法，只更新用户相关字段
  update(viewKey, callback) {
    const userData = {
      userInfo: this.data.userInfo,
      loginMark: this.data.loginMark,
      vipInfo: this.data.vipInfo
    }

    if (arguments.length === 1 && typeof viewKey === 'string') {
      // 更新指定视图
      if (this.views[viewKey] && this.views[viewKey].setData) {
        this.views[viewKey].setData(userData, callback)
      }
    } else {
      // 更新所有绑定的视图
      const cb = arguments.length === 1 ? viewKey : callback
      for (const key in this.views) {
        if (this.views[key] && this.views[key].setData) {
          this.views[key].setData(userData, cb)
        }
      }
    }
  }

  _injectDefaultsIfMissing() {
    if (!this.data) return
    if (typeof this.data.vipInfo === 'undefined') {
      this.data.vipInfo = {}
    }
    if (!this.data.userInfo) {
      this.data.userInfo = clone(DEFAULT_USER)
    }
  }

  initFromLocal() {
    const user = wx.getStorageSync('user')
    const vipInfo = wx.getStorageSync('vipInfo')
    // 如果当前没有绑定视图，this.data 可能还未初始化，这里临时承载
    if (!this.data) {
      this.data = {}
    }
    this.data.userInfo = user || null
    this.data.vipInfo = vipInfo || null
    this._injectDefaultsIfMissing()
  }

  setLoginMark(mark) {
    if (!this.data) {
      this.data = {}
    }
    this.data.loginMark = !!mark
    this.update()
  }

  // payload: { user, token, openId } 或 { token, openId, user }
  setLoginSuccess(payload = {}) {
    const { user, token, openId } = payload
    if (token) wx.setStorageSync('token', token)
    if (openId) wx.setStorageSync('openId', openId)
    if (user) wx.setStorageSync('user', user)

    if (!this.data) this.data = {}
    this.data.userInfo = user || this.data.userInfo || clone(DEFAULT_USER)
    this.data.loginMark = false
    this.refreshVipInfo()
    this.update()
  }

  updateUser(partial = {}) {
    if (!this.data) this.data = {}
    this.data.userInfo = {
      ...(this.data.userInfo || clone(DEFAULT_USER)),
      ...partial
    }
    try {
      wx.setStorageSync('user', this.data.userInfo)
    } catch (e) {}
    this.update()
  }
  refreshVipInfo() {
    return getMyVipInfo().then((res) => {
      // 创建日期对象
      const date = new Date(res.monthlyExpireTime)

      // 格式化日期为 YYYY年MM月DD日
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const formattedDate = `${year}年${month}月${day}日`
      this.data.vipInfo = {
        ...this.data.vipInfo,
        ...res,
        formattedMonthlyExpireTime: formattedDate
      }
      wx.setStorageSync('vipInfo', this.data.vipInfo)
      this.update()
      return this.data.vipInfo
    })
  }

  setVipStatus(isVip, vipInfo) {
    try {
      wx.setStorageSync('user', this.data.userInfo)
      if (this.data.vipInfo) {
        wx.setStorageSync('vipInfo', this.data.vipInfo)
      }
    } catch (e) {}
    this.update()
  }

  updateVipInfo(vipInfo) {
    this.data.vipInfo = vipInfo
    this.update()
  }

  clearAuth() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('openId')
    wx.removeStorageSync('user')
    wx.removeStorageSync('vipInfo')
    if (!this.data) this.data = {}
    this.data.userInfo = null
    this.data.vipInfo = null
    this.update()
  }
}

const userStore = new UserStore()
export default userStore
