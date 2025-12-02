/**
 * UTF-8解码核心函数（兼容全环境）
 * @param {ArrayBuffer} buffer - 二进制数据
 * @returns {string} 解码后的字符串
 */
export function decodeUint8Array(buffer) {
  // 1. 优先使用TextDecoder（高性能）
  if (typeof TextDecoder !== 'undefined') {
    try {
      return new TextDecoder('utf-8').decode(buffer)
    } catch (e) {
      /* 降级处理 */
    }
  }

  // 2. 手动解码（兼容低版本环境）
  const bytes = new Uint8Array(buffer)
  let str = ''
  let i = 0

  while (i < bytes.length) {
    const byte = bytes[i]
    if (byte < 0x80) {
      // 1字节字符（ASCII）
      str += String.fromCharCode(byte)
      i += 1
    } else if (byte >= 0xc0 && byte < 0xe0) {
      // 2字节字符
      str += String.fromCharCode(((byte & 0x1f) << 6) | (bytes[i + 1] & 0x3f))
      i += 2
    } else if (byte >= 0xe0 && byte < 0xf0) {
      // 3字节字符
      str += String.fromCharCode(
        ((byte & 0x0f) << 12) |
          ((bytes[i + 1] & 0x3f) << 6) |
          (bytes[i + 2] & 0x3f)
      )
      i += 3
    } else if (byte >= 0xf0) {
      // 4字节字符（含代理对处理）
      const codePoint =
        ((byte & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f)
      // 拆分为UTF-16代理对
      str += String.fromCharCode(
        0xd800 + (codePoint >> 10),
        0xdc00 + (codePoint & 0x3ff)
      )
      i += 4
    }
  }
  return str
}

/**
 * 流式解析器（解决分片截断+SSE协议）
 */
export class StreamParser {
  constructor() {
    this.buffer = new Uint8Array(0) // 二进制缓存池
    this.textBuffer = '' // 文本缓存（用于SSE消息合并）
  }

  /**
   * 处理新分片数据
   * @param {ArrayBuffer} newBuffer - 新收到的二进制分片
   * @returns {string[]} 解析出的完整SSE消息数组
   */
  parseChunk(newBuffer) {
    // 1. 安全合并分片（修复offset越界问题）
    const mergedBuffer = this._mergeBuffers(this.buffer, newBuffer)
    this.buffer = mergedBuffer

    // 2. 检测字符截断位置（关键！）
    const safeCutIndex = this._getSafeCutIndex()
    const completeBuffer = this.buffer.slice(0, safeCutIndex)
    this.buffer = this.buffer.slice(safeCutIndex) // 保留残余字节

    // 3. 解码并提取SSE消息
    const decodedText = decodeUint8Array(completeBuffer)
    this.textBuffer += decodedText
    return this._extractSSEMessages()
  }

  /** 清空缓存（请求结束时调用） */
  reset() {
    this.buffer = new Uint8Array(0)
    this.textBuffer = ''
  }

  // ====== 私有方法 ======
  /**
   * 安全合并缓冲区（修复offset越界）
   * @private
   */
  _mergeBuffers(oldBuffer, newBuffer) {
    const totalLength = oldBuffer.byteLength + newBuffer.byteLength
    const merged = new Uint8Array(totalLength)
    merged.set(oldBuffer, 0)
    merged.set(new Uint8Array(newBuffer), oldBuffer.byteLength) // 关键：偏移量=旧长度
    return merged
  }

  /**
   * 计算安全截断位置（避免拆分多字节字符）
   * @private
   * @returns {number} 安全切割索引
   */
  _getSafeCutIndex() {
    if (this.buffer.length === 0) return 0

    let cutIndex = this.buffer.length - 1
    
    // 从末尾向前扫描，找到多字节字符的起始字节
    // 续字节范围：0x80-0xbf，需要向前跳过
    while (cutIndex >= 0 && this.buffer[cutIndex] >= 0x80 && this.buffer[cutIndex] < 0xc0) {
      cutIndex--
    }
    
    // 现在cutIndex指向起始字节或ASCII字符
    if (cutIndex >= 0) {
      const startByte = this.buffer[cutIndex]
      
      if (startByte < 0x80) {
        // ASCII字符，可以保留
        cutIndex++
      } else if (startByte >= 0xf0) {
        // 4字节字符，需要4个字节完整
        if (cutIndex + 4 > this.buffer.length) {
          // 不完整，向前回溯
          cutIndex = Math.max(0, cutIndex)
        } else {
          cutIndex += 4
        }
      } else if (startByte >= 0xe0) {
        // 3字节字符，需要3个字节完整
        if (cutIndex + 3 > this.buffer.length) {
          cutIndex = Math.max(0, cutIndex)
        } else {
          cutIndex += 3
        }
      } else if (startByte >= 0xc0) {
        // 2字节字符，需要2个字节完整
        if (cutIndex + 2 > this.buffer.length) {
          cutIndex = Math.max(0, cutIndex)
        } else {
          cutIndex += 2
        }
      }
    }
    
    return Math.max(0, cutIndex)
  }

  /**
   * 从缓存中提取完整SSE消息（以\n\n为分隔符）
   * @private
   * @returns {string[]} 消息数组
   */
  _extractSSEMessages() {
    const messages = []
    let endIndex

    while ((endIndex = this.textBuffer.indexOf('\n\n')) >= 0) {
      messages.push(this.textBuffer.slice(0, endIndex))
      this.textBuffer = this.textBuffer.slice(endIndex + 2) // 移除已处理消息
    }
    return messages
  }
}
