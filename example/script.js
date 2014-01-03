(function() {

  'use strict';

  var DEBUG = function(a) {
    console.log(a);
  };

  var Aria2;

  if (typeof require !== 'undefined' && typeof module !== 'undefined' && 'exports' in module)
    Aria2 = require('../lib');
  else if (typeof window !== undefined)
    Aria2 = window.Aria2;

  var aria2 = new Aria2();
  aria2.open('ws://127.0.0.1:6800/jsonrpc');
  aria2.onopen = function() {
    DEBUG('OPEN');
    aria2.getVersion(function(err, res) {
      console.log(err || res);
    });
  };
  aria2.onclose = function() {
    DEBUG('close');
  };
  aria2.onsend = function(m) {
    DEBUG('out:');
    DEBUG(m);
  };
  aria2.onmessage = function(m) {
    DEBUG('in:');
    DEBUG(m);
  };

  if (typeof window !== 'undefined')
    window.aria2 = aria2;

})();