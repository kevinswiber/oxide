var Observer = require('./observer');
var Signal = require('./signal');

var observe = exports.observe = function observe(es, next) {
  var observer = Observer.create(es);
  return observer.subscribe(next);
};

exports.signal = function signal(deps, expr) {
  var s = new Signal(expr);

  for (var i = 0; i < deps.length; i++) {
    observe(deps[i].changes, function() {
      s.apply(expr);
    });
  }

  return s;
};

