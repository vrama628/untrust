'use strict';

const vm = require('vm'),
      fs = require('fs'),
      Connection = require('./connection.js');

let code = process.argv[2], // consider changing to pipe or something
    dsl_path = process.argv[3];

let conn = new Connection(process),
    resolve = undefined,
    reject = undefined;
conn.result = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

let sandbox = dsl_path ? {} : require(dsl_path)(conn);

try {
  let result = vm.runInNewContext(code, sandbox);
  resolve(result);
} catch (e) {
  reject(e);
}