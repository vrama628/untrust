'use strict';

module.exports = (uc) => {
  uc.send('foo', 'bar', 'baz');
  return {};
}