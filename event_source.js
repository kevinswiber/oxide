var Observer = require('./observer');

var EventSource = module.exports = function() {
  this._observers = [];
  this._buffer = [];
  this.Var = require('./var');
  this.pulse;
};

EventSource.prototype.emit = function(val) {
  if (!this._observers.length) {
    this._buffer.push(val);
  } else {
    var self = this;
    this._observers.forEach(function(observer) {
      if (observer.next) {
        this.pulse = val;
        observer.next(val);
      }
    });
  }
};

EventSource.prototype.addObserver = function(observer) {
  this._observers.push(observer);
  this.flush();
};

EventSource.prototype.flush = function() {
  var self = this;
  if (this._buffer.length) {
    while (self._buffer.length) {
      var val = self._buffer.shift();
      self.emit(val);
    }
  }
};

EventSource.prototype.removeObserver = function(observer) {
  var disposeOf = null;
  this._observers.forEach(function(ob, i) {
    if (ob === observer) {
      disposeOf = i;
    }
  });

  if (disposeOf !== null) {
    this._observers.splice(disposeOf);
  }
};

EventSource.prototype.merge = function(source) {
  var merged = new AggregateEventSource(this, source);
  return merged;
};

EventSource.prototype.map = function(mapper) {
  return this._react(function(emit, val) {
    emit(mapper(val));
  });
};

EventSource.prototype.filter = function(filter) {
  return this._react(function(emit, val) {
    if (filter(val)) {
      emit(val);
    }
  });
};

EventSource.prototype.take = function(count) {
  return this._react(function(emit, val) {
    if (count > 0) {
      count--;
      emit(val);
    } else {
      this.disposeSoon();
    }
  });
};

EventSource.prototype.first = function() {
  return this.take(1);
};

EventSource.prototype.skip = function(count) {
  return this._react(function(emit, val) {
    if (count > 0) {
      count--;
    } else {
      emit(val);
    }
  });
};

EventSource.prototype.buffer = function(count) {
  var arr;
  return this._react(function(emit, val) {
    if (!arr) {
      arr = [];
    }

    arr.push(val);

    if (arr.length === count) {
      emit(arr);
      arr = [];
    }
  });
};

EventSource.prototype.zip = function(/* combine..., fn */) {
  var es = EventSource.create();

  var combine = Array.prototype.slice.call(arguments);
  var fn = null;

  if (typeof combine[combine.length - 1] === 'function') {
    fn = combine.pop();
  }

  var results = { self: [] };
  var initialized = 0;

  var sendResult = function() {
    if (initialized === combine.length && results.self.length) {
      var result = [];
      result.push(results.self.shift());

      for (var j = 0; j < combine.length; j++) {
        if (!results[j]) {
          return;
        }

        result.push(results[j].shift());
      }

      if (fn) {
        result = fn.apply(null, result)
      }

      es.emit(result);
    }
  };

  var observer = Observer.create(this);
  observer.subscribe(function(val) {
    results.self.push(val);
    sendResult();
  });

  for (var i = 0; i < combine.length; i++) {
    var innerObserver = Observer.create(combine[i]);

    var idx = i;
    innerObserver.subscribe(function(val) {
      if (!results[idx]) {
        results[idx] = [];
        initialized++;
      }

      results[idx].push(val);

      sendResult();
    });
  }

  return es;
};

EventSource.prototype.scan = function(init, fn) {
  var acc = init;
  return this._react(function(emit, val) {
    acc = fn(acc, val);
    emit(acc);
  });
};

EventSource.prototype._react = function(fn) {
  var es = EventSource.create();

  var observer = Observer.create(this); 
  observer.subscribe(function(val) {
    var emit = es.emit.bind(es);
    fn.call(es, emit, val)
  });

  return es;
};

EventSource.prototype.clone = function() {
  var es = new EventSource();
  es._buffer = this._buffer;
  es._observers = this._observers;

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

EventSource.prototype.dispose = function() {
  this._observers = [];
  this.pulse = null;
  this._buffer = [];
};

EventSource.prototype.disposeSoon = function() {
  process.nextTick(this.dispose.bind(this));
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
