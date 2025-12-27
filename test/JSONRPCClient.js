import { test, mock } from "node:test";

import promiseEvent from "../src/promiseEvent.js";
import JSONRPCClient from "../src/JSONRPCClient.js";

test("#id", (t) => {
  const client = new JSONRPCClient();
  t.assert.strictEqual(client.lastId, 0);
  t.assert.strictEqual(client.id(), 0);
  t.assert.strictEqual(client.lastId, 1);
});

test("#url", (t) => {
  const client = new JSONRPCClient();
  t.assert.strictEqual(
    client.url.call(
      {
        secure: true,
        host: "foobar",
        port: 1234,
        path: "/foobar",
      },
      "foo",
    ),
    "foos://foobar:1234/foobar",
  );
});

test("#websocket", async (t) => {
  t.plan(1);
  const client = new JSONRPCClient();

  const message = { hello: "world" };

  client.socket = {
    async send(str) {
      t.assert.strictEqual(str, JSON.stringify(message));
    },
  };

  await client.websocket(message);
});

test("#websocket error", async (t) => {
  t.plan(2);
  const client = new JSONRPCClient();

  const message = { hello: "world" };
  const error = new Error();

  client.socket = {
    send(str) {
      t.assert.strictEqual(str, JSON.stringify(message));
      throw error;
    },
  };

  try {
    await client.websocket(message);
  } catch (err) {
    t.assert.strictEqual(err, error);
  }
});

test("#websocket json error", async (t) => {
  const client = new JSONRPCClient();

  client.WebSocket = function () {
    return {};
  };
  client.open();
  client.socket.onopen();

  const promise_error = promiseEvent(client, "error");

  try {
    client.socket.onmessage({ data: "foo" });
  } catch {}

  const { error } = await promise_error;
  t.assert.ok(error instanceof SyntaxError);
  t.assert.strictEqual(
    error.message,
    `Unexpected token 'o', "foo" is not valid JSON`,
  );
});

test("#http", async (t) => {
  t.plan(3);
  const client = new JSONRPCClient();

  const request = { hello: "world" };
  const response = { world: "hello" };

  t.mock.method(globalThis, "fetch", (url, options) => {
    t.assert.strictEqual(url, "http://localhost:80/jsonrpc");
    t.assert.deepStrictEqual(options, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return Promise.resolve({
      json() {
        return Promise.resolve(response);
      },
    });
  });

  client._onmessage = (m) => {
    t.assert.strictEqual(m, response);
  };

  client.http(request);

  t.mock.reset();
});

test("#http fetch error", async (t) => {
  const client = new JSONRPCClient();

  const error = new Error("foo");

  t.mock.method(globalThis, "fetch", () => Promise.reject(error));

  let err;
  try {
    await client.http({});
  } catch (e) {
    err = e;
  }
  t.assert.strictEqual(err, error);

  t.mock.reset();
});

test("#http json error", async (t) => {
  t.plan(2);

  const client = new JSONRPCClient();

  let err;

  t.mock.method(globalThis, "fetch", () => {
    return Promise.resolve({
      json: mock.fn(async () => {
        try {
          JSON.parse("foo");
        } catch (error) {
          err = error;
          throw err;
        }
      }),
    });
  });

  client.addEventListener("error", ({ error }) => {
    t.assert.strictEqual(error.message, err.message);
  });

  try {
    await client.http({});
  } catch (error) {
    t.assert.strictEqual(error.message, err.message);
  }

  t.mock.reset();
});

test("#_buildMessage", (t) => {
  const client = new JSONRPCClient();

  t.assert.throws(() => {
    client._buildMessage();
  }, TypeError);

  t.assert.deepStrictEqual(client._buildMessage("foobar"), {
    method: "foobar",
    ["json-rpc"]: "2.0",
    id: 0,
  });

  t.assert.deepStrictEqual(client._buildMessage("method", []), {
    method: "method",
    params: [],
    ["json-rpc"]: "2.0",
    id: 1,
  });

  t.assert.deepStrictEqual(client._buildMessage("method", {}), {
    method: "method",
    params: {},
    ["json-rpc"]: "2.0",
    id: 2,
  });
});

test("#batch", async (t) => {
  t.plan(1);

  const client = new JSONRPCClient();

  client._send = async (message) => {
    t.assert.deepStrictEqual(message, [
      { method: "foo", params: [], "json-rpc": "2.0", id: 0 },
      { method: "bar", params: {}, "json-rpc": "2.0", id: 1 },
    ]);
  };

  const batch = await client.batch([
    ["foo", []],
    ["bar", {}],
  ]);

  client._onresponse({ id: 0 });
  client._onresponse({ id: 1 });

  return Promise.all(batch);
});

test("#call", async (t) => {
  t.plan(1);

  const client = new JSONRPCClient();

  const params = {};
  const method = "foo";

  client._send = async (message) => {
    t.assert.deepStrictEqual(message, {
      method,
      params,
      "json-rpc": "2.0",
      id: 0,
    });
  };

  const promise = client.call("foo", params);

  Promise.resolve().then(async () => {
    await Promise.resolve();
    client._onresponse({ id: 0 });
  });

  return promise;
});

test("#send", async (t) => {
  t.plan(1);
  const client = new JSONRPCClient();

  const message = {};

  client.addEventListener("output", ({ data: m }) => {
    t.assert.deepEqual(m, message);
  });

  t.mock.method(client, "http", () => {});

  client._send(message);
});

test("#_onnotification", (t) => {
  t.plan(2);
  const client = new JSONRPCClient();

  const method = "foo";
  const params = [1, 2, 3];

  client.addEventListener(
    "notification",
    ({ method: _method, params: _params }) => {
      t.assert.equal(method, _method);
      t.assert.equal(params, _params);
    },
  );

  client._onnotification({ method, params });
});
