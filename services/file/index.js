import { config } from '../../config/index'
import request from '../request/http'

// 获取文件预签名
function mockFetchFilePresignedUrl(parmas) {
  const { delay } = require('../_utils/delay')
  const { getGoodsAllComments } = require('../../model/comments')
  return delay().then(() => getGoodsAllComments(parmas))
}

// 获取文件预签名
export function fetchFilePresignedUrl(data) {
  return request.post('/api/v1/server/file/uploadFileByPresigned', data)
}

export function fecthPublicFilePresignedUrl(data) {
  return request.post('/api/v1/server/backStage/uploadStaticFile', data)
}

// 同步上传结果给后端（成功/失败）
export function uploadConfirm(data) {
  return request.post('/api/v1/server/file/confirmUpload', data)
}
