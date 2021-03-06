define('ember-native-dom-helpers/fire-event', ['exports'], function (exports) {
  'use strict';

  exports.fireEvent = fireEvent;

  var DEFAULT_EVENT_OPTIONS = { bubbles: true, cancelable: true };
  var KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'];
  var MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];
  var FILE_SELECTION_EVENT_TYPES = ['change'];

  /*
    @method fireEvent
    @param {HTMLElement} element
    @param {String} type
    @param {Object} (optional) options
    @return {Event} The dispatched event
    @private
  */

  function fireEvent(element, type) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!element) {
      return;
    }
    var event = void 0;
    if (KEYBOARD_EVENT_TYPES.indexOf(type) > -1) {
      event = buildKeyboardEvent(type, options);
    } else if (MOUSE_EVENT_TYPES.indexOf(type) > -1) {
      var rect = void 0;
      if (element instanceof Window) {
        rect = element.document.documentElement.getBoundingClientRect();
      } else if (element instanceof Document) {
        rect = element.documentElement.getBoundingClientRect();
      } else if (element instanceof HTMLElement || element instanceof SVGElement) {
        rect = element.getBoundingClientRect();
      } else {
        return;
      }
      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5, // Those numbers don't really mean anything.
        screenY: y + 95, // They're just to make the screenX/Y be different of clientX/Y..
        clientX: x,
        clientY: y
      };
      event = buildMouseEvent(type, Ember.merge(simulatedCoordinates, options));
    } else if (FILE_SELECTION_EVENT_TYPES.indexOf(type) > -1 && element.files) {
      event = buildFileEvent(type, element, options);
    } else {
      event = buildBasicEvent(type, options);
    }
    element.dispatchEvent(event);
    return event;
  }

  /*
    @method buildBasicEvent
    @param {String} type
    @param {Object} (optional) options
    @return {Event}
    @private
  */
  function buildBasicEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var event = document.createEvent('Events');

    var bubbles = options.bubbles !== undefined ? options.bubbles : true;
    var cancelable = options.cancelable !== undefined ? options.cancelable : true;

    delete options.bubbles;
    delete options.cancelable;

    // bubbles and cancelable are readonly, so they can be
    // set when initializing event
    event.initEvent(type, bubbles, cancelable);
    Ember.merge(event, options);
    return event;
  }

  /*
    @method buildMouseEvent
    @param {String} type
    @param {Object} (optional) options
    @return {Event}
    @private
  */
  function buildMouseEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var event = void 0;
    try {
      event = document.createEvent('MouseEvents');
      var eventOpts = Ember.merge(Ember.merge({}, DEFAULT_EVENT_OPTIONS), options);
      event.initMouseEvent(type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }

  /*
    @method buildKeyboardEvent
    @param {String} type
    @param {Object} (optional) options
    @return {Event}
    @private
  */
  function buildKeyboardEvent(type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var eventOpts = Ember.merge(Ember.merge({}, DEFAULT_EVENT_OPTIONS), options);
    var event = void 0,
        eventMethodName = void 0;

    try {
      event = new KeyboardEvent(type, eventOpts);

      // Property definitions are required for B/C for keyboard event usage
      // If this properties are not defined, when listening for key events
      // keyCode/which will be 0. Also, keyCode and which now are string
      // and if app compare it with === with integer key definitions,
      // there will be a fail.
      //
      // https://w3c.github.io/uievents/#interface-keyboardevent
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
      Object.defineProperty(event, 'keyCode', {
        get: function get() {
          return parseInt(this.key);
        }
      });

      Object.defineProperty(event, 'which', {
        get: function get() {
          return parseInt(this.key);
        }
      });

      return event;
    } catch (e) {
      // left intentionally blank
    }

    try {
      event = document.createEvent('KeyboardEvents');
      eventMethodName = 'initKeyboardEvent';
    } catch (e) {
      // left intentionally blank
    }

    if (!event) {
      try {
        event = document.createEvent('KeyEvents');
        eventMethodName = 'initKeyEvent';
      } catch (e) {
        // left intentionally blank
      }
    }

    if (event) {
      event[eventMethodName](type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } else {
      event = buildBasicEvent(type, options);
    }

    return event;
  }

  /*
    @method buildFileEvent
    @param {String} type
    @param {Array} array of flies
    @param {HTMLElement} element
    @return {Event}
    @private
  */
  function buildFileEvent(type, element) {
    var files = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var event = buildBasicEvent(type);

    if (files.length > 0) {
      Object.defineProperty(files, 'item', {
        value: function value(index) {
          return typeof index === 'number' ? this[index] : null;
        }
      });
      Object.defineProperty(element, 'files', {
        value: files
      });
    }

    Object.defineProperty(event, 'target', {
      value: element
    });

    return event;
  }
});