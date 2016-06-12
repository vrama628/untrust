'use strict';

/**
 * @module untrust
 * @overview A minimialistic way to define domain-specific languages
 *  and run untrusted code.
 * @author Vijay Ramamurthy
 */

const child_process = require('child_process'),
      EventEmitter = require('events'),
      Connection = require('./connection.js');


function run(code, dsl_path) {
  if (typeof(code) !== 'string') {
    throw new TypeError('First argument to run() must be a string');
  }
  if (dsl_path && typeof(dsl_path) !== 'string') {
    throw new TypeError('Second argument to run(), if supplied, must be a' +
                                                                    'string');
  }
  
  let worker = child_process.fork('./worker.js', [code, dsl_path]);
  return new Connection(worker);
}

module.exports = {
  run: run
};