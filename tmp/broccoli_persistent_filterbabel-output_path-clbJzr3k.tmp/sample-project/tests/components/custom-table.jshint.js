define('sample-project/tests/components/custom-table.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | components/custom-table.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/custom-table.js should pass jshint.\ncomponents/custom-table.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncomponents/custom-table.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n2 errors');
  });
});