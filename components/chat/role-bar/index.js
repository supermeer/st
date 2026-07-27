Component({
  properties: {
    // 群成员列表：[{ id, name, avatarUrl }]
    roles: {
      type: Array,
      value: []
    },
    // 当前正在发言的角色 id（用于高亮）
    activeRoleId: {
      type: String,
      value: ''
    }
  },
  methods: {
    onRoleTap(e) {
      const { id, name } = e.currentTarget.dataset
      this.triggerEvent('roleTap', { id, name })
    }
  }
})