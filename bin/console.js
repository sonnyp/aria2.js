"use strict";

var readline = require("readline");
var Aria2 = require("..");

module.exports = function(cli, options) {
  var debug = require("./debug")(cli);

  var client = new Aria2(options);
  client.onsend = function(m) {
    debug("OUT", m);
  };
  client.onmessage = function(m) {
    debug("IN", m);
    if (m.id === undefined) {
      console.log(m);
    }
  };
  debug("CONNECTING");
  client.open(function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    debug("CONNECTED");

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.setPrompt("aria2rpc ≻ ");
    rl.prompt();
    rl.on("line", function(line) {
      line = line.trim();
      if (!line) return rl.prompt();
      var params = line.split(" ");
      var cb = function(err, res) {
        if (err) console.error(err);
        else console.log(res);
        rl.prompt();
      };

      var args = params.concat(cb);

      client.send.apply(client, args);
    });
    rl.on("close", function() {
      debug("CLOSING");
      client.close(function() {
        debug("CLOSED");
        process.exit(0);
      });
    });
  });
};
