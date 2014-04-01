var oxide = require('../');

var es = oxide.createEventSource();

es.emit(1);
es.emit(2);
es.emit(3);

var mapped = es.map(function(val) {
  return val * 1000;
});

oxide.observe(mapped, function(val) {
  console.log(val);
});
