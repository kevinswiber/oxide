var oxide = require('../');

oxide.array([1, 2, 3])
  .fold(1, function(acc, val) {
    return acc + val;
  })
  .subscribe(console.log);
