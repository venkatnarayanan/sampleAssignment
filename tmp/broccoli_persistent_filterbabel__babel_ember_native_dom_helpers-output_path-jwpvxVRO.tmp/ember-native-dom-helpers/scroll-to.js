
import getElementWithAssert from './-private/get-element-with-assert';
import wait from 'ember-test-helpers/wait';

var rAF = window.requestAnimationFrame || function (cb) {
  setTimeout(cb, 17);
};

/*
  Triggers a paint (and therefore flushes any queued up scroll events).

  @method triggerFlushWithPromise
  @return {RSVP.Promise}
  @private
*/
function waitForScrollEvent() {
  var waitForEvent = new Ember.RSVP.Promise(function (resolve) {
    rAF(resolve);
  });
  return waitForEvent.then(function () {
    return wait();
  });
}

/*
  Scrolls DOM element or selector to the given coordinates (if the DOM element is currently overflowed).
  The promise resolves after the scroll event has been triggered.
  @method scrollTo
  @param {String|HTMLElement} selector
  @param {Number} x
  @param {Number} y
  @return {RSVP.Promise}
  @public
*/
export function scrollTo(selector, x, y) {
  var el = getElementWithAssert(selector);
  if (el instanceof HTMLElement) {
    el.scrollTop = y;
    el.scrollLeft = x;
  } else if (el instanceof Window) {
    el.scrollTo(x, y);
  }
  return waitForScrollEvent();
}