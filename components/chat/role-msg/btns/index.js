Component({
  properties: {
    btns: Array
  },
  data: {},
  methods: {
    onBtnClick(e) {
      const action = e.currentTarget.dataset.action;
      this.triggerEvent('buttonClick', { action, current: this });
    }
  }
})