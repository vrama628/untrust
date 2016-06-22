'use strict';

module.exports = (uc, result) => {
  uc.on('request', (factors, respond) => {
    uc.send({
      x: factors.x,
      y: factors.y,
      isFunction: typeof(respond) === 'function'
    });
    setTimeout(() => respond(factors.x * factors.y), Math.random() * 250);
  });
  return {};
}