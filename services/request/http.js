import HttpRequest from './httprequest'
import { config as configData } from '../../config/index'
// 创建HTTP请求实例
const request = new HttpRequest()

// 动态获取 userStore 的函数
function getUserStore() {
  return require('../../store/user').default
}

// 定义一个函数来获取正确的上下文
function getCurrentPageContext() {
  try {
    const pages = getCurrentPages()
    if (!pages || pages.length === 0) {
      return undefined
    }
    return pages[pages.length - 1]
  } catch (e) {
    return undefined
  }
}

// 添加请求拦截器（添加 Token）
request.useRequestInterceptor((config) => {
  config.url = config.url.replace('/api/v1', configData.baseUrl + '/api/v1')
  config.header = config.headers || {}
  config.header.Authorization = `Bearer ${wx.getStorageSync('token') || ''}`
  return config
})

// 添加响应拦截器（统一错误处理）
request.useResponseInterceptor(
  (res) => {
    if (res.statusCode === 200) {
      if (
        res.header['content-type'] === 'text/event-stream' ||
        res.header['Content-Type'] === 'text/event-stream'
      ) {
        return res.data
      }
      if (res.data.code === 200) {
        return res.data.data
      } else {
        wx.showToast({
          title: res.data.msg || '请求发生错误',
          icon: 'none',
          duration: 1500,
          mask: false
        })
        return Promise.reject(res.data.msg)
      }
    }
    if (res.statusCode === 401) {
      // 如果已经有接口返回了401，那么后续接口则不做操作
      if (getUserStore().data.loginMark) {
        return
      }
      // 清理本地登录态
      getUserStore().clearAuth()

      // 标记需要重新登录，由页面 auth 弹窗处理
      try {
        const pages = getCurrentPages()
        const current = pages && pages[pages.length - 1]
        // 如果不在首页，尽量回到首页，交给首页弹窗登录
        if (!current || current.route !== 'pages/home/home') {
          wx.switchTab?.({ url: '/pages/home/home' }) ||
            wx.reLaunch({ url: '/pages/home/home' })
        } else {
          // 已在首页则直接返回，由页面生命周期触发弹窗
          const authRef =
            getCurrentPageContext().selectComponent('auth') ||
            getCurrentPageContext().selectComponent('#auth')
          authRef && authRef.login()
        }
      } catch (e) {}
      return
    }
    if (res.statusCode === 402) {
      return Promise.reject({
        code: 402,
        msg: '次数不足，请升级会员或购买加油包'
      })
    }
    wx.showToast({
      title: res.data.msg || res.message || '请求发生错误',
      icon: 'none',
      duration: 1500,
      mask: false
    })
    return Promise.reject(res.data) // 返回处理后的数据
  },
  (err) => {
    console.log(err, '位置222222')
    // 统一错误提示
    wx.showToast({
      title: err.message || '请求发生错误',
      icon: 'none',
      duration: 1500,
      mask: false
    })
    return Promise.reject(err)
  }
)

// 导出请求实例
export default request
