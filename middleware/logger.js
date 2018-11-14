'use strict';
function logger(req, res, next) {
  console.log(Date.now(), req.method, req.url);
  next();
}

module.exports = {logger};