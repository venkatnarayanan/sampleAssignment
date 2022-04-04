QUnit.module('JSHint | components/custom-row.js');
QUnit.test('should pass jshint', function(assert) {
  assert.expect(1);
  assert.ok(false, 'components/custom-row.js should pass jshint.\ncomponents/custom-row.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncomponents/custom-row.js: line 2, col 1, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncomponents/custom-row.js: line 2, col 1, \'destructuring binding\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncomponents/custom-row.js: line 7, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\ncomponents/custom-row.js: line 14, col 5, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncomponents/custom-row.js: line 19, col 5, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\n\n6 errors');
});
