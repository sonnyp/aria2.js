#!/usr/bin/env node

"use strict";

const url = require("url");
const cli = require("commander");

process.title = "aria2rpc";

const makeOptions = function() {
  const options = { secret: cli.secret };
  if (cli.url) {
    const parsed = url.parse(cli.url);
    options.secure = parsed.protocol === "wss:";
    options.host = parsed.hostname;
    options.port = parsed.port;
    options.path = parsed.path;
  }
  return options;
};

cli
  .version(require("../package.json").version)
  .option("-d, --debug", "output debug information")
  .option(
    "-u, --url [url]",
    "websocket url to connect to",
    "ws://localhost:6800/jsonrpc"
  )
  .option("-s, --secret [secret]", "aria2 secret to use");

// call
cli
  .command("call <method> [params]")
  .description(
    "call an aria2 RPC method with params provided as a JSON array and print result"
  )
  .action((method, params) => {
    params = params ? JSON.parse(params) : [];
    const options = makeOptions();
    require("./call")(cli, options, method, params);
  });

// console
cli
  .command("console")
  .description("start interactive console")
  .action(() => {
    const options = makeOptions();
    require("./console")(cli, options);
  });

cli.parse(process.argv);
