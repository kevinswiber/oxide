var Observer = require('./observer');

var EventSource = module.exports = function() {
  this._observers = [];
  this._buffer = [];
  this.Var = require('./var');
  this.dependents = [];
  this.ondispose = null;
  this.oncomplete = null;
  this.onsuccess = null;
  this.onerror = null;
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

EventSource.prototype.throw = function(err) {
  if (this.onerror) {
    this.onerror(err);
  } else {
    if (this.oncomplete) {
      this.oncomplete();
    }
    throw err;
  }

  this.dependents.forEach(function(observer) {
    observer.throw(err);
  });

  return this;
};

EventSource.prototype.catch = function(onerror) {
  this.onerror = onerror;
  return this;
};

EventSource.prototype.finally = function(oncomplete) {
  this.oncomplete = oncomplete;
  return this;
};

EventSource.prototype.dependsOn = function(observer) {
  this.dependents.push(observer);
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

  if (this._observers.length === 0) {
    this.disposeSoon();
  };
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

  es.dependsOn(observer);

  for (var i = 0; i < combine.length; i++) {
    var innerObserver = Observer.create(combine[i]);

    es.dependsOn(innerObserver);

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

EventSource.prototype.fold = function(init, fn) {
  var es = EventSource.create();

  var observer = Observer.create(this);

  var acc = init;
  observer.subscribe(function(val) {
    acc = fn(acc, val);
  });

  this.onsuccess = function() {
    es.emit(acc)
  };

  es.dependsOn(observer);

  return es;
};

EventSource.prototype.flatMap = function(fn) {
  var self = this;
  return this._react(function(emit, val, observer) {
    var es = fn(val);
    es.dependsOn(o);
    var o = Observer.create(es);
    o.subscribe(function(v) {
      emit(v);
    });
  });
};

EventSource.prototype._react = function(fn) {
  var es = EventSource.create();

  var observer = Observer.create(this);

  observer.subscribe(function(val) {
    var emit = es.emit.bind(es);
    fn.call(es, emit, val, observer)
  });

  es.dependsOn(observer);

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
  if (this.onsuccess) {
    this.onsuccess();
  }

  if (this.oncomplete) {
    this.oncomplete();
  }

  this.dependents.forEach(function(dependent) {
    dependent.source.removeObserver(dependent);
  });

  if (this.ondispose) {
    this.ondispose();
  }

  this._observers = [];
  this.pulse = null;
  this._buffer = [];
};

EventSource.prototype.disposeSoon = function() {
  process.nextTick(this.dispose.bind(this));
};

EventSource.prototype.subscribe = function(next) {
  var observer = Observer.create(this);
  return observer.subscribe(next);
};

EventSource.create = function() {
  return new EventSource();
};

var AggregateEventSource = function(left, right) {
  this.left = left;
  this.right = right;
  this.Var = require('./var');
};

Object.keys(EventSource.prototype).forEach(function(key) {
  AggregateEventSource.prototype[key] = EventSource.prototype[key];
});

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
