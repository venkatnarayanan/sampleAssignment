define('ember-native-dom-helpers/-private/is-content-editable', ['exports'], function (exports) {
  'use strict';

  exports['default'] = isContentEditable;

  function isContentEditable(el) {
    return el.contentEditable === 'true';
  }
});