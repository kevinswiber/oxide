var fs = require('fs');
var oxide = require('../');

oxide.wrap(fs.createReadStream('./sherlock.txt'))
  .subscribe(function(data) {
    console.log(data.toString());
  });
