"use strict";

const Aria2 = require("..");

module.exports = async function(cli, options, method, params) {
  const debug = require("./debug")(cli);

  const client = new Aria2(options);
  client.onsend = function(m) {
    debug("OUT", m);
  };
  client.onmessage = function(m) {
    debug("IN", m);
  };

  try {
    const res = await client.call(method, ...params);
    console.log(res);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
