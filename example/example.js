(function(global) {

  'use strict';

  var Aria2;

  if (typeof module !== 'undefined' && module.exports)
    Aria2 = require('..');
  else
    Aria2 = global.Aria2;

  var aria2 = new Aria2({host: 'localhost', port: 6800, secure: false});
  aria2.open();
  aria2.onopen = function() {
    console.log('OPEN');
    aria2.getVersion(function(err, res) {
      console.log(err || res);
    });
  };
  aria2.onclose = function() {
    console.log('close');
  };
  aria2.onsend = function(m) {
    console.log('out:', m);
  };
  aria2.onmessage = function(m) {
    console.log('in:', m);
  };
  aria2.req('getVersion', function(err, res) {
    console.log(err || res);
  });

})(this);