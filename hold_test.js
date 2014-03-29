var oxide = require('./');

var es = oxide.createEventSource();

var count = 0x60;
var interval = setInterval(function() {
  es.emit(String.fromCharCode(++count));
}, 200);

var sig = es.hold();

setTimeout(function() {
  console.log(sig.now());
  clearInterval(interval);
}, 1000);
