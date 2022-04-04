define('ember-native-dom-helpers/tap', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-native-dom-helpers/click', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersFireEvent, _emberNativeDomHelpersClick, _emberTestHelpersWait) {
  'use strict';

  exports.tap = tap;

  /*
    @method tap
    @param {String|HTMLElement} selector
    @param {Object} options
    @return {RSVP.Promise}
    @public
  */

  function tap(selector) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);
    var touchstartEv = void 0,
        touchendEv = void 0;
    Ember.run(function () {
      return touchstartEv = (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'touchstart', options);
    });
    Ember.run(function () {
      return touchendEv = (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'touchend', options);
    });
    if (!touchstartEv.defaultPrevented && !touchendEv.defaultPrevented) {
      (0, _emberNativeDomHelpersClick.clickEventSequence)(el);
    }
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});