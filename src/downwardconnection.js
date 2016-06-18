'use strict';

const Connection = require('./connection.js'),
      ChildProcess = require('child_process').ChildProcess;

module.exports = class DownwardConnection extends Connection {
  constructor(conn) {
    if (!(conn instanceof ChildProcess)) {
      throw new TypeError('DownwardConnection must be instantiated' +
        ' with instance of ChildProcess.');
    }
    super(conn);
    this.pid = conn.pid;
    this.kill = () => conn.kill();
    this.alive = true;
    let exit = () => {
      this.pid = undefined;
      this.send = this.kill = () => {
        throw new Error('Connection has exited.');
      }
      // todo: document this behavior
      this.alive = false;
      this.emit('exit');
    }
    conn.on('exit', exit);
  }
}