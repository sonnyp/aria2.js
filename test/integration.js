;(function (global) {
  'use strict'

  /* global suite, test, beforeEach */

  var Aria2
  var chai

  if (typeof module !== 'undefined' && module.exports) {
    Aria2 = require('..')
    chai = require('chai')
  } else {
    Aria2 = global.Aria2
    chai = global.chai
  }

  var assert = chai.assert

  suite('Aria2 with aria2c', function () {
    var client

    beforeEach(function () {
      client = new Aria2()
      // done()
      // client.open(function (err) {
        // done(err)
        // console.log('lol')
      // })
    })

    suite('success request', function () {
      test('calls the callback once with the received result as second argument', function (done) {
        var m
        client.onmessage = function (message) {
          m = message
        }
        client.send('getVersion', function (err, res) {
          assert.equal(err, null)
          assert.equal(res, m.result)
          done()
        })
      })
      test('returns and fulfils the promise with the received result', function (done) {
        var m
        client.onmessage = function (message) {
          m = message
        }
        var p = client.send('getVersion')
        p.then(
          function (res) {
            assert.equal(res, m.result)
            done()
          },
          function (err) {
            done(err)
          }
        )
        assert(p instanceof Promise)
      })
    })

    suite('error request', function () {
      test('calls the callback once with the received error as first argument', function (done) {
        var m
        client.onmessage = function (message) {
          m = message
        }
        client.send('foobar', function (err, res) {
          assert.equal(err, m.error)
          assert.equal(res, undefined)
          done()
        })
      })
      test('returns and rejects the promise with the received error', function (done) {
        var m
        client.onmessage = function (message) {
          m = message
        }
        var p = client.send('foobar')
        p.then(
          function (res) {
            done(res)
          },
          function (err) {
            assert.equal(err, m.error)
            done()
          }
        )
        assert(p instanceof Promise)
      })
    })
  })
}(this))
