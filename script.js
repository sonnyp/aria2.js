(function() {

  'use strict';

  var DEBUG = function(a) {
    console.log(a);
  };


  var aria2 = new Aria2();
  aria2.open('ws://127.0.0.1:6800/jsonrpc')
  aria2.onopen = function() {
    DEBUG('OPEN');
    aria2.getVersion(function(err, res) {
      // console.log(err || res);
    });
  };
  aria2.onclose = function() {
    DEBUG('close');
  };
  aria2.onsend = function(m) {
    DEBUG('out:')
    DEBUG(m);
  };
  aria2.onmessage = function(m) {
    DEBUG('in:');
    DEBUG(m);
  };

  window.aria2 = aria2;

})();