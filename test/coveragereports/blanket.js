var path = require('path');
var srcDir = path.join(__dirname, '..', '..', 'lib');

console.log('Looking for source files under:' + srcDir);
require('blanket')({
  // Only files that match the pattern will be instrumented
  pattern: srcDir
});
