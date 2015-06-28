aria2.js
========

JavaScript (Node.js, io.js and browsers) library for [aria2, "The next generation download utility."](http://aria2.sourceforge.net/)

[![Build Status](https://img.shields.io/travis/sonnyp/aria2.js/master.svg?style=flat-square)](https://travis-ci.org/sonnyp/aria2.js)
[![Code quality](https://img.shields.io/codeclimate/github/kabisaict/flow.svg?style=flat-square)](https://codeclimate.com/github/sonnyp/aria2.js)

[![Dependency Status](https://img.shields.io/david/sonnyp/aria2.js.svg?style=flat-square)](https://david-dm.org/sonnyp/aria2.js)
[![devDependency Status](https://img.shields.io/david/dev/sonnyp/aria2.js.svg?style=flat-square)](https://david-dm.org/sonnyp/aria2.js#info=devDependencies)

## Intro

aria2.js controls aria2 via its [JSON-RPC interface](http://aria2.sourceforge.net/manual/en/html/aria2c.html#rpc-interface) and supports WebSocket, HTTP and JSONP transports.

### Browser
```
bower install aria2
```
```xml
<script src="bower_components/aria2/dist/aria2.min.js"></script>
```

### Node.js and io.js
```
npm install aria2
```
```javascript
var Aria2 = require('aria2');
```

## Init
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

## Open

```aria2.open()``` will open the WebSocket connexion.
```javascript
aria2.onopen = function() {
  console.log('aria2 open');
};
aria2.open();
```

## Close

```aria2.close()``` will close the WebSocket connexion.
```javascript
aria2.onclose = function() {
  console.log('aria2 closed!');
};
aria2.close();
```

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

## Methods
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

## Notifications
For a complete listing see [aria2 notifications](http://aria2.sourceforge.net/manual/en/html/aria2c.html#json-rpc-over-websocket).

For every notifications you can bind a function.
```javascript
aria2.onDownloadStart = function(gid) {
  console.log(gid);
};
```

## Example
See [example.js](https://github.com/sonnyp/aria2.js/blob/master/example/example.js)
