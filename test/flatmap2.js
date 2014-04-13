var oxide = require('../');

oxide.range(1, 2)
  .flatMap(function(x) {
    return oxide.range(x, 2);
  })
  .subscribe(console.log);
