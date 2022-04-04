define('ember-native-dom-helpers/focus', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/-private/is-focusable', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersPrivateIsFocusable, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.focus = focus;

  /*
    @method focus
    @param {String|HTMLElement} selector
    @return {RSVP.Promise}
    @public
  */

  function focus(selector) {
    if (!selector) {
      return;
    }

    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);

    if ((0, _emberNativeDomHelpersPrivateIsFocusable['default'])(el)) {
      Ember.run(null, function () {
        var browserIsNotFocused = document.hasFocus && !document.hasFocus();

        // Firefox does not trigger the `focusin` event if the window
        // does not have focus. If the document does not have focus then
        // fire `focusin` event as well.
        if (browserIsNotFocused) {
          (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'focusin', {
            bubbles: false
          });
        }

        // makes `document.activeElement` be `el`. If the browser is focused, it also fires a focus event
        el.focus();

        // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
        if (browserIsNotFocused) {
          (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'focus', {
            bubbles: false
          });
        }
      });
    }

    return (window.wait || _emberTestHelpersWait['default'])();
  }
});