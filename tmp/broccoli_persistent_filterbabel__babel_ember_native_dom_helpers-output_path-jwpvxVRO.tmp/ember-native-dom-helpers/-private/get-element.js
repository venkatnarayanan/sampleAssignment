import settings from '../settings';

/*
  @method getElement
  @param {String|HTMLElement} selectorOrElement
  @param {HTMLElement} contextEl to query within, query from its contained DOM
  @return HTMLElement
  @private
*/
export default function getElement() {
  var selectorOrElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var contextEl = arguments[1];

  if (selectorOrElement instanceof Window || selectorOrElement instanceof Document || selectorOrElement instanceof HTMLElement || selectorOrElement instanceof SVGElement) {
    return selectorOrElement;
  }
  var result = void 0;
  if (contextEl instanceof HTMLElement) {
    result = contextEl.querySelector(selectorOrElement);
  } else {
    result = document.querySelector(settings.rootElement + ' ' + selectorOrElement);
  }
  return result;
}