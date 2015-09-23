aria2.js
========

JavaScript (Node.js and browsers) library for [aria2, "The next generation download utility."](http://aria2.sourceforge.net/)

[![Build Status](https://img.shields.io/travis/sonnyp/aria2.js/master.svg?style=flat-square)](https://travis-ci.org/sonnyp/aria2.js/branches)
[![Code quality](https://img.shields.io/codeclimate/github/kabisaict/flow.svg?style=flat-square)](https://codeclimate.com/github/sonnyp/aria2.js)

[![Dependency Status](https://img.shields.io/david/sonnyp/aria2.js.svg?style=flat-square)](https://david-dm.org/sonnyp/aria2.js)
[![devDependency Status](https://img.shields.io/david/dev/sonnyp/aria2.js.svg?style=flat-square)](https://david-dm.org/sonnyp/aria2.js#info=devDependencies)

aria2.js controls aria2 via its [JSON-RPC interface](http://aria2.sourceforge.net/manual/en/html/aria2c.html#rpc-interface) and supports WebSocket, HTTP and JSONP transports.

- [Getting started](#getting-started)
- [Usage](#usage)
  - [open](#open)
  - [close](#close)
  - [onsend and onmessage](#onsend-and-onmessage)
  - [aria2 methods](#aria2-methods)
    - [addUri](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.addUri)
    - [addTorrent](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.addTorrent)
    - [addMetaLink](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.addMetalink)
    - [remove](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.remove)
    - [forceRemove](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.forceRemove)
    - [pause](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.pause)
    - [pauseAll](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.pauseAll)
    - [forcePause](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.forcePause)
    - [forcePauseAll](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.forcePauseAll)
    - [unpause](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.unpause)
    - [unpauseAll](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.unpauseAll)
    - [tellStatus](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.tellStatus)
    - [getUris](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getUris)
    - [getFiles](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getFiles)
    - [getPeers](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getPeers)
    - [getServers](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getServers)
    - [tellActive](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.tellActive)
    - [tellWaiting](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.tellWaiting)
    - [tellStopped](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.tellStopped)
    - [changePosition](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.changePosition)
    - [changeUri](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.changeUri)
    - [getOption](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getOption)
    - [changeOption](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.changeOption)
    - [getGlobalOption](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getGlobalOption)
    - [changeGlobalOption](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.changeGlobalOption)
    - [getGlobalStat](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getGlobalStat)
    - [purgeDownloadResult](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.purgeDownloadResult)
    - [removeDownloadResult](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.removeDownloadResult)
    - [getVersion](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getVersion)
    - [getSessionInfo](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.getSessionInfo)
    - [shutdown](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.shutdown)
    - [forceShutdown](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.forceShutdown)
    - [saveSession](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.saveSession)
  - [aria2 events](#aria2-events)
    - [onDownloadStart](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadStart)
    - [onDownloadPause](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadPause)
    - [onDownloadStop](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadStop)
    - [onDownloadComplete](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadComplete)
    - [onDownloadError](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onDownloadError)
    - [onBtDownloadComplete](http://aria2.sourceforge.net/manual/en/html/aria2c.html#aria2.onBtDownloadComplete)
- [Example](#example)
- [Contributing](#contributing)



# Getting started


```npm install aria2```

----

```javascript
var Aria2 = require('aria2');
```

or

```xml
<script src="node_modules/aria2/lib/index.js"></script>
```
```javascript
var Aria2 = window.Aria2
```

[↑](#aria2js)

# Usage

```javascript
var aria2 = new Aria2([options]);
```

default options are

```javascript
{
  host: 'localhost',
  port: 6800,
  secure: false,
  secret: ''
}
```

Secret is optional and refers to [--rpc-secret](http://aria2.sourceforge.net/manual/en/html/aria2c.html#cmdoption--rpc-secret).

[↑](#aria2js)

## open

```aria2.open()``` opens the WebSocket connection.

```javascript
aria2.onopen = function() {
  console.log('aria2 open');
};
aria2.open();
```

[↑](#aria2js)

## close

```aria2.close()``` closes the WebSocket connection.

```javascript
aria2.onclose = function() {
  console.log('aria2 closed!');
};
aria2.close();
```

[↑](#aria2js)

## onsend and onmessage

```aria2.onsend()``` is called everytime a message is being sent
```aria2.onmessage()``` is called everytime a message has been received.

```javascript
aria2.onsend = function(m) {
  console.log('aria2 OUT', m);
};
aria2.onmessage = function(m) {
  console.log('aria2 IN', m);
};
```

[↑](#aria2js)

## aria2 methods
For a complete listing see [aria2 methods](http://aria2.sourceforge.net/manual/en/html/aria2c.html#methods).

Note that if you have passed the secret option to aria2.js, it will be automatically added it to every request so there is no need to include it.

When sending a request to aria2, if the WebSocket is closed, aria2.js will use the HTTP transport.

For every aria2 methods you can use

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

[↑](#aria2js)

## aria2 events
For a complete listing see [aria2 notifications](http://aria2.sourceforge.net/manual/en/html/aria2c.html#json-rpc-over-websocket).

For every notifications you can bind a function.

```javascript
aria2.onDownloadStart = function(gid) {
  console.log(gid);
};
```

[↑](#aria2js)

# Example

See [example.js](https://github.com/sonnyp/aria2.js/blob/master/example/example.js)

[↑](#aria2js)

# Tests

```
npm install -g eslint mocha babel
npm test
```

[↑](#aria2js)

# Contributing

See [CONTRIBUTING.md](https://github.com/sonnyp/aria2.js/blob/master/CONTRIBUTING.md)

[↑](#aria2js)
