aria2.js
========

JavaScript (Node.js and browsers) library for [aria2, "The next generation download utility."](http://aria2.sourceforge.net/)


[![Build Status](https://travis-ci.org/sonnyp/aria2.js.png?branch=master)](https://travis-ci.org/sonnyp/aria2.js)

[![Dependency Status](https://david-dm.org/sonnyp/aria2.js.png)](https://david-dm.org/sonnyp/aria2.js)
[![devDependency Status](https://david-dm.org/sonnyp/aria2.js/dev-status.png)](https://david-dm.org/sonnyp/aria2.js#info=devDependencies)

## Intro

aria2.js supports the WebSocket and HTTP transports.

### Browsers
```
bower install aria2
```
```xml
<script src="aria2.js/lib/index.js"></script>
```

### Node.js
```
npm install aria2
```
```
var aria2 = require('aria2');
```

## Open

aria2.open() will open the WebSocket connexion.
```javascript
aria2.onopen = function() {
  console.log('I\'m open!');
};
aria2.open();
```

## Close

aria2.close() will close the WebSocket connexion.
```javascript
aria2.onclose = function() {
  console.log('I\'m closed!');
};
aria2.close();
```

## Send and message events

onsend() is called everytime a message is being sent, onmessage() is called everytime a message has been received.
```javascript
aria2.onsend = function(m) {
  console.log('OUT', m);
};
aria2.onmessage = function(m) {
  console.log('IN', m);
};
```

## Methods
For a complete listing see [aria2 methods](http://aria2.sourceforge.net/manual/en/html/aria2c.html#methods).

When sending a request to aria2, if the WebSocket isn't available or closed, aria2.js will use the HTTP transport.

For every method you can use
```javascript
aria2.send('getVersion', [params,] function(err, res) {
  console.log(err || res);
});
```
or directly
```javascript
aria2.getVersion([params,] function(err, res) {
  console.log(err || res);
});
```

## Notifications
For a complete listing see [aria2 notifications](http://aria2.sourceforge.net/manual/en/html/aria2c.html#json-rpc-over-websocket).

For every notifications you can attach a function to call.
```javascript
aria2.onDownloadStart = function(event) {
  console.log(event);
};
```

## Example
See [example.js](https://github.com/sonnyp/aria2.js/blob/master/example/example.js)
