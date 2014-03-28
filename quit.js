var util = require('util');
var EventSource = require('./event_source');
var observe = require('./observe');

var Button = function(label) {
  this.label = label;
  this.clicks = new EventSource();
};

var MenuItem = function(label) {
  this.label = label;
  this.clicks = new EventSource();
};

var UIApp = function() {
  if (this.quit) {
    observe(this.quit, function(val) {
      console.log('quitting, val:', val);
      process.exit();
    });
  }
};

var MyApp = function() {
  this.quitButton = new Button('quit');
  this.quitMenu = new MenuItem('quit');
  this.fatalExceptions = new EventSource();

  observe(this.fatalExceptions, function(err) {
    console.log('error:', err);
  });

  observe(this.quitButton.clicks, function(x) {
    console.log('quit button, clicks:', x);
  });

  observe(this.quitMenu.clicks, function(x) {
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
