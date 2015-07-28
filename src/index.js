(function(global) {
  'use strict'

  let WebSocket
  let b64
  let httpclient

  if (typeof module !== 'undefined' && module.exports) {
    WebSocket = require('ws')
    b64 = function(str) {
      return new Buffer(str).toString('base64')
    }
    httpclient = require('httpclient')
  }
  else {
    WebSocket = global.WebSocket
    b64 = global.atob
    httpclient = global.HTTPClient
  }

  const Aria2 = function(opts) {
    this.callbacks = Object.create(null)
    this.lastId = 0

    for (const i in Aria2.options)
      this[i] = typeof opts === 'object' && i in opts ? opts[i] : Aria2.options[i]
  }

  Aria2.prototype.http = function(m, fn) {
    //FIXME json-rpc post wouldn't work
    const opts = {
      'host': this.host,
      'port': this.port,
      'path': '/jsonrpc',
      'secure': this.secure,
      'query': {
        'method': m.method,
        'id': m.id
      }
    }

    if (Array.isArray(m.params) && m.params.length > 0)
      opts.query.params = b64(JSON.stringify(m.params))

    //browser, use jsonp
    if (typeof module !== 'undefined' && module.exports)
      opts.jsonp = 'jsoncallback'

    httpclient.request(opts, (err, res) => {
      if (err) return fn(err)

      const msg = opts.jsonp ? res.body : JSON.parse(res.body.toString())
      this._onmessage(msg)
    })
  }

  Aria2.prototype.send = function(method /*, [param1], [param2], ..., [callback] */) {
    const m = {
      'method': 'aria2.' + method,
      'json-rpc': '2.0',
      'id': this.lastId++
    }

    const params = this.secret ? ['token:' + this.secret] : []

    if (arguments.length > 1) {
      for (let i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] === 'function') {
          this.callbacks[m.id] = arguments[i]
          break
        }

        params.push(arguments[i])
      }
    }

    if (params.length > 0)
      m.params = params

    this.onsend(m)

    //send via websocket
    if (this.socket && this.socket.readyState === 1)
      return this.socket.send(JSON.stringify(m))

    //send via http
    this.http(m, (err) => {
      this.callbacks[m.id](err)
      delete this.callbacks[m.id]
    })
  }

  Aria2.prototype._onmessage = function(m) {
    if (m.id !== undefined) {
      const callback = this.callbacks[m.id]
      if (callback) {
        if (m.error)
          callback(m.error)
        else
          callback(null, m.result)

        delete this.callbacks[m.id]
      }
    }
    else if (m.method) {
      const n = m.method.split('aria2.')[1]
      if (n.indexOf('on') === 0 && typeof this[n] === 'function' && Aria2.notifications.indexOf(n) > -1)
        this[n].apply(this, m.params)
    }
    this.onmessage(m)
  }

  Aria2.prototype.open = function(fn) {
    const url = (this.secure ? 'wss' : 'ws') + '://' + this.host + ':' + this.port + '/jsonrpc'
    this.socket = new WebSocket(url)

    let called = false
    this.socket.onopen = () => {
      if (fn && !called) {
        fn()
        called = true
      }
      this.onopen()
    }
    this.socket.onerror = (err) => {
      if (fn && !called) {
        fn(err)
        called = true
      }
    }
    this.socket.onclose = () => {
      this.onclose()
    }
    this.socket.onmessage = (event) => {
      this._onmessage(JSON.parse(event.data))
    }
  }

  Aria2.prototype.close = function() {
    if (!this.socket)
      return

    this.socket.close()
  }

  Aria2.methods = [
    'addUri',
    'addTorrent',
    'addMetalink',
    'remove',
    'forceRemove',
    'pause',
    'pauseAll',
    'forcePause',
    'forcePauseAll',
    'unpause',
    'unpauseAll',
    'tellStatus',
    'getUris',
    'getFiles',
    'getPeers',
    'getServers',
    'tellActive',
    'tellWaiting',
    'tellStopped',
    'changePosition',
    'changeUri',
    'getOption',
    'changeOption',
    'getGlobalOption',
    'changeGlobalOption',
    'getGlobalStat',
    'purgeDownloadResult',
    'removeDownloadResult',
    'getVersion',
    'getSessionInfo',
    'shutdown',
    'forceShutdown'
    // multicall: {},
  ]
  Aria2.notifications = [
    'onDownloadStart',
    'onDownloadPause',
    'onDownloadStop',
    'onDownloadComplete',
    'onDownloadError',
    'onBtDownloadComplete'
  ]
  Aria2.events = [
    'onopen',
    'onclose',
    'onsend',
    'onmessage'
  ]
  Aria2.options = {
    'secure': false,
    'host': 'localhost',
    'port': 6800,
    'secret': ''
  }

  Aria2.methods.forEach(function(method) {
    Aria2.prototype[method] = function() {
      this.send.apply(this, [method].concat(Array.prototype.slice.call(arguments)))
    }
  })

  Aria2.notifications.forEach(function(notification) {
    Aria2.prototype[notification] = function() {}
  })

  Aria2.events.forEach(function(event) {
    Aria2.prototype[event] = function() {}
  })

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Aria2
  else
    global.Aria2 = Aria2
}(this))
