!function(a){"use strict";var b=function(a,b,c){b=b||"&",c=c||"=";var d="";if("object"==typeof a){for(var e in a)d+=e+c+a[e]+b;d.length>0&&(d="?"+d.slice(0,-1))}return d},c=function(a){var c=b(a.query);return[a.secure?"https":"http","://",a.host,a.port?":"+a.port:"",a.path||"/",c,a.hash||""].join("")},d=a.XMLHttpRequest,e=function(){},f=function(b,d){var e=b.query[b.jsonp],f=c(b),g=document.createElement("script");g.src=f,g.async=!0,a[e]=function(b){d(null,b),delete a[e],delete g.onerror,g.parentNode.remove(g)},g.onerror=function(b){d(b),delete g.onerror,delete a[e],g.parentNode.remove(g)};var h=document.head||document.getElementsByTagName("head")[0];h.appendChild(g)},g=function(a){for(var b=["response","error","end"],g=0;g<b.length;g++)this["on"+b[g]]=e;var h=HTTPClient.utils.handleOptions(a);for(var i in h)this[i]=h[i];if("string"==typeof h.jsonp)return void f(h,function(a,b){a?this.onerror(a):this.onend(b)}.bind(this));var j=new d;j.addEventListener("error",function(a){this.onerror(a)}.bind(this)),j.addEventListener("readystatechange",function(){if(2===j.readyState){var a={},b=j.getAllResponseHeaders();if(b)for(var c=b.split("\n"),d=0;d<c.length;d++)if(c[d]){var e=c[d].split(":");a[e[0].toLowerCase()]=e.slice(1).join().trim()}var f=j.status;this.onresponse({headers:a,status:f,type:HTTPClient.utils.getTypeFromHeaders(a)})}else 4===j.readyState&&this.onend(j.response)}.bind(this)),j.open(h.method,c(h),!0);for(var k in h.headers)j.setRequestHeader(k,h.headers[k]);j.send(h.body),this.req=j};g.prototype.abort=function(){this.req.abort()},a.HTTPRequest=g}(this),function(a){"use strict";var b;b="undefined"!=typeof module&&module.exports?require("./lib/node"):a.HTTPRequest;var c=function(a,c){if(!c)return new b(a);var d=new b(a);d.onerror=function(a){c(a)};var e;return d.onresponse=function(a){e=a},d.onend=function(a){e=e||{},e.body=a,c(null,e)},d};"undefined"!=typeof module&&module.exports?module.exports=c:a.HTTPClient=c}(this),function(a){"use strict";var b;b="undefined"!=typeof Buffer?function(a){return new Buffer(a).toString("base64")}:a.btoa;var c=function(a){return Object.getPrototypeOf?Object.getPrototypeOf(a):a.__proto__},d=c({}),e=function(a){return"object"!=typeof a?!1:c(a)===d||null===c(a)},f=function(a){var c={};c.query="object"==typeof a.query?a.query:{},c.secure=!!a.secure||!1,c.port=a.port||(c.secure?443:80),c.host=a.host||"localhost",c.path=a.path||"/",c.headers="object"==typeof a.headers?a.headers:{},c.method="string"==typeof a.method?a.method.toUpperCase():"GET",a.jsonp===!0&&(a.jsonp="callback"),"string"==typeof a.jsonp&&(c.jsonp=a.jsonp,c.query[a.jsonp]="HTTPClient"+Date.now());for(var d in c.headers){var f=c.headers[d];delete c.headers[d],c.headers[d.toLowerCase()]=f}if("string"==typeof a.username&&"string"==typeof a.password){var g=a.username+":"+a.password;c.headers.authorization="Basic "+b(g)}return Array.isArray(a.body)||e(a.body)?(c.body=JSON.stringify(a.body),c.headers["tontent-type"]||(c.headers["content-type"]="application/json; charset=utf-8")):"string"==typeof a.body?(c.body=a.body,c.headers["content-type"]||(c.headers["content-type"]="text/plain; charset=utf-8")):(void 0!==a.body||null!==a.body)&&(c.body=a.body),c},g=function(a){var b="";if("object"==typeof a){var c=a["content-type"];c&&(b=c.split(";")[0])}return b},h={handleOptions:f,getTypeFromHeaders:g,getPrototypeOf:c};"undefined"!=typeof module&&module.exports?module.exports=h:a.HTTPClient.utils=h}(this);
(function(global) {

  'use strict';

  var WebSocket;
  var b64;
  var httpclient;
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
    port: 6800
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
    if (Array.isArray(m.params) && m.params.length > 0)
      opts.query.params = b64(JSON.stringify(m.params));


    //browser, use jsonp
    if (typeof module === 'undefined')
      opts.jsonp = 'jsoncallback';

    httpclient(opts, (function(err, res) {
      if (err)
        return fn(err);

      var m = opts.jsonp ? res.body : JSON.parse(res.body.toString());
      this._onmessage(m);

    }).bind(this));
  };
  Aria2.prototype.send = function(method, params) {
    var m = {
      'method': 'aria2.' + method,
      'json-rpc': '2.0',
      'id': this.lastId++
    };

    if (arguments.length > 1) {
      params = [];
      for (var i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] === 'function') {
          this.callbacks[m.id] = arguments[i];
          break;
        }

        params.push(arguments[i]);
      }
      if (params.length > 0)
        m.params = params;
    }

    this.onsend(m);

    //send via websocket
    if (this.socket && this.socket.readyState === 1)
      return this.socket.send(JSON.stringify(m));

    //send via http
    this.http(m, (function(err) {
      this.callbacks[m.id](err);
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