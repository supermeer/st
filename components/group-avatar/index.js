Component({
  properties: {
    urls: {
      type: Array,
      value: [],
    },
    size: {
      type: Number,
      value: 48,
    },
    gap: {
      type: Number,
      value: 2,
    },
    backgroundColor: {
      type: String,
      value: '#e6e6e6',
    },
  },

  data: {
    visibleUrls: [],
  },

  observers: {
    urls(urls) {
      this.setData({
        visibleUrls: Array.isArray(urls) ? urls.filter(Boolean).slice(0, 9) : [],
      });
    },
  },
});
