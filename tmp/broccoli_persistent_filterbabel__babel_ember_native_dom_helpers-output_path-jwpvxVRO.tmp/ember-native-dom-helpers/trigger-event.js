
import getElementWithAssert from './-private/get-element-with-assert';
import { fireEvent } from './fire-event';
import wait from 'ember-test-helpers/wait';

/*
  @method triggerEvent
  @param {String|HTMLElement} selector
  @param {String} type
  @param {Object} options
  @return {RSVP.Promise}
  @public
*/
export function triggerEvent(selector, type, options) {
  var el = getElementWithAssert(selector);
  Ember.run(function () {
    return fireEvent(el, type, options);
  });
  return (window.wait || wait)();
}