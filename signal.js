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
  this.signal = new Signal(function() { return val; });
  this.source = this.signal.source;
};

Var.prototype.apply = function(val) {
  this.signal.apply(function() { return val });
  return this;
};

Var.prototype.now  = function() {
  return this.signal.now();
};

var signal = function(deps, expr) {
  var s = new Signal(expr);

  for (var i = 0; i < deps.length; i++) {
    observe(deps[i].source, function() {
      s.apply(expr);
    });
  }

  return s;
};

var a = new Var(1);
var b = new Var(2);

var c = signal([a, b], function() {
  return a.now() + b.now();
});

console.log(c.now());
a.apply(4);
console.log(c.now());
