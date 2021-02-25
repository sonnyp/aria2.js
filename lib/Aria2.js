import JSONRPCClient from "./JSONRPCClient.js";

class Aria2 extends JSONRPCClient {
  _withSecret(parameters) {
    let params = this.secret ? ["token:" + this.secret] : [];
    if (Array.isArray(parameters)) {
      params = params.concat(parameters);
    }
    return params;
  }

  _handleNotification(notification) {
    const { method, params } = notification;
    const event = unprefix(method);
    this._signal([event, params]);
    super._handleNotification(notification);
  }

  async call(method, ...params) {
    return super.call(prefix(method), this._withSecret(params));
  }

  async multicall(calls) {
    const multi = [
      calls.map(([method, ...params]) => {
        return { methodName: prefix(method), params: this._withSecret(params) };
      }),
    ];
    return super.call("system.multicall", multi);
  }

  async batch(calls) {
    return super.batch(
      calls.map(([method, ...params]) => [
        prefix(method),
        this._withSecret(params),
      ])
    );
  }

  async listNotifications() {
    const events = await this.call("system.listNotifications");
    return events.map((event) => unprefix(event));
  }

  async listMethods() {
    const methods = await this.call("system.listMethods");
    return methods.map((method) => unprefix(method));
  }
}

Aria2.defaultOptions = {
  ...JSONRPCClient.defaultOptions,
  ...{
    secure: false,
    host: "localhost",
    port: 6800,
    secret: "",
    path: "/jsonrpc",
  },
};

export default Aria2;

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

Object.assign(Aria2, { prefix, unprefix });
