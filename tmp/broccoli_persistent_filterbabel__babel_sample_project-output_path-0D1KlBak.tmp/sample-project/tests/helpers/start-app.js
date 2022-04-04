define('sample-project/tests/helpers/start-app', ['exports', 'ember', 'sample-project/app', 'sample-project/config/environment'], function (exports, _ember, _sampleProjectApp, _sampleProjectConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].merge({}, _sampleProjectConfigEnvironment['default'].APP);
    attributes = _ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    _ember['default'].run(function () {
      application = _sampleProjectApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});