export function currentRouteName() {
  var _window;

  if (!window.currentRouteName) {
    throw new Error('currentRouteName is only available during acceptance tests');
  }

  return (_window = window).currentRouteName.apply(_window, arguments);
}