var readline = require('readline');
var oxide = require('../');
var EventSource = oxide.EventSource;
var Var = oxide.Var;

var coinEvents = EventSource.create();
var playEvents = EventSource.create();
var winEvents = EventSource.create();
var rollEvents = EventSource.create();
var mayPlayEvents = EventSource.create();
var doesPlayEvents = EventSource.create();
var deniedEvents = EventSource.create();
var endEvents = EventSource.create();

mayPlayEvents.subscribe(function(val) {
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

var credits = Var.create(0);
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

playEvents.subscribe(function() {
  mayPlayEvents.emit((credits.now() > 0));
});

function roll() {
  return Math.floor(Math.random() * 7) + 1;
};

doesPlayEvents.subscribe(function(val) {
  rollEvents.emit([roll(), roll(), roll()]);
});

rollEvents.subscribe(function(val) {
  console.log('You rolled:', val[0], val[1], val[2]);
});

rollEvents.subscribe(function(val) {
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

coinEvents.subscribe(function() {
  endEvents.emit();
});

endEvents.subscribe(function() {
  console.log('Credits:', credits.now());
});

winEvents.subscribe(function(type) {
  if (type === 'triple') {
    console.log('Wowwowow! A triple! So awesome!');
  } else if (type === 'double') {
      console.log('Wow, a double!');
  }

  endEvents.emit();
});

deniedEvents.subscribe(function(val) {
  console.log('Not enough credits!');
  endEvents.emit();
});

showHelp();
loop();
