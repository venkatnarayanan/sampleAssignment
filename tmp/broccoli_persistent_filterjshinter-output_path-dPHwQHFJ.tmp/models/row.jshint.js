QUnit.module('JSHint | models/row.js');
QUnit.test('should pass jshint', function(assert) {
  assert.expect(1);
  assert.ok(false, 'models/row.js should pass jshint.\nmodels/row.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/row.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/row.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
});
