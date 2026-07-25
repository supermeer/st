import userStore from '../../../store/user'
import SystemInfo from '../../../utils/system'
import Toast from 'tdesign-miniprogram/toast/index'
import { getCharacterTag, getCharacterList } from '../../../services/role/index'

Page(
  Object.assign({}, userStore.data, {
    data: {
      pageInfo: {
        navHeight: 0,
        safeAreaBottom: 0,
      },

      // 标签页
      activeTab: 'system',
      tabs: [
        { key: 'system', name: '星语角色' },
        { key: 'my', name: '我的角色' }
      ],

      // 筛选标签
      tagList: [],
      activeTags: [],

      // 搜索
      searchKeyword: '',
      showSearchInput: false,

      // 角色列表
      roleList: [],

      // 已选择的角色
      selectedRoles: [],

      // 加载状态: 0-待加载, 1-加载中, 2-已全部加载, 3-加载失败
      loadMoreStatus: 0,
      listIsEmpty: false,

      // 分页参数
      pageNo: 1,
      pageSize: 20,
      totalCount: 0,
    },

    onLoad: function (options) {
      userStore.bind(this)

      const pageInfo = SystemInfo.getPageInfo()
      this.setData({
        pageInfo
      })

      if (options.selectedRoles) {
        try {
          const selectedRoles = JSON.parse(decodeURIComponent(options.selectedRoles))
          this.setData({
            selectedRoles
          })
        } catch (e) {
          console.error('解析已选角色失败', e)
        }
      }

      this.getCharacterTag()
      this.loadSystemRoles()
    },

    async getCharacterTag() {
      try {
        const res = await getCharacterTag()
        this.setData({
          tagList: res || []
        })
      } catch (error) {
        console.error('获取标签失败', error)
      }
    },

    loadSystemRoles() {
      this.data.pageNo = 1
      this.loadRoleList(true, 'system')
    },

    loadMyRoles() {
      this.data.pageNo = 1
      this.loadRoleList(true, 'my')
    },

    onTabChange(e) {
      const tabKey = e.currentTarget.dataset.key
      if (tabKey === this.data.activeTab) return

      this.setData({
        activeTab: tabKey,
        roleList: [],
        loadMoreStatus: 0,
      })

      if (tabKey === 'system') {
        this.loadSystemRoles()
      } else {
        this.loadMyRoles()
      }
    },

    onToggleSearch() {
      this.setData({
        showSearchInput: !this.data.showSearchInput
      })

      if (!this.data.showSearchInput) {
        this.setData({
          searchKeyword: ''
        })
        this.loadRoleList(true)
      }
    },

    onSearchInput(e) {
      this.setData({
        searchKeyword: e.detail.value
      })
    },

    onSearchConfirm() {
      this.setData({
        roleList: [],
        loadMoreStatus: 0,
      })
      this.data.pageNo = 1
      this.loadRoleList(true)
    },

    onClearSearch() {
      this.setData({
        searchKeyword: '',
        roleList: [],
        loadMoreStatus: 0,
      })
      this.data.pageNo = 1
      this.loadRoleList(true)
    },

    onTagChange(e) {
      const value = e.currentTarget.dataset.value
      const activeTags = [...this.data.activeTags]

      const tagIndex = activeTags.indexOf(value)
      if (tagIndex > -1) {
        activeTags.splice(tagIndex, 1)
      } else {
        activeTags.push(value)
      }

      this.setData({
        activeTags,
        roleList: [],
        loadMoreStatus: 0,
      })
      this.data.pageNo = 1
      this.loadRoleList(true)
    },

    onRoleClick(e) {
      const role = e.currentTarget.dataset.role
      const { selectedRoles, roleList } = this.data

      const existIndex = selectedRoles.findIndex(item => item.id === role.id)

      if (existIndex > -1) {
        selectedRoles.splice(existIndex, 1)
      } else {
        if (selectedRoles.length >= 9) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '最多选择9个角色',
          })
          return
        }
        selectedRoles.push({
          ...role,
          avatarUrl: role.avatarUrl || role.backgroundImage || ''
        })
      }

      const updatedRoleList = roleList.map(item => {
        if (item.id === role.id) {
          return { ...item, _selected: existIndex > -1 ? false : true }
        }
        return item
      })

      this.setData({
        selectedRoles,
        roleList: updatedRoleList
      })
    },

    onLoadMore() {
      const { roleList, loadMoreStatus, totalCount } = this.data

      if (roleList.length >= totalCount) {
        this.setData({
          loadMoreStatus: 2,
        })
        return
      }

      if (loadMoreStatus !== 0) return

      this.loadRoleList(false)
    },

    onRetryLoad() {
      if (this.data.loadMoreStatus === 3) {
        this.loadRoleList(false)
      }
    },

    async loadRoleList(isRefresh = false, type = null) {
      const tabType = type || this.data.activeTab

      if (isRefresh) {
        this.data.pageNo = 1
      } else {
        this.setData({
          pageNo: this.data.pageNo + 1
        })
      }

      this.setData({
        loadMoreStatus: 1,
      })

      try {
        const params = {
          current: this.data.pageNo,
          size: this.data.pageSize,
          sortOrder: 'desc',
          sortField: 'browseCount',
          characterTagIds: this.data.activeTags.join(','),
        }

        if (tabType === 'system') {
          params.ifSystem = true
        } else {
          params.ifSystem = false
        }

        if (this.data.searchKeyword) {
          params.name = this.data.searchKeyword
        }

        const res = await getCharacterList(params)
        const { selectedRoles } = this.data

        const newList = (res.records || []).map(item => {
          const isSelected = selectedRoles.some(s => s.id === item.id)
          return { ...item, _selected: isSelected }
        })

        const finalList = isRefresh ? newList : [...this.data.roleList, ...newList]

        this.setData({
          totalCount: res.total || 0,
          roleList: finalList,
          loadMoreStatus: finalList.length >= (res.total || 0) ? 2 : 0,
          listIsEmpty: finalList.length === 0,
        })
      } catch (error) {
        console.error('加载角色列表失败:', error)

        this.setData({
          loadMoreStatus: 3,
        })

        Toast({
          context: this,
          selector: '#t-toast',
          message: '加载失败，请重试',
        })
      }
    },

    onScroll(e) {
      // 预留
    },

    onSave() {
      const { selectedRoles } = this.data
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]

      if (prevPage && prevPage.onRoleSelectBack) {
        prevPage.onRoleSelectBack(selectedRoles)
      }

      wx.navigateBack()
    },
  })
)
