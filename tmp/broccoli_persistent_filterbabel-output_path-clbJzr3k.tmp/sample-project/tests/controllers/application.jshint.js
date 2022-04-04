define('sample-project/tests/controllers/application.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | controllers/application.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/application.js should pass jshint.\ncontrollers/application.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/application.js: line 3, col 1, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/application.js: line 3, col 1, \'destructuring binding\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/application.js: line 7, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/application.js: line 8, col 3, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/application.js: line 9, col 17, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\n\n6 errors');
  });
});