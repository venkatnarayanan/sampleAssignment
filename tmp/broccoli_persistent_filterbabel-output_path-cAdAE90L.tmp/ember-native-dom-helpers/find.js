define('ember-native-dom-helpers/find', ['exports', 'ember-native-dom-helpers/-private/get-element'], function (exports, _emberNativeDomHelpersPrivateGetElement) {
  'use strict';

  exports.find = find;

  /*
    The find test helper uses `querySelector` to search inside the test
    DOM (based on app configuration for the rootElement).
  
    Alternalively, a second argument may be passed which is an element as the
    DOM context to search within.
  
    @method find
    @param {String} CSS selector to find one or more elements in the test DOM
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return {null|HTMLElement} null or an element
    @public
  */

  function find(selector, contextEl) {
    return (0, _emberNativeDomHelpersPrivateGetElement['default'])(selector, contextEl);
  }
});