'use strict';

module.exports = (uc) => {
  uc.on('message', message => uc.send(message));
  return {};
}