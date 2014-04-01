var Observer = module.exports = function(source) {
  this.source = source;
};

Observer.prototype.subscribe = function(next) {
  this.next = next;
  this.source.addObserver(this);
  return this;
};

Observer.prototype.once = function(next) {
  var self = this;
  this.next = function(val) {
    next(val);
    self.source.removeObserver(self.next);
  };

  this.source.addObserver(this);

  return this;
};

Observer.prototype.dispose = function() {
  this.source.removeObserver(this);
  return this;
};

Observer.create = function(source) {
  return new Observer(source);
};
