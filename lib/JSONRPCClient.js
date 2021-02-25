import Deferred from "./Deferred.js";
import promiseEvent from "./promiseEvent.js";
import JSONRPCError from "./JSONRPCError.js";
import Signaler from "./Signaler.js";

class JSONRPCClient extends Signaler {
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
    const response = await this.fetch(this.url("http"), {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    response
      .json()
      .then((msg) => this._handleMessage(msg))
      .catch((err) => {
        this._signal(["error", err]);
      });

    return response;
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
      const { promise } = (this.deferreds[id] = new Deferred());
      return promise;
    });
  }

  async call(method, parameters) {
    const message = this._buildMessage(method, parameters);
    await this._send(message);

    const { promise } = (this.deferreds[message.id] = new Deferred());

    return promise;
  }

  async _send(message) {
    this._signal(["output", message]);

    const { socket } = this;
    return socket && socket.readyState === 1
      ? this.websocket(message)
      : this.http(message);
  }

  _handleResponse({ id, error, result }) {
    const deferred = this.deferreds[id];
    if (!deferred) return;
    if (error) deferred.reject(new JSONRPCError(error));
    else deferred.resolve(result);
    delete this.deferreds[id];
  }

  _handleNotification(message) {
    this._signal(["notification", message]);
  }

  _handleObject(message) {
    if (message.method === undefined) this._handleResponse(message);
    else if (message.id === undefined) this._handleNotification(message);
    else this._handleRequest(message);
  }
  _signal(value) {
    this.signal(value);
  }

  _handleMessage(message) {
    this._signal(["input", message]);

    if (Array.isArray(message)) {
      for (const object of message) {
        this._handleObject(object);
      }
    } else {
      this._handleObject(message);
    }
  }

  async open() {
    const socket = (this.socket = new this.WebSocket(this.url("ws")));

    socket.onclose = (event) => {
      this._signal(["close", event]);
    };
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (err) {
        return this._signal(["error", err]);
      }
      this._handleMessage(message);
    };
    socket.onopen = (event) => {
      this._signal(["open", event]);
    };
    socket.onerror = (event) => {
      this._signal(["error", event]);
    };

    await promiseEvent(socket, "open");
  }

  async close() {
    if (!this.socket) return;
    const { socket } = this;
    socket.close();
    await promiseEvent(socket, "close");
  }
}

JSONRPCClient.defaultOptions = {
  secure: false,
  host: "localhost",
  port: 80,
  secret: "",
  path: "/jsonrpc",
  fetch: globalThis.fetch,
  WebSocket: globalThis.WebSocket,
};

export default JSONRPCClient;
