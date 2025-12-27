import promiseEvent from "./promiseEvent.js";
import JSONRPCError from "./JSONRPCError.js";

// https://github.com/nodejs/node/issues/58918
if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options) {
      super(type, options);
      this.error = options?.error;
    }
  };
}

export class JSONRPCEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.data = options?.data;
  }
}

export class JSONRPCNotificationEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.method = options?.method;
    this.params = options?.params;
  }
}

class JSONRPCClient extends EventTarget {
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
    return (
      protocol +
      (this.secure ? "s" : "") +
      "://" +
      this.host +
      ":" +
      this.port +
      this.path
    );
  }

  async websocket(message) {
    this.socket.send(JSON.stringify(message));
  }

  async http(message) {
    const response = await fetch(this.url("http"), {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    let msg;
    try {
      msg = await response.json();
      this._onmessage(msg);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }

    return msg;
  }

  _buildMessage(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(method + " is not a string");
    }

    const message = {
      method,
      "json-rpc": "2.0",
      id: this.id(),
    };

    if (params) Object.assign(message, { params });
    return message;
  }

  async batch(calls) {
    const message = calls.map(([method, params]) => {
      return this._buildMessage(method, params);
    });

    await this._send(message);

    return message.map(({ id }) => {
      const { promise } = (this.deferreds[id] = Promise.withResolvers());
      return promise;
    });
  }

  async call(method, parameters) {
    const message = this._buildMessage(method, parameters);
    await this._send(message);

    const { promise } = (this.deferreds[message.id] = Promise.withResolvers());

    return promise;
  }

  async _send(message) {
    this.dispatchEvent(new JSONRPCEvent("output", { data: message }));

    return this.socket?.readyState === 1
      ? this.websocket(message)
      : this.http(message);
  }

  _onresponse({ id, error, result }) {
    const deferred = this.deferreds[id];
    if (!deferred) return;
    if (error) deferred.reject(new JSONRPCError(error));
    else deferred.resolve(result);
    delete this.deferreds[id];
  }

  _onrequest({ method, params }) {
    return this.onrequest(method, params);
  }

  _onnotification({ method, params }) {
    this.dispatchEvent(
      new JSONRPCNotificationEvent("notification", { method, params }),
    );
  }

  _onmessage(message) {
    this.dispatchEvent(new JSONRPCEvent("input", { data: message }));

    if (Array.isArray(message)) {
      for (const object of message) {
        this._onobject(object);
      }
    } else {
      this._onobject(message);
    }
  }

  _onobject(message) {
    if (message.method === undefined) this._onresponse(message);
    else if (message.id === undefined) this._onnotification(message);
    else this._onrequest(message);
  }

  async open() {
    const socket = (this.socket = new WebSocket(this.url("ws")));

    socket.onclose = () => {
      this.dispatchEvent(new Event("close"));
    };
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        this.dispatchEvent(new ErrorEvent("error", { error }));
        return;
      }
      this._onmessage(message);
    };
    socket.onopen = () => {
      this.dispatchEvent(new Event("open"));
    };
    socket.onerror = (evt) => {
      this.dispatchEvent(new ErrorEvent("error", { error: evt }));
    };

    return promiseEvent(this, "open");
  }

  async close() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, "close");
  }

  static defaultOptions = {
    secure: false,
    host: "localhost",
    port: 80,
    secret: "",
    path: "/jsonrpc",
  };
}

export default JSONRPCClient;
