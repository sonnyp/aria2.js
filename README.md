# aria2.js

JavaScript (Node.js and browsers) library for [aria2, "The next generation download utility."](https://aria2.github.io/)

- [aria2.js](#aria2js)
  - [Introduction](#introduction)
  - [Getting started](#getting-started)
  - [Usage](#usage)
    - [call](#call)
    - [multicall](#multicall)
    - [batch](#batch)
    - [open](#open)
    - [close](#close)
    - [listNotifications](#listnotifications)
    - [listMethods](#listmethods)
    - [events](#events)

## Introduction

aria2.js controls aria2 via its [JSON-RPC interface](https://aria2.github.io/manual/en/html/aria2c.html#rpc-interface) and features

- support for browsers, Node.js, React Native, deno and gjs environments
- support for [HTTP](https://aria2.github.io/manual/en/html/aria2c.html#rpc-interface) and [WebSocket](https://aria2.github.io/manual/en/html/aria2c.html#json-rpc-over-websocket) transports
- modern ECMAScript API

See [aria2 methods](https://aria2.github.io/manual/en/html/aria2c.html#methods) and [aria2 notifications](https://aria2.github.io/manual/en/html/aria2c.html#notifications) to get an idea of what aria2 and aria2.js are capable of.

[↑](#aria2js)

## Getting started

Start aria2 in daemon mode with rpc, example:

`aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all`

Install aria2.js

`npm install aria2`

[↑](#aria2js)

## Usage

```javascript
const Aria2 = require("aria2");
const aria2 = new Aria2([options]);
aria2.onerror = console.error;
aria2.onnotification = console.log;
```

default options match aria2c defaults and are

```javascript
{
  host: 'localhost',
  port: 6800,
  secure: false,
  secret: '',
  path: '/jsonrpc'
}
```

`secret` is optional and refers to [--rpc-secret](https://aria2.github.io/manual/en/html/aria2c.html#cmdoption--rpc-secret). If you define it, it will be added to every call for you.

If the WebSocket is open (via the [open method](#open)) aria2.js will use the WebSocket transport, otherwise the HTTP transport.

[↑](#aria2js)

### call

`aria2.call()` calls a method. Parameters are provided as arguments.

Example using [`addUri`](https://aria2.github.io/manual/en/html/aria2c.html#aria2.addUri) method to download from a magnet link.

```javascript
const magnet =
  "magnet:?xt=urn:btih:88594AAACBDE40EF3E2510C47374EC0AA396C08E&dn=bbb_sunflower_1080p_30fps_normal.mp4&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80%2fannounce&tr=udp%3a%2f%2ftracker.publicbt.com%3a80%2fannounce&ws=http%3a%2f%2fdistribution.bbb3d.renderfarming.net%2fvideo%2fmp4%2fbbb_sunflower_1080p_30fps_normal.mp4";
const guid = await aria2.call("addUri", [magnet], { dir: "/tmp" });
```

[↑](#aria2js)

### multicall

`aria2.multicall()` is a helper for [system.multicall](https://aria2.github.io/manual/en/html/aria2c.html#system.multicall). It returns an array of results or throw if any of the call failed.

```javascript
const multicall = [
  [methodA, param1, param2],
  [methodB, param1, param2],
];

const results = await aria2.multicall(multicall);
```

[↑](#aria2js)

### batch

`aria2.batch()` is a helper for [batch](https://aria2.github.io/manual/en/html/aria2c.html#system.multicall). It behaves the same as [multicall](#multicall) except it returns an array of promises which gives more flexibility in handling errors.

```javascript
const batch = [
  [methodA, param1, param2],
  [methodB, param1, param2],
];

const promises = await aria2.batch(batch);
```

[↑](#aria2js)

### open

`aria2.open()` opens the WebSocket connection. All subsequent requests will use the WebSocket transport instead of HTTP.

```javascript
aria2
  .open()
  .then(() => console.log("open"))
  .catch((err) => console.log("error", err));
```

[↑](#aria2js)

### close

`aria2.close()` closes the WebSocket connection. All subsequent requests will use the HTTP transport instead of WebSocket.

```javascript
aria2
  .close()
  .then(() => console.log("closed"))
  .catch((err) => console.log("error", err));
```

[↑](#aria2js)

### listNotifications

`aria2.listNotifications()` is a helper for [system.listNotifications](https://aria2.github.io/manual/en/html/aria2c.html#system.listNotifications). The difference with `aria2.call('listNotifications')` is that it removes the `"aria2."` prefix from the results.

```javascript
const notifications = await aria2.listNotifications();
/*
[
  'onDownloadStart',
  'onDownloadPause',
  'onDownloadStop',
  'onDownloadComplete',
  'onDownloadError',
  'onBtDownloadComplete'
]
*/
```

[↑](#aria2js)

### listMethods

`aria2.listMethods()` is a helper for [system.listMethods](https://aria2.github.io/manual/en/html/aria2c.html#system.listMethods). The difference with `aria2.call('listMethods')` is that it removes the `"aria2."` prefix from the results.

```javascript
const methods = await aria2.listMethods();
/*
[ 'addUri',
  [...]
  'system.listNotifications' ]

*/
```

[↑](#aria2js)

### events

```javascript
// called when an error occurs
aria2.onerror = (error) => {
  console.log("aria2", "ERROR");
  console.log(error);
};

// called when a notification is received on the WebSocket
aria2.onnotification = (name, params) => {
  console.log("aria2", "notification", name);
  console.log(params);
};

// called when the WebSocket is open.
aria2.onopen = () => {
  console.log("aria2", "OPEN");
};

// called when the WebSocket is closed.
aria2.onclose = () => {
  console.log("aria2", "CLOSE");
};

// called for every message received.
aria2.oninput = (message) => {
  console.log("aria2", "IN");
  console.log(message);
};

// called for every message sent.
aria2.onoutput = (message) => {
  console.log("aria2", "OUT");
  console.log(message);
};
```

[↑](#aria2js)
