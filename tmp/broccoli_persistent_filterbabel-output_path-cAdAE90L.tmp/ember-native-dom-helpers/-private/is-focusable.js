define('ember-native-dom-helpers/-private/is-focusable', ['exports', 'ember-native-dom-helpers/-private/is-form-control', 'ember-native-dom-helpers/-private/is-content-editable'], function (exports, _emberNativeDomHelpersPrivateIsFormControl, _emberNativeDomHelpersPrivateIsContentEditable) {
  'use strict';

  exports['default'] = isFocusable;

  function isFocusable(el) {
    var focusableTags = ['LINK', 'A'];

    if ((0, _emberNativeDomHelpersPrivateIsFormControl['default'])(el) || (0, _emberNativeDomHelpersPrivateIsContentEditable['default'])(el) || focusableTags.indexOf(el.tagName) > -1) {
      return true;
    }

    return el.hasAttribute('tabindex');
  }
});