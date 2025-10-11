Component({
    properties: {
      messageList: Array,
      isLogin: Boolean,
      userInfo: Object
    },
    data: {
        inputType: 0, // 0： 默认 1: 文本, 2: 语音
        showInspiration: false, // 是否显示灵感
        inspirationList: [
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？",
          "你是谁？我是谁？我在哪？你要干什么？"
        ], // 灵感列表
        showBoard: false,
        inputConfig: {
          maxHeight: 150
        },
        keyboardHeight: 0,
        inputValue: '',
        focus: false, // 控制键盘弹起
        // 语音相关
        inputDuration: 10, // 输入时长
        isRecording: false, // 是否正在录音
        voiceStatus: '', // 语音状态: recording, recognizing, success, error
        voiceText: '', // 识别的文本
        recordTime: 0, // 录音时长
        isTouchMoving: false, // 是否正在移动（取消录音）
        recorderManager: null, // 录音管理器
    },
    lifetimes: {
      attached() {
        this.initRecorder()
      },
      detached() {
        // 组件销毁时释放录音管理器
        if (this.data.recorderManager) {
          this.data.recorderManager.stop()
        }
      }
    },
    methods: {
        // 初始化录音管理器
        initRecorder() {
          try {
            // 使用 WechatSI 插件的实时语音识别管理器
            const plugin = requirePlugin('WechatSI')
            const manager = plugin.getRecordRecognitionManager()
            
            // 监听识别开始
            manager.onStart = (res) => {
              console.log('录音识别开始', res)
              this.setData({
                isRecording: true,
                voiceStatus: 'recording',
                recordTime: 0
              })
              // 开始计时
              this.startTimer()
            }
            
            // 监听实时识别结果
            manager.onRecognize = (res) => {
              console.log('实时识别结果', res.result)
              // 可以在这里显示实时识别的文字
            }
            
            // 监听识别结束
            manager.onStop = (res) => {
              console.log('识别结束', res)
              this.stopTimer()
              
              // 清除录音状态
              this.setData({
                isRecording: false,
                voiceStatus: '',
                recordTime: 0,
                isTouchMoving: false
              })
              
              // 检查是否是取消操作
              if (this.isCancelled) {
                this.isCancelled = false
                wx.showToast({
                  title: '已取消',
                  icon: 'none',
                  duration: 1000
                })
                return
              }
              
              // 检查识别结果
              if (res.result) {
                // 识别成功，填充到输入框
                this.setData({
                  inputValue: res.result,
                  inputType: 1,
                  focus: true
                })
                
                wx.showToast({
                  title: '识别成功',
                  icon: 'success',
                  duration: 1500
                })
              } else {
                // 识别结果为空
                wx.showToast({
                  title: '未识别到内容，请重试',
                  icon: 'none',
                  duration: 2000
                })
              }
            }
            
            // 监听识别错误
            manager.onError = (err) => {
              this.stopTimer()
              this.setData({
                isRecording: false,
                voiceStatus: '',
                recordTime: 0,
                isTouchMoving: false
              })
              wx.showToast({
                title: '识别失败，请重试',
                icon: 'none',
                duration: 2000
              })
            }
            
            this.setData({
              recorderManager: manager
            })
          } catch (err) {
            wx.showModal({
              title: '提示',
              content: '语音识别功能需要配置微信语音识别插件。请在微信公众平台添加"微信同声传译"插件（AppID: wx069ba97219f66d99）',
              showCancel: false
            })
          }
        },
        
        // 开始录音定时器
        startTimer() {
          this.recordTimer = setInterval(() => {
            const recordTime = this.data.recordTime + 1
            this.setData({
              recordTime
            })
            
            // 最长录音
            if (recordTime >= this.data.inputDuration) {
              this.stopRecord()
            }
          }, 1000)
        },
        
        // 停止录音定时器
        stopTimer() {
          if (this.recordTimer) {
            clearInterval(this.recordTimer)
            this.recordTimer = null
          }
        },
        
        
        // 按下开始录音
        onVoiceTouchStart(e) {
          // 标记用户正在按住按钮
          this.isTouching = true
          
          // 检查权限
          wx.getSetting({
            success: (res) => {
              if (!res.authSetting['scope.record']) {
                // 请求录音权限
                wx.authorize({
                  scope: 'scope.record',
                  success: () => {
                    // 授权成功后，检查用户是否还在按住
                    if (this.isTouching) {
                      this.startRecord()
                    }
                  },
                  fail: () => {
                    this.isTouching = false
                    wx.showModal({
                      title: '提示',
                      content: '需要您授权录音权限',
                      confirmText: '去设置',
                      success: (modalRes) => {
                        if (modalRes.confirm) {
                          wx.openSetting()
                        }
                      }
                    })
                  }
                })
              } else {
                this.startRecord()
              }
            }
          })
        },
        
        // 开始录音
        startRecord() {
          const { recorderManager, isRecording } = this.data
          if (!recorderManager) {
            wx.showToast({
              title: '语音识别功能未初始化',
              icon: 'none'
            })
            return
          }
          
          // 防止重复启动
          if (isRecording) {
            console.log('录音正在进行中，忽略重复启动')
            return
          }
          
          // 清除之前的状态，确保干净的开始
          this.stopTimer() // 确保之前的定时器已清除
          this.setData({
            voiceStatus: '',
            isRecording: false,
            isTouchMoving: false,
            recordTime: 0
          })
          
          // 清除取消标记
          this.isCancelled = false
          
          wx.vibrateShort({
            type: 'light'
          })
          
          // 使用 WechatSI 的实时语音识别
          recorderManager.start({
            duration: this.data.inputDuration * 1000, // 最长录音时长（秒转毫秒）
            lang: 'zh_CN' // 识别语言：简体中文
          })
        },
        
        // 停止录音
        stopRecord() {
          const { recorderManager } = this.data
          if (recorderManager && this.data.isRecording) {
            wx.vibrateShort({
              type: 'light'
            })
            recorderManager.stop()
          }
        },
        
        // 手指移动
        onVoiceTouchMove(e) {
          if (!this.data.isRecording) return
          
          // 获取触摸点相对于页面的位置
          const touch = e.touches[0]
          const { clientY } = touch
          
          // 如果手指上滑超过100px，标记为取消状态
          if (this.startY - clientY > 100) {
            this.setData({
              isTouchMoving: true
            })
          } else {
            this.setData({
              isTouchMoving: false
            })
          }
        },
        
        // 松开手指
        onVoiceTouchEnd(e) {
          // 标记用户已松开按钮
          this.isTouching = false
          
          if (!this.data.isRecording) return
          
          // 如果是取消状态，取消录音
          if (this.data.isTouchMoving) {
            // 标记为取消操作
            this.isCancelled = true
            
            const { recorderManager } = this.data
            if (recorderManager) {
              recorderManager.stop()
            }
            // 不在这里调用 stopTimer() 和 setData，让 onStop 回调统一处理
          } else {
            // 正常结束，清除取消标记
            this.isCancelled = false
            this.stopRecord()
          }
        },
        
        // 记录初始Y坐标
        onVoiceTouchStartRecord(e) {
          this.startY = e.touches[0].clientY
          this.onVoiceTouchStart(e)
        },
        
        // 显示错误提示
        showError(message) {
          // 清除所有录音相关状态
          this.setData({
            voiceStatus: '',
            isRecording: false,
            isTouchMoving: false,
            recordTime: 0
          })
          
          wx.showToast({
            title: message,
            icon: 'none',
            duration: 2000
          })
        },
        
        changeInputType(e) {
          const type = e.currentTarget.dataset.type
          this.setData({
            focus: type == 1, // 切换到输入模式时拉起键盘
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
          setTimeout(() => {
            this.setData({
              inputType: type
            })
          }, 13)
        },
        onInputBlur() {
          this.setData({
            inputType: 0,
            focus: false // 收起键盘
          })
          // 手动触发键盘收起事件，确保高度恢复
          this.triggerEvent('keyboardHeightChange', 0)
        },
        onKeyboardHeightChange(e) {
          const keyboardHeight = e.detail.height || 0
          setTimeout(() => {
            this.triggerEvent('keyboardHeightChange', keyboardHeight)
          }, e.detail.duration || 0)
        },
        onInput(e) {
          this.setData({
            inputValue: e.detail.value
          })
        },
        onInputLineChange() {
          this.triggerEvent('inputLineChange')
        },
        showInspiration() {
          if (this.data.showInspiration) {
            this.setData({
              showInspiration: false
            })
            this.triggerEvent('showTabbar')
            return
          }
          this.setData({
            showInspiration: true,
            showBoard: false
          })
          this.triggerEvent('hideTabbar')
        },
        editInspiration(e) {
          const index = e.currentTarget.dataset.index
          this.setData({
            showInspiration: false,
            inputValue: this.data.inspirationList[index]
          })
          this.triggerEvent('showTabbar')
        },
        showBoard() {
          if (this.data.showBoard) {
            this.setData({
              showBoard: false
            })
            this.triggerEvent('showTabbar')
            return
          }
          this.setData({
            showBoard: true,
            showInspiration: false
          })
          this.triggerEvent('hideTabbar')
        },
        restart() {
          this.setData({
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
        },
        uploadImage() {
          this.setData({
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
        },
        storyList() {
          this.setData({
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
        },
        report() {
          this.setData({
            showBoard: false,
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
        }
    }
  })
  