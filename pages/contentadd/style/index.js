// pages/contentadd/style/index.js
import { getStyleList } from '../../../services/ai/chat'

Page({
  data: {
    styleList: [],
    hasLoaded: false,
    loading: false,
    scrollTop: 0
  },

  onLoad() {
    this.setData({ loading: true })
    this.loadStyleList()
  },

  // 加载风格列表（一次性返回全部）
  async loadStyleList() {
    try {
      const res = await getStyleList()
      const items = Array.isArray(res)
        ? res
        : res?.list || res?.items || res?.records || res?.data || []

      this.setData({
        styleList: items,
        hasLoaded: true,
        loading: false
      })
    } catch (error) {
      this.setData({
        hasLoaded: true,
        loading: false
      })
    }
  },

  onStyleItemClick(e) {
    const style = e.currentTarget.dataset.style
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      prevPage.setData({
        formData: {
          ...prevPage.data.formData,
          baowenStyleId: style.id,
          baowenStyleName: style.name
        }
      })
    }
    wx.navigateBack()
  }
})
