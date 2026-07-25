/**
 * 群聊流式 chunk 解析器
 *
 * 设计：
 * - 后端在一次流式返回中，可能会输出多段"角色发言"，各角色之间用固定分隔符 GROUP_SEPARATOR 切分。
 * - 为了兼容角色名中也可能出现普通文本的情况，这里用前后缀包裹：
 *     "角色A说：xxxx[[GROUP_SEP]]角色B说：yyyy[[GROUP_SEP]]角色C说：zzzz"
 *   解析时按 [[GROUP_SEP]] 切，再按 "说：" 切出（角色名，发言正文）。
 * - 如果后端约定的是其他格式（或者每个角色用单独 type=roleStart / roleText 事件推送），
 *   也可以保持当前函数签名、把切分逻辑换掉即可，上层调用方式不变。
 */

export const GROUP_SEPARATOR = '[[GROUP_SEP]]'
// 角色与正文的分隔符；可以按后端协议调整
const ROLE_BODY_DELIMITER = '：'

/**
 * 状态机：每次 chunk 到来时调用，返回新追加到的角色消息列表（不含尚未结束的最后一条）。
 *
 * @param {object} state  - 解析器内部状态，必须持久化（用 ref 或 _state 字段保存）
 * @param {string} chunk  - 本次增量文本
 * @returns {{ state: object, completed: Array<{roleName: string, content: string}> }}
 */
export function feedGroupChunk(state, chunk) {
  const next = state || { buffer: '', currentRole: null }
  next.buffer += chunk || ''

  const completed = []
  let idx
  // eslint-disable-next-line no-cond-assign
  while ((idx = next.buffer.indexOf(GROUP_SEPARATOR)) >= 0) {
    const segment = next.buffer.slice(0, idx)
    next.buffer = next.buffer.slice(idx + GROUP_SEPARATOR.length)
    const parsed = parseSegment(segment)
    if (parsed) {
      completed.push(parsed)
    }
    // 切完之后，把下一段的"角色名"预解析出来，作为 currentRole，
    // 后续纯文本追加直到遇到下一个分隔符。
    const nextPeekIdx = next.buffer.indexOf(GROUP_SEPARATOR)
    if (nextPeekIdx === -1) {
      // 可能是 "下一角色名：xxxx" 的开头，也可能没有下一段了
      const headEnd = next.buffer.indexOf(ROLE_BODY_DELIMITER)
      if (headEnd > 0) {
        next.currentRole = next.buffer.slice(0, headEnd).trim()
      } else {
        // 还看不出下一角色是谁，先保留 buffer 等后续 chunk
        next.currentRole = null
      }
    }
  }
  return { state: next, completed }
}

/**
 * 流结束时调用，把 buffer 里剩余的最后一段也作为一条完成消息返回。
 */
export function flushGroupChunk(state) {
  const next = state || { buffer: '', currentRole: null }
  const completed = []
  if (next.buffer && next.buffer.trim()) {
    const parsed = parseSegment(next.buffer)
    if (parsed) {
      completed.push(parsed)
    }
  }
  next.buffer = ''
  next.currentRole = null
  return completed
}

/**
 * 把一段 segment 解析成 { roleName, content }。
 * 期望 segment 形如 "角色名：正文"（前后空格自动 trim）。
 * 如果格式对不上，返回 null（说明协议不一致，由调用方处理）。
 */
function parseSegment(segment) {
  if (!segment) return null
  const idx = segment.indexOf(ROLE_BODY_DELIMITER)
  if (idx <= 0) {
    // 没有 "："分隔符；可能是协议约定不同
    return { roleName: '未知角色', content: segment.trim() }
  }
  const roleName = segment.slice(0, idx).trim()
  const content = segment.slice(idx + ROLE_BODY_DELIMITER.length).trim()
  return { roleName, content }
}

/**
 * 根据角色名在群成员中查找完整信息（头像等）。
 * 如果没找到，构造一个占位对象，UI 仍能渲染。
 */
export function resolveRoleMeta(roleList, roleName) {
  if (!Array.isArray(roleList)) return { id: null, name: roleName, avatarUrl: '' }
  const hit = roleList.find((r) => r.name === roleName)
  if (hit) return { ...hit }
  return { id: null, name: roleName, avatarUrl: '' }
}