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
    this.message = this.send;

    conn.setMaxListeners(Infinity);
    let requestStack = [1];
    this.request = function () {
      let id = requestStack.pop();
      if (requestStack.length === 0) {
        requestStack.push(id + 1);
      }
      conn.send({
        event: 'request',
        args: Array.prototype.slice.call(arguments),
        id: id
      });
      return new Promise((resolve, reject) => {
        conn.on('message', data => {
          if (data.event === 'response' && data.id === id) {
            resolve(data.value);
            requestStack.push(id);
          }
        });
      });
    }

    conn.on('message', data => {
      switch (data.event) {
        case 'message':
          this.emit.bind(this, 'message').apply(this, data.args);
          break;
        case 'error':
          this.emit.bind(this, 'error').apply(this, data.args);
          break;
        case 'request':
          let respond = response => conn.send({
            event: 'response',
            value: response,
            id: data.id
          });
          data.args.push(respond);
          this.emit.bind(this, 'request').apply(this, data.args);
          break;
        default:
          break;
      }
    });
  }
}