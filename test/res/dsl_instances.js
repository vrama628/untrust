'use strict';
let UpwardConnection = require('../../src/upwardconnection.js');

module.exports = (uc, result) => {
  let instances = {
    uc: uc instanceof UpwardConnection,
    result: result instanceof Promise
  }
  uc.send(instances);
  return {};
}