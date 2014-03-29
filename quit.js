var util = require('util');
var oxide = require('./');

var Button = function(label) {
  this.label = label;
  this.clicks = oxide.createEventSource();
};

var MenuItem = function(label) {
  this.label = label;
  this.clicks = oxide.createEventSource();
};

var UIApp = function() {
  if (this.quit) {
    oxide.observe(this.quit, function(val) {
      console.log('quitting, val:', val);
      process.exit();
    });
  }
};

var MyApp = function() {
  this.quitButton = new Button('quit');
  this.quitMenu = new MenuItem('quit');
  this.fatalExceptions = oxide.createEventSource();

  oxide.observe(this.fatalExceptions, function(err) {
    console.log('error:', err);
  });

  oxide.observe(this.quitButton.clicks, function(x) {
    console.log('quit button, clicks:', x);
  });

  oxide.observe(this.quitMenu.clicks, function(x) {
    console.log('quit menu, clicks:', x);
  });

  //this.quit = this.quitButton.clicks
    //.merge(this.quitMenu.clicks)
    //.merge(this.fatalExceptions);

  var mapper = function(x) { return "Ok"; };

  this.quit = this.quitButton.clicks.map(mapper)
    .merge(this.quitMenu.clicks.map(mapper))
    .merge(this.fatalExceptions.map(mapper));

  UIApp.call(this);
};
util.inherits(MyApp, UIApp);


var app = new MyApp();

app.quitMenu.clicks.emit(1);
//app.quitButton.clicks.emit(1);
//app.fatalExceptions.emit(new Error('yoyoyo'));
