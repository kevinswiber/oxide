var EventSource = require('./event_source');

var Signal = module.exports = function(valFn) {
  this.valFn = valFn;
  this.changes = new EventSource();
};

Signal.prototype.apply = function(valFn) {
  this.valFn = valFn;
  this.changes.emit(this.now());
  return this;
};

Signal.prototype.now = function() {
  return this.valFn();
};

Signal.create = function(valFn) {
  return new Signal(valFn);
};

