var Observer = require('./observer');
var Signal = require('./signal');
var Var = require('./var');

var observe = exports.observe = function observe(es, next) {
  var observer = Observer.create(es);
  return observer.subscribe(next);
};

exports.signal = function signal(deps, expr) {
  if (typeof deps === 'function') {
    expr = deps;
    deps = [];
  }

  var s = new Signal(expr);

  for (var i = 0; i < deps.length; i++) {
    observe(deps[i].changes, function() {
      s.apply(expr);
    });
  }

  return s;
};

exports.createVar = function(val) {
  return Var.create(val);
};

exports.createEventSource = function() {
  return require('./event_source').create();
};
