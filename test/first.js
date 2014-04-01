var oxide = require('../');

var es = oxide.createEventSource();

es.emit('a');
es.emit('b');
es.emit('c');

var first = es.first();

oxide.observe(first, function(val) {
  console.log(val);
});
