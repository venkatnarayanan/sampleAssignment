define('ember-native-dom-helpers/visit', ['exports'], function (exports) {
  'use strict';

  exports.visit = visit;

  function visit() {
    var _window;

    if (!window.visit) {
      throw new Error('visit is only available during acceptance tests');
    }

    return (_window = window).visit.apply(_window, arguments);
  }
});