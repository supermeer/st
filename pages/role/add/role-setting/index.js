import SystemInfo from '../../../../utils/system'

const SHORTCUT_PANEL_HEIGHT_RPX = 164
const SAVE_FOOTER_HEIGHT_RPX = 120
const DEFAULT_EDITOR_BOTTOM_GAP_RPX = 24
const MIN_EDITOR_HEIGHT_PX = 160

const QUICK_TEMPLATES = [
  '状态栏',
  '基础信息',
  '外貌描写',
  '人生经历',
  '关系网'
]

Page({
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0,
      windowHeight: 0,
      windowWidth: 375
    },
    value: '',
    keyboardHeight: 0,
    isKeyboardVisible: false,
    pageBodyBottom: '0px',
    shortcutBottom: '0px',
    shortcutPanelHeight: `${SHORTCUT_PANEL_HEIGHT_RPX}rpx`,
    editorCardStyle: `height: ${MIN_EDITOR_HEIGHT_PX}px;`,
    headerHeight: 0,
    cursorPosition: -1,
    placeholder: '填写智能体的信息，包含但不限于智能体的人设、性格、身份、背景、经历、与用户的关系等。',
    commonTemplates: [
      {
        name: '{{char}}',
        value: '{{char}}'
      },
      {
        name: '{{user}}',
        value: '{{user}}'
      },
    ],
    quickTemplates: [
      {
        name: '状态栏',
        value: '\n<StatusBlock>\n# {{char}}\n好感度：50/100'
      },
      {
        name: '基础信息',
        value: '{{char}}'
      },
      {
        name: '外貌描写',
        value: '{{char}}'
      },
      {
        name: '人生经历',
        value: '{{char}}'
      },
      {
        name: '关系网',
        value: '{{char}}'
      },
      {
        name: '习惯喜好',
        value: '{{char}}'
      },
      {
        name: '灵魂设定',
        value: '{{char}}'
      },
      {
        name: '对话风格',
        value: '{{char}}'
      },
    ]
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      pageInfo: {
        ...this.data.pageInfo,
        ...SystemInfo.getPageInfo(),
        windowHeight: systemInfo.windowHeight || systemInfo.screenHeight || 0,
        windowWidth: systemInfo.windowWidth || 375
      },
      value: options.value ? decodeURIComponent(options.value) : ''
    })
    this.measureHeaderHeight(() => {
      this.updateKeyboardLayout(0)
    })
    const nav = this.selectComponent('#roleSettingNav')
    if (nav) {
      nav.setBackAction(this.backAction)
    }
  },

  backAction() {
    const tipDialog = this.selectComponent('#tip-dialog')
    let content = '是否保存角色当前设置？'
    tipDialog.show({
      title: '',
      content,
      cancelText: '取消',
      confirmText: '保存',
      onCancel: () => {
        wx.navigateBack()
      },
      onConfirm: async () => {
        const prevPage = getCurrentPages()[getCurrentPages().length - 2]
        if (prevPage && typeof prevPage.confirmRoleSetting === 'function') {
          prevPage.confirmRoleSetting({
            value: this.data.value || ''
          })
        }
        wx.navigateBack()
      }
    })
  },

  onShow() {
    this.measureHeaderHeight(() => {
      this.updateKeyboardLayout(0)
    })
    if (wx && wx.onKeyboardHeightChange) {
      if (this._keyboardHeightListener && wx.offKeyboardHeightChange) {
        wx.offKeyboardHeightChange(this._keyboardHeightListener)
      }
      this._keyboardHeightListener = (res) => {
        this.updateKeyboardLayout(res.height || 0)
      }
      wx.onKeyboardHeightChange(this._keyboardHeightListener)
    }
  },

  onHide() {
    this.clearKeyboardListener()
    this.updateKeyboardLayout(0)
  },

  onUnload() {
    this.clearKeyboardListener()
  },

  measureHeaderHeight(callback) {
    wx.nextTick(() => {
      const query = this.createSelectorQuery()
      query.select('.header-block').boundingClientRect()
      query.exec((res) => {
        const headerHeight = res && res[0] ? res[0].height || 0 : 0
        this.setData({
          headerHeight
        }, () => {
          if (typeof callback === 'function') {
            callback()
          }
        })
      })
    })
  },

  rpxToPx(rpx) {
    const windowWidth = this.data.pageInfo.windowWidth || 375
    return (Number(rpx) || 0) * windowWidth / 750
  },

  clearKeyboardListener() {
    if (this._keyboardHeightListener && wx && wx.offKeyboardHeightChange) {
      wx.offKeyboardHeightChange(this._keyboardHeightListener)
      this._keyboardHeightListener = null
    }
  },

  updateKeyboardLayout(height = 0) {
    const keyboardHeight = Number(height) || 0
    const isKeyboardVisible = keyboardHeight > 0
    const { safeAreaBottom = 0, navHeight = 0, windowHeight = 0 } = this.data.pageInfo
    const headerHeight = this.data.headerHeight || 0
    const shortcutPanelHeightPx = this.rpxToPx(SHORTCUT_PANEL_HEIGHT_RPX)
    const saveFooterHeightPx = this.rpxToPx(SAVE_FOOTER_HEIGHT_RPX)
    const defaultEditorBottomGapPx = this.rpxToPx(DEFAULT_EDITOR_BOTTOM_GAP_RPX)
    const reservedBottomHeight = isKeyboardVisible
      ? keyboardHeight + shortcutPanelHeightPx
      : safeAreaBottom + saveFooterHeightPx + defaultEditorBottomGapPx
    const editorHeight = Math.max(
      MIN_EDITOR_HEIGHT_PX,
      Math.floor(windowHeight - navHeight - headerHeight - reservedBottomHeight)
    )
    const editorCardStyle = `height: ${editorHeight}px;`

    this.setData({
      keyboardHeight,
      isKeyboardVisible,
      pageBodyBottom: '0px',
      shortcutBottom: `${keyboardHeight}px`,
      editorCardStyle
    })
  },

  onInput(event) {
    const { value, cursor } = event.detail
    this.setData({
      value,
      cursorPosition: typeof cursor === 'number' ? cursor : value.length
    })
  },

  onFocus(event) {
    this.setData({
      cursorPosition: typeof event.detail.cursor === 'number'
        ? event.detail.cursor
        : this.data.value.length
    })
    this.updateKeyboardLayout(event.detail.height || this.data.keyboardHeight || 0)
  },

  onBlur() {
    this.updateKeyboardLayout(0)
  },

  onKeyboardHeightChange(event) {
    const height = event.detail.height || 0
    this.updateKeyboardLayout(height)
  },

  onInsertTemplate(event) {
    const { name, value } = event.currentTarget.dataset.value
    const currentValue = this.data.value || ''
    const cursorPosition = this.data.cursorPosition
    const insertIndex = cursorPosition >= 0 ? cursorPosition : currentValue.length
    const nextValue = `${currentValue.slice(0, insertIndex)}${value}${currentValue.slice(insertIndex)}`
    const nextCursor = insertIndex + value.length

    this.setData({
      value: nextValue,
      cursorPosition: nextCursor
    })
  },

  onSubmit() {
    const prevPage = getCurrentPages()[getCurrentPages().length - 2]
    if (prevPage && typeof prevPage.confirmRoleSetting === 'function') {
      prevPage.confirmRoleSetting({
        value: this.data.value || ''
      })
    }
    wx.navigateBack()
  }
})
