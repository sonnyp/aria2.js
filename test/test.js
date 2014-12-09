(function(global) {

  'use strict';

  /* global suite, test, setup */

  var assert;
  var Aria2;

  if (typeof module !== 'undefined' && module.exports) {
    Aria2 = require('..');
    assert = require('assert');
  }
  else {
    Aria2 = global.Aria2;
    assert = function assert(expr, msg) {
      if (!expr) throw new Error(msg || 'failed');
    };
  }

  var Plan = function(count, done) {
    this.done = done;
    this.count = count;
  };

  Plan.prototype.ok = function(expression) {
    assert(expression);

    if (this.count === 0) {
      assert(false, 'Too many assertions called');
    } else {
      this.count--;
    }

    if (this.count === 0) {
      this.done();
    }
  };

  suite('Instance', function(){

    var client;
    setup(function(){
      client = new Aria2();
    });

    test('default options', function() {
      for (var i in Aria2.options) {
        assert(client[i] === Aria2.options[i]);
      }
    });

    test('custom options', function() {
      var options = {
        'host': 'foo',
        'port': 1234,
        'secure': true,
        'secret': 'bar',
      };
      client = new Aria2(options);
      for (var i in options) {
        assert(client[i] === options[i]);
      }
    });

    test('for each Aria2 methods, there is a instance method', function(done) {
      var plan = new Plan(Aria2.methods.length, done);
      Aria2.methods.forEach(function(method) {
        assert(typeof client[method] === 'function');
        client.send = function(m, arg) {
          assert(m === method);
          assert(arg === 'foo');
          plan.ok(true);
        };
        client[method]('foo');
      });
    });

    test('for each Aria2 notifications, there is a instance method', function() {
      Aria2.notifications.forEach(function(notification) {
        assert(typeof client[notification] === 'function');
      });
    });

    test('receiving notifications', function(done) {
      var plan = new Plan(Aria2.notifications.length, done);
      Aria2.notifications.forEach(function(notification) {
        client[notification] = function() {
          plan.ok(arguments[0] === 'foo');
        };
        client._onmessage({method: 'aria2.' + notification, params: ['foo']});
      });
    });

    test('for each Aria2 events, there is a instance method', function() {
      Aria2.events.forEach(function(event) {
        assert(typeof client[event] === 'function');
      });
    });

  });

})(this);
