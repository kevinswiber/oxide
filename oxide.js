var Observer = require('./observer');
var Signal = require('./signal');
var Var = require('./var');

var observe = exports.observe = function observe(es, next) {
  var observer = Observer.create(es);
  return observer.subscribe(next);
};

exports.EventSource = require('./event_source');
exports.Var = require('./var');

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

var createEventSource = exports.createEventSource = function() {
  return require('./event_source').create();
};

exports.timer = function(timespan) {
  var es = createEventSource();
  var id = setInterval(function() {
    es.emit();
  }, timespan);

  es.ondispose = function() {
    clearInterval(id);
  };

  return es;
};

exports.range = function(start, count) {
  var es = createEventSource();

  var current = start;
  while (count > 0) {
    es.emit(current++);
    count--;
  }

  return es;
};

exports.array = function(arr) {
  var es = createEventSource();

  arr.forEach(function(item) {
    es.emit(item);
  });

  return es;
};
