import { Toast } from 'tdesign-miniprogram'
import { getPackages } from '../../../services/order/index'
import { getQuotaInfo } from '../../../services/usercenter/index'
import userStore from '../../../store/user'
import SystemInfo from '../../../utils/system'

Page({
  data: {
    selectedPackage: null,
    packages: [
      {
        id: 1,
        title: 'VIP月卡100',
        amountInFen: 10000,
        amountInYuan: 100,
        originAmount: 10000,
        originAmountInYuan: 100,
        benefitInfo: '["可用次数100次", "历史记录30天"]',
        benefitInfoArr: ['可用次数100次', '历史记录30天']
      },
      {
        id: 2,
        title: 'VIP季卡300',
        amountInFen: 30000,
        amountInYuan: 300,
        originAmount: 30000,
        originAmountInYuan: 300,
        benefitInfo: '["可用次数300次", "历史记录90天"]',
        benefitInfoArr: ['可用次数300次', '历史记录90天']
      },
      {
        id: 3,
        title: 'VIP季卡300',
        amountInFen: 30000,
        amountInYuan: 300,
        originAmount: 30000,
        originAmountInYuan: 300,
        benefitInfo: '["可用次数300次", "历史记录90天"]',
        benefitInfoArr: ['可用次数300次', '历史记录90天']
      },
      {
        id: 4,
        title: 'VIP季卡300',
        amountInFen: 30000,
        amountInYuan: 300,
        originAmount: 30000,
        originAmountInYuan: 300,
        benefitInfo: '["可用次数300次", "历史记录90天"]',
        benefitInfoArr: ['可用次数300次', '历史记录90天']
      },
      {
        id: 5,
        title: 'VIP季卡300',
        amountInFen: 30000,
        amountInYuan: 300,
        originAmount: 30000,
        originAmountInYuan: 300,
        benefitInfo: '["可用次数300次", "历史记录90天"]',
        benefitInfoArr: ['可用次数300次', '历史记录90天']
      }
    ],
    quotaInfo: {
      imageGenCurrent: 40,
      imageGenMember: 80,
      video1Current: 10,
      video1Member: 20,
      video2Current: 5,
      video2Member: 7,
      downloadMember: 4
    },
    scrollTop: 0,
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    }
  },

  onLoad: function (options) {
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
    this.getPackages()
    this.getQuotaInfo()
    userStore.bind(this)
  },

  getPackages() {
    getPackages().then((res) => {
      const data = (res || []).map((item) => ({
        ...item,
        amountInYuan: (item.amountInFen / 100).toFixed(0),
        originAmountInYuan: (item.originAmount / 100).toFixed(2),
        benefitInfoArr: JSON.parse(item.benefitInfo || '[]')
      }))
      if (data.length) {
        this.setData({
          selectedPackage: data[0],
          packages: data
        })
      }
    })
  },

  getQuotaInfo() {
    getQuotaInfo().then((res) => {
      // 根据实际接口返回的数据结构来设置
      // 这里假设接口返回的数据结构，需要根据实际情况调整
      this.setData({
        quotaInfo: {
          imageGenCurrent: res.imageGenCurrent || 40,
          imageGenMember: res.imageGenMember || 80,
          video1Current: res.video1Current || 10,
          video1Member: res.video1Member || 20,
          video2Current: res.video2Current || 5,
          video2Member: res.video2Member || 7,
          downloadMember: res.downloadMember || 4
        }
      })
    }).catch(() => {
      // 如果接口失败，使用默认值
    })
  },

  // 选择套餐
  onSelectPackage: function (e) {
    const packageId = e.currentTarget.dataset.id
    this.setData({
      selectedPackage:
        this.data.packages.find((item) => item.id === packageId) ||
        this.data.packages[0]
    })
  },

  // 返回按钮点击
  onBackClick: function () {
    // 导航栏组件内部已处理返回逻辑，这里可以添加额外处理
  },

  // 立即开通
  onPurchase: function () {
    const selectedPackage = this.data.selectedPackage

    if (!selectedPackage) {
      Toast({
        message: '请选择套餐',
        duration: 2000
      })
      return
    }

    // 将选中的套餐信息传递到订单确认页面
    const packageInfo = JSON.stringify(selectedPackage)

    wx.navigateTo({
      url: `/pages/vip/order-confirm/index?package=${encodeURIComponent(
        packageInfo
      )}`
    })
  },

  // 点击服务协议
  serviceTap: function (e) {
    wx.navigateTo({
      url: '/pages/common/agreement/index?type=1'
    })
  }
})
