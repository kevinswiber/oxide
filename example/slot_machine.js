var readline = require('readline');
var oxide = require('../');

var coinEvents = oxide.createEventSource();
var playEvents = oxide.createEventSource();
var winEvents = oxide.createEventSource();
var rollEvents = oxide.createEventSource();
var mayPlayEvents = oxide.createEventSource();
var doesPlayEvents = oxide.createEventSource();
var deniedEvents = oxide.createEventSource();
var endEvents = oxide.createEventSource();

oxide.observe(mayPlayEvents, function(val) {
  if (val) {
    doesPlayEvents.emit();
  } else {
    deniedEvents.emit();
  }
});

function showHelp() {
  console.log('-----------------------------');
  console.log('- THE REACTIVE SLOT MACHINE -');
  console.log('------ WIN A BANANA ---------');
  console.log('');
  console.log('Commands are:');
  console.log('   coin    - insert a coin');
  console.log('   play    - play one game');
  console.log('   help    - show this message');
  console.log('   quit    - quit the program');
  console.log('');
};

var prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var last = null;
var loop = function() {
  var handle = function(command) {
    switch (command) {
      case 'coin':
        last = 'coin';
        coinEvents.emit();
        loop();
        break;
      case 'play':
        last = 'play';
        playEvents.emit();
        loop();
        break;
      case 'quit':
        process.exit();
        break;
      case '':
        handle(last)
        loop();
        break;
      case 'help':
      case null:
        showHelp();
        loop()
        break;
      default:
        last = null;
        console.log(command + ' - unknown command');
        loop();
    }
  };

  prompt.question('> ', function(answer) {
    handle(answer);
  });
};

var credits = oxide.createVar(0);
var creditsEvents = coinEvents.map(addCredit)
  .merge(doesPlayEvents.map(removeCredit))
  .merge(winEvents.map(addWin));

function addCredit() {
  credits.apply(credits.now() + 1);
  return credits;
};

function removeCredit() {
  credits.apply(credits.now() - 1);
  return credits;
}

function addWin(type) {
  if (type === 'double') {
    credits.apply(credits.now() + 5);
  } else if (type === 'triple') {
    credits.apply(credits.now() + 20);
  }

  return credits;
};

oxide.observe(playEvents, function() {
  mayPlayEvents.emit((credits.now() > 0));
});

function roll() {
  return Math.floor(Math.random() * 7) + 1;
};

oxide.observe(doesPlayEvents, function(val) {
  rollEvents.emit([roll(), roll(), roll()]);
});

oxide.observe(rollEvents, function(val) {
  console.log('You rolled:', val[0], val[1], val[2]);
});

oxide.observe(rollEvents, function(val) {
  var z1 = val[0]
  var z2 = val[1];
  var z3 = val[2];
  if (z1 == z2 && z2 == z3) {
    winEvents.emit('triple');
  } else if (z1 === z2 || z1 === z3 || z2 === z3) {
    winEvents.emit('double');
  } else {
    endEvents.emit();
  }
});

oxide.observe(coinEvents, function() {
  endEvents.emit();
});

oxide.observe(endEvents, function() {
  console.log('Credits:', credits.now());
});

oxide.observe(winEvents, function(type) {
  if (type === 'triple') {
    console.log('Wowwowow! A triple! So awesome!');
  } else if (type === 'double') {
      console.log('Wow, a double!');
  }

  endEvents.emit();
});

oxide.observe(deniedEvents, function(val) {
  console.log('Not enough credits!');
  endEvents.emit();
});

showHelp();
loop();
