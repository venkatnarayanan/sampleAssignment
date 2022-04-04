define("ember-basic-dropdown/utils/computed-fallback-if-undefined", ["exports"], function (exports) {
  "use strict";

  exports["default"] = computedFallbackIfUndefined;

  function computedFallbackIfUndefined(fallback) {
    return Ember.computed({
      get: function get() {
        return fallback;
      },
      set: function set(_, v) {
        return v === undefined ? fallback : v;
      }
    });
  }
});