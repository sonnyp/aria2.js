aria2.js
========

JavaScript library for [aria2, "The next generation download utility."](http://aria2.sourceforge.net/)

[![NPM version](https://badge.fury.io/js/aria2.png)](https://npmjs.org/package/aria2)
[![Build Status](https://travis-ci.org/sonnyp/aria2.js.png?branch=master)](https://travis-ci.org/sonnyp/aria2.js)

[![Dependency Status](https://david-dm.org/sonnyp/aria2.js.png)](https://david-dm.org/sonnyp/aria2.js)
[![devDependency Status](https://david-dm.org/sonnyp/aria2.js/dev-status.png)](https://david-dm.org/sonnyp/aria2.js#info=devDependencies)

## Use

### Install
```
npm install aria2
```

### Browsers
```xml
<script src="aria2.js/lib/index.js"></script>
```

### Node.js
```
var aria2 = require('aria2');
```

### Example

```javascript
var aria2 = new Aria2();
aria2.onopen = function() {
  console.log('OPEN');

  //aria2 method
  aria2.getVersion(function(err, res) {
    console.log(err || res);
  });
};
aria2.onclose = function() {
  console.log('close');
};
aria2.onsend = function(m) {
  console.log('message out:', m);
};
aria2.onmessage = function(m) {
  console.log('message in:', m);
};

//aria2 notification
aria2.onDownloadStart = function(e) {
  console.log(e);
};
aria2.open();
```

## Init
Aria2 constructor can take a option object to specify aria2 location.
Here is an example with default values:
```javascript
var aria2 = new Aria2({
  host: 'localhost',
  port: 6800,
  secure: false
});
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
See [aria2 methods](http://aria2.sourceforge.net/manual/en/html/aria2c.html#methods)

For every method you can use
```javascript
aria2.send(method, [params,] function(err, res) {
  console.log(err || res);
});
```
or directly
```javascript
aria2.method([params,] function(err, res) {
  console.log(err || res);
});
```

## Notifications
See [aria2 notifications](http://aria2.sourceforge.net/manual/en/html/aria2c.html#json-rpc-over-websocket)

For every notifications you can attach a function to call.
```javascript
aria2.onDownloadStart = function(event) {
  console.log(event);
};
```

