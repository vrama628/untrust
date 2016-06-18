'use strict';

/**
 * @module untrust
 * @overview A minimialistic way to define domain-specific languages
 *  and run untrusted code.
 * @author Vijay Ramamurthy
 */

const child_process = require('child_process'),
      EventEmitter = require('events'),
      DownwardConnection = require('./downwardconnection.js');


function run(code, dsl_path) {
  if (typeof(code) !== 'string') {
    throw new TypeError('First argument to run() must be a string');
  }
  if (typeof(dsl_path) !== 'string') {
    throw new TypeError('Second argument to run() must be a string');
  }
  
  let worker = child_process.fork(require.resolve('./worker.js'),
    [code, dsl_path]);
  return new DownwardConnection(worker);
}

module.exports = {
  run: run
};