define('sample-project/router', ['exports', 'ember', 'sample-project/config/environment'], function (exports, _ember, _sampleProjectConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _sampleProjectConfigEnvironment['default'].locationType,
    rootURL: _sampleProjectConfigEnvironment['default'].rootURL
  });

  Router.map(function () {});

  exports['default'] = Router;
});