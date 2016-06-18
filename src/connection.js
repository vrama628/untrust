'use strict';

const EventEmitter = require('events');

// the parameter to the constructor is a ChildProcess object or the process
// object if you're already in a forked child process.
module.exports = class Connection extends EventEmitter {
  constructor(conn) {
    super();
    this.send = function () {
      return conn.send({
        event: 'message',
        args: Array.prototype.slice.call(arguments)
      });
    }
    conn.on('message', data =>
      this.emit.bind(this, data.event).apply(this, data.args));
  }
}