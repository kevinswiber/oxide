var oxide = require('../');

var es = oxide.createEventSource();

es.emit(1);
es.emit(2);
es.emit(3);

es.scan(1, function(acc, val) {
  return acc + val;
}).subscribe(console.log);
