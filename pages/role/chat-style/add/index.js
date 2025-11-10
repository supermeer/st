import SystemInfo from '../../../../utils/system'
import { createChatStyle } from '../../../../services/role/index'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    chatInfo: {
      name: '沈川寒',
      avatar: 'https://img.zcool.cn/community/01c8b25e8f8f8da801219c779e8c95.jpg@1280w_1l_2o_100sh.jpg',
      description: '便利店的温柔店员'
    },
    formData: {
      title: '',
      description: '',
      chatExample: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取传递的参数（角色ID等）
    if (options.roleId) {
      this.loadRoleInfo(options.roleId)
    }
    this.setData({
      pageInfo: { ...this.data.pageInfo, ...SystemInfo.getPageInfo() }
    })
  },

  /**
   * 加载角色信息
   */
  loadRoleInfo(roleId) {
    // TODO: 调用接口获取角色信息
    console.log('加载角色信息:', roleId)
  },

  /**
   * 风格标题输入
   */
  onTitleInput(event) {
    this.setData({
      'formData.title': event.detail.value
    })
  },

  /**
   * 风格描述输入
   */
  onDescriptionInput(event) {
    this.setData({
      'formData.description': event.detail.value
    })
  },

  /**
   * 对话示例输入
   */
  onChatExampleInput(event) {
    this.setData({
      'formData.chatExample': event.detail.value
    })
  },

  /**
   * 提交表单
   */
  onSubmit() {
    const { title, description, chatExample } = this.data.formData

    // 验证必填项
    if (!title.trim()) {
      wx.showToast({
        title: '请输入风格标题',
        icon: 'none'
      })
      return
    }

    if (!description.trim()) {
      wx.showToast({
        title: '请输入风格描述',
        icon: 'none'
      })
      return
    }

    if (!chatExample.trim()) {
      wx.showToast({
        title: '请输入对话示例',
        icon: 'none'
      })
      return
    }

    createChatStyle(this.data.formData).then(res => {
      console.log(res, '----------')
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        }
      })
    })
  }
})

