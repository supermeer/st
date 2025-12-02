// pages/vip/agreement/index.js
import { getAgreement } from '../../../services/usercenter/index'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    agreementContent: '',
    agreementType: '',
    loading: true,
    title: '服务协议',
    typeNameMap: {
      1: '会员服务协议',
      2: '免责声明',
      3: '隐私政策',
      4: '小程序隐私保护指引'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取协议类型参数
    const { type } = options
    this.setData({
      agreementType: type,
      title: this.data.typeNameMap[type]
    })

    // 获取协议内容
    this.fetchAgreementContent(type)
  },

  /**
   * 获取协议内容
   */
  async fetchAgreementContent(type) {
    try {
      // 调用API获取协议内容
      const response = await this.getAgreementContent(type)

      if (response && response.content) {
        this.setData({
          agreementContent: response.content,
          loading: false
        })
      }
    } catch (error) {}
  },

  /**
   * 调用API获取协议内容
   */
  async getAgreementContent(type) {
    try {
      // 调用实际的API接口
      const response = await getAgreement(type)
      return response
    } catch (error) {}
  }
})
