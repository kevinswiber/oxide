var util = require('./util');
var Var = require('./var');
var observe = util.observe;
var signal = util.signal;

var a = Var.create(1);
var b = Var.create(2);

var c = util.signal([a, b], function() {
  return a.now() + b.now();
});

observe(a.changes, function(val) {
  console.log('changing value of a:', val);
});

console.log(c.now());
a.apply(4);
console.log(c.now());

