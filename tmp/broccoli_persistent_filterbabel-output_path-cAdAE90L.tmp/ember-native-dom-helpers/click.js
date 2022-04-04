define('ember-native-dom-helpers/click', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-native-dom-helpers/focus', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersFireEvent, _emberNativeDomHelpersFocus, _emberTestHelpersWait) {
  'use strict';

  exports.clickEventSequence = clickEventSequence;
  exports.click = click;

  /*
    @method clickEventSequence
    @private
  */

  function clickEventSequence(el, options) {
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'mousedown', options);
    });
    (0, _emberNativeDomHelpersFocus.focus)(el);
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'mouseup', options);
    });
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'click', options);
    });
  }

  /*
    @method click
    @param {String|HTMLElement} selector
    @param {HTMLElement} context
    @param {Object} options
    @return {RSVP.Promise}
    @public
  */

  function click(selector, context, options) {
    var element = void 0;
    if (context instanceof HTMLElement) {
      element = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector, context);
    } else {
      options = context || {};
      element = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);
    }
    clickEventSequence(element, options);
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});