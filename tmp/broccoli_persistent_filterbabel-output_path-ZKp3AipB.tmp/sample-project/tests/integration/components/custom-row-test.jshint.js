define('sample-project/tests/integration/components/custom-row-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | integration/components/custom-row-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/custom-row-test.js should pass jshint.');
  });
});