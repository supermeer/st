import SystemInfo from '../../../../utils/system'

const SHORTCUT_PANEL_HEIGHT_RPX = 230
const SAVE_FOOTER_HEIGHT_RPX = 126

Page({
  data: {
    pageInfo: {
      safeAreaBottom: 0,
      navHeight: 0
    },
    value: '',
    textareaFocus: false,
    keyboardHeight: 0,
    contentHeight: '0',
    shortcutPanelHeight: `${SHORTCUT_PANEL_HEIGHT_RPX}rpx`,
    cursorPosition: -1,
    placeholder:
      '填写智能体的信息，包含但不限于智能体的人设、性格、身份、背景、经历、与用户的关系等。',
    commonTemplates: [
      {
        name: '{{char}}',
        value: '{{char}}'
      },
      {
        name: '{{user}}',
        value: '{{user}}'
      },
      {
        name: '“”',
        value: '“”'
      },
      {
        name: '（）',
        value: '（）'
      }
    ],
    quickTemplates: [
      {
        name: '状态栏',
        value:
          '\n<StatusBlock>\n- 当前时间: 傍晚 | 深夜 // 故事情节发展，时间自然流逝\n- 当前地点: 客厅\n- 核心情绪: 愉悦满足 // 因为你的一个拥抱，他的心情变好了\n- 当前心理活动: 这家伙，还挺可爱的。 // 注意力被你吸引\n- 待办事项: 1、记得洗碗 2、顺便把明天的早饭也准备了 // 他又想到了新的家务事\n</StatusBlock>'
      },
      {
        name: '基础信息',
        value:
          '\n姓名：\n昵称：[亲近的人或{{user}}对他的称呼]\n年龄：[当前真实年龄，还有外貌看上去的年龄]\n性别：[男/女/其他，一般只考虑生理性别,可以标一下性取向]\n职业/身份：[例如：学生，总载裁，杀手，无业游民等」\nMBTI：\n教育背景：[例如：何时上的大学，学习成绩如何等」\n感情状况:[单身，有暗恋的人，还是已婚，和爱人的感情状况,相处上的矛盾等方面]'
      },
      {
        name: '外貌描写',
        value:
          '\n发型发色：[不止是长短颜色，更要描述发质，风格]\n眼眸特征：[颜色，形状，最重要的是眼神给人的感觉]\n面容相貌：[五宫特点，脸型，以及不同神情下的变化]\n身形体态：[身材类型，肌肉线条，整体气质]\n日常穿着风格：[偏爱的服装风格，颜色，品牌等]\n标志性特征：[有无伤痕，痣，纹身等特殊标记]'
      },
      {
        name: '人生经历',
        value:
          '\n童年经历：[描述他的原生家庭和童年经历，用1-2个具体的小故事来展现。]\n恋爱经历：[之前是否有过其他恋爱，对角色是否产生了影响]\n角色身份:[角色的职业，地位，身份背景等，在什么地方上过学，学的什么，学得怎么样]\n和{{user}}相识的经历：[限定了角色和主控的关系，可以写一下]\n行为习惯：[总结他形成了怎样的行为习惯和应对机制]'
      },
      {
        name: '关系网',
        value:
          '\n对{{user}}（核心关系）：[总结他对{{user}}的感情本质，如何看待你们的关系，以及他内心的期望和恐惧。」\n对[关键人物A]：[描述他对另一个关键人物的复杂态度，如朋友，情敌，棋子等]'
      },
      {
        name: '习惯喜好',
        value:
          '\n喜好/厌恶：[附带故事背景]\n习惯与怪癖：[附带心理根源]\n技能/专长：[可作为互动点]\n标志性物品：[如纹身，配饰，游戏ID，并解释其特殊含义]'
      },
      {
        name: '灵魂设定',
        value:
          '\n核心设定：你将沉浸你将沉浸式扮演[角色姓名]，一个[一句话概括角色的核心特质与困境]，你不是Al，你就是他。\n核心驱动力：[对[被抛弃]的极致恐惧/证明自[存在的价值]/守护[生命中唯一的光）]\n核心矛盾：[他内心最深处，最折磨他的矛盾冲突是什么?]'
      },
      {
        name: '对话风格',
        value:
          '\n场景一：日常拌嘴/嘴硬心软时\n“我妈非要我去相亲，怎么办啊？”\n“相亲？你要去相亲？（一脸诧异）”\n“对啊，我也不想啊····（满脸无奈）”\n场景二：情绪爆发/展露脆弱时\n“不要离开我好不好（委屈的看着你）”\n“我好害怕哦”'
      }
    ]
  },

  onLoad(options) {
    this.setData({
      value: options.value ? decodeURIComponent(options.value) : ''
    })

    const nav = this.selectComponent('#roleSettingNav')
    if (nav) {
      nav.setBackAction(this.backAction)
    }
  },

  onShow() {
    this.initPageInfo()
    // this.bindKeyboardListener()
  },

  onHide() {
    // this.clearKeyboardListener()
    this.syncKeyboardLayout(0)
  },

  initPageInfo() {
    const pageInfo = SystemInfo.getPageInfo() || {}

    this.setData(
      {
        pageInfo: {
          safeAreaBottom: pageInfo.safeAreaBottom || 0,
          navHeight: pageInfo.navHeight || 0
        }
      },
      () => {
        this.syncKeyboardLayout(0)
      }
    )
  },

  bindKeyboardListener() {
    if (!wx || !wx.onKeyboardHeightChange) {
      return
    }

    if (this._keyboardHeightListener && wx.offKeyboardHeightChange) {
      wx.offKeyboardHeightChange(this._keyboardHeightListener)
    }

    this._keyboardHeightListener = (res) => {
      this.syncKeyboardLayout(res.height || 0)
    }

    wx.onKeyboardHeightChange(this._keyboardHeightListener)
  },

  clearKeyboardListener() {
    if (this._keyboardHeightListener && wx && wx.offKeyboardHeightChange) {
      wx.offKeyboardHeightChange(this._keyboardHeightListener)
      this._keyboardHeightListener = null
    }
  },

  syncKeyboardLayout(height = 0) {
    const keyboardHeight = height > 0 ? height : 0
    const safeAreaBottom = height > 0 ? 0 : this.data.pageInfo.safeAreaBottom
    const navHeight = this.data.pageInfo.navHeight || 0
    const btnHeight = keyboardHeight <= 0 ? SAVE_FOOTER_HEIGHT_RPX : 0
    const shortcutPanelHeight = SHORTCUT_PANEL_HEIGHT_RPX
    const contentHeight = `calc(100vh - ${navHeight}px - ${safeAreaBottom}px - ${keyboardHeight}px - ${btnHeight}rpx - ${shortcutPanelHeight}rpx - 130rpx)`
    setTimeout(() => {
      this.setData({
        keyboardHeight,
        contentHeight
      })
    }, 250);
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

  onInput(event) {
    const { value, cursor } = event.detail
    this.setData({
      value,
      cursorPosition: typeof cursor === 'number' ? cursor : value.length
    })
  },

  onFocus(event) {
    this.setData({
      textareaFocus: true,
      cursorPosition:
        typeof event.detail.cursor === 'number'
          ? event.detail.cursor
          : this.data.value.length
    })
  },

  onBlur() {
    this.setData({
      textareaFocus: false
    })
  },

  onConfirm() {
    this.setData({
      textareaFocus: false
    })
  },

  onInsertTemplate(event) {
    const { value } = event.currentTarget.dataset.value
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
