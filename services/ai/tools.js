import request from '../request/http'

export function promptOptimization(data) {
  return request.post('/api/v1/server/chat/promptOptimization', data)
}
