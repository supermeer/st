import { formatTime } from "../../../utils/util"
import { getCharacterPointDetail } from "../../../services/vip/index"
Page({
  data: {
    roleInfo: {
      roleId: '',
      name: '',
      avatar: '',
      dialogCount: 0
    },
    consumeList: [],
    loading: false,
    noMore: false,
    page: 1,
    pageSize: 20
  },

  onLoad(options = {}) {
    const {
      roleId,
      roleName,
      avatar,
      dialogCount
    } = options

    const parsedRoleId = roleId || ''
    const initialRoleInfo = {
      roleId: parsedRoleId,
      name: roleName ? decodeURIComponent(roleName) : this.data.roleInfo.name,
      avatar: avatar ? decodeURIComponent(avatar) : this.data.roleInfo.avatar,
      dialogCount: dialogCount ? Number(dialogCount) || 0 : this.data.roleInfo.dialogCount
    }

    this.setData({
      roleInfo: {
        ...this.data.roleInfo,
        ...initialRoleInfo
      }
    })

    if (!parsedRoleId) {
      console.warn('缺少角色ID，无法加载角色详情与积分明细')
      return
    }

    this.loadData(1)
  },

  loadData(page = this.data.page || 1) {
    const { roleInfo, pageSize } = this.data

    if (!roleInfo.roleId) {
      console.warn('缺少角色ID，无法获取积分明细')
      return
    }
    const shouldReset = page === 1

    this.setData({
      loading: true,
      ...(shouldReset ? { consumeList: [], noMore: false } : {})
    })

    getCharacterPointDetail({
      characterId: roleInfo.roleId,
      current: page,
      size: pageSize
    }).then((res = {}) => {
      const {
        records = [],
        current = page,
        pages = 1,
        total = 0
      } = res

      const formattedRecords = records.map((item = {}) => {
        const date = item.createTime ? formatTime(item.createTime, 'YYYY.MM.DD HH:mm') : ''
        return {
          ...item,
          date
        }
      })

      const mergedList = shouldReset
        ? formattedRecords
        : [...this.data.consumeList, ...formattedRecords]
      const noMore = current >= pages

      const latestRecord = records[0] || {}
      const roleInfo = {
        ...this.data.roleInfo,
        name: latestRecord.characterName,
        avatar: latestRecord.backgroundImage,
        dialogCount: total
      }

      this.setData({
        consumeList: mergedList,
        page: current,
        noMore,
        loading: false,
        roleInfo
      })
    }).catch(err => {
      wx.showToast({
        title: typeof err === 'string' ? err : '加载失败，请稍后重试',
        icon: 'none'
      })
      this.setData({
        loading: false,
        ...(shouldReset ? { consumeList: [] } : {})
      })
    })
  },

  loadMore() {
    const { loading, noMore, page } = this.data
    if (loading || noMore) return
    this.loadData(page + 1)
  }
})
