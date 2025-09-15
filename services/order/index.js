import request from '../request/http'

export function getPackages() {
  return request.get('/api/v1/trade/order/getPricingPlan')
}

export function createOrderAndPrepay(data) {
  return request.post('/api/v1/trade/order/createOrderAndPrepay', data)
}

export function getOrderList() {
  return request.get('/api/v1/trade/order/getOrderList')
}

export function queryOrderStatus(orderId) {
  return request.get(`/api/v1/trade/order/status/${orderId}`)
}
