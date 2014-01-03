aria2.js
========

JavaScript library for [aria2 "The next generation download utility."](http://aria2.sourceforge.net/)

[![Build Status](https://travis-ci.org/sonnyp/aria2.js.png?branch=master)](https://travis-ci.org/sonnyp/aria2.js)
[![Dependency Status](https://david-dm.org/sonnyp/aria2.js.png)](https://david-dm.org/sonnyp/aria2.js)
[![devDependency Status](https://david-dm.org/sonnyp/aria2.js/dev-status.png)](https://david-dm.org/sonnyp/aria2.js#info=devDependencies)

## Use
```xml
<script src="../lib/index.js"></script>
```
```javascript
var aria2 = new Aria2();

aria2.open('ws://127.0.0.1:6800/jsonrpc')

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
  console.log('message out:')
  console.log(m);
};
aria2.onmessage = function(m) {
  console.log('message in:');
  console.log(m);
};

//aria2 notification
aria2.onDownloadStart = function(e) {
  console.log(e);
};
```

## Methods
See [aria2 methods](http://aria2.sourceforge.net/manual/en/html/aria2c.html#methods)

## Notifications
See [aria2 notifications](http://aria2.sourceforge.net/manual/en/html/aria2c.html#json-rpc-over-websocket)
