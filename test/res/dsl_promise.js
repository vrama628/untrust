'use strict';

module.exports = (uc, result) => {
  result.then(uc.send);

  return Promise.resolve({foo: 'star`'});
}