"use strict";

const test = require("ava");
const JSONRPCClient = require("../lib/JSONRPCClient");

test("#id", t => {
  const client = new JSONRPCClient();
  t.is(client.lastId, 0);
  t.is(client.id(), 0);
  t.is(client.lastId, 1);
});

test("#url", t => {
  const client = new JSONRPCClient();
  t.is(
    client.url.call(
      {
        secure: true,
        host: "foobar",
        port: 1234,
        path: "/foobar"
      },
      "foo"
    ),
    "foos://foobar:1234/foobar"
  );
});

test("#websocket", async t => {
  t.plan(1);
  const client = new JSONRPCClient();

  const message = { hello: "world" };

  client.socket = {
    send(str, cb) {
      t.is(str, JSON.stringify(message));
      cb();
    }
  };

  await client.websocket(message);
});

test("#websocket error", async t => {
  t.plan(2);
  const client = new JSONRPCClient();

  const message = { hello: "world" };
  const error = new Error();

  client.socket = {
    send(str, cb) {
      t.is(str, JSON.stringify(message));
      cb(error);
    }
  };

  try {
    await client.websocket(message);
  } catch (err) {
    t.is(err, error);
  }
});

test("#http", async t => {
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
        "Content-Type": "application/json"
      }
    });
    return Promise.resolve({
      json() {
        return Promise.resolve(response);
      }
    });
  };

  client._onmessage = m => {
    t.is(m, response);
  };

  await client.http(request);
});

test("#_buildMessage", t => {
  const client = new JSONRPCClient();
  t.throws(
    () => {
      client._buildMessage();
    },
    TypeError,
    "undefined is not a string"
  );

  t.deepEqual(client._buildMessage("foobar"), {
    method: "foobar",
    ["json-rpc"]: "2.0",
    id: 0
  });

  t.deepEqual(client._buildMessage("method", []), {
    method: "method",
    params: [],
    ["json-rpc"]: "2.0",
    id: 1
  });

  t.deepEqual(client._buildMessage("method", {}), {
    method: "method",
    params: {},
    ["json-rpc"]: "2.0",
    id: 2
  });
});

test("#batch", async t => {
  const client = new JSONRPCClient();

  client._send = async message => {
    t.deepEqual(message, [
      { method: "foo", params: [], "json-rpc": "2.0", id: 0 },
      { method: "bar", params: {}, "json-rpc": "2.0", id: 1 }
    ]);
  };

  const batch = await client.batch([["foo", []], ["bar", {}]]);

  client._onresponse({ id: 0 });
  client._onresponse({ id: 1 });

  return Promise.all(batch);
});

test("#call", async t => {
  const client = new JSONRPCClient();

  const params = {};
  const method = "foo";

  client._send = async message => {
    t.deepEqual(message, {
      method,
      params,
      "json-rpc": "2.0",
      id: 0
    });
  };

  const promise = client.call("foo", params);

  Promise.resolve().then(async () => {
    await Promise.resolve();
    client._onresponse({ id: 0 });
  });

  return promise;
});

test("#send", async t => {
  t.plan(1);
  const client = new JSONRPCClient();

  const message = {};

  client.on("output", m => {
    t.is(m, message);
  });

  client._send(message);
});
