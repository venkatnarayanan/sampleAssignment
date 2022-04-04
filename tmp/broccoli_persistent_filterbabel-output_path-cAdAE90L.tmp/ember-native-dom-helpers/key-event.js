define('ember-native-dom-helpers/key-event', ['exports', 'ember-native-dom-helpers/trigger-event'], function (exports, _emberNativeDomHelpersTriggerEvent) {
  'use strict';

  exports.keyEvent = keyEvent;

  /**
   * @public
   * @param selector
   * @param type
   * @param keyCode
   * @param modifiers
   * @return {*}
   */

  function keyEvent(selector, type, keyCode) {
    var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };

    return (0, _emberNativeDomHelpersTriggerEvent.triggerEvent)(selector, type, Ember.merge({ keyCode: keyCode, which: keyCode, key: keyCode }, modifiers));
  }
});