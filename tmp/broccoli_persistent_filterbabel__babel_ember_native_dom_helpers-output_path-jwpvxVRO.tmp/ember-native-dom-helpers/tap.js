
import getElementWithAssert from './-private/get-element-with-assert';
import { fireEvent } from './fire-event';
import { clickEventSequence } from './click';
import wait from 'ember-test-helpers/wait';

/*
  @method tap
  @param {String|HTMLElement} selector
  @param {Object} options
  @return {RSVP.Promise}
  @public
*/
export function tap(selector) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var el = getElementWithAssert(selector);
  var touchstartEv = void 0,
      touchendEv = void 0;
  Ember.run(function () {
    return touchstartEv = fireEvent(el, 'touchstart', options);
  });
  Ember.run(function () {
    return touchendEv = fireEvent(el, 'touchend', options);
  });
  if (!touchstartEv.defaultPrevented && !touchendEv.defaultPrevented) {
    clickEventSequence(el);
  }
  return (window.wait || wait)();
}