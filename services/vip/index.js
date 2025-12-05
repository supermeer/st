import request from '../request/http'

export function getMyPointInfo() {
  return request.get('/api/v1/user/vip/getMyPointInfo')
}

export function getMyPointDetails(params) {
  return request.get('/api/v1/user/vip/getMyPointDetails', params)
}

export function getCharacterPointDetail(params) {
  return request.get('/api/v1/user/vip/getCharacterPointDetail', params)
}
