var readline = require('readline');
var oxide = require('../');

var prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var coinEventSource = oxide.createEventSource();
var playEventSource = oxide.createEventSource();

var loop = function() {
  prompt.question('> ', function(answer) {
    switch (answer) {
      case 'coin':
        coinEventSource.emit();
        loop();
        break;
      case 'play':
        playEventSource.emit();
        loop();
        break;
      case 'quit':
        process.exit();
        break;
      default:
        console.log(answer + ' - unknown command');
        loop();
    }
  });
};

oxide.observe(coinEventSource, function(val) {
  console.log('adding coin');
});

oxide.observe(playEventSource, function(val) {
  console.log('playing');
});

loop();
