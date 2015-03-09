(function(global) {

  'use strict';

  /*global beforeEach, describe, it */

  var Aria2;
  var sinon;
  var chai;
  var expect;
  var sinonChai;

  if (typeof module !== 'undefined' && module.exports) {
    Aria2 = require('..');
    sinon = require('sinon');
    chai = require('chai');
    sinonChai = require('sinon-chai');
    chai.use(sinonChai);
  }
  else {
    Aria2 = global.Aria2;
    sinon = global.sinon;
    chai = global.chai;
    sinonChai = global.sinonChai;
  }

  expect = chai.expect;

  describe('Aria2', function() {

    var client;

    beforeEach(function() {
      client = new Aria2();
    });

    it('should have a lastId number property', function() {
      expect(client.lastId).to.be.a('number');
      expect(client.lastId).to.equal(0);
    });

    it('should have a callback hash property', function() {
      expect(client.callbacks).to.be.a('object');
    });

    it('should have default options properties', function() {
      for (var i in Aria2.options) {
        expect(client[i]).to.equal(Aria2.options[i]);
      }
    });

    it('should have a function property for each events', function() {
      Aria2.events.forEach(function(event) {
        expect(client[event]).to.be.a('function');
      });
    });

    it('should have a function property for each methods', function() {
      Aria2.methods.forEach(function(method) {
        expect(client[method]).to.be.a('function');
      });
    });

    it('should have a function property for each notifications', function() {
      Aria2.notifications.forEach(function(notification) {
        expect(client[notification]).to.be.a('function');
      });
    });

    describe('send', function() {

      it('should call onsend once with one argument', function() {
        var spy = sinon.spy(client, 'onsend');
        client.send('barfoo');
        expect(spy).to.have.been.calledOnce;
        expect(spy.args[0].length).to.equal(1);
      });

      it('should add lastId to the computed message and increment it', function() {
        var spy = sinon.spy(client, 'onsend');
        var lastId = client.lastId;
        client.send('barfoo');
        expect(spy.args[0][0]).to.have.deep.property('id', lastId)
        expect(client.lastId).to.equal(lastId + 1);
      });

      it('should prefix the method with "aria2."', function() {
        var spy = sinon.spy(client, 'onsend');
        client.send('foobar');
        expect(spy.args[0][0].method).to.equal('aria2.foobar');
      });

      it('should add json-rpc property to the computed message', function() {
        var spy = sinon.spy(client, 'onsend');
        client.send('foobar');
        expect(spy.args[0][0]['json-rpc']).to.equal('2.0');
      });

      it('should compute arguments > 1 into an array and assign it to the params property', function() {
        var spy = sinon.spy(client, 'onsend');
        client.send('foobar', 'far', 'boo');
        expect(spy.args[0][0].params).to.be.an('array');
        expect(spy.args[0][0].params).to.deep.equal(['far', 'boo']);
      });

      it('should add the secret token to params if defined', function() {
        var spy = sinon.spy(client, 'onsend');
        client.secret = 'oo';
        client.send('foobar', 'far', 'boo');
        expect(spy.args[0][0].params[0]).to.equal('token:oo');
      });

    });

    describe('notfications', function() {

      it('should call the notification function once with correct arguments when receiving a notification', function() {
        Aria2.notifications.forEach(function(notification) {
          var spy = sinon.spy(client, notification);
          var message = {'method': 'aria2.' + notification, params: ['foo', 'bar']};
          client._onmessage(message);

          expect(spy).to.have.been.calledOnce;
          expect(spy).to.have.been.calledWith('foo', 'bar');
        });
      });

    });

    describe('methods', function() {

      it('should call send once with correct arguments for each methods function', function() {
        var spy = sinon.spy(client, 'send');
        Aria2.methods.forEach(function(method) {
          client[method]('foo', 'bar');
          expect(spy).to.have.been.calledWith(method, 'foo', 'bar');
        });
      });

    });

  });

})(this);
