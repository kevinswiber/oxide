var observe = require('./util').observe;
var EventSource = require('./event_source');

var es = EventSource.create();

var count = 0x60;
var interval = setInterval(function() {
  es.emit(String.fromCharCode(++count));
}, 200);

var sig = es.hold();

setTimeout(function() {
  console.log(sig.now());
  clearInterval(interval);
}, 1000);
