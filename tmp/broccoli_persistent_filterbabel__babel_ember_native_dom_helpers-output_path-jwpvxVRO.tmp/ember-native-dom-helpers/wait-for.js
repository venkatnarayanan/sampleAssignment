import { waitUntil } from './wait-until';
import { find } from './find';
import { findAll } from './find-all';

export function waitFor(selector) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === undefined ? 1000 : _ref$timeout,
      _ref$count = _ref.count,
      count = _ref$count === undefined ? null : _ref$count;

  var callback = void 0;
  if (count) {
    callback = function callback() {
      var elements = findAll(selector);
      if (elements.length === count) {
        return elements;
      }
    };
  } else {
    callback = function callback() {
      return find(selector);
    };
  }
  return waitUntil(callback, { timeout: timeout });
}