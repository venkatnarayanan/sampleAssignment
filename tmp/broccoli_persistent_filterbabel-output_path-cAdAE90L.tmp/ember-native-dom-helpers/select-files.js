define('ember-native-dom-helpers/select-files', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.selectFiles = selectFiles;

  /*
    @method selectFiles
    @param {String|HTMLElement} selector
    @param {Array} flies
    @return {RSVP.Promise}
    @public
  */

  function selectFiles(selector) {
    var files = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var element = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);

    true && !(element.type === 'file') && Ember.assert('This is only used with file inputs.\n          Either change to a \'type="file"\' or use the \'triggerEvent\' helper.', element.type === 'file');

    if (!Ember.isArray(files)) {
      files = [files];
    }

    true && !(element.multiple || files.length <= 1) && Ember.assert('Can only handle multiple slection when an input is set to allow for multiple files.\n          Please add the property "multiple" to your file input.', element.multiple || files.length <= 1);

    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(element, 'change', files);
    });
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});