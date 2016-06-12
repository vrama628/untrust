'use strict';

module.exports = (uc, result) => {
  result.then(obj => uc.send(obj));
  return {};
}