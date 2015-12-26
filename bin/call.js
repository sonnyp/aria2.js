'use strict'

var Aria2 = require('..')

module.exports = function (cli, options, method, params) {
  var debug = require('./debug')(cli)

  var client = new Aria2(options)
  client.onsend = function (m) {
    debug('OUT', m)
  }
  client.onmessage = function (m) {
    debug('IN', m)
  }
  debug('CONNECTING')
  client.open(function (err) {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    debug('CONNECTED')

    var cb = function (err, res) {
      debug('CLOSING')
      client.close(function () {
        debug('CLOSED')
        if (err) {
          console.error(err)
          process.exit(1)
        }

        console.log(res)
        process.exit(0)
      })
    }

    var args = [method].concat(params, cb)

    client.send.apply(client, args)
  })
}
