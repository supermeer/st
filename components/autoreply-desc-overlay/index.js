Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  externalClasses: ['custom-class', 'content-class'],

  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onClose() {
      this.triggerEvent('close')
    },

    noop() {}
  }
})
