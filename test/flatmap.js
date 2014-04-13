var oxide = require('../');

var es = oxide.createEventSource();

es
  .flatMap(function(val) {
    var es = oxide.createEventSource()
    var mapped = es.map(function(v) {
      return v * 2;
    });

    es.emit(val + 1);

    return mapped;
  })
  .subscribe(function(val) {
    console.log(val);
  });

es.emit(1);
es.emit(2);
es.emit(3);
