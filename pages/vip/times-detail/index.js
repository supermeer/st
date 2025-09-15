// 引入API服务
const Toast = require('tdesign-miniprogram/toast/index')
import { getQuotaInfo } from '../../../services/usercenter/index'
import { formatTime } from '../../../utils/util'

Page({
  data: {
    list: []
  },

  onLoad: function () {
    // 获取订单数据
    this.getTimesList(true)
  },

  // 获取订单列表
  getTimesList: async function () {
    const res = await getQuotaInfo()
    //     endTime: "2025-10-06T12:06:06"
    // orderType: 101
    // planTitle: "100次"
    // remaining: 92
    // startTime: "2025-09-06T12:06:06"
    // status: 1
    const list = (res.monthlyCycles || []).map((item) => {
      return {
        ...item,
        startTime: item.startTime
          ? formatTime(item.startTime, 'YYYY.MM.DD')
          : '',
        endTime: item.endTime ? formatTime(item.endTime, 'YYYY.MM.DD') : ''
      }
    })

    this.setData({
      list: list
    })
  },
  // 返回按钮点击
  onBackClick: function () {
    // 导航栏组件内部已处理返回逻辑，这里可以添加额外处理
  }
})
