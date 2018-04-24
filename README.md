# aria2.js

JavaScript (Node.js and browsers) library and [cli](https://github.com/sonnyp/aria2.js/blob/master/bin/README.md) for [aria2, "The next generation download utility."](https://aria2.github.io/)

[![license](https://img.shields.io/github/license/sonnyp/aria2.js.svg?maxAge=2592000&style=flat-square)](https://raw.githubusercontent.com/sonnyp/aria2.js/master/LICENSE.md)

[![Build Status](https://img.shields.io/travis/sonnyp/aria2.js/master.svg?style=flat-square)](https://travis-ci.org/sonnyp/aria2.js/branches)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

[![Dependency Status](https://img.shields.io/david/sonnyp/aria2.js.svg?style=flat-square)](https://david-dm.org/sonnyp/aria2.js)
[![devDependency Status](https://img.shields.io/david/dev/sonnyp/aria2.js.svg?style=flat-square)](https://david-dm.org/sonnyp/aria2.js?type=dev)

* [Introduction](#introduction)
* [Getting started](#getting-started)
* [Usage](#usage)
  * [open](#open)
  * [close](#close)
  * [onsend and onmessage](#onsend-and-onmessage)
  * [aria2 methods](#aria2-methods)
    * [addUri](https://aria2.github.io/manual/en/html/aria2c.html#aria2.addUri)
    * [addTorrent](https://aria2.github.io/manual/en/html/aria2c.html#aria2.addTorrent)
    * [addMetaLink](https://aria2.github.io/manual/en/html/aria2c.html#aria2.addMetalink)
    * [remove](https://aria2.github.io/manual/en/html/aria2c.html#aria2.remove)
    * [forceRemove](https://aria2.github.io/manual/en/html/aria2c.html#aria2.forceRemove)
    * [pause](https://aria2.github.io/manual/en/html/aria2c.html#aria2.pause)
    * [pauseAll](https://aria2.github.io/manual/en/html/aria2c.html#aria2.pauseAll)
    * [forcePause](https://aria2.github.io/manual/en/html/aria2c.html#aria2.forcePause)
    * [forcePauseAll](https://aria2.github.io/manual/en/html/aria2c.html#aria2.forcePauseAll)
    * [unpause](https://aria2.github.io/manual/en/html/aria2c.html#aria2.unpause)
    * [unpauseAll](https://aria2.github.io/manual/en/html/aria2c.html#aria2.unpauseAll)
    * [tellStatus](https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellStatus)
    * [getUris](https://aria2.github.io/manual/en/html/aria2c.html#aria2.getUris)
    * [getFiles](https://aria2.github.io/manual/en/html/aria2c.html#aria2.getFiles)
    * [getPeers](https://aria2.github.io/manual/en/html/aria2c.html#aria2.getPeers)
    * [getServers](https://aria2.github.io/manual/en/html/aria2c.html#aria2.getServers)
    * [tellActive](https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellActive)
    * [tellWaiting](https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellWaiting)
    * [tellStopped](https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellStopped)
    * [changePosition](https://aria2.github.io/manual/en/html/aria2c.html#aria2.changePosition)
    * [changeUri](https://aria2.github.io/manual/en/html/aria2c.html#aria2.changeUri)
    * [getOption](https://aria2.github.io/manual/en/html/aria2c.html#aria2.getOption)
    * [changeOption](https://aria2.github.io/manual/en/html/aria2c.html#aria2.changeOption)
    * [getGlobalOption](https://aria2.github.io/manual/en/html/aria2c.html#aria2.getGlobalOption)
    * [changeGlobalOption](https://aria2.github.io/manual/en/html/aria2c.html#aria2.changeGlobalOption)
    * [getGlobalStat](https://aria2.github.io/manual/en/html/aria2c.html#aria2.getGlobalStat)
    * [purgeDownloadResult](https://aria2.github.io/manual/en/html/aria2c.html#aria2.purgeDownloadResult)
    * [removeDownloadResult](https://aria2.github.io/manual/en/html/aria2c.html#aria2.removeDownloadResult)
    * [getVersion](https://aria2.github.io/manual/en/html/aria2c.html#aria2.getVersion)
    * [getSessionInfo](https://aria2.github.io/manual/en/html/aria2c.html#aria2.getSessionInfo)
    * [shutdown](https://aria2.github.io/manual/en/html/aria2c.html#aria2.shutdown)
    * [forceShutdown](https://aria2.github.io/manual/en/html/aria2c.html#aria2.forceShutdown)
    * [saveSession](https://aria2.github.io/manual/en/html/aria2c.html#aria2.saveSession)
    * [system.multicall](https://aria2.github.io/manual/en/html/aria2c.html#system.multicall)
    * [system.listMethods](https://aria2.github.io/manual/en/html/aria2c.html#system.listMethods)
    * [system.listNotifications](https://aria2.github.io/manual/en/html/aria2c.html#system.listNotifications)
  * [aria2 events](#aria2-events)
    * [onDownloadStart](https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadStart)
    * [onDownloadPause](https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadPause)
    * [onDownloadStop](https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadStop)
    * [onDownloadComplete](https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadComplete)
    * [onDownloadError](https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadError)
    * [onBtDownloadComplete](https://aria2.github.io/manual/en/html/aria2c.html#aria2.onBtDownloadComplete)
* [Example](#example)
* [Contributing](#contributing)

# Introduction

aria2.js controls aria2 via its [JSON-RPC interface](https://aria2.github.io/manual/en/html/aria2c.html#rpc-interface) and features

* Node.js and browsers support
* multiple transports
  * [HTTP](https://aria2.github.io/manual/en/html/aria2c.html#rpc-interface)
  * [WebSocket](https://aria2.github.io/manual/en/html/aria2c.html#json-rpc-over-websocket)
  * ~~[JSONP](https://aria2.github.io/manual/en/html/aria2c.html#json-rpc-using-http-get)~~ [#25](https://github.com/sonnyp/aria2.js/pull/25)
* callback API
* promise API
* light (1.5KB minified and gzipped)

[↑](#aria2js)

# Getting started

`npm install aria2`

---

```javascript
var Aria2 = require("aria2");
```

or

```xml
<script src="node_modules/aria2/bundle.js"></script>
```

```javascript
var Aria2 = window.Aria2;
```

---

Start aria2c in daemon mode with

`aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all`

[↑](#aria2js)

# Usage

```javascript
var aria2 = new Aria2([options]);
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

`secret` is optional and refers to [--rpc-secret](https://aria2.github.io/manual/en/html/aria2c.html#cmdoption--rpc-secret).

If the WebSocket is open (via the [open method](#open)) aria2.js will use the WebSocket transport, otherwise the HTTP transport.

For HTTP, aria2.js makes use of the new fetch standard, you might need a [polyfill](https://github.com/github/fetch) if you want to support older browsers.

[↑](#aria2js)

## open

`aria2.open()` opens the WebSocket connection.

```javascript
aria2.onopen = function() {
  console.log("aria2 open");
};

aria2.open([cb]);
// or
aria2.open().then(fn);
```

[↑](#aria2js)

## close

`aria2.close()` closes the WebSocket connection.

```javascript
aria2.onclose = function() {
  console.log("aria2 closed!");
};

aria2.close([cb]); // callback style
// or
aria2.close().then(fn); // promise style
```

[↑](#aria2js)

## onsend and onmessage

`aria2.onsend()` is called for every message sent.
`aria2.onmessage()` is called for every message received.

```javascript
aria2.onsend = function(m) {
  console.log("aria2 OUT", m);
};
aria2.onmessage = function(m) {
  console.log("aria2 IN", m);
};
```

[↑](#aria2js)

## aria2 methods

For a complete listing see [aria2 methods](https://aria2.github.io/manual/en/html/aria2c.html#methods).

If you passed the secret option to aria2.js, it will be automatically added to every request so there is no need to include it.

For every aria2 methods you can use

#### callback style

```javascript
aria2.getVersion([params,] function(err, res) {
  console.log(err || res);
});
```

or

```javascript
aria2.send('getVersion', [params,] function(err, res) {
  console.log(err || res);
});
```

#### promise style

```javascript
aria2.getVersion([params]).then(fn);
```

or

```javascript
aria2.send("getVersion", [params]).then(fn);
```

[↑](#aria2js)

## aria2 events

For a complete listing see [aria2 notifications](https://aria2.github.io/manual/en/html/aria2c.html#json-rpc-over-websocket).

For every notifications you can bind a function.

```javascript
aria2.onDownloadStart = function(gid) {
  console.log(gid);
};
```

[↑](#aria2js)

# Example

See [example](https://github.com/sonnyp/aria2.js/blob/master/example/).

[↑](#aria2js)

# Tests

```
npm install
npm test
```

[↑](#aria2js)
