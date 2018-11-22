"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const JSONRPCClient = require("./JSONRPCClient");

function prefix(str) {
  if (!str.startsWith("system.") && !str.startsWith("aria2.")) {
    str = "aria2." + str;
  }

  return str;
}

function unprefix(str) {
  const suffix = str.split("aria2.")[1];
  return suffix || str;
}

class Aria2 extends JSONRPCClient {
  addSecret(parameters) {
    let params = this.secret ? ["token:" + this.secret] : [];

    if (Array.isArray(parameters)) {
      params = params.concat(parameters);
    }

    return params;
  }

  _onnotification(notification) {
    const method = notification.method,
          params = notification.params;
    const event = unprefix(method);
    if (event !== method) this.emit(event, params);
    return super._onnotification(notification);
  }

  call(method, ...params) {
    var _this = this,
        _superprop_callCall = (..._args) => super.call(..._args);

    return _asyncToGenerator(function* () {
      return _superprop_callCall(prefix(method), _this.addSecret(params));
    })();
  }

  multicall(calls) {
    var _this2 = this,
        _superprop_callCall2 = (..._args2) => super.call(..._args2);

    return _asyncToGenerator(function* () {
      const multi = [calls.map(([method, ...params]) => {
        return {
          methodName: prefix(method),
          params: _this2.addSecret(params)
        };
      })];
      return _superprop_callCall2("system.multicall", multi);
    })();
  }

  batch(calls) {
    var _this3 = this,
        _superprop_callBatch = (..._args3) => super.batch(..._args3);

    return _asyncToGenerator(function* () {
      return _superprop_callBatch(calls.map(([method, ...params]) => [prefix(method), _this3.addSecret(params)]));
    })();
  }

  listNotifications() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const events = yield _this4.call("system.listNotifications");
      return events.map(event => unprefix(event));
    })();
  }

  listMethods() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const methods = yield _this5.call("system.listMethods");
      return methods.map(method => unprefix(method));
    })();
  }

}

Object.assign(Aria2, {
  prefix,
  unprefix
});
Aria2.defaultOptions = Object.assign({}, JSONRPCClient.defaultOptions, {
  secure: false,
  host: "localhost",
  port: 6800,
  secret: "",
  path: "/jsonrpc"
});
module.exports = Aria2;
//# sourceMappingURL=Aria2.js.map