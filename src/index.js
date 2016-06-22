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


function run(code, dsl_path, arg) {
  if (typeof(code) !== 'string') {
    throw new TypeError('First argument to run() must be a string');
  }
  if (typeof(dsl_path) !== 'string') {
    throw new TypeError('Second argument to run() must be a string');
  }
  let argsToSend = [code, dsl_path];
  if (arg !== undefined) {
    argsToSend.push(JSON.stringify(arg));
  }
  
  let worker = child_process.fork(require.resolve('./worker.js'), argsToSend);
  return new DownwardConnection(worker);
}

module.exports = {
  run: run,
  Connection: require('./connection.js'),
  DownwardConnection: require('./downwardconnection.js'),
  UpwardConnection: require('./upwardconnection.js')
};