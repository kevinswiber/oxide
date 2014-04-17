var oxide = require('../');

oxide.array([1, 2, 3])
  .fold([], function(acc, val) {
    acc.push(val);
    return acc;
  })
  .subscribe(console.log);

oxide.array([1, 2, 3])
  .foldRight([], function(acc, val) {
    acc.push(val);
    return acc;
  })
  .subscribe(console.log);
