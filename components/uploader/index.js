import { fetchFilePresignedUrl, uploadConfirm } from '../../services/file/index'
import userStore from '../../store/user'

Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {
    mediaType: {
      type: Array,
      value: ['image']
    },
    files: {
      type: Array,
      value: []
    },
    max: {
      type: Number,
      value: 9
    },
    gridConfig: {
      type: Object,
      value: { width: 120, height: 120, column: 5 }
    },
    sizeLimit: {
      type: Object,
      value: { size: 5, unit: 'MB', message: '图片大小不超过 {sizeLimit} MB' }
    }
  },
  data: {
  },
  lifetimes: {
    attached() {
      userStore.bind(this)
      userStore.refreshVipInfo()
    }
  },
  methods: {
    onRemove(e) {
      // 由父级决定删除逻辑，但为了保证 files 与 t-upload 同步，这里直接透传
      this.triggerEvent('remove', e.detail)
    },
    onClick(e) {
      this.triggerEvent('click', e.detail)
    },
    onAdd({ detail }) {
      const files = detail.files || []
      if (!files.length) return
      const signedList = files.map((file) => ({
        fileName: file.name,
        contentType: this.inferContentType(file.name),
        fileType: file.type
      }))
      fetchFilePresignedUrl(signedList).then((signatureResp) => {
        const signatureList = Array.isArray(signatureResp)
          ? signatureResp
          : Array.isArray(signatureResp?.data)
          ? signatureResp.data
          : []
        files.forEach((file, index) => {
          this.uploadFile(file, signatureList[index])
        })
      })
    },
    changeStatus(file, status, extra = {}) {
      const list = (this.data.files || []).map((item) =>
        item.url === file.url ? { ...item, status, ...extra } : item
      )
      this.setData({ files: list })
      this.triggerEvent('change', { files: list })
    },
    inferContentType(p) {
      const s = String(p || '').toLowerCase()
      if (s.endsWith('.png')) return 'image/png'
      if (s.endsWith('.jpg') || s.endsWith('.jpeg')) return 'image/jpeg'
      if (s.endsWith('.gif')) return 'image/gif'
      if (s.endsWith('.webp')) return 'image/webp'
      if (s.endsWith('.heic') || s.endsWith('.heif')) return 'image/heic'
      return 'application/octet-stream'
    },
    uploadFile(file, signature) {
      const current = [
        ...(this.data.files || []),
        { ...file, status: 'loading' }
      ]
      this.setData({ files: current })
      this.triggerEvent('change', { files: current })

      const fs = wx.getFileSystemManager()
      const doConfirm = (ok) =>
        uploadConfirm([{ fileKey: signature?.fileKey, uploadSuccess: ok }])

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
              reject()
            }
          })
        })

      const uploadRequest = (data) => {
        // 直接用 wx.request 避免拦截器改写 COS 域名
        putByWxRequest(data)
          .then(() => doConfirm(true))
          .then((confirmRes) => {
            const remoteUrl =
              confirmRes?.url || confirmRes?.data?.url || signature?.fileUrl
            this.changeStatus(file, 'done', {
              remoteUrl,
              fileKey: signature?.fileKey
            })
            this.triggerEvent('success', { file, remoteUrl, signature })
          })
          .catch(() => {
            doConfirm(false)
            this.changeStatus(file, 'failed')
            this.triggerEvent('fail', { file, signature })
          })
      }

      fs.readFile({
        filePath: file.url,
        success: (res) => uploadRequest(res.data),
        fail: () => {
          this.changeStatus(file, 'failed')
          this.triggerEvent('fail', { file, signature })
        }
      })
    }
  }
})
