'use strict';

module.exports = (uc) => {
  setTimeout(() => uc.send('bar'), 250);
  return {};
}