define('sample-project/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'ember', 'sample-project/tests/helpers/start-app', 'sample-project/tests/helpers/destroy-app'], function (exports, _qunit, _ember, _sampleProjectTestsHelpersStartApp, _sampleProjectTestsHelpersDestroyApp) {
  var Promise = _ember['default'].RSVP.Promise;

  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _sampleProjectTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },

      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return Promise.resolve(afterEach).then(function () {
          return (0, _sampleProjectTestsHelpersDestroyApp['default'])(_this.application);
        });
      }
    });
  };
});