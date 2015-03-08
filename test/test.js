(function(global) {

  'use strict';

  /* global beforeEach, describe, it */

  var assert;
  var Aria2;
  var sinon;

  if (typeof module !== 'undefined' && module.exports) {
    Aria2 = require('..');
    assert = require('assert');
    sinon = require('sinon');
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

  describe('aria2.js', function(){

    var client;

    beforeEach(function(){
      client = new Aria2();
    })

    it('has a function for each methods', function(done) {
      var plan = new Plan(Aria2.methods.length, done);
      Aria2.methods.forEach(function(method) {
        var spy = sinon.spy(client, 'send');
        // console.log(spy)
        // assert(typeof client[method] === 'function');
        // client.send = function(m, arg) {
        //   assert(m === method);
        //   assert(arg === 'foo');
        //   plan.ok(true);
        // };
        client[method]('foo');
        assert(spy.withArgs(method, 'foo'));
      });
    });

  });

})(this);
