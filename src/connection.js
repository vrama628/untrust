'use strict';

const EventEmitter = require('events');

// the parameter to the constructor is a ChildProcess object or the process
// object if you're already in a forked child process.
module.exports = class Connection extends EventEmitter {
  constructor(conn) {
    super();
    this.send = message => conn.send({
      event: 'message',
      message: message
    });
    this.message = this.send;

    conn.setMaxListeners(Infinity);
    let requestStack = [1];
    this.request = request => {
      let id = requestStack.pop();
      if (requestStack.length === 0) {
        requestStack.push(id + 1);
      }
      conn.send({
        event: 'request',
        request: request,
        id: id
      });
      return new Promise((resolve, reject) => {
        conn.on('message', data => {
          if (data.event === 'response' && data.id === id) {
            resolve(data.response);
            requestStack.push(id);
          }
        });
      });
    }

    conn.on('message', data => {
      switch (data.event) {
        case 'message':
          this.emit('message', data.message);
          break;
        case 'error':
          this.emit('error', data.error);
          break;
        case 'request':
          let respond = response => conn.send({
            event: 'response',
            response: response,
            id: data.id
          });
          this.emit('request', data.request, respond);
          break;
        default:
          break;
      }
    });
  }
}