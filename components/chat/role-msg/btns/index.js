Component({
  properties: {
    btns: Array,
    disabled: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
    onBtnClick(e) {
      // 直接触发事件，让父组件 role-msg 统一处理 disabled 逻辑
      const action = e.currentTarget.dataset.action;
      this.triggerEvent('buttonClick', { action, current: this });
    }
  }
})