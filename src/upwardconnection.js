'use strict';

const Connection = require('./connection.js');

module.exports = class UpwardConnection extends Connection {
  constructor(conn) {
    if (conn.constructor.name !== 'process') {
      throw new Error('UpwardConnection must be instantiated with a process.');
    }
    super(conn);
    this.error = err => conn.send({ //TODO: copy whole error
      event: 'error',
      args: [{
        message: err.message,
        stack: err.stack
      }]
    });
  }
}