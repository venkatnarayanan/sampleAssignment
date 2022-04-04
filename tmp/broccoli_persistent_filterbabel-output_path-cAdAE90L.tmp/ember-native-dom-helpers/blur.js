define('ember-native-dom-helpers/blur', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/-private/is-focusable', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersPrivateIsFocusable, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.blur = blur;

  /*
    @method blur
    @param {String|HTMLElement} selector
    @return {RSVP.Promise}
    @public
  */

  function blur(selector) {
    if (!selector) {
      return;
    }

    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);

    if ((0, _emberNativeDomHelpersPrivateIsFocusable['default'])(el)) {
      Ember.run(null, function () {
        var browserIsNotFocused = document.hasFocus && !document.hasFocus();

        // makes `document.activeElement` be `body`.
        // If the browser is focused, it also fires a blur event
        el.blur();

        // Chrome/Firefox does not trigger the `blur` event if the window
        // does not have focus. If the document does not have focus then
        // fire `blur` event via native event.
        if (browserIsNotFocused) {
          (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'blur', { bubbles: false });
        }
      });
    }

    return (window.wait || _emberTestHelpersWait['default'])();
  }
});