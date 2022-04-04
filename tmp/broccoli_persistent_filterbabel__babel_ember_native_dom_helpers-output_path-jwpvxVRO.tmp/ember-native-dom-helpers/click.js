
import getElementWithAssert from './-private/get-element-with-assert';
import { fireEvent } from './fire-event';
import { focus } from './focus';
import wait from 'ember-test-helpers/wait';

/*
  @method clickEventSequence
  @private
*/
export function clickEventSequence(el, options) {
  Ember.run(function () {
    return fireEvent(el, 'mousedown', options);
  });
  focus(el);
  Ember.run(function () {
    return fireEvent(el, 'mouseup', options);
  });
  Ember.run(function () {
    return fireEvent(el, 'click', options);
  });
}

/*
  @method click
  @param {String|HTMLElement} selector
  @param {HTMLElement} context
  @param {Object} options
  @return {RSVP.Promise}
  @public
*/
export function click(selector, context, options) {
  var element = void 0;
  if (context instanceof HTMLElement) {
    element = getElementWithAssert(selector, context);
  } else {
    options = context || {};
    element = getElementWithAssert(selector);
  }
  clickEventSequence(element, options);
  return (window.wait || wait)();
}