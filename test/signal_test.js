var oxide = require('../');

var a = oxide.createVar(1);
var b = oxide.createVar(2);

var c = oxide.signal([a, b], function() {
  return a.now() + b.now();
});

oxide.observe(a.changes, function(val) {
  console.log('changing value of a:', val);
});

console.log(c.now());
a.apply(4);
console.log(c.now());
