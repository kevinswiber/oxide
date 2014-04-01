var oxide = require('../');

var es = oxide.createEventSource();

es.emit('a');
es.emit('b');
es.emit('c');

var limited = es.take(2);

oxide.observe(limited, function(val) {
  console.log(val);
});
