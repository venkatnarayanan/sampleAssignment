export function visit() {
  var _window;

  if (!window.visit) {
    throw new Error('visit is only available during acceptance tests');
  }

  return (_window = window).visit.apply(_window, arguments);
}