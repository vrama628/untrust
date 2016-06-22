'use strict';

module.exports = (uc, result) => {
  uc.on('request', (x, y, respond) => {
    uc.send(x, y, typeof(respond) === 'function');
    setTimeout(() => respond(x * y), Math.random() * 250);
  });
  return {};
}