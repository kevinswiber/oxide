var EventSource = require('./event_source');
var observe = require('./observe');

var es = new EventSource();

es.emit(1);
es.emit(2);

var ob = observe(es, function(val) {
  console.log('Receiving', val);
});

ob.dispose();

var Button = function(label) {
  this.label = label;
  this.clicks = new EventSource();
};

var quitButton = new Button('quit');

observe(quitButton.clicks, function(x) {
  process.exit();
});

setTimeout(function() { console.log('never fires'); }, 5000);

quitButton.clicks.emit(1);
