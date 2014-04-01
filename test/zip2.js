var oxide = require('../');

// Testing to see if oxide has the same problem outlined here:
//    http://baconjs.blogspot.com/2013/12/baconjs-070-is-out.html
//
// Everything appears to be fine due to the way oxide manages dependencies.

var a = sequentially(10, [1, 2]);
var b = a.map(function(x) { return x * 2; });
var c = a.zip(b);

oxide.observe(c, function(val) {
  console.log(val);
});

// Produces:
// [1, 2]
// [2, 4]

// Same as Bacon.sequentially in above example.
function sequentially(interval, array) {
  var source = oxide.createEventSource();
  var id = setInterval(function() {
    a.emit(array.shift());

    if (!array.length) {
      clearInterval(id);
    }
  }, interval);

  return source;
}

