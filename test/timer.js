var oxide = require('../');

oxide.timer(200)
  .take(3)
  .subscribe(function() {
    console.log('fire');
  });
