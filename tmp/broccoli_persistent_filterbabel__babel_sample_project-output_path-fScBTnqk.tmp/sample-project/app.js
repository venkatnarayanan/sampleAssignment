define('sample-project/app', ['exports', 'ember', 'sample-project/resolver', 'ember-load-initializers', 'sample-project/config/environment'], function (exports, _ember, _sampleProjectResolver, _emberLoadInitializers, _sampleProjectConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _sampleProjectConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _sampleProjectConfigEnvironment['default'].podModulePrefix,
    Resolver: _sampleProjectResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _sampleProjectConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});