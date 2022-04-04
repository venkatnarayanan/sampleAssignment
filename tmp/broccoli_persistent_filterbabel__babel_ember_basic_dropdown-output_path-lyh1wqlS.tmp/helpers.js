
import { click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';

export function nativeTap(selector) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var touchStartEvent = new window.Event('touchstart', { bubbles: true, cancelable: true, view: window });
  Object.keys(options).forEach(function (key) {
    return touchStartEvent[key] = options[key];
  });
  Ember.run(function () {
    return document.querySelector(selector).dispatchEvent(touchStartEvent);
  });
  var touchEndEvent = new window.Event('touchend', { bubbles: true, cancelable: true, view: window });
  Object.keys(options).forEach(function (key) {
    return touchEndEvent[key] = options[key];
  });
  Ember.run(function () {
    return document.querySelector(selector).dispatchEvent(touchEndEvent);
  });
}

export function clickTrigger(scope) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var selector = '.ember-basic-dropdown-trigger';
  if (scope) {
    var element = document.querySelector(scope);
    if (element.classList.contains('ember-basic-dropdown-trigger')) {
      selector = scope;
    } else {
      selector = scope + ' ' + selector;
    }
  }
  click(selector, options);
  return wait();
}

export function tapTrigger(scope) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var selector = '.ember-basic-dropdown-trigger';
  if (scope) {
    selector = scope + ' ' + selector;
  }
  nativeTap(selector, options);
}

export function fireKeydown(selector, k) {
  var oEvent = document.createEvent('Events');
  oEvent.initEvent('keydown', true, true);
  Ember.merge(oEvent, {
    view: window,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    keyCode: k,
    charCode: k
  });
  Ember.run(function () {
    return document.querySelector(selector).dispatchEvent(oEvent);
  });
}

// acceptance helpers
export default function () {
  Ember.Test.registerAsyncHelper('clickDropdown', function (app, cssPath) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    clickTrigger(cssPath, options);
  });

  Ember.Test.registerAsyncHelper('tapDropdown', function (app, cssPath) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    tapTrigger(cssPath, options);
  });
}