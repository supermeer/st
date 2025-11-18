import { inspirationReply } from '../../../services/ai/chat'
Component({
    properties: {
      plotId: {
        type: String
      },
    },
    data: {
        inputType: 0, // 0： 默认 1: 文本, 2: 语音
        showInspiration: false, // 是否显示灵感
        inspirationList: [], // 灵感列表
        inspirationLoading: false, // 灵感加载中
        inspirationEmpty: false, // 灵感为空状态
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
        showUploader: false,
        imageList: []
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
              
              // 检查用户是否已经松手（快速点击的情况）
              if (this.isCancelled || !this.isTouching) {
                console.log('用户已松手，立即停止录音')
                this.isCancelled = true
                manager.stop()
                return
              }
              
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
              console.log('识别错误', err)
              this.stopTimer()
              this.setData({
                isRecording: false,
                voiceStatus: '',
                recordTime: 0,
                isTouchMoving: false
              })
              
              // 检查是否是用户取消操作
              if (this.isCancelled) {
                this.isCancelled = false
                wx.showToast({
                  title: '已取消',
                  icon: 'none',
                  duration: 1000
                })
                return
              }
              
              // 真实的识别错误
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
          console.log('启动定时器，最长时长:', this.data.inputDuration, '秒')
          this.recordTimer = setInterval(() => {
            const recordTime = this.data.recordTime + 1
            console.log('录音时长:', recordTime, '秒')
            this.setData({
              recordTime
            })
            
            // 最长录音
            if (recordTime >= this.data.inputDuration) {
              // 达到最大时长，自动停止录音
              this.stopRecord()
            }
            if (recordtime >= this.data.inputDuration - 5) {
              wx.vibrateShort({
                type: 'light'
              })
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
          // 清除上一次的取消标记
          this.isCancelled = false
          
          // 检查权限
          wx.getSetting({
            success: (res) => {
              if (!res.authSetting['scope.record']) {
                // 即将弹出授权对话框，先重置触摸状态
                this.isTouching = false
                
                // 请求录音权限
                wx.authorize({
                  scope: 'scope.record',
                  success: () => {
                    // 授权成功后，提示用户重新按住说话
                    wx.showToast({
                      title: '授权成功，请重新按住说话',
                      icon: 'none',
                      duration: 2000
                    })
                  },
                  fail: () => {
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
                // 已有权限，直接开始录音
                this.startRecord()
              }
            }
          })
        },
        
        // 开始录音
        startRecord() {
          console.log('调用 startRecord')
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
          
          wx.vibrateShort({
            type: 'light'
          })
          
          // 使用 WechatSI 的实时语音识别
          // 注意：不在这里清除 isCancelled，因为需要在 onStart 回调中检查
          console.log('调用 recorderManager.start，duration:', this.data.inputDuration * 1000)
          recorderManager.start({
            duration: this.data.inputDuration * 1000, // 最长录音时长（秒转毫秒）
            lang: 'zh_CN' // 识别语言：简体中文
          })
        },
        
        // 停止录音
        stopRecord() {
          console.log('调用 stopRecord，isRecording:', this.data.isRecording)
          const { recorderManager } = this.data
          if (recorderManager && this.data.isRecording) {
            console.log('执行 recorderManager.stop()')
            wx.vibrateShort({
              type: 'light'
            })
            recorderManager.stop()
          } else {
            console.log('stopRecord 被忽略（录音未启动），手动重置UI')
            // 如果录音还未启动（空白录音），手动停止录音管理器并重置UI
            if (recorderManager) {
              try {
                recorderManager.stop() // 尝试停止，可能触发 onError
              } catch (err) {
                console.log('停止录音失败', err)
              }
            }
            // 手动重置UI
            this.stopTimer()
            this.setData({
              isRecording: false,
              voiceStatus: '',
              recordTime: 0,
              isTouchMoving: false
            })
            wx.showToast({
              title: '录音时间过长',
              icon: 'none',
              duration: 1500
            })
          }
        },
        
        // 手指移动
        onVoiceTouchMove(e) {
          // 只要用户正在按住按钮，就处理滑动事件（即使录音还未完全启动）
          if (!this.isTouching) return
          
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
          console.log('松开手指，isRecording:', this.data.isRecording, 'isTouchMoving:', this.data.isTouchMoving)
          
          // 标记用户已松开按钮
          this.isTouching = false
          
          // 优先检查：如果是上滑取消状态，标记为取消
          if (this.data.isTouchMoving) {
            console.log('上滑取消录音')
            // 标记为取消操作（onError 或 onStop 回调会检查此标志）
            this.isCancelled = true
            
            const { recorderManager } = this.data
            // 如果录音已经开始，停止录音
            if (recorderManager && this.data.isRecording) {
              console.log('停止录音，等待 onStop 回调')
              recorderManager.stop()
            } else {
              // 如果录音还未开始或正在启动，等待它自动进入 onStart -> onError
              // 不说话的空白录音会触发 onError，在那里会检查 isCancelled 标志
              console.log('录音未完全启动，等待自动进入 onError')
            }
            return
          }
          
          // 如果录音还没开始（快速点击的情况），标记为取消
          if (!this.data.isRecording) {
            console.log('录音还未开始，标记为取消，等待自动进入 onError')
            this.isCancelled = true
            // 等待录音管理器自动进入 onError（空白录音）
            return
          }
          
          // 正常结束，清除取消标记
          console.log('正常结束录音，准备调用 stopRecord')
          this.isCancelled = false
          this.stopRecord()
        },
        
        // 记录初始Y坐标
        onVoiceTouchStartRecord(e) {
          this.startY = e.touches[0].clientY
          this.onVoiceTouchStart(e)
        },
        onSend(ctx) {
          let content = this.data.inputValue || ctx
          if (!content || content.length == 0) {
            wx.showToast({
              title: '请输入内容',
              icon: 'none',
              duration: 2000
            })
            return
          }
          this.triggerEvent('sendMessage', {
            content: content
          })
          this.setData({
            inputValue: ''
          })
          this.triggerEvent('keyboardHeightChange', 0)
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
          this.setData(
            {
              inputType: type,
              showBoard: false,
              showInspiration: false
            },
            () => {
              this.triggerEvent('showTabbar')
              this.setData({
                focus: type == 1 // 切换到输入模式时拉起键盘
              })
            }
          )
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
          // 打开灵感面板，先进入加载状态
          this.setData({
            showInspiration: true,
            showBoard: false,
            inspirationLoading: true,
            inspirationEmpty: false,
            inspirationList: []
          })
          this.getInspiration()
          this.triggerEvent('hideTabbar')
        },
        refreshInspiration() {
          this.setData({
            inspirationLoading: true,
            inspirationEmpty: false,
            inspirationList: []
          })
          this.getInspiration()
        },
        getInspiration() {
          inspirationReply({
            plotId: this.properties.plotId
          }).then(res => {
            if (!res) {
              this.setData({
                inspirationLoading: false,
                inspirationEmpty: true,
                inspirationList: []
              })
              return
            }
            const arr = JSON.parse(res)
            this.setData({
              inspirationList: arr,
              inspirationLoading: false,
              inspirationEmpty: !arr || arr.length === 0
            })
          }).catch(() => {
            this.setData({
              inspirationLoading: false,
              inspirationEmpty: true,
              inspirationList: []
            })
          })
        },
        onInspirationTap(e) {
          const item = e.currentTarget.dataset.item
          this.onSend(item)
          this.setData({
            showInspiration: false
          })
          this.triggerEvent('showTabbar')
        },
        
        editInspiration(e) {
          const item = e.currentTarget.dataset.item
          this.setData(
            {
              inputType: 1,
              showInspiration: false,
              inputValue: item
            },
            () => {
              this.triggerEvent('showTabbar')
              this.setData({
                focus: true
              })
            }
          )
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
          this.triggerEvent('buttonClick', { action: 'restart' });
        },
        uploadImage() {
          // this.setData({
          //   showBoard: false,
          //   showInspiration: false
          // })
          // this.triggerEvent('showTabbar')
          this.onUpload()
        },

        onUpload() {
          if (this.properties.disabled) return
          this.setData({ showUploader: true, imageList: [] })
        },
        onUploadSuccess(e) {
          const { remoteUrl, tempFilePath, signature } = e.detail
          this.setData({ showUploader: false })
          this.triggerEvent('success', {
            remoteUrl,
            tempFilePath,
            signature,
            imageList: this.data.imageList
          })
        },

        onUploadFail(e) {
          const { message } = e
          wx.showToast({ title: message, icon: 'none' })
          this.setData({ showUploader: false })
        },

        onUploadCancel() {
          this.setData({ showUploader: false })
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
  
