var oxide = require('../');

var es = oxide.createEventSource();

es.emit('a');
es.emit('b');
es.emit('c');

var limited = es.skip(2);

oxide.observe(limited, function(val) {
  console.log(val);
});

