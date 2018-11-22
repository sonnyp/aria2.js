"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const Deferred = require("./Deferred");

const promiseEvent = require("./promiseEvent");

const JSONRPCError = require("./JSONRPCError");

const _WebSocket = require("ws");

const _fetch = require("node-fetch");

const EventEmitter = require("events");

const WebSocket = global.WebSocket || _WebSocket;
const fetch = global.fetch ? global.fetch.bind(global) : _fetch;

class JSONRPCClient extends EventEmitter {
  constructor(options) {
    super();
    this.deferreds = Object.create(null);
    this.lastId = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }

  id() {
    return this.lastId++;
  }

  url(protocol) {
    return protocol + (this.secure ? "s" : "") + "://" + this.host + ":" + this.port + this.path;
  }

  websocket(message) {
    return new Promise((resolve, reject) => {
      const cb = err => {
        if (err) reject(err);else resolve();
      };

      this.socket.send(JSON.stringify(message), cb);
      if (global.WebSocket && this.socket instanceof global.WebSocket) cb();
    });
  }

  http(message) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const response = _this.fetch(_this.url("http"), {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });

      response.then(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (res) {
          _this._onmessage((yield res.json()));
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
      return response;
    })();
  }

  _buildMessage(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(method + " is not a string");
    }

    const message = {
      method,
      "json-rpc": "2.0",
      id: this.id()
    };
    if (params) Object.assign(message, {
      params
    });
    return message;
  }

  batch(calls) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const promises = [];
      const message = calls.map(([method, params]) => {
        return _this2._buildMessage(method, params);
      });
      yield _this2._send(message);
      return message.map(({
        id
      }) => {
        const _this2$deferreds$id = _this2.deferreds[id] = new Deferred(),
              promise = _this2$deferreds$id.promise;

        return promise;
      });
    })();
  }

  call(method, parameters) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const message = _this3._buildMessage(method, parameters);

      yield _this3._send(message);

      const _this3$deferreds$mess = _this3.deferreds[message.id] = new Deferred(),
            promise = _this3$deferreds$mess.promise;

      return promise;
    })();
  }

  _send(message) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      _this4.emit("output", message);

      const socket = _this4.socket;
      return socket && socket.readyState === 1 ? _this4.websocket(message) : _this4.http(message);
    })();
  }

  _onresponse({
    id,
    error,
    result
  }) {
    const deferred = this.deferreds[id];
    if (!deferred) return;
    if (error) deferred.reject(new JSONRPCError(error));else deferred.resolve(result);
    delete this.deferreds[id];
  }

  _onrequest({
    method,
    params
  }) {
    return this.onrequest(method, params);
  }

  _onnotification({
    method,
    params
  }) {
    this.emit(method, params);
  }

  _onmessage(message) {
    this.emit("input", message);

    if (Array.isArray(message)) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = message[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          const object = _step.value;

          this._onobject(object);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      this._onobject(message);
    }
  }

  _onobject(message) {
    if (message.method === undefined) this._onresponse(message);else if (message.id === undefined) this._onnotification(message);else this._onrequest(message);
  }

  open() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const socket = _this5.socket = new _this5.WebSocket(_this5.url("ws"));

      socket.onclose = (...args) => {
        _this5.emit("close", ...args);
      };

      socket.onmessage = event => {
        _this5._onmessage(JSON.parse(event.data));
      };

      socket.onopen = (...args) => {
        _this5.emit("open", ...args);
      };

      return promiseEvent(_this5, "open");
    })();
  }

  close() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const socket = _this6.socket;
      socket.close();
      return promiseEvent(_this6, "close");
    })();
  }

}

JSONRPCClient.defaultOptions = {
  secure: false,
  host: "localhost",
  port: 80,
  secret: "",
  path: "/jsonrpc",
  fetch,
  WebSocket
};
module.exports = JSONRPCClient;
//# sourceMappingURL=JSONRPCClient.js.map