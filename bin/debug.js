"use strict";

module.exports = function(cli) {
  return function() {
    if (cli.debug) {
      console.log.apply(console, arguments);
    }
  };
};
