import settings from './settings';

/*
  The findAll test helper uses `querySelectorAll` to search inside the test
  DOM (based on app configuration for the rootElement).

  Alternatively, a second argument may be passed which is an element as the
  DOM context to search within.

  @method findAll
  @param {String} CSS selector to find elements in the test DOM
  @param {Element} context to query within, query from its contained DOM
  @return {Array} An array of zero or more HTMLElement objects
  @public
*/
export function findAll(selector, context) {
  var result = void 0;
  if (context instanceof Element) {
    result = context.querySelectorAll(selector);
  } else {
    result = document.querySelectorAll(settings.rootElement + ' ' + selector);
  }
  return toArray(result);
}

function toArray(nodelist) {
  var array = new Array(nodelist.length);
  for (var i = 0; i < nodelist.length; i++) {
    array[i] = nodelist[i];
  }
  return array;
}