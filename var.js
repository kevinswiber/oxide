var Signal = require('./signal');

var Var = module.exports = function(val) {
  this.signal = new Signal(function() { return val; });
  this.changes = this.signal.changes;
};

Var.prototype.apply = function(val) {
  this.signal.apply(function() { return val });
  return this;
};

Var.prototype.now  = function() {
  return this.signal.now();
};

Var.create = function(val) {
  return new Var(val);
};
