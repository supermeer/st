// import { fetchFilePresignedUrl } from '../services/file/index'
const fetchFilePresignedUrl = () => {
  return Promise.resolve({
    data: {
      uploadUrl: 'https://www.baidu.com',
      fileKey: '1234567890'
    }
  })
}

/**
 * 推断文件内容类型
 * @param {string} path 文件路径
 * @returns {string} 文件内容类型
 */
function inferContentType(path) {
  const s = String(path || '').toLowerCase()
  if (s.endsWith('.png')) return 'image/png'
  if (s.endsWith('.jpg') || s.endsWith('.jpeg')) return 'image/jpeg'
  if (s.endsWith('.gif')) return 'image/gif'
  if (s.endsWith('.webp')) return 'image/webp'
  if (s.endsWith('.heic') || s.endsWith('.heif')) return 'image/heic'
  return 'application/octet-stream'
}

/**
 * 上传文件到服务器
 * @param {object} options - 上传选项
 * @param {string} options.filePath - 本地文件路径
 * @param {function} options.onProgress - 上传进度回调 (progress) => void
 * @param {function} options.onStatusChange - 上传状态变化回调 (status) => void，status可以是：loading, success, fail
 * @returns {Promise<{localPath: string, fileKey: string, remoteUrl: string, fileName: string}>}
 */
export function uploadFile({ filePath, onProgress, onStatusChange, ifPublic }) {
  return new Promise((resolve, reject) => {
    // 获取文件名
    const fileName = filePath.split('/').pop() || 'image.jpg'
    const fileType = filePath.toLowerCase().includes('.mp4') ? 'video' : 'image'

    // 通知状态变化
    onStatusChange && onStatusChange('loading')

    // 获取预签名URL
    const signedList = [
      {
        fileName: fileName,
        contentType: inferContentType(fileName),
        fileType: fileType,
        ifPublic: ifPublic
      }
    ]

    fetchFilePresignedUrl(signedList)
      .then((signatureResp) => {
        const signatureList = Array.isArray(signatureResp)
          ? signatureResp
          : Array.isArray(signatureResp?.data)
          ? signatureResp.data
          : []

        if (signatureList.length > 0) {
          const signature = signatureList[0]
          const fs = wx.getFileSystemManager()

          fs.readFile({
            filePath: filePath,
            success: (res) => {
              // 使用 wx.request PUT 方法上传到预签名URL
              wx.request({
                url: signature.uploadUrl,
                method: 'PUT',
                header: {
                  'Content-Type': inferContentType(fileName)
                },
                data: res.data,
                success: (uploadRes) => {
                  if (
                    uploadRes.statusCode >= 200 &&
                    uploadRes.statusCode < 300
                  ) {
                    // 获取远程URL (去掉签名参数)
                    const remoteUrl = signature.uploadUrl.split('?')[0]

                    // 通知状态变化
                    onStatusChange && onStatusChange('success')

                    // 返回成功结果
                    resolve({
                      localPath: filePath,
                      fileKey: signature.fileKey,
                      remoteUrl: remoteUrl,
                      fileName: fileName,
                      status: 'success'
                    })
                  } else {
                    // 上传失败
                    onStatusChange && onStatusChange('fail')

                    reject({
                      error: new Error('上传失败'),
                      message: '上传失败',
                      localPath: filePath,
                      fileName: fileName
                    })
                  }
                },
                fail: (err) => {
                  // 上传请求失败
                  onStatusChange && onStatusChange('fail')

                  reject({
                    error: err,
                    message: '上传请求失败',
                    localPath: filePath,
                    fileName: fileName
                  })
                }
              })
            },
            fail: (err) => {
              // 读取文件失败
              onStatusChange && onStatusChange('fail')

              reject({
                error: err,
                message: '读取文件失败',
                localPath: filePath,
                fileName: fileName
              })
            }
          })
        } else {
          // 获取签名失败
          onStatusChange && onStatusChange('fail')

          reject({
            error: new Error('获取签名失败'),
            message: '获取签名失败',
            localPath: filePath,
            fileName: fileName
          })
        }
      })
      .catch((error) => {
        // 预签名请求失败
        onStatusChange && onStatusChange('fail')

        reject({
          error: error,
          message: '预签名请求失败',
          localPath: filePath,
          fileName: fileName
        })
      })
  })
}

/**
 * 批量上传文件
 * @param {object} options - 上传选项
 * @param {string[]} options.filePaths - 本地文件路径数组
 * @param {function} options.onProgress - 上传进度回调 (progress) => void
 * @param {function} options.onFileStatusChange - 单个文件上传状态变化回调 (filePath, status) => void
 * @param {function} options.onComplete - 全部上传完成回调 (results) => void
 * @returns {Promise<Array<{localPath: string, fileKey: string, remoteUrl: string, fileName: string}>>}
 */
export function batchUploadFiles({
  filePaths,
  onProgress,
  onFileStatusChange,
  onComplete,
  ifPublic
}) {
  return new Promise((resolve, reject) => {
    if (!filePaths || filePaths.length === 0) {
      resolve([])
      return
    }

    const total = filePaths.length
    let completed = 0
    const results = []
    const errors = []

    // 逐个上传文件
    filePaths.forEach((filePath) => {
      uploadFile({
        filePath,
        onStatusChange: (status) => {
          onFileStatusChange && onFileStatusChange(filePath, status)
        },
        ifPublic: ifPublic
      })
        .then((result) => {
          results.push(result)
          completed++

          // 更新进度
          onProgress && onProgress(completed / total)

          // 检查是否全部完成
          if (completed === total) {
            onComplete && onComplete(results)
            resolve(results)
          }
        })
        .catch((error) => {
          errors.push(error)
          completed++

          // 更新进度
          onProgress && onProgress(completed / total)

          // 检查是否全部完成
          if (completed === total) {
            if (results.length > 0) {
              onComplete && onComplete(results)
              resolve(results)
            } else {
              reject(errors)
            }
          }
        })
    })
  })
}

export default {
  uploadFile,
  batchUploadFiles
}
