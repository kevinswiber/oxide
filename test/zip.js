var oxide = require('../');

var es = oxide.createEventSource();
var es2 = oxide.createEventSource();
var es3 = oxide.createEventSource();

es.emit('a');
es.emit('b');
es.emit('c');

es2.emit(1);
es2.emit(2);
es2.emit(3);

es3.emit(new Buffer('hi'));
es3.emit(new Buffer('there'));
es3.emit(new Buffer('reactive'));

var zipped = es.zip(es2, es3, function(result) {
  return {
    letter: result[0],
    number: result[1],
    buffer: result[2]
  };
});

oxide.observe(zipped, function(val) {
  console.log(val);
});
