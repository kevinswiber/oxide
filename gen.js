var gen = function *() {
  yield 'a';
  yield 'b';
  yield 'c';
};

//for (letter of gen()) {
  //console.log(letter);
//}

var letter = gen();
console.log(letter.toString());

var current = letter.next();
while (!current.done) {
  console.log(current.value);
  current = letter.next();
}

/*console.log(letter.next());
console.log(letter.next());
console.log(letter.next());
console.log(letter.next());*/

// await immediate return if es already emitting, suspends until it starts emitting otherwise
// awaitNext suspends execution, returns next emitted value
// pause yields indefinitely
