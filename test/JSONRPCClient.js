import test from "ava";

import WebSocket from "ws";
import fetch from "node-fetch";

import JSONRPCClient from "../lib/JSONRPCClient.js";

JSONRPCClient.defaultOptions.WebSocket = WebSocket;
JSONRPCClient.defaultOptions.fetch = fetch;

test("#id", (t) => {
  const client = new JSONRPCClient();
  t.is(client.lastId, 0);
  t.is(client.id(), 0);
  t.is(client.lastId, 1);
});

test("#url", (t) => {
  const client = new JSONRPCClient();
  t.is(
    client.url.call(
      {
        secure: true,
        host: "foobar",
        port: 1234,
        path: "/foobar",
      },
      "foo"
    ),
    "foos://foobar:1234/foobar"
  );
});

test("#websocket", async (t) => {
  t.plan(1);
  const client = new JSONRPCClient();

  const message = { hello: "world" };

  client.socket = {
    send(str) {
      t.is(str, JSON.stringify(message));
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
      t.is(str, JSON.stringify(message));
      throw error;
    },
  };

  try {
    await client.websocket(message);
  } catch (err) {
    t.is(err, error);
  }
});

test.cb("#websocket json error", (t) => {
  const client = new JSONRPCClient();

  client.open();
  client.socket.onopen();

  client.onerror = (err) => {
    t.true(err instanceof SyntaxError);
    t.is(err.message, "Unexpected token o in JSON at position 1");
    t.end();
  };

  client.socket.onmessage({ data: "foo" });
});

test.cb("#http", (t) => {
  t.plan(3);
  const client = new JSONRPCClient();

  const request = { hello: "world" };
  const response = { world: "hello" };

  client.fetch = (url, options) => {
    t.is(url, "http://localhost:80/jsonrpc");
    t.deepEqual(options, {
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
  };

  client.oninput = (m) => {
    t.is(m, response);
    t.end();
  };

  client.http(request);
});

test("#http fetch error", async (t) => {
  const client = new JSONRPCClient();

  client.fetch = () => Promise.reject(new Error("foo"));

  await t.throwsAsync(
    async () => {
      await client.http({});
    },
    { message: "foo" }
  );
});

test("#http json error", async (t) => {
  const client = new JSONRPCClient();

  client.fetch = () => {
    return Promise.resolve({
      async json() {
        return JSON.parse("foo");
      },
    });
  };

  client.onerror = (err) => {
    t.true(err instanceof SyntaxError);
    t.is(err.message, "Unexpected token o in JSON at position 1");
  };

  await client.http({});
});

test("#_buildMessage", (t) => {
  const client = new JSONRPCClient();
  t.throws(
    () => {
      client._buildMessage();
    },
    { instanceOf: TypeError },
    "undefined is not a string"
  );

  t.deepEqual(client._buildMessage("foobar"), {
    method: "foobar",
    ["json-rpc"]: "2.0",
    id: 0,
  });

  t.deepEqual(client._buildMessage("method", []), {
    method: "method",
    params: [],
    ["json-rpc"]: "2.0",
    id: 1,
  });

  t.deepEqual(client._buildMessage("method", {}), {
    method: "method",
    params: {},
    ["json-rpc"]: "2.0",
    id: 2,
  });
});

test("#batch", async (t) => {
  const client = new JSONRPCClient();

  client._send = async (message) => {
    t.deepEqual(message, [
      { method: "foo", params: [], "json-rpc": "2.0", id: 0 },
      { method: "bar", params: {}, "json-rpc": "2.0", id: 1 },
    ]);
  };

  const batch = await client.batch([
    ["foo", []],
    ["bar", {}],
  ]);

  client._handleResponse({ id: 0 });
  client._handleResponse({ id: 1 });

  return Promise.all(batch);
});

test("#call", async (t) => {
  const client = new JSONRPCClient();

  const params = {};
  const method = "foo";

  client._send = async (message) => {
    t.deepEqual(message, {
      method,
      params,
      "json-rpc": "2.0",
      id: 0,
    });
  };

  const promise = client.call("foo", params);

  Promise.resolve().then(async () => {
    await Promise.resolve();
    client._handleResponse({ id: 0 });
  });

  return promise;
});

test("#send", async (t) => {
  t.plan(1);
  const client = new JSONRPCClient();

  const message = {};

  client.onoutput = (m) => {
    t.is(m, message);
  };

  client._send(message);
});
