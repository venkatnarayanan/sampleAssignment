define('ember-native-dom-helpers/find-with-assert', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert) {
  'use strict';

  exports.findWithAssert = findWithAssert;

  /*
    @method findWithAssert
    @param {String} CSS selector to find elements in the test DOM
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return {Error|HTMLElement} element if found, or raises an error
    @public
  */

  function findWithAssert(selector, contextEl) {
    return (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector, contextEl);
  }
});