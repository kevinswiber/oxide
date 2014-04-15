var fs = require('fs');
var oxide = require('../');

oxide.wrap(fs.stat, __filename)
  .subscribe(function(stat) {
    console.log(stat);
  });
