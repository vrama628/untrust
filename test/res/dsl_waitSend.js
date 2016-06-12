'use strict';

module.exports = (uc) => {
  setTimeout(() => uc.send('foo', 'bar', 'baz'), 250);
  return {};
}