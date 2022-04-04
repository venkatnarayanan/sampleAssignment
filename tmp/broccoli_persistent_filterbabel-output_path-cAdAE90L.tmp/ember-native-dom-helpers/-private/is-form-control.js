define('ember-native-dom-helpers/-private/is-form-control', ['exports'], function (exports) {
  'use strict';

  exports['default'] = isFormControl;

  function isFormControl(el) {
    var formControlTags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
    var tagName = el.tagName,
        type = el.type;

    if (type === 'hidden') {
      return false;
    }

    return formControlTags.indexOf(tagName) > -1;
  }
});