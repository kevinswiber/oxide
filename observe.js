var Observer = require('./observer');

module.exports = function observe(es, next) {
  var observer = Observer.create(es);
  return observer.subscribe(next);
};
