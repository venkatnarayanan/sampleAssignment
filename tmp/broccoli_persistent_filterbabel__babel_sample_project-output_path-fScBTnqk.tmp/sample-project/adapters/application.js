define('sample-project/adapters/application', ['exports', 'ember', 'active-model-adapter'], function (exports, _ember, _activeModelAdapter) {
  exports['default'] = _activeModelAdapter['default'].extend({
    shouldReloadAll: function shouldReloadAll(store, snapshotsArray) {
      return false;
    },

    shouldBackgroundReloadAll: function shouldBackgroundReloadAll(store, snapshotsArray) {
      return true;
    }
  });
});