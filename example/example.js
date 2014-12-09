(function(global) {

  'use strict';

  var Aria2;

  //Node.js
  if (typeof module !== 'undefined' && module.exports)
    Aria2 = require('..');
  //browsers
  else
    Aria2 = global.Aria2;

  //those are default options
  var options = {host: 'localhost', port: 6800, secure: false};
  var aria2 = new Aria2(options);

  //socket is not open yet so it will use HTTP interface
  aria2.send('getVersion', function(err, res) {
    console.log('version: ', err || res);

    //open socket
    aria2.open();
  });

  //triggered when socket is open
  aria2.onopen = function() {
    console.log('OPEN');

    aria2.getGlobalOption(function(err, res) {
      console.log('global options: ', err || res);

      aria2.send('addUri', ['http://example.org/file', 'http://mirror/file'], {dir: '/tmp'}, function(err, gid) {
        console.log(err || 'gid: ' + gid);

        //close socket
        aria2.close();
      });
    });

  };

  //triggered when socket is closed
  aria2.onclose = function() {
    console.log('CLOSED');
  };

  //triggered when a message is being sent
  aria2.onsend = function(m) {
    console.log('OUT:', m);
  };

  //triggered when a message has been received
  aria2.onmessage = function(m) {
    console.log('IN:', m);
  };

})(this);
