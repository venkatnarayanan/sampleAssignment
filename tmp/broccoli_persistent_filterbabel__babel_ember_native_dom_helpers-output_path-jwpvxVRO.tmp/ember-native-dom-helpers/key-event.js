
import { triggerEvent } from './trigger-event';

/**
 * @public
 * @param selector
 * @param type
 * @param keyCode
 * @param modifiers
 * @return {*}
 */
export function keyEvent(selector, type, keyCode) {
  var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };

  return triggerEvent(selector, type, Ember.merge({ keyCode: keyCode, which: keyCode, key: keyCode }, modifiers));
}