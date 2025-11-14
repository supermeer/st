Component({
  properties: {
    message: Object
  },
  data: {},
  methods: {
    onButtonClick(e) {
      const action = e.currentTarget.dataset.action;
      this.triggerEvent('buttonClick', { action, current: this, messageId: this.properties.message.id, include: true });
    },
    closeSwipeCell() {
      // 通过 id 获取侧滑组件实例
      const swipeCell = this.selectComponent('#swipeCell');
      if (swipeCell && swipeCell.close) {
        swipeCell.close();
      }
    },
    handleRollback() {
      console.log('执行撤回操作');
      // 实现撤回逻辑
    }
  }
})
