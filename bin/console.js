"use strict";

const readline = require("readline");
const Aria2 = require("..");

module.exports = async function(cli, options) {
  const debug = require("./debug")(cli);

  const client = new Aria2(options);
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

  try {
    await client.open();
  } catch (err) {
    console.error(err);
    process.exit(1);
    return;
  }

  debug("CONNECTED");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.setPrompt("aria2rpc ≻ ");
  rl.prompt();
  rl.on("line", async function(line) {
    line = line.trim();
    if (!line) return rl.prompt();
    const [method, args] = line.split(" ");
    const params = args ? JSON.parse(args) : [];

    try {
      const res = await client.call(method, ...params);
      console.log(res);
    } catch (err) {
      console.error(err);
    }
    rl.prompt();
  });
  rl.on("close", function() {
    debug("CLOSING");
    client.close(function() {
      debug("CLOSED");
      process.exit(0);
    });
  });
};
