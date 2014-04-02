var readline = require('readline');
var oxide = require('../');

var coinEventSource = oxide.createEventSource();
var playEventSource = oxide.createEventSource();
var winEventSource = oxide.createEventSource();
var rollEventSource = oxide.createEventSource();
var mayPlayEventSource = oxide.createEventSource();
var doesPlayEventSource = oxide.createEventSource();
var deniedEventSource = oxide.createEventSource();
var endEventSource = oxide.createEventSource();

oxide.observe(mayPlayEventSource, function(val) {
  if (val) {
    doesPlayEventSource.emit();
  } else {
    deniedEventSource.emit();
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
var creditsEventSource = coinEventSource.map(addCredit)
  .merge(doesPlayEventSource.map(removeCredit))
  .merge(winEventSource.map(addWin));

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

oxide.observe(playEventSource, function(val) {
  mayPlayEventSource.emit((credits.now() > 0));
});

var roll = function() {
  return Math.floor(Math.random() * 7) + 1;
};

oxide.observe(doesPlayEventSource, function(val) {
  rollEventSource.emit([roll(), roll(), roll()]);
});

oxide.observe(rollEventSource, function(val) {
  console.log('You rolled:', val[0], val[1], val[2]);
});

oxide.observe(rollEventSource, function(val) {
  var z1 = val[0]
  var z2 = val[1];
  var z3 = val[2];
  if (z1 == z2 && z2 == z3) {
    winEventSource.emit('triple');
  } else if (z1 === z2 || z1 === z3 || z2 === z3) {
    winEventSource.emit('double');
  } else {
    endEventSource.emit();
  }
});

oxide.observe(coinEventSource, function() {
  endEventSource.emit();
});

oxide.observe(endEventSource, function() {
  console.log('Credits:', credits.now());
});

oxide.observe(winEventSource, function(type) {
  if (type === 'triple') {
    console.log('Wowwowow! A triple! So awesome!');
  } else if (type === 'double') {
      console.log('Wow, a double!');
  }

  endEventSource.emit();
});

oxide.observe(deniedEventSource, function(val) {
  console.log('Not enough credits!');
  endEventSource.emit();
});

showHelp();
loop();
