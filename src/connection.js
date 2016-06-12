'use strict';

const EventEmitter = require('events');

// the parameter to the constructor is a ChildProcess object or the process
// object if you're already in a forked child process.
module.exports = class Connection extends EventEmitter {
  constructor(conn) {
    this.send = (...args) => {
      if (args.length < 1 || typeof(args[0]) !== 'string') {
        throw new TypeError('First argument to Runner.send() must be a string.');
      }
      conn.send({event: args});
    };
    conn.on('message', data => this.emit.apply(runner, data.event));
  }
}