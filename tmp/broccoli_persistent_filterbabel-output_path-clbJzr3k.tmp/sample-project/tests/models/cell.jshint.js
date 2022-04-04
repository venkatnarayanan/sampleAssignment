define('sample-project/tests/models/cell.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | models/cell.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'models/cell.js should pass jshint.\nmodels/cell.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/cell.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/cell.js: line 3, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nmodels/cell.js: line 5, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
  });
});