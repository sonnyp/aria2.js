(function(global) {

  'use strict';

  var WebSocket;
  var HTTPClient;
  if (typeof module !== 'undefined' && module.exports) {
    WebSocket = require('ws');
    HTTPClient = require('httpclient');
  }
  else {
    WebSocket = global.WebSocket;
    HTTPClient = global.HTTPClient;
  }

  var Aria2 = function() {
    this.callbacks = {};
    this.lastId = 0;
  };
  ['open', 'close', 'send', 'message'].forEach(function(e) {
    Aria2.prototype['on' + e] = function() {};
  });
  Aria2.prototype.req = function(method, params, fn) {
    var m = {
      'json-rpc': '2.0',
      'method': 'aria2.' + method
    };

    if (typeof params === 'function')
      fn = params;
    else
      m.params = params;

    if (fn || method in Aria2.methods) {
      m.id = this.lastId++;
    }

    if (fn)
      this.callbacks[m.id] = fn;

    var opts = {
      host: 'localhost',
      port: 6800,
      path: '/jsonrpc',
      secure: false,
      query: {}
    }

    //FIXME json-rpc post doesn't work
    opts.query.method = m.method;
    if (m.id !== undefined)
      opts.query.id = m.id
    if (m.params)
      opts.query.params = atob(JSON.stringify(m.params));

    this.onsend(m);
    HTTPClient(opts, (function(err, res) {
      if (err)
        return fn(err)

      var m = JSON.parse(res.body.toString());
      this._onmessage(m);
    }).bind(this));
  };
  Aria2.prototype.send = function(method, params, fn) {
    var m = {
      'json-rpc': '2.0',
      'method': 'aria2.' + method
    };

    if (typeof params === 'function')
      fn = params;
    else
      m.params = params;

    if (fn || method in Aria2.methods) {
      m.id = this.lastId++;
    }

    if (fn)
      this.callbacks[m.id] = fn;

    this.onsend(m);
    this.socket.send(JSON.stringify(m));
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
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', (function() {
      this.onopen();
    }).bind(this));
    this.socket.addEventListener('close', (function() {
      this.onclose();
    }).bind(this));
    this.socket.addEventListener('message', (function(e) {
      this._onmessage(JSON.parse(e.data));
    }).bind(this));
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

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Aria2;
  else
    global.Aria2 = Aria2;

})(this);