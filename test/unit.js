(function (global) {
  'use strict'

  /* global describe, it, beforeEach */

  var Aria2
  var sinon
  var chai
  var expect
  var sinonChai

  if (typeof module !== 'undefined' && module.exports) {
    Aria2 = require('..')
    sinon = require('sinon')
    chai = require('chai')
    sinonChai = require('sinon-chai')
    chai.use(sinonChai)
  } else {
    Aria2 = global.Aria2
    sinon = global.sinon
    chai = global.chai
    sinonChai = global.sinonChai
  }

  expect = chai.expect

  describe('Aria2', function () {
    var client

    beforeEach(function () {
      client = new Aria2()
      client.http = sinon.stub()
    })

    it('should be an instance of Aria2', function () {
      expect(client).to.be.an.instanceOf(Aria2)
    })

    describe('instance properties', function () {
      it('should have a lastId number property', function () {
        expect(client.lastId).to.be.a('number')
        expect(client.lastId).to.equal(0)
      })

      it('should have a callback hash property', function () {
        expect(client.callbacks).to.be.a('object')
      })

      it('should have default options properties', function () {
        for (var i in Aria2.options) {
          expect(client[i]).to.equal(Aria2.options[i])
        }
      })

      it('should have a function property for each events', function () {
        Aria2.events.forEach(function (event) {
          expect(client[event]).to.be.a('function')
        })
      })

      it('should have a function property for each methods', function () {
        Aria2.methods.forEach(function (method) {
          var sufix = method.indexOf('system.') === 0 ? method.split('system.')[1] : method
          expect(client[sufix]).to.be.a('function')
        })
      })

      it('should have a function property for each notifications', function () {
        Aria2.notifications.forEach(function (notification) {
          expect(client[notification]).to.be.a('function')
        })
      })
    })

    describe('instance methods', function () {
      describe('send', function () {
        it('throws a TypeError if method is not a string', function () {
          expect(client.send.bind(client, null)).to.throw(TypeError)
        })

        it('should call onsend once with one argument', function () {
          var spy = sinon.spy(client, 'onsend')
          client.send('barfoo')
          expect(spy).to.have.been.calledOnce
          expect(spy.args[0].length).to.equal(1)
        })

        it('should add lastId to the computed message and increment it', function () {
          var spy = sinon.spy(client, 'onsend')
          var lastId = client.lastId
          client.send('barfoo')
          expect(spy.args[0][0]).to.have.deep.property('id', lastId)
          expect(client.lastId).to.equal(lastId + 1)
        })

        it('should prefix the method with "aria2."', function () {
          var spy = sinon.spy(client, 'onsend')
          client.send('foobar')
          expect(spy.args[0][0].method).to.equal('aria2.foobar')
        })

        it('shouldn\'t prefix the method with "aria2." if it starts with "system."', function () {
          var spy = sinon.spy(client, 'onsend')
          client.send('system.foobar')
          expect(spy.args[0][0].method).to.equal('system.foobar')
        })

        it('shouldn\'t prefix the method with "aria2." if it starts with "aria2."', function () {
          var spy = sinon.spy(client, 'onsend')
          client.send('aria2.foobar')
          expect(spy.args[0][0].method).to.equal('aria2.foobar')
        })

        it('should add json-rpc property to the computed message', function () {
          var spy = sinon.spy(client, 'onsend')
          client.send('foobar')
          expect(spy.args[0][0]['json-rpc']).to.equal('2.0')
        })

        it('should compute arguments > 1 into an array and assign it to the params property', function () {
          var spy = sinon.spy(client, 'onsend')
          client.send('foobar', 'far', 'boo')
          expect(spy.args[0][0].params).to.be.an('array')
          expect(spy.args[0][0].params).to.deep.equal(['far', 'boo'])
        })

        it('should add the secret token to params if defined', function () {
          var spy = sinon.spy(client, 'onsend')
          client.secret = 'oo'
          client.send('foobar', 'far', 'boo')
          expect(spy.args[0][0].params[0]).to.equal('token:oo')
        })

        it('should add the function argument to callbacks', function () {
          var spy = sinon.spy(client, 'onsend')
          client.secret = 'oo'
          var cb = function () {}
          client.send('foobar', 'foo', 'bar', cb)
          expect(spy.args[0][0].params).to.be.an('array')
          expect(spy.args[0][0].params).to.deep.equal(['token:oo', 'foo', 'bar'])
          var id = spy.args[0][0].id
          expect(client.callbacks[id]).to.be.a('function')
        })
      })

      describe('_onmessage', function () {
        it('should call the notification function once with correct arguments when receiving a notification', function () {
          Aria2.notifications.forEach(function (notification) {
            var spy = sinon.spy(client, notification)
            var message = {'method': 'aria2.' + notification, 'params': ['foo', 'bar']}
            client._onmessage(message)

            expect(spy).to.have.been.calledOnce
            expect(spy).to.have.been.calledWith('foo', 'bar')
          })
        })

        it('should call the callback of a request when receiving a response', function () {
          var spySend = sinon.spy(client, 'onsend')
          var callback = sinon.spy()
          client.send('foobar', callback)
          var id = spySend.args[0][0].id
          expect(client.callbacks[id]).to.be.a('function')
          var message = {'method': 'aria2.foobar', 'id': id}
          client._onmessage(message)

          expect(callback).to.have.been.calledOnce
        })

        it('should call and delete the callback of a request with error when receiving a response with error', function () {
          var spySend = sinon.spy(client, 'onsend')
          var callback = sinon.spy()
          client.send('foobar', callback)
          var id = spySend.args[0][0].id
          expect(client.callbacks[id]).to.be.a('function')
          var message = {'method': 'aria2.foobar', 'id': id, 'error': 'whatever'}
          client._onmessage(message)

          expect(callback).to.have.been.calledWith('whatever')
          expect(client.callbacks[id]).to.equal(undefined)
        })

        it('should call and delete the callback of a request with result when receiving a response with result', function () {
          var spySend = sinon.spy(client, 'onsend')
          var callback = sinon.spy()
          client.send('foobar', callback)
          var id = spySend.args[0][0].id
          expect(client.callbacks[id]).to.be.a('function')
          var message = {
            'id': id,
            'method': 'aria2.foobar',
            'result': 'foobar'
          }
          client._onmessage(message)

          expect(callback).to.have.been.calledWith(null, 'foobar')
          expect(client.callbacks[id]).to.equal(undefined)
        })
      })

      describe('aria2 methods', function () {
        it('should call send once with correct arguments for each methods function', function () {
          var spy = sinon.spy(client, 'send')
          var cb = function () {}
          Aria2.methods.forEach(function (method) {
            var sufix = method.indexOf('system.') === 0 ? method.split('system.')[1] : method
            client[sufix]('foo', 'bar', cb)
            expect(spy).to.have.been.calledWith(method, 'foo', 'bar', cb)
          })
        })
      })
    })
  })
}(this))
