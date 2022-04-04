define('ember-native-dom-helpers/fill-in', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/-private/is-form-control', 'ember-native-dom-helpers/-private/is-content-editable', 'ember-native-dom-helpers/focus', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersPrivateIsFormControl, _emberNativeDomHelpersPrivateIsContentEditable, _emberNativeDomHelpersFocus, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.fillIn = fillIn;

  /*
    @method fillIn
    @param {String|HTMLElement} selector
    @param {String} text
    @return {RSVP.Promise}
    @public
  */

  function fillIn(selector, text) {
    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);

    if (!(0, _emberNativeDomHelpersPrivateIsFormControl['default'])(el) && !(0, _emberNativeDomHelpersPrivateIsContentEditable['default'])(el)) {
      throw new Error('Unable to fill element');
    }

    Ember.run(function () {
      return (0, _emberNativeDomHelpersFocus.focus)(el);
    });
    Ember.run(function () {
      if ((0, _emberNativeDomHelpersPrivateIsContentEditable['default'])(el)) {
        el.innerHTML = text;
      } else {
        el.value = text;
      }
    });
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'input');
    });
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'change');
    });
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});