define('ember-native-dom-helpers/trigger-event', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.triggerEvent = triggerEvent;

  /*
    @method triggerEvent
    @param {String|HTMLElement} selector
    @param {String} type
    @param {Object} options
    @return {RSVP.Promise}
    @public
  */

  function triggerEvent(selector, type, options) {
    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, type, options);
    });
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});