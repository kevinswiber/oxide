var oxide = require('../');

var es = oxide.createEventSource();

es.emit(1);
es.emit(2);
es.emit(3);

var filtered = es.filter(function(val) {
  return (val % 2 === 1);
});

oxide.observe(filtered, function(val) {
  console.log(val);
});

