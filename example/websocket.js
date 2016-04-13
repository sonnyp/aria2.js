;(function () {
  'use strict'

  var Aria2

  // Node.js, browserify, ...
  if (typeof module !== 'undefined' && module.exports) {
    Aria2 = require('..')
  // browsers
  } else {
    Aria2 = window.Aria2
  }

  // those are default options
  var options = {'host': 'localhost', 'port': 6800, 'secure': false, jsonp: false}
  var aria2 = new Aria2(options)

  // triggered when a message is being sent
  aria2.onsend = function (m) {
    console.log('aria2 OUT:', m)
  }

  // triggered when a message has been received
  aria2.onmessage = function (m) {
    console.log('aria2 IN:', m)
  }

  // triggered when socket is open
  aria2.onopen = function () {
    console.log('aria2 OPEN')
  }

  // triggered when socket is closed
  aria2.onclose = function () {
    console.log('aria2 CLOSED')
  }

  aria2.onDownloadStart = function (gid) {
    console.log('downloadStart', gid)
  }

  // WebSocket is not open so HTTP transport will be used
  aria2.send('getVersion', function (err, res) {
    console.log('version: ', err || res)

    // open WebSocket
    aria2.open(function () {
      console.log('open')

      // WebSocket is open so WebSocket transport will be used
      aria2.getGlobalOption(function (err, res) {
        console.log('global options: ', err || res)

        aria2.send('addUri', ['http://example.org/file', 'http://mirror/file'], {'dir': '/tmp'}, function (err, gid) {
          console.log(err || 'gid: ' + gid)

          // close socket
          aria2.close(function () {
            console.log('closed')
          })
        })
      })
    })
  })
}())
