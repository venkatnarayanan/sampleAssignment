import Ember from 'ember';
import ActiveModelAdapter from 'active-model-adapter';

export default ActiveModelAdapter.extend({
  shouldReloadAll(store, snapshotsArray) {
    return false;
  },

  shouldBackgroundReloadAll(store, snapshotsArray) {
    return true;
  }
});