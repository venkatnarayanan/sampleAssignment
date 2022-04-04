define('sample-project/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'sample-project/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _sampleProjectConfigEnvironment) {
  var _config$APP = _sampleProjectConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});