var oxide = require('../');

var letters = oxide.createEventSource();
var numbers = oxide.createEventSource();
var buffers = oxide.createEventSource();

letters.emit('a');
letters.emit('b');
letters.emit('c');

numbers.emit(1);
numbers.emit(2);
numbers.emit(3);

buffers.emit(new Buffer('hi'));
buffers.emit(new Buffer('there'));
buffers.emit(new Buffer('reactive'));

var zipped = letters.zip(numbers, buffers, function(letter, number, buffer) {
  return {
    letter: letter,
    number: number,
    buffer: buffer
  };
});

oxide.observe(zipped, function(val) {
  console.log(val);
});
