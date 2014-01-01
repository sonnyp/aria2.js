(function() {

  'use strict';

  var Aria2 = function() {
    this.callbacks = {};
    this.lastMessageId = 0;
  };
  ['open', 'close', 'send', 'message'].forEach(function(e) {
    Aria2.prototype['on' + e] = function() {};
  })
  Aria2.prototype.send = function() {
    var m = {
      'json-rpc': '2.0',
      'method': 'aria2.' + arguments[0]
    };

    var callback;
    var params;
    if (typeof arguments[1] !== 'undefined') {
      if (typeof arguments[1] === 'function')
        callback = arguments[1];
      else
        params = arguments[1];
    }
    if (typeof arguments[2] === 'function')
      callback = arguments[2];

    if (params)
      m.params = params;

    if (callback || arguments[0] in Aria2.methods) {
      m.id = this.lastMessageId++;
    }

    if (callback)
      this.callbacks[m.id] = callback;

    this.onsend(m);
    this.socket.send(JSON.stringify(m));
  };
  Aria2.prototype.open = function(url) {
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', (function() {
      this.onopen();
    }).bind(this));
    this.socket.addEventListener('close', (function() {
      this.onclose();
    }).bind(this));
    this.socket.addEventListener('message', (function(m) {
      var m = JSON.parse(m.data);
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
    })(i);
  }
  for (var y in Aria2.notifications) {
    Aria2.prototype[y] = function() {};
  }

  window.Aria2 = Aria2;

})();