aria2rpc
========

Use and control [aria2](https://aria2.github.io) RPC from the command line.

## Install

`npm install -g aria2`

Install aria2 and start it in daemon mode with

`aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all`

Check `aria2rpc -h` and https://aria2.github.io/manual/en/html/aria2c.html#methods for more information.

## call

Uses HTTP transport.

![](./call.gif)

## console

Uses Websocket transport.

![](./console.gif)
