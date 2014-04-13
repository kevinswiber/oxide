var oxide = require('../');

var turn = 0;
var timer = oxide.timer(1000)
  .map(function() {
    return ++turn;
  })
  .take(5)
  .hold();

var id = setInterval(function() {
  console.log(timer.now());
}, 1000);

setTimeout(function() {
  clearInterval(id);
}, 10000);
