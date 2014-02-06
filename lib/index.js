(function(global) {

  'use strict';

  var WebSocket;
  var b64;
  var httpclient;;
  if (typeof module !== 'undefined' && module.exports) {
    WebSocket = require('ws');
    b64 = function(str) {
      return new Buffer(str).toString('base64');
    };
    httpclient = require('httpclient');
  }
  else {
    WebSocket = global.WebSocket;
    b64 = global.atob;
    httpclient = global.HTTPClient;
  }

  var defaultOpts = {
    secure: false,
    host: 'localhost',
    port: 8600
  };

  var Aria2 = function(opts) {
    this.callbacks = {};
    this.lastId = 0;

    for (var i in defaultOpts)
      this[i] = typeof opts === 'object' && i in opts ? opts[i] : defaultOpts[i];
  };
  Aria2.prototype.http = function(m, fn) {
    //FIXME json-rpc post wouldn't work
    var opts = {
      host: this.host,
      port: this.port,
      path: '/jsonrpc',
      secure: this.secure,
      query: {
        method: m.method,
        id: m.id,
      }
    };
    if (typeof m.params === 'object' && m.params !== null)
      opts.query.params = b64(JSON.stringify(m.params));


    //browser, use jsonp
    if (typeof module === 'undefined')
      opts.jsonp = 'jsoncallback';

    httpclient(opts, (function(err, res) {
      if (err)
        return fn(err);

      if (opts.jsonp)
        return this._onmessage(res.body);

      var m = JSON.parse(res.body.toString())
      this._onmessage(m);

    }).bind(this));
  };
  Aria2.prototype.send = function(method, params, fn) {
    var m = {
      'method': 'aria2.' + method,
      'json-rpc': '2.0',
      'id': this.lastId++
    };

    if (typeof params === 'function')
      fn = params;
    else if (typeof m.params === 'object' && m.params !== null)
      m.params = params;

    if (fn)
      this.callbacks[m.id] = fn;

    this.onsend(m);

    //send via websocket
    if (this.socket && this.socket.readyState === 1)
      return this.socket.send(JSON.stringify(m));

    //send via http
    this.http(m, (function(err) {
      fn(err);
      delete this.callbacks[m.id];
    }).bind(this));
  };
  Aria2.prototype._onmessage = function(m) {
    if (m.id !== undefined) {
      var callback = this.callbacks[m.id];
      if (callback) {
        if (m.error)
          callback(m.error);
        else if (m.result)
          callback(undefined, m.result);

        delete this.callbacks[m.id];
      }
    }
    else if (m.method) {
      var n = m.method.split('aria2.')[1];
      if (n in Aria2.notifications) {
        this[n](m.params);
      }
    }
    this.onmessage(m);
  };
  Aria2.prototype.open = function(url) {
    url = url || (this.secure ? 'wss' : 'ws') + '://' + this.host + ':' + this.port + '/jsonrpc';
    this.socket = new WebSocket(url);

    this.socket.onopen = this.onopen.bind(this);
    this.socket.onclose = this.onclose.bind(this);
    this.socket.onmessage = (function(e) {
      this._onmessage(JSON.parse(e.data));
    }).bind(this);
  };
  Aria2.prototype.close = function() {
    this.socket.close();
  };
  Aria2.methods = {
    addUri: {},
    addTorrent: {},
    addMetalink: {},
    remove: {},
    forceRemove: {},
    pause: {},
    pauseAll: {},
    forcePause: {},
    forcePauseAll: {},
    unpause: {},
    unpauseAll: {},
    tellStatus: {},
    getUris: {},
    getFiles: {},
    getPeers: {},
    getServers: {},
    tellActive: {},
    tellWaiting: {},
    tellStopped: {},
    changePosition: {},
    changeUri: {},
    getOption: {},
    changeOption: {},
    getGlobalOption: {},
    changeGlobalOption: {},
    getGlobalStat: {},
    purgeDownloadResult: {},
    removeDownloadResult: {},
    getVersion: {},
    getSessionInfo: {},
    shutdown: {},
    forceShutdown: {},
    // multicall: {},
  };
  Aria2.notifications = {
    onDownloadStart: {},
    onDownloadPause: {},
    onDownloadStop: {},
    onDownloadComplete: {},
    onDownloadError: {},
    onBtDownloadComplete: {}
  };

  for (var i in Aria2.methods) {
    (function(m) {
      Aria2.prototype[m] = function() {
        this.send(m, arguments[0], arguments[1]);
      };
    }(i));
  }
  for (var y in Aria2.notifications) {
    Aria2.prototype[y] = function() {};
  }

  ['open', 'close', 'send', 'message'].forEach(function(e) {
    Aria2.prototype['on' + e] = function() {};
  });

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Aria2;
  else
    global.Aria2 = Aria2;

})(this);