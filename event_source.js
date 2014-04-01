var Observer = require('./observer');

var EventSource = module.exports = function() {
  this.observers = [];
  this.buffer = [];
  this.transforms = [];
  this.Var = require('./var');
  this.pulse;
};

EventSource.prototype.emit = function(val) {
  if (!this.observers.length) {
    this.buffer.push(val);
  } else {
    var self = this;
    this.observers.forEach(function(observer) {
      if (observer.next) {
        self.transforms.forEach(function(transform) {
          val = transform(val);
        })

        this.pulse = val;
        observer.next(val);
      }
    });
  }
};

EventSource.prototype.addObserver = function(observer) {
  this.observers.push(observer);

  var self = this;
  if (this.buffer.length) {
    while (self.buffer.length) {
      var val = self.buffer.shift();
      self.emit(val);
    }
  }
};

EventSource.prototype.removeObserver = function(observer) {
  var disposeOf = null;
  this.observers.forEach(function(ob, i) {
    if (ob === observer) {
      disposeOf = i;
    }
  });

  if (disposeOf !== null) {
    this.observers.splice(disposeOf);
  }
};

EventSource.prototype.merge = function(source) {
  var merged = new AggregateEventSource(this, source);
  return merged;
};

EventSource.prototype.map = function(mapper) {
  var es = new EventSource();

  var observer = Observer.create(this); 
  observer.subscribe(function(val) {
    es.emit(mapper(val));
  });

  return es;
};

EventSource.prototype.clone = function() {
  var es = new EventSource();
  es.buffer = this.buffer;
  es.observers = this.observers;
  es.transforms = this.transforms;

  return es;
};

EventSource.prototype.hold = function(initial) {
  var held = this.Var.create(initial);
  var observer = Observer.create(this);

  observer.subscribe(function(val) {
    held.apply(val);
  });

  return held;
};

EventSource.create = function() {
  return new EventSource();
};

var AggregateEventSource = function(left, right) {
  this.left = left;
  this.right = right;
};

AggregateEventSource.prototype.emit = function(val) {
  this.left.emit(val);
  this.right.emit(val);
  return this;
};

AggregateEventSource.prototype.merge = function(right) {
  var merged = new AggregateEventSource(this, right);
  return merged;
};

AggregateEventSource.prototype.addObserver = function(observer) {
  this.left.addObserver(observer);
  this.right.addObserver(observer);
  return this;
};

AggregateEventSource.prototype.removeObserver = function(observer) {
  this.left.removeObserver(observer);
  this.right.removeObserver(observer);
  return this;
};
