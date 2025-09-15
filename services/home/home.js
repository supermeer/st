import request from '../request/http'

/** 获取首页数据 */
export function fetchHome() {
  return new Promise((resolve) => {
    resolve('real api')
  })
}

export function getCategoryList(params) {
  return request.get('/api/v1/server/menu/getCategories', params)
}

export function getShareMenus() {
  return request.get('/api/v1/server/menu/getShareMenus')
}

export function getBloggerTypeHistory() {
  return request.get('/api/v1/server/menu/getBloggerTypeHistory')
}
