import request from '../request/http'

export function getMyPointInfo() {
  return request.get('/api/v1/user/vip/getMyPointInfo')
}

export function getMyPointDetails() {
  return request.get('/api/v1/user/vip/getMyPointDetails')
}
