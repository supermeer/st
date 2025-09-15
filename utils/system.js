/**
 * 系统信息工具类
 * 提供获取导航栏高度、状态栏高度等系统相关信息
 */

const app = getApp()

// 设备环境类型
const DEVICE_TYPE = {
  IOS: 'ios',
  ANDROID: 'android',
  DEVTOOLS: 'devtools',
  UNKNOWN: 'unknown'
}

// 缓存系统信息
let cachedSystemInfo = null

/**
 * 获取系统信息
 * @returns {Object} 系统信息
 */
const getSystemInfo = () => {
  if (cachedSystemInfo) return cachedSystemInfo

  try {
    cachedSystemInfo = wx.getSystemInfoSync()
    return cachedSystemInfo
  } catch (e) {
    console.error('获取系统信息失败', e)
    return null
  }
}

/**
 * 获取设备类型
 * @returns {String} 设备类型，ios/android/devtools/unknown
 */
const getDeviceType = () => {
  const systemInfo = getSystemInfo()
  if (!systemInfo) return DEVICE_TYPE.UNKNOWN

  const { platform } = systemInfo
  if (platform === 'ios') return DEVICE_TYPE.IOS
  if (platform === 'android') return DEVICE_TYPE.ANDROID
  if (platform === 'devtools') return DEVICE_TYPE.DEVTOOLS

  return DEVICE_TYPE.UNKNOWN
}

/**
 * 检查是否为iOS设备
 * @returns {Boolean} 是否为iOS设备
 */
const isIOS = () => getDeviceType() === DEVICE_TYPE.IOS

/**
 * 检查是否为Android设备
 * @returns {Boolean} 是否为Android设备
 */
const isAndroid = () => getDeviceType() === DEVICE_TYPE.ANDROID

/**
 * 检查是否为开发者工具
 * @returns {Boolean} 是否为开发者工具
 */
const isDevTools = () => getDeviceType() === DEVICE_TYPE.DEVTOOLS

/**
 * 获取导航栏相关高度信息
 * @returns {Object} 导航栏高度信息
 */
const getNavInfo = () => {
  // 如果全局已有数据，直接返回
  if (app.globalData.navHeight > 0) {
    return {
      navHeight: app.globalData.navHeight,
      statusBarHeight: app.globalData.statusBarHeight,
      menuButtonInfo: app.globalData.menuButtonInfo,
      contentHeight: app.globalData.contentHeight
    }
  }

  // 否则重新获取
  return app.getNavHeight()
}

/**
 * 获取页面内容区域高度（屏幕高度减去导航栏高度）
 * @returns {Number} 内容区域高度（单位px）
 */
const getContentHeight = () => {
  const navInfo = getNavInfo()
  return navInfo ? navInfo.contentHeight : 0
}

/**
 * 获取安全区域信息
 * @returns {Object} 安全区域信息
 */
const getSafeArea = () => {
  const systemInfo = getSystemInfo()
  return systemInfo ? systemInfo.safeArea || null : null
}

/**
 * 获取底部安全区域高度
 * @returns {Number} 底部安全区域高度（单位px）
 */
const getBottomSafeHeight = () => {
  const safeArea = getSafeArea()
  if (!safeArea) return 0

  const systemInfo = getSystemInfo()
  if (!systemInfo) return 0

  return systemInfo.screenHeight - safeArea.bottom
}

/**
 * 监听页面尺寸变化
 * @param {Page} pageInstance 页面实例
 * @param {Function} callback 回调函数
 */
const observeViewportChange = (pageInstance, callback) => {
  if (!pageInstance || typeof callback !== 'function') return

  // 添加页面事件处理函数
  const originalOnResize = pageInstance.onResize

  pageInstance.onResize = function (res) {
    // 调用原有的onResize
    if (originalOnResize && typeof originalOnResize === 'function') {
      originalOnResize.call(this, res)
    }

    // 重新获取导航信息
    app.getNavHeight()

    // 清除缓存的系统信息
    cachedSystemInfo = null

    // 执行回调
    callback(res)
  }
}

module.exports = {
  getNavInfo,
  getContentHeight,
  getSafeArea,
  getBottomSafeHeight,
  getSystemInfo,
  getDeviceType,
  isIOS,
  isAndroid,
  isDevTools,
  DEVICE_TYPE,
  observeViewportChange
}
