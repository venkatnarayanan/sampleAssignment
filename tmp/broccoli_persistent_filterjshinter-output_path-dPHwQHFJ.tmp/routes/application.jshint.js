QUnit.module('JSHint | routes/application.js');
QUnit.test('should pass jshint', function(assert) {
  assert.expect(1);
  assert.ok(false, 'routes/application.js should pass jshint.\nroutes/application.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/application.js: line 3, col 1, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nroutes/application.js: line 18, col 1, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nroutes/application.js: line 18, col 1, \'destructuring binding\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nroutes/application.js: line 22, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nroutes/application.js: line 23, col 3, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\n\n6 errors');
});
