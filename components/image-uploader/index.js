import { fetchFilePresignedUrl, fecthPublicFilePresignedUrl } from '../../services/file/index'

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    sourceType: {
      type: Array,
      value: ['album', 'camera'] // 支持相册和拍照
    },
    isPublic: {
      type: Boolean,
      value: false
    }
  },
  data: {
    loading: false,
    loadingText: '正在上传图片...'
  },
  lifetimes: {
    attached() {
      // 组件显示时自动触发选择图片
      if (this.data.visible) {
        this.selectImage()
      }
    }
  },
  observers: {
    visible(newVal) {
      if (newVal) {
        this.selectImage()
      }
    }
  },
  methods: {
    selectImage() {
      if (this.data.loading) return
      wx.chooseImage({
        count: 1,
        sourceType: this.properties.sourceType,
        success: (res) => {
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.uploadImage(res.tempFilePaths[0])
          }
        },
        fail: (error) => {
          this.triggerEvent('cancel', { error })
        }
      })
    },

    uploadImage(tempFilePath) {
      this.setData({
        loading: true,
        loadingText: '正在上传图片...'
      })
      console.log(222)
      wx.getFileSystemManager().getFileInfo({
        filePath: tempFilePath,
        success: (fileInfo) => {
          console.log(fileInfo, '获取文件信息成功')
        },
        fail: (res) => {
          console.log(res, '获取文件信息失败')
          this.handleUploadError('获取文件信息失败')
        }
      })
      // 获取文件信息
      wx.getFileInfo({
        filePath: tempFilePath,
        success: (fileInfo) => {
          const fileName = `image_${Date.now()}.jpg`
          const file = {
            name: fileName,
            url: tempFilePath,
            type: 'image',
            size: fileInfo.size
          }

          // 获取预签名URL
          const signedList = [
            {
              fileName: file.name,
              contentType: this.inferContentType(file.name),
              fileType: file.type
            }
          ]
          const getPresigned = this.properties.isPublic
            ? fecthPublicFilePresignedUrl
            : fetchFilePresignedUrl
          getPresigned(signedList)
            .then((signatureResp) => {
              const signatureList = Array.isArray(signatureResp)
                ? signatureResp
                : Array.isArray(signatureResp?.data)
                ? signatureResp.data
                : []

              if (signatureList.length > 0) {
                this.performUpload(file, signatureList[0])
              } else {
                this.handleUploadError('获取上传签名失败')
              }
            })
            .catch((error) => {
              this.handleUploadError('获取上传签名失败')
            })
        },
        fail: (res) => {
          this.handleUploadError('获取文件信息失败')
        }
      })
    },

    performUpload(file, signature) {
      this.setData({
        loadingText: '正在上传...'
      })

      const fs = wx.getFileSystemManager()

      const putByWxRequest = (data) =>
        new Promise((resolve, reject) => {
          wx.request({
            url: signature?.uploadUrl,
            method: 'PUT',
            header: { 'Content-Type': this.inferContentType(file.name) },
            data,
            success: (res) => {
              if (res.statusCode >= 200 && res.statusCode < 300) resolve(res)
              else reject(res)
            },
            fail: (err) => {
              reject(err)
            }
          })
        })

      const uploadRequest = (data) => {
        putByWxRequest(data)
          .then(() => {
            const remoteUrl =
              signature?.url || signature?.data?.url || signature?.fileUrl

            this.setData({
              loading: false
            })
            // 返回上传成功的图片信息
            this.triggerEvent('success', {
              file,
              remoteUrl,
              signature,
              tempFilePath: file.url
            })
          })
          .catch(() => {
            this.handleUploadError('上传失败')
          })
      }

      fs.readFile({
        filePath: file.url,
        success: (res) => uploadRequest(res.data),
        fail: () => {
          this.handleUploadError('读取文件失败')
        }
      })
    },

    inferContentType(fileName) {
      const s = String(fileName || '').toLowerCase()
      if (s.endsWith('.png')) return 'image/png'
      if (s.endsWith('.jpg') || s.endsWith('.jpeg')) return 'image/jpeg'
      if (s.endsWith('.gif')) return 'image/gif'
      if (s.endsWith('.webp')) return 'image/webp'
      if (s.endsWith('.heic') || s.endsWith('.heif')) return 'image/heic'
      return 'image/jpeg'
    },

    handleUploadError(message) {
      this.setData({
        loading: false
      })
      this.triggerEvent('fail', { message })
    },

    onRetry() {
      this.selectImage()
    },

    onCancel() {
      this.setData({
        loading: false
      })
      this.triggerEvent('cancel')
    }
  }
})
