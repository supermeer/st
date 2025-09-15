import ChatService, {
  getBloggerType,
  getStyleList
} from '../../../services/ai/chat'
import { getBloggerTypeHistory } from '../../../services/home/home.js'
import userStore from '../../../store/user'
// index.js
Page({
  data: {
    title: '写博文', // 从上级页面传入的标题
    commentContent: '', // 评价内容
    maxCommentLength: 1000, // 最大评价长度
    imageList: [], // 上传的图片列表
    maxImageCount: 9, // 最大上传图片数量
    remainTimes: 10, // 剩余次数
    selectedBlog: null, // 选中的博主
    selectedStyle: null, // 选中的风格类型
    sizeLimit: {
      size: 5,
      unit: 'MB',
      message: '图片大小不超过 {sizeLimit} MB'
    },
    showVipDialog: false,
    blogForm: {
      value: [],
      label: [],
      labelStr: '',
      visible: false,
      bloggertype: [],
      bloggerSubType: []
    },
    formData: {
      baowenStyleId: null,
      baowenStyleName: null,
      bloggerTypeId: null,
      menuId: null
    },
    // 风格选择 ActionSheet
    styleActionSheet: {
      visible: false,
      items: [],
      loading: false,
      hasLoaded: false
    },
    // 原始风格列表
    styleList: [],
    historyBlogList: [
      {
        name: '中此处',
        id: '1'
      },
      {
        name: '大尺寸',
        id: '2'
      }
    ]
  },

  onLoad(options) {
    userStore.bind(this)
    // 获取从上级页面传入的参数
    if (options.id) {
      this.setData({
        formData: {
          ...this.data.formData,
          menuId: options.id
        }
      })
    }
    if (options.title) {
      this.setData({
        title: options.title
      })
    }

    this.getBlogType()
    // 预加载风格列表
    this.loadStyleList()
    this.getBloggerTypeHistory()

    wx.setNavigationBarTitle({
      title: this.data.title || '评价'
    })
  },

  getBloggerTypeHistory() {
    getBloggerTypeHistory().then((res) => {
      this.setData({
        historyBlogList: res
      })
    })
  },
  getBlogType() {
    getBloggerType().then((res) => {
      const bloggertype = res.map((item) => ({
        ...item,
        label: item.name,
        value: item.id
      }))
      if (bloggertype.length === 0) {
        return
      }
      this.setData({
        'blogForm.bloggertype': bloggertype,
        'blogForm.bloggerSubType': (bloggertype[0].children || []).map(
          (item) => ({
            ...item,
            label: item.name,
            value: item.id
          })
        )
      })
    })
  },

  // 加载风格列表（一次性返回全部）
  async loadStyleList() {
    try {
      this.setData({ 'styleActionSheet.loading': true })
      const res = await getStyleList()
      const items = Array.isArray(res)
        ? res
        : res?.list || res?.items || res?.records || res?.data || []
      const actionItems = items.map((style) => ({ label: style.name }))
      this.setData({
        styleList: items,
        'styleActionSheet.items': actionItems,
        'styleActionSheet.hasLoaded': true,
        'styleActionSheet.loading': false
      })
    } catch (error) {
      this.setData({
        'styleActionSheet.hasLoaded': true,
        'styleActionSheet.loading': false
      })
    }
  },

  onHistoryBlogTap(e) {
    const { id } = e.currentTarget.dataset
    const item = this.data.historyBlogList.find((item) => item.id === id)
    if (!item) {
      return
    }
    const { parentId, parentName, name } = item
    this.setData({
      'formData.bloggerTypeId': id,
      'formData.bloggerTypeName': name,
      'blogForm.value': [parentId, id],
      'blogForm.label': [parentName, name],
      'blogForm.labelStr': `${parentName} / ${name}`
    })
  },

  // 清空按钮点击处理
  onClearBtnTap() {
    // 设置旋转状态为true
    this.setData({
      commentContent: ''
    })

    // 提示用户已清空
    wx.showToast({
      title: '已清空',
      icon: 'success',
      duration: 1500
    })
  },

  // 评价内容输入
  onCommentInput(e) {
    let value = e.detail.value
    if (value.length > this.data.maxCommentLength) {
      value = value.substring(0, this.data.maxCommentLength)
      wx.nextTick(() => {
        this.setData({
          commentContent: value
        })
      })
      return
    }
    this.setData({
      commentContent: value
    })
  },

  onCommentBlur(e) {
    let value = e.detail.value

    // 双重保险：在失焦时再次校验长度
    if (value.length > this.data.maxCommentLength) {
      value = value.substring(0, this.data.maxCommentLength)
      this.setData({
        commentContent: value
      })
    }
  },

  // 查看历史记录
  viewHistory() {
    // 测试ai/chat/session/index
    wx.navigateTo({
      url: '/pages/chat/history/index'
    })
    // wx.navigateTo({
    //   url: '../history/index?categoryType=' + this.data.categoryType
    // })
  },

  // 立即生成
  generateContent() {
    const { commentContent, imageList, formData } = this.data
    // 校验是否有上传中的文件
    const uploadingFiles = imageList.filter((file) => file.status === 'loading')
    if (uploadingFiles.length > 0) {
      wx.showToast({
        title: '请等待上传完成',
        icon: 'none'
      })
      return
    }

    if (!formData.bloggerTypeId) {
      wx.showToast({
        title: '请选择博主',
        icon: 'none'
      })
      return
    }
    if (!formData.baowenStyleId) {
      wx.showToast({
        title: '请选择风格类型',
        icon: 'none'
      })
      return
    }
    if (!commentContent.trim()) {
      wx.showToast({
        title: '请输入笔记要求',
        icon: 'none'
      })
      return
    }

    // 提交数据到服务器
    wx.showLoading({
      title: '生成中...',
      mask: true
    })
    ChatService.createSession({
      menuId: formData.menuId,
      bloggerTypeId: formData.bloggerTypeId,
      baowenStyleId: formData.baowenStyleId
    })
      .then((res) => {
        const sessionId = res
        wx.setStorageSync('commentContent', commentContent)
        wx.setStorageSync(
          'imageKeys',
          imageList.map((item) => item.fileKey) || []
        )
        wx.setStorageSync(
          'imageList',
          imageList.map((item) => item.url)
        )
        wx.redirectTo({
          url: `/pages/chat/session/index?sessionId=${sessionId}&isCreate=true`
        })
      })
      .catch((err) => {
        if (err.code === 402) {
          this.setData({
            showVipDialog: true
          })
        }
      })
      .finally(() => {
        wx.hideLoading()
      })
  },
  onOpenVip() {
    wx.navigateTo({
      url: '/pages/vip/packages/index'
    })
    this.setData({
      showVipDialog: false
    })
  },
  onCancel() {
    this.setData({
      showVipDialog: false
    })
  },
  handleRemove(e) {
    const { index } = e.detail
    const { imageList } = this.data
    imageList.splice(index, 1)
    this.setData({
      imageList
    })
  },
  onFilesChange(e) {
    const { files } = e.detail
    this.setData({ imageList: files })
  },
  onStyleItemTap() {
    if (
      !this.data.styleActionSheet.hasLoaded &&
      !this.data.styleActionSheet.loading
    ) {
      this.loadStyleList()
    }
    this.setData({
      'styleActionSheet.visible': true
    })
  },
  onBlogTap() {
    if (this.data.blogForm.value.length > 0) {
      const type = this.data.blogForm.bloggertype.find(
        (item) => item.value === this.data.blogForm.value[0]
      )
      this.setData({
        'blogForm.bloggerSubType': type.children.map((item) => ({
          ...item,
          label: item.name,
          value: item.id
        }))
      })
    }
    this.setData({
      'blogForm.visible': true
    })
  },
  onPickerChange(e) {
    const { value, label, columns } = e.detail
    const subType = this.data.blogForm.bloggerSubType[columns[1].index]
    this.setData({
      'blogForm.value': [value[0], subType.value],
      'blogForm.visible': false,
      'blogForm.label': [label[0], subType.label],
      'blogForm.labelStr': `${label[0]} / ${subType.label}`,
      'formData.bloggerTypeId': subType.value
    })
  },
  onColumnChange(e) {
    if (e.detail.column === 0) {
      const type = this.data.blogForm.bloggertype[e.detail.index]
      if (type) {
        const bloggerSubType = type.children.map((item) => ({
          ...item,
          label: item.name,
          value: item.id
        }))
        this.setData({
          'blogForm.bloggerSubType': bloggerSubType
        })
      }
    }
  },
  onPickerCancel(e) {
    this.setData({
      'blogForm.visible': false
    })
  },
  onStyleSelect(e) {
    const detail = e.detail
    let index = detail.index
    const style = this.data.styleList[index]
    if (style) {
      this.setData({
        'formData.baowenStyleId': style.id,
        'formData.baowenStyleName': style.name,
        'styleActionSheet.visible': false
      })
    } else {
      this.setData({ 'styleActionSheet.visible': false })
    }
  },
  onStyleClose() {
    this.setData({ 'styleActionSheet.visible': false })
  }
})
