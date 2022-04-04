define('ember-native-dom-helpers/wait-for', ['exports', 'ember-native-dom-helpers/wait-until', 'ember-native-dom-helpers/find', 'ember-native-dom-helpers/find-all'], function (exports, _emberNativeDomHelpersWaitUntil, _emberNativeDomHelpersFind, _emberNativeDomHelpersFindAll) {
  'use strict';

  exports.waitFor = waitFor;

  function waitFor(selector) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === undefined ? 1000 : _ref$timeout,
        _ref$count = _ref.count,
        count = _ref$count === undefined ? null : _ref$count;

    var callback = void 0;
    if (count) {
      callback = function callback() {
        var elements = (0, _emberNativeDomHelpersFindAll.findAll)(selector);
        if (elements.length === count) {
          return elements;
        }
      };
    } else {
      callback = function callback() {
        return (0, _emberNativeDomHelpersFind.find)(selector);
      };
    }
    return (0, _emberNativeDomHelpersWaitUntil.waitUntil)(callback, { timeout: timeout });
  }
});