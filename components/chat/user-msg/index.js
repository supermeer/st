Component({
  properties: {
    message: Object
  },
  data: {},
  methods: {
    onButtonClick(e) {
      const action = e.currentTarget.dataset.action;
      
      // 根据不同的 action 执行不同的操作
      switch(action) {
        case 'rollback':
          this.handleRollback();
          break;
        // case 'edit':
        //   this.handleEdit();
        //   break;
        default:
          console.log('未知操作:', action);
      }
      
      // 关闭侧滑
      this.closeSwipeCell();
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
