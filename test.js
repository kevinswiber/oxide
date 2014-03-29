var oxide = require('./');

var es = oxide.createEventSource();

es.emit(1);
es.emit(2);

var ob = oxide.observe(es, function(val) {
  console.log('Receiving', val);
});

ob.dispose();

var Button = function(label) {
  this.label = label;
  this.clicks = oxide.createEventSource();
};

var quitButton = new Button('quit');

oxide.observe(quitButton.clicks, function(x) {
  process.exit();
});

setTimeout(function() { console.log('never fires'); }, 5000);

quitButton.clicks.emit(1);
