var oxide = require('../');

var es = oxide.createEventSource();

es.emit(1);
es.emit(2);
es.emit(3);

var scanned = es.scan(1, function(acc, val) {
  return acc + val;
});

oxide.observe(scanned, function(val) {
  console.log(val);
});
