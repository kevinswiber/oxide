var EventSource = require('./event_source');
var observe = require('./observe');

var Signal = function(valFn) {
  this.valFn = valFn;
  this.source = new EventSource();
};

Signal.prototype.apply = function(valFn) {
  this.valFn = valFn;
  this.source.emit(this.now());
  return this;
};

Signal.prototype.now = function() {
  return this.valFn();
};

var Var = function(val) {
  return new Signal(function() { return val; });
};

var signal = function(deps, expr) {
  var es = new EventSource();

  for (var i = 0; i < deps.length; i++) {
    observe(deps[i].source, function(val) {
      es.emit(expr());
    });
  }

  es.emit(expr());
  return es;
};

var a = Var(1);
var b = Var(2);

var sum = signal([a, b], function() {
  return a.now() + b.now();
});

setTimeout(function() {
  a.apply(function() { return 4; });
}, 200);

observe(sum, function(x) {
  console.log(x);
});

b.apply(function() { return 5; });
console.log(b.now());
