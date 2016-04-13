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

  aria2.getVersion().then(
    function (res) {
      console.log('result', res)
    },
    function (err) {
      console.log('error', err)
    }
  )

  // OR

  aria2.send('getVersion').then(
    function (res) {
      console.log('result', res)
    },
    function (err) {
      console.log('error', err)
    }
  )
}())
