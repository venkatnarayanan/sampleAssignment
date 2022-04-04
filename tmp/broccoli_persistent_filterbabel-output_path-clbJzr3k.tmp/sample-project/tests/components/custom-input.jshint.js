define('sample-project/tests/components/custom-input.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | components/custom-input.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/custom-input.js should pass jshint.\ncomponents/custom-input.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncomponents/custom-input.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n2 errors');
  });
});