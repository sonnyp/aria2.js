(function(global) {
  'use strict'

  var WebSocket
  var b64
  var httpclient

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

  var Aria2 = function(opts) {
    this.callbacks = Object.create(null)
    this.lastId = 0

    for (var i in Aria2.options)
      this[i] = typeof opts === 'object' && i in opts ? opts[i] : Aria2.options[i]
  }

  Aria2.prototype.http = function(m, fn) {
    //FIXME json-rpc post wouldn't work
    var opts = {
      'host': this.host,
      'port': this.port,
      'path': '/jsonrpc',
      'secure': this.secure,
      'query': {
        'method': m.method,
        'id': m.id,
      },
    }

    if (Array.isArray(m.params) && m.params.length > 0)
      opts.query.params = b64(JSON.stringify(m.params))

    //browser, use jsonp
    if (typeof module !== 'undefined' && module.exports)
      opts.jsonp = 'jsoncallback'

    var that = this

    httpclient.request(opts, function(err, res) {
      if (err) return fn(err)

      var msg = opts.jsonp ? res.body : JSON.parse(res.body.toString())
      that._onmessage(msg)
    })
  }

  Aria2.prototype.send = function(method /* [,param] [,param] [,...] [, fn]*/) {
    if (typeof method !== 'string')
      throw new TypeError(method + ' is not a string')

    var m = {
      'method': 'aria2.' + method,
      'json-rpc': '2.0',
      'id': this.lastId++,
    }

    var params = this.secret ? ['token:' + this.secret] : []

    for (var i = 1, l = arguments.length; i < l; i++) {
      var arg = arguments[i]
      if (i === arguments.length - 1 && typeof arg === 'function')
        this.callbacks[m.id] = arg
      else
        params.push(arg)
    }

    if (params.length > 0) m.params = params

    this.onsend(m)

    //send via websocket
    if (this.socket && this.socket.readyState === 1)
      return this.socket.send(JSON.stringify(m))

    var that = this

    //send via http
    this.http(m, function(err) {
      that.callbacks[m.id](err)
      delete that.callbacks[m.id]
    })
  }

  Aria2.prototype._onmessage = function(m) {
    this.onmessage(m)

    if (m.id !== undefined) {
      var callback = this.callbacks[m.id]
      if (callback) {
        if (m.error)
          callback(m.error)
        else
          callback(null, m.result)

        delete this.callbacks[m.id]
      }
    }
    else if (m.method) {
      var n = m.method.split('aria2.')[1]
      if (n.indexOf('on') === 0 && typeof this[n] === 'function' && Aria2.notifications.indexOf(n) > -1)
        this[n].apply(this, m.params)
    }
  }

  Aria2.prototype.open = function(fn) {
    var url = (this.secure ? 'wss' : 'ws') + '://' + this.host + ':' + this.port + '/jsonrpc'
    var socket = this.socket = new WebSocket(url)
    var that = this
    var called = false

    socket.onopen = function() {
      if (fn && !called) {
        fn()
        called = true
      }
      that.onopen()
    }
    socket.onerror = function(err) {
      if (fn && !called) {
        fn(err)
        called = true
      }
    }
    socket.onclose = function() {
      that.onclose()
    }
    socket.onmessage = function(event) {
      that._onmessage(JSON.parse(event.data))
    }
  }

  Aria2.prototype.close = function() {
    if (!this.socket)
      return

    this.socket.close()
  }

  // http://aria2.sourceforge.net/manual/en/html/aria2c.html#methods
  Aria2.methods = [
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.addUri
    'addUri',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.addTorrent
    'addTorrent',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.addMetalink
    'addMetalink',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.remove
    'remove',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.forceRemove
    'forceRemove',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.pause
    'pause',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.pauseAll
    'pauseAll',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.forcePause
    'forcePause',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.forcePauseAll
    'forcePauseAll',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.unpause
    'unpause',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.unpauseAll
    'unpauseAll',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.tellStatus
    'tellStatus',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getUris
    'getUris',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getFiles
    'getFiles',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getPeers
    'getPeers',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getServers
    'getServers',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.tellActive
    'tellActive',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.tellWaiting
    'tellWaiting',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.tellStopped
    'tellStopped',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.changePosition
    'changePosition',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.changeUri
    'changeUri',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getOption
    'getOption',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.changeOption
    'changeOption',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getGlobalOption
    'getGlobalOption',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.changeGlobalOption
    'changeGlobalOption',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getGlobalStat
    'getGlobalStat',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.purgeDownloadResult
    'purgeDownloadResult',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.removeDownloadResult
    'removeDownloadResult',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getVersion
    'getVersion',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getSessionInfo
    'getSessionInfo',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.shutdown
    'shutdown',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.forceShutdown
    'forceShutdown',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.saveSession
    'saveSession',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#system.multicall
    // multicall: {},
  ]

  // http://aria2.sourceforge.net/manual/en/html/aria2c.html#notifications
  Aria2.notifications = [
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadStart
    'onDownloadStart',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadPause
    'onDownloadPause',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadStop
    'onDownloadStop',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadComplete
    'onDownloadComplete',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadError
    'onDownloadError',
    // http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onBtDownloadComplete
    'onBtDownloadComplete',
  ]

  Aria2.events = [
    'onopen',
    'onclose',
    'onsend',
    'onmessage',
  ]

  Aria2.options = {
    'secure': false,
    'host': 'localhost',
    'port': 6800,
    'secret': '',
  }

  Aria2.methods.forEach(function(method) {
    Aria2.prototype[method] = function(/* [param] [,param] [,...]*/) {
      this.send.apply(this, [method].concat(Array.prototype.slice.call(arguments)))
    }
  })

  Aria2.notifications.forEach(function(notification) {
    Aria2.prototype[notification] = function() {}
  })

  Aria2.events.forEach(function(event) {
    Aria2.prototype[event] = function() {}
  })

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Aria2
  }
  else {
    global.Aria2 = Aria2
  }
}(this))
