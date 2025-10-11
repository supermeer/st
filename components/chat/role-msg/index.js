Component({
  properties: {
    message: Object
  },
  data: {},
  swipeCellInstance: null, // 保存侧滑组件实例
  methods: {
    onButtonClick(e) {
      const action = e.currentTarget.dataset.action;
      console.log('点击的按钮:', action);
      
      // 根据不同的 action 执行不同的操作
      switch(action) {
        case 'rollback':
          this.handleRollback();
          break;
        case 'newPlot':
          this.handleNewPlot();
          break;
        case 'like':
          this.handleLike();
          break;
        case 'dislike':
          this.handleDislike();
          break;
      }
      
      // 关闭侧滑
      // this.closeSwipeCell();
    },
    closeSwipeCell() {
      // 方法2：通过 id 获取侧滑组件实例
      const swipeCell = this.selectComponent('#swipeCell');
      if (swipeCell && swipeCell.close) {
        swipeCell.close();
      }
    },
    handleRollback() {
      console.log('执行回溯操作');
      // 实现回溯逻辑
    },
    handleNewPlot() {
      console.log('执行新剧情操作');
      // 实现新剧情逻辑
    },
    handleLike() {
      console.log('执行点赞操作');
      // 实现点赞逻辑
    },
    handleDislike() {
      console.log('执行点踩操作');
      // 实现点踩逻辑
    }
  }
})
