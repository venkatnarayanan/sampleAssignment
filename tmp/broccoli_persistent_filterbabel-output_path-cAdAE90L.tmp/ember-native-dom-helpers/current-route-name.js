define('ember-native-dom-helpers/current-route-name', ['exports'], function (exports) {
  'use strict';

  exports.currentRouteName = currentRouteName;

  function currentRouteName() {
    var _window;

    if (!window.currentRouteName) {
      throw new Error('currentRouteName is only available during acceptance tests');
    }

    return (_window = window).currentRouteName.apply(_window, arguments);
  }
});