'use strict';
let untrust = require('../..');

module.exports = (uc, result) => {
  let instances = {
    conn: uc instanceof untrust.Connection,
    uc: uc instanceof untrust.UpwardConnection,
    result: result instanceof Promise
  }
  uc.send(instances);
  return {};
}