var oxide = require('../');

var es = oxide.createEventSource();

es.emit('a');
es.emit('b');
es.emit('c');
es.emit('d');

var buffered = es.buffer(2);

oxide.observe(buffered, function(val) {
  console.log(val);
});

