import decodeUint8Array from '../../utils/decodeArrayBuffer.js'
import { StreamParser } from '../../utils/decodeArrayBuffer.js'

const streamParser = new StreamParser()
/**
 * HTTP请求类
 * 封装了微信小程序的网络请求API，支持拦截器和流式请求
 */
class HttpRequest {
  /**
   * 构造函数
   */
  constructor() {
    // 初始化拦截器数组
    this.interceptors = {
      request: [], // 请求拦截器
      response: [] // 响应拦截器
    }
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  useRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor)
  }

  /**
   * 添加响应拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  useResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor)
  }

  /**
   * 执行网络请求
   * @param {Object} options - 请求配置
   * @returns {Promise} - 返回Promise对象
   */
  async request(options) {
    // 1. 应用请求拦截器
    let config = options
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config)
    }

    // 2. 判断是否为流式请求
    const isStream = config.enableChunked === true

    return new Promise((resolve, reject) => {
      // 3. 处理标准请求
      if (!isStream) {
        wx.request({
          ...config,
          success: async (res) => {
            // 先应用响应拦截器（无论状态码是否为2xx，都执行）
            let response = res
            for (const interceptor of this.interceptors.response) {
              try {
                response = await interceptor(response)
              } catch (err) {
                reject(err)
                return
              }
            }

            // 再根据原始状态码决定 resolve/reject
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response)
            } else {
              reject(response)
            }
          },
          fail: (err) => {
            reject(err)
          }
        })
      }
      // 4. 处理流式请求
      else {
        const requestTask = wx.request({
          ...config,
          success: async (res) => {
            try {
              // 应用响应拦截器
              let response = res
              for (const interceptor of this.interceptors.response) {
                response = await interceptor(response)
              }
              resolve(response)
            } catch (error) {
              reject(error)
            }
          },
          fail: (err) => {
            console.log(err, 'requestTask err')
            reject(err)
          },
          complete: () => {
            streamParser.reset()
          }
        })
        requestTask.onChunkReceived((eventData) => {
          // 1. 解析分片（自动处理截断）
          const messages = streamParser.parseChunk(eventData.data)
          // 2. 处理每条SSE消息
          messages.forEach((rawMessage) => {
            // 过滤空消息
            if (!rawMessage.trim()) return
            // 提取事件类型（默认'message'）
            const eventType =
              rawMessage
                .split('\n')
                .find((line) => line.startsWith('event:'))
                ?.slice(6)
                .trim() || 'message'

            // 跳过心跳事件
            if (eventType === 'ping') return

            // 合并所有data行内容
            const dataContent = rawMessage
              .split('\n')
              .filter((line) => line.startsWith('data:'))
              .map((line) => line.slice(5).trim())
              .join('\n')
            // 处理OpenAI的[DONE]消息
            if (dataContent === '[DONE]') {
              config.onChunk?.({
                eventType: 'done',
                payload: { done: true }
              })
              return
            }

            // 解析有效JSON数据
            if (dataContent) {
              try {
                const payload = JSON.parse(dataContent)

                // 处理OpenAI格式的数据
                if (payload.choices && Array.isArray(payload.choices)) {
                  const delta = payload.choices[0]?.delta || {}
                  const content = delta.content || ''
                  const finishReason = payload.choices[0]?.finish_reason

                  config.onChunk?.({
                    eventType,
                    payload,
                    content, // 直接提供当前增量内容
                    finishReason, // 提供结束原因
                    isOpenAI: true // 标记为OpenAI数据
                  })
                } else {
                  // 处理其他JSON格式
                  config.onChunk?.({ eventType, payload })
                }
              } catch (e) {
                console.error('SSE消息解析失败', e, dataContent)
                // 即使JSON解析失败，也尝试返回原始数据
                config.onChunk?.({
                  eventType: 'error',
                  error: e,
                  rawData: dataContent
                })
              }
            }
          })
          // const decodeData = decodeUint8Array(eventData.data)
          // config.onChunk && config.onChunk(decodeData)
        })
        return requestTask
      }
    })
  }
  async get(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'GET',
      ...options
    })
  }

  async post(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'POST',
      ...options
    })
  }

  async postStream(url, data, options = {}) {
    console.log(url, data, options, 'postStream')
    return this.request({
      url,
      data,
      method: 'POST',
      enableChunked: true,
      // 设置请求头
      header: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'X-Requested-With': 'XMLHttpRequest', // 某些后端框架需要这个来识别XHR请求
        ...(options.header || {})
      },
      ...options
    })
  }

  /**
   * DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求参数
   * @param {Object} options - 其他配置选项
   * @returns {Promise} - 返回Promise对象
   */
  async delete(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'DELETE',
      ...options
    })
  }

  async put(url, data, options = {}) {
    return this.request({
      url,
      data,
      method: 'PUT',
      ...options
    })
  }
}

export default HttpRequest
