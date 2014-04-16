var Stream = require('stream');
var Observer = require('./observer');
var Signal = require('./signal');
var Var = require('./var');

var observe = exports.observe = function observe(es, next) {
  var observer = Observer.create(es);
  return observer.subscribe(next);
};

var EventSource = exports.EventSource = require('./event_source');
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

  es.disposeSoon();

  return es;
};

exports.wrap = function(/* fn|stream, ...args*/) {
  var args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === 'function') {
    return wrapCallback.apply(null, args);
  } else if (args[0] instanceof Stream) {
    return wrapStream.apply(null, args)
  }
};

var wrapCallback = function(/* fn, ...args */) {
  var es = EventSource.create();

  var args = Array.prototype.slice.call(arguments);
  var fn = args[0];
  var fnArgs = args.slice(1);
  var cb = function(err, result) {
    if (err) {
      es.throw(err);
    } else {
      es.emit(result);
    }
  };

  fnArgs.push(cb);
  fn.apply(null, fnArgs);

  return es;
};

var wrapStream = function(stream, bufferSize) {
  var es = EventSource.create();

  stream.on('readable', function() {
    var data;
    while (data = stream.read(bufferSize)) {
      es.emit(data);
    }
  });

  stream.on('end', function() {
    es.dispose();
  });

  return es;
};
