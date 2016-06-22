'use strict';

module.exports = (uc, result) => {
  let multPromise = uc.request({x: 2, y: 3});
  multPromise.then(result => uc.send(result));
  return {};
}