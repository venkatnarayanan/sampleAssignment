
import getElementWithAssert from './-private/get-element-with-assert';
import { fireEvent } from './fire-event';
import wait from 'ember-test-helpers/wait';

/*
  @method selectFiles
  @param {String|HTMLElement} selector
  @param {Array} flies
  @return {RSVP.Promise}
  @public
*/
export function selectFiles(selector) {
  var files = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var element = getElementWithAssert(selector);

  (true && !(element.type === 'file') && Ember.assert('This is only used with file inputs.\n          Either change to a \'type="file"\' or use the \'triggerEvent\' helper.', element.type === 'file'));


  if (!Ember.isArray(files)) {
    files = [files];
  }

  (true && !(element.multiple || files.length <= 1) && Ember.assert('Can only handle multiple slection when an input is set to allow for multiple files.\n          Please add the property "multiple" to your file input.', element.multiple || files.length <= 1));


  Ember.run(function () {
    return fireEvent(element, 'change', files);
  });
  return (window.wait || wait)();
}