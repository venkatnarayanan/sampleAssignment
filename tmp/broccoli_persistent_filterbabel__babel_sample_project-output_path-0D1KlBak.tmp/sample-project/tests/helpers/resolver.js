define('sample-project/tests/helpers/resolver', ['exports', 'sample-project/resolver', 'sample-project/config/environment'], function (exports, _sampleProjectResolver, _sampleProjectConfigEnvironment) {

  var resolver = _sampleProjectResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _sampleProjectConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _sampleProjectConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});