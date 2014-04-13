(function(global) {

  'use strict';

  var formatQuery = function(query, sep, eq) {
    //separator character
    sep = sep || '&';
    //assignement character
    eq = eq || '=';

    var querystring = '';
    if (typeof query === 'object') {
      for (var i in query) {
        querystring += i + eq + query[i] + sep;
      }

      if (querystring.length > 0)
        querystring = '?' + querystring.slice(0, -1);
    }
    return querystring;
  };

  var formatURL = function(obj, sep, eq) {

    var querystring = formatQuery(obj.query);

    return [
      obj.secure ? 'https' : 'http',
      '://',
      obj.host,
      obj.port ? ':' + obj.port : '',
      obj.path || '/',
      querystring,
      obj.hash || ''
    ].join('');
  };

  var XMLHttpRequest = global.XMLHttpRequest;
  var dummy = function() {};

  var jsonp = function(opts, fn) {
    var cb = opts.query[opts.jsonp];
    var url = formatURL(opts);

    var el = document.createElement('script');
    el.src = url;
    el.async = true;

    global[cb] = function(b) {
      fn(null, b);
      delete global[cb];
      delete el.onerror;
      el.parentNode.remove(el);
    };

    el.onerror = function(e) {
      fn(e);
      delete el.onerror;
      delete global[cb];
      el.parentNode.remove(el);
    };

    var head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(el);
  };

  var HTTPRequest = function(options) {
    var events = ['response', 'error', 'end'];
    for (var i = 0; i < events.length; i++)
      this['on' + events[i]] = dummy;

    var opts = HTTPClient.utils.handleOptions(options);

    for (var j in opts)
      this[j] = opts[j];

    //jsonp
    if (typeof opts.jsonp === 'string') {
      jsonp(opts, (function(err, body) {
        if (err)
          this.onerror(err);
        else
          this.onend(body);
      }).bind(this));
      return;
    }

    var req = new XMLHttpRequest();

    req.addEventListener('error', (function(err) {
      this.onerror(err);
    }).bind(this));

    req.addEventListener('readystatechange', (function() {
      //0   UNSENT  open()has not been called yet.
      //1   OPENED  send()has not been called yet.
      //2   HEADERS_RECEIVED  send() has been called, and headers and status are available.
      //3   LOADING   Downloading; responseText holds partial data.
      //4   DONE  The operation is complete.
      // if (req.readyState === 1) {
      //   this.onopen();
      // }
      if (req.readyState === 2) {
        var headers = {};
        var str = req.getAllResponseHeaders();
        if (str) {
          var lines = str.split('\n');
          for (var i = 0; i < lines.length; i++) {
            if (!lines[i])
              continue;

            var keyvalue = lines[i].split(':');
            headers[keyvalue[0].toLowerCase()] = keyvalue.slice(1).join().trim();
          }
        }

        var status = req.status;
        this.onresponse({
          headers: headers,
          status: status,
          type: HTTPClient.utils.getTypeFromHeaders(headers)
        });
      }
      else if (req.readyState === 4) {
        this.onend(req.response);
      }
    }).bind(this));

    // req.addEventListener('progress', (function(e) {
    //   var complete = e.lengthComputable ? e.loaded / e.total : null;
    //   this.ondownloadprogress(complete);
    // }).bind(this));

    // req.upload.addEventListener('progress', (function(e) {
    //   var complete = e.lengthComputable ? e.loaded / e.total : null;
    //   this.onuploadprogress(complete);
    // }).bind(this));

    req.open(opts.method, formatURL(opts), true);

    // if (this.responseType)
    //   req.responseType = this.responseType;

    for (var k in opts.headers) {
      req.setRequestHeader(k, opts.headers[k]);
    }

    req.send(opts.body);

    this.req = req;
  };
  HTTPRequest.prototype.abort = function() {
    this.req.abort();
  };

  global.HTTPRequest = HTTPRequest;

})(this);
(function(global) {

  'use strict';

  var HTTPRequest;

  if (typeof module !== 'undefined' && module.exports)
    HTTPRequest = require('./lib/node');
  else
    HTTPRequest = global.HTTPRequest;

  var test = function(options, callback) {
    if (!callback)
      return new HTTPRequest(options);

    var req = new HTTPRequest(options);
    req.onerror = function(err) {
      callback(err);
    };
    var res;
    req.onresponse = function(response) {
      res = response;
    };
    req.onend = function(body) {
      res = res || {};
      res.body = body;
      callback(null, res);
    };

    return req;
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = test;
  else
    global.HTTPClient = test;

})(this);
(function(global) {

  'use strict';

  var base64;
  if (typeof Buffer !== 'undefined') {
    base64 = function(str) {
      return (new Buffer(str)).toString('base64');
    };
  }
  else {
    base64 = global.btoa;
  }

  var getPrototypeOf = function(obj) {
    if (Object.getPrototypeOf)
      return Object.getPrototypeOf(obj);
    else
      return obj.__proto__;
  };

  var prototypeOfObject = getPrototypeOf({});

  var isObject = function(obj) {
    if (typeof obj !== 'object')
      return false;

    return getPrototypeOf(obj) === prototypeOfObject || getPrototypeOf(obj) === null;
  };

  var handleOptions = function(opts) {

    var options = {};

    options.query = typeof opts.query === 'object' ? opts.query : {};
    options.secure = !!opts.secure || false;
    options.port = opts.port || (options.secure ? 443 : 80);
    options.host = opts.host || 'localhost';
    options.path = opts.path || '/';
    options.headers = typeof opts.headers === 'object' ? opts.headers : {};
    options.method = typeof opts.method === 'string' ? opts.method.toUpperCase() : 'GET';

    //jsonp
    if (opts.jsonp === true)
      opts.jsonp = 'callback';
    if (typeof opts.jsonp === 'string') {
      options.jsonp = opts.jsonp;
      options.query[opts.jsonp] = 'HTTPClient' + Date.now();
    }

    //lower cases headers
    for (var i in options.headers) {
      var v = options.headers[i];
      delete options.headers[i];
      options.headers[i.toLowerCase()] = v;
    }

    //basic auth
    if (typeof opts.username === 'string' && typeof opts.password === 'string') {
      var creds = opts.username + ':' + opts.password;
      options.headers.authorization = 'Basic ' + base64(creds);
    }

    //json
    if (Array.isArray(opts.body) || isObject(opts.body)) {
      options.body = JSON.stringify(opts.body);
      if (!options.headers['tontent-type'])
        options.headers['content-type'] = 'application/json; charset=utf-8';
    }

    //string
    else if (typeof opts.body === 'string') {
      options.body = opts.body;
      if (!options.headers['content-type'])
        options.headers['content-type'] = 'text/plain; charset=utf-8';
    }
    else if (opts.body !== undefined || opts.body !== null) {
      options.body = opts.body;
    }

    return options;
  };

  var getTypeFromHeaders = function(headers) {
    var type = '';
    if (typeof headers === 'object') {
      var contentType = headers['content-type'];
      if (contentType)
        type = contentType.split(';')[0];
    }
    return type;
  };

  var utils = {
    handleOptions: handleOptions,
    getTypeFromHeaders: getTypeFromHeaders,
    getPrototypeOf: getPrototypeOf
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = utils;
  else
    global.HTTPClient.utils = utils;

})(this);
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

  var Aria2 = function(opts) {
    this.callbacks = {};
    this.lastId = 0;

    for (var i in Aria2.options)
      this[i] = typeof opts === 'object' && i in opts ? opts[i] : Aria2.options[i];
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
      params = this.secret ? ['token:' + this.secret] : [];
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
      if (n.indexOf('on') === 0 && typeof this[n] === 'function' && Aria2.notifications.indexOf(n) > -1)
        this[n].apply(this, m.params);
    }
    this.onmessage(m);
  };
  Aria2.prototype.open = function(fn) {
    var url = (this.secure ? 'wss' : 'ws') + '://' + this.host + ':' + this.port + '/jsonrpc';
    this.socket = new WebSocket(url);

    var self = this;
    var callbacked = false;
    this.socket.onopen = function() {
      if (!callbacked) {
        fn();
        callbacked = true;
      }
      self.onopen();
    };
    this.socket.onerror = function(err) {
      if (!callbacked) {
        fn(err);
        callbacked = true;
      }
    };
    this.socket.onclose = function() {
      self.onclose();
    };
    this.socket.onmessage = function(e) {
      self._onmessage(JSON.parse(e.data));
    };
  };
  Aria2.prototype.close = function() {
    this.socket.close();
    delete this.socket;
  };
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
  ];
  Aria2.notifications = [
    'onDownloadStart',
    'onDownloadPause',
    'onDownloadStop',
    'onDownloadComplete',
    'onDownloadError',
    'onBtDownloadComplete'
  ];
  Aria2.events = [
    'onopen',
    'onclose',
    'onsend',
    'onmessage'
  ];
  Aria2.options = {
    secure: false,
    host: 'localhost',
    port: 6800,
    secret: ''
  };

  Aria2.methods.forEach(function(method) {
    Aria2.prototype[method] = function() {
      this.send.apply(this, [method].concat(Array.prototype.slice.call(arguments)));
    };
  });

  Aria2.notifications.forEach(function(notification) {
    Aria2.prototype[notification] = function() {};
  });

  Aria2.events.forEach(function(event) {
    Aria2.prototype[event] = function() {};
  });

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Aria2;
  else
    global.Aria2 = Aria2;

})(this);