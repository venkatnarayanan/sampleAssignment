define('sample-project/tests/test-helper', ['exports', 'sample-project/tests/helpers/resolver', 'ember-qunit'], function (exports, _sampleProjectTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_sampleProjectTestsHelpersResolver['default']);
});