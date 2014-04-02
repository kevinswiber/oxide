var readline = require('readline');
var oxide = require('../');

console.log('-----------------------------');
console.log('- THE REACTIVE SLOT MACHINE -');
console.log('------ WIN A BANANA ---------');
console.log('');
console.log('Commands are:');
console.log('   coin    - insert a coin');
console.log('   play    - play one game');
console.log('   quit    - quit the program');
console.log('');

var prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var coinEventSource = oxide.createEventSource();
var playEventSource = oxide.createEventSource();

var last = null;
var loop = function() {
  prompt.question('> ', function(answer) {
    switch (answer) {
      case 'coin':
        last = 'coin';
        coinEventSource.emit();
        loop();
        break;
      case 'play':
        last = 'play';
        playEventSource.emit();
        loop();
        break;
      case 'quit':
        process.exit();
        break;
      case '':
        if (last === 'coin') {
          coinEventSource.emit();
        } else if (last === 'play') {
          playEventSource.emit();
        }
        loop();
        break;
      default:
        console.log(answer + ' - unknown command');
        loop();
    }
  });
};

var credits = oxide.createVar(0);

var mayPlay = oxide.signal([credits], function() {
  return credits.now() > 0;
});

var roll = function() {
  return Math.floor(Math.random() * 7) + 1;
};

oxide.observe(coinEventSource, function(val) {
  credits.apply(credits.now() + 1);
  console.log('Credits:', credits.now());
});

oxide.observe(playEventSource, function(val) {
  if (mayPlay.now()) {
    credits.apply(credits.now() - 1);
    var z1 = roll();
    var z2 = roll();
    var z3 = roll();
    console.log('You rolled:', z1, z2, z3);
    if (z1 == z2 && z2 == z3) {
      console.log('Wowwowow! A triple! So awesome!');
      credits.apply(credits.now() + 20);
    } else if (z1 === z2 || z1 === z3 || z2 === z3) {
      console.log('Wow, a double!');
      credits.apply(credits.now() + 5);
    }
  } else {
    console.log('Not enough credits!');
  }
  console.log('Credits:', credits.now());
});

loop();
