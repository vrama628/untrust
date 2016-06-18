'use strict';

const vm = require('vm'),
      fs = require('fs'),
      path = require('path'),
      UpwardConnection = require('./upwardconnection.js');

let code = process.argv[2], // consider changing to pipe or something
    dsl_path = process.argv[3];

let conn = new UpwardConnection(process),
    resolve = undefined,
    reject = undefined,
    result = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    }),
    sandbox = {};
    
try {
  sandbox = require(path.join(dsl_path))(conn, result);
} catch (e) {
  conn.error(e);
}

Promise.resolve(sandbox)
.then(sandbox => {
  vm.runInNewContext(code, sandbox);
  resolve(sandbox);
})
.catch(e => {
  reject(e);
  conn.error(e);
});