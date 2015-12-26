aria2rpc
========

Use and control [aria2](aria2.sourceforge.net) RPC from the command line.

## Install

`npm install -g aria2`

Install aria2 and start it in daemon mode with

`aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all`

Check `aria2rpc -h` and http://aria2.sourceforge.net/manual/en/html/aria2c.html#methods for more information.

## call

Try aria2rpc with `aria2rpc call getVersion` it should print something like

```
{ enabledFeatures:
   [ 'BitTorrent',
     'Firefox3 Cookie',
     'GZip',
     'HTTPS',
     'Message Digest',
     'Metalink',
     'XML-RPC' ],
  version: '1.19.3' }
```

## console

Run `aria2rpc console` and type `getVersion` followed by enter.
it should print something like

```
{ enabledFeatures:
   [ 'BitTorrent',
     'Firefox3 Cookie',
     'GZip',
     'HTTPS',
     'Message Digest',
     'Metalink',
     'XML-RPC' ],
  version: '1.19.3' }
```

you can call as much methods as you want.
