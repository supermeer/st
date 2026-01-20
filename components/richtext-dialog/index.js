Component({
  properties: {
    titleNodes: {
      type: String,
      value: ''
    },
    iconSrc: {
      type: String,
      value: ''
    },
    contentNodes: {
      type: String,
      value: ''
    },
    buttons: {
      type: Array,
      value: []
    },
    maskClosable: {
      type: Boolean,
      value: true
    },
    autoClose: {
      type: Boolean,
      value: true
    }
  },
  data: {
    visible: false,
    loading: false,
    overrideTitleNodes: '',
    overrideIconSrc: '',
    overrideContentNodes: '',
    overrideButtons: null
  },
  lifetimes: {
    created() {
      this._requestSeq = 0
    }
  },
  methods: {
    show(options = {}) {
      const {
        titleNodes,
        iconSrc,
        contentNodes,
        buttons,
        api,
        params,
        mapResponse
      } = options

      const requestSeq = ++this._requestSeq
      const shouldFetch = typeof api === 'function'

      this.setData({
        visible: true,
        loading: shouldFetch,
        overrideTitleNodes: typeof titleNodes === 'string' ? titleNodes : '',
        overrideIconSrc: typeof iconSrc === 'string' ? iconSrc : '',
        overrideContentNodes:
          typeof contentNodes === 'string' ? contentNodes : '',
        overrideButtons: Array.isArray(buttons) ? buttons : null
      })

      if (!shouldFetch) return

      Promise.resolve()
        .then(() => api(params))
        .then((res) => {
          if (requestSeq !== this._requestSeq) return

          const mapper =
            typeof mapResponse === 'function'
              ? mapResponse
              : (r) => {
                  const data = r && (r.data || r.result || r)
                  return {
                    titleNodes:
                      data &&
                      (data.titleNodes || data.titleHtml || data.title || ''),
                    contentNodes:
                      data &&
                      (data.contentNodes ||
                        data.contentHtml ||
                        data.content ||
                        ''),
                    iconSrc: data && (data.iconSrc || ''),
                    buttons: data && (data.buttons || data.btns || [])
                  }
                }

          const mapped = mapper(res) || {}
          this.setData({
            loading: false,
            overrideTitleNodes:
              typeof mapped.titleNodes === 'string'
                ? mapped.titleNodes
                : this.data.overrideTitleNodes,
            overrideContentNodes:
              typeof mapped.contentNodes === 'string'
                ? mapped.contentNodes
                : this.data.overrideContentNodes,
            overrideIconSrc:
              typeof mapped.iconSrc === 'string'
                ? mapped.iconSrc
                : this.data.overrideIconSrc,
            overrideButtons: Array.isArray(mapped.buttons)
              ? mapped.buttons
              : this.data.overrideButtons
          })
        })
        .catch((error) => {
          if (requestSeq !== this._requestSeq) return
          this.setData({ loading: false })
          this.triggerEvent('error', { error })
        })
    },
    hide() {
      this._requestSeq = (this._requestSeq || 0) + 1
      this.setData({ visible: false, loading: false })
    },
    handleMaskClick() {
      if (!this.data.maskClosable) return
      this.hide()
      this.triggerEvent('close')
    },
    handleButtonTap(e) {
      const index = Number(e.currentTarget.dataset.index)
      const buttons = this.data.overrideButtons || this.data.buttons
      const button = Array.isArray(buttons) ? buttons[index] : undefined
      this.triggerEvent('action', button)
      this.hide()
    }
  }
})
