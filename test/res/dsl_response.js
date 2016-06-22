'use strict';

module.exports = (uc, result) => {
  uc.on('request', (x, y, respond) => {
    uc.send(x, y, typeof(respond) === 'function');
    respond(x * y);
  });
  return {};
}