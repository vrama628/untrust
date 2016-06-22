'use strict';

module.exports = (uc, result) => {
  let multPromise = uc.request(2, 3);
  multPromise.then(result => uc.send(result));
  return {};
}