"use strict";

module.exports = function(cli) {
  return function(...args) {
    if (cli.debug) {
      console.log(...args);
    }
  };
};
