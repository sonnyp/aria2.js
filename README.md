aria2.js
========

JavaScript (Node.js, io.js and browsers) library for [aria2, "The next generation download utility."](http://aria2.sourceforge.net/)

[![Build Status](https://img.shields.io/travis/sonnyp/aria2.js/master.svg?style=flat-square)](https://travis-ci.org/sonnyp/aria2.js)
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
  - [aria2 events](#aria2-events)
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
