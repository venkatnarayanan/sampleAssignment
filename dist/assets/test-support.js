/* jshint ignore:start */



/* jshint ignore:end */

;(function() {
/*!
 * @overview  Ember - JavaScript Application Framework
 * @copyright Copyright 2011-2016 Tilde Inc. and contributors
 *            Portions Copyright 2006-2011 Strobe Inc.
 *            Portions Copyright 2008-2011 Apple Inc. All rights reserved.
 * @license   Licensed under MIT license
 *            See https://raw.github.com/emberjs/ember.js/master/LICENSE
 * @version   2.9.1
 */

var enifed, requireModule, require, Ember;
var mainContext = this;

(function() {
  var isNode = typeof window === 'undefined' &&
    typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  if (!isNode) {
    Ember = this.Ember = this.Ember || {};
  }

  if (typeof Ember === 'undefined') { Ember = {}; }

  if (typeof Ember.__loader === 'undefined') {
    var registry = {};
    var seen = {};

    enifed = function(name, deps, callback) {
      var value = { };

      if (!callback) {
        value.deps = [];
        value.callback = deps;
      } else {
        value.deps = deps;
        value.callback = callback;
      }

      registry[name] = value;
    };

    require = requireModule = function(name) {
      return internalRequire(name, null);
    };

    // setup `require` module
    require['default'] = require;

    require.has = function registryHas(moduleName) {
      return !!registry[moduleName] || !!registry[moduleName + '/index'];
    };

    function missingModule(name, referrerName) {
      if (referrerName) {
        throw new Error('Could not find module ' + name + ' required by: ' + referrerName);
      } else {
        throw new Error('Could not find module ' + name);
      }
    }

    function internalRequire(_name, referrerName) {
      var name = _name;
      var mod = registry[name];

      if (!mod) {
        name = name + '/index';
        mod = registry[name];
      }

      var exports = seen[name];

      if (exports !== undefined) {
        return exports;
      }

      exports = seen[name] = {};

      if (!mod) {
        missingModule(_name, referrerName);
      }

      var deps = mod.deps;
      var callback = mod.callback;
      var reified = new Array(deps.length);

      for (var i = 0; i < deps.length; i++) {
        if (deps[i] === 'exports') {
          reified[i] = exports;
        } else if (deps[i] === 'require') {
          reified[i] = require;
        } else {
          reified[i] = internalRequire(deps[i], name);
        }
      }

      callback.apply(this, reified);

      return exports;
    }

    requireModule._eak_seen = registry;

    Ember.__loader = {
      define: enifed,
      require: require,
      registry: registry
    };
  } else {
    enifed = Ember.__loader.define;
    require = requireModule = Ember.__loader.require;
  }
})();

enifed('ember-debug/deprecate', ['exports', 'ember-metal/error', 'ember-console', 'ember-environment', 'ember-debug/handlers'], function (exports, _emberMetalError, _emberConsole, _emberEnvironment, _emberDebugHandlers) {
  /*global __fail__*/

  'use strict';

  var _slice = Array.prototype.slice;
  exports.registerHandler = registerHandler;
  exports.default = deprecate;

  function registerHandler(handler) {
    _emberDebugHandlers.registerHandler('deprecate', handler);
  }

  function formatMessage(_message, options) {
    var message = _message;

    if (options && options.id) {
      message = message + (' [deprecation id: ' + options.id + ']');
    }

    if (options && options.url) {
      message += ' See ' + options.url + ' for more details.';
    }

    return message;
  }

  registerHandler(function logDeprecationToConsole(message, options) {
    var updatedMessage = formatMessage(message, options);

    _emberConsole.default.warn('DEPRECATION: ' + updatedMessage);
  });

  var captureErrorForStack = undefined;

  if (new Error().stack) {
    captureErrorForStack = function () {
      return new Error();
    };
  } else {
    captureErrorForStack = function () {
      try {
        __fail__.fail();
      } catch (e) {
        return e;
      }
    };
  }

  registerHandler(function logDeprecationStackTrace(message, options, next) {
    if (_emberEnvironment.ENV.LOG_STACKTRACE_ON_DEPRECATION) {
      var stackStr = '';
      var error = captureErrorForStack();
      var stack = undefined;

      if (error.stack) {
        if (error['arguments']) {
          // Chrome
          stack = error.stack.replace(/^\s+at\s+/gm, '').replace(/^([^\(]+?)([\n$])/gm, '{anonymous}($1)$2').replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}($1)').split('\n');
          stack.shift();
        } else {
          // Firefox
          stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
        }

        stackStr = '\n    ' + stack.slice(2).join('\n    ');
      }

      var updatedMessage = formatMessage(message, options);

      _emberConsole.default.warn('DEPRECATION: ' + updatedMessage + stackStr);
    } else {
      next.apply(undefined, arguments);
    }
  });

  registerHandler(function raiseOnDeprecation(message, options, next) {
    if (_emberEnvironment.ENV.RAISE_ON_DEPRECATION) {
      var updatedMessage = formatMessage(message);

      throw new _emberMetalError.default(updatedMessage);
    } else {
      next.apply(undefined, arguments);
    }
  });

  var missingOptionsDeprecation = 'When calling `Ember.deprecate` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include `id` and `until` properties.';
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation = 'When calling `Ember.deprecate` you must provide `id` in options.';
  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  var missingOptionsUntilDeprecation = 'When calling `Ember.deprecate` you must provide `until` in options.';

  exports.missingOptionsUntilDeprecation = missingOptionsUntilDeprecation;
  /**
  @module ember
  @submodule ember-debug
  */

  /**
    Display a deprecation warning with the provided message and a stack trace
    (Chrome and Firefox only).
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method deprecate
    @param {String} message A description of the deprecation.
    @param {Boolean} test A boolean. If falsy, the deprecation will be displayed.
    @param {Object} options
    @param {String} options.id A unique id for this deprecation. The id can be
      used by Ember debugging tools to change the behavior (raise, log or silence)
      for that specific deprecation. The id should be namespaced by dots, e.g.
      "view.helper.select".
    @param {string} options.until The version of Ember when this deprecation
      warning will be removed.
    @param {String} [options.url] An optional url to the transition guide on the
      emberjs.com website.
    @for Ember
    @public
  */

  function deprecate(message, test, options) {
    if (!options || !options.id && !options.until) {
      deprecate(missingOptionsDeprecation, false, {
        id: 'ember-debug.deprecate-options-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.id) {
      deprecate(missingOptionsIdDeprecation, false, {
        id: 'ember-debug.deprecate-id-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.until) {
      deprecate(missingOptionsUntilDeprecation, options && options.until, {
        id: 'ember-debug.deprecate-until-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    _emberDebugHandlers.invoke.apply(undefined, ['deprecate'].concat(_slice.call(arguments)));
  }
});
enifed("ember-debug/handlers", ["exports"], function (exports) {
  "use strict";

  exports.registerHandler = registerHandler;
  exports.invoke = invoke;
  var HANDLERS = {};

  exports.HANDLERS = HANDLERS;

  function registerHandler(type, callback) {
    var nextHandler = HANDLERS[type] || function () {};

    HANDLERS[type] = function (message, options) {
      callback(message, options, nextHandler);
    };
  }

  function invoke(type, message, test, options) {
    if (test) {
      return;
    }

    var handlerForType = HANDLERS[type];

    if (!handlerForType) {
      return;
    }

    if (handlerForType) {
      handlerForType(message, options);
    }
  }
});
enifed('ember-debug/index', ['exports', 'ember-metal/core', 'ember-environment', 'ember-metal/testing', 'ember-metal/debug', 'ember-metal/features', 'ember-metal/error', 'ember-console', 'ember-debug/deprecate', 'ember-debug/warn'], function (exports, _emberMetalCore, _emberEnvironment, _emberMetalTesting, _emberMetalDebug, _emberMetalFeatures, _emberMetalError, _emberConsole, _emberDebugDeprecate, _emberDebugWarn) {
  'use strict';

  exports._warnIfUsingStrippedFeatureFlags = _warnIfUsingStrippedFeatureFlags;

  /**
  @module ember
  @submodule ember-debug
  */

  /**
  @class Ember
  @public
  */

  /**
    Define an assertion that will throw an exception if the condition is not met.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    // Test for truthiness
    Ember.assert('Must pass a valid object', obj);
  
    // Fail unconditionally
    Ember.assert('This code path should never be run');
    ```
  
    @method assert
    @param {String} desc A description of the assertion. This will become
      the text of the Error thrown if the assertion fails.
    @param {Boolean} test Must be truthy for the assertion to pass. If
      falsy, an exception will be thrown.
    @public
  */
  _emberMetalDebug.setDebugFunction('assert', function assert(desc, test) {
    if (!test) {
      throw new _emberMetalError.default('Assertion Failed: ' + desc);
    }
  });

  /**
    Display a debug notice.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    Ember.debug('I\'m a debug notice!');
    ```
  
    @method debug
    @param {String} message A debug message to display.
    @public
  */
  _emberMetalDebug.setDebugFunction('debug', function debug(message) {
    _emberConsole.default.debug('DEBUG: ' + message);
  });

  /**
    Display an info notice.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method info
    @private
  */
  _emberMetalDebug.setDebugFunction('info', function info() {
    _emberConsole.default.info.apply(undefined, arguments);
  });

  /**
    Alias an old, deprecated method with its new counterpart.
  
    Display a deprecation warning with the provided message and a stack trace
    (Chrome and Firefox only) when the assigned method is called.
  
    * In a production build, this method is defined as an empty function (NOP).
  
    ```javascript
    Ember.oldMethod = Ember.deprecateFunc('Please use the new, updated method', Ember.newMethod);
    ```
  
    @method deprecateFunc
    @param {String} message A description of the deprecation.
    @param {Object} [options] The options object for Ember.deprecate.
    @param {Function} func The new function called to replace its deprecated counterpart.
    @return {Function} A new function that wraps the original function with a deprecation warning
    @private
  */
  _emberMetalDebug.setDebugFunction('deprecateFunc', function deprecateFunc() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 3) {
      var _ret = (function () {
        var message = args[0];
        var options = args[1];
        var func = args[2];

        return {
          v: function () {
            _emberMetalDebug.deprecate(message, false, options);
            return func.apply(this, arguments);
          }
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    } else {
      var _ret2 = (function () {
        var message = args[0];
        var func = args[1];

        return {
          v: function () {
            _emberMetalDebug.deprecate(message);
            return func.apply(this, arguments);
          }
        };
      })();

      if (typeof _ret2 === 'object') return _ret2.v;
    }
  });

  /**
    Run a function meant for debugging.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    Ember.runInDebug(() => {
      Ember.Component.reopen({
        didInsertElement() {
          console.log("I'm happy");
        }
      });
    });
    ```
  
    @method runInDebug
    @param {Function} func The function to be executed.
    @since 1.5.0
    @public
  */
  _emberMetalDebug.setDebugFunction('runInDebug', function runInDebug(func) {
    func();
  });

  _emberMetalDebug.setDebugFunction('debugSeal', function debugSeal(obj) {
    Object.seal(obj);
  });

  _emberMetalDebug.setDebugFunction('deprecate', _emberDebugDeprecate.default);

  _emberMetalDebug.setDebugFunction('warn', _emberDebugWarn.default);

  /**
    Will call `Ember.warn()` if ENABLE_OPTIONAL_FEATURES or
    any specific FEATURES flag is truthy.
  
    This method is called automatically in debug canary builds.
  
    @private
    @method _warnIfUsingStrippedFeatureFlags
    @return {void}
  */

  function _warnIfUsingStrippedFeatureFlags(FEATURES, knownFeatures, featuresWereStripped) {
    if (featuresWereStripped) {
      _emberMetalDebug.warn('Ember.ENV.ENABLE_OPTIONAL_FEATURES is only available in canary builds.', !_emberEnvironment.ENV.ENABLE_OPTIONAL_FEATURES, { id: 'ember-debug.feature-flag-with-features-stripped' });

      var keys = Object.keys(FEATURES || {});
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === 'isEnabled' || !(key in knownFeatures)) {
          continue;
        }

        _emberMetalDebug.warn('FEATURE["' + key + '"] is set as enabled, but FEATURE flags are only available in canary builds.', !FEATURES[key], { id: 'ember-debug.feature-flag-with-features-stripped' });
      }
    }
  }

  if (!_emberMetalTesting.isTesting()) {
    (function () {
      // Complain if they're using FEATURE flags in builds other than canary
      _emberMetalFeatures.FEATURES['features-stripped-test'] = true;
      var featuresWereStripped = true;

      if (false) {
        featuresWereStripped = false;
      }

      delete _emberMetalFeatures.FEATURES['features-stripped-test'];
      _warnIfUsingStrippedFeatureFlags(_emberEnvironment.ENV.FEATURES, _emberMetalFeatures.DEFAULT_FEATURES, featuresWereStripped);

      // Inform the developer about the Ember Inspector if not installed.
      var isFirefox = _emberEnvironment.environment.isFirefox;
      var isChrome = _emberEnvironment.environment.isChrome;

      if (typeof window !== 'undefined' && (isFirefox || isChrome) && window.addEventListener) {
        window.addEventListener('load', function () {
          if (document.documentElement && document.documentElement.dataset && !document.documentElement.dataset.emberExtension) {
            var downloadURL;

            if (isChrome) {
              downloadURL = 'https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi';
            } else if (isFirefox) {
              downloadURL = 'https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/';
            }

            _emberMetalDebug.debug('For more advanced debugging, install the Ember Inspector from ' + downloadURL);
          }
        }, false);
      }
    })();
  }
  /**
    @public
    @class Ember.Debug
  */
  _emberMetalCore.default.Debug = {};

  /**
    Allows for runtime registration of handler functions that override the default deprecation behavior.
    Deprecations are invoked by calls to [Ember.deprecate](http://emberjs.com/api/classes/Ember.html#method_deprecate).
    The following example demonstrates its usage by registering a handler that throws an error if the
    message contains the word "should", otherwise defers to the default handler.
  
    ```javascript
    Ember.Debug.registerDeprecationHandler((message, options, next) => {
      if (message.indexOf('should') !== -1) {
        throw new Error(`Deprecation message with should: ${message}`);
      } else {
        // defer to whatever handler was registered before this one
        next(message, options);
      }
    }
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the deprecation call.</li>
      <li> <code>options</code> - An object passed in with the deprecation call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the deprecation in the form of <code>package-name.specific-deprecation</code>.</li>
          <li> <code>until</code> - The Ember version number the feature and deprecation will be removed in.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerDeprecationHandler
    @param handler {Function} A function to handle deprecation calls.
    @since 2.1.0
  */
  _emberMetalCore.default.Debug.registerDeprecationHandler = _emberDebugDeprecate.registerHandler;
  /**
    Allows for runtime registration of handler functions that override the default warning behavior.
    Warnings are invoked by calls made to [Ember.warn](http://emberjs.com/api/classes/Ember.html#method_warn).
    The following example demonstrates its usage by registering a handler that does nothing overriding Ember's
    default warning behavior.
  
    ```javascript
    // next is not called, so no warnings get the default behavior
    Ember.Debug.registerWarnHandler(() => {});
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the warn call. </li>
      <li> <code>options</code> - An object passed in with the warn call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the warning in the form of <code>package-name.specific-warning</code>.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerWarnHandler
    @param handler {Function} A function to handle warnings.
    @since 2.1.0
  */
  _emberMetalCore.default.Debug.registerWarnHandler = _emberDebugWarn.registerHandler;

  /*
    We are transitioning away from `ember.js` to `ember.debug.js` to make
    it much clearer that it is only for local development purposes.
  
    This flag value is changed by the tooling (by a simple string replacement)
    so that if `ember.js` (which must be output for backwards compat reasons) is
    used a nice helpful warning message will be printed out.
  */
  var runningNonEmberDebugJS = false;
  exports.runningNonEmberDebugJS = runningNonEmberDebugJS;
  if (runningNonEmberDebugJS) {
    _emberMetalDebug.warn('Please use `ember.debug.js` instead of `ember.js` for development and debugging.');
  }
});
// reexports
enifed('ember-debug/warn', ['exports', 'ember-console', 'ember-metal/debug', 'ember-debug/handlers'], function (exports, _emberConsole, _emberMetalDebug, _emberDebugHandlers) {
  'use strict';

  var _slice = Array.prototype.slice;
  exports.registerHandler = registerHandler;
  exports.default = warn;

  function registerHandler(handler) {
    _emberDebugHandlers.registerHandler('warn', handler);
  }

  registerHandler(function logWarning(message, options) {
    _emberConsole.default.warn('WARNING: ' + message);
    if ('trace' in _emberConsole.default) {
      _emberConsole.default.trace();
    }
  });

  var missingOptionsDeprecation = 'When calling `Ember.warn` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include an `id` property.';
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation = 'When calling `Ember.warn` you must provide `id` in options.';

  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  /**
  @module ember
  @submodule ember-debug
  */

  /**
    Display a warning with the provided message.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method warn
    @param {String} message A warning to display.
    @param {Boolean} test An optional boolean. If falsy, the warning
      will be displayed.
    @param {Object} options An object that can be used to pass a unique
      `id` for this warning.  The `id` can be used by Ember debugging tools
      to change the behavior (raise, log, or silence) for that specific warning.
      The `id` should be namespaced by dots, e.g. "ember-debug.feature-flag-with-features-stripped"
    @for Ember
    @public
  */

  function warn(message, test, options) {
    if (!options) {
      _emberMetalDebug.deprecate(missingOptionsDeprecation, false, {
        id: 'ember-debug.warn-options-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.id) {
      _emberMetalDebug.deprecate(missingOptionsIdDeprecation, false, {
        id: 'ember-debug.warn-id-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    _emberDebugHandlers.invoke.apply(undefined, ['warn'].concat(_slice.call(arguments)));
  }
});
enifed('ember-testing/adapters/adapter', ['exports', 'ember-runtime/system/object'], function (exports, _emberRuntimeSystemObject) {
  'use strict';

  function K() {
    return this;
  }

  /**
   @module ember
   @submodule ember-testing
  */

  /**
    The primary purpose of this class is to create hooks that can be implemented
    by an adapter for various test frameworks.
  
    @class Adapter
    @namespace Ember.Test
    @public
  */
  exports.default = _emberRuntimeSystemObject.default.extend({
    /**
      This callback will be called whenever an async operation is about to start.
       Override this to call your framework's methods that handle async
      operations.
       @public
      @method asyncStart
    */
    asyncStart: K,

    /**
      This callback will be called whenever an async operation has completed.
       @public
      @method asyncEnd
    */
    asyncEnd: K,

    /**
      Override this method with your testing framework's false assertion.
      This function is called whenever an exception occurs causing the testing
      promise to fail.
       QUnit example:
       ```javascript
        exception: function(error) {
          ok(false, error);
        };
      ```
       @public
      @method exception
      @param {String} error The exception to be raised.
    */
    exception: function (error) {
      throw error;
    }
  });
});
enifed('ember-testing/adapters/qunit', ['exports', 'ember-testing/adapters/adapter', 'ember-metal/utils'], function (exports, _emberTestingAdaptersAdapter, _emberMetalUtils) {
  'use strict';

  /**
    This class implements the methods defined by Ember.Test.Adapter for the
    QUnit testing framework.
  
    @class QUnitAdapter
    @namespace Ember.Test
    @extends Ember.Test.Adapter
    @public
  */
  exports.default = _emberTestingAdaptersAdapter.default.extend({
    asyncStart: function () {
      QUnit.stop();
    },
    asyncEnd: function () {
      QUnit.start();
    },
    exception: function (error) {
      ok(false, _emberMetalUtils.inspect(error));
    }
  });
});
enifed('ember-testing/events', ['exports', 'ember-views/system/jquery', 'ember-metal/run_loop'], function (exports, _emberViewsSystemJquery, _emberMetalRun_loop) {
  'use strict';

  exports.focus = focus;
  exports.fireEvent = fireEvent;

  var DEFAULT_EVENT_OPTIONS = { canBubble: true, cancelable: true };
  var KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'];
  var MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];

  function focus(el) {
    if (!el) {
      return;
    }
    var $el = _emberViewsSystemJquery.default(el);
    if ($el.is(':input, [contenteditable=true]')) {
      var type = $el.prop('type');
      if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
        _emberMetalRun_loop.default(null, function () {
          // Firefox does not trigger the `focusin` event if the window
          // does not have focus. If the document doesn't have focus just
          // use trigger('focusin') instead.

          if (!document.hasFocus || document.hasFocus()) {
            el.focus();
          } else {
            $el.trigger('focusin');
          }
        });
      }
    }
  }

  function fireEvent(element, type) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!element) {
      return;
    }
    var event = undefined;
    if (KEYBOARD_EVENT_TYPES.indexOf(type) > -1) {
      event = buildKeyboardEvent(type, options);
    } else if (MOUSE_EVENT_TYPES.indexOf(type) > -1) {
      var rect = element.getBoundingClientRect();
      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5,
        screenY: y + 95,
        clientX: x,
        clientY: y
      };
      event = buildMouseEvent(type, _emberViewsSystemJquery.default.extend(simulatedCoordinates, options));
    } else {
      event = buildBasicEvent(type, options);
    }
    element.dispatchEvent(event);
  }

  function buildBasicEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = document.createEvent('Events');
    event.initEvent(type, true, true);
    _emberViewsSystemJquery.default.extend(event, options);
    return event;
  }

  function buildMouseEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = undefined;
    try {
      event = document.createEvent('MouseEvents');
      var eventOpts = _emberViewsSystemJquery.default.extend({}, DEFAULT_EVENT_OPTIONS, options);
      event.initMouseEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }

  function buildKeyboardEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = undefined;
    try {
      event = document.createEvent('KeyEvents');
      var eventOpts = _emberViewsSystemJquery.default.extend({}, DEFAULT_EVENT_OPTIONS, options);
      event.initKeyEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }
});
enifed('ember-testing/ext/application', ['exports', 'ember-application/system/application', 'ember-testing/setup_for_testing', 'ember-testing/test/helpers', 'ember-testing/test/promise', 'ember-testing/test/run', 'ember-testing/test/on_inject_helpers', 'ember-testing/test/adapter'], function (exports, _emberApplicationSystemApplication, _emberTestingSetup_for_testing, _emberTestingTestHelpers, _emberTestingTestPromise, _emberTestingTestRun, _emberTestingTestOn_inject_helpers, _emberTestingTestAdapter) {
  'use strict';

  _emberApplicationSystemApplication.default.reopen({
    /**
     This property contains the testing helpers for the current application. These
     are created once you call `injectTestHelpers` on your `Ember.Application`
     instance. The included helpers are also available on the `window` object by
     default, but can be used from this object on the individual application also.
       @property testHelpers
      @type {Object}
      @default {}
      @public
    */
    testHelpers: {},

    /**
     This property will contain the original methods that were registered
     on the `helperContainer` before `injectTestHelpers` is called.
      When `removeTestHelpers` is called, these methods are restored to the
     `helperContainer`.
       @property originalMethods
      @type {Object}
      @default {}
      @private
      @since 1.3.0
    */
    originalMethods: {},

    /**
    This property indicates whether or not this application is currently in
    testing mode. This is set when `setupForTesting` is called on the current
    application.
     @property testing
    @type {Boolean}
    @default false
    @since 1.3.0
    @public
    */
    testing: false,

    /**
      This hook defers the readiness of the application, so that you can start
      the app when your tests are ready to run. It also sets the router's
      location to 'none', so that the window's location will not be modified
      (preventing both accidental leaking of state between tests and interference
      with your testing framework).
       Example:
       ```
      App.setupForTesting();
      ```
       @method setupForTesting
      @public
    */
    setupForTesting: function () {
      _emberTestingSetup_for_testing.default();

      this.testing = true;

      this.Router.reopen({
        location: 'none'
      });
    },

    /**
      This will be used as the container to inject the test helpers into. By
      default the helpers are injected into `window`.
       @property helperContainer
      @type {Object} The object to be used for test helpers.
      @default window
      @since 1.2.0
      @private
    */
    helperContainer: null,

    /**
      This injects the test helpers into the `helperContainer` object. If an object is provided
      it will be used as the helperContainer. If `helperContainer` is not set it will default
      to `window`. If a function of the same name has already been defined it will be cached
      (so that it can be reset if the helper is removed with `unregisterHelper` or
      `removeTestHelpers`).
       Any callbacks registered with `onInjectHelpers` will be called once the
      helpers have been injected.
       Example:
      ```
      App.injectTestHelpers();
      ```
       @method injectTestHelpers
      @public
    */
    injectTestHelpers: function (helperContainer) {
      if (helperContainer) {
        this.helperContainer = helperContainer;
      } else {
        this.helperContainer = window;
      }

      this.reopen({
        willDestroy: function () {
          this._super.apply(this, arguments);
          this.removeTestHelpers();
        }
      });

      this.testHelpers = {};
      for (var _name in _emberTestingTestHelpers.helpers) {
        this.originalMethods[_name] = this.helperContainer[_name];
        this.testHelpers[_name] = this.helperContainer[_name] = helper(this, _name);
        protoWrap(_emberTestingTestPromise.default.prototype, _name, helper(this, _name), _emberTestingTestHelpers.helpers[_name].meta.wait);
      }

      _emberTestingTestOn_inject_helpers.invokeInjectHelpersCallbacks(this);
    },

    /**
      This removes all helpers that have been registered, and resets and functions
      that were overridden by the helpers.
       Example:
       ```javascript
      App.removeTestHelpers();
      ```
       @public
      @method removeTestHelpers
    */
    removeTestHelpers: function () {
      if (!this.helperContainer) {
        return;
      }

      for (var _name2 in _emberTestingTestHelpers.helpers) {
        this.helperContainer[_name2] = this.originalMethods[_name2];
        delete _emberTestingTestPromise.default.prototype[_name2];
        delete this.testHelpers[_name2];
        delete this.originalMethods[_name2];
      }
    }
  });

  // This method is no longer needed
  // But still here for backwards compatibility
  // of helper chaining
  function protoWrap(proto, name, callback, isAsync) {
    proto[name] = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (isAsync) {
        return callback.apply(this, args);
      } else {
        return this.then(function () {
          return callback.apply(this, args);
        });
      }
    };
  }

  function helper(app, name) {
    var fn = _emberTestingTestHelpers.helpers[name].method;
    var meta = _emberTestingTestHelpers.helpers[name].meta;
    if (!meta.wait) {
      return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return fn.apply(app, [app].concat(args));
      };
    }

    return function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var lastPromise = _emberTestingTestRun.default(function () {
        return _emberTestingTestPromise.resolve(_emberTestingTestPromise.getLastPromise());
      });

      // wait for last helper's promise to resolve and then
      // execute. To be safe, we need to tell the adapter we're going
      // asynchronous here, because fn may not be invoked before we
      // return.
      _emberTestingTestAdapter.asyncStart();
      return lastPromise.then(function () {
        return fn.apply(app, [app].concat(args));
      }).finally(_emberTestingTestAdapter.asyncEnd);
    };
  }
});
enifed('ember-testing/ext/rsvp', ['exports', 'ember-runtime/ext/rsvp', 'ember-metal/run_loop', 'ember-metal/testing', 'ember-testing/test/adapter'], function (exports, _emberRuntimeExtRsvp, _emberMetalRun_loop, _emberMetalTesting, _emberTestingTestAdapter) {
  'use strict';

  _emberRuntimeExtRsvp.default.configure('async', function (callback, promise) {
    // if schedule will cause autorun, we need to inform adapter
    if (_emberMetalTesting.isTesting() && !_emberMetalRun_loop.default.backburner.currentInstance) {
      _emberTestingTestAdapter.asyncStart();
      _emberMetalRun_loop.default.backburner.schedule('actions', function () {
        _emberTestingTestAdapter.asyncEnd();
        callback(promise);
      });
    } else {
      _emberMetalRun_loop.default.backburner.schedule('actions', function () {
        return callback(promise);
      });
    }
  });

  exports.default = _emberRuntimeExtRsvp.default;
});
enifed('ember-testing/helpers', ['exports', 'ember-testing/test/helpers', 'ember-testing/helpers/and_then', 'ember-testing/helpers/click', 'ember-testing/helpers/current_path', 'ember-testing/helpers/current_route_name', 'ember-testing/helpers/current_url', 'ember-testing/helpers/fill_in', 'ember-testing/helpers/find', 'ember-testing/helpers/find_with_assert', 'ember-testing/helpers/key_event', 'ember-testing/helpers/pause_test', 'ember-testing/helpers/trigger_event', 'ember-testing/helpers/visit', 'ember-testing/helpers/wait'], function (exports, _emberTestingTestHelpers, _emberTestingHelpersAnd_then, _emberTestingHelpersClick, _emberTestingHelpersCurrent_path, _emberTestingHelpersCurrent_route_name, _emberTestingHelpersCurrent_url, _emberTestingHelpersFill_in, _emberTestingHelpersFind, _emberTestingHelpersFind_with_assert, _emberTestingHelpersKey_event, _emberTestingHelpersPause_test, _emberTestingHelpersTrigger_event, _emberTestingHelpersVisit, _emberTestingHelpersWait) {
  'use strict';

  /**
  @module ember
  @submodule ember-testing
  */

  /**
    Loads a route, sets up any controllers, and renders any templates associated
    with the route as though a real user had triggered the route change while
    using your app.
  
    Example:
  
    ```javascript
    visit('posts/index').then(function() {
      // assert something
    });
    ```
  
    @method visit
    @param {String} url the name of the route
    @return {RSVP.Promise}
    @public
  */
  _emberTestingTestHelpers.registerAsyncHelper('visit', _emberTestingHelpersVisit.default);

  /**
    Clicks an element and triggers any actions triggered by the element's `click`
    event.
  
    Example:
  
    ```javascript
    click('.some-jQuery-selector').then(function() {
      // assert something
    });
    ```
  
    @method click
    @param {String} selector jQuery selector for finding element on the DOM
    @param {Object} context A DOM Element, Document, or jQuery to use as context
    @return {RSVP.Promise}
    @public
  */
  _emberTestingTestHelpers.registerAsyncHelper('click', _emberTestingHelpersClick.default);

  /**
    Simulates a key event, e.g. `keypress`, `keydown`, `keyup` with the desired keyCode
  
    Example:
  
    ```javascript
    keyEvent('.some-jQuery-selector', 'keypress', 13).then(function() {
     // assert something
    });
    ```
  
    @method keyEvent
    @param {String} selector jQuery selector for finding element on the DOM
    @param {String} type the type of key event, e.g. `keypress`, `keydown`, `keyup`
    @param {Number} keyCode the keyCode of the simulated key event
    @return {RSVP.Promise}
    @since 1.5.0
    @public
  */
  _emberTestingTestHelpers.registerAsyncHelper('keyEvent', _emberTestingHelpersKey_event.default);

  /**
    Fills in an input element with some text.
  
    Example:
  
    ```javascript
    fillIn('#email', 'you@example.com').then(function() {
      // assert something
    });
    ```
  
    @method fillIn
    @param {String} selector jQuery selector finding an input element on the DOM
    to fill text with
    @param {String} text text to place inside the input element
    @return {RSVP.Promise}
    @public
  */
  _emberTestingTestHelpers.registerAsyncHelper('fillIn', _emberTestingHelpersFill_in.default);

  /**
    Finds an element in the context of the app's container element. A simple alias
    for `app.$(selector)`.
  
    Example:
  
    ```javascript
    var $el = find('.my-selector');
    ```
  
    @method find
    @param {String} selector jQuery string selector for element lookup
    @return {Object} jQuery object representing the results of the query
    @public
  */
  _emberTestingTestHelpers.registerHelper('find', _emberTestingHelpersFind.default);

  /**
    Like `find`, but throws an error if the element selector returns no results.
  
    Example:
  
    ```javascript
    var $el = findWithAssert('.doesnt-exist'); // throws error
    ```
  
    @method findWithAssert
    @param {String} selector jQuery selector string for finding an element within
    the DOM
    @return {Object} jQuery object representing the results of the query
    @throws {Error} throws error if jQuery object returned has a length of 0
    @public
  */
  _emberTestingTestHelpers.registerHelper('findWithAssert', _emberTestingHelpersFind_with_assert.default);

  /**
    Causes the run loop to process any pending events. This is used to ensure that
    any async operations from other helpers (or your assertions) have been processed.
  
    This is most often used as the return value for the helper functions (see 'click',
    'fillIn','visit',etc).
  
    Example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('loginUser', function(app, username, password) {
      visit('secured/path/here')
      .fillIn('#username', username)
      .fillIn('#password', password)
      .click('.submit')
  
      return app.testHelpers.wait();
    });
  
    @method wait
    @param {Object} value The value to be returned.
    @return {RSVP.Promise}
    @public
  */
  _emberTestingTestHelpers.registerAsyncHelper('wait', _emberTestingHelpersWait.default);
  _emberTestingTestHelpers.registerAsyncHelper('andThen', _emberTestingHelpersAnd_then.default);
  _emberTestingTestHelpers.registerHelper('currentRouteName', _emberTestingHelpersCurrent_route_name.default);
  /**
    Returns the current path.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentPath(), 'some.path.index', "correct path was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentPath
  @return {Object} The currently active path.
  @since 1.5.0
  @public
  */
  _emberTestingTestHelpers.registerHelper('currentPath', _emberTestingHelpersCurrent_path.default);

  /**
    Returns the current URL.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentURL(), '/some/path', "correct URL was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentURL
  @return {Object} The currently active URL.
  @since 1.5.0
  @public
  */
  _emberTestingTestHelpers.registerHelper('currentURL', _emberTestingHelpersCurrent_url.default);
  _emberTestingTestHelpers.registerAsyncHelper('pauseTest', _emberTestingHelpersPause_test.default);
  _emberTestingTestHelpers.registerAsyncHelper('triggerEvent', _emberTestingHelpersTrigger_event.default);
});
enifed("ember-testing/helpers/and_then", ["exports"], function (exports) {
  "use strict";

  exports.default = andThen;

  function andThen(app, callback) {
    return app.testHelpers.wait(callback(app));
  }
});
enifed('ember-testing/helpers/click', ['exports', 'ember-testing/events'], function (exports, _emberTestingEvents) {
  'use strict';

  exports.default = click;

  function click(app, selector, context) {
    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    _emberTestingEvents.fireEvent(el, 'mousedown');

    _emberTestingEvents.focus(el);

    _emberTestingEvents.fireEvent(el, 'mouseup');
    _emberTestingEvents.fireEvent(el, 'click');

    return app.testHelpers.wait();
  }
});
enifed('ember-testing/helpers/current_path', ['exports', 'ember-metal/property_get'], function (exports, _emberMetalProperty_get) {
  'use strict';

  exports.default = currentPath;

  function currentPath(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return _emberMetalProperty_get.get(routingService, 'currentPath');
  }
});
enifed('ember-testing/helpers/current_route_name', ['exports', 'ember-metal/property_get'], function (exports, _emberMetalProperty_get) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = currentRouteName;

  /**
    Returns the currently active route name.
  Example:
  ```javascript
  function validateRouteName() {
    equal(currentRouteName(), 'some.path', "correct route was transitioned into.");
  }
  visit('/some/path').then(validateRouteName)
  ```
  @method currentRouteName
  @return {Object} The name of the currently active route.
  @since 1.5.0
  @public
  */

  function currentRouteName(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return _emberMetalProperty_get.get(routingService, 'currentRouteName');
  }
});
enifed('ember-testing/helpers/current_url', ['exports', 'ember-metal/property_get'], function (exports, _emberMetalProperty_get) {
  'use strict';

  exports.default = currentURL;

  function currentURL(app) {
    var router = app.__container__.lookup('router:main');
    return _emberMetalProperty_get.get(router, 'location').getURL();
  }
});
enifed('ember-testing/helpers/fill_in', ['exports', 'ember-testing/events'], function (exports, _emberTestingEvents) {
  'use strict';

  exports.default = fillIn;

  function fillIn(app, selector, contextOrText, text) {
    var $el = undefined,
        el = undefined,
        context = undefined;
    if (typeof text === 'undefined') {
      text = contextOrText;
    } else {
      context = contextOrText;
    }
    $el = app.testHelpers.findWithAssert(selector, context);
    el = $el[0];
    _emberTestingEvents.focus(el);

    $el.eq(0).val(text);
    _emberTestingEvents.fireEvent(el, 'input');
    _emberTestingEvents.fireEvent(el, 'change');

    return app.testHelpers.wait();
  }
});
enifed('ember-testing/helpers/find', ['exports', 'ember-metal/property_get'], function (exports, _emberMetalProperty_get) {
  'use strict';

  exports.default = find;

  function find(app, selector, context) {
    var $el = undefined;
    context = context || _emberMetalProperty_get.get(app, 'rootElement');
    $el = app.$(selector, context);
    return $el;
  }
});
enifed('ember-testing/helpers/find_with_assert', ['exports'], function (exports) {
  'use strict';

  exports.default = findWithAssert;

  function findWithAssert(app, selector, context) {
    var $el = app.testHelpers.find(selector, context);
    if ($el.length === 0) {
      throw new Error('Element ' + selector + ' not found.');
    }
    return $el;
  }
});
enifed('ember-testing/helpers/key_event', ['exports'], function (exports) {
  'use strict';

  exports.default = keyEvent;

  function keyEvent(app, selector, contextOrType, typeOrKeyCode, keyCode) {
    var context = undefined,
        type = undefined;

    if (typeof keyCode === 'undefined') {
      context = null;
      keyCode = typeOrKeyCode;
      type = contextOrType;
    } else {
      context = contextOrType;
      type = typeOrKeyCode;
    }

    return app.testHelpers.triggerEvent(selector, context, type, { keyCode: keyCode, which: keyCode });
  }
});
enifed('ember-testing/helpers/pause_test', ['exports', 'ember-runtime/ext/rsvp'], function (exports, _emberRuntimeExtRsvp) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = pauseTest;

  /**
   Pauses the current test - this is useful for debugging while testing or for test-driving.
   It allows you to inspect the state of your application at any point.
   Example (The test will pause before clicking the button):
   ```javascript
   visit('/')
   return pauseTest();
   click('.btn');
   ```
   @since 1.9.0
   @method pauseTest
   @return {Object} A promise that will never resolve
   @public
  */

  function pauseTest() {
    return new _emberRuntimeExtRsvp.default.Promise(function () {}, 'TestAdapter paused promise');
  }
});
enifed('ember-testing/helpers/trigger_event', ['exports', 'ember-testing/events'], function (exports, _emberTestingEvents) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = triggerEvent;

  /**
    Triggers the given DOM event on the element identified by the provided selector.
    Example:
    ```javascript
    triggerEvent('#some-elem-id', 'blur');
    ```
    This is actually used internally by the `keyEvent` helper like so:
    ```javascript
    triggerEvent('#some-elem-id', 'keypress', { keyCode: 13 });
    ```
   @method triggerEvent
   @param {String} selector jQuery selector for finding element on the DOM
   @param {String} [context] jQuery selector that will limit the selector
                             argument to find only within the context's children
   @param {String} type The event type to be triggered.
   @param {Object} [options] The options to be passed to jQuery.Event.
   @return {RSVP.Promise}
   @since 1.5.0
   @public
  */

  function triggerEvent(app, selector, contextOrType, typeOrOptions, possibleOptions) {
    var arity = arguments.length;
    var context = undefined,
        type = undefined,
        options = undefined;

    if (arity === 3) {
      // context and options are optional, so this is
      // app, selector, type
      context = null;
      type = contextOrType;
      options = {};
    } else if (arity === 4) {
      // context and options are optional, so this is
      if (typeof typeOrOptions === 'object') {
        // either
        // app, selector, type, options
        context = null;
        type = contextOrType;
        options = typeOrOptions;
      } else {
        // or
        // app, selector, context, type
        context = contextOrType;
        type = typeOrOptions;
        options = {};
      }
    } else {
      context = contextOrType;
      type = typeOrOptions;
      options = possibleOptions;
    }

    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    _emberTestingEvents.fireEvent(el, type, options);

    return app.testHelpers.wait();
  }
});
enifed('ember-testing/helpers/visit', ['exports', 'ember-metal/run_loop'], function (exports, _emberMetalRun_loop) {
  'use strict';

  exports.default = visit;

  function visit(app, url) {
    var router = app.__container__.lookup('router:main');
    var shouldHandleURL = false;

    app.boot().then(function () {
      router.location.setURL(url);

      if (shouldHandleURL) {
        _emberMetalRun_loop.default(app.__deprecatedInstance__, 'handleURL', url);
      }
    });

    if (app._readinessDeferrals > 0) {
      router['initialURL'] = url;
      _emberMetalRun_loop.default(app, 'advanceReadiness');
      delete router['initialURL'];
    } else {
      shouldHandleURL = true;
    }

    return app.testHelpers.wait();
  }
});
enifed('ember-testing/helpers/wait', ['exports', 'ember-testing/test/waiters', 'ember-runtime/ext/rsvp', 'ember-metal/run_loop', 'ember-testing/test/pending_requests'], function (exports, _emberTestingTestWaiters, _emberRuntimeExtRsvp, _emberMetalRun_loop, _emberTestingTestPending_requests) {
  'use strict';

  exports.default = wait;

  function wait(app, value) {
    return new _emberRuntimeExtRsvp.default.Promise(function (resolve) {
      var router = app.__container__.lookup('router:main');

      // Every 10ms, poll for the async thing to have finished
      var watcher = setInterval(function () {
        // 1. If the router is loading, keep polling
        var routerIsLoading = router.router && !!router.router.activeTransition;
        if (routerIsLoading) {
          return;
        }

        // 2. If there are pending Ajax requests, keep polling
        if (_emberTestingTestPending_requests.pendingRequests()) {
          return;
        }

        // 3. If there are scheduled timers or we are inside of a run loop, keep polling
        if (_emberMetalRun_loop.default.hasScheduledTimers() || _emberMetalRun_loop.default.currentRunLoop) {
          return;
        }

        if (_emberTestingTestWaiters.checkWaiters()) {
          return;
        }

        // Stop polling
        clearInterval(watcher);

        // Synchronously resolve the promise
        _emberMetalRun_loop.default(null, resolve, value);
      }, 10);
    });
  }
});
enifed('ember-testing/index', ['exports', 'ember-metal/core', 'ember-testing/test', 'ember-testing/adapters/adapter', 'ember-testing/setup_for_testing', 'require', 'ember-testing/support', 'ember-testing/ext/application', 'ember-testing/ext/rsvp', 'ember-testing/helpers', 'ember-testing/initializers'], function (exports, _emberMetalCore, _emberTestingTest, _emberTestingAdaptersAdapter, _emberTestingSetup_for_testing, _require, _emberTestingSupport, _emberTestingExtApplication, _emberTestingExtRsvp, _emberTestingHelpers, _emberTestingInitializers) {
  'use strict';

  // to setup initializer

  /**
    @module ember
    @submodule ember-testing
  */

  _emberMetalCore.default.Test = _emberTestingTest.default;
  _emberMetalCore.default.Test.Adapter = _emberTestingAdaptersAdapter.default;
  _emberMetalCore.default.setupForTesting = _emberTestingSetup_for_testing.default;
  Object.defineProperty(_emberTestingTest.default, 'QUnitAdapter', {
    get: function () {
      return _require.default('ember-testing/adapters/qunit').default;
    }
  });
});
// reexports
// to handle various edge cases
// adds helpers to helpers object in Test
enifed('ember-testing/initializers', ['exports', 'ember-runtime/system/lazy_load'], function (exports, _emberRuntimeSystemLazy_load) {
  'use strict';

  var name = 'deferReadiness in `testing` mode';

  _emberRuntimeSystemLazy_load.onLoad('Ember.Application', function (Application) {
    if (!Application.initializers[name]) {
      Application.initializer({
        name: name,

        initialize: function (application) {
          if (application.testing) {
            application.deferReadiness();
          }
        }
      });
    }
  });
});
enifed('ember-testing/setup_for_testing', ['exports', 'ember-metal/testing', 'ember-views/system/jquery', 'ember-testing/test/adapter', 'ember-testing/test/pending_requests', 'require'], function (exports, _emberMetalTesting, _emberViewsSystemJquery, _emberTestingTestAdapter, _emberTestingTestPending_requests, _require) {
  'use strict';

  exports.default = setupForTesting;

  /**
    Sets Ember up for testing. This is useful to perform
    basic setup steps in order to unit test.
  
    Use `App.setupForTesting` to perform integration tests (full
    application testing).
  
    @method setupForTesting
    @namespace Ember
    @since 1.5.0
    @private
  */

  function setupForTesting() {
    _emberMetalTesting.setTesting(true);

    var adapter = _emberTestingTestAdapter.getAdapter();
    // if adapter is not manually set default to QUnit
    if (!adapter) {
      var QUnitAdapter = _require.default('ember-testing/adapters/qunit').default;
      _emberTestingTestAdapter.setAdapter(new QUnitAdapter());
    }

    _emberViewsSystemJquery.default(document).off('ajaxSend', _emberTestingTestPending_requests.incrementPendingRequests);
    _emberViewsSystemJquery.default(document).off('ajaxComplete', _emberTestingTestPending_requests.decrementPendingRequests);

    _emberTestingTestPending_requests.clearPendingRequests();

    _emberViewsSystemJquery.default(document).on('ajaxSend', _emberTestingTestPending_requests.incrementPendingRequests);
    _emberViewsSystemJquery.default(document).on('ajaxComplete', _emberTestingTestPending_requests.decrementPendingRequests);
  }
});
enifed('ember-testing/support', ['exports', 'ember-metal/debug', 'ember-views/system/jquery', 'ember-environment'], function (exports, _emberMetalDebug, _emberViewsSystemJquery, _emberEnvironment) {
  'use strict';

  /**
    @module ember
    @submodule ember-testing
  */

  var $ = _emberViewsSystemJquery.default;

  /**
    This method creates a checkbox and triggers the click event to fire the
    passed in handler. It is used to correct for a bug in older versions
    of jQuery (e.g 1.8.3).
  
    @private
    @method testCheckboxClick
  */
  function testCheckboxClick(handler) {
    $('<input type="checkbox">').css({ position: 'absolute', left: '-1000px', top: '-1000px' }).appendTo('body').on('click', handler).trigger('click').remove();
  }

  if (_emberEnvironment.environment.hasDOM) {
    $(function () {
      /*
        Determine whether a checkbox checked using jQuery's "click" method will have
        the correct value for its checked property.
         If we determine that the current jQuery version exhibits this behavior,
        patch it to work correctly as in the commit for the actual fix:
        https://github.com/jquery/jquery/commit/1fb2f92.
      */
      testCheckboxClick(function () {
        if (!this.checked && !$.event.special.click) {
          $.event.special.click = {
            // For checkbox, fire native event so checked state will be right
            trigger: function () {
              if ($.nodeName(this, 'input') && this.type === 'checkbox' && this.click) {
                this.click();
                return false;
              }
            }
          };
        }
      });

      // Try again to verify that the patch took effect or blow up.
      testCheckboxClick(function () {
        _emberMetalDebug.warn('clicked checkboxes should be checked! the jQuery patch didn\'t work', this.checked, { id: 'ember-testing.test-checkbox-click' });
      });
    });
  }
});
enifed('ember-testing/test', ['exports', 'ember-testing/test/helpers', 'ember-testing/test/on_inject_helpers', 'ember-testing/test/promise', 'ember-testing/test/waiters', 'ember-testing/test/adapter', 'ember-metal/features'], function (exports, _emberTestingTestHelpers, _emberTestingTestOn_inject_helpers, _emberTestingTestPromise, _emberTestingTestWaiters, _emberTestingTestAdapter, _emberMetalFeatures) {
  /**
    @module ember
    @submodule ember-testing
  */
  'use strict';

  /**
    This is a container for an assortment of testing related functionality:
  
    * Choose your default test adapter (for your framework of choice).
    * Register/Unregister additional test helpers.
    * Setup callbacks to be fired when the test helpers are injected into
      your application.
  
    @class Test
    @namespace Ember
    @public
  */
  var Test = {
    /**
      Hash containing all known test helpers.
       @property _helpers
      @private
      @since 1.7.0
    */
    _helpers: _emberTestingTestHelpers.helpers,

    registerHelper: _emberTestingTestHelpers.registerHelper,
    registerAsyncHelper: _emberTestingTestHelpers.registerAsyncHelper,
    unregisterHelper: _emberTestingTestHelpers.unregisterHelper,
    onInjectHelpers: _emberTestingTestOn_inject_helpers.onInjectHelpers,
    Promise: _emberTestingTestPromise.default,
    promise: _emberTestingTestPromise.promise,
    resolve: _emberTestingTestPromise.resolve,
    registerWaiter: _emberTestingTestWaiters.registerWaiter,
    unregisterWaiter: _emberTestingTestWaiters.unregisterWaiter
  };

  if (true) {
    Test.checkWaiters = _emberTestingTestWaiters.checkWaiters;
  }

  /**
   Used to allow ember-testing to communicate with a specific testing
   framework.
  
   You can manually set it before calling `App.setupForTesting()`.
  
   Example:
  
   ```javascript
   Ember.Test.adapter = MyCustomAdapter.create()
   ```
  
   If you do not set it, ember-testing will default to `Ember.Test.QUnitAdapter`.
  
   @public
   @for Ember.Test
   @property adapter
   @type {Class} The adapter to be used.
   @default Ember.Test.QUnitAdapter
  */
  Object.defineProperty(Test, 'adapter', {
    get: _emberTestingTestAdapter.getAdapter,
    set: _emberTestingTestAdapter.setAdapter
  });

  Object.defineProperty(Test, 'waiters', {
    get: _emberTestingTestWaiters.generateDeprecatedWaitersArray
  });

  exports.default = Test;
});
enifed('ember-testing/test/adapter', ['exports', 'ember-console', 'ember-metal/error_handler'], function (exports, _emberConsole, _emberMetalError_handler) {
  'use strict';

  exports.getAdapter = getAdapter;
  exports.setAdapter = setAdapter;
  exports.asyncStart = asyncStart;
  exports.asyncEnd = asyncEnd;

  var adapter = undefined;

  function getAdapter() {
    return adapter;
  }

  function setAdapter(value) {
    adapter = value;
    if (value) {
      _emberMetalError_handler.setDispatchOverride(adapterDispatch);
    } else {
      _emberMetalError_handler.setDispatchOverride(null);
    }
  }

  function asyncStart() {
    if (adapter) {
      adapter.asyncStart();
    }
  }

  function asyncEnd() {
    if (adapter) {
      adapter.asyncEnd();
    }
  }

  function adapterDispatch(error) {
    adapter.exception(error);
    _emberConsole.default.error(error.stack);
  }
});
enifed('ember-testing/test/helpers', ['exports', 'ember-testing/test/promise'], function (exports, _emberTestingTestPromise) {
  'use strict';

  exports.registerHelper = registerHelper;
  exports.registerAsyncHelper = registerAsyncHelper;
  exports.unregisterHelper = unregisterHelper;
  var helpers = {};

  exports.helpers = helpers;
  /**
    `registerHelper` is used to register a test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    Ember.Test.registerHelper('boot', function(app) {
      Ember.run(app, app.advanceReadiness);
    });
    ```
  
    This helper can later be called without arguments because it will be
    called with `app` as the first parameter.
  
    ```javascript
    App = Ember.Application.create();
    App.injectTestHelpers();
    boot();
    ```
  
    @public
    @for Ember.Test
    @method registerHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @param options {Object}
  */

  function registerHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: { wait: false }
    };
  }

  /**
    `registerAsyncHelper` is used to register an async test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('boot', function(app) {
      Ember.run(app, app.advanceReadiness);
    });
    ```
  
    The advantage of an async helper is that it will not run
    until the last async helper has completed.  All async helpers
    after it will wait for it complete before running.
  
  
    For example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('deletePost', function(app, postId) {
      click('.delete-' + postId);
    });
  
    // ... in your test
    visit('/post/2');
    deletePost(2);
    visit('/post/3');
    deletePost(3);
    ```
  
    @public
    @for Ember.Test
    @method registerAsyncHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @since 1.2.0
  */

  function registerAsyncHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: { wait: true }
    };
  }

  /**
    Remove a previously added helper method.
  
    Example:
  
    ```javascript
    Ember.Test.unregisterHelper('wait');
    ```
  
    @public
    @method unregisterHelper
    @param {String} name The helper to remove.
  */

  function unregisterHelper(name) {
    delete helpers[name];
    delete _emberTestingTestPromise.default.prototype[name];
  }
});
enifed("ember-testing/test/on_inject_helpers", ["exports"], function (exports) {
  "use strict";

  exports.onInjectHelpers = onInjectHelpers;
  exports.invokeInjectHelpersCallbacks = invokeInjectHelpersCallbacks;
  var callbacks = [];

  exports.callbacks = callbacks;
  /**
    Used to register callbacks to be fired whenever `App.injectTestHelpers`
    is called.
  
    The callback will receive the current application as an argument.
  
    Example:
  
    ```javascript
    Ember.Test.onInjectHelpers(function() {
      Ember.$(document).ajaxSend(function() {
        Test.pendingRequests++;
      });
  
      Ember.$(document).ajaxComplete(function() {
        Test.pendingRequests--;
      });
    });
    ```
  
    @public
    @for Ember.Test
    @method onInjectHelpers
    @param {Function} callback The function to be called.
  */

  function onInjectHelpers(callback) {
    callbacks.push(callback);
  }

  function invokeInjectHelpersCallbacks(app) {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i](app);
    }
  }
});
enifed("ember-testing/test/pending_requests", ["exports"], function (exports) {
  "use strict";

  exports.pendingRequests = pendingRequests;
  exports.clearPendingRequests = clearPendingRequests;
  exports.incrementPendingRequests = incrementPendingRequests;
  exports.decrementPendingRequests = decrementPendingRequests;
  var requests = [];

  function pendingRequests() {
    return requests.length;
  }

  function clearPendingRequests() {
    requests.length = 0;
  }

  function incrementPendingRequests(_, xhr) {
    requests.push(xhr);
  }

  function decrementPendingRequests(_, xhr) {
    for (var i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
        break;
      }
    }
  }
});
enifed('ember-testing/test/promise', ['exports', 'ember-runtime/ext/rsvp', 'ember-testing/test/run'], function (exports, _emberRuntimeExtRsvp, _emberTestingTestRun) {
  'use strict';

  exports.promise = promise;
  exports.resolve = resolve;
  exports.getLastPromise = getLastPromise;

  function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

  var lastPromise = undefined;

  var TestPromise = (function (_RSVP$Promise) {
    _inherits(TestPromise, _RSVP$Promise);

    function TestPromise() {
      _classCallCheck(this, TestPromise);

      _RSVP$Promise.apply(this, arguments);
      lastPromise = this;
    }

    /**
      This returns a thenable tailored for testing.  It catches failed
      `onSuccess` callbacks and invokes the `Ember.Test.adapter.exception`
      callback in the last chained then.
    
      This method should be returned by async helpers such as `wait`.
    
      @public
      @for Ember.Test
      @method promise
      @param {Function} resolver The function used to resolve the promise.
      @param {String} label An optional string for identifying the promise.
    */

    TestPromise.resolve = function resolve(val) {
      return new TestPromise(function (resolve) {
        return resolve(val);
      });
    };

    TestPromise.prototype.then = function then(onFulfillment) {
      var _RSVP$Promise$prototype$then;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return (_RSVP$Promise$prototype$then = _RSVP$Promise.prototype.then).call.apply(_RSVP$Promise$prototype$then, [this, function (result) {
        return isolate(onFulfillment, result);
      }].concat(args));
    };

    return TestPromise;
  })(_emberRuntimeExtRsvp.default.Promise);

  exports.default = TestPromise;

  function promise(resolver, label) {
    var fullLabel = 'Ember.Test.promise: ' + (label || '<Unknown Promise>');
    return new TestPromise(resolver, fullLabel);
  }

  /**
    Replacement for `Ember.RSVP.resolve`
    The only difference is this uses
    an instance of `Ember.Test.Promise`
  
    @public
    @for Ember.Test
    @method resolve
    @param {Mixed} The value to resolve
    @since 1.2.0
  */

  function resolve(result) {
    return new TestPromise(function (resolve) {
      return resolve(result);
    });
  }

  function getLastPromise() {
    return lastPromise;
  }

  // This method isolates nested async methods
  // so that they don't conflict with other last promises.
  //
  // 1. Set `Ember.Test.lastPromise` to null
  // 2. Invoke method
  // 3. Return the last promise created during method
  function isolate(onFulfillment, result) {
    // Reset lastPromise for nested helpers
    lastPromise = null;

    var value = onFulfillment(result);

    var promise = lastPromise;
    lastPromise = null;

    // If the method returned a promise
    // return that promise. If not,
    // return the last async helper's promise
    if (value && value instanceof TestPromise || !promise) {
      return value;
    } else {
      return _emberTestingTestRun.default(function () {
        return resolve(promise).then(function () {
          return value;
        });
      });
    }
  }
});
enifed('ember-testing/test/run', ['exports', 'ember-metal/run_loop'], function (exports, _emberMetalRun_loop) {
  'use strict';

  exports.default = run;

  function run(fn) {
    if (!_emberMetalRun_loop.default.currentRunLoop) {
      return _emberMetalRun_loop.default(fn);
    } else {
      return fn();
    }
  }
});
enifed('ember-testing/test/waiters', ['exports', 'ember-metal/features', 'ember-metal/debug'], function (exports, _emberMetalFeatures, _emberMetalDebug) {
  'use strict';

  exports.registerWaiter = registerWaiter;
  exports.unregisterWaiter = unregisterWaiter;
  exports.checkWaiters = checkWaiters;
  exports.generateDeprecatedWaitersArray = generateDeprecatedWaitersArray;

  var contexts = [];
  var callbacks = [];

  /**
     This allows ember-testing to play nicely with other asynchronous
     events, such as an application that is waiting for a CSS3
     transition or an IndexDB transaction.
  
     For example:
  
     ```javascript
     Ember.Test.registerWaiter(function() {
       return myPendingTransactions() == 0;
     });
     ```
     The `context` argument allows you to optionally specify the `this`
     with which your callback will be invoked.
  
     For example:
  
     ```javascript
     Ember.Test.registerWaiter(MyDB, MyDB.hasPendingTransactions);
     ```
  
     @public
     @for Ember.Test
     @method registerWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */

  function registerWaiter(context, callback) {
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    if (indexOf(context, callback) > -1) {
      return;
    }
    contexts.push(context);
    callbacks.push(callback);
  }

  /**
     `unregisterWaiter` is used to unregister a callback that was
     registered with `registerWaiter`.
  
     @public
     @for Ember.Test
     @method unregisterWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */

  function unregisterWaiter(context, callback) {
    if (!callbacks.length) {
      return;
    }
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    var i = indexOf(context, callback);
    if (i === -1) {
      return;
    }
    contexts.splice(i, 1);
    callbacks.splice(i, 1);
  }

  /**
    Iterates through each registered test waiter, and invokes
    its callback. If any waiter returns false, this method will return
    true indicating that the waiters have not settled yet.
  
    This is generally used internally from the acceptance/integration test
    infrastructure.
  
    @public
    @for Ember.Test
    @static
    @method checkWaiters
  */

  function checkWaiters() {
    if (!callbacks.length) {
      return false;
    }
    for (var i = 0; i < callbacks.length; i++) {
      var context = contexts[i];
      var callback = callbacks[i];
      if (!callback.call(context)) {
        return true;
      }
    }
    return false;
  }

  function indexOf(context, callback) {
    for (var i = 0; i < callbacks.length; i++) {
      if (callbacks[i] === callback && contexts[i] === context) {
        return i;
      }
    }
    return -1;
  }

  function generateDeprecatedWaitersArray() {
    _emberMetalDebug.deprecate('Usage of `Ember.Test.waiters` is deprecated. Please refactor to `Ember.Test.checkWaiters`.', !true, { until: '2.8.0', id: 'ember-testing.test-waiters' });

    var array = new Array(callbacks.length);
    for (var i = 0; i < callbacks.length; i++) {
      var context = contexts[i];
      var callback = callbacks[i];

      array[i] = [context, callback];
    }

    return array;
  }
});
requireModule("ember-testing");

}());

/*!
 * QUnit 2.18.1
 * https://qunitjs.com/
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 */
(function () {
  'use strict';

  // We don't use global-this-polyfill [1], because it modifies
  // the globals scope by default. QUnit must not affect the host context
  // as developers may test their project may be such a polyfill, and/or
  // they may intentionally test their project with and without certain
  // polyfills and we must not affect that. It also uses an obscure
  // mechanism that seems to sometimes causes a runtime error in older
  // browsers (specifically Safari and IE versions that support
  // Object.defineProperty but then report _T_ as undefined).
  // [1] https://github.com/ungap/global-this/blob/v0.4.4/esm/index.js
  //
  // Another way is `Function('return this')()`, but doing so relies
  // on eval which will cause a CSP error on some servers.
  //
  // Instead, simply check the four options that already exist
  // in all supported environments.
  function getGlobalThis() {
    if (typeof globalThis !== 'undefined') {
      // For SpiderMonkey, modern browsers, and recent Node.js
      // eslint-disable-next-line no-undef
      return globalThis;
    }

    if (typeof self !== 'undefined') {
      // For web workers
      // eslint-disable-next-line no-undef
      return self;
    }

    if (typeof window$1 !== 'undefined') {
      // For document context in browsers
      return window$1;
    }

    if (typeof global !== 'undefined') {
      // For Node.js
      // eslint-disable-next-line no-undef
      return global;
    }

    throw new Error('Unable to locate global object');
  } // This avoids a simple `export const` assignment as that would lead Rollup
  // to change getGlobalThis and use the same (generated) variable name there.


  var g = getGlobalThis();
  var window$1 = g.window;
  var console$1 = g.console;
  var setTimeout$1 = g.setTimeout;
  var clearTimeout = g.clearTimeout;
  var document = window$1 && window$1.document;
  var navigator = window$1 && window$1.navigator;
  var localSessionStorage = function () {
    var x = 'qunit-test-string';

    try {
      g.sessionStorage.setItem(x, x);
      g.sessionStorage.removeItem(x);
      return g.sessionStorage;
    } catch (e) {
      return undefined;
    }
  }(); // Basic fallback for ES6 Map
  // Support: IE 9-10, Safari 7, PhantomJS

  var StringMap = typeof g.Map === 'function' ? g.Map : function StringMap() {
    var store = Object.create(null);
    var hasOwn = Object.prototype.hasOwnProperty;

    this.get = function (strKey) {
      return store[strKey];
    };

    this.set = function (strKey, val) {
      if (!hasOwn.call(store, strKey)) {
        this.size++;
      }

      store[strKey] = val;
      return this;
    };

    this.delete = function (strKey) {
      if (hasOwn.call(store, strKey)) {
        delete store[strKey];
        this.size--;
      }
    };

    this.forEach = function (callback) {
      for (var strKey in store) {
        callback(store[strKey], strKey);
      }
    };

    this.clear = function () {
      store = Object.create(null);
      this.size = 0;
    };

    this.size = 0;
  };

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  // Detect if the console object exists and no-op otherwise.
  // This allows support for IE 9, which doesn't have a console
  // object if the developer tools are not open.
  // Support: IE 9
  // Function#bind is supported, but no console.log.bind().
  // Support: SpiderMonkey (mozjs 68+)
  // The console object has a log method, but no warn method.

  var Logger = {
    warn: console$1 ? Function.prototype.bind.call(console$1.warn || console$1.log, console$1) : function () {}
  };

  var toString = Object.prototype.toString;
  var hasOwn$1 = Object.prototype.hasOwnProperty;
  var now = Date.now || function () {
    return new Date().getTime();
  };
  var nativePerf = getNativePerf();

  function getNativePerf() {
    if (window$1 && typeof window$1.performance !== 'undefined' && typeof window$1.performance.mark === 'function' && typeof window$1.performance.measure === 'function') {
      return window$1.performance;
    } else {
      return undefined;
    }
  }

  var performance = {
    now: nativePerf ? nativePerf.now.bind(nativePerf) : now,
    measure: nativePerf ? function (comment, startMark, endMark) {
      // `performance.measure` may fail if the mark could not be found.
      // reasons a specific mark could not be found include: outside code invoking `performance.clearMarks()`
      try {
        nativePerf.measure(comment, startMark, endMark);
      } catch (ex) {
        Logger.warn('performance.measure could not be executed because of ', ex.message);
      }
    } : function () {},
    mark: nativePerf ? nativePerf.mark.bind(nativePerf) : function () {}
  }; // Returns a new Array with the elements that are in a but not in b

  function diff(a, b) {
    var result = a.slice();

    for (var i = 0; i < result.length; i++) {
      for (var j = 0; j < b.length; j++) {
        if (result[i] === b[j]) {
          result.splice(i, 1);
          i--;
          break;
        }
      }
    }

    return result;
  }
  /**
   * Determines whether an element exists in a given array or not.
   *
   * @method inArray
   * @param {any} elem
   * @param {Array} array
   * @return {boolean}
   */

  function inArray(elem, array) {
    return array.indexOf(elem) !== -1;
  }
  /**
   * Recursively clone an object into a plain array or object, taking only the
   * own enumerable properties.
   *
   * @param {any} obj
   * @param {bool} [allowArray=true]
   * @return {Object|Array}
   */

  function objectValues(obj) {
    var allowArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var vals = allowArray && is('array', obj) ? [] : {};

    for (var key in obj) {
      if (hasOwn$1.call(obj, key)) {
        var val = obj[key];
        vals[key] = val === Object(val) ? objectValues(val, allowArray) : val;
      }
    }

    return vals;
  }
  /**
   * Recursively clone an object into a plain object, taking only the
   * subset of own enumerable properties that exist a given model.
   *
   * @param {any} obj
   * @param {any} model
   * @return {Object}
   */

  function objectValuesSubset(obj, model) {
    // Return primitive values unchanged to avoid false positives or confusing
    // results from assert.propContains().
    // E.g. an actual null or false wrongly equaling an empty object,
    // or an actual string being reported as object not matching a partial object.
    if (obj !== Object(obj)) {
      return obj;
    } // Unlike objectValues(), subset arrays to a plain objects as well.
    // This enables subsetting [20, 30] with {1: 30}.


    var subset = {};

    for (var key in model) {
      if (hasOwn$1.call(model, key) && hasOwn$1.call(obj, key)) {
        subset[key] = objectValuesSubset(obj[key], model[key]);
      }
    }

    return subset;
  }
  function extend(a, b, undefOnly) {
    for (var prop in b) {
      if (hasOwn$1.call(b, prop)) {
        if (b[prop] === undefined) {
          delete a[prop];
        } else if (!(undefOnly && typeof a[prop] !== 'undefined')) {
          a[prop] = b[prop];
        }
      }
    }

    return a;
  }
  function objectType(obj) {
    if (typeof obj === 'undefined') {
      return 'undefined';
    } // Consider: typeof null === object


    if (obj === null) {
      return 'null';
    }

    var match = toString.call(obj).match(/^\[object\s(.*)\]$/);
    var type = match && match[1];

    switch (type) {
      case 'Number':
        if (isNaN(obj)) {
          return 'nan';
        }

        return 'number';

      case 'String':
      case 'Boolean':
      case 'Array':
      case 'Set':
      case 'Map':
      case 'Date':
      case 'RegExp':
      case 'Function':
      case 'Symbol':
        return type.toLowerCase();

      default:
        return _typeof(obj);
    }
  } // Safe object type checking

  function is(type, obj) {
    return objectType(obj) === type;
  } // Based on Java's String.hashCode, a simple but not
  // rigorously collision resistant hashing function

  function generateHash(module, testName) {
    var str = module + '\x1C' + testName;
    var hash = 0;

    for (var i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    } // Convert the possibly negative integer hash code into an 8 character hex string, which isn't
    // strictly necessary but increases user understanding that the id is a SHA-like hash


    var hex = (0x100000000 + hash).toString(16);

    if (hex.length < 8) {
      hex = '0000000' + hex;
    }

    return hex.slice(-8);
  }
  /**
   * Converts an error into a simple string for comparisons.
   *
   * @param {Error|any} error
   * @return {string}
   */

  function errorString(error) {
    // Use String() instead of toString() to handle non-object values like undefined or null.
    var resultErrorString = String(error); // If the error wasn't a subclass of Error but something like
    // an object literal with name and message properties...

    if (resultErrorString.slice(0, 7) === '[object') {
      // Based on https://es5.github.io/#x15.11.4.4
      return (error.name || 'Error') + (error.message ? ": ".concat(error.message) : '');
    } else {
      return resultErrorString;
    }
  }

  // Authors: Philippe Rathé <prathe@gmail.com>, David Chan <david@troi.org>

  var equiv = (function () {
    // Value pairs queued for comparison. Used for breadth-first processing order, recursion
    // detection and avoiding repeated comparison (see below for details).
    // Elements are { a: val, b: val }.
    var pairs = [];

    var getProto = Object.getPrototypeOf || function (obj) {
      // eslint-disable-next-line no-proto
      return obj.__proto__;
    };

    function useStrictEquality(a, b) {
      // This only gets called if a and b are not strict equal, and is used to compare on
      // the primitive values inside object wrappers. For example:
      // `var i = 1;`
      // `var j = new Number(1);`
      // Neither a nor b can be null, as a !== b and they have the same type.
      if (_typeof(a) === 'object') {
        a = a.valueOf();
      }

      if (_typeof(b) === 'object') {
        b = b.valueOf();
      }

      return a === b;
    }

    function compareConstructors(a, b) {
      var protoA = getProto(a);
      var protoB = getProto(b); // Comparing constructors is more strict than using `instanceof`

      if (a.constructor === b.constructor) {
        return true;
      } // Ref #851
      // If the obj prototype descends from a null constructor, treat it
      // as a null prototype.


      if (protoA && protoA.constructor === null) {
        protoA = null;
      }

      if (protoB && protoB.constructor === null) {
        protoB = null;
      } // Allow objects with no prototype to be equivalent to
      // objects with Object as their constructor.


      if (protoA === null && protoB === Object.prototype || protoB === null && protoA === Object.prototype) {
        return true;
      }

      return false;
    }

    function getRegExpFlags(regexp) {
      return 'flags' in regexp ? regexp.flags : regexp.toString().match(/[gimuy]*$/)[0];
    }

    function isContainer(val) {
      return ['object', 'array', 'map', 'set'].indexOf(objectType(val)) !== -1;
    }

    function breadthFirstCompareChild(a, b) {
      // If a is a container not reference-equal to b, postpone the comparison to the
      // end of the pairs queue -- unless (a, b) has been seen before, in which case skip
      // over the pair.
      if (a === b) {
        return true;
      }

      if (!isContainer(a)) {
        return typeEquiv(a, b);
      }

      if (pairs.every(function (pair) {
        return pair.a !== a || pair.b !== b;
      })) {
        // Not yet started comparing this pair
        pairs.push({
          a: a,
          b: b
        });
      }

      return true;
    }

    var callbacks = {
      string: useStrictEquality,
      boolean: useStrictEquality,
      number: useStrictEquality,
      null: useStrictEquality,
      undefined: useStrictEquality,
      symbol: useStrictEquality,
      date: useStrictEquality,
      nan: function nan() {
        return true;
      },
      regexp: function regexp(a, b) {
        return a.source === b.source && // Include flags in the comparison
        getRegExpFlags(a) === getRegExpFlags(b);
      },
      // abort (identical references / instance methods were skipped earlier)
      function: function _function() {
        return false;
      },
      array: function array(a, b) {
        var len = a.length;

        if (len !== b.length) {
          // Safe and faster
          return false;
        }

        for (var i = 0; i < len; i++) {
          // Compare non-containers; queue non-reference-equal containers
          if (!breadthFirstCompareChild(a[i], b[i])) {
            return false;
          }
        }

        return true;
      },
      // Define sets a and b to be equivalent if for each element aVal in a, there
      // is some element bVal in b such that aVal and bVal are equivalent. Element
      // repetitions are not counted, so these are equivalent:
      // a = new Set( [ {}, [], [] ] );
      // b = new Set( [ {}, {}, [] ] );
      set: function set(a, b) {
        if (a.size !== b.size) {
          // This optimization has certain quirks because of the lack of
          // repetition counting. For instance, adding the same
          // (reference-identical) element to two equivalent sets can
          // make them non-equivalent.
          return false;
        }

        var outerEq = true;
        a.forEach(function (aVal) {
          // Short-circuit if the result is already known. (Using for...of
          // with a break clause would be cleaner here, but it would cause
          // a syntax error on older JavaScript implementations even if
          // Set is unused)
          if (!outerEq) {
            return;
          }

          var innerEq = false;
          b.forEach(function (bVal) {
            // Likewise, short-circuit if the result is already known
            if (innerEq) {
              return;
            } // Swap out the global pairs list, as the nested call to
            // innerEquiv will clobber its contents


            var parentPairs = pairs;

            if (innerEquiv(bVal, aVal)) {
              innerEq = true;
            } // Replace the global pairs list


            pairs = parentPairs;
          });

          if (!innerEq) {
            outerEq = false;
          }
        });
        return outerEq;
      },
      // Define maps a and b to be equivalent if for each key-value pair (aKey, aVal)
      // in a, there is some key-value pair (bKey, bVal) in b such that
      // [ aKey, aVal ] and [ bKey, bVal ] are equivalent. Key repetitions are not
      // counted, so these are equivalent:
      // a = new Map( [ [ {}, 1 ], [ {}, 1 ], [ [], 1 ] ] );
      // b = new Map( [ [ {}, 1 ], [ [], 1 ], [ [], 1 ] ] );
      map: function map(a, b) {
        if (a.size !== b.size) {
          // This optimization has certain quirks because of the lack of
          // repetition counting. For instance, adding the same
          // (reference-identical) key-value pair to two equivalent maps
          // can make them non-equivalent.
          return false;
        }

        var outerEq = true;
        a.forEach(function (aVal, aKey) {
          // Short-circuit if the result is already known. (Using for...of
          // with a break clause would be cleaner here, but it would cause
          // a syntax error on older JavaScript implementations even if
          // Map is unused)
          if (!outerEq) {
            return;
          }

          var innerEq = false;
          b.forEach(function (bVal, bKey) {
            // Likewise, short-circuit if the result is already known
            if (innerEq) {
              return;
            } // Swap out the global pairs list, as the nested call to
            // innerEquiv will clobber its contents


            var parentPairs = pairs;

            if (innerEquiv([bVal, bKey], [aVal, aKey])) {
              innerEq = true;
            } // Replace the global pairs list


            pairs = parentPairs;
          });

          if (!innerEq) {
            outerEq = false;
          }
        });
        return outerEq;
      },
      object: function object(a, b) {
        if (compareConstructors(a, b) === false) {
          return false;
        }

        var aProperties = [];
        var bProperties = []; // Be strict: don't ensure hasOwnProperty and go deep

        for (var i in a) {
          // Collect a's properties
          aProperties.push(i); // Skip OOP methods that look the same

          if (a.constructor !== Object && typeof a.constructor !== 'undefined' && typeof a[i] === 'function' && typeof b[i] === 'function' && a[i].toString() === b[i].toString()) {
            continue;
          } // Compare non-containers; queue non-reference-equal containers


          if (!breadthFirstCompareChild(a[i], b[i])) {
            return false;
          }
        }

        for (var _i in b) {
          // Collect b's properties
          bProperties.push(_i);
        } // Ensures identical properties name


        return typeEquiv(aProperties.sort(), bProperties.sort());
      }
    };

    function typeEquiv(a, b) {
      var type = objectType(a); // Callbacks for containers will append to the pairs queue to achieve breadth-first
      // search order. The pairs queue is also used to avoid reprocessing any pair of
      // containers that are reference-equal to a previously visited pair (a special case
      // this being recursion detection).
      //
      // Because of this approach, once typeEquiv returns a false value, it should not be
      // called again without clearing the pair queue else it may wrongly report a visited
      // pair as being equivalent.

      return objectType(b) === type && callbacks[type](a, b);
    }

    function innerEquiv(a, b) {
      // We're done when there's nothing more to compare
      if (arguments.length < 2) {
        return true;
      } // Clear the global pair queue and add the top-level values being compared


      pairs = [{
        a: a,
        b: b
      }];

      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i]; // Perform type-specific comparison on any pairs that are not strictly
        // equal. For container types, that comparison will postpone comparison
        // of any sub-container pair to the end of the pair queue. This gives
        // breadth-first search order. It also avoids the reprocessing of
        // reference-equal siblings, cousins etc, which can have a significant speed
        // impact when comparing a container of small objects each of which has a
        // reference to the same (singleton) large object.

        if (pair.a !== pair.b && !typeEquiv(pair.a, pair.b)) {
          return false;
        }
      } // ...across all consecutive argument pairs


      return arguments.length === 2 || innerEquiv.apply(this, [].slice.call(arguments, 1));
    }

    return function () {
      var result = innerEquiv.apply(void 0, arguments); // Release any retained objects

      pairs.length = 0;
      return result;
    };
  })();

  /**
   * Config object: Maintain internal state
   * Later exposed as QUnit.config
   * `config` initialized at top of scope
   */

  var config = {
    // The queue of tests to run
    queue: [],
    stats: {
      all: 0,
      bad: 0,
      testCount: 0
    },
    // Block until document ready
    blocking: true,
    // whether or not to fail when there are zero tests
    // defaults to `true`
    failOnZeroTests: true,
    // By default, run previously failed tests first
    // very useful in combination with "Hide passed tests" checked
    reorder: true,
    // By default, modify document.title when suite is done
    altertitle: true,
    // HTML Reporter: collapse every test except the first failing test
    // If false, all failing tests will be expanded
    collapse: true,
    // By default, scroll to top of the page when suite is done
    scrolltop: true,
    // Depth up-to which object will be dumped
    maxDepth: 5,
    // When enabled, all tests must call expect()
    requireExpects: false,
    // Placeholder for user-configurable form-exposed URL parameters
    urlConfig: [],
    // Set of all modules.
    modules: [],
    // The first unnamed module
    //
    // By being defined as the intial value for currentModule, it is the
    // receptacle and implied parent for any global tests. It is as if we
    // called `QUnit.module( "" );` before any other tests were defined.
    //
    // If we reach begin() and no tests were put in it, we dequeue it as if it
    // never existed, and in that case never expose it to the events and
    // callbacks API.
    //
    // When global tests are defined, then this unnamed module will execute
    // as any other module, including moduleStart/moduleDone events etc.
    //
    // Since this module isn't explicitly created by the user, they have no
    // access to add hooks for it. The hooks object is defined to comply
    // with internal expectations of test.js, but they will be empty.
    // To apply hooks, place tests explicitly in a QUnit.module(), and use
    // its hooks accordingly.
    //
    // For global hooks that apply to all tests and all modules, use QUnit.hooks.
    //
    // NOTE: This is *not* a "global module". It is not an ancestor of all modules
    // and tests. It is merely the parent for any tests defined globally,
    // before the first QUnit.module(). As such, the events for this unnamed
    // module will fire as normal, right after its last test, and *not* at
    // the end of the test run.
    //
    // NOTE: This also should probably also not become a global module, unless
    // we keep it out of the public API. For example, it would likely not
    // improve the user interface and plugin behaviour if all modules became
    // wrapped between the start and end events of this module, and thus
    // needlessly add indentation, indirection, or other visible noise.
    // Unit tests for the callbacks API would detect that as a regression.
    currentModule: {
      name: '',
      tests: [],
      childModules: [],
      testsRun: 0,
      testsIgnored: 0,
      hooks: {
        before: [],
        beforeEach: [],
        afterEach: [],
        after: []
      }
    },
    // Exposed to make resets easier
    // Ref https://github.com/qunitjs/qunit/pull/1598
    globalHooks: {},
    callbacks: {},
    // The storage module to use for reordering tests
    storage: localSessionStorage
  }; // Apply a predefined QUnit.config object
  //
  // Ignore QUnit.config if it is a QUnit distribution instead of preconfig.
  // That means QUnit was loaded twice! (Use the same approach as export.js)

  var preConfig = g && g.QUnit && !g.QUnit.version && g.QUnit.config;

  if (preConfig) {
    extend(config, preConfig);
  } // Push a loose unnamed module to the modules collection


  config.modules.push(config.currentModule);

  var dump = (function () {
    function quote(str) {
      return '"' + str.toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }

    function literal(o) {
      return o + '';
    }

    function join(pre, arr, post) {
      var s = dump.separator();
      var inner = dump.indent(1);

      if (arr.join) {
        arr = arr.join(',' + s + inner);
      }

      if (!arr) {
        return pre + post;
      }

      var base = dump.indent();
      return [pre, inner + arr, base + post].join(s);
    }

    function array(arr, stack) {
      if (dump.maxDepth && dump.depth > dump.maxDepth) {
        return '[object Array]';
      }

      this.up();
      var i = arr.length;
      var ret = new Array(i);

      while (i--) {
        ret[i] = this.parse(arr[i], undefined, stack);
      }

      this.down();
      return join('[', ret, ']');
    }

    function isArray(obj) {
      return (// Native Arrays
        toString.call(obj) === '[object Array]' || typeof obj.length === 'number' && obj.item !== undefined && (obj.length ? obj.item(0) === obj[0] : obj.item(0) === null && obj[0] === undefined)
      );
    }

    var reName = /^function (\w+)/;
    var dump = {
      // The objType is used mostly internally, you can fix a (custom) type in advance
      parse: function parse(obj, objType, stack) {
        stack = stack || [];
        var objIndex = stack.indexOf(obj);

        if (objIndex !== -1) {
          return "recursion(".concat(objIndex - stack.length, ")");
        }

        objType = objType || this.typeOf(obj);
        var parser = this.parsers[objType];

        var parserType = _typeof(parser);

        if (parserType === 'function') {
          stack.push(obj);
          var res = parser.call(this, obj, stack);
          stack.pop();
          return res;
        }

        if (parserType === 'string') {
          return parser;
        }

        return '[ERROR: Missing QUnit.dump formatter for type ' + objType + ']';
      },
      typeOf: function typeOf(obj) {
        var type;

        if (obj === null) {
          type = 'null';
        } else if (typeof obj === 'undefined') {
          type = 'undefined';
        } else if (is('regexp', obj)) {
          type = 'regexp';
        } else if (is('date', obj)) {
          type = 'date';
        } else if (is('function', obj)) {
          type = 'function';
        } else if (obj.setInterval !== undefined && obj.document !== undefined && obj.nodeType === undefined) {
          type = 'window';
        } else if (obj.nodeType === 9) {
          type = 'document';
        } else if (obj.nodeType) {
          type = 'node';
        } else if (isArray(obj)) {
          type = 'array';
        } else if (obj.constructor === Error.prototype.constructor) {
          type = 'error';
        } else {
          type = _typeof(obj);
        }

        return type;
      },
      separator: function separator() {
        if (this.multiline) {
          return this.HTML ? '<br />' : '\n';
        } else {
          return this.HTML ? '&#160;' : ' ';
        }
      },
      // Extra can be a number, shortcut for increasing-calling-decreasing
      indent: function indent(extra) {
        if (!this.multiline) {
          return '';
        }

        var chr = this.indentChar;

        if (this.HTML) {
          chr = chr.replace(/\t/g, '   ').replace(/ /g, '&#160;');
        }

        return new Array(this.depth + (extra || 0)).join(chr);
      },
      up: function up(a) {
        this.depth += a || 1;
      },
      down: function down(a) {
        this.depth -= a || 1;
      },
      setParser: function setParser(name, parser) {
        this.parsers[name] = parser;
      },
      // The next 3 are exposed so you can use them
      quote: quote,
      literal: literal,
      join: join,
      depth: 1,
      maxDepth: config.maxDepth,
      // This is the list of parsers, to modify them, use dump.setParser
      parsers: {
        window: '[Window]',
        document: '[Document]',
        error: function error(_error) {
          return 'Error("' + _error.message + '")';
        },
        // This has been unused since QUnit 1.0.0.
        // @todo Deprecate and remove.
        unknown: '[Unknown]',
        null: 'null',
        undefined: 'undefined',
        function: function _function(fn) {
          var ret = 'function'; // Functions never have name in IE

          var name = 'name' in fn ? fn.name : (reName.exec(fn) || [])[1];

          if (name) {
            ret += ' ' + name;
          }

          ret += '(';
          ret = [ret, dump.parse(fn, 'functionArgs'), '){'].join('');
          return join(ret, dump.parse(fn, 'functionCode'), '}');
        },
        array: array,
        nodelist: array,
        arguments: array,
        object: function object(map, stack) {
          var ret = [];

          if (dump.maxDepth && dump.depth > dump.maxDepth) {
            return '[object Object]';
          }

          dump.up();
          var keys = [];

          for (var key in map) {
            keys.push(key);
          } // Some properties are not always enumerable on Error objects.


          var nonEnumerableProperties = ['message', 'name'];

          for (var i in nonEnumerableProperties) {
            var _key = nonEnumerableProperties[i];

            if (_key in map && !inArray(_key, keys)) {
              keys.push(_key);
            }
          }

          keys.sort();

          for (var _i = 0; _i < keys.length; _i++) {
            var _key2 = keys[_i];
            var val = map[_key2];
            ret.push(dump.parse(_key2, 'key') + ': ' + dump.parse(val, undefined, stack));
          }

          dump.down();
          return join('{', ret, '}');
        },
        node: function node(_node) {
          var open = dump.HTML ? '&lt;' : '<';
          var close = dump.HTML ? '&gt;' : '>';

          var tag = _node.nodeName.toLowerCase();

          var ret = open + tag;
          var attrs = _node.attributes;

          if (attrs) {
            for (var i = 0, len = attrs.length; i < len; i++) {
              var val = attrs[i].nodeValue; // IE6 includes all attributes in .attributes, even ones not explicitly
              // set. Those have values like undefined, null, 0, false, "" or
              // "inherit".

              if (val && val !== 'inherit') {
                ret += ' ' + attrs[i].nodeName + '=' + dump.parse(val, 'attribute');
              }
            }
          }

          ret += close; // Show content of TextNode or CDATASection

          if (_node.nodeType === 3 || _node.nodeType === 4) {
            ret += _node.nodeValue;
          }

          return ret + open + '/' + tag + close;
        },
        // Function calls it internally, it's the arguments part of the function
        functionArgs: function functionArgs(fn) {
          var l = fn.length;

          if (!l) {
            return '';
          }

          var args = new Array(l);

          while (l--) {
            // 97 is 'a'
            args[l] = String.fromCharCode(97 + l);
          }

          return ' ' + args.join(', ') + ' ';
        },
        // Object calls it internally, the key part of an item in a map
        key: quote,
        // Function calls it internally, it's the content of the function
        functionCode: '[code]',
        // Node calls it internally, it's a html attribute value
        attribute: quote,
        string: quote,
        date: quote,
        regexp: literal,
        number: literal,
        boolean: literal,
        symbol: function symbol(sym) {
          return sym.toString();
        }
      },
      // If true, entities are escaped ( <, >, \t, space and \n )
      HTML: false,
      // Indentation unit
      indentChar: '  ',
      // If true, items in a collection, are separated by a \n, else just a space.
      multiline: true
    };
    return dump;
  })();

  var SuiteReport = /*#__PURE__*/function () {
    function SuiteReport(name, parentSuite) {
      _classCallCheck(this, SuiteReport);

      this.name = name;
      this.fullName = parentSuite ? parentSuite.fullName.concat(name) : []; // When an "error" event is emitted from onUncaughtException(), the
      // "runEnd" event should report the status as failed. The "runEnd" event data
      // is tracked through this property (via the "runSuite" instance).

      this.globalFailureCount = 0;
      this.tests = [];
      this.childSuites = [];

      if (parentSuite) {
        parentSuite.pushChildSuite(this);
      }
    }

    _createClass(SuiteReport, [{
      key: "start",
      value: function start(recordTime) {
        if (recordTime) {
          this._startTime = performance.now();
          var suiteLevel = this.fullName.length;
          performance.mark("qunit_suite_".concat(suiteLevel, "_start"));
        }

        return {
          name: this.name,
          fullName: this.fullName.slice(),
          tests: this.tests.map(function (test) {
            return test.start();
          }),
          childSuites: this.childSuites.map(function (suite) {
            return suite.start();
          }),
          testCounts: {
            total: this.getTestCounts().total
          }
        };
      }
    }, {
      key: "end",
      value: function end(recordTime) {
        if (recordTime) {
          this._endTime = performance.now();
          var suiteLevel = this.fullName.length;
          var suiteName = this.fullName.join(' – ');
          performance.mark("qunit_suite_".concat(suiteLevel, "_end"));
          performance.measure(suiteLevel === 0 ? 'QUnit Test Run' : "QUnit Test Suite: ".concat(suiteName), "qunit_suite_".concat(suiteLevel, "_start"), "qunit_suite_".concat(suiteLevel, "_end"));
        }

        return {
          name: this.name,
          fullName: this.fullName.slice(),
          tests: this.tests.map(function (test) {
            return test.end();
          }),
          childSuites: this.childSuites.map(function (suite) {
            return suite.end();
          }),
          testCounts: this.getTestCounts(),
          runtime: this.getRuntime(),
          status: this.getStatus()
        };
      }
    }, {
      key: "pushChildSuite",
      value: function pushChildSuite(suite) {
        this.childSuites.push(suite);
      }
    }, {
      key: "pushTest",
      value: function pushTest(test) {
        this.tests.push(test);
      }
    }, {
      key: "getRuntime",
      value: function getRuntime() {
        return this._endTime - this._startTime;
      }
    }, {
      key: "getTestCounts",
      value: function getTestCounts() {
        var counts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
          passed: 0,
          failed: 0,
          skipped: 0,
          todo: 0,
          total: 0
        };
        counts.failed += this.globalFailureCount;
        counts.total += this.globalFailureCount;
        counts = this.tests.reduce(function (counts, test) {
          if (test.valid) {
            counts[test.getStatus()]++;
            counts.total++;
          }

          return counts;
        }, counts);
        return this.childSuites.reduce(function (counts, suite) {
          return suite.getTestCounts(counts);
        }, counts);
      }
    }, {
      key: "getStatus",
      value: function getStatus() {
        var _this$getTestCounts = this.getTestCounts(),
            total = _this$getTestCounts.total,
            failed = _this$getTestCounts.failed,
            skipped = _this$getTestCounts.skipped,
            todo = _this$getTestCounts.todo;

        if (failed) {
          return 'failed';
        } else {
          if (skipped === total) {
            return 'skipped';
          } else if (todo === total) {
            return 'todo';
          } else {
            return 'passed';
          }
        }
      }
    }]);

    return SuiteReport;
  }();

  var moduleStack = [];
  var runSuite = new SuiteReport();

  function isParentModuleInQueue() {
    var modulesInQueue = config.modules.filter(function (module) {
      return !module.ignored;
    }).map(function (module) {
      return module.moduleId;
    });
    return moduleStack.some(function (module) {
      return modulesInQueue.includes(module.moduleId);
    });
  }

  function createModule(name, testEnvironment, modifiers) {
    var parentModule = moduleStack.length ? moduleStack.slice(-1)[0] : null;
    var moduleName = parentModule !== null ? [parentModule.name, name].join(' > ') : name;
    var parentSuite = parentModule ? parentModule.suiteReport : runSuite;
    var skip = parentModule !== null && parentModule.skip || modifiers.skip;
    var todo = parentModule !== null && parentModule.todo || modifiers.todo;
    var env = {};

    if (parentModule) {
      extend(env, parentModule.testEnvironment);
    }

    extend(env, testEnvironment);
    var module = {
      name: moduleName,
      parentModule: parentModule,
      hooks: {
        before: [],
        beforeEach: [],
        afterEach: [],
        after: []
      },
      testEnvironment: env,
      tests: [],
      moduleId: generateHash(moduleName),
      testsRun: 0,
      testsIgnored: 0,
      childModules: [],
      suiteReport: new SuiteReport(name, parentSuite),
      // Initialised by test.js when the module start executing,
      // i.e. before the first test in this module (or a child).
      stats: null,
      // Pass along `skip` and `todo` properties from parent module, in case
      // there is one, to childs. And use own otherwise.
      // This property will be used to mark own tests and tests of child suites
      // as either `skipped` or `todo`.
      skip: skip,
      todo: skip ? false : todo,
      ignored: modifiers.ignored || false
    };

    if (parentModule) {
      parentModule.childModules.push(module);
    }

    config.modules.push(module);
    return module;
  }

  function setHookFromEnvironment(hooks, environment, name) {
    var potentialHook = environment[name];

    if (typeof potentialHook === 'function') {
      hooks[name].push(potentialHook);
    }

    delete environment[name];
  }

  function makeSetHook(module, hookName) {
    return function setHook(callback) {
      if (config.currentModule !== module) {
        Logger.warn('The `' + hookName + '` hook was called inside the wrong module (`' + config.currentModule.name + '`). ' + 'Instead, use hooks provided by the callback to the containing module (`' + module.name + '`). ' + 'This will become an error in QUnit 3.0.');
      }

      module.hooks[hookName].push(callback);
    };
  }

  function processModule(name, options, executeNow) {
    var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (objectType(options) === 'function') {
      executeNow = options;
      options = undefined;
    }

    var module = createModule(name, options, modifiers); // Transfer any initial hooks from the options object to the 'hooks' object

    var testEnvironment = module.testEnvironment;
    var hooks = module.hooks;
    setHookFromEnvironment(hooks, testEnvironment, 'before');
    setHookFromEnvironment(hooks, testEnvironment, 'beforeEach');
    setHookFromEnvironment(hooks, testEnvironment, 'afterEach');
    setHookFromEnvironment(hooks, testEnvironment, 'after');
    var moduleFns = {
      before: makeSetHook(module, 'before'),
      beforeEach: makeSetHook(module, 'beforeEach'),
      afterEach: makeSetHook(module, 'afterEach'),
      after: makeSetHook(module, 'after')
    };
    var prevModule = config.currentModule;
    config.currentModule = module;

    if (objectType(executeNow) === 'function') {
      moduleStack.push(module);

      try {
        var cbReturnValue = executeNow.call(module.testEnvironment, moduleFns);

        if (cbReturnValue != null && objectType(cbReturnValue.then) === 'function') {
          Logger.warn('Returning a promise from a module callback is not supported. ' + 'Instead, use hooks for async behavior. ' + 'This will become an error in QUnit 3.0.');
        }
      } finally {
        // If the module closure threw an uncaught error during the load phase,
        // we let this bubble up to global error handlers. But, not until after
        // we teardown internal state to ensure correct module nesting.
        // Ref https://github.com/qunitjs/qunit/issues/1478.
        moduleStack.pop();
        config.currentModule = module.parentModule || prevModule;
      }
    }
  }

  var focused$1 = false; // indicates that the "only" filter was used

  function module$1(name, options, executeNow) {
    var ignored = focused$1 && !isParentModuleInQueue();
    processModule(name, options, executeNow, {
      ignored: ignored
    });
  }

  module$1.only = function () {
    if (!focused$1) {
      // Upon the first module.only() call,
      // delete any and all previously registered modules and tests.
      config.modules.length = 0;
      config.queue.length = 0; // Ignore any tests declared after this block within the same
      // module parent. https://github.com/qunitjs/qunit/issues/1645

      config.currentModule.ignored = true;
    }

    focused$1 = true;
    processModule.apply(void 0, arguments);
  };

  module$1.skip = function (name, options, executeNow) {
    if (focused$1) {
      return;
    }

    processModule(name, options, executeNow, {
      skip: true
    });
  };

  module$1.todo = function (name, options, executeNow) {
    if (focused$1) {
      return;
    }

    processModule(name, options, executeNow, {
      todo: true
    });
  };

  // Doesn't support IE9, it will return undefined on these browsers
  // See also https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error/Stack
  var fileName = (sourceFromStacktrace(0) || '').replace(/(:\d+)+\)?/, '').replace(/.+\//, '');
  function extractStacktrace(e, offset) {
    offset = offset === undefined ? 4 : offset;

    if (e && e.stack) {
      var stack = e.stack.split('\n');

      if (/^error$/i.test(stack[0])) {
        stack.shift();
      }

      if (fileName) {
        var include = [];

        for (var i = offset; i < stack.length; i++) {
          if (stack[i].indexOf(fileName) !== -1) {
            break;
          }

          include.push(stack[i]);
        }

        if (include.length) {
          return include.join('\n');
        }
      }

      return stack[offset];
    }
  }
  function sourceFromStacktrace(offset) {
    var error = new Error(); // Support: Safari <=7 only, IE <=10 - 11 only
    // Not all browsers generate the `stack` property for `new Error()`, see also #636

    if (!error.stack) {
      try {
        throw error;
      } catch (err) {
        error = err;
      }
    }

    return extractStacktrace(error, offset);
  }

  var Assert = /*#__PURE__*/function () {
    function Assert(testContext) {
      _classCallCheck(this, Assert);

      this.test = testContext;
    }

    _createClass(Assert, [{
      key: "timeout",
      value: function timeout(duration) {
        if (typeof duration !== 'number') {
          throw new Error('You must pass a number as the duration to assert.timeout');
        }

        this.test.timeout = duration; // If a timeout has been set, clear it and reset with the new duration

        if (config.timeout) {
          clearTimeout(config.timeout);
          config.timeout = null;

          if (config.timeoutHandler && this.test.timeout > 0) {
            this.test.internalResetTimeout(this.test.timeout);
          }
        }
      } // Documents a "step", which is a string value, in a test as a passing assertion

    }, {
      key: "step",
      value: function step(message) {
        var assertionMessage = message;
        var result = !!message;
        this.test.steps.push(message);

        if (objectType(message) === 'undefined' || message === '') {
          assertionMessage = 'You must provide a message to assert.step';
        } else if (objectType(message) !== 'string') {
          assertionMessage = 'You must provide a string value to assert.step';
          result = false;
        }

        this.pushResult({
          result: result,
          message: assertionMessage
        });
      } // Verifies the steps in a test match a given array of string values

    }, {
      key: "verifySteps",
      value: function verifySteps(steps, message) {
        // Since the steps array is just string values, we can clone with slice
        var actualStepsClone = this.test.steps.slice();
        this.deepEqual(actualStepsClone, steps, message);
        this.test.steps.length = 0;
      } // Specify the number of expected assertions to guarantee that failed test
      // (no assertions are run at all) don't slip through.

    }, {
      key: "expect",
      value: function expect(asserts) {
        if (arguments.length === 1) {
          this.test.expected = asserts;
        } else {
          return this.test.expected;
        }
      } // Create a new async pause and return a new function that can release the pause.

    }, {
      key: "async",
      value: function async(count) {
        var requiredCalls = count === undefined ? 1 : count;
        return this.test.internalStop(requiredCalls);
      } // Exports test.push() to the user API
      // Alias of pushResult.

    }, {
      key: "push",
      value: function push(result, actual, expected, message, negative) {
        Logger.warn('assert.push is deprecated and will be removed in QUnit 3.0.' + ' Please use assert.pushResult instead (https://api.qunitjs.com/assert/pushResult).');
        var currentAssert = this instanceof Assert ? this : config.current.assert;
        return currentAssert.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message,
          negative: negative
        });
      }
    }, {
      key: "pushResult",
      value: function pushResult(resultInfo) {
        // Destructure of resultInfo = { result, actual, expected, message, negative }
        var assert = this;
        var currentTest = assert instanceof Assert && assert.test || config.current; // Backwards compatibility fix.
        // Allows the direct use of global exported assertions and QUnit.assert.*
        // Although, it's use is not recommended as it can leak assertions
        // to other tests from async tests, because we only get a reference to the current test,
        // not exactly the test where assertion were intended to be called.

        if (!currentTest) {
          throw new Error('assertion outside test context, in ' + sourceFromStacktrace(2));
        }

        if (!(assert instanceof Assert)) {
          assert = currentTest.assert;
        }

        return assert.test.pushResult(resultInfo);
      }
    }, {
      key: "ok",
      value: function ok(result, message) {
        if (!message) {
          message = result ? 'okay' : "failed, expected argument to be truthy, was: ".concat(dump.parse(result));
        }

        this.pushResult({
          result: !!result,
          actual: result,
          expected: true,
          message: message
        });
      }
    }, {
      key: "notOk",
      value: function notOk(result, message) {
        if (!message) {
          message = !result ? 'okay' : "failed, expected argument to be falsy, was: ".concat(dump.parse(result));
        }

        this.pushResult({
          result: !result,
          actual: result,
          expected: false,
          message: message
        });
      }
    }, {
      key: "true",
      value: function _true(result, message) {
        this.pushResult({
          result: result === true,
          actual: result,
          expected: true,
          message: message
        });
      }
    }, {
      key: "false",
      value: function _false(result, message) {
        this.pushResult({
          result: result === false,
          actual: result,
          expected: false,
          message: message
        });
      }
    }, {
      key: "equal",
      value: function equal(actual, expected, message) {
        // eslint-disable-next-line eqeqeq
        var result = expected == actual;
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      }
    }, {
      key: "notEqual",
      value: function notEqual(actual, expected, message) {
        // eslint-disable-next-line eqeqeq
        var result = expected != actual;
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message,
          negative: true
        });
      }
    }, {
      key: "propEqual",
      value: function propEqual(actual, expected, message) {
        actual = objectValues(actual);
        expected = objectValues(expected);
        this.pushResult({
          result: equiv(actual, expected),
          actual: actual,
          expected: expected,
          message: message
        });
      }
    }, {
      key: "notPropEqual",
      value: function notPropEqual(actual, expected, message) {
        actual = objectValues(actual);
        expected = objectValues(expected);
        this.pushResult({
          result: !equiv(actual, expected),
          actual: actual,
          expected: expected,
          message: message,
          negative: true
        });
      }
    }, {
      key: "propContains",
      value: function propContains(actual, expected, message) {
        actual = objectValuesSubset(actual, expected); // The expected parameter is usually a plain object, but clone it for
        // consistency with propEqual(), and to make it easy to explain that
        // inheritence is not considered (on either side), and to support
        // recursively checking subsets of nested objects.

        expected = objectValues(expected, false);
        this.pushResult({
          result: equiv(actual, expected),
          actual: actual,
          expected: expected,
          message: message
        });
      }
    }, {
      key: "notPropContains",
      value: function notPropContains(actual, expected, message) {
        actual = objectValuesSubset(actual, expected);
        expected = objectValues(expected);
        this.pushResult({
          result: !equiv(actual, expected),
          actual: actual,
          expected: expected,
          message: message,
          negative: true
        });
      }
    }, {
      key: "deepEqual",
      value: function deepEqual(actual, expected, message) {
        this.pushResult({
          result: equiv(actual, expected),
          actual: actual,
          expected: expected,
          message: message
        });
      }
    }, {
      key: "notDeepEqual",
      value: function notDeepEqual(actual, expected, message) {
        this.pushResult({
          result: !equiv(actual, expected),
          actual: actual,
          expected: expected,
          message: message,
          negative: true
        });
      }
    }, {
      key: "strictEqual",
      value: function strictEqual(actual, expected, message) {
        this.pushResult({
          result: expected === actual,
          actual: actual,
          expected: expected,
          message: message
        });
      }
    }, {
      key: "notStrictEqual",
      value: function notStrictEqual(actual, expected, message) {
        this.pushResult({
          result: expected !== actual,
          actual: actual,
          expected: expected,
          message: message,
          negative: true
        });
      }
    }, {
      key: 'throws',
      value: function throws(block, expected, message) {
        var _validateExpectedExce = validateExpectedExceptionArgs(expected, message, 'throws');

        var _validateExpectedExce2 = _slicedToArray(_validateExpectedExce, 2);

        expected = _validateExpectedExce2[0];
        message = _validateExpectedExce2[1];
        var currentTest = this instanceof Assert && this.test || config.current;

        if (objectType(block) !== 'function') {
          var _message = 'The value provided to `assert.throws` in ' + '"' + currentTest.testName + '" was not a function.';

          currentTest.assert.pushResult({
            result: false,
            actual: block,
            message: _message
          });
          return;
        }

        var actual;
        var result = false;
        currentTest.ignoreGlobalErrors = true;

        try {
          block.call(currentTest.testEnvironment);
        } catch (e) {
          actual = e;
        }

        currentTest.ignoreGlobalErrors = false;

        if (actual) {
          var _validateException = validateException(actual, expected, message);

          var _validateException2 = _slicedToArray(_validateException, 3);

          result = _validateException2[0];
          expected = _validateException2[1];
          message = _validateException2[2];
        }

        currentTest.assert.pushResult({
          result: result,
          // undefined if it didn't throw
          actual: actual && errorString(actual),
          expected: expected,
          message: message
        });
      }
    }, {
      key: "rejects",
      value: function rejects(promise, expected, message) {
        var _validateExpectedExce3 = validateExpectedExceptionArgs(expected, message, 'rejects');

        var _validateExpectedExce4 = _slicedToArray(_validateExpectedExce3, 2);

        expected = _validateExpectedExce4[0];
        message = _validateExpectedExce4[1];
        var currentTest = this instanceof Assert && this.test || config.current;
        var then = promise && promise.then;

        if (objectType(then) !== 'function') {
          var _message2 = 'The value provided to `assert.rejects` in ' + '"' + currentTest.testName + '" was not a promise.';

          currentTest.assert.pushResult({
            result: false,
            message: _message2,
            actual: promise
          });
          return;
        }

        var done = this.async();
        return then.call(promise, function handleFulfillment() {
          var message = 'The promise returned by the `assert.rejects` callback in ' + '"' + currentTest.testName + '" did not reject.';
          currentTest.assert.pushResult({
            result: false,
            message: message,
            actual: promise
          });
          done();
        }, function handleRejection(actual) {
          var result;

          var _validateException3 = validateException(actual, expected, message);

          var _validateException4 = _slicedToArray(_validateException3, 3);

          result = _validateException4[0];
          expected = _validateException4[1];
          message = _validateException4[2];
          currentTest.assert.pushResult({
            result: result,
            // leave rejection value of undefined as-is
            actual: actual && errorString(actual),
            expected: expected,
            message: message
          });
          done();
        });
      }
    }]);

    return Assert;
  }();

  function validateExpectedExceptionArgs(expected, message, assertionMethod) {
    var expectedType = objectType(expected); // 'expected' is optional unless doing string comparison

    if (expectedType === 'string') {
      if (message === undefined) {
        message = expected;
        expected = undefined;
        return [expected, message];
      } else {
        throw new Error('assert.' + assertionMethod + ' does not accept a string value for the expected argument.\n' + 'Use a non-string object value (e.g. RegExp or validator function) ' + 'instead if necessary.');
      }
    }

    var valid = !expected || // TODO: be more explicit here
    expectedType === 'regexp' || expectedType === 'function' || expectedType === 'object';

    if (!valid) {
      var _message3 = 'Invalid expected value type (' + expectedType + ') ' + 'provided to assert.' + assertionMethod + '.';

      throw new Error(_message3);
    }

    return [expected, message];
  }

  function validateException(actual, expected, message) {
    var result = false;
    var expectedType = objectType(expected); // These branches should be exhaustive, based on validation done in validateExpectedException
    // We don't want to validate

    if (!expected) {
      result = true; // Expected is a regexp
    } else if (expectedType === 'regexp') {
      result = expected.test(errorString(actual)); // Log the string form of the regexp

      expected = String(expected); // Expected is a constructor, maybe an Error constructor.
      // Note the extra check on its prototype - this is an implicit
      // requirement of "instanceof", else it will throw a TypeError.
    } else if (expectedType === 'function' && expected.prototype !== undefined && actual instanceof expected) {
      result = true; // Expected is an Error object
    } else if (expectedType === 'object') {
      result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message; // Log the string form of the Error object

      expected = errorString(expected); // Expected is a validation function which returns true if validation passed
    } else if (expectedType === 'function') {
      // protect against accidental semantics which could hard error in the test
      try {
        result = expected.call({}, actual) === true;
        expected = null;
      } catch (e) {
        // assign the "expected" to a nice error string to communicate the local failure to the user
        expected = errorString(e);
      }
    }

    return [result, expected, message];
  } // Provide an alternative to assert.throws(), for environments that consider throws a reserved word
  // Known to us are: Closure Compiler, Narwhal
  // eslint-disable-next-line dot-notation


  Assert.prototype.raises = Assert.prototype['throws'];

  var LISTENERS = Object.create(null);
  var SUPPORTED_EVENTS = ['error', 'runStart', 'suiteStart', 'testStart', 'assertion', 'testEnd', 'suiteEnd', 'runEnd'];
  /**
   * Emits an event with the specified data to all currently registered listeners.
   * Callbacks will fire in the order in which they are registered (FIFO). This
   * function is not exposed publicly; it is used by QUnit internals to emit
   * logging events.
   *
   * @private
   * @method emit
   * @param {string} eventName
   * @param {Object} data
   * @return {void}
   */

  function emit(eventName, data) {
    if (objectType(eventName) !== 'string') {
      throw new TypeError('eventName must be a string when emitting an event');
    } // Clone the callbacks in case one of them registers a new callback


    var originalCallbacks = LISTENERS[eventName];
    var callbacks = originalCallbacks ? _toConsumableArray(originalCallbacks) : [];

    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i](data);
    }
  }
  /**
   * Registers a callback as a listener to the specified event.
   *
   * @public
   * @method on
   * @param {string} eventName
   * @param {Function} callback
   * @return {void}
   */

  function on(eventName, callback) {
    if (objectType(eventName) !== 'string') {
      throw new TypeError('eventName must be a string when registering a listener');
    } else if (!inArray(eventName, SUPPORTED_EVENTS)) {
      var events = SUPPORTED_EVENTS.join(', ');
      throw new Error("\"".concat(eventName, "\" is not a valid event; must be one of: ").concat(events, "."));
    } else if (objectType(callback) !== 'function') {
      throw new TypeError('callback must be a function when registering a listener');
    }

    if (!LISTENERS[eventName]) {
      LISTENERS[eventName] = [];
    } // Don't register the same callback more than once


    if (!inArray(callback, LISTENERS[eventName])) {
      LISTENERS[eventName].push(callback);
    }
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function commonjsRequire (path) {
  	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
  }

  var promisePolyfill = {exports: {}};

  (function () {
    /** @suppress {undefinedVars} */

    var globalNS = function () {
      // the only reliable means to get the global object is
      // `Function('return this')()`
      // However, this causes CSP violations in Chrome apps.
      if (typeof globalThis !== 'undefined') {
        return globalThis;
      }

      if (typeof self !== 'undefined') {
        return self;
      }

      if (typeof window !== 'undefined') {
        return window;
      }

      if (typeof commonjsGlobal !== 'undefined') {
        return commonjsGlobal;
      }

      throw new Error('unable to locate global object');
    }(); // Expose the polyfill if Promise is undefined or set to a
    // non-function value. The latter can be due to a named HTMLElement
    // being exposed by browsers for legacy reasons.
    // https://github.com/taylorhakes/promise-polyfill/issues/114


    if (typeof globalNS['Promise'] === 'function') {
      promisePolyfill.exports = globalNS['Promise'];
      return;
    }
    /**
     * @this {Promise}
     */


    function finallyConstructor(callback) {
      var constructor = this.constructor;
      return this.then(function (value) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function () {
          // @ts-ignore
          return constructor.reject(reason);
        });
      });
    }

    function allSettled(arr) {
      var P = this;
      return new P(function (resolve, reject) {
        if (!(arr && typeof arr.length !== 'undefined')) {
          return reject(new TypeError(_typeof(arr) + ' ' + arr + ' is not iterable(cannot read property Symbol(Symbol.iterator))'));
        }

        var args = Array.prototype.slice.call(arr);
        if (args.length === 0) return resolve([]);
        var remaining = args.length;

        function res(i, val) {
          if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
            var then = val.then;

            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, function (e) {
                args[i] = {
                  status: 'rejected',
                  reason: e
                };

                if (--remaining === 0) {
                  resolve(args);
                }
              });
              return;
            }
          }

          args[i] = {
            status: 'fulfilled',
            value: val
          };

          if (--remaining === 0) {
            resolve(args);
          }
        }

        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    } // Store setTimeout reference so promise-polyfill will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())


    var setTimeoutFunc = setTimeout;

    function isArray(x) {
      return Boolean(x && typeof x.length !== 'undefined');
    }

    function noop() {} // Polyfill for Function.prototype.bind


    function bind(fn, thisArg) {
      return function () {
        fn.apply(thisArg, arguments);
      };
    }
    /**
     * @constructor
     * @param {Function} fn
     */


    function Promise(fn) {
      if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');
      if (typeof fn !== 'function') throw new TypeError('not a function');
      /** @type {!number} */

      this._state = 0;
      /** @type {!boolean} */

      this._handled = false;
      /** @type {Promise|undefined} */

      this._value = undefined;
      /** @type {!Array<!Function>} */

      this._deferreds = [];
      doResolve(fn, this);
    }

    function handle(self, deferred) {
      while (self._state === 3) {
        self = self._value;
      }

      if (self._state === 0) {
        self._deferreds.push(deferred);

        return;
      }

      self._handled = true;

      Promise._immediateFn(function () {
        var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;

        if (cb === null) {
          (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
          return;
        }

        var ret;

        try {
          ret = cb(self._value);
        } catch (e) {
          reject(deferred.promise, e);
          return;
        }

        resolve(deferred.promise, ret);
      });
    }

    function resolve(self, newValue) {
      try {
        // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');

        if (newValue && (_typeof(newValue) === 'object' || typeof newValue === 'function')) {
          var then = newValue.then;

          if (newValue instanceof Promise) {
            self._state = 3;
            self._value = newValue;
            finale(self);
            return;
          } else if (typeof then === 'function') {
            doResolve(bind(then, newValue), self);
            return;
          }
        }

        self._state = 1;
        self._value = newValue;
        finale(self);
      } catch (e) {
        reject(self, e);
      }
    }

    function reject(self, newValue) {
      self._state = 2;
      self._value = newValue;
      finale(self);
    }

    function finale(self) {
      if (self._state === 2 && self._deferreds.length === 0) {
        Promise._immediateFn(function () {
          if (!self._handled) {
            Promise._unhandledRejectionFn(self._value);
          }
        });
      }

      for (var i = 0, len = self._deferreds.length; i < len; i++) {
        handle(self, self._deferreds[i]);
      }

      self._deferreds = null;
    }
    /**
     * @constructor
     */


    function Handler(onFulfilled, onRejected, promise) {
      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
      this.onRejected = typeof onRejected === 'function' ? onRejected : null;
      this.promise = promise;
    }
    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     */


    function doResolve(fn, self) {
      var done = false;

      try {
        fn(function (value) {
          if (done) return;
          done = true;
          resolve(self, value);
        }, function (reason) {
          if (done) return;
          done = true;
          reject(self, reason);
        });
      } catch (ex) {
        if (done) return;
        done = true;
        reject(self, ex);
      }
    }

    Promise.prototype['catch'] = function (onRejected) {
      return this.then(null, onRejected);
    };

    Promise.prototype.then = function (onFulfilled, onRejected) {
      // @ts-ignore
      var prom = new this.constructor(noop);
      handle(this, new Handler(onFulfilled, onRejected, prom));
      return prom;
    };

    Promise.prototype['finally'] = finallyConstructor;

    Promise.all = function (arr) {
      return new Promise(function (resolve, reject) {
        if (!isArray(arr)) {
          return reject(new TypeError('Promise.all accepts an array'));
        }

        var args = Array.prototype.slice.call(arr);
        if (args.length === 0) return resolve([]);
        var remaining = args.length;

        function res(i, val) {
          try {
            if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
              var then = val.then;

              if (typeof then === 'function') {
                then.call(val, function (val) {
                  res(i, val);
                }, reject);
                return;
              }
            }

            args[i] = val;

            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }

        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };

    Promise.allSettled = allSettled;

    Promise.resolve = function (value) {
      if (value && _typeof(value) === 'object' && value.constructor === Promise) {
        return value;
      }

      return new Promise(function (resolve) {
        resolve(value);
      });
    };

    Promise.reject = function (value) {
      return new Promise(function (resolve, reject) {
        reject(value);
      });
    };

    Promise.race = function (arr) {
      return new Promise(function (resolve, reject) {
        if (!isArray(arr)) {
          return reject(new TypeError('Promise.race accepts an array'));
        }

        for (var i = 0, len = arr.length; i < len; i++) {
          Promise.resolve(arr[i]).then(resolve, reject);
        }
      });
    }; // Use polyfill for setImmediate for performance gains


    Promise._immediateFn = // @ts-ignore
    typeof setImmediate === 'function' && function (fn) {
      // @ts-ignore
      setImmediate(fn);
    } || function (fn) {
      setTimeoutFunc(fn, 0);
    };

    Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
      if (typeof console !== 'undefined' && console) {
        console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
      }
    };

    promisePolyfill.exports = Promise;
  })();

  var _Promise = promisePolyfill.exports;

  function registerLoggingCallbacks(obj) {
    var callbackNames = ['begin', 'done', 'log', 'testStart', 'testDone', 'moduleStart', 'moduleDone'];

    function registerLoggingCallback(key) {
      var loggingCallback = function loggingCallback(callback) {
        if (objectType(callback) !== 'function') {
          throw new Error('QUnit logging methods require a callback function as their first parameters.');
        }

        config.callbacks[key].push(callback);
      };

      return loggingCallback;
    }

    for (var i = 0, l = callbackNames.length; i < l; i++) {
      var key = callbackNames[i]; // Initialize key collection of logging callback

      if (objectType(config.callbacks[key]) === 'undefined') {
        config.callbacks[key] = [];
      }

      obj[key] = registerLoggingCallback(key);
    }
  }
  function runLoggingCallbacks(key, args) {
    var callbacks = config.callbacks[key]; // Handling 'log' callbacks separately. Unlike the other callbacks,
    // the log callback is not controlled by the processing queue,
    // but rather used by asserts. Hence to promisfy the 'log' callback
    // would mean promisfying each step of a test

    if (key === 'log') {
      callbacks.map(function (callback) {
        return callback(args);
      });
      return;
    } // ensure that each callback is executed serially


    return callbacks.reduce(function (promiseChain, callback) {
      return promiseChain.then(function () {
        return _Promise.resolve(callback(args));
      });
    }, _Promise.resolve([]));
  }

  var priorityCount = 0;
  var unitSampler; // This is a queue of functions that are tasks within a single test.
  // After tests are dequeued from config.queue they are expanded into
  // a set of tasks in this queue.

  var taskQueue = [];
  /**
   * Advances the taskQueue to the next task. If the taskQueue is empty,
   * process the testQueue
   */

  function advance() {
    advanceTaskQueue();

    if (!taskQueue.length && !config.blocking && !config.current) {
      advanceTestQueue();
    }
  }
  /**
   * Advances the taskQueue with an increased depth
   */


  function advanceTaskQueue() {
    var start = now();
    config.depth = (config.depth || 0) + 1;
    processTaskQueue(start);
    config.depth--;
  }
  /**
   * Process the first task on the taskQueue as a promise.
   * Each task is a function added by Test#queue() in /src/test.js
   */


  function processTaskQueue(start) {
    if (taskQueue.length && !config.blocking) {
      var elapsedTime = now() - start;

      if (!setTimeout$1 || config.updateRate <= 0 || elapsedTime < config.updateRate) {
        var task = taskQueue.shift();
        _Promise.resolve(task()).then(function () {
          if (!taskQueue.length) {
            advance();
          } else {
            processTaskQueue(start);
          }
        });
      } else {
        setTimeout$1(advance);
      }
    }
  }
  /**
   * Advance the testQueue to the next test to process. Call done() if testQueue completes.
   */


  function advanceTestQueue() {
    if (!config.blocking && !config.queue.length && config.depth === 0) {
      done();
      return;
    }

    var testTasks = config.queue.shift();
    addToTaskQueue(testTasks());

    if (priorityCount > 0) {
      priorityCount--;
    }

    advance();
  }
  /**
   * Enqueue the tasks for a test into the task queue.
   * @param {Array} tasksArray
   */


  function addToTaskQueue(tasksArray) {
    taskQueue.push.apply(taskQueue, _toConsumableArray(tasksArray));
  }
  /**
   * Return the number of tasks remaining in the task queue to be processed.
   * @return {number}
   */


  function taskQueueLength() {
    return taskQueue.length;
  }
  /**
   * Adds a test to the TestQueue for execution.
   * @param {Function} testTasksFunc
   * @param {boolean} prioritize
   * @param {string} seed
   */


  function addToTestQueue(testTasksFunc, prioritize, seed) {
    if (prioritize) {
      config.queue.splice(priorityCount++, 0, testTasksFunc);
    } else if (seed) {
      if (!unitSampler) {
        unitSampler = unitSamplerGenerator(seed);
      } // Insert into a random position after all prioritized items


      var index = Math.floor(unitSampler() * (config.queue.length - priorityCount + 1));
      config.queue.splice(priorityCount + index, 0, testTasksFunc);
    } else {
      config.queue.push(testTasksFunc);
    }
  }
  /**
   * Creates a seeded "sample" generator which is used for randomizing tests.
   */


  function unitSamplerGenerator(seed) {
    // 32-bit xorshift, requires only a nonzero seed
    // https://excamera.com/sphinx/article-xorshift.html
    var sample = parseInt(generateHash(seed), 16) || -1;
    return function () {
      sample ^= sample << 13;
      sample ^= sample >>> 17;
      sample ^= sample << 5; // ECMAScript has no unsigned number type

      if (sample < 0) {
        sample += 0x100000000;
      }

      return sample / 0x100000000;
    };
  }
  /**
   * This function is called when the ProcessingQueue is done processing all
   * items. It handles emitting the final run events.
   */


  function done() {
    // We have reached the end of the processing queue and are about to emit the
    // "runEnd" event after which reporters typically stop listening and exit
    // the process. First, check if we need to emit one final test.
    if (config.stats.testCount === 0 && config.failOnZeroTests === true) {
      var error;

      if (config.filter && config.filter.length) {
        error = new Error("No tests matched the filter \"".concat(config.filter, "\"."));
      } else if (config.module && config.module.length) {
        error = new Error("No tests matched the module \"".concat(config.module, "\"."));
      } else if (config.moduleId && config.moduleId.length) {
        error = new Error("No tests matched the moduleId \"".concat(config.moduleId, "\"."));
      } else if (config.testId && config.testId.length) {
        error = new Error("No tests matched the testId \"".concat(config.testId, "\"."));
      } else {
        error = new Error('No tests were run.');
      }

      test('global failure', extend(function (assert) {
        assert.pushResult({
          result: false,
          message: error.message,
          source: error.stack
        });
      }, {
        validTest: true
      })); // We do need to call `advance()` in order to resume the processing queue.
      // Once this new test is finished processing, we'll reach `done` again, and
      // that time the above condition will evaluate to false.

      advance();
      return;
    }

    var storage = config.storage;
    var runtime = now() - config.started;
    var passed = config.stats.all - config.stats.bad;
    ProcessingQueue.finished = true;
    emit('runEnd', runSuite.end(true));
    runLoggingCallbacks('done', {
      passed: passed,
      failed: config.stats.bad,
      total: config.stats.all,
      runtime: runtime
    }).then(function () {
      // Clear own storage items if all tests passed
      if (storage && config.stats.bad === 0) {
        for (var i = storage.length - 1; i >= 0; i--) {
          var key = storage.key(i);

          if (key.indexOf('qunit-test-') === 0) {
            storage.removeItem(key);
          }
        }
      }
    });
  }

  var ProcessingQueue = {
    finished: false,
    add: addToTestQueue,
    advance: advance,
    taskCount: taskQueueLength
  };

  var TestReport = /*#__PURE__*/function () {
    function TestReport(name, suite, options) {
      _classCallCheck(this, TestReport);

      this.name = name;
      this.suiteName = suite.name;
      this.fullName = suite.fullName.concat(name);
      this.runtime = 0;
      this.assertions = [];
      this.skipped = !!options.skip;
      this.todo = !!options.todo;
      this.valid = options.valid;
      this._startTime = 0;
      this._endTime = 0;
      suite.pushTest(this);
    }

    _createClass(TestReport, [{
      key: "start",
      value: function start(recordTime) {
        if (recordTime) {
          this._startTime = performance.now();
          performance.mark('qunit_test_start');
        }

        return {
          name: this.name,
          suiteName: this.suiteName,
          fullName: this.fullName.slice()
        };
      }
    }, {
      key: "end",
      value: function end(recordTime) {
        if (recordTime) {
          this._endTime = performance.now();

          if (performance) {
            performance.mark('qunit_test_end');
            var testName = this.fullName.join(' – ');
            performance.measure("QUnit Test: ".concat(testName), 'qunit_test_start', 'qunit_test_end');
          }
        }

        return extend(this.start(), {
          runtime: this.getRuntime(),
          status: this.getStatus(),
          errors: this.getFailedAssertions(),
          assertions: this.getAssertions()
        });
      }
    }, {
      key: "pushAssertion",
      value: function pushAssertion(assertion) {
        this.assertions.push(assertion);
      }
    }, {
      key: "getRuntime",
      value: function getRuntime() {
        return this._endTime - this._startTime;
      }
    }, {
      key: "getStatus",
      value: function getStatus() {
        if (this.skipped) {
          return 'skipped';
        }

        var testPassed = this.getFailedAssertions().length > 0 ? this.todo : !this.todo;

        if (!testPassed) {
          return 'failed';
        } else if (this.todo) {
          return 'todo';
        } else {
          return 'passed';
        }
      }
    }, {
      key: "getFailedAssertions",
      value: function getFailedAssertions() {
        return this.assertions.filter(function (assertion) {
          return !assertion.passed;
        });
      }
    }, {
      key: "getAssertions",
      value: function getAssertions() {
        return this.assertions.slice();
      } // Remove actual and expected values from assertions. This is to prevent
      // leaking memory throughout a test suite.

    }, {
      key: "slimAssertions",
      value: function slimAssertions() {
        this.assertions = this.assertions.map(function (assertion) {
          delete assertion.actual;
          delete assertion.expected;
          return assertion;
        });
      }
    }]);

    return TestReport;
  }();

  function Test(settings) {
    this.expected = null;
    this.assertions = [];
    this.module = config.currentModule;
    this.steps = [];
    this.timeout = undefined;
    this.data = undefined;
    this.withData = false;
    this.pauses = new StringMap();
    this.nextPauseId = 1; // For the most common case, we have:
    // - 0: new Test
    // - 1: addTest
    // - 2: QUnit.test
    // - 3: user file
    //
    // This needs is customised by test.each()

    this.stackOffset = 3;
    extend(this, settings); // If a module is skipped, all its tests and the tests of the child suites
    // should be treated as skipped even if they are defined as `only` or `todo`.
    // As for `todo` module, all its tests will be treated as `todo` except for
    // tests defined as `skip` which will be left intact.
    //
    // So, if a test is defined as `todo` and is inside a skipped module, we should
    // then treat that test as if was defined as `skip`.

    if (this.module.skip) {
      this.skip = true;
      this.todo = false; // Skipped tests should be left intact
    } else if (this.module.todo && !this.skip) {
      this.todo = true;
    } // Queuing a late test after the run has ended is not allowed.
    // This was once supported for internal use by QUnit.onError().
    // Ref https://github.com/qunitjs/qunit/issues/1377


    if (ProcessingQueue.finished) {
      // Using this for anything other than onError(), such as testing in QUnit.done(),
      // is unstable and will likely result in the added tests being ignored by CI.
      // (Meaning the CI passes irregardless of the added tests).
      //
      // TODO: Make this an error in QUnit 3.0
      // throw new Error( "Unexpected new test after the run already ended" );
      Logger.warn('Unexpected test after runEnd. This is unstable and will fail in QUnit 3.0.');
      return;
    }

    if (!this.skip && typeof this.callback !== 'function') {
      var method = this.todo ? 'QUnit.todo' : 'QUnit.test';
      throw new TypeError("You must provide a callback to ".concat(method, "(\"").concat(this.testName, "\")"));
    } // No validation after this. Beyond this point, failures must be recorded as
    // a completed test with errors, instead of early bail out.
    // Otherwise, internals may be left in an inconsistent state.
    // Ref https://github.com/qunitjs/qunit/issues/1514


    ++Test.count;
    this.errorForStack = new Error();

    if (this.callback && this.callback.validTest) {
      // Omit the test-level trace for the internal "No tests" test failure,
      // There is already an assertion-level trace, and that's noisy enough
      // as it is.
      this.errorForStack.stack = undefined;
    }

    this.testReport = new TestReport(this.testName, this.module.suiteReport, {
      todo: this.todo,
      skip: this.skip,
      valid: this.valid()
    }); // Register unique strings

    for (var i = 0, l = this.module.tests; i < l.length; i++) {
      if (this.module.tests[i].name === this.testName) {
        this.testName += ' ';
      }
    }

    this.testId = generateHash(this.module.name, this.testName);
    this.module.tests.push({
      name: this.testName,
      testId: this.testId,
      skip: !!this.skip
    });

    if (this.skip) {
      // Skipped tests will fully ignore any sent callback
      this.callback = function () {};

      this.async = false;
      this.expected = 0;
    } else {
      this.assert = new Assert(this);
    }
  }
  Test.count = 0;

  function getNotStartedModules(startModule) {
    var module = startModule;
    var modules = [];

    while (module && module.testsRun === 0) {
      modules.push(module);
      module = module.parentModule;
    } // The above push modules from the child to the parent
    // return a reversed order with the top being the top most parent module


    return modules.reverse();
  }

  Test.prototype = {
    // Use a getter to avoid computing a stack trace (which can be expensive),
    // This is displayed by the HTML Reporter, but most other integrations do
    // not access it.
    get stack() {
      return extractStacktrace(this.errorForStack, this.stackOffset);
    },

    before: function before() {
      var _this = this;

      var module = this.module;
      var notStartedModules = getNotStartedModules(module); // ensure the callbacks are executed serially for each module

      var callbackPromises = notStartedModules.reduce(function (promiseChain, startModule) {
        return promiseChain.then(function () {
          startModule.stats = {
            all: 0,
            bad: 0,
            started: now()
          };
          emit('suiteStart', startModule.suiteReport.start(true));
          return runLoggingCallbacks('moduleStart', {
            name: startModule.name,
            tests: startModule.tests
          });
        });
      }, _Promise.resolve([]));
      return callbackPromises.then(function () {
        config.current = _this;
        _this.testEnvironment = extend({}, module.testEnvironment);
        _this.started = now();
        emit('testStart', _this.testReport.start(true));
        return runLoggingCallbacks('testStart', {
          name: _this.testName,
          module: module.name,
          testId: _this.testId,
          previousFailure: _this.previousFailure
        }).then(function () {
          if (!config.pollution) {
            saveGlobal();
          }
        });
      });
    },
    run: function run() {
      config.current = this;
      this.callbackStarted = now();

      if (config.notrycatch) {
        runTest(this);
        return;
      }

      try {
        runTest(this);
      } catch (e) {
        this.pushFailure('Died on test #' + (this.assertions.length + 1) + ': ' + (e.message || e) + '\n' + this.stack, extractStacktrace(e, 0)); // Else next test will carry the responsibility

        saveGlobal(); // Restart the tests if they're blocking

        if (config.blocking) {
          internalRecover(this);
        }
      }

      function runTest(test) {
        var promise;

        if (test.withData) {
          promise = test.callback.call(test.testEnvironment, test.assert, test.data);
        } else {
          promise = test.callback.call(test.testEnvironment, test.assert);
        }

        test.resolvePromise(promise); // If the test has an async "pause" on it, but the timeout is 0, then we push a
        // failure as the test should be synchronous.

        if (test.timeout === 0 && test.pauses.size > 0) {
          pushFailure('Test did not finish synchronously even though assert.timeout( 0 ) was used.', sourceFromStacktrace(2));
        }
      }
    },
    after: function after() {
      checkPollution();
    },
    queueGlobalHook: function queueGlobalHook(hook, hookName) {
      var _this2 = this;

      var runHook = function runHook() {
        config.current = _this2;
        var promise;

        if (config.notrycatch) {
          promise = hook.call(_this2.testEnvironment, _this2.assert);
        } else {
          try {
            promise = hook.call(_this2.testEnvironment, _this2.assert);
          } catch (error) {
            _this2.pushFailure('Global ' + hookName + ' failed on ' + _this2.testName + ': ' + errorString(error), extractStacktrace(error, 0));

            return;
          }
        }

        _this2.resolvePromise(promise, hookName);
      };

      return runHook;
    },
    queueHook: function queueHook(hook, hookName, hookOwner) {
      var _this3 = this;

      var callHook = function callHook() {
        var promise = hook.call(_this3.testEnvironment, _this3.assert);

        _this3.resolvePromise(promise, hookName);
      };

      var runHook = function runHook() {
        if (hookName === 'before') {
          if (hookOwner.testsRun !== 0) {
            return;
          }

          _this3.preserveEnvironment = true;
        } // The 'after' hook should only execute when there are not tests left and
        // when the 'after' and 'finish' tasks are the only tasks left to process


        if (hookName === 'after' && !lastTestWithinModuleExecuted(hookOwner) && (config.queue.length > 0 || ProcessingQueue.taskCount() > 2)) {
          return;
        }

        config.current = _this3;

        if (config.notrycatch) {
          callHook();
          return;
        }

        try {
          // This try-block includes the indirect call to resolvePromise, which shouldn't
          // have to be inside try-catch. But, since we support any user-provided thenable
          // object, the thenable might throw in some unexpected way.
          // This subtle behaviour is undocumented. To avoid new failures in minor releases
          // we will not change this until QUnit 3.
          // TODO: In QUnit 3, reduce this try-block to just hook.call(), matching
          // the simplicity of queueGlobalHook.
          callHook();
        } catch (error) {
          _this3.pushFailure(hookName + ' failed on ' + _this3.testName + ': ' + (error.message || error), extractStacktrace(error, 0));
        }
      };

      return runHook;
    },
    // Currently only used for module level hooks, can be used to add global level ones
    hooks: function hooks(handler) {
      var hooks = [];

      function processGlobalhooks(test) {
        if ((handler === 'beforeEach' || handler === 'afterEach') && config.globalHooks[handler]) {
          for (var i = 0; i < config.globalHooks[handler].length; i++) {
            hooks.push(test.queueGlobalHook(config.globalHooks[handler][i], handler));
          }
        }
      }

      function processHooks(test, module) {
        if (module.parentModule) {
          processHooks(test, module.parentModule);
        }

        if (module.hooks[handler].length) {
          for (var i = 0; i < module.hooks[handler].length; i++) {
            hooks.push(test.queueHook(module.hooks[handler][i], handler, module));
          }
        }
      } // Hooks are ignored on skipped tests


      if (!this.skip) {
        processGlobalhooks(this);
        processHooks(this, this.module);
      }

      return hooks;
    },
    finish: function finish() {
      config.current = this; // Release the test callback to ensure that anything referenced has been
      // released to be garbage collected.

      this.callback = undefined;

      if (this.steps.length) {
        var stepsList = this.steps.join(', ');
        this.pushFailure('Expected assert.verifySteps() to be called before end of test ' + "after using assert.step(). Unverified steps: ".concat(stepsList), this.stack);
      }

      if (config.requireExpects && this.expected === null) {
        this.pushFailure('Expected number of assertions to be defined, but expect() was ' + 'not called.', this.stack);
      } else if (this.expected !== null && this.expected !== this.assertions.length) {
        this.pushFailure('Expected ' + this.expected + ' assertions, but ' + this.assertions.length + ' were run', this.stack);
      } else if (this.expected === null && !this.assertions.length) {
        this.pushFailure('Expected at least one assertion, but none were run - call ' + 'expect(0) to accept zero assertions.', this.stack);
      }

      var module = this.module;
      var moduleName = module.name;
      var testName = this.testName;
      var skipped = !!this.skip;
      var todo = !!this.todo;
      var bad = 0;
      var storage = config.storage;
      this.runtime = now() - this.started;
      config.stats.all += this.assertions.length;
      config.stats.testCount += 1;
      module.stats.all += this.assertions.length;

      for (var i = 0; i < this.assertions.length; i++) {
        // A failing assertion will counts toward the HTML Reporter's
        // "X assertions, Y failed" line even if it was inside a todo.
        // Inverting this would be similarly confusing since all but the last
        // passing assertion inside a todo test should be considered as good.
        // These stats don't decide the outcome of anything, so counting them
        // as failing seems the most intuitive.
        if (!this.assertions[i].result) {
          bad++;
          config.stats.bad++;
          module.stats.bad++;
        }
      }

      if (skipped) {
        incrementTestsIgnored(module);
      } else {
        incrementTestsRun(module);
      } // Store result when possible.
      // Note that this also marks todo tests as bad, thus they get hoisted,
      // and always run first on refresh.


      if (storage) {
        if (bad) {
          storage.setItem('qunit-test-' + moduleName + '-' + testName, bad);
        } else {
          storage.removeItem('qunit-test-' + moduleName + '-' + testName);
        }
      } // After emitting the js-reporters event we cleanup the assertion data to
      // avoid leaking it. It is not used by the legacy testDone callbacks.


      emit('testEnd', this.testReport.end(true));
      this.testReport.slimAssertions();
      var test = this;
      return runLoggingCallbacks('testDone', {
        name: testName,
        module: moduleName,
        skipped: skipped,
        todo: todo,
        failed: bad,
        passed: this.assertions.length - bad,
        total: this.assertions.length,
        runtime: skipped ? 0 : this.runtime,
        // HTML Reporter use
        assertions: this.assertions,
        testId: this.testId,

        // Source of Test
        // generating stack trace is expensive, so using a getter will help defer this until we need it
        get source() {
          return test.stack;
        }

      }).then(function () {
        if (allTestsExecuted(module)) {
          var completedModules = [module]; // Check if the parent modules, iteratively, are done. If that the case,
          // we emit the `suiteEnd` event and trigger `moduleDone` callback.

          var parent = module.parentModule;

          while (parent && allTestsExecuted(parent)) {
            completedModules.push(parent);
            parent = parent.parentModule;
          }

          return completedModules.reduce(function (promiseChain, completedModule) {
            return promiseChain.then(function () {
              return logSuiteEnd(completedModule);
            });
          }, _Promise.resolve([]));
        }
      }).then(function () {
        config.current = undefined;
      });

      function logSuiteEnd(module) {
        // Reset `module.hooks` to ensure that anything referenced in these hooks
        // has been released to be garbage collected. Descendant modules that were
        // entirely skipped, e.g. due to filtering, will never have this method
        // called for them, but might have hooks with references pinning data in
        // memory (even if the hooks weren't actually executed), so we reset the
        // hooks on all descendant modules here as well. This is safe because we
        // will never call this as long as any descendant modules still have tests
        // to run. This also means that in multi-tiered nesting scenarios we might
        // reset the hooks multiple times on some modules, but that's harmless.
        var modules = [module];

        while (modules.length) {
          var nextModule = modules.shift();
          nextModule.hooks = {};
          modules.push.apply(modules, _toConsumableArray(nextModule.childModules));
        }

        emit('suiteEnd', module.suiteReport.end(true));
        return runLoggingCallbacks('moduleDone', {
          name: module.name,
          tests: module.tests,
          failed: module.stats.bad,
          passed: module.stats.all - module.stats.bad,
          total: module.stats.all,
          runtime: now() - module.stats.started
        });
      }
    },
    preserveTestEnvironment: function preserveTestEnvironment() {
      if (this.preserveEnvironment) {
        this.module.testEnvironment = this.testEnvironment;
        this.testEnvironment = extend({}, this.module.testEnvironment);
      }
    },
    queue: function queue() {
      var test = this;

      if (!this.valid()) {
        incrementTestsIgnored(this.module);
        return;
      }

      function runTest() {
        return [function () {
          return test.before();
        }].concat(_toConsumableArray(test.hooks('before')), [function () {
          test.preserveTestEnvironment();
        }], _toConsumableArray(test.hooks('beforeEach')), [function () {
          test.run();
        }], _toConsumableArray(test.hooks('afterEach').reverse()), _toConsumableArray(test.hooks('after').reverse()), [function () {
          test.after();
        }, function () {
          return test.finish();
        }]);
      }

      var previousFailCount = config.storage && +config.storage.getItem('qunit-test-' + this.module.name + '-' + this.testName); // Prioritize previously failed tests, detected from storage

      var prioritize = config.reorder && !!previousFailCount;
      this.previousFailure = !!previousFailCount;
      ProcessingQueue.add(runTest, prioritize, config.seed);
    },
    pushResult: function pushResult(resultInfo) {
      if (this !== config.current) {
        var message = resultInfo && resultInfo.message || '';
        var testName = this && this.testName || '';
        var error = 'Assertion occurred after test finished.\n' + '> Test: ' + testName + '\n' + '> Message: ' + message + '\n';
        throw new Error(error);
      } // Destructure of resultInfo = { result, actual, expected, message, negative }


      var details = {
        module: this.module.name,
        name: this.testName,
        result: resultInfo.result,
        message: resultInfo.message,
        actual: resultInfo.actual,
        testId: this.testId,
        negative: resultInfo.negative || false,
        runtime: now() - this.started,
        todo: !!this.todo
      };

      if (hasOwn$1.call(resultInfo, 'expected')) {
        details.expected = resultInfo.expected;
      }

      if (!resultInfo.result) {
        var source = resultInfo.source || sourceFromStacktrace();

        if (source) {
          details.source = source;
        }
      }

      this.logAssertion(details);
      this.assertions.push({
        result: !!resultInfo.result,
        message: resultInfo.message
      });
    },
    pushFailure: function pushFailure(message, source, actual) {
      if (!(this instanceof Test)) {
        throw new Error('pushFailure() assertion outside test context, was ' + sourceFromStacktrace(2));
      }

      this.pushResult({
        result: false,
        message: message || 'error',
        actual: actual || null,
        source: source
      });
    },

    /**
     * Log assertion details using both the old QUnit.log interface and
     * QUnit.on( "assertion" ) interface.
     *
     * @private
     */
    logAssertion: function logAssertion(details) {
      runLoggingCallbacks('log', details);
      var assertion = {
        passed: details.result,
        actual: details.actual,
        expected: details.expected,
        message: details.message,
        stack: details.source,
        todo: details.todo
      };
      this.testReport.pushAssertion(assertion);
      emit('assertion', assertion);
    },

    /**
     * Reset config.timeout with a new timeout duration.
     *
     * @param {number} timeoutDuration
     */
    internalResetTimeout: function internalResetTimeout(timeoutDuration) {
      clearTimeout(config.timeout);
      config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);
    },

    /**
     * Create a new async pause and return a new function that can release the pause.
     *
     * This mechanism is internally used by:
     *
     * - explicit async pauses, created by calling `assert.async()`,
     * - implicit async pauses, created when `QUnit.test()` or module hook callbacks
     *   use async-await or otherwise return a Promise.
     *
     * Happy scenario:
     *
     * - Pause is created by calling internalStop().
     *
     *   Pause is released normally by invoking release() during the same test.
     *
     *   The release() callback lets internal processing resume.
     *
     * Failure scenarios:
     *
     * - The test fails due to an uncaught exception.
     *
     *   In this case, Test.run() will call internalRecover() which empties the clears all
     *   async pauses and sets the cancelled flag, which means we silently ignore any
     *   late calls to the resume() callback, as we will have moved on to a different
     *   test by then, and we don't want to cause an extra "release during a different test"
     *   errors that the developer isn't really responsible for. This can happen when a test
     *   correctly schedules a call to release(), but also causes an uncaught error. The
     *   uncaught error means we will no longer wait for the release (as it might not arrive).
     *
     * - Pause is never released, or called an insufficient number of times.
     *
     *   Our timeout handler will kill the pause and resume test processing, basically
     *   like internalRecover(), but for one pause instead of any/all.
     *
     *   Here, too, any late calls to resume() will be silently ignored to avoid
     *   extra errors. We tolerate this since the original test will have already been
     *   marked as failure.
     *
     *   TODO: QUnit 3 will enable timeouts by default <https://github.com/qunitjs/qunit/issues/1483>,
     *   but right now a test will hang indefinitely if async pauses are not released,
     *   unless QUnit.config.testTimeout or assert.timeout() is used.
     *
     * - Pause is spontaneously released during a different test,
     *   or when no test is currently running.
     *
     *   This is close to impossible because this error only happens if the original test
     *   succesfully finished first (since other failure scenarios kill pauses and ignore
     *   late calls). It can happen if a test ended exactly as expected, but has some
     *   external or shared state continuing to hold a reference to the release callback,
     *   and either the same test scheduled another call to it in the future, or a later test
     *   causes it to be called through some shared state.
     *
     * - Pause release() is called too often, during the same test.
     *
     *   This simply throws an error, after which uncaught error handling picks it up
     *   and processing resumes.
     *
     * @param {number} [requiredCalls=1]
     */
    internalStop: function internalStop() {
      var requiredCalls = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      config.blocking = true;
      var test = this;
      var pauseId = this.nextPauseId++;
      var pause = {
        cancelled: false,
        remaining: requiredCalls
      };
      test.pauses.set(pauseId, pause);

      function release() {
        if (pause.cancelled) {
          return;
        }

        if (config.current === undefined) {
          throw new Error('Unexpected release of async pause after tests finished.\n' + "> Test: ".concat(test.testName, " [async #").concat(pauseId, "]"));
        }

        if (config.current !== test) {
          throw new Error('Unexpected release of async pause during a different test.\n' + "> Test: ".concat(test.testName, " [async #").concat(pauseId, "]"));
        }

        if (pause.remaining <= 0) {
          throw new Error('Tried to release async pause that was already released.\n' + "> Test: ".concat(test.testName, " [async #").concat(pauseId, "]"));
        } // The `requiredCalls` parameter exists to support `assert.async(count)`


        pause.remaining--;

        if (pause.remaining === 0) {
          test.pauses.delete(pauseId);
        }

        internalStart(test);
      } // Set a recovery timeout, if so configured.


      if (setTimeout$1) {
        var timeoutDuration;

        if (typeof test.timeout === 'number') {
          timeoutDuration = test.timeout;
        } else if (typeof config.testTimeout === 'number') {
          timeoutDuration = config.testTimeout;
        }

        if (typeof timeoutDuration === 'number' && timeoutDuration > 0) {
          config.timeoutHandler = function (timeout) {
            return function () {
              config.timeout = null;
              pause.cancelled = true;
              test.pauses.delete(pauseId);
              test.pushFailure("Test took longer than ".concat(timeout, "ms; test timed out."), sourceFromStacktrace(2));
              internalStart(test);
            };
          };

          clearTimeout(config.timeout);
          config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);
        }
      }

      return release;
    },
    resolvePromise: function resolvePromise(promise, phase) {
      if (promise != null) {
        var _test = this;

        var then = promise.then;

        if (objectType(then) === 'function') {
          var resume = _test.internalStop();

          var resolve = function resolve() {
            resume();
          };

          if (config.notrycatch) {
            then.call(promise, resolve);
          } else {
            var reject = function reject(error) {
              var message = 'Promise rejected ' + (!phase ? 'during' : phase.replace(/Each$/, '')) + ' "' + _test.testName + '": ' + (error && error.message || error);

              _test.pushFailure(message, extractStacktrace(error, 0)); // Else next test will carry the responsibility


              saveGlobal(); // Unblock

              internalRecover(_test);
            };

            then.call(promise, resolve, reject);
          }
        }
      }
    },
    valid: function valid() {
      var filter = config.filter;
      var regexFilter = /^(!?)\/([\w\W]*)\/(i?$)/.exec(filter);
      var module = config.module && config.module.toLowerCase();
      var fullName = this.module.name + ': ' + this.testName;

      function moduleChainNameMatch(testModule) {
        var testModuleName = testModule.name ? testModule.name.toLowerCase() : null;

        if (testModuleName === module) {
          return true;
        } else if (testModule.parentModule) {
          return moduleChainNameMatch(testModule.parentModule);
        } else {
          return false;
        }
      }

      function moduleChainIdMatch(testModule) {
        return inArray(testModule.moduleId, config.moduleId) || testModule.parentModule && moduleChainIdMatch(testModule.parentModule);
      } // Internally-generated tests are always valid


      if (this.callback && this.callback.validTest) {
        return true;
      }

      if (config.moduleId && config.moduleId.length > 0 && !moduleChainIdMatch(this.module)) {
        return false;
      }

      if (config.testId && config.testId.length > 0 && !inArray(this.testId, config.testId)) {
        return false;
      }

      if (module && !moduleChainNameMatch(this.module)) {
        return false;
      }

      if (!filter) {
        return true;
      }

      return regexFilter ? this.regexFilter(!!regexFilter[1], regexFilter[2], regexFilter[3], fullName) : this.stringFilter(filter, fullName);
    },
    regexFilter: function regexFilter(exclude, pattern, flags, fullName) {
      var regex = new RegExp(pattern, flags);
      var match = regex.test(fullName);
      return match !== exclude;
    },
    stringFilter: function stringFilter(filter, fullName) {
      filter = filter.toLowerCase();
      fullName = fullName.toLowerCase();
      var include = filter.charAt(0) !== '!';

      if (!include) {
        filter = filter.slice(1);
      } // If the filter matches, we need to honour include


      if (fullName.indexOf(filter) !== -1) {
        return include;
      } // Otherwise, do the opposite


      return !include;
    }
  };
  function pushFailure() {
    if (!config.current) {
      throw new Error('pushFailure() assertion outside test context, in ' + sourceFromStacktrace(2));
    } // Gets current test obj


    var currentTest = config.current;
    return currentTest.pushFailure.apply(currentTest, arguments);
  }

  function saveGlobal() {
    config.pollution = [];

    if (config.noglobals) {
      for (var key in g) {
        if (hasOwn$1.call(g, key)) {
          // In Opera sometimes DOM element ids show up here, ignore them
          if (/^qunit-test-output/.test(key)) {
            continue;
          }

          config.pollution.push(key);
        }
      }
    }
  }

  function checkPollution() {
    var old = config.pollution;
    saveGlobal();
    var newGlobals = diff(config.pollution, old);

    if (newGlobals.length > 0) {
      pushFailure('Introduced global variable(s): ' + newGlobals.join(', '));
    }

    var deletedGlobals = diff(old, config.pollution);

    if (deletedGlobals.length > 0) {
      pushFailure('Deleted global variable(s): ' + deletedGlobals.join(', '));
    }
  }

  var focused = false; // indicates that the "only" filter was used

  function addTest(settings) {
    if (focused || config.currentModule.ignored) {
      return;
    }

    var newTest = new Test(settings);
    newTest.queue();
  }

  function addOnlyTest(settings) {
    if (config.currentModule.ignored) {
      return;
    }

    if (!focused) {
      config.queue.length = 0;
      focused = true;
    }

    var newTest = new Test(settings);
    newTest.queue();
  } // Will be exposed as QUnit.test


  function test(testName, callback) {
    addTest({
      testName: testName,
      callback: callback
    });
  }

  function makeEachTestName(testName, argument) {
    return "".concat(testName, " [").concat(argument, "]");
  }

  function runEach(data, eachFn) {
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        eachFn(data[i], i);
      }
    } else if (_typeof(data) === 'object' && data !== null) {
      for (var key in data) {
        eachFn(data[key], key);
      }
    } else {
      throw new Error("test.each() expects an array or object as input, but\nfound ".concat(_typeof(data), " instead."));
    }
  }

  extend(test, {
    todo: function todo(testName, callback) {
      addTest({
        testName: testName,
        callback: callback,
        todo: true
      });
    },
    skip: function skip(testName) {
      addTest({
        testName: testName,
        skip: true
      });
    },
    only: function only(testName, callback) {
      addOnlyTest({
        testName: testName,
        callback: callback
      });
    },
    each: function each(testName, dataset, callback) {
      runEach(dataset, function (data, testKey) {
        addTest({
          testName: makeEachTestName(testName, testKey),
          callback: callback,
          withData: true,
          stackOffset: 5,
          data: data
        });
      });
    }
  });

  test.todo.each = function (testName, dataset, callback) {
    runEach(dataset, function (data, testKey) {
      addTest({
        testName: makeEachTestName(testName, testKey),
        callback: callback,
        todo: true,
        withData: true,
        stackOffset: 5,
        data: data
      });
    });
  };

  test.skip.each = function (testName, dataset) {
    runEach(dataset, function (_, testKey) {
      addTest({
        testName: makeEachTestName(testName, testKey),
        stackOffset: 5,
        skip: true
      });
    });
  };

  test.only.each = function (testName, dataset, callback) {
    runEach(dataset, function (data, testKey) {
      addOnlyTest({
        testName: makeEachTestName(testName, testKey),
        callback: callback,
        withData: true,
        stackOffset: 5,
        data: data
      });
    });
  }; // Forcefully release all processing holds.


  function internalRecover(test) {
    test.pauses.forEach(function (pause) {
      pause.cancelled = true;
    });
    test.pauses.clear();
    internalStart(test);
  } // Release a processing hold, scheduling a resumption attempt if no holds remain.


  function internalStart(test) {
    // Ignore if other async pauses still exist.
    if (test.pauses.size > 0) {
      return;
    } // Add a slight delay to allow more assertions etc.


    if (setTimeout$1) {
      clearTimeout(config.timeout);
      config.timeout = setTimeout$1(function () {
        if (test.pauses.size > 0) {
          return;
        }

        clearTimeout(config.timeout);
        config.timeout = null;
        config.blocking = false;
        ProcessingQueue.advance();
      });
    } else {
      config.blocking = false;
      ProcessingQueue.advance();
    }
  }

  function collectTests(module) {
    var tests = [].concat(module.tests);

    var modules = _toConsumableArray(module.childModules); // Do a breadth-first traversal of the child modules


    while (modules.length) {
      var nextModule = modules.shift();
      tests.push.apply(tests, nextModule.tests);
      modules.push.apply(modules, _toConsumableArray(nextModule.childModules));
    }

    return tests;
  } // This returns true after all executable and skippable tests
  // in a module have been proccessed, and informs 'suiteEnd'
  // and moduleDone().


  function allTestsExecuted(module) {
    return module.testsRun + module.testsIgnored === collectTests(module).length;
  } // This returns true during the last executable non-skipped test
  // within a module, and informs the running of the 'after' hook
  // for a given module. This runs only once for a given module,
  // but must run during the last non-skipped test. When it runs,
  // there may be non-zero skipped tests left.


  function lastTestWithinModuleExecuted(module) {
    return module.testsRun === collectTests(module).filter(function (test) {
      return !test.skip;
    }).length - 1;
  }

  function incrementTestsRun(module) {
    module.testsRun++;

    while (module = module.parentModule) {
      module.testsRun++;
    }
  }

  function incrementTestsIgnored(module) {
    module.testsIgnored++;

    while (module = module.parentModule) {
      module.testsIgnored++;
    }
  }

  /* global module, exports, define */
  function exportQUnit(QUnit) {
    var exportedModule = false;

    if (window$1 && document) {
      // QUnit may be defined when it is preconfigured but then only QUnit and QUnit.config may be defined.
      if (window$1.QUnit && window$1.QUnit.version) {
        throw new Error('QUnit has already been defined.');
      }

      window$1.QUnit = QUnit;
      exportedModule = true;
    } // For Node.js


    if (typeof module !== 'undefined' && module && module.exports) {
      module.exports = QUnit; // For consistency with CommonJS environments' exports

      module.exports.QUnit = QUnit;
      exportedModule = true;
    } // For CommonJS with exports, but without module.exports, like Rhino


    if (typeof exports !== 'undefined' && exports) {
      exports.QUnit = QUnit;
      exportedModule = true;
    } // For AMD


    if (typeof define === 'function' && define.amd) {
      define(function () {
        return QUnit;
      });
      QUnit.config.autostart = false;
      exportedModule = true;
    } // For other environments, including Web Workers (globalThis === self),
    // SpiderMonkey (mozjs), and other embedded JavaScript engines


    if (!exportedModule) {
      g.QUnit = QUnit;
    }
  }

  var ConsoleReporter = /*#__PURE__*/function () {
    function ConsoleReporter(runner) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, ConsoleReporter);

      // Cache references to console methods to ensure we can report failures
      // from tests tests that mock the console object itself.
      // https://github.com/qunitjs/qunit/issues/1340
      // Support IE 9: Function#bind is supported, but no console.log.bind().
      this.log = options.log || Function.prototype.bind.call(console$1.log, console$1);
      runner.on('error', this.onError.bind(this));
      runner.on('runStart', this.onRunStart.bind(this));
      runner.on('testStart', this.onTestStart.bind(this));
      runner.on('testEnd', this.onTestEnd.bind(this));
      runner.on('runEnd', this.onRunEnd.bind(this));
    }

    _createClass(ConsoleReporter, [{
      key: "onError",
      value: function onError(error) {
        this.log('error', error);
      }
    }, {
      key: "onRunStart",
      value: function onRunStart(runStart) {
        this.log('runStart', runStart);
      }
    }, {
      key: "onTestStart",
      value: function onTestStart(test) {
        this.log('testStart', test);
      }
    }, {
      key: "onTestEnd",
      value: function onTestEnd(test) {
        this.log('testEnd', test);
      }
    }, {
      key: "onRunEnd",
      value: function onRunEnd(runEnd) {
        this.log('runEnd', runEnd);
      }
    }], [{
      key: "init",
      value: function init(runner, options) {
        return new ConsoleReporter(runner, options);
      }
    }]);

    return ConsoleReporter;
  }();

  var FORCE_COLOR,
      NODE_DISABLE_COLORS,
      NO_COLOR,
      TERM,
      isTTY = true;

  if (typeof process !== 'undefined') {
    var _process$env = process.env;
    FORCE_COLOR = _process$env.FORCE_COLOR;
    NODE_DISABLE_COLORS = _process$env.NODE_DISABLE_COLORS;
    NO_COLOR = _process$env.NO_COLOR;
    TERM = _process$env.TERM;
    isTTY = process.stdout && process.stdout.isTTY;
  }

  var $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY),
    // modifiers
    reset: init(0, 0),
    bold: init(1, 22),
    dim: init(2, 22),
    italic: init(3, 23),
    underline: init(4, 24),
    inverse: init(7, 27),
    hidden: init(8, 28),
    strikethrough: init(9, 29),
    // colors
    black: init(30, 39),
    red: init(31, 39),
    green: init(32, 39),
    yellow: init(33, 39),
    blue: init(34, 39),
    magenta: init(35, 39),
    cyan: init(36, 39),
    white: init(37, 39),
    gray: init(90, 39),
    grey: init(90, 39),
    // background colors
    bgBlack: init(40, 49),
    bgRed: init(41, 49),
    bgGreen: init(42, 49),
    bgYellow: init(43, 49),
    bgBlue: init(44, 49),
    bgMagenta: init(45, 49),
    bgCyan: init(46, 49),
    bgWhite: init(47, 49)
  };

  function run(arr, str) {
    var i = 0,
        tmp,
        beg = '',
        end = '';

    for (; i < arr.length; i++) {
      tmp = arr[i];
      beg += tmp.open;
      end += tmp.close;

      if (!!~str.indexOf(tmp.close)) {
        str = str.replace(tmp.rgx, tmp.close + tmp.open);
      }
    }

    return beg + str + end;
  }

  function chain(has, keys) {
    var ctx = {
      has: has,
      keys: keys
    };
    ctx.reset = $.reset.bind(ctx);
    ctx.bold = $.bold.bind(ctx);
    ctx.dim = $.dim.bind(ctx);
    ctx.italic = $.italic.bind(ctx);
    ctx.underline = $.underline.bind(ctx);
    ctx.inverse = $.inverse.bind(ctx);
    ctx.hidden = $.hidden.bind(ctx);
    ctx.strikethrough = $.strikethrough.bind(ctx);
    ctx.black = $.black.bind(ctx);
    ctx.red = $.red.bind(ctx);
    ctx.green = $.green.bind(ctx);
    ctx.yellow = $.yellow.bind(ctx);
    ctx.blue = $.blue.bind(ctx);
    ctx.magenta = $.magenta.bind(ctx);
    ctx.cyan = $.cyan.bind(ctx);
    ctx.white = $.white.bind(ctx);
    ctx.gray = $.gray.bind(ctx);
    ctx.grey = $.grey.bind(ctx);
    ctx.bgBlack = $.bgBlack.bind(ctx);
    ctx.bgRed = $.bgRed.bind(ctx);
    ctx.bgGreen = $.bgGreen.bind(ctx);
    ctx.bgYellow = $.bgYellow.bind(ctx);
    ctx.bgBlue = $.bgBlue.bind(ctx);
    ctx.bgMagenta = $.bgMagenta.bind(ctx);
    ctx.bgCyan = $.bgCyan.bind(ctx);
    ctx.bgWhite = $.bgWhite.bind(ctx);
    return ctx;
  }

  function init(open, close) {
    var blk = {
      open: "\x1B[".concat(open, "m"),
      close: "\x1B[".concat(close, "m"),
      rgx: new RegExp("\\x1b\\[".concat(close, "m"), 'g')
    };
    return function (txt) {
      if (this !== void 0 && this.has !== void 0) {
        !!~this.has.indexOf(open) || (this.has.push(open), this.keys.push(blk));
        return txt === void 0 ? this : $.enabled ? run(this.keys, txt + '') : txt + '';
      }

      return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt + '') : txt + '';
    };
  }

  var hasOwn = Object.prototype.hasOwnProperty;
  /**
   * Format a given value into YAML.
   *
   * YAML is a superset of JSON that supports all the same data
   * types and syntax, and more. As such, it is always possible
   * to fallback to JSON.stringfify, but we generally avoid
   * that to make output easier to read for humans.
   *
   * Supported data types:
   *
   * - null
   * - boolean
   * - number
   * - string
   * - array
   * - object
   *
   * Anything else (including NaN, Infinity, and undefined)
   * must be described in strings, for display purposes.
   *
   * Note that quotes are optional in YAML strings if the
   * strings are "simple", and as such we generally prefer
   * that for improved readability. We output strings in
   * one of three ways:
   *
   * - bare unquoted text, for simple one-line strings.
   * - JSON (quoted text), for complex one-line strings.
   * - YAML Block, for complex multi-line strings.
   *
   * Objects with cyclical references will be stringifed as
   * "[Circular]" as they cannot otherwise be represented.
   */

  function prettyYamlValue(value) {
    var indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;

    if (value === undefined) {
      // Not supported in JSON/YAML, turn into string
      // and let the below output it as bare string.
      value = String(value);
    } // Support IE 9-11: Use isFinite instead of ES6 Number.isFinite


    if (typeof value === 'number' && !isFinite(value)) {
      // Turn NaN and Infinity into simple strings.
      // Paranoia: Don't return directly just in case there's
      // a way to add special characters here.
      value = String(value);
    }

    if (typeof value === 'number') {
      // Simple numbers
      return JSON.stringify(value);
    }

    if (typeof value === 'string') {
      // If any of these match, then we can't output it
      // as bare unquoted text, because that would either
      // cause data loss or invalid YAML syntax.
      //
      // - Quotes, escapes, line breaks, or JSON-like stuff.
      var rSpecialJson = /['"\\/[{}\]\r\n]/; // - Characters that are special at the start of a YAML value

      var rSpecialYaml = /[-?:,[\]{}#&*!|=>'"%@`]/; // - Leading or trailing whitespace.

      var rUntrimmed = /(^\s|\s$)/; // - Ambiguous as YAML number, e.g. '2', '-1.2', '.2', or '2_000'

      var rNumerical = /^[\d._-]+$/; // - Ambiguous as YAML bool.
      //   Use case-insensitive match, although technically only
      //   fully-lower, fully-upper, or uppercase-first would be ambiguous.
      //   e.g. true/True/TRUE, but not tRUe.

      var rBool = /^(true|false|y|n|yes|no|on|off)$/i; // Is this a complex string?

      if (value === '' || rSpecialJson.test(value) || rSpecialYaml.test(value[0]) || rUntrimmed.test(value) || rNumerical.test(value) || rBool.test(value)) {
        if (!/\n/.test(value)) {
          // Complex one-line string, use JSON (quoted string)
          return JSON.stringify(value);
        } // See also <https://yaml-multiline.info/>
        // Support IE 9-11: Avoid ES6 String#repeat


        var prefix = new Array(indent + 1).join(' ');
        var trailingLinebreakMatch = value.match(/\n+$/);
        var trailingLinebreaks = trailingLinebreakMatch ? trailingLinebreakMatch[0].length : 0;

        if (trailingLinebreaks === 1) {
          // Use the most straight-forward "Block" string in YAML
          // without any "Chomping" indicators.
          var lines = value // Ignore the last new line, since we'll get that one for free
          // with the straight-forward Block syntax.
          .replace(/\n$/, '').split('\n').map(function (line) {
            return prefix + line;
          });
          return '|\n' + lines.join('\n');
        } else {
          // This has either no trailing new lines, or more than 1.
          // Use |+ so that YAML parsers will preserve it exactly.
          var _lines = value.split('\n').map(function (line) {
            return prefix + line;
          });

          return '|+\n' + _lines.join('\n');
        }
      } else {
        // Simple string, use bare unquoted text
        return value;
      }
    } // Handle null, boolean, array, and object


    return JSON.stringify(decycledShallowClone(value), null, 2);
  }
  /**
   * Creates a shallow clone of an object where cycles have
   * been replaced with "[Circular]".
   */


  function decycledShallowClone(object) {
    var ancestors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (ancestors.indexOf(object) !== -1) {
      return '[Circular]';
    }

    var type = Object.prototype.toString.call(object).replace(/^\[.+\s(.+?)]$/, '$1').toLowerCase();
    var clone;

    switch (type) {
      case 'array':
        ancestors.push(object);
        clone = object.map(function (element) {
          return decycledShallowClone(element, ancestors);
        });
        ancestors.pop();
        break;

      case 'object':
        ancestors.push(object);
        clone = {};
        Object.keys(object).forEach(function (key) {
          clone[key] = decycledShallowClone(object[key], ancestors);
        });
        ancestors.pop();
        break;

      default:
        clone = object;
    }

    return clone;
  }

  var TapReporter = /*#__PURE__*/function () {
    function TapReporter(runner) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, TapReporter);

      // Cache references to console methods to ensure we can report failures
      // from tests tests that mock the console object itself.
      // https://github.com/qunitjs/qunit/issues/1340
      // Support IE 9: Function#bind is supported, but no console.log.bind().
      this.log = options.log || Function.prototype.bind.call(console$1.log, console$1);
      this.testCount = 0;
      this.ended = false;
      this.bailed = false;
      runner.on('error', this.onError.bind(this));
      runner.on('runStart', this.onRunStart.bind(this));
      runner.on('testEnd', this.onTestEnd.bind(this));
      runner.on('runEnd', this.onRunEnd.bind(this));
    }

    _createClass(TapReporter, [{
      key: "onRunStart",
      value: function onRunStart(_runSuite) {
        this.log('TAP version 13');
      }
    }, {
      key: "onError",
      value: function onError(error) {
        if (this.bailed) {
          return;
        }

        this.bailed = true; // Imitate onTestEnd
        // Skip this if we're past "runEnd" as it would look odd

        if (!this.ended) {
          this.testCount = this.testCount + 1;
          this.log($.red("not ok ".concat(this.testCount, " global failure")));
          this.logError(error);
        }

        this.log('Bail out! ' + errorString(error).split('\n')[0]);

        if (this.ended) {
          this.logError(error);
        }
      }
    }, {
      key: "onTestEnd",
      value: function onTestEnd(test) {
        var _this = this;

        this.testCount = this.testCount + 1;

        if (test.status === 'passed') {
          this.log("ok ".concat(this.testCount, " ").concat(test.fullName.join(' > ')));
        } else if (test.status === 'skipped') {
          this.log($.yellow("ok ".concat(this.testCount, " # SKIP ").concat(test.fullName.join(' > '))));
        } else if (test.status === 'todo') {
          this.log($.cyan("not ok ".concat(this.testCount, " # TODO ").concat(test.fullName.join(' > '))));
          test.errors.forEach(function (error) {
            return _this.logAssertion(error, 'todo');
          });
        } else {
          this.log($.red("not ok ".concat(this.testCount, " ").concat(test.fullName.join(' > '))));
          test.errors.forEach(function (error) {
            return _this.logAssertion(error);
          });
        }
      }
    }, {
      key: "onRunEnd",
      value: function onRunEnd(runSuite) {
        this.ended = true;
        this.log("1..".concat(runSuite.testCounts.total));
        this.log("# pass ".concat(runSuite.testCounts.passed));
        this.log($.yellow("# skip ".concat(runSuite.testCounts.skipped)));
        this.log($.cyan("# todo ".concat(runSuite.testCounts.todo)));
        this.log($.red("# fail ".concat(runSuite.testCounts.failed)));
      }
    }, {
      key: "logAssertion",
      value: function logAssertion(error, severity) {
        var out = '  ---';
        out += "\n  message: ".concat(prettyYamlValue(error.message || 'failed'));
        out += "\n  severity: ".concat(prettyYamlValue(severity || 'failed'));

        if (hasOwn.call(error, 'actual')) {
          out += "\n  actual  : ".concat(prettyYamlValue(error.actual));
        }

        if (hasOwn.call(error, 'expected')) {
          out += "\n  expected: ".concat(prettyYamlValue(error.expected));
        }

        if (error.stack) {
          // Since stacks aren't user generated, take a bit of liberty by
          // adding a trailing new line to allow a straight-forward YAML Blocks.
          out += "\n  stack: ".concat(prettyYamlValue(error.stack + '\n'));
        }

        out += '\n  ...';
        this.log(out);
      }
    }, {
      key: "logError",
      value: function logError(error) {
        var out = '  ---';
        out += "\n  message: ".concat(prettyYamlValue(errorString(error)));
        out += "\n  severity: ".concat(prettyYamlValue('failed'));

        if (error && error.stack) {
          out += "\n  stack: ".concat(prettyYamlValue(error.stack + '\n'));
        }

        out += '\n  ...';
        this.log(out);
      }
    }], [{
      key: "init",
      value: function init(runner, options) {
        return new TapReporter(runner, options);
      }
    }]);

    return TapReporter;
  }();

  var reporters = {
    console: ConsoleReporter,
    tap: TapReporter
  };

  function makeAddGlobalHook(hookName) {
    return function addGlobalHook(callback) {
      if (!config.globalHooks[hookName]) {
        config.globalHooks[hookName] = [];
      }

      config.globalHooks[hookName].push(callback);
    };
  }

  var hooks = {
    beforeEach: makeAddGlobalHook('beforeEach'),
    afterEach: makeAddGlobalHook('afterEach')
  };

  /**
   * Handle a global error that should result in a failed test run.
   *
   * Summary:
   *
   * - If we're strictly inside a test (or one if its module hooks), the exception
   *   becomes a failed assertion.
   *
   *   This has the important side-effect that uncaught exceptions (such as
   *   calling an undefined function) during a "todo" test do NOT result in
   *   a failed test run.
   *
   * - If we're anywhere outside a test (be it in early event callbacks, or
   *   internally between tests, or somewhere after "runEnd" if the process is
   *   still alive for some reason), then send an "error" event to the reporters.
   *
   * @since 2.17.0
   * @param {Error|any} error
   */

  function onUncaughtException(error) {
    if (config.current) {
      config.current.assert.pushResult({
        result: false,
        message: "global failure: ".concat(errorString(error)),
        // We could let callers specify an offset to subtract a number of frames via
        // sourceFromStacktrace, in case they are a wrapper further away from the error
        // handler, and thus reduce some noise in the stack trace. However, we're not
        // doing this right now because it would almost never be used in practice given
        // the vast majority of error values will be Error objects, and thus have their
        // own stack trace already.
        source: error && error.stack || sourceFromStacktrace(2)
      });
    } else {
      // The "error" event was added in QUnit 2.17.
      // Increase "bad assertion" stats despite no longer pushing an assertion in this case.
      // This ensures "runEnd" and "QUnit.done()" handlers behave as expected, since the "bad"
      // count is typically how reporters decide on the boolean outcome of the test run.
      runSuite.globalFailureCount++;
      config.stats.bad++;
      config.stats.all++;
      emit('error', error);
    }
  }

  /**
   * Handle a window.onerror error.
   *
   * If there is a current test that sets the internal `ignoreGlobalErrors` field
   * (such as during `assert.throws()`), then the error is ignored and native
   * error reporting is suppressed as well. This is because in browsers, an error
   * can sometimes end up in `window.onerror` instead of in the local try/catch.
   * This ignoring of errors does not apply to our general onUncaughtException
   * method, nor to our `unhandledRejection` handlers, as those are not meant
   * to receive an "expected" error during `assert.throws()`.
   *
   * @see <https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror>
   * @deprecated since 2.17.0 Use QUnit.onUncaughtException instead.
   * @param {Object} details
   * @param {string} details.message
   * @param {string} details.fileName
   * @param {number} details.lineNumber
   * @param {string|undefined} [details.stacktrace]
   * @return {bool} True if native error reporting should be suppressed.
   */

  function onWindowError(details) {
    Logger.warn('QUnit.onError is deprecated and will be removed in QUnit 3.0.' + ' Please use QUnit.onUncaughtException instead.');

    if (config.current && config.current.ignoreGlobalErrors) {
      return true;
    }

    var err = new Error(details.message);
    err.stack = details.stacktrace || details.fileName + ':' + details.lineNumber;
    onUncaughtException(err);
    return false;
  }

  var QUnit = {}; // The "currentModule" object would ideally be defined using the createModule()
  // function. Since it isn't, add the missing suiteReport property to it now that
  // we have loaded all source code required to do so.
  //
  // TODO: Consider defining currentModule in core.js or module.js in its entirely
  // rather than partly in config.js and partly here.

  config.currentModule.suiteReport = runSuite;
  var globalStartCalled = false;
  var runStarted = false; // Figure out if we're running the tests from a server or not

  QUnit.isLocal = window$1 && window$1.location && window$1.location.protocol === 'file:'; // Expose the current QUnit version

  QUnit.version = '2.18.1';

  extend(QUnit, {
    config: config,
    dump: dump,
    equiv: equiv,
    reporters: reporters,
    hooks: hooks,
    is: is,
    objectType: objectType,
    on: on,
    onError: onWindowError,
    onUncaughtException: onUncaughtException,
    pushFailure: pushFailure,
    assert: Assert.prototype,
    module: module$1,
    test: test,
    // alias other test flavors for easy access
    todo: test.todo,
    skip: test.skip,
    only: test.only,
    start: function start(count) {
      if (config.current) {
        throw new Error('QUnit.start cannot be called inside a test context.');
      }

      var globalStartAlreadyCalled = globalStartCalled;
      globalStartCalled = true;

      if (runStarted) {
        throw new Error('Called start() while test already started running');
      }

      if (globalStartAlreadyCalled || count > 1) {
        throw new Error('Called start() outside of a test context too many times');
      }

      if (config.autostart) {
        throw new Error('Called start() outside of a test context when ' + 'QUnit.config.autostart was true');
      }

      if (!config.pageLoaded) {
        // The page isn't completely loaded yet, so we set autostart and then
        // load if we're in Node or wait for the browser's load event.
        config.autostart = true; // Starts from Node even if .load was not previously called. We still return
        // early otherwise we'll wind up "beginning" twice.

        if (!document) {
          QUnit.load();
        }

        return;
      }

      scheduleBegin();
    },
    onUnhandledRejection: function onUnhandledRejection(reason) {
      Logger.warn('QUnit.onUnhandledRejection is deprecated and will be removed in QUnit 3.0.' + ' Please use QUnit.onUncaughtException instead.');
      onUncaughtException(reason);
    },
    extend: function extend$1() {
      Logger.warn('QUnit.extend is deprecated and will be removed in QUnit 3.0.' + ' Please use Object.assign instead.'); // delegate to utility implementation, which does not warn and can be used elsewhere internally

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return extend.apply(this, args);
    },
    load: function load() {
      config.pageLoaded = true; // Initialize the configuration options

      extend(config, {
        started: 0,
        updateRate: 1000,
        autostart: true,
        filter: ''
      }, true);

      if (!runStarted) {
        config.blocking = false;

        if (config.autostart) {
          scheduleBegin();
        }
      }
    },
    stack: function stack(offset) {
      offset = (offset || 0) + 2;
      return sourceFromStacktrace(offset);
    }
  });

  registerLoggingCallbacks(QUnit);

  function scheduleBegin() {
    runStarted = true; // Add a slight delay to allow definition of more modules and tests.

    if (setTimeout$1) {
      setTimeout$1(function () {
        begin();
      });
    } else {
      begin();
    }
  }

  function unblockAndAdvanceQueue() {
    config.blocking = false;
    ProcessingQueue.advance();
  }

  function begin() {
    if (config.started) {
      unblockAndAdvanceQueue();
      return;
    } // The test run hasn't officially begun yet
    // Record the time of the test run's beginning


    config.started = now(); // Delete the loose unnamed module if unused.

    if (config.modules[0].name === '' && config.modules[0].tests.length === 0) {
      config.modules.shift();
    } // Avoid unnecessary information by not logging modules' test environments


    var l = config.modules.length;
    var modulesLog = [];

    for (var i = 0; i < l; i++) {
      modulesLog.push({
        name: config.modules[i].name,
        tests: config.modules[i].tests
      });
    } // The test run is officially beginning now


    emit('runStart', runSuite.start(true));
    runLoggingCallbacks('begin', {
      totalTests: Test.count,
      modules: modulesLog
    }).then(unblockAndAdvanceQueue);
  }
  exportQUnit(QUnit);

  (function () {
    if (!window$1 || !document) {
      return;
    }

    var config = QUnit.config;
    var hasOwn = Object.prototype.hasOwnProperty; // Stores fixture HTML for resetting later

    function storeFixture() {
      // Avoid overwriting user-defined values
      if (hasOwn.call(config, 'fixture')) {
        return;
      }

      var fixture = document.getElementById('qunit-fixture');

      if (fixture) {
        config.fixture = fixture.cloneNode(true);
      }
    }

    QUnit.begin(storeFixture); // Resets the fixture DOM element if available.

    function resetFixture() {
      if (config.fixture == null) {
        return;
      }

      var fixture = document.getElementById('qunit-fixture');

      var resetFixtureType = _typeof(config.fixture);

      if (resetFixtureType === 'string') {
        // support user defined values for `config.fixture`
        var newFixture = document.createElement('div');
        newFixture.setAttribute('id', 'qunit-fixture');
        newFixture.innerHTML = config.fixture;
        fixture.parentNode.replaceChild(newFixture, fixture);
      } else {
        var clonedFixture = config.fixture.cloneNode(true);
        fixture.parentNode.replaceChild(clonedFixture, fixture);
      }
    }

    QUnit.testStart(resetFixture);
  })();

  (function () {
    // Only interact with URLs via window.location
    var location = typeof window$1 !== 'undefined' && window$1.location;

    if (!location) {
      return;
    }

    var urlParams = getUrlParams();
    QUnit.urlParams = urlParams; // Match module/test by inclusion in an array

    QUnit.config.moduleId = [].concat(urlParams.moduleId || []);
    QUnit.config.testId = [].concat(urlParams.testId || []); // Exact case-insensitive match of the module name

    QUnit.config.module = urlParams.module; // Regular expression or case-insenstive substring match against "moduleName: testName"

    QUnit.config.filter = urlParams.filter; // Test order randomization

    if (urlParams.seed === true) {
      // Generate a random seed if the option is specified without a value
      QUnit.config.seed = Math.random().toString(36).slice(2);
    } else if (urlParams.seed) {
      QUnit.config.seed = urlParams.seed;
    } // Add URL-parameter-mapped config values with UI form rendering data


    QUnit.config.urlConfig.push({
      id: 'hidepassed',
      label: 'Hide passed tests',
      tooltip: 'Only show tests and assertions that fail. Stored as query-strings.'
    }, {
      id: 'noglobals',
      label: 'Check for Globals',
      tooltip: 'Enabling this will test if any test introduces new properties on the ' + 'global object (`window` in Browsers). Stored as query-strings.'
    }, {
      id: 'notrycatch',
      label: 'No try-catch',
      tooltip: 'Enabling this will run tests outside of a try-catch block. Makes debugging ' + 'exceptions in IE reasonable. Stored as query-strings.'
    });
    QUnit.begin(function () {
      var urlConfig = QUnit.config.urlConfig;

      for (var i = 0; i < urlConfig.length; i++) {
        // Options can be either strings or objects with nonempty "id" properties
        var option = QUnit.config.urlConfig[i];

        if (typeof option !== 'string') {
          option = option.id;
        }

        if (QUnit.config[option] === undefined) {
          QUnit.config[option] = urlParams[option];
        }
      }
    });

    function getUrlParams() {
      var urlParams = Object.create(null);
      var params = location.search.slice(1).split('&');
      var length = params.length;

      for (var i = 0; i < length; i++) {
        if (params[i]) {
          var param = params[i].split('=');
          var name = decodeQueryParam(param[0]); // Allow just a key to turn on a flag, e.g., test.html?noglobals

          var value = param.length === 1 || decodeQueryParam(param.slice(1).join('='));

          if (name in urlParams) {
            urlParams[name] = [].concat(urlParams[name], value);
          } else {
            urlParams[name] = value;
          }
        }
      }

      return urlParams;
    }

    function decodeQueryParam(param) {
      return decodeURIComponent(param.replace(/\+/g, '%20'));
    }
  })();

  var fuzzysort$1 = {exports: {}};

  (function (module) {

    (function (root, UMD) {
      if (module.exports) module.exports = UMD();else root.fuzzysort = UMD();
    })(commonjsGlobal, function UMD() {
      function fuzzysortNew(instanceOptions) {
        var fuzzysort = {
          single: function single(search, target, options) {
            if (search == 'farzher') return {
              target: "farzher was here (^-^*)/",
              score: 0,
              indexes: [0, 1, 2, 3, 4, 5, 6]
            };
            if (!search) return null;
            if (!isObj(search)) search = fuzzysort.getPreparedSearch(search);
            if (!target) return null;
            if (!isObj(target)) target = fuzzysort.getPrepared(target);
            var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
            var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
            return algorithm(search, target, search[0]);
          },
          go: function go(search, targets, options) {
            if (search == 'farzher') return [{
              target: "farzher was here (^-^*)/",
              score: 0,
              indexes: [0, 1, 2, 3, 4, 5, 6],
              obj: targets ? targets[0] : null
            }];
            if (!search) return noResults;
            search = fuzzysort.prepareSearch(search);
            var searchLowerCode = search[0];
            var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
            var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
            var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
            var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
            var resultsLen = 0;
            var limitedCount = 0;
            var targetsLen = targets.length; // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]
            // options.keys

            if (options && options.keys) {
              var scoreFn = options.scoreFn || defaultScoreFn;
              var keys = options.keys;
              var keysLen = keys.length;

              for (var i = targetsLen - 1; i >= 0; --i) {
                var obj = targets[i];
                var objResults = new Array(keysLen);

                for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
                  var key = keys[keyI];
                  var target = getValue(obj, key);

                  if (!target) {
                    objResults[keyI] = null;
                    continue;
                  }

                  if (!isObj(target)) target = fuzzysort.getPrepared(target);
                  objResults[keyI] = algorithm(search, target, searchLowerCode);
                }

                objResults.obj = obj; // before scoreFn so scoreFn can use it

                var score = scoreFn(objResults);
                if (score === null) continue;
                if (score < threshold) continue;
                objResults.score = score;

                if (resultsLen < limit) {
                  q.add(objResults);
                  ++resultsLen;
                } else {
                  ++limitedCount;
                  if (score > q.peek().score) q.replaceTop(objResults);
                }
              } // options.key

            } else if (options && options.key) {
              var key = options.key;

              for (var i = targetsLen - 1; i >= 0; --i) {
                var obj = targets[i];
                var target = getValue(obj, key);
                if (!target) continue;
                if (!isObj(target)) target = fuzzysort.getPrepared(target);
                var result = algorithm(search, target, searchLowerCode);
                if (result === null) continue;
                if (result.score < threshold) continue; // have to clone result so duplicate targets from different obj can each reference the correct obj

                result = {
                  target: result.target,
                  _targetLowerCodes: null,
                  _nextBeginningIndexes: null,
                  score: result.score,
                  indexes: result.indexes,
                  obj: obj
                }; // hidden

                if (resultsLen < limit) {
                  q.add(result);
                  ++resultsLen;
                } else {
                  ++limitedCount;
                  if (result.score > q.peek().score) q.replaceTop(result);
                }
              } // no keys

            } else {
              for (var i = targetsLen - 1; i >= 0; --i) {
                var target = targets[i];
                if (!target) continue;
                if (!isObj(target)) target = fuzzysort.getPrepared(target);
                var result = algorithm(search, target, searchLowerCode);
                if (result === null) continue;
                if (result.score < threshold) continue;

                if (resultsLen < limit) {
                  q.add(result);
                  ++resultsLen;
                } else {
                  ++limitedCount;
                  if (result.score > q.peek().score) q.replaceTop(result);
                }
              }
            }

            if (resultsLen === 0) return noResults;
            var results = new Array(resultsLen);

            for (var i = resultsLen - 1; i >= 0; --i) {
              results[i] = q.poll();
            }

            results.total = resultsLen + limitedCount;
            return results;
          },
          goAsync: function goAsync(search, targets, options) {
            var canceled = false;
            var p = new Promise(function (resolve, reject) {
              if (search == 'farzher') return resolve([{
                target: "farzher was here (^-^*)/",
                score: 0,
                indexes: [0, 1, 2, 3, 4, 5, 6],
                obj: targets ? targets[0] : null
              }]);
              if (!search) return resolve(noResults);
              search = fuzzysort.prepareSearch(search);
              var searchLowerCode = search[0];
              var q = fastpriorityqueue();
              var iCurrent = targets.length - 1;
              var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
              var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
              var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
              var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
              var resultsLen = 0;
              var limitedCount = 0;

              function step() {
                if (canceled) return reject('canceled');
                var startMs = Date.now(); // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]
                // options.keys

                if (options && options.keys) {
                  var scoreFn = options.scoreFn || defaultScoreFn;
                  var keys = options.keys;
                  var keysLen = keys.length;

                  for (; iCurrent >= 0; --iCurrent) {
                    if (iCurrent % 1000
                    /*itemsPerCheck*/
                    === 0) {
                      if (Date.now() - startMs >= 10
                      /*asyncInterval*/
                      ) {
                        isNode ? setImmediate(step) : setTimeout(step);
                        return;
                      }
                    }

                    var obj = targets[iCurrent];
                    var objResults = new Array(keysLen);

                    for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
                      var key = keys[keyI];
                      var target = getValue(obj, key);

                      if (!target) {
                        objResults[keyI] = null;
                        continue;
                      }

                      if (!isObj(target)) target = fuzzysort.getPrepared(target);
                      objResults[keyI] = algorithm(search, target, searchLowerCode);
                    }

                    objResults.obj = obj; // before scoreFn so scoreFn can use it

                    var score = scoreFn(objResults);
                    if (score === null) continue;
                    if (score < threshold) continue;
                    objResults.score = score;

                    if (resultsLen < limit) {
                      q.add(objResults);
                      ++resultsLen;
                    } else {
                      ++limitedCount;
                      if (score > q.peek().score) q.replaceTop(objResults);
                    }
                  } // options.key

                } else if (options && options.key) {
                  var key = options.key;

                  for (; iCurrent >= 0; --iCurrent) {
                    if (iCurrent % 1000
                    /*itemsPerCheck*/
                    === 0) {
                      if (Date.now() - startMs >= 10
                      /*asyncInterval*/
                      ) {
                        isNode ? setImmediate(step) : setTimeout(step);
                        return;
                      }
                    }

                    var obj = targets[iCurrent];
                    var target = getValue(obj, key);
                    if (!target) continue;
                    if (!isObj(target)) target = fuzzysort.getPrepared(target);
                    var result = algorithm(search, target, searchLowerCode);
                    if (result === null) continue;
                    if (result.score < threshold) continue; // have to clone result so duplicate targets from different obj can each reference the correct obj

                    result = {
                      target: result.target,
                      _targetLowerCodes: null,
                      _nextBeginningIndexes: null,
                      score: result.score,
                      indexes: result.indexes,
                      obj: obj
                    }; // hidden

                    if (resultsLen < limit) {
                      q.add(result);
                      ++resultsLen;
                    } else {
                      ++limitedCount;
                      if (result.score > q.peek().score) q.replaceTop(result);
                    }
                  } // no keys

                } else {
                  for (; iCurrent >= 0; --iCurrent) {
                    if (iCurrent % 1000
                    /*itemsPerCheck*/
                    === 0) {
                      if (Date.now() - startMs >= 10
                      /*asyncInterval*/
                      ) {
                        isNode ? setImmediate(step) : setTimeout(step);
                        return;
                      }
                    }

                    var target = targets[iCurrent];
                    if (!target) continue;
                    if (!isObj(target)) target = fuzzysort.getPrepared(target);
                    var result = algorithm(search, target, searchLowerCode);
                    if (result === null) continue;
                    if (result.score < threshold) continue;

                    if (resultsLen < limit) {
                      q.add(result);
                      ++resultsLen;
                    } else {
                      ++limitedCount;
                      if (result.score > q.peek().score) q.replaceTop(result);
                    }
                  }
                }

                if (resultsLen === 0) return resolve(noResults);
                var results = new Array(resultsLen);

                for (var i = resultsLen - 1; i >= 0; --i) {
                  results[i] = q.poll();
                }

                results.total = resultsLen + limitedCount;
                resolve(results);
              }

              isNode ? setImmediate(step) : step(); //setTimeout here is too slow
            });

            p.cancel = function () {
              canceled = true;
            };

            return p;
          },
          highlight: function highlight(result, hOpen, hClose) {
            if (typeof hOpen == 'function') return fuzzysort.highlightCallback(result, hOpen);
            if (result === null) return null;
            if (hOpen === undefined) hOpen = '<b>';
            if (hClose === undefined) hClose = '</b>';
            var highlighted = '';
            var matchesIndex = 0;
            var opened = false;
            var target = result.target;
            var targetLen = target.length;
            var matchesBest = result.indexes;

            for (var i = 0; i < targetLen; ++i) {
              var char = target[i];

              if (matchesBest[matchesIndex] === i) {
                ++matchesIndex;

                if (!opened) {
                  opened = true;
                  highlighted += hOpen;
                }

                if (matchesIndex === matchesBest.length) {
                  highlighted += char + hClose + target.substr(i + 1);
                  break;
                }
              } else {
                if (opened) {
                  opened = false;
                  highlighted += hClose;
                }
              }

              highlighted += char;
            }

            return highlighted;
          },
          highlightCallback: function highlightCallback(result, cb) {
            if (result === null) return null;
            var target = result.target;
            var targetLen = target.length;
            var indexes = result.indexes;
            var highlighted = '';
            var matchI = 0;
            var indexesI = 0;
            var opened = false;
            var result = [];

            for (var i = 0; i < targetLen; ++i) {
              var char = target[i];

              if (indexes[indexesI] === i) {
                ++indexesI;

                if (!opened) {
                  opened = true;
                  result.push(highlighted);
                  highlighted = '';
                }

                if (indexesI === indexes.length) {
                  highlighted += char;
                  result.push(cb(highlighted, matchI++));
                  highlighted = '';
                  result.push(target.substr(i + 1));
                  break;
                }
              } else {
                if (opened) {
                  opened = false;
                  result.push(cb(highlighted, matchI++));
                  highlighted = '';
                }
              }

              highlighted += char;
            }

            return result;
          },
          prepare: function prepare(target) {
            if (!target) return {
              target: '',
              _targetLowerCodes: [0
              /*this 0 doesn't make sense. here because an empty array causes the algorithm to deoptimize and run 50% slower!*/
              ],
              _nextBeginningIndexes: null,
              score: null,
              indexes: null,
              obj: null
            }; // hidden

            return {
              target: target,
              _targetLowerCodes: fuzzysort.prepareLowerCodes(target),
              _nextBeginningIndexes: null,
              score: null,
              indexes: null,
              obj: null
            }; // hidden
          },
          prepareSlow: function prepareSlow(target) {
            if (!target) return {
              target: '',
              _targetLowerCodes: [0
              /*this 0 doesn't make sense. here because an empty array causes the algorithm to deoptimize and run 50% slower!*/
              ],
              _nextBeginningIndexes: null,
              score: null,
              indexes: null,
              obj: null
            }; // hidden

            return {
              target: target,
              _targetLowerCodes: fuzzysort.prepareLowerCodes(target),
              _nextBeginningIndexes: fuzzysort.prepareNextBeginningIndexes(target),
              score: null,
              indexes: null,
              obj: null
            }; // hidden
          },
          prepareSearch: function prepareSearch(search) {
            if (!search) search = '';
            return fuzzysort.prepareLowerCodes(search);
          },
          // Below this point is only internal code
          // Below this point is only internal code
          // Below this point is only internal code
          // Below this point is only internal code
          getPrepared: function getPrepared(target) {
            if (target.length > 999) return fuzzysort.prepare(target); // don't cache huge targets

            var targetPrepared = preparedCache.get(target);
            if (targetPrepared !== undefined) return targetPrepared;
            targetPrepared = fuzzysort.prepare(target);
            preparedCache.set(target, targetPrepared);
            return targetPrepared;
          },
          getPreparedSearch: function getPreparedSearch(search) {
            if (search.length > 999) return fuzzysort.prepareSearch(search); // don't cache huge searches

            var searchPrepared = preparedSearchCache.get(search);
            if (searchPrepared !== undefined) return searchPrepared;
            searchPrepared = fuzzysort.prepareSearch(search);
            preparedSearchCache.set(search, searchPrepared);
            return searchPrepared;
          },
          algorithm: function algorithm(searchLowerCodes, prepared, searchLowerCode) {
            var targetLowerCodes = prepared._targetLowerCodes;
            var searchLen = searchLowerCodes.length;
            var targetLen = targetLowerCodes.length;
            var searchI = 0; // where we at

            var targetI = 0; // where you at

            var typoSimpleI = 0;
            var matchesSimpleLen = 0; // very basic fuzzy match; to remove non-matching targets ASAP!
            // walk through target. find sequential matches.
            // if all chars aren't found then exit

            for (;;) {
              var isMatch = searchLowerCode === targetLowerCodes[targetI];

              if (isMatch) {
                matchesSimple[matchesSimpleLen++] = targetI;
                ++searchI;
                if (searchI === searchLen) break;
                searchLowerCode = searchLowerCodes[typoSimpleI === 0 ? searchI : typoSimpleI === searchI ? searchI + 1 : typoSimpleI === searchI - 1 ? searchI - 1 : searchI];
              }

              ++targetI;

              if (targetI >= targetLen) {
                // Failed to find searchI
                // Check for typo or exit
                // we go as far as possible before trying to transpose
                // then we transpose backwards until we reach the beginning
                for (;;) {
                  if (searchI <= 1) return null; // not allowed to transpose first char

                  if (typoSimpleI === 0) {
                    // we haven't tried to transpose yet
                    --searchI;
                    var searchLowerCodeNew = searchLowerCodes[searchI];
                    if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char

                    typoSimpleI = searchI;
                  } else {
                    if (typoSimpleI === 1) return null; // reached the end of the line for transposing

                    --typoSimpleI;
                    searchI = typoSimpleI;
                    searchLowerCode = searchLowerCodes[searchI + 1];
                    var searchLowerCodeNew = searchLowerCodes[searchI];
                    if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char
                  }

                  matchesSimpleLen = searchI;
                  targetI = matchesSimple[matchesSimpleLen - 1] + 1;
                  break;
                }
              }
            }

            var searchI = 0;
            var typoStrictI = 0;
            var successStrict = false;
            var matchesStrictLen = 0;
            var nextBeginningIndexes = prepared._nextBeginningIndexes;
            if (nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
            var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1]; // Our target string successfully matched all characters in sequence!
            // Let's try a more advanced and strict test to improve the score
            // only count it as a match if it's consecutive or a beginning character!

            if (targetI !== targetLen) for (;;) {
              if (targetI >= targetLen) {
                // We failed to find a good spot for this search char, go back to the previous search char and force it forward
                if (searchI <= 0) {
                  // We failed to push chars forward for a better match
                  // transpose, starting from the beginning
                  ++typoStrictI;
                  if (typoStrictI > searchLen - 2) break;
                  if (searchLowerCodes[typoStrictI] === searchLowerCodes[typoStrictI + 1]) continue; // doesn't make sense to transpose a repeat char

                  targetI = firstPossibleI;
                  continue;
                }

                --searchI;
                var lastMatch = matchesStrict[--matchesStrictLen];
                targetI = nextBeginningIndexes[lastMatch];
              } else {
                var isMatch = searchLowerCodes[typoStrictI === 0 ? searchI : typoStrictI === searchI ? searchI + 1 : typoStrictI === searchI - 1 ? searchI - 1 : searchI] === targetLowerCodes[targetI];

                if (isMatch) {
                  matchesStrict[matchesStrictLen++] = targetI;
                  ++searchI;

                  if (searchI === searchLen) {
                    successStrict = true;
                    break;
                  }

                  ++targetI;
                } else {
                  targetI = nextBeginningIndexes[targetI];
                }
              }
            }
            {
              // tally up the score & keep track of matches for highlighting later
              if (successStrict) {
                var matchesBest = matchesStrict;
                var matchesBestLen = matchesStrictLen;
              } else {
                var matchesBest = matchesSimple;
                var matchesBestLen = matchesSimpleLen;
              }

              var score = 0;
              var lastTargetI = -1;

              for (var i = 0; i < searchLen; ++i) {
                var targetI = matchesBest[i]; // score only goes down if they're not consecutive

                if (lastTargetI !== targetI - 1) score -= targetI;
                lastTargetI = targetI;
              }

              if (!successStrict) {
                score *= 1000;
                if (typoSimpleI !== 0) score += -20;
                /*typoPenalty*/
              } else {
                if (typoStrictI !== 0) score += -20;
                /*typoPenalty*/
              }

              score -= targetLen - searchLen;
              prepared.score = score;
              prepared.indexes = new Array(matchesBestLen);

              for (var i = matchesBestLen - 1; i >= 0; --i) {
                prepared.indexes[i] = matchesBest[i];
              }

              return prepared;
            }
          },
          algorithmNoTypo: function algorithmNoTypo(searchLowerCodes, prepared, searchLowerCode) {
            var targetLowerCodes = prepared._targetLowerCodes;
            var searchLen = searchLowerCodes.length;
            var targetLen = targetLowerCodes.length;
            var searchI = 0; // where we at

            var targetI = 0; // where you at

            var matchesSimpleLen = 0; // very basic fuzzy match; to remove non-matching targets ASAP!
            // walk through target. find sequential matches.
            // if all chars aren't found then exit

            for (;;) {
              var isMatch = searchLowerCode === targetLowerCodes[targetI];

              if (isMatch) {
                matchesSimple[matchesSimpleLen++] = targetI;
                ++searchI;
                if (searchI === searchLen) break;
                searchLowerCode = searchLowerCodes[searchI];
              }

              ++targetI;
              if (targetI >= targetLen) return null; // Failed to find searchI
            }

            var searchI = 0;
            var successStrict = false;
            var matchesStrictLen = 0;
            var nextBeginningIndexes = prepared._nextBeginningIndexes;
            if (nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
            targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1]; // Our target string successfully matched all characters in sequence!
            // Let's try a more advanced and strict test to improve the score
            // only count it as a match if it's consecutive or a beginning character!

            if (targetI !== targetLen) for (;;) {
              if (targetI >= targetLen) {
                // We failed to find a good spot for this search char, go back to the previous search char and force it forward
                if (searchI <= 0) break; // We failed to push chars forward for a better match

                --searchI;
                var lastMatch = matchesStrict[--matchesStrictLen];
                targetI = nextBeginningIndexes[lastMatch];
              } else {
                var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];

                if (isMatch) {
                  matchesStrict[matchesStrictLen++] = targetI;
                  ++searchI;

                  if (searchI === searchLen) {
                    successStrict = true;
                    break;
                  }

                  ++targetI;
                } else {
                  targetI = nextBeginningIndexes[targetI];
                }
              }
            }
            {
              // tally up the score & keep track of matches for highlighting later
              if (successStrict) {
                var matchesBest = matchesStrict;
                var matchesBestLen = matchesStrictLen;
              } else {
                var matchesBest = matchesSimple;
                var matchesBestLen = matchesSimpleLen;
              }

              var score = 0;
              var lastTargetI = -1;

              for (var i = 0; i < searchLen; ++i) {
                var targetI = matchesBest[i]; // score only goes down if they're not consecutive

                if (lastTargetI !== targetI - 1) score -= targetI;
                lastTargetI = targetI;
              }

              if (!successStrict) score *= 1000;
              score -= targetLen - searchLen;
              prepared.score = score;
              prepared.indexes = new Array(matchesBestLen);

              for (var i = matchesBestLen - 1; i >= 0; --i) {
                prepared.indexes[i] = matchesBest[i];
              }

              return prepared;
            }
          },
          prepareLowerCodes: function prepareLowerCodes(str) {
            var strLen = str.length;
            var lowerCodes = []; // new Array(strLen)    sparse array is too slow

            var lower = str.toLowerCase();

            for (var i = 0; i < strLen; ++i) {
              lowerCodes[i] = lower.charCodeAt(i);
            }

            return lowerCodes;
          },
          prepareBeginningIndexes: function prepareBeginningIndexes(target) {
            var targetLen = target.length;
            var beginningIndexes = [];
            var beginningIndexesLen = 0;
            var wasUpper = false;
            var wasAlphanum = false;

            for (var i = 0; i < targetLen; ++i) {
              var targetCode = target.charCodeAt(i);
              var isUpper = targetCode >= 65 && targetCode <= 90;
              var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;
              var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
              wasUpper = isUpper;
              wasAlphanum = isAlphanum;
              if (isBeginning) beginningIndexes[beginningIndexesLen++] = i;
            }

            return beginningIndexes;
          },
          prepareNextBeginningIndexes: function prepareNextBeginningIndexes(target) {
            var targetLen = target.length;
            var beginningIndexes = fuzzysort.prepareBeginningIndexes(target);
            var nextBeginningIndexes = []; // new Array(targetLen)     sparse array is too slow

            var lastIsBeginning = beginningIndexes[0];
            var lastIsBeginningI = 0;

            for (var i = 0; i < targetLen; ++i) {
              if (lastIsBeginning > i) {
                nextBeginningIndexes[i] = lastIsBeginning;
              } else {
                lastIsBeginning = beginningIndexes[++lastIsBeginningI];
                nextBeginningIndexes[i] = lastIsBeginning === undefined ? targetLen : lastIsBeginning;
              }
            }

            return nextBeginningIndexes;
          },
          cleanup: cleanup,
          new: fuzzysortNew
        };
        return fuzzysort;
      } // fuzzysortNew
      // This stuff is outside fuzzysortNew, because it's shared with instances of fuzzysort.new()


      var isNode = typeof commonjsRequire !== 'undefined' && typeof window === 'undefined';
      var MyMap = typeof Map === 'function' ? Map : function () {
        var s = Object.create(null);

        this.get = function (k) {
          return s[k];
        };

        this.set = function (k, val) {
          s[k] = val;
          return this;
        };

        this.clear = function () {
          s = Object.create(null);
        };
      };
      var preparedCache = new MyMap();
      var preparedSearchCache = new MyMap();
      var noResults = [];
      noResults.total = 0;
      var matchesSimple = [];
      var matchesStrict = [];

      function cleanup() {
        preparedCache.clear();
        preparedSearchCache.clear();
        matchesSimple = [];
        matchesStrict = [];
      }

      function defaultScoreFn(a) {
        var max = -9007199254740991;

        for (var i = a.length - 1; i >= 0; --i) {
          var result = a[i];
          if (result === null) continue;
          var score = result.score;
          if (score > max) max = score;
        }

        if (max === -9007199254740991) return null;
        return max;
      } // prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]
      // prop = 'key1.key2'        10ms
      // prop = ['key1', 'key2']   27ms


      function getValue(obj, prop) {
        var tmp = obj[prop];
        if (tmp !== undefined) return tmp;
        var segs = prop;
        if (!Array.isArray(prop)) segs = prop.split('.');
        var len = segs.length;
        var i = -1;

        while (obj && ++i < len) {
          obj = obj[segs[i]];
        }

        return obj;
      }

      function isObj(x) {
        return _typeof(x) === 'object';
      } // faster as a function
      // Hacked version of https://github.com/lemire/FastPriorityQueue.js


      var fastpriorityqueue = function fastpriorityqueue() {
        var r = [],
            o = 0,
            e = {};

        function n() {
          for (var e = 0, n = r[e], c = 1; c < o;) {
            var f = c + 1;
            e = c, f < o && r[f].score < r[c].score && (e = f), r[e - 1 >> 1] = r[e], c = 1 + (e << 1);
          }

          for (var a = e - 1 >> 1; e > 0 && n.score < r[a].score; a = (e = a) - 1 >> 1) {
            r[e] = r[a];
          }

          r[e] = n;
        }

        return e.add = function (e) {
          var n = o;
          r[o++] = e;

          for (var c = n - 1 >> 1; n > 0 && e.score < r[c].score; c = (n = c) - 1 >> 1) {
            r[n] = r[c];
          }

          r[n] = e;
        }, e.poll = function () {
          if (0 !== o) {
            var e = r[0];
            return r[0] = r[--o], n(), e;
          }
        }, e.peek = function (e) {
          if (0 !== o) return r[0];
        }, e.replaceTop = function (o) {
          r[0] = o, n();
        }, e;
      };

      var q = fastpriorityqueue(); // reuse this, except for async, it needs to make its own

      return fuzzysortNew();
    }); // UMD
    // TODO: (performance) wasm version!?
    // TODO: (performance) threads?
    // TODO: (performance) avoid cache misses
    // TODO: (performance) preparedCache is a memory leak
    // TODO: (like sublime) backslash === forwardslash
    // TODO: (like sublime) spaces: "a b" should do 2 searches 1 for a and 1 for b
    // TODO: (scoring) garbage in targets that allows most searches to strict match need a penality
    // TODO: (performance) idk if allowTypo is optimized

  })(fuzzysort$1);

  var fuzzysort = fuzzysort$1.exports;

  var stats = {
    failedTests: [],
    defined: 0,
    completed: 0
  }; // Escape text for attribute or text content.

  function escapeText(s) {
    if (!s) {
      return '';
    }

    s = s + ''; // Both single quotes and double quotes (for attributes)

    return s.replace(/['"<>&]/g, function (s) {
      switch (s) {
        case "'":
          return '&#039;';

        case '"':
          return '&quot;';

        case '<':
          return '&lt;';

        case '>':
          return '&gt;';

        case '&':
          return '&amp;';
      }
    });
  }

  (function () {
    // Don't load the HTML Reporter on non-browser environments
    if (!window$1 || !document) {
      return;
    }

    var config = QUnit.config;
    var hiddenTests = [];
    var collapseNext = false;
    var hasOwn = Object.prototype.hasOwnProperty;
    var unfilteredUrl = setUrl({
      filter: undefined,
      module: undefined,
      moduleId: undefined,
      testId: undefined
    });

    function trim(string) {
      if (typeof string.trim === 'function') {
        return string.trim();
      } else {
        return string.replace(/^\s+|\s+$/g, '');
      }
    }

    function addEvent(elem, type, fn) {
      elem.addEventListener(type, fn, false);
    }

    function removeEvent(elem, type, fn) {
      elem.removeEventListener(type, fn, false);
    }

    function addEvents(elems, type, fn) {
      var i = elems.length;

      while (i--) {
        addEvent(elems[i], type, fn);
      }
    }

    function hasClass(elem, name) {
      return (' ' + elem.className + ' ').indexOf(' ' + name + ' ') >= 0;
    }

    function addClass(elem, name) {
      if (!hasClass(elem, name)) {
        elem.className += (elem.className ? ' ' : '') + name;
      }
    }

    function toggleClass(elem, name, force) {
      if (force || typeof force === 'undefined' && !hasClass(elem, name)) {
        addClass(elem, name);
      } else {
        removeClass(elem, name);
      }
    }

    function removeClass(elem, name) {
      var set = ' ' + elem.className + ' '; // Class name may appear multiple times

      while (set.indexOf(' ' + name + ' ') >= 0) {
        set = set.replace(' ' + name + ' ', ' ');
      } // Trim for prettiness


      elem.className = trim(set);
    }

    function id(name) {
      return document.getElementById && document.getElementById(name);
    }

    function abortTests() {
      var abortButton = id('qunit-abort-tests-button');

      if (abortButton) {
        abortButton.disabled = true;
        abortButton.innerHTML = 'Aborting...';
      }

      QUnit.config.queue.length = 0;
      return false;
    }

    function interceptNavigation(ev) {
      // Trim potential accidental whitespace so that QUnit doesn't throw an error about no tests matching the filter.
      var filterInputElem = id('qunit-filter-input');
      filterInputElem.value = trim(filterInputElem.value);
      applyUrlParams();

      if (ev && ev.preventDefault) {
        ev.preventDefault();
      }

      return false;
    }

    function getUrlConfigHtml() {
      var selection = false;
      var urlConfig = config.urlConfig;
      var urlConfigHtml = '';

      for (var i = 0; i < urlConfig.length; i++) {
        // Options can be either strings or objects with nonempty "id" properties
        var val = config.urlConfig[i];

        if (typeof val === 'string') {
          val = {
            id: val,
            label: val
          };
        }

        var escaped = escapeText(val.id);
        var escapedTooltip = escapeText(val.tooltip);

        if (!val.value || typeof val.value === 'string') {
          urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'><input id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' type='checkbox'" + (val.value ? " value='" + escapeText(val.value) + "'" : '') + (config[val.id] ? " checked='checked'" : '') + " title='" + escapedTooltip + "' />" + escapeText(val.label) + '</label>';
        } else {
          urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'>" + val.label + ": </label><select id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' title='" + escapedTooltip + "'><option></option>";

          if (Array.isArray(val.value)) {
            for (var j = 0; j < val.value.length; j++) {
              escaped = escapeText(val.value[j]);
              urlConfigHtml += "<option value='" + escaped + "'" + (config[val.id] === val.value[j] ? (selection = true) && " selected='selected'" : '') + '>' + escaped + '</option>';
            }
          } else {
            for (var _j in val.value) {
              if (hasOwn.call(val.value, _j)) {
                urlConfigHtml += "<option value='" + escapeText(_j) + "'" + (config[val.id] === _j ? (selection = true) && " selected='selected'" : '') + '>' + escapeText(val.value[_j]) + '</option>';
              }
            }
          }

          if (config[val.id] && !selection) {
            escaped = escapeText(config[val.id]);
            urlConfigHtml += "<option value='" + escaped + "' selected='selected' disabled='disabled'>" + escaped + '</option>';
          }

          urlConfigHtml += '</select>';
        }
      }

      return urlConfigHtml;
    } // Handle "click" events on toolbar checkboxes and "change" for select menus.
    // Updates the URL with the new state of `config.urlConfig` values.


    function toolbarChanged() {
      var field = this;
      var params = {}; // Detect if field is a select menu or a checkbox

      var value;

      if ('selectedIndex' in field) {
        value = field.options[field.selectedIndex].value || undefined;
      } else {
        value = field.checked ? field.defaultValue || true : undefined;
      }

      params[field.name] = value;
      var updatedUrl = setUrl(params); // Check if we can apply the change without a page refresh

      if (field.name === 'hidepassed' && 'replaceState' in window$1.history) {
        QUnit.urlParams[field.name] = value;
        config[field.name] = value || false;
        var tests = id('qunit-tests');

        if (tests) {
          var length = tests.children.length;
          var children = tests.children;

          if (field.checked) {
            for (var i = 0; i < length; i++) {
              var test = children[i];
              var className = test ? test.className : '';
              var classNameHasPass = className.indexOf('pass') > -1;
              var classNameHasSkipped = className.indexOf('skipped') > -1;

              if (classNameHasPass || classNameHasSkipped) {
                hiddenTests.push(test);
              }
            }

            var _iterator = _createForOfIteratorHelper(hiddenTests),
                _step;

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var hiddenTest = _step.value;
                tests.removeChild(hiddenTest);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
          } else {
            var _test;

            while ((_test = hiddenTests.pop()) != null) {
              tests.appendChild(_test);
            }
          }
        }

        window$1.history.replaceState(null, '', updatedUrl);
      } else {
        window$1.location = updatedUrl;
      }
    }

    function setUrl(params) {
      var querystring = '?';
      var location = window$1.location;
      params = extend(extend({}, QUnit.urlParams), params);

      for (var key in params) {
        // Skip inherited or undefined properties
        if (hasOwn.call(params, key) && params[key] !== undefined) {
          // Output a parameter for each value of this key
          // (but usually just one)
          var arrValue = [].concat(params[key]);

          for (var i = 0; i < arrValue.length; i++) {
            querystring += encodeURIComponent(key);

            if (arrValue[i] !== true) {
              querystring += '=' + encodeURIComponent(arrValue[i]);
            }

            querystring += '&';
          }
        }
      }

      return location.protocol + '//' + location.host + location.pathname + querystring.slice(0, -1);
    }

    function applyUrlParams() {
      var i;
      var selectedModules = [];
      var modulesList = id('qunit-modulefilter-dropdown-list').getElementsByTagName('input');
      var filter = id('qunit-filter-input').value;

      for (i = 0; i < modulesList.length; i++) {
        if (modulesList[i].checked) {
          selectedModules.push(modulesList[i].value);
        }
      }

      window$1.location = setUrl({
        filter: filter === '' ? undefined : filter,
        moduleId: selectedModules.length === 0 ? undefined : selectedModules,
        // Remove module and testId filter
        module: undefined,
        testId: undefined
      });
    }

    function toolbarUrlConfigContainer() {
      var urlConfigContainer = document.createElement('span');
      urlConfigContainer.innerHTML = getUrlConfigHtml();
      addClass(urlConfigContainer, 'qunit-url-config');
      addEvents(urlConfigContainer.getElementsByTagName('input'), 'change', toolbarChanged);
      addEvents(urlConfigContainer.getElementsByTagName('select'), 'change', toolbarChanged);
      return urlConfigContainer;
    }

    function abortTestsButton() {
      var button = document.createElement('button');
      button.id = 'qunit-abort-tests-button';
      button.innerHTML = 'Abort';
      addEvent(button, 'click', abortTests);
      return button;
    }

    function toolbarLooseFilter() {
      var filter = document.createElement('form');
      var label = document.createElement('label');
      var input = document.createElement('input');
      var button = document.createElement('button');
      addClass(filter, 'qunit-filter');
      label.innerHTML = 'Filter: ';
      input.type = 'text';
      input.value = config.filter || '';
      input.name = 'filter';
      input.id = 'qunit-filter-input';
      button.innerHTML = 'Go';
      label.appendChild(input);
      filter.appendChild(label);
      filter.appendChild(document.createTextNode(' '));
      filter.appendChild(button);
      addEvent(filter, 'submit', interceptNavigation);
      return filter;
    }

    function moduleListHtml(modules) {
      var html = '';

      for (var i = 0; i < modules.length; i++) {
        if (modules[i].name !== '') {
          var checked = config.moduleId.indexOf(modules[i].moduleId) > -1;
          html += "<li><label class='clickable" + (checked ? ' checked' : '') + "'><input type='checkbox' " + "value='" + modules[i].moduleId + "'" + (checked ? " checked='checked'" : '') + ' />' + escapeText(modules[i].name) + '</label></li>';
        }
      }

      return html;
    }

    function toolbarModuleFilter() {
      var moduleFilter = document.createElement('form');
      var label = document.createElement('label');
      var moduleSearch = document.createElement('input');
      var dropDown = document.createElement('div');
      var actions = document.createElement('span');
      var applyButton = document.createElement('button');
      var resetButton = document.createElement('button');
      var allModulesLabel = document.createElement('label');
      var allCheckbox = document.createElement('input');
      var dropDownList = document.createElement('ul');
      var dirty = false;
      moduleSearch.id = 'qunit-modulefilter-search';
      moduleSearch.autocomplete = 'off';
      addEvent(moduleSearch, 'input', searchInput);
      addEvent(moduleSearch, 'input', searchFocus);
      addEvent(moduleSearch, 'focus', searchFocus);
      addEvent(moduleSearch, 'click', searchFocus);
      config.modules.forEach(function (module) {
        module.namePrepared = fuzzysort.prepare(module.name);
      });
      label.id = 'qunit-modulefilter-search-container';
      label.innerHTML = 'Module: ';
      label.appendChild(moduleSearch);
      applyButton.textContent = 'Apply';
      applyButton.style.display = 'none';
      resetButton.textContent = 'Reset';
      resetButton.type = 'reset';
      resetButton.style.display = 'none';
      allCheckbox.type = 'checkbox';
      allCheckbox.checked = config.moduleId.length === 0;
      allModulesLabel.className = 'clickable';

      if (config.moduleId.length) {
        allModulesLabel.className = 'checked';
      }

      allModulesLabel.appendChild(allCheckbox);
      allModulesLabel.appendChild(document.createTextNode('All modules'));
      actions.id = 'qunit-modulefilter-actions';
      actions.appendChild(applyButton);
      actions.appendChild(resetButton);
      actions.appendChild(allModulesLabel);
      var commit = actions.firstChild;
      var reset = commit.nextSibling;
      addEvent(commit, 'click', applyUrlParams);
      dropDownList.id = 'qunit-modulefilter-dropdown-list';
      dropDownList.innerHTML = moduleListHtml(config.modules);
      dropDown.id = 'qunit-modulefilter-dropdown';
      dropDown.style.display = 'none';
      dropDown.appendChild(actions);
      dropDown.appendChild(dropDownList);
      addEvent(dropDown, 'change', selectionChange);
      selectionChange();
      moduleFilter.id = 'qunit-modulefilter';
      moduleFilter.appendChild(label);
      moduleFilter.appendChild(dropDown);
      addEvent(moduleFilter, 'submit', interceptNavigation);
      addEvent(moduleFilter, 'reset', function () {
        // Let the reset happen, then update styles
        window$1.setTimeout(selectionChange);
      }); // Enables show/hide for the dropdown

      function searchFocus() {
        if (dropDown.style.display !== 'none') {
          return;
        }

        dropDown.style.display = 'block';
        addEvent(document, 'click', hideHandler);
        addEvent(document, 'keydown', hideHandler); // Hide on Escape keydown or outside-container click

        function hideHandler(e) {
          var inContainer = moduleFilter.contains(e.target);

          if (e.keyCode === 27 || !inContainer) {
            if (e.keyCode === 27 && inContainer) {
              moduleSearch.focus();
            }

            dropDown.style.display = 'none';
            removeEvent(document, 'click', hideHandler);
            removeEvent(document, 'keydown', hideHandler);
            moduleSearch.value = '';
            searchInput();
          }
        }
      }

      function filterModules(searchText) {
        if (searchText === '') {
          return config.modules;
        }

        return fuzzysort.go(searchText, config.modules, {
          key: 'namePrepared',
          threshold: -10000
        }).map(function (module) {
          return module.obj;
        });
      } // Processes module search box input


      var searchInputTimeout;

      function searchInput() {
        window$1.clearTimeout(searchInputTimeout);
        searchInputTimeout = window$1.setTimeout(function () {
          var searchText = moduleSearch.value.toLowerCase();
          var filteredModules = filterModules(searchText);
          dropDownList.innerHTML = moduleListHtml(filteredModules);
        }, 200);
      } // Processes selection changes


      function selectionChange(evt) {
        var checkbox = evt && evt.target || allCheckbox;
        var modulesList = dropDownList.getElementsByTagName('input');
        var selectedNames = [];
        toggleClass(checkbox.parentNode, 'checked', checkbox.checked);
        dirty = false;

        if (checkbox.checked && checkbox !== allCheckbox) {
          allCheckbox.checked = false;
          removeClass(allCheckbox.parentNode, 'checked');
        }

        for (var i = 0; i < modulesList.length; i++) {
          var item = modulesList[i];

          if (!evt) {
            toggleClass(item.parentNode, 'checked', item.checked);
          } else if (checkbox === allCheckbox && checkbox.checked) {
            item.checked = false;
            removeClass(item.parentNode, 'checked');
          }

          dirty = dirty || item.checked !== item.defaultChecked;

          if (item.checked) {
            selectedNames.push(item.parentNode.textContent);
          }
        }

        commit.style.display = reset.style.display = dirty ? '' : 'none';
        moduleSearch.placeholder = selectedNames.join(', ') || allCheckbox.parentNode.textContent;
        moduleSearch.title = 'Type to filter list. Current selection:\n' + (selectedNames.join('\n') || allCheckbox.parentNode.textContent);
      }

      return moduleFilter;
    }

    function toolbarFilters() {
      var toolbarFilters = document.createElement('span');
      toolbarFilters.id = 'qunit-toolbar-filters';
      toolbarFilters.appendChild(toolbarLooseFilter());
      toolbarFilters.appendChild(toolbarModuleFilter());
      return toolbarFilters;
    }

    function appendToolbar() {
      var toolbar = id('qunit-testrunner-toolbar');

      if (toolbar) {
        toolbar.appendChild(toolbarUrlConfigContainer());
        toolbar.appendChild(toolbarFilters());
        toolbar.appendChild(document.createElement('div')).className = 'clearfix';
      }
    }

    function appendHeader() {
      var header = id('qunit-header');

      if (header) {
        header.innerHTML = "<a href='" + escapeText(unfilteredUrl) + "'>" + header.innerHTML + '</a> ';
      }
    }

    function appendBanner() {
      var banner = id('qunit-banner');

      if (banner) {
        banner.className = '';
      }
    }

    function appendTestResults() {
      var tests = id('qunit-tests');
      var result = id('qunit-testresult');
      var controls;

      if (result) {
        result.parentNode.removeChild(result);
      }

      if (tests) {
        tests.innerHTML = '';
        result = document.createElement('p');
        result.id = 'qunit-testresult';
        result.className = 'result';
        tests.parentNode.insertBefore(result, tests);
        result.innerHTML = '<div id="qunit-testresult-display">Running...<br />&#160;</div>' + '<div id="qunit-testresult-controls"></div>' + '<div class="clearfix"></div>';
        controls = id('qunit-testresult-controls');
      }

      if (controls) {
        controls.appendChild(abortTestsButton());
      }
    }

    function appendFilteredTest() {
      var testId = QUnit.config.testId;

      if (!testId || testId.length <= 0) {
        return '';
      }

      return "<div id='qunit-filteredTest'>Rerunning selected tests: " + escapeText(testId.join(', ')) + " <a id='qunit-clearFilter' href='" + escapeText(unfilteredUrl) + "'>Run all tests</a></div>";
    }

    function appendUserAgent() {
      var userAgent = id('qunit-userAgent');

      if (userAgent) {
        userAgent.innerHTML = '';
        userAgent.appendChild(document.createTextNode('QUnit ' + QUnit.version + '; ' + navigator.userAgent));
      }
    }

    function appendInterface() {
      var qunit = id('qunit'); // For compat with QUnit 1.2, and to support fully custom theme HTML,
      // we will use any existing elements if no id="qunit" element exists.
      //
      // Note that we don't fail or fallback to creating it ourselves,
      // because not having id="qunit" (and not having the below elements)
      // simply means QUnit acts headless, allowing users to use their own
      // reporters, or for a test runner to listen for events directly without
      // having the HTML reporter actively render anything.

      if (qunit) {
        qunit.setAttribute('role', 'main'); // Since QUnit 1.3, these are created automatically if the page
        // contains id="qunit".

        qunit.innerHTML = "<h1 id='qunit-header'>" + escapeText(document.title) + '</h1>' + "<h2 id='qunit-banner'></h2>" + "<div id='qunit-testrunner-toolbar' role='navigation'></div>" + appendFilteredTest() + "<h2 id='qunit-userAgent'></h2>" + "<ol id='qunit-tests'></ol>";
      }

      appendHeader();
      appendBanner();
      appendTestResults();
      appendUserAgent();
      appendToolbar();
    }

    function appendTest(name, testId, moduleName) {
      var tests = id('qunit-tests');

      if (!tests) {
        return;
      }

      var title = document.createElement('strong');
      title.innerHTML = getNameHtml(name, moduleName);
      var testBlock = document.createElement('li');
      testBlock.appendChild(title); // No ID or rerun link for "global failure" blocks

      if (testId !== undefined) {
        var rerunTrigger = document.createElement('a');
        rerunTrigger.innerHTML = 'Rerun';
        rerunTrigger.href = setUrl({
          testId: testId
        });
        testBlock.id = 'qunit-test-output-' + testId;
        testBlock.appendChild(rerunTrigger);
      }

      var assertList = document.createElement('ol');
      assertList.className = 'qunit-assert-list';
      testBlock.appendChild(assertList);
      tests.appendChild(testBlock);
      return testBlock;
    } // HTML Reporter initialization and load


    QUnit.on('runStart', function (runStart) {
      stats.defined = runStart.testCounts.total;
    });
    QUnit.begin(function () {
      // Initialize QUnit elements
      // This is done from begin() instead of runStart, because
      // urlparams.js uses begin(), which we need to wait for.
      // urlparams.js in turn uses begin() to allow plugins to
      // add entries to QUnit.config.urlConfig, which may be done
      // asynchronously.
      // <https://github.com/qunitjs/qunit/issues/1657>
      appendInterface();
    });

    function getRerunFailedHtml(failedTests) {
      if (failedTests.length === 0) {
        return '';
      }

      var href = setUrl({
        testId: failedTests
      });
      return ["<br /><a href='" + escapeText(href) + "'>", failedTests.length === 1 ? 'Rerun 1 failed test' : 'Rerun ' + failedTests.length + ' failed tests', '</a>'].join('');
    }

    QUnit.on('runEnd', function (runEnd) {
      var banner = id('qunit-banner');
      var tests = id('qunit-tests');
      var abortButton = id('qunit-abort-tests-button');
      var assertPassed = config.stats.all - config.stats.bad;
      var html = [runEnd.testCounts.total, ' tests completed in ', runEnd.runtime, ' milliseconds, with ', runEnd.testCounts.failed, ' failed, ', runEnd.testCounts.skipped, ' skipped, and ', runEnd.testCounts.todo, ' todo.<br />', "<span class='passed'>", assertPassed, "</span> assertions of <span class='total'>", config.stats.all, "</span> passed, <span class='failed'>", config.stats.bad, '</span> failed.', getRerunFailedHtml(stats.failedTests)].join('');
      var test;
      var assertLi;
      var assertList; // Update remaining tests to aborted

      if (abortButton && abortButton.disabled) {
        html = 'Tests aborted after ' + runEnd.runtime + ' milliseconds.';

        for (var i = 0; i < tests.children.length; i++) {
          test = tests.children[i];

          if (test.className === '' || test.className === 'running') {
            test.className = 'aborted';
            assertList = test.getElementsByTagName('ol')[0];
            assertLi = document.createElement('li');
            assertLi.className = 'fail';
            assertLi.innerHTML = 'Test aborted.';
            assertList.appendChild(assertLi);
          }
        }
      }

      if (banner && (!abortButton || abortButton.disabled === false)) {
        banner.className = runEnd.status === 'failed' ? 'qunit-fail' : 'qunit-pass';
      }

      if (abortButton) {
        abortButton.parentNode.removeChild(abortButton);
      }

      if (tests) {
        id('qunit-testresult-display').innerHTML = html;
      }

      if (config.altertitle && document.title) {
        // Show ✖ for good, ✔ for bad suite result in title
        // use escape sequences in case file gets loaded with non-utf-8
        // charset
        document.title = [runEnd.status === 'failed' ? "\u2716" : "\u2714", document.title.replace(/^[\u2714\u2716] /i, '')].join(' ');
      } // Scroll back to top to show results


      if (config.scrolltop && window$1.scrollTo) {
        window$1.scrollTo(0, 0);
      }
    });

    function getNameHtml(name, module) {
      var nameHtml = '';

      if (module) {
        nameHtml = "<span class='module-name'>" + escapeText(module) + '</span>: ';
      }

      nameHtml += "<span class='test-name'>" + escapeText(name) + '</span>';
      return nameHtml;
    }

    function getProgressHtml(stats) {
      return [stats.completed, ' / ', stats.defined, ' tests completed.<br />'].join('');
    }

    QUnit.testStart(function (details) {
      var running, bad;
      appendTest(details.name, details.testId, details.module);
      running = id('qunit-testresult-display');

      if (running) {
        addClass(running, 'running');
        bad = QUnit.config.reorder && details.previousFailure;
        running.innerHTML = [getProgressHtml(stats), bad ? 'Rerunning previously failed test: <br />' : 'Running: ', getNameHtml(details.name, details.module), getRerunFailedHtml(stats.failedTests)].join('');
      }
    });

    function stripHtml(string) {
      // Strip tags, html entity and whitespaces
      return string.replace(/<\/?[^>]+(>|$)/g, '').replace(/&quot;/g, '').replace(/\s+/g, '');
    }

    QUnit.log(function (details) {
      var testItem = id('qunit-test-output-' + details.testId);

      if (!testItem) {
        return;
      }

      var message = escapeText(details.message) || (details.result ? 'okay' : 'failed');
      message = "<span class='test-message'>" + message + '</span>';
      message += "<span class='runtime'>@ " + details.runtime + ' ms</span>';
      var expected;
      var actual;
      var diff;
      var showDiff = false; // The pushFailure doesn't provide details.expected
      // when it calls, it's implicit to also not show expected and diff stuff
      // Also, we need to check details.expected existence, as it can exist and be undefined

      if (!details.result && hasOwn.call(details, 'expected')) {
        if (details.negative) {
          expected = 'NOT ' + QUnit.dump.parse(details.expected);
        } else {
          expected = QUnit.dump.parse(details.expected);
        }

        actual = QUnit.dump.parse(details.actual);
        message += "<table><tr class='test-expected'><th>Expected: </th><td><pre>" + escapeText(expected) + '</pre></td></tr>';

        if (actual !== expected) {
          message += "<tr class='test-actual'><th>Result: </th><td><pre>" + escapeText(actual) + '</pre></td></tr>';

          if (typeof details.actual === 'number' && typeof details.expected === 'number') {
            if (!isNaN(details.actual) && !isNaN(details.expected)) {
              showDiff = true;
              diff = details.actual - details.expected;
              diff = (diff > 0 ? '+' : '') + diff;
            }
          } else if (typeof details.actual !== 'boolean' && typeof details.expected !== 'boolean') {
            diff = QUnit.diff(expected, actual); // don't show diff if there is zero overlap

            showDiff = stripHtml(diff).length !== stripHtml(expected).length + stripHtml(actual).length;
          }

          if (showDiff) {
            message += "<tr class='test-diff'><th>Diff: </th><td><pre>" + diff + '</pre></td></tr>';
          }
        } else if (expected.indexOf('[object Array]') !== -1 || expected.indexOf('[object Object]') !== -1) {
          message += "<tr class='test-message'><th>Message: </th><td>" + 'Diff suppressed as the depth of object is more than current max depth (' + QUnit.config.maxDepth + ').<p>Hint: Use <code>QUnit.dump.maxDepth</code> to ' + " run with a higher max depth or <a href='" + escapeText(setUrl({
            maxDepth: -1
          })) + "'>" + 'Rerun</a> without max depth.</p></td></tr>';
        } else {
          message += "<tr class='test-message'><th>Message: </th><td>" + 'Diff suppressed as the expected and actual results have an equivalent' + ' serialization</td></tr>';
        }

        if (details.source) {
          message += "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + '</pre></td></tr>';
        }

        message += '</table>'; // This occurs when pushFailure is set and we have an extracted stack trace
      } else if (!details.result && details.source) {
        message += '<table>' + "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + '</pre></td></tr>' + '</table>';
      }

      var assertList = testItem.getElementsByTagName('ol')[0];
      var assertLi = document.createElement('li');
      assertLi.className = details.result ? 'pass' : 'fail';
      assertLi.innerHTML = message;
      assertList.appendChild(assertLi);
    });
    QUnit.testDone(function (details) {
      var tests = id('qunit-tests');
      var testItem = id('qunit-test-output-' + details.testId);

      if (!tests || !testItem) {
        return;
      }

      removeClass(testItem, 'running');
      var status;

      if (details.failed > 0) {
        status = 'failed';
      } else if (details.todo) {
        status = 'todo';
      } else {
        status = details.skipped ? 'skipped' : 'passed';
      }

      var assertList = testItem.getElementsByTagName('ol')[0];
      var good = details.passed;
      var bad = details.failed; // This test passed if it has no unexpected failed assertions

      var testPassed = details.failed > 0 ? details.todo : !details.todo;

      if (testPassed) {
        // Collapse the passing tests
        addClass(assertList, 'qunit-collapsed');
      } else {
        stats.failedTests.push(details.testId);

        if (config.collapse) {
          if (!collapseNext) {
            // Skip collapsing the first failing test
            collapseNext = true;
          } else {
            // Collapse remaining tests
            addClass(assertList, 'qunit-collapsed');
          }
        }
      } // The testItem.firstChild is the test name


      var testTitle = testItem.firstChild;
      var testCounts = bad ? "<b class='failed'>" + bad + '</b>, ' + "<b class='passed'>" + good + '</b>, ' : '';
      testTitle.innerHTML += " <b class='counts'>(" + testCounts + details.assertions.length + ')</b>';
      stats.completed++;

      if (details.skipped) {
        testItem.className = 'skipped';
        var skipped = document.createElement('em');
        skipped.className = 'qunit-skipped-label';
        skipped.innerHTML = 'skipped';
        testItem.insertBefore(skipped, testTitle);
      } else {
        addEvent(testTitle, 'click', function () {
          toggleClass(assertList, 'qunit-collapsed');
        });
        testItem.className = testPassed ? 'pass' : 'fail';

        if (details.todo) {
          var todoLabel = document.createElement('em');
          todoLabel.className = 'qunit-todo-label';
          todoLabel.innerHTML = 'todo';
          testItem.className += ' todo';
          testItem.insertBefore(todoLabel, testTitle);
        }

        var time = document.createElement('span');
        time.className = 'runtime';
        time.innerHTML = details.runtime + ' ms';
        testItem.insertBefore(time, assertList);
      } // Show the source of the test when showing assertions


      if (details.source) {
        var sourceName = document.createElement('p');
        sourceName.innerHTML = '<strong>Source: </strong>' + escapeText(details.source);
        addClass(sourceName, 'qunit-source');

        if (testPassed) {
          addClass(sourceName, 'qunit-collapsed');
        }

        addEvent(testTitle, 'click', function () {
          toggleClass(sourceName, 'qunit-collapsed');
        });
        testItem.appendChild(sourceName);
      }

      if (config.hidepassed && (status === 'passed' || details.skipped)) {
        // use removeChild instead of remove because of support
        hiddenTests.push(testItem);
        tests.removeChild(testItem);
      }
    });
    QUnit.on('error', function (error) {
      var testItem = appendTest('global failure');

      if (!testItem) {
        // HTML Reporter is probably disabled or not yet initialized.
        return;
      } // Render similar to a failed assertion (see above QUnit.log callback)


      var message = escapeText(errorString(error));
      message = "<span class='test-message'>" + message + '</span>';

      if (error && error.stack) {
        message += '<table>' + "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(error.stack) + '</pre></td></tr>' + '</table>';
      }

      var assertList = testItem.getElementsByTagName('ol')[0];
      var assertLi = document.createElement('li');
      assertLi.className = 'fail';
      assertLi.innerHTML = message;
      assertList.appendChild(assertLi); // Make it visible

      testItem.className = 'fail';
    }); // Avoid readyState issue with phantomjs
    // Ref: #818

    var usingPhantom = function (p) {
      return p && p.version && p.version.major > 0;
    }(window$1.phantom);

    if (usingPhantom) {
      console$1.warn('Support for PhantomJS is deprecated and will be removed in QUnit 3.0.');
    }

    if (!usingPhantom && document.readyState === 'complete') {
      QUnit.load();
    } else {
      addEvent(window$1, 'load', QUnit.load);
    } // Wrap window.onerror. We will call the original window.onerror to see if
    // the existing handler fully handles the error; if not, we will call the
    // QUnit.onError function.


    var originalWindowOnError = window$1.onerror; // Cover uncaught exceptions
    // Returning true will suppress the default browser handler,
    // returning false will let it run.

    window$1.onerror = function (message, fileName, lineNumber, columnNumber, errorObj) {
      var ret = false;

      if (originalWindowOnError) {
        for (var _len = arguments.length, args = new Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
          args[_key - 5] = arguments[_key];
        }

        ret = originalWindowOnError.call.apply(originalWindowOnError, [this, message, fileName, lineNumber, columnNumber, errorObj].concat(args));
      } // Treat return value as window.onerror itself does,
      // Only do our handling if not suppressed.


      if (ret !== true) {
        // If there is a current test that sets the internal `ignoreGlobalErrors` field
        // (such as during `assert.throws()`), then the error is ignored and native
        // error reporting is suppressed as well. This is because in browsers, an error
        // can sometimes end up in `window.onerror` instead of in the local try/catch.
        // This ignoring of errors does not apply to our general onUncaughtException
        // method, nor to our `unhandledRejection` handlers, as those are not meant
        // to receive an "expected" error during `assert.throws()`.
        if (config.current && config.current.ignoreGlobalErrors) {
          return true;
        } // According to
        // https://blog.sentry.io/2016/01/04/client-javascript-reporting-window-onerror,
        // most modern browsers support an errorObj argument; use that to
        // get a full stack trace if it's available.


        var error = errorObj || new Error(message);

        if (!error.stack && fileName && lineNumber) {
          error.stack = "".concat(fileName, ":").concat(lineNumber);
        }

        QUnit.onUncaughtException(error);
      }

      return ret;
    };

    window$1.addEventListener('unhandledrejection', function (event) {
      QUnit.onUncaughtException(event.reason);
    });
  })();

  /*
   * This file is a modified version of google-diff-match-patch's JavaScript implementation
   * (https://code.google.com/p/google-diff-match-patch/source/browse/trunk/javascript/diff_match_patch_uncompressed.js),
   * modifications are licensed as more fully set forth in LICENSE.txt.
   *
   * The original source of google-diff-match-patch is attributable and licensed as follows:
   *
   * Copyright 2006 Google Inc.
   * https://code.google.com/p/google-diff-match-patch/
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * https://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * More Info:
   *  https://code.google.com/p/google-diff-match-patch/
   *
   * Usage: QUnit.diff(expected, actual)
   *
   */

  QUnit.diff = function () {
    function DiffMatchPatch() {} //  DIFF FUNCTIONS

    /**
     * The data structure representing a diff is an array of tuples:
     * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
     * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
     */


    var DIFF_DELETE = -1;
    var DIFF_INSERT = 1;
    var DIFF_EQUAL = 0;
    var hasOwn = Object.prototype.hasOwnProperty;
    /**
     * Find the differences between two texts.  Simplifies the problem by stripping
     * any common prefix or suffix off the texts before diffing.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {boolean=} optChecklines Optional speedup flag. If present and false,
     *     then don't run a line-level diff first to identify the changed areas.
     *     Defaults to true, which does a faster, slightly less optimal diff.
     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
     */

    DiffMatchPatch.prototype.DiffMain = function (text1, text2, optChecklines) {
      var deadline, checklines, commonlength, commonprefix, commonsuffix, diffs; // The diff must be complete in up to 1 second.

      deadline = new Date().getTime() + 1000; // Check for null inputs.

      if (text1 === null || text2 === null) {
        throw new Error('Null input. (DiffMain)');
      } // Check for equality (speedup).


      if (text1 === text2) {
        if (text1) {
          return [[DIFF_EQUAL, text1]];
        }

        return [];
      }

      if (typeof optChecklines === 'undefined') {
        optChecklines = true;
      }

      checklines = optChecklines; // Trim off common prefix (speedup).

      commonlength = this.diffCommonPrefix(text1, text2);
      commonprefix = text1.substring(0, commonlength);
      text1 = text1.substring(commonlength);
      text2 = text2.substring(commonlength); // Trim off common suffix (speedup).

      commonlength = this.diffCommonSuffix(text1, text2);
      commonsuffix = text1.substring(text1.length - commonlength);
      text1 = text1.substring(0, text1.length - commonlength);
      text2 = text2.substring(0, text2.length - commonlength); // Compute the diff on the middle block.

      diffs = this.diffCompute(text1, text2, checklines, deadline); // Restore the prefix and suffix.

      if (commonprefix) {
        diffs.unshift([DIFF_EQUAL, commonprefix]);
      }

      if (commonsuffix) {
        diffs.push([DIFF_EQUAL, commonsuffix]);
      }

      this.diffCleanupMerge(diffs);
      return diffs;
    };
    /**
     * Reduce the number of edits by eliminating operationally trivial equalities.
     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
     */


    DiffMatchPatch.prototype.diffCleanupEfficiency = function (diffs) {
      var changes, equalities, equalitiesLength, lastequality, pointer, preIns, preDel, postIns, postDel;
      changes = false;
      equalities = []; // Stack of indices where equalities are found.

      equalitiesLength = 0; // Keeping our own length var is faster in JS.

      /** @type {?string} */

      lastequality = null; // Always equal to diffs[equalities[equalitiesLength - 1]][1]

      pointer = 0; // Index of current position.
      // Is there an insertion operation before the last equality.

      preIns = false; // Is there a deletion operation before the last equality.

      preDel = false; // Is there an insertion operation after the last equality.

      postIns = false; // Is there a deletion operation after the last equality.

      postDel = false;

      while (pointer < diffs.length) {
        // Equality found.
        if (diffs[pointer][0] === DIFF_EQUAL) {
          if (diffs[pointer][1].length < 4 && (postIns || postDel)) {
            // Candidate found.
            equalities[equalitiesLength++] = pointer;
            preIns = postIns;
            preDel = postDel;
            lastequality = diffs[pointer][1];
          } else {
            // Not a candidate, and can never become one.
            equalitiesLength = 0;
            lastequality = null;
          }

          postIns = postDel = false; // An insertion or deletion.
        } else {
          if (diffs[pointer][0] === DIFF_DELETE) {
            postDel = true;
          } else {
            postIns = true;
          }
          /*
           * Five types to be split:
           * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
           * <ins>A</ins>X<ins>C</ins><del>D</del>
           * <ins>A</ins><del>B</del>X<ins>C</ins>
           * <ins>A</del>X<ins>C</ins><del>D</del>
           * <ins>A</ins><del>B</del>X<del>C</del>
           */


          if (lastequality && (preIns && preDel && postIns && postDel || lastequality.length < 2 && preIns + preDel + postIns + postDel === 3)) {
            // Duplicate record.
            diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]); // Change second copy to insert.

            diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
            equalitiesLength--; // Throw away the equality we just deleted;

            lastequality = null;

            if (preIns && preDel) {
              // No changes made which could affect previous entry, keep going.
              postIns = postDel = true;
              equalitiesLength = 0;
            } else {
              equalitiesLength--; // Throw away the previous equality.

              pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
              postIns = postDel = false;
            }

            changes = true;
          }
        }

        pointer++;
      }

      if (changes) {
        this.diffCleanupMerge(diffs);
      }
    };
    /**
     * Convert a diff array into a pretty HTML report.
     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
     * @param {integer} string to be beautified.
     * @return {string} HTML representation.
     */


    DiffMatchPatch.prototype.diffPrettyHtml = function (diffs) {
      var html = [];

      for (var x = 0; x < diffs.length; x++) {
        var op = diffs[x][0]; // Operation (insert, delete, equal)

        var data = diffs[x][1]; // Text of change.

        switch (op) {
          case DIFF_INSERT:
            html[x] = '<ins>' + escapeText(data) + '</ins>';
            break;

          case DIFF_DELETE:
            html[x] = '<del>' + escapeText(data) + '</del>';
            break;

          case DIFF_EQUAL:
            html[x] = '<span>' + escapeText(data) + '</span>';
            break;
        }
      }

      return html.join('');
    };
    /**
     * Determine the common prefix of two strings.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {number} The number of characters common to the start of each
     *     string.
     */


    DiffMatchPatch.prototype.diffCommonPrefix = function (text1, text2) {
      var pointermid, pointermax, pointermin, pointerstart; // Quick check for common null cases.

      if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
        return 0;
      } // Binary search.
      // Performance analysis: https://neil.fraser.name/news/2007/10/09/


      pointermin = 0;
      pointermax = Math.min(text1.length, text2.length);
      pointermid = pointermax;
      pointerstart = 0;

      while (pointermin < pointermid) {
        if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {
          pointermin = pointermid;
          pointerstart = pointermin;
        } else {
          pointermax = pointermid;
        }

        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }

      return pointermid;
    };
    /**
     * Determine the common suffix of two strings.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {number} The number of characters common to the end of each string.
     */


    DiffMatchPatch.prototype.diffCommonSuffix = function (text1, text2) {
      var pointermid, pointermax, pointermin, pointerend; // Quick check for common null cases.

      if (!text1 || !text2 || text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)) {
        return 0;
      } // Binary search.
      // Performance analysis: https://neil.fraser.name/news/2007/10/09/


      pointermin = 0;
      pointermax = Math.min(text1.length, text2.length);
      pointermid = pointermax;
      pointerend = 0;

      while (pointermin < pointermid) {
        if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {
          pointermin = pointermid;
          pointerend = pointermin;
        } else {
          pointermax = pointermid;
        }

        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }

      return pointermid;
    };
    /**
     * Find the differences between two texts.  Assumes that the texts do not
     * have any common prefix or suffix.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {boolean} checklines Speedup flag.  If false, then don't run a
     *     line-level diff first to identify the changed areas.
     *     If true, then run a faster, slightly less optimal diff.
     * @param {number} deadline Time when the diff should be complete by.
     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
     * @private
     */


    DiffMatchPatch.prototype.diffCompute = function (text1, text2, checklines, deadline) {
      var diffs, longtext, shorttext, i, hm, text1A, text2A, text1B, text2B, midCommon, diffsA, diffsB;

      if (!text1) {
        // Just add some text (speedup).
        return [[DIFF_INSERT, text2]];
      }

      if (!text2) {
        // Just delete some text (speedup).
        return [[DIFF_DELETE, text1]];
      }

      longtext = text1.length > text2.length ? text1 : text2;
      shorttext = text1.length > text2.length ? text2 : text1;
      i = longtext.indexOf(shorttext);

      if (i !== -1) {
        // Shorter text is inside the longer text (speedup).
        diffs = [[DIFF_INSERT, longtext.substring(0, i)], [DIFF_EQUAL, shorttext], [DIFF_INSERT, longtext.substring(i + shorttext.length)]]; // Swap insertions for deletions if diff is reversed.

        if (text1.length > text2.length) {
          diffs[0][0] = diffs[2][0] = DIFF_DELETE;
        }

        return diffs;
      }

      if (shorttext.length === 1) {
        // Single character string.
        // After the previous speedup, the character can't be an equality.
        return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
      } // Check to see if the problem can be split in two.


      hm = this.diffHalfMatch(text1, text2);

      if (hm) {
        // A half-match was found, sort out the return data.
        text1A = hm[0];
        text1B = hm[1];
        text2A = hm[2];
        text2B = hm[3];
        midCommon = hm[4]; // Send both pairs off for separate processing.

        diffsA = this.DiffMain(text1A, text2A, checklines, deadline);
        diffsB = this.DiffMain(text1B, text2B, checklines, deadline); // Merge the results.

        return diffsA.concat([[DIFF_EQUAL, midCommon]], diffsB);
      }

      if (checklines && text1.length > 100 && text2.length > 100) {
        return this.diffLineMode(text1, text2, deadline);
      }

      return this.diffBisect(text1, text2, deadline);
    };
    /**
     * Do the two texts share a substring which is at least half the length of the
     * longer text?
     * This speedup can produce non-minimal diffs.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {Array.<string>} Five element Array, containing the prefix of
     *     text1, the suffix of text1, the prefix of text2, the suffix of
     *     text2 and the common middle.  Or null if there was no match.
     * @private
     */


    DiffMatchPatch.prototype.diffHalfMatch = function (text1, text2) {
      var longtext, shorttext, dmp, text1A, text2B, text2A, text1B, midCommon, hm1, hm2, hm;
      longtext = text1.length > text2.length ? text1 : text2;
      shorttext = text1.length > text2.length ? text2 : text1;

      if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
        return null; // Pointless.
      }

      dmp = this; // 'this' becomes 'window' in a closure.

      /**
       * Does a substring of shorttext exist within longtext such that the substring
       * is at least half the length of longtext?
       * Closure, but does not reference any external variables.
       * @param {string} longtext Longer string.
       * @param {string} shorttext Shorter string.
       * @param {number} i Start index of quarter length substring within longtext.
       * @return {Array.<string>} Five element Array, containing the prefix of
       *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
       *     of shorttext and the common middle.  Or null if there was no match.
       * @private
       */

      function diffHalfMatchI(longtext, shorttext, i) {
        var seed, j, bestCommon, prefixLength, suffixLength, bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB; // Start with a 1/4 length substring at position i as a seed.

        seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
        j = -1;
        bestCommon = '';

        while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
          prefixLength = dmp.diffCommonPrefix(longtext.substring(i), shorttext.substring(j));
          suffixLength = dmp.diffCommonSuffix(longtext.substring(0, i), shorttext.substring(0, j));

          if (bestCommon.length < suffixLength + prefixLength) {
            bestCommon = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);
            bestLongtextA = longtext.substring(0, i - suffixLength);
            bestLongtextB = longtext.substring(i + prefixLength);
            bestShorttextA = shorttext.substring(0, j - suffixLength);
            bestShorttextB = shorttext.substring(j + prefixLength);
          }
        }

        if (bestCommon.length * 2 >= longtext.length) {
          return [bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB, bestCommon];
        } else {
          return null;
        }
      } // First check if the second quarter is the seed for a half-match.


      hm1 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 4)); // Check again based on the third quarter.

      hm2 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 2));

      if (!hm1 && !hm2) {
        return null;
      } else if (!hm2) {
        hm = hm1;
      } else if (!hm1) {
        hm = hm2;
      } else {
        // Both matched.  Select the longest.
        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
      } // A half-match was found, sort out the return data.


      if (text1.length > text2.length) {
        text1A = hm[0];
        text1B = hm[1];
        text2A = hm[2];
        text2B = hm[3];
      } else {
        text2A = hm[0];
        text2B = hm[1];
        text1A = hm[2];
        text1B = hm[3];
      }

      midCommon = hm[4];
      return [text1A, text1B, text2A, text2B, midCommon];
    };
    /**
     * Do a quick line-level diff on both strings, then rediff the parts for
     * greater accuracy.
     * This speedup can produce non-minimal diffs.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {number} deadline Time when the diff should be complete by.
     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
     * @private
     */


    DiffMatchPatch.prototype.diffLineMode = function (text1, text2, deadline) {
      var a, diffs, linearray, pointer, countInsert, countDelete, textInsert, textDelete, j; // Scan the text on a line-by-line basis first.

      a = this.diffLinesToChars(text1, text2);
      text1 = a.chars1;
      text2 = a.chars2;
      linearray = a.lineArray;
      diffs = this.DiffMain(text1, text2, false, deadline); // Convert the diff back to original text.

      this.diffCharsToLines(diffs, linearray); // Eliminate freak matches (e.g. blank lines)

      this.diffCleanupSemantic(diffs); // Rediff any replacement blocks, this time character-by-character.
      // Add a dummy entry at the end.

      diffs.push([DIFF_EQUAL, '']);
      pointer = 0;
      countDelete = 0;
      countInsert = 0;
      textDelete = '';
      textInsert = '';

      while (pointer < diffs.length) {
        switch (diffs[pointer][0]) {
          case DIFF_INSERT:
            countInsert++;
            textInsert += diffs[pointer][1];
            break;

          case DIFF_DELETE:
            countDelete++;
            textDelete += diffs[pointer][1];
            break;

          case DIFF_EQUAL:
            // Upon reaching an equality, check for prior redundancies.
            if (countDelete >= 1 && countInsert >= 1) {
              // Delete the offending records and add the merged ones.
              diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert);
              pointer = pointer - countDelete - countInsert;
              a = this.DiffMain(textDelete, textInsert, false, deadline);

              for (j = a.length - 1; j >= 0; j--) {
                diffs.splice(pointer, 0, a[j]);
              }

              pointer = pointer + a.length;
            }

            countInsert = 0;
            countDelete = 0;
            textDelete = '';
            textInsert = '';
            break;
        }

        pointer++;
      }

      diffs.pop(); // Remove the dummy entry at the end.

      return diffs;
    };
    /**
     * Find the 'middle snake' of a diff, split the problem in two
     * and return the recursively constructed diff.
     * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {number} deadline Time at which to bail if not yet complete.
     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
     * @private
     */


    DiffMatchPatch.prototype.diffBisect = function (text1, text2, deadline) {
      var text1Length, text2Length, maxD, vOffset, vLength, v1, v2, x, delta, front, k1start, k1end, k2start, k2end, k2Offset, k1Offset, x1, x2, y1, y2, d, k1, k2; // Cache the text lengths to prevent multiple calls.

      text1Length = text1.length;
      text2Length = text2.length;
      maxD = Math.ceil((text1Length + text2Length) / 2);
      vOffset = maxD;
      vLength = 2 * maxD;
      v1 = new Array(vLength);
      v2 = new Array(vLength); // Setting all elements to -1 is faster in Chrome & Firefox than mixing
      // integers and undefined.

      for (x = 0; x < vLength; x++) {
        v1[x] = -1;
        v2[x] = -1;
      }

      v1[vOffset + 1] = 0;
      v2[vOffset + 1] = 0;
      delta = text1Length - text2Length; // If the total number of characters is odd, then the front path will collide
      // with the reverse path.

      front = delta % 2 !== 0; // Offsets for start and end of k loop.
      // Prevents mapping of space beyond the grid.

      k1start = 0;
      k1end = 0;
      k2start = 0;
      k2end = 0;

      for (d = 0; d < maxD; d++) {
        // Bail out if deadline is reached.
        if (new Date().getTime() > deadline) {
          break;
        } // Walk the front path one step.


        for (k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
          k1Offset = vOffset + k1;

          if (k1 === -d || k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1]) {
            x1 = v1[k1Offset + 1];
          } else {
            x1 = v1[k1Offset - 1] + 1;
          }

          y1 = x1 - k1;

          while (x1 < text1Length && y1 < text2Length && text1.charAt(x1) === text2.charAt(y1)) {
            x1++;
            y1++;
          }

          v1[k1Offset] = x1;

          if (x1 > text1Length) {
            // Ran off the right of the graph.
            k1end += 2;
          } else if (y1 > text2Length) {
            // Ran off the bottom of the graph.
            k1start += 2;
          } else if (front) {
            k2Offset = vOffset + delta - k1;

            if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] !== -1) {
              // Mirror x2 onto top-left coordinate system.
              x2 = text1Length - v2[k2Offset];

              if (x1 >= x2) {
                // Overlap detected.
                return this.diffBisectSplit(text1, text2, x1, y1, deadline);
              }
            }
          }
        } // Walk the reverse path one step.


        for (k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
          k2Offset = vOffset + k2;

          if (k2 === -d || k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1]) {
            x2 = v2[k2Offset + 1];
          } else {
            x2 = v2[k2Offset - 1] + 1;
          }

          y2 = x2 - k2;

          while (x2 < text1Length && y2 < text2Length && text1.charAt(text1Length - x2 - 1) === text2.charAt(text2Length - y2 - 1)) {
            x2++;
            y2++;
          }

          v2[k2Offset] = x2;

          if (x2 > text1Length) {
            // Ran off the left of the graph.
            k2end += 2;
          } else if (y2 > text2Length) {
            // Ran off the top of the graph.
            k2start += 2;
          } else if (!front) {
            k1Offset = vOffset + delta - k2;

            if (k1Offset >= 0 && k1Offset < vLength && v1[k1Offset] !== -1) {
              x1 = v1[k1Offset];
              y1 = vOffset + x1 - k1Offset; // Mirror x2 onto top-left coordinate system.

              x2 = text1Length - x2;

              if (x1 >= x2) {
                // Overlap detected.
                return this.diffBisectSplit(text1, text2, x1, y1, deadline);
              }
            }
          }
        }
      } // Diff took too long and hit the deadline or
      // number of diffs equals number of characters, no commonality at all.


      return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
    };
    /**
     * Given the location of the 'middle snake', split the diff in two parts
     * and recurse.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {number} x Index of split point in text1.
     * @param {number} y Index of split point in text2.
     * @param {number} deadline Time at which to bail if not yet complete.
     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
     * @private
     */


    DiffMatchPatch.prototype.diffBisectSplit = function (text1, text2, x, y, deadline) {
      var text1a, text1b, text2a, text2b, diffs, diffsb;
      text1a = text1.substring(0, x);
      text2a = text2.substring(0, y);
      text1b = text1.substring(x);
      text2b = text2.substring(y); // Compute both diffs serially.

      diffs = this.DiffMain(text1a, text2a, false, deadline);
      diffsb = this.DiffMain(text1b, text2b, false, deadline);
      return diffs.concat(diffsb);
    };
    /**
     * Reduce the number of edits by eliminating semantically trivial equalities.
     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
     */


    DiffMatchPatch.prototype.diffCleanupSemantic = function (diffs) {
      var changes, equalities, equalitiesLength, lastequality, pointer, lengthInsertions2, lengthDeletions2, lengthInsertions1, lengthDeletions1, deletion, insertion, overlapLength1, overlapLength2;
      changes = false;
      equalities = []; // Stack of indices where equalities are found.

      equalitiesLength = 0; // Keeping our own length var is faster in JS.

      /** @type {?string} */

      lastequality = null; // Always equal to diffs[equalities[equalitiesLength - 1]][1]

      pointer = 0; // Index of current position.
      // Number of characters that changed prior to the equality.

      lengthInsertions1 = 0;
      lengthDeletions1 = 0; // Number of characters that changed after the equality.

      lengthInsertions2 = 0;
      lengthDeletions2 = 0;

      while (pointer < diffs.length) {
        if (diffs[pointer][0] === DIFF_EQUAL) {
          // Equality found.
          equalities[equalitiesLength++] = pointer;
          lengthInsertions1 = lengthInsertions2;
          lengthDeletions1 = lengthDeletions2;
          lengthInsertions2 = 0;
          lengthDeletions2 = 0;
          lastequality = diffs[pointer][1];
        } else {
          // An insertion or deletion.
          if (diffs[pointer][0] === DIFF_INSERT) {
            lengthInsertions2 += diffs[pointer][1].length;
          } else {
            lengthDeletions2 += diffs[pointer][1].length;
          } // Eliminate an equality that is smaller or equal to the edits on both
          // sides of it.


          if (lastequality && lastequality.length <= Math.max(lengthInsertions1, lengthDeletions1) && lastequality.length <= Math.max(lengthInsertions2, lengthDeletions2)) {
            // Duplicate record.
            diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]); // Change second copy to insert.

            diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT; // Throw away the equality we just deleted.

            equalitiesLength--; // Throw away the previous equality (it needs to be reevaluated).

            equalitiesLength--;
            pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1; // Reset the counters.

            lengthInsertions1 = 0;
            lengthDeletions1 = 0;
            lengthInsertions2 = 0;
            lengthDeletions2 = 0;
            lastequality = null;
            changes = true;
          }
        }

        pointer++;
      } // Normalize the diff.


      if (changes) {
        this.diffCleanupMerge(diffs);
      } // Find any overlaps between deletions and insertions.
      // e.g: <del>abcxxx</del><ins>xxxdef</ins>
      //   -> <del>abc</del>xxx<ins>def</ins>
      // e.g: <del>xxxabc</del><ins>defxxx</ins>
      //   -> <ins>def</ins>xxx<del>abc</del>
      // Only extract an overlap if it is as big as the edit ahead or behind it.


      pointer = 1;

      while (pointer < diffs.length) {
        if (diffs[pointer - 1][0] === DIFF_DELETE && diffs[pointer][0] === DIFF_INSERT) {
          deletion = diffs[pointer - 1][1];
          insertion = diffs[pointer][1];
          overlapLength1 = this.diffCommonOverlap(deletion, insertion);
          overlapLength2 = this.diffCommonOverlap(insertion, deletion);

          if (overlapLength1 >= overlapLength2) {
            if (overlapLength1 >= deletion.length / 2 || overlapLength1 >= insertion.length / 2) {
              // Overlap found.  Insert an equality and trim the surrounding edits.
              diffs.splice(pointer, 0, [DIFF_EQUAL, insertion.substring(0, overlapLength1)]);
              diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlapLength1);
              diffs[pointer + 1][1] = insertion.substring(overlapLength1);
              pointer++;
            }
          } else {
            if (overlapLength2 >= deletion.length / 2 || overlapLength2 >= insertion.length / 2) {
              // Reverse overlap found.
              // Insert an equality and swap and trim the surrounding edits.
              diffs.splice(pointer, 0, [DIFF_EQUAL, deletion.substring(0, overlapLength2)]);
              diffs[pointer - 1][0] = DIFF_INSERT;
              diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlapLength2);
              diffs[pointer + 1][0] = DIFF_DELETE;
              diffs[pointer + 1][1] = deletion.substring(overlapLength2);
              pointer++;
            }
          }

          pointer++;
        }

        pointer++;
      }
    };
    /**
     * Determine if the suffix of one string is the prefix of another.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {number} The number of characters common to the end of the first
     *     string and the start of the second string.
     * @private
     */


    DiffMatchPatch.prototype.diffCommonOverlap = function (text1, text2) {
      var text1Length, text2Length, textLength, best, length, pattern, found; // Cache the text lengths to prevent multiple calls.

      text1Length = text1.length;
      text2Length = text2.length; // Eliminate the null case.

      if (text1Length === 0 || text2Length === 0) {
        return 0;
      } // Truncate the longer string.


      if (text1Length > text2Length) {
        text1 = text1.substring(text1Length - text2Length);
      } else if (text1Length < text2Length) {
        text2 = text2.substring(0, text1Length);
      }

      textLength = Math.min(text1Length, text2Length); // Quick check for the worst case.

      if (text1 === text2) {
        return textLength;
      } // Start by looking for a single character match
      // and increase length until no match is found.
      // Performance analysis: https://neil.fraser.name/news/2010/11/04/


      best = 0;
      length = 1;

      while (true) {
        pattern = text1.substring(textLength - length);
        found = text2.indexOf(pattern);

        if (found === -1) {
          return best;
        }

        length += found;

        if (found === 0 || text1.substring(textLength - length) === text2.substring(0, length)) {
          best = length;
          length++;
        }
      }
    };
    /**
     * Split two texts into an array of strings.  Reduce the texts to a string of
     * hashes where each Unicode character represents one line.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}
     *     An object containing the encoded text1, the encoded text2 and
     *     the array of unique strings.
     *     The zeroth element of the array of unique strings is intentionally blank.
     * @private
     */


    DiffMatchPatch.prototype.diffLinesToChars = function (text1, text2) {
      var lineArray, lineHash, chars1, chars2;
      lineArray = []; // E.g. lineArray[4] === 'Hello\n'

      lineHash = {}; // E.g. lineHash['Hello\n'] === 4
      // '\x00' is a valid character, but various debuggers don't like it.
      // So we'll insert a junk entry to avoid generating a null character.

      lineArray[0] = '';
      /**
       * Split a text into an array of strings.  Reduce the texts to a string of
       * hashes where each Unicode character represents one line.
       * Modifies linearray and linehash through being a closure.
       * @param {string} text String to encode.
       * @return {string} Encoded string.
       * @private
       */

      function diffLinesToCharsMunge(text) {
        var chars = ''; // Walk the text, pulling out a substring for each line.
        // text.split('\n') would would temporarily double our memory footprint.
        // Modifying text would create many large strings to garbage collect.

        var lineStart = 0;
        var lineEnd = -1; // Keeping our own length variable is faster than looking it up.

        var lineArrayLength = lineArray.length;

        while (lineEnd < text.length - 1) {
          lineEnd = text.indexOf('\n', lineStart);

          if (lineEnd === -1) {
            lineEnd = text.length - 1;
          }

          var line = text.substring(lineStart, lineEnd + 1);
          lineStart = lineEnd + 1;

          if (hasOwn.call(lineHash, line)) {
            chars += String.fromCharCode(lineHash[line]);
          } else {
            chars += String.fromCharCode(lineArrayLength);
            lineHash[line] = lineArrayLength;
            lineArray[lineArrayLength++] = line;
          }
        }

        return chars;
      }

      chars1 = diffLinesToCharsMunge(text1);
      chars2 = diffLinesToCharsMunge(text2);
      return {
        chars1: chars1,
        chars2: chars2,
        lineArray: lineArray
      };
    };
    /**
     * Rehydrate the text in a diff from a string of line hashes to real lines of
     * text.
     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
     * @param {!Array.<string>} lineArray Array of unique strings.
     * @private
     */


    DiffMatchPatch.prototype.diffCharsToLines = function (diffs, lineArray) {
      var x, chars, text, y;

      for (x = 0; x < diffs.length; x++) {
        chars = diffs[x][1];
        text = [];

        for (y = 0; y < chars.length; y++) {
          text[y] = lineArray[chars.charCodeAt(y)];
        }

        diffs[x][1] = text.join('');
      }
    };
    /**
     * Reorder and merge like edit sections.  Merge equalities.
     * Any edit section can move as long as it doesn't cross an equality.
     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
     */


    DiffMatchPatch.prototype.diffCleanupMerge = function (diffs) {
      var pointer, countDelete, countInsert, textInsert, textDelete, commonlength, changes, diffPointer, position;
      diffs.push([DIFF_EQUAL, '']); // Add a dummy entry at the end.

      pointer = 0;
      countDelete = 0;
      countInsert = 0;
      textDelete = '';
      textInsert = '';

      while (pointer < diffs.length) {
        switch (diffs[pointer][0]) {
          case DIFF_INSERT:
            countInsert++;
            textInsert += diffs[pointer][1];
            pointer++;
            break;

          case DIFF_DELETE:
            countDelete++;
            textDelete += diffs[pointer][1];
            pointer++;
            break;

          case DIFF_EQUAL:
            // Upon reaching an equality, check for prior redundancies.
            if (countDelete + countInsert > 1) {
              if (countDelete !== 0 && countInsert !== 0) {
                // Factor out any common prefixes.
                commonlength = this.diffCommonPrefix(textInsert, textDelete);

                if (commonlength !== 0) {
                  if (pointer - countDelete - countInsert > 0 && diffs[pointer - countDelete - countInsert - 1][0] === DIFF_EQUAL) {
                    diffs[pointer - countDelete - countInsert - 1][1] += textInsert.substring(0, commonlength);
                  } else {
                    diffs.splice(0, 0, [DIFF_EQUAL, textInsert.substring(0, commonlength)]);
                    pointer++;
                  }

                  textInsert = textInsert.substring(commonlength);
                  textDelete = textDelete.substring(commonlength);
                } // Factor out any common suffixies.


                commonlength = this.diffCommonSuffix(textInsert, textDelete);

                if (commonlength !== 0) {
                  diffs[pointer][1] = textInsert.substring(textInsert.length - commonlength) + diffs[pointer][1];
                  textInsert = textInsert.substring(0, textInsert.length - commonlength);
                  textDelete = textDelete.substring(0, textDelete.length - commonlength);
                }
              } // Delete the offending records and add the merged ones.


              if (countDelete === 0) {
                diffs.splice(pointer - countInsert, countDelete + countInsert, [DIFF_INSERT, textInsert]);
              } else if (countInsert === 0) {
                diffs.splice(pointer - countDelete, countDelete + countInsert, [DIFF_DELETE, textDelete]);
              } else {
                diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert, [DIFF_DELETE, textDelete], [DIFF_INSERT, textInsert]);
              }

              pointer = pointer - countDelete - countInsert + (countDelete ? 1 : 0) + (countInsert ? 1 : 0) + 1;
            } else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
              // Merge this equality with the previous one.
              diffs[pointer - 1][1] += diffs[pointer][1];
              diffs.splice(pointer, 1);
            } else {
              pointer++;
            }

            countInsert = 0;
            countDelete = 0;
            textDelete = '';
            textInsert = '';
            break;
        }
      }

      if (diffs[diffs.length - 1][1] === '') {
        diffs.pop(); // Remove the dummy entry at the end.
      } // Second pass: look for single edits surrounded on both sides by equalities
      // which can be shifted sideways to eliminate an equality.
      // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC


      changes = false;
      pointer = 1; // Intentionally ignore the first and last element (don't need checking).

      while (pointer < diffs.length - 1) {
        if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
          diffPointer = diffs[pointer][1];
          position = diffPointer.substring(diffPointer.length - diffs[pointer - 1][1].length); // This is a single edit surrounded by equalities.

          if (position === diffs[pointer - 1][1]) {
            // Shift the edit over the previous equality.
            diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
            diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
            diffs.splice(pointer - 1, 1);
            changes = true;
          } else if (diffPointer.substring(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {
            // Shift the edit over the next equality.
            diffs[pointer - 1][1] += diffs[pointer + 1][1];
            diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
            diffs.splice(pointer + 1, 1);
            changes = true;
          }
        }

        pointer++;
      } // If shifts were made, the diff needs reordering and another shift sweep.


      if (changes) {
        this.diffCleanupMerge(diffs);
      }
    };

    return function (o, n) {
      var diff, output, text;
      diff = new DiffMatchPatch();
      output = diff.DiffMain(o, n);
      diff.diffCleanupEfficiency(output);
      text = diff.diffPrettyHtml(output);
      return text;
    };
  }();

}());

QUnit.notifications = function( options ) {
  "use strict";

  options         = options         || {};
  options.icons   = options.icons   || {};
  options.timeout = options.timeout || 4000;
  options.titles  = options.titles  || { passed: "Passed!", failed: "Failed!" };
  options.bodies  = options.bodies  || {
    passed: "{{passed}} of {{total}} passed",
    failed: "{{passed}} passed. {{failed}} failed."
  };

  var renderBody = function( body, details ) {
    [ "passed", "failed", "total", "runtime" ].forEach( function( type ) {
      body = body.replace( "{{" + type + "}}", details[ type ] );
    } );

    return body;
  };

  function generateQueryString( params ) {
    var key,
      querystring = "?";

    params = QUnit.extend( QUnit.extend( {}, QUnit.urlParams ), params );

    for ( key in params ) {
      if ( params.hasOwnProperty( key ) ) {
        if ( params[ key ] === undefined ) {
          continue;
        }
        querystring += encodeURIComponent( key );
        if ( params[ key ] !== true ) {
          querystring += "=" + encodeURIComponent( params[ key ] );
        }
        querystring += "&";
      }
    }
    return location.protocol + "//" + location.host +
      location.pathname + querystring.slice( 0, -1 );
  }

  if ( window.Notification ) {
    QUnit.done( function( details ) {
      var title,
          _options = {},
          notification;

      if ( window.Notification && QUnit.urlParams.notifications ) {
        if ( details.failed === 0 ) {
          title = options.titles.passed;
          _options.body = renderBody( options.bodies.passed, details );

          if ( options.icons.passed ) {
            _options.icon = options.icons.passed;
          }
        } else {
          title = options.titles.failed;
          _options.body = renderBody( options.bodies.failed, details );

          if ( options.icons.failed ) {
            _options.icon = options.icons.failed;
          }
        }

        notification = new window.Notification( title, _options );

        setTimeout( function() {
          notification.close();
        }, options.timeout );
      }
    } );

    QUnit.begin( function() {
      var toolbar      = document.getElementById( "qunit-testrunner-toolbar" );
      if ( !toolbar ) { return; }

      var notification = document.createElement( "input" ),
          label        = document.createElement( "label" ),
          disableCheckbox = function() {
            notification.checked = false;
            notification.disabled = true;
            label.style.opacity = 0.5;
            label.title = notification.title = "Note: Notifications have been " +
              "disabled in this browser.";
          };

      notification.type = "checkbox";
      notification.id   = "qunit-notifications";

      label.innerHTML = "Notifications";
      label.for = "qunit-notifications";
      label.title = "Show notifications.";
      if ( window.Notification.permission === "denied" ) {
        disableCheckbox();
      } else if ( QUnit.urlParams.notifications ) {
        notification.checked = true;
      }

      notification.addEventListener( "click", function( event ) {
        if ( event.target.checked ) {
          if ( window.Notification.permission === "granted" ) {
            window.location = generateQueryString( { notifications: true } );
          } else if ( window.Notification.permission === "denied" ) {
            disableCheckbox();
          } else {
            window.Notification.requestPermission( function( permission ) {
              if ( permission === "denied" ) {
                disableCheckbox();
              } else {
                window.location = generateQueryString( { notifications: true } );
              }
            } );
          }
        } else {
          window.location = generateQueryString( { notifications: undefined } );
        }
      }, false );

      toolbar.appendChild( notification );
      toolbar.appendChild( label );
   } );
  }
};

/* globals jQuery, QUnit */

(function() {
  QUnit.config.urlConfig.push({ id: 'nocontainer', label: 'Hide container'});
  QUnit.config.urlConfig.push({ id: 'nolint', label: 'Disable Linting'});
  QUnit.config.urlConfig.push({ id: 'dockcontainer', label: 'Dock container'});
  QUnit.config.urlConfig.push({ id: 'devmode', label: 'Development mode' });

  QUnit.config.testTimeout = QUnit.urlParams.devmode ? null : 60000; //Default Test Timeout 60 Seconds

  if (QUnit.notifications) {
    QUnit.notifications({
      icons: {
        passed: '/assets/passed.png',
        failed: '/assets/failed.png'
      }
    });
  }

  function ready(fn) {
    if (typeof jQuery === 'function') {
      jQuery(document).ready(fn);
      return;
    }

    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var testContainer = document.getElementById('ember-testing-container');
    if (!testContainer) { return; }

    var params = QUnit.urlParams;

    var containerVisibility = params.nocontainer ? 'hidden' : 'visible';
    var containerPosition = (params.dockcontainer || params.devmode) ? 'absolute' : 'relative';

    if (params.devmode) {
      testContainer.className = ' full-screen';
    }

    testContainer.style.visibility = containerVisibility;
    testContainer.style.position = containerPosition;
  });
})();

/* globals jQuery, QUnit, require, requirejs */

(function() {
  function ready(fn) {
    if (typeof jQuery === 'function') {
      jQuery(document).ready(fn);
      return;
    }

    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
  
  var autostart = QUnit.config.autostart !== false;
  QUnit.config.autostart = false;

  ready(function() {
    var QUnitAdapter = require('ember-qunit').QUnitAdapter;
    Ember.Test.adapter = QUnitAdapter.create();

    var testLoaderModulePath = 'ember-cli-test-loader/test-support/index';

    if (!requirejs.entries[testLoaderModulePath]) {
      testLoaderModulePath = 'ember-cli/test-loader';
    }

    var TestLoaderModule = require(testLoaderModulePath);
    var TestLoader = TestLoaderModule['default'];
    var addModuleExcludeMatcher = TestLoaderModule['addModuleExcludeMatcher'];
    var addModuleIncludeMatcher = TestLoaderModule['addModuleIncludeMatcher'];

    function excludeModule(moduleName) {
      return QUnit.urlParams.nolint &&
        moduleName.match(/\.(jshint|lint-test)$/);
    }

    function includeModule(moduleName) {
      return moduleName.match(/\.jshint$/);
    }

    if (addModuleExcludeMatcher && addModuleIncludeMatcher) {
      addModuleExcludeMatcher(excludeModule);
      addModuleIncludeMatcher(includeModule);
    } else {
      TestLoader.prototype.shouldLoadModule = function shouldLoadModule(moduleName) {
        return (moduleName.match(/[-_]test$/) || includeModule(moduleName)) && !excludeModule(moduleName);
      };
    }

    var moduleLoadFailures = [];

    TestLoader.prototype.moduleLoadFailure = function(moduleName, error) {
      moduleLoadFailures.push(error);

      QUnit.module('TestLoader Failures');
      QUnit.test(moduleName + ': could not be loaded', function() {
        throw error;
      });
    };

    QUnit.done(function() {
      if (moduleLoadFailures.length) {
        throw new Error('\n' + moduleLoadFailures.join('\n'));
      }
    });

    setTimeout(function() {
      TestLoader.load();

      if (autostart) {
        QUnit.start();
      }
    }, 250);
  });

})();

define('ember-basic-dropdown/test-support/helpers', ['exports', 'ember-native-dom-helpers', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpers, _emberTestHelpersWait) {
  'use strict';

  exports.nativeTap = nativeTap;
  exports.clickTrigger = clickTrigger;
  exports.tapTrigger = tapTrigger;
  exports.fireKeydown = fireKeydown;

  function nativeTap(selector) {
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

  function clickTrigger(scope) {
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
    (0, _emberNativeDomHelpers.click)(selector, options);
    return (0, _emberTestHelpersWait['default'])();
  }

  function tapTrigger(scope) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var selector = '.ember-basic-dropdown-trigger';
    if (scope) {
      selector = scope + ' ' + selector;
    }
    nativeTap(selector, options);
  }

  function fireKeydown(selector, k) {
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

  exports['default'] = function () {
    Ember.Test.registerAsyncHelper('clickDropdown', function (app, cssPath) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      clickTrigger(cssPath, options);
    });

    Ember.Test.registerAsyncHelper('tapDropdown', function (app, cssPath) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      tapTrigger(cssPath, options);
    });
  };
});
define('ember-cli-test-loader/test-support/index', ['exports'], function (exports) {
  /* globals requirejs, require */
  "use strict";

  exports.addModuleIncludeMatcher = addModuleIncludeMatcher;
  exports.addModuleExcludeMatcher = addModuleExcludeMatcher;
  exports['default'] = TestLoader;
  var moduleIncludeMatchers = [];
  var moduleExcludeMatchers = [];

  function addModuleIncludeMatcher(fn) {
    moduleIncludeMatchers.push(fn);
  }

  ;

  function addModuleExcludeMatcher(fn) {
    moduleExcludeMatchers.push(fn);
  }

  ;

  function checkMatchers(matchers, moduleName) {
    var matcher;

    for (var i = 0, l = matchers.length; i < l; i++) {
      matcher = matchers[i];

      if (matcher(moduleName)) {
        return true;
      }
    }

    return false;
  }
  function TestLoader() {
    this._didLogMissingUnsee = false;
  }

  ;

  TestLoader.prototype = {
    shouldLoadModule: function shouldLoadModule(moduleName) {
      return moduleName.match(/[-_]test$/);
    },

    listModules: function listModules() {
      return Object.keys(requirejs.entries);
    },

    listTestModules: function listTestModules() {
      var moduleNames = this.listModules();
      var testModules = [];
      var moduleName;

      for (var i = 0; i < moduleNames.length; i++) {
        moduleName = moduleNames[i];

        if (checkMatchers(moduleExcludeMatchers, moduleName)) {
          continue;
        }

        if (checkMatchers(moduleIncludeMatchers, moduleName) || this.shouldLoadModule(moduleName)) {
          testModules.push(moduleName);
        }
      }

      return testModules;
    },

    loadModules: function loadModules() {
      var testModules = this.listTestModules();
      var testModule;

      for (var i = 0; i < testModules.length; i++) {
        testModule = testModules[i];
        this.require(testModule);
        this.unsee(testModule);
      }
    }
  };

  TestLoader.prototype.require = function (moduleName) {
    try {
      require(moduleName);
    } catch (e) {
      this.moduleLoadFailure(moduleName, e);
    }
  };

  TestLoader.prototype.unsee = function (moduleName) {
    if (typeof require.unsee === 'function') {
      require.unsee(moduleName);
    } else if (!this._didLogMissingUnsee) {
      this._didLogMissingUnsee = true;
      if (typeof console !== 'undefined') {
        console.warn('unable to require.unsee, please upgrade loader.js to >= v3.3.0');
      }
    }
  };

  TestLoader.prototype.moduleLoadFailure = function (moduleName, error) {
    console.error('Error loading: ' + moduleName, error.stack);
  };

  TestLoader.load = function () {
    new TestLoader().loadModules();
  };
});
define('ember-native-dom-helpers/-private/get-element-with-assert', ['exports', 'ember-native-dom-helpers/-private/get-element'], function (exports, _emberNativeDomHelpersPrivateGetElement) {
  'use strict';

  exports['default'] = getElementWithAssert;

  /*
    @method getElementWithAssert
    @param {String|HTMLElement} selectorOrElement
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return {Error|HTMLElement} element if found, or raises an error
    @private
  */

  function getElementWithAssert(selectorOrElement, contextEl) {
    var el = (0, _emberNativeDomHelpersPrivateGetElement['default'])(selectorOrElement, contextEl);
    if (el) {
      return el;
    }
    throw new Error('Element ' + selectorOrElement + ' not found.');
  }
});
define('ember-native-dom-helpers/-private/get-element', ['exports', 'ember-native-dom-helpers/settings'], function (exports, _emberNativeDomHelpersSettings) {
  'use strict';

  exports['default'] = getElement;

  /*
    @method getElement
    @param {String|HTMLElement} selectorOrElement
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return HTMLElement
    @private
  */

  function getElement() {
    var selectorOrElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var contextEl = arguments[1];

    if (selectorOrElement instanceof Window || selectorOrElement instanceof Document || selectorOrElement instanceof HTMLElement || selectorOrElement instanceof SVGElement) {
      return selectorOrElement;
    }
    var result = void 0;
    if (contextEl instanceof HTMLElement) {
      result = contextEl.querySelector(selectorOrElement);
    } else {
      result = document.querySelector(_emberNativeDomHelpersSettings['default'].rootElement + ' ' + selectorOrElement);
    }
    return result;
  }
});
define('ember-native-dom-helpers/-private/is-content-editable', ['exports'], function (exports) {
  'use strict';

  exports['default'] = isContentEditable;

  function isContentEditable(el) {
    return el.contentEditable === 'true';
  }
});
define('ember-native-dom-helpers/-private/is-focusable', ['exports', 'ember-native-dom-helpers/-private/is-form-control', 'ember-native-dom-helpers/-private/is-content-editable'], function (exports, _emberNativeDomHelpersPrivateIsFormControl, _emberNativeDomHelpersPrivateIsContentEditable) {
  'use strict';

  exports['default'] = isFocusable;

  function isFocusable(el) {
    var focusableTags = ['LINK', 'A'];

    if ((0, _emberNativeDomHelpersPrivateIsFormControl['default'])(el) || (0, _emberNativeDomHelpersPrivateIsContentEditable['default'])(el) || focusableTags.indexOf(el.tagName) > -1) {
      return true;
    }

    return el.hasAttribute('tabindex');
  }
});
define('ember-native-dom-helpers/-private/is-form-control', ['exports'], function (exports) {
  'use strict';

  exports['default'] = isFormControl;

  function isFormControl(el) {
    var formControlTags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
    var tagName = el.tagName,
        type = el.type;

    if (type === 'hidden') {
      return false;
    }

    return formControlTags.indexOf(tagName) > -1;
  }
});
define('ember-native-dom-helpers/blur', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/-private/is-focusable', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersPrivateIsFocusable, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.blur = blur;

  /*
    @method blur
    @param {String|HTMLElement} selector
    @return {RSVP.Promise}
    @public
  */

  function blur(selector) {
    if (!selector) {
      return;
    }

    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);

    if ((0, _emberNativeDomHelpersPrivateIsFocusable['default'])(el)) {
      Ember.run(null, function () {
        var browserIsNotFocused = document.hasFocus && !document.hasFocus();

        // makes `document.activeElement` be `body`.
        // If the browser is focused, it also fires a blur event
        el.blur();

        // Chrome/Firefox does not trigger the `blur` event if the window
        // does not have focus. If the document does not have focus then
        // fire `blur` event via native event.
        if (browserIsNotFocused) {
          (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'blur', { bubbles: false });
        }
      });
    }

    return (window.wait || _emberTestHelpersWait['default'])();
  }
});
define('ember-native-dom-helpers/click', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-native-dom-helpers/focus', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersFireEvent, _emberNativeDomHelpersFocus, _emberTestHelpersWait) {
  'use strict';

  exports.clickEventSequence = clickEventSequence;
  exports.click = click;

  /*
    @method clickEventSequence
    @private
  */

  function clickEventSequence(el, options) {
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'mousedown', options);
    });
    (0, _emberNativeDomHelpersFocus.focus)(el);
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'mouseup', options);
    });
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'click', options);
    });
  }

  /*
    @method click
    @param {String|HTMLElement} selector
    @param {HTMLElement} context
    @param {Object} options
    @return {RSVP.Promise}
    @public
  */

  function click(selector, context, options) {
    var element = void 0;
    if (context instanceof HTMLElement) {
      element = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector, context);
    } else {
      options = context || {};
      element = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);
    }
    clickEventSequence(element, options);
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});
define('ember-native-dom-helpers/current-path', ['exports'], function (exports) {
  'use strict';

  exports.currentPath = currentPath;

  function currentPath() {
    var _window;

    if (!window.currentPath) {
      throw new Error('currentPath is only available during acceptance tests');
    }

    return (_window = window).currentPath.apply(_window, arguments);
  }
});
define('ember-native-dom-helpers/current-route-name', ['exports'], function (exports) {
  'use strict';

  exports.currentRouteName = currentRouteName;

  function currentRouteName() {
    var _window;

    if (!window.currentRouteName) {
      throw new Error('currentRouteName is only available during acceptance tests');
    }

    return (_window = window).currentRouteName.apply(_window, arguments);
  }
});
define('ember-native-dom-helpers/current-url', ['exports'], function (exports) {
  'use strict';

  exports.currentURL = currentURL;

  function currentURL() {
    var _window;

    if (!window.currentURL) {
      throw new Error('currentURL is only available during acceptance tests');
    }

    return (_window = window).currentURL.apply(_window, arguments);
  }
});
define('ember-native-dom-helpers/fill-in', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/-private/is-form-control', 'ember-native-dom-helpers/-private/is-content-editable', 'ember-native-dom-helpers/focus', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersPrivateIsFormControl, _emberNativeDomHelpersPrivateIsContentEditable, _emberNativeDomHelpersFocus, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.fillIn = fillIn;

  /*
    @method fillIn
    @param {String|HTMLElement} selector
    @param {String} text
    @return {RSVP.Promise}
    @public
  */

  function fillIn(selector, text) {
    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);

    if (!(0, _emberNativeDomHelpersPrivateIsFormControl['default'])(el) && !(0, _emberNativeDomHelpersPrivateIsContentEditable['default'])(el)) {
      throw new Error('Unable to fill element');
    }

    Ember.run(function () {
      return (0, _emberNativeDomHelpersFocus.focus)(el);
    });
    Ember.run(function () {
      if ((0, _emberNativeDomHelpersPrivateIsContentEditable['default'])(el)) {
        el.innerHTML = text;
      } else {
        el.value = text;
      }
    });
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'input');
    });
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'change');
    });
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});
define('ember-native-dom-helpers/find-all', ['exports', 'ember-native-dom-helpers/settings'], function (exports, _emberNativeDomHelpersSettings) {
  'use strict';

  exports.findAll = findAll;

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

  function findAll(selector, context) {
    var result = void 0;
    if (context instanceof Element) {
      result = context.querySelectorAll(selector);
    } else {
      result = document.querySelectorAll(_emberNativeDomHelpersSettings['default'].rootElement + ' ' + selector);
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
});
define('ember-native-dom-helpers/find-with-assert', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert) {
  'use strict';

  exports.findWithAssert = findWithAssert;

  /*
    @method findWithAssert
    @param {String} CSS selector to find elements in the test DOM
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return {Error|HTMLElement} element if found, or raises an error
    @public
  */

  function findWithAssert(selector, contextEl) {
    return (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector, contextEl);
  }
});
define('ember-native-dom-helpers/find', ['exports', 'ember-native-dom-helpers/-private/get-element'], function (exports, _emberNativeDomHelpersPrivateGetElement) {
  'use strict';

  exports.find = find;

  /*
    The find test helper uses `querySelector` to search inside the test
    DOM (based on app configuration for the rootElement).
  
    Alternalively, a second argument may be passed which is an element as the
    DOM context to search within.
  
    @method find
    @param {String} CSS selector to find one or more elements in the test DOM
    @param {HTMLElement} contextEl to query within, query from its contained DOM
    @return {null|HTMLElement} null or an element
    @public
  */

  function find(selector, contextEl) {
    return (0, _emberNativeDomHelpersPrivateGetElement['default'])(selector, contextEl);
  }
});
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
define('ember-native-dom-helpers/focus', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/-private/is-focusable', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersPrivateIsFocusable, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.focus = focus;

  /*
    @method focus
    @param {String|HTMLElement} selector
    @return {RSVP.Promise}
    @public
  */

  function focus(selector) {
    if (!selector) {
      return;
    }

    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);

    if ((0, _emberNativeDomHelpersPrivateIsFocusable['default'])(el)) {
      Ember.run(null, function () {
        var browserIsNotFocused = document.hasFocus && !document.hasFocus();

        // Firefox does not trigger the `focusin` event if the window
        // does not have focus. If the document does not have focus then
        // fire `focusin` event as well.
        if (browserIsNotFocused) {
          (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'focusin', {
            bubbles: false
          });
        }

        // makes `document.activeElement` be `el`. If the browser is focused, it also fires a focus event
        el.focus();

        // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
        if (browserIsNotFocused) {
          (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'focus', {
            bubbles: false
          });
        }
      });
    }

    return (window.wait || _emberTestHelpersWait['default'])();
  }
});
define('ember-native-dom-helpers/index', ['exports', 'ember-native-dom-helpers/find', 'ember-native-dom-helpers/find-all', 'ember-native-dom-helpers/find-with-assert', 'ember-native-dom-helpers/click', 'ember-native-dom-helpers/tap', 'ember-native-dom-helpers/fill-in', 'ember-native-dom-helpers/key-event', 'ember-native-dom-helpers/trigger-event', 'ember-native-dom-helpers/visit', 'ember-native-dom-helpers/wait-until', 'ember-native-dom-helpers/wait-for', 'ember-native-dom-helpers/current-url', 'ember-native-dom-helpers/current-path', 'ember-native-dom-helpers/focus', 'ember-native-dom-helpers/blur', 'ember-native-dom-helpers/scroll-to', 'ember-native-dom-helpers/current-route-name', 'ember-native-dom-helpers/select-files', 'ember-native-dom-helpers/settings'], function (exports, _emberNativeDomHelpersFind, _emberNativeDomHelpersFindAll, _emberNativeDomHelpersFindWithAssert, _emberNativeDomHelpersClick, _emberNativeDomHelpersTap, _emberNativeDomHelpersFillIn, _emberNativeDomHelpersKeyEvent, _emberNativeDomHelpersTriggerEvent, _emberNativeDomHelpersVisit, _emberNativeDomHelpersWaitUntil, _emberNativeDomHelpersWaitFor, _emberNativeDomHelpersCurrentUrl, _emberNativeDomHelpersCurrentPath, _emberNativeDomHelpersFocus, _emberNativeDomHelpersBlur, _emberNativeDomHelpersScrollTo, _emberNativeDomHelpersCurrentRouteName, _emberNativeDomHelpersSelectFiles, _emberNativeDomHelpersSettings) {
  'use strict';

  Object.defineProperty(exports, 'find', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersFind.find;
    }
  });
  Object.defineProperty(exports, 'findAll', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersFindAll.findAll;
    }
  });
  Object.defineProperty(exports, 'findWithAssert', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersFindWithAssert.findWithAssert;
    }
  });
  Object.defineProperty(exports, 'click', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersClick.click;
    }
  });
  Object.defineProperty(exports, 'tap', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersTap.tap;
    }
  });
  Object.defineProperty(exports, 'fillIn', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersFillIn.fillIn;
    }
  });
  Object.defineProperty(exports, 'keyEvent', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersKeyEvent.keyEvent;
    }
  });
  Object.defineProperty(exports, 'triggerEvent', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersTriggerEvent.triggerEvent;
    }
  });
  Object.defineProperty(exports, 'visit', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersVisit.visit;
    }
  });
  Object.defineProperty(exports, 'waitUntil', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersWaitUntil.waitUntil;
    }
  });
  Object.defineProperty(exports, 'waitFor', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersWaitFor.waitFor;
    }
  });
  Object.defineProperty(exports, 'currentURL', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersCurrentUrl.currentURL;
    }
  });
  Object.defineProperty(exports, 'currentPath', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersCurrentPath.currentPath;
    }
  });
  Object.defineProperty(exports, 'focus', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersFocus.focus;
    }
  });
  Object.defineProperty(exports, 'blur', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersBlur.blur;
    }
  });
  Object.defineProperty(exports, 'scrollTo', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersScrollTo.scrollTo;
    }
  });
  Object.defineProperty(exports, 'currentRouteName', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersCurrentRouteName.currentRouteName;
    }
  });
  Object.defineProperty(exports, 'selectFiles', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersSelectFiles.selectFiles;
    }
  });
  Object.defineProperty(exports, 'settings', {
    enumerable: true,
    get: function get() {
      return _emberNativeDomHelpersSettings['default'];
    }
  });
});
define('ember-native-dom-helpers/key-event', ['exports', 'ember-native-dom-helpers/trigger-event'], function (exports, _emberNativeDomHelpersTriggerEvent) {
  'use strict';

  exports.keyEvent = keyEvent;

  /**
   * @public
   * @param selector
   * @param type
   * @param keyCode
   * @param modifiers
   * @return {*}
   */

  function keyEvent(selector, type, keyCode) {
    var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { ctrlKey: false, altKey: false, shiftKey: false, metaKey: false };

    return (0, _emberNativeDomHelpersTriggerEvent.triggerEvent)(selector, type, Ember.merge({ keyCode: keyCode, which: keyCode, key: keyCode }, modifiers));
  }
});
define('ember-native-dom-helpers/scroll-to', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberTestHelpersWait) {
  'use strict';

  exports.scrollTo = scrollTo;

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
      return (0, _emberTestHelpersWait['default'])();
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

  function scrollTo(selector, x, y) {
    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);
    if (el instanceof HTMLElement) {
      el.scrollTop = y;
      el.scrollLeft = x;
    } else if (el instanceof Window) {
      el.scrollTo(x, y);
    }
    return waitForScrollEvent();
  }
});
define('ember-native-dom-helpers/select-files', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.selectFiles = selectFiles;

  /*
    @method selectFiles
    @param {String|HTMLElement} selector
    @param {Array} flies
    @return {RSVP.Promise}
    @public
  */

  function selectFiles(selector) {
    var files = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var element = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);

    true && !(element.type === 'file') && Ember.assert('This is only used with file inputs.\n          Either change to a \'type="file"\' or use the \'triggerEvent\' helper.', element.type === 'file');

    if (!Ember.isArray(files)) {
      files = [files];
    }

    true && !(element.multiple || files.length <= 1) && Ember.assert('Can only handle multiple slection when an input is set to allow for multiple files.\n          Please add the property "multiple" to your file input.', element.multiple || files.length <= 1);

    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(element, 'change', files);
    });
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});
define("ember-native-dom-helpers/settings", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  })();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  /*
    Options for use with test helpers, e.g. root element selector
  
    @class TestSupportSettings
  */
  var TestSupportSettings = (function () {
    function TestSupportSettings() {
      var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { rootElement: '#ember-testing' };

      _classCallCheck(this, TestSupportSettings);

      this._rootElement = init.rootElement;
    }

    /*
      Setting for Ember app root element, default is #ember-testing
       @public rootElement
      @type String
    */

    _createClass(TestSupportSettings, [{
      key: 'rootElement',
      get: function get() {
        return this._rootElement;
      },
      set: function set(value) {
        this._rootElement = value;
      }
    }]);

    return TestSupportSettings;
  })();

  var settings = new TestSupportSettings();

  exports["default"] = settings;
});
define('ember-native-dom-helpers/tap', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-native-dom-helpers/click', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersFireEvent, _emberNativeDomHelpersClick, _emberTestHelpersWait) {
  'use strict';

  exports.tap = tap;

  /*
    @method tap
    @param {String|HTMLElement} selector
    @param {Object} options
    @return {RSVP.Promise}
    @public
  */

  function tap(selector) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);
    var touchstartEv = void 0,
        touchendEv = void 0;
    Ember.run(function () {
      return touchstartEv = (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'touchstart', options);
    });
    Ember.run(function () {
      return touchendEv = (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, 'touchend', options);
    });
    if (!touchstartEv.defaultPrevented && !touchendEv.defaultPrevented) {
      (0, _emberNativeDomHelpersClick.clickEventSequence)(el);
    }
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});
define('ember-native-dom-helpers/trigger-event', ['exports', 'ember-native-dom-helpers/-private/get-element-with-assert', 'ember-native-dom-helpers/fire-event', 'ember-test-helpers/wait'], function (exports, _emberNativeDomHelpersPrivateGetElementWithAssert, _emberNativeDomHelpersFireEvent, _emberTestHelpersWait) {
  'use strict';

  exports.triggerEvent = triggerEvent;

  /*
    @method triggerEvent
    @param {String|HTMLElement} selector
    @param {String} type
    @param {Object} options
    @return {RSVP.Promise}
    @public
  */

  function triggerEvent(selector, type, options) {
    var el = (0, _emberNativeDomHelpersPrivateGetElementWithAssert['default'])(selector);
    Ember.run(function () {
      return (0, _emberNativeDomHelpersFireEvent.fireEvent)(el, type, options);
    });
    return (window.wait || _emberTestHelpersWait['default'])();
  }
});
define('ember-native-dom-helpers/visit', ['exports'], function (exports) {
  'use strict';

  exports.visit = visit;

  function visit() {
    var _window;

    if (!window.visit) {
      throw new Error('visit is only available during acceptance tests');
    }

    return (_window = window).visit.apply(_window, arguments);
  }
});
define('ember-native-dom-helpers/wait-for', ['exports', 'ember-native-dom-helpers/wait-until', 'ember-native-dom-helpers/find', 'ember-native-dom-helpers/find-all'], function (exports, _emberNativeDomHelpersWaitUntil, _emberNativeDomHelpersFind, _emberNativeDomHelpersFindAll) {
  'use strict';

  exports.waitFor = waitFor;

  function waitFor(selector) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === undefined ? 1000 : _ref$timeout,
        _ref$count = _ref.count,
        count = _ref$count === undefined ? null : _ref$count;

    var callback = void 0;
    if (count) {
      callback = function callback() {
        var elements = (0, _emberNativeDomHelpersFindAll.findAll)(selector);
        if (elements.length === count) {
          return elements;
        }
      };
    } else {
      callback = function callback() {
        return (0, _emberNativeDomHelpersFind.find)(selector);
      };
    }
    return (0, _emberNativeDomHelpersWaitUntil.waitUntil)(callback, { timeout: timeout });
  }
});
define('ember-native-dom-helpers/wait-until', ['exports'], function (exports) {
  'use strict';

  exports.waitUntil = waitUntil;

  function waitUntil(callback) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === undefined ? 1000 : _ref$timeout;

    return new Ember.RSVP.Promise(function (resolve, reject) {
      var value = Ember.run(callback);
      if (value) {
        resolve(value);
        return;
      }
      var time = 0;
      var tick = function tick() {
        time += 10;
        var value = Ember.run(callback);
        if (value) {
          resolve(value);
        } else if (time < timeout) {
          setTimeout(tick, 10);
        } else {
          reject('waitUntil timed out');
        }
      };
      setTimeout(tick, 10);
    });
  }
});
define('ember-qunit', ['exports', 'ember-qunit/module-for', 'ember-qunit/module-for-component', 'ember-qunit/module-for-model', 'ember-qunit/adapter', 'ember-test-helpers', 'qunit'], function (exports, _emberQunitModuleFor, _emberQunitModuleForComponent, _emberQunitModuleForModel, _emberQunitAdapter, _emberTestHelpers, _qunit) {
  'use strict';

  Object.defineProperty(exports, 'module', {
    enumerable: true,
    get: function get() {
      return _qunit.module;
    }
  });
  Object.defineProperty(exports, 'test', {
    enumerable: true,
    get: function get() {
      return _qunit.test;
    }
  });
  Object.defineProperty(exports, 'skip', {
    enumerable: true,
    get: function get() {
      return _qunit.skip;
    }
  });
  Object.defineProperty(exports, 'only', {
    enumerable: true,
    get: function get() {
      return _qunit.only;
    }
  });
  Object.defineProperty(exports, 'todo', {
    enumerable: true,
    get: function get() {
      return _qunit.todo;
    }
  });
  exports.moduleFor = _emberQunitModuleFor['default'];
  exports.moduleForComponent = _emberQunitModuleForComponent['default'];
  exports.moduleForModel = _emberQunitModuleForModel['default'];
  exports.setResolver = _emberTestHelpers.setResolver;
  exports.QUnitAdapter = _emberQunitAdapter['default'];
});
define('ember-qunit/adapter', ['exports', 'ember', 'qunit'], function (exports, _ember, _qunit) {
  'use strict';

  function unhandledRejectionAssertion(current, error) {
    var message = undefined,
        source = undefined;

    if (typeof error === 'object' && error !== null) {
      message = error.message;
      source = error.stack;
    } else if (typeof error === "string") {
      message = error;
      source = "unknown source";
    } else {
      message = "unhandledRejection occured, but it had no message";
      source = "unknown source";
    }

    current.pushResult({
      result: false,
      actual: false,
      expected: true,
      message: message,
      source: source
    });
  }

  exports['default'] = _ember['default'].Test.Adapter.extend({
    init: function init() {
      this.doneCallbacks = [];
    },

    asyncStart: function asyncStart() {
      this.doneCallbacks.push(_qunit['default'].config.current ? _qunit['default'].config.current.assert.async() : null);
    },

    asyncEnd: function asyncEnd() {
      var done = this.doneCallbacks.pop();
      // This can be null if asyncStart() was called outside of a test
      if (done) {
        done();
      }
    },

    exception: function exception(error) {
      unhandledRejectionAssertion(_qunit['default'].config.current, error);
    }
  });
});
define('ember-qunit/module-for-component', ['exports', 'ember-qunit/qunit-module', 'ember-test-helpers'], function (exports, _emberQunitQunitModule, _emberTestHelpers) {
  'use strict';

  exports['default'] = moduleForComponent;

  function moduleForComponent(name, description, callbacks) {
    (0, _emberQunitQunitModule.createModule)(_emberTestHelpers.TestModuleForComponent, name, description, callbacks);
  }
});
define('ember-qunit/module-for-model', ['exports', 'ember-qunit/qunit-module', 'ember-test-helpers'], function (exports, _emberQunitQunitModule, _emberTestHelpers) {
  'use strict';

  exports['default'] = moduleForModel;

  function moduleForModel(name, description, callbacks) {
    (0, _emberQunitQunitModule.createModule)(_emberTestHelpers.TestModuleForModel, name, description, callbacks);
  }
});
define('ember-qunit/module-for', ['exports', 'ember-qunit/qunit-module', 'ember-test-helpers'], function (exports, _emberQunitQunitModule, _emberTestHelpers) {
  'use strict';

  exports['default'] = moduleFor;

  function moduleFor(name, description, callbacks) {
    (0, _emberQunitQunitModule.createModule)(_emberTestHelpers.TestModule, name, description, callbacks);
  }
});
define('ember-qunit/qunit-module', ['exports', 'ember', 'qunit'], function (exports, _ember, _qunit) {
  'use strict';

  exports.createModule = createModule;

  function noop() {}

  function callbackFor(name, callbacks) {
    if (typeof callbacks !== 'object') {
      return noop;
    }
    if (!callbacks) {
      return noop;
    }

    var callback = noop;

    if (callbacks[name]) {
      callback = callbacks[name];
      delete callbacks[name];
    }

    return callback;
  }

  function createModule(Constructor, name, description, callbacks) {
    if (!callbacks && typeof description === 'object') {
      callbacks = description;
      description = name;
    }

    var _before = callbackFor('before', callbacks);
    var _beforeEach = callbackFor('beforeEach', callbacks);
    var _afterEach = callbackFor('afterEach', callbacks);
    var _after = callbackFor('after', callbacks);

    var module;
    var moduleName = typeof description === 'string' ? description : name;

    (0, _qunit.module)(moduleName, {
      before: function before() {
        // storing this in closure scope to avoid exposing these
        // private internals to the test context
        module = new Constructor(name, description, callbacks);
        return _before.apply(this, arguments);
      },

      beforeEach: function beforeEach() {
        var _module2,
            _this = this,
            _arguments = arguments;

        // provide the test context to the underlying module
        module.setContext(this);

        return (_module2 = module).setup.apply(_module2, arguments).then(function () {
          return _beforeEach.apply(_this, _arguments);
        });
      },

      afterEach: function afterEach() {
        var _arguments2 = arguments;

        var result = _afterEach.apply(this, arguments);
        return _ember['default'].RSVP.resolve(result).then(function () {
          var _module3;

          return (_module3 = module).teardown.apply(_module3, _arguments2);
        });
      },

      after: function after() {
        try {
          return _after.apply(this, arguments);
        } finally {
          _after = _afterEach = _before = _beforeEach = callbacks = module = null;
        }
      }
    });
  }
});
define('ember-test-helpers', ['exports', 'ember', 'ember-test-helpers/test-module', 'ember-test-helpers/test-module-for-acceptance', 'ember-test-helpers/test-module-for-integration', 'ember-test-helpers/test-module-for-component', 'ember-test-helpers/test-module-for-model', 'ember-test-helpers/test-context', 'ember-test-helpers/test-resolver'], function (exports, _ember, _emberTestHelpersTestModule, _emberTestHelpersTestModuleForAcceptance, _emberTestHelpersTestModuleForIntegration, _emberTestHelpersTestModuleForComponent, _emberTestHelpersTestModuleForModel, _emberTestHelpersTestContext, _emberTestHelpersTestResolver) {
  'use strict';

  _ember['default'].testing = true;

  exports.TestModule = _emberTestHelpersTestModule['default'];
  exports.TestModuleForAcceptance = _emberTestHelpersTestModuleForAcceptance['default'];
  exports.TestModuleForIntegration = _emberTestHelpersTestModuleForIntegration['default'];
  exports.TestModuleForComponent = _emberTestHelpersTestModuleForComponent['default'];
  exports.TestModuleForModel = _emberTestHelpersTestModuleForModel['default'];
  exports.getContext = _emberTestHelpersTestContext.getContext;
  exports.setContext = _emberTestHelpersTestContext.setContext;
  exports.unsetContext = _emberTestHelpersTestContext.unsetContext;
  exports.setResolver = _emberTestHelpersTestResolver.setResolver;
});
define('ember-test-helpers/-legacy-overrides', ['exports', 'ember', 'ember-test-helpers/has-ember-version'], function (exports, _ember, _emberTestHelpersHasEmberVersion) {
  'use strict';

  exports.preGlimmerSetupIntegrationForComponent = preGlimmerSetupIntegrationForComponent;

  function preGlimmerSetupIntegrationForComponent() {
    var module = this;
    var context = this.context;

    this.actionHooks = {};

    context.dispatcher = this.container.lookup('event_dispatcher:main') || _ember['default'].EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    context.actions = module.actionHooks;

    (this.registry || this.container).register('component:-test-holder', _ember['default'].Component.extend());

    context.render = function (template) {
      // in case `this.render` is called twice, make sure to teardown the first invocation
      module.teardownComponent();

      if (!template) {
        throw new Error("in a component integration test you must pass a template to `render()`");
      }
      if (_ember['default'].isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = _ember['default'].Handlebars.compile(template);
      }
      module.component = module.container.lookupFactory('component:-test-holder').create({
        layout: template
      });

      module.component.set('context', context);
      module.component.set('controller', context);

      _ember['default'].run(function () {
        module.component.appendTo('#ember-testing');
      });

      context._element = module.component.element;
    };

    context.$ = function () {
      return module.component.$.apply(module.component, arguments);
    };

    context.set = function (key, value) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].set(context, key, value);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].setProperties(context, hash);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return _ember['default'].get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return _ember['default'].getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error("integration testing template received unexpected action " + actionName);
      }
      hook.apply(module, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      module.teardownComponent();
    };
  }
});
define('ember-test-helpers/abstract-test-module', ['exports', 'ember-test-helpers/wait', 'ember-test-helpers/test-context', 'ember'], function (exports, _emberTestHelpersWait, _emberTestHelpersTestContext, _ember) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  // calling this `merge` here because we cannot
  // actually assume it is like `Object.assign`
  // with > 2 args
  var merge = _ember['default'].assign || _ember['default'].merge;

  var _default = (function () {
    function _default(name, options) {
      _classCallCheck(this, _default);

      this.context = undefined;
      this.name = name;
      this.callbacks = options || {};

      this.initSetupSteps();
      this.initTeardownSteps();
    }

    _createClass(_default, [{
      key: 'setup',
      value: function setup(assert) {
        var _this = this;

        return this.invokeSteps(this.setupSteps, this, assert).then(function () {
          _this.contextualizeCallbacks();
          return _this.invokeSteps(_this.contextualizedSetupSteps, _this.context, assert);
        });
      }
    }, {
      key: 'teardown',
      value: function teardown(assert) {
        var _this2 = this;

        return this.invokeSteps(this.contextualizedTeardownSteps, this.context, assert).then(function () {
          return _this2.invokeSteps(_this2.teardownSteps, _this2, assert);
        }).then(function () {
          _this2.cache = null;
          _this2.cachedCalls = null;
        });
      }
    }, {
      key: 'initSetupSteps',
      value: function initSetupSteps() {
        this.setupSteps = [];
        this.contextualizedSetupSteps = [];

        if (this.callbacks.beforeSetup) {
          this.setupSteps.push(this.callbacks.beforeSetup);
          delete this.callbacks.beforeSetup;
        }

        this.setupSteps.push(this.setupContext);
        this.setupSteps.push(this.setupTestElements);
        this.setupSteps.push(this.setupAJAXListeners);

        if (this.callbacks.setup) {
          this.contextualizedSetupSteps.push(this.callbacks.setup);
          delete this.callbacks.setup;
        }
      }
    }, {
      key: 'invokeSteps',
      value: function invokeSteps(steps, context, assert) {
        steps = steps.slice();

        function nextStep() {
          var step = steps.shift();
          if (step) {
            // guard against exceptions, for example missing components referenced from needs.
            return new _ember['default'].RSVP.Promise(function (resolve) {
              resolve(step.call(context, assert));
            }).then(nextStep);
          } else {
            return _ember['default'].RSVP.resolve();
          }
        }
        return nextStep();
      }
    }, {
      key: 'contextualizeCallbacks',
      value: function contextualizeCallbacks() {}
    }, {
      key: 'initTeardownSteps',
      value: function initTeardownSteps() {
        this.teardownSteps = [];
        this.contextualizedTeardownSteps = [];

        if (this.callbacks.teardown) {
          this.contextualizedTeardownSteps.push(this.callbacks.teardown);
          delete this.callbacks.teardown;
        }

        this.teardownSteps.push(this.teardownContext);
        this.teardownSteps.push(this.teardownTestElements);
        this.teardownSteps.push(this.teardownAJAXListeners);

        if (this.callbacks.afterTeardown) {
          this.teardownSteps.push(this.callbacks.afterTeardown);
          delete this.callbacks.afterTeardown;
        }
      }
    }, {
      key: 'setupTestElements',
      value: function setupTestElements() {
        var testEl = document.querySelector('#ember-testing');
        if (!testEl) {
          var element = document.createElement('div');
          element.setAttribute('id', 'ember-testing');

          document.body.appendChild(element);
          this.fixtureResetValue = '';
        } else {
          this.fixtureResetValue = testEl.innerHTML;
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext(options) {
        var context = this.getContext();

        merge(context, {
          dispatcher: null,
          inject: {}
        });
        merge(context, options);

        this.setToString();
        (0, _emberTestHelpersTestContext.setContext)(context);
        this.context = context;
      }
    }, {
      key: 'setContext',
      value: function setContext(context) {
        this.context = context;
      }
    }, {
      key: 'getContext',
      value: function getContext() {
        if (this.context) {
          return this.context;
        }

        return this.context = (0, _emberTestHelpersTestContext.getContext)() || {};
      }
    }, {
      key: 'setToString',
      value: function setToString() {
        var _this3 = this;

        this.context.toString = function () {
          if (_this3.subjectName) {
            return 'test context for: ' + _this3.subjectName;
          }

          if (_this3.name) {
            return 'test context for: ' + _this3.name;
          }
        };
      }
    }, {
      key: 'setupAJAXListeners',
      value: function setupAJAXListeners() {
        (0, _emberTestHelpersWait._setupAJAXHooks)();
      }
    }, {
      key: 'teardownAJAXListeners',
      value: function teardownAJAXListeners() {
        (0, _emberTestHelpersWait._teardownAJAXHooks)();
      }
    }, {
      key: 'teardownTestElements',
      value: function teardownTestElements() {
        document.getElementById('ember-testing').innerHTML = this.fixtureResetValue;

        // Ember 2.0.0 removed Ember.View as public API, so only do this when
        // Ember.View is present
        if (_ember['default'].View && _ember['default'].View.views) {
          _ember['default'].View.views = {};
        }
      }
    }, {
      key: 'teardownContext',
      value: function teardownContext() {
        var context = this.context;
        this.context = undefined;
        (0, _emberTestHelpersTestContext.unsetContext)();

        if (context && context.dispatcher && !context.dispatcher.isDestroyed) {
          _ember['default'].run(function () {
            context.dispatcher.destroy();
          });
        }
      }
    }]);

    return _default;
  })();

  exports['default'] = _default;
});
define('ember-test-helpers/build-registry', ['exports', 'require', 'ember'], function (exports, _require, _ember) {
  /* globals global, self, requirejs */

  'use strict';

  function exposeRegistryMethodsWithoutDeprecations(container) {
    var methods = ['register', 'unregister', 'resolve', 'normalize', 'typeInjection', 'injection', 'factoryInjection', 'factoryTypeInjection', 'has', 'options', 'optionsForType'];

    function exposeRegistryMethod(container, method) {
      if (method in container) {
        container[method] = function () {
          return container._registry[method].apply(container._registry, arguments);
        };
      }
    }

    for (var i = 0, l = methods.length; i < l; i++) {
      exposeRegistryMethod(container, methods[i]);
    }
  }

  var Owner = (function () {
    if (_ember['default']._RegistryProxyMixin && _ember['default']._ContainerProxyMixin) {
      return _ember['default'].Object.extend(_ember['default']._RegistryProxyMixin, _ember['default']._ContainerProxyMixin);
    }

    return _ember['default'].Object.extend();
  })();

  exports['default'] = function (resolver) {
    var fallbackRegistry, registry, container;
    var namespace = _ember['default'].Object.create({
      Resolver: { create: function create() {
          return resolver;
        } }
    });

    function register(name, factory) {
      var thingToRegisterWith = registry || container;

      if (!(container.factoryFor ? container.factoryFor(name) : container.lookupFactory(name))) {
        thingToRegisterWith.register(name, factory);
      }
    }

    if (_ember['default'].Application.buildRegistry) {
      fallbackRegistry = _ember['default'].Application.buildRegistry(namespace);
      fallbackRegistry.register('component-lookup:main', _ember['default'].ComponentLookup);

      registry = new _ember['default'].Registry({
        fallback: fallbackRegistry
      });

      if (_ember['default'].ApplicationInstance && _ember['default'].ApplicationInstance.setupRegistry) {
        _ember['default'].ApplicationInstance.setupRegistry(registry);
      }

      // these properties are set on the fallback registry by `buildRegistry`
      // and on the primary registry within the ApplicationInstance constructor
      // but we need to manually recreate them since ApplicationInstance's are not
      // exposed externally
      registry.normalizeFullName = fallbackRegistry.normalizeFullName;
      registry.makeToString = fallbackRegistry.makeToString;
      registry.describe = fallbackRegistry.describe;

      var owner = Owner.create({
        __registry__: registry,
        __container__: null
      });

      container = registry.container({ owner: owner });
      owner.__container__ = container;

      exposeRegistryMethodsWithoutDeprecations(container);
    } else {
      container = _ember['default'].Application.buildContainer(namespace);
      container.register('component-lookup:main', _ember['default'].ComponentLookup);
    }

    // Ember 1.10.0 did not properly add `view:toplevel` or `view:default`
    // to the registry in Ember.Application.buildRegistry :(
    //
    // Ember 2.0.0 removed Ember.View as public API, so only do this when
    // Ember.View is present
    if (_ember['default'].View) {
      register('view:toplevel', _ember['default'].View.extend());
    }

    // Ember 2.0.0 removed Ember._MetamorphView from the Ember global, so only
    // do this when present
    if (_ember['default']._MetamorphView) {
      register('view:default', _ember['default']._MetamorphView);
    }

    var globalContext = typeof global === 'object' && global || self;
    if (requirejs.entries['ember-data/setup-container']) {
      // ember-data is a proper ember-cli addon since 2.3; if no 'import
      // 'ember-data'' is present somewhere in the tests, there is also no `DS`
      // available on the globalContext and hence ember-data wouldn't be setup
      // correctly for the tests; that's why we import and call setupContainer
      // here; also see https://github.com/emberjs/data/issues/4071 for context
      var setupContainer = (0, _require['default'])('ember-data/setup-container')['default'];
      setupContainer(registry || container);
    } else if (globalContext.DS) {
      var DS = globalContext.DS;
      if (DS._setupContainer) {
        DS._setupContainer(registry || container);
      } else {
        register('transform:boolean', DS.BooleanTransform);
        register('transform:date', DS.DateTransform);
        register('transform:number', DS.NumberTransform);
        register('transform:string', DS.StringTransform);
        register('serializer:-default', DS.JSONSerializer);
        register('serializer:-rest', DS.RESTSerializer);
        register('adapter:-rest', DS.RESTAdapter);
      }
    }

    return {
      registry: registry,
      container: container
    };
  };
});
define('ember-test-helpers/has-ember-version', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  exports['default'] = hasEmberVersion;

  function hasEmberVersion(major, minor) {
    var numbers = _ember['default'].VERSION.split('-')[0].split('.');
    var actualMajor = parseInt(numbers[0], 10);
    var actualMinor = parseInt(numbers[1], 10);
    return actualMajor > major || actualMajor === major && actualMinor >= minor;
  }
});
define("ember-test-helpers/test-context", ["exports"], function (exports) {
  "use strict";

  exports.setContext = setContext;
  exports.getContext = getContext;
  exports.unsetContext = unsetContext;
  var __test_context__;

  function setContext(context) {
    __test_context__ = context;
  }

  function getContext() {
    return __test_context__;
  }

  function unsetContext() {
    __test_context__ = undefined;
  }
});
define('ember-test-helpers/test-module-for-acceptance', ['exports', 'ember-test-helpers/abstract-test-module', 'ember', 'ember-test-helpers/test-context'], function (exports, _emberTestHelpersAbstractTestModule, _ember, _emberTestHelpersTestContext) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _default = (function (_AbstractTestModule) {
    _inherits(_default, _AbstractTestModule);

    function _default() {
      _classCallCheck(this, _default);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(_default, [{
      key: 'setupContext',
      value: function setupContext() {
        _get(Object.getPrototypeOf(_default.prototype), 'setupContext', this).call(this, { application: this.createApplication() });
      }
    }, {
      key: 'teardownContext',
      value: function teardownContext() {
        _ember['default'].run(function () {
          (0, _emberTestHelpersTestContext.getContext)().application.destroy();
        });

        _get(Object.getPrototypeOf(_default.prototype), 'teardownContext', this).call(this);
      }
    }, {
      key: 'createApplication',
      value: function createApplication() {
        var _callbacks = this.callbacks;
        var Application = _callbacks.Application;
        var config = _callbacks.config;

        var application = undefined;

        _ember['default'].run(function () {
          application = Application.create(config);
          application.setupForTesting();
          application.injectTestHelpers();
        });

        return application;
      }
    }]);

    return _default;
  })(_emberTestHelpersAbstractTestModule['default']);

  exports['default'] = _default;
});
define('ember-test-helpers/test-module-for-component', ['exports', 'ember-test-helpers/test-module', 'ember', 'ember-test-helpers/has-ember-version', 'ember-test-helpers/-legacy-overrides'], function (exports, _emberTestHelpersTestModule, _ember, _emberTestHelpersHasEmberVersion, _emberTestHelpersLegacyOverrides) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.setupComponentIntegrationTest = _setupComponentIntegrationTest;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ACTION_KEY = undefined;
  if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
    ACTION_KEY = 'actions';
  } else {
    ACTION_KEY = '_actions';
  }

  var isPreGlimmer = !(0, _emberTestHelpersHasEmberVersion['default'])(1, 13);

  var getOwner = _ember['default'].getOwner;

  var _default = (function (_TestModule) {
    _inherits(_default, _TestModule);

    function _default(componentName, description, callbacks) {
      _classCallCheck(this, _default);

      // Allow `description` to be omitted
      if (!callbacks && typeof description === 'object') {
        callbacks = description;
        description = null;
      } else if (!callbacks) {
        callbacks = {};
      }

      var integrationOption = callbacks.integration;
      var hasNeeds = Array.isArray(callbacks.needs);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, 'component:' + componentName, description, callbacks);

      this.componentName = componentName;

      if (hasNeeds || callbacks.unit || integrationOption === false) {
        this.isUnitTest = true;
      } else if (integrationOption) {
        this.isUnitTest = false;
      } else {
        _ember['default'].deprecate("the component:" + componentName + " test module is implicitly running in unit test mode, " + "which will change to integration test mode by default in an upcoming version of " + "ember-test-helpers. Add `unit: true` or a `needs:[]` list to explicitly opt in to unit " + "test mode.", false, { id: 'ember-test-helpers.test-module-for-component.test-type', until: '0.6.0' });
        this.isUnitTest = true;
      }

      if (!this.isUnitTest && !this.isLegacy) {
        callbacks.integration = true;
      }

      if (this.isUnitTest || this.isLegacy) {
        this.setupSteps.push(this.setupComponentUnitTest);
      } else {
        this.callbacks.subject = function () {
          throw new Error("component integration tests do not support `subject()`. Instead, render the component as if it were HTML: `this.render('<my-component foo=true>');`. For more information, read: http://guides.emberjs.com/v2.2.0/testing/testing-components/");
        };
        this.setupSteps.push(this.setupComponentIntegrationTest);
        this.teardownSteps.unshift(this.teardownComponent);
      }

      if (_ember['default'].View && _ember['default'].View.views) {
        this.setupSteps.push(this._aliasViewRegistry);
        this.teardownSteps.unshift(this._resetViewRegistry);
      }
    }

    _createClass(_default, [{
      key: 'initIntegration',
      value: function initIntegration(options) {
        this.isLegacy = options.integration === 'legacy';
        this.isIntegration = options.integration !== 'legacy';
      }
    }, {
      key: '_aliasViewRegistry',
      value: function _aliasViewRegistry() {
        this._originalGlobalViewRegistry = _ember['default'].View.views;
        var viewRegistry = this.container.lookup('-view-registry:main');

        if (viewRegistry) {
          _ember['default'].View.views = viewRegistry;
        }
      }
    }, {
      key: '_resetViewRegistry',
      value: function _resetViewRegistry() {
        _ember['default'].View.views = this._originalGlobalViewRegistry;
      }
    }, {
      key: 'setupComponentUnitTest',
      value: function setupComponentUnitTest() {
        var _this = this;
        var resolver = this.resolver;
        var context = this.context;

        var layoutName = 'template:components/' + this.componentName;

        var layout = resolver.resolve(layoutName);

        var thingToRegisterWith = this.registry || this.container;
        if (layout) {
          thingToRegisterWith.register(layoutName, layout);
          thingToRegisterWith.injection(this.subjectName, 'layout', layoutName);
        }

        context.dispatcher = this.container.lookup('event_dispatcher:main') || _ember['default'].EventDispatcher.create();
        context.dispatcher.setup({}, '#ember-testing');

        context._element = null;

        this.callbacks.render = function () {
          var subject;

          _ember['default'].run(function () {
            subject = context.subject();
            subject.appendTo('#ember-testing');
          });

          context._element = subject.element;

          _this.teardownSteps.unshift(function () {
            _ember['default'].run(function () {
              _ember['default'].tryInvoke(subject, 'destroy');
            });
          });
        };

        this.callbacks.append = function () {
          _ember['default'].deprecate('this.append() is deprecated. Please use this.render() or this.$() instead.', false, { id: 'ember-test-helpers.test-module-for-component.append', until: '0.6.0' });
          return context.$();
        };

        context.$ = function () {
          this.render();
          var subject = this.subject();

          return subject.$.apply(subject, arguments);
        };
      }
    }, {
      key: 'setupComponentIntegrationTest',
      value: function setupComponentIntegrationTest() {
        if (isPreGlimmer) {
          return _emberTestHelpersLegacyOverrides.preGlimmerSetupIntegrationForComponent.apply(this, arguments);
        } else {
          return _setupComponentIntegrationTest.apply(this, arguments);
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext() {
        _get(Object.getPrototypeOf(_default.prototype), 'setupContext', this).call(this);

        // only setup the injection if we are running against a version
        // of Ember that has `-view-registry:main` (Ember >= 1.12)
        if (this.container.factoryFor ? this.container.factoryFor('-view-registry:main') : this.container.lookupFactory('-view-registry:main')) {
          (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
        }

        if (!this.isUnitTest && !this.isLegacy) {
          this.context.factory = function () {};
        }
      }
    }, {
      key: 'teardownComponent',
      value: function teardownComponent() {
        var component = this.component;
        if (component) {
          _ember['default'].run(component, 'destroy');
          this.component = null;
        }
      }
    }]);

    return _default;
  })(_emberTestHelpersTestModule['default']);

  exports['default'] = _default;

  function _setupComponentIntegrationTest() {
    var module = this;
    var context = this.context;

    this.actionHooks = context[ACTION_KEY] = {};
    context.dispatcher = this.container.lookup('event_dispatcher:main') || _ember['default'].EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');

    var hasRendered = false;
    var OutletView = module.container.factoryFor ? module.container.factoryFor('view:-outlet') : module.container.lookupFactory('view:-outlet');
    var OutletTemplate = module.container.lookup('template:-outlet');
    var toplevelView = module.component = OutletView.create();
    var hasOutletTemplate = !!OutletTemplate;
    var outletState = {
      render: {
        owner: getOwner ? getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'application',
        controller: module.context,
        ViewClass: undefined,
        template: OutletTemplate
      },

      outlets: {}
    };

    var element = document.getElementById('ember-testing');
    var templateId = 0;

    if (hasOutletTemplate) {
      _ember['default'].run(function () {
        toplevelView.setOutletState(outletState);
      });
    }

    context.render = function (template) {
      if (!template) {
        throw new Error("in a component integration test you must pass a template to `render()`");
      }
      if (_ember['default'].isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = _ember['default'].Handlebars.compile(template);
      }

      var templateFullName = 'template:-undertest-' + ++templateId;
      this.registry.register(templateFullName, template);
      var stateToRender = {
        owner: getOwner ? getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'index',
        controller: module.context,
        ViewClass: undefined,
        template: module.container.lookup(templateFullName),
        outlets: {}
      };

      if (hasOutletTemplate) {
        stateToRender.name = 'index';
        outletState.outlets.main = { render: stateToRender, outlets: {} };
      } else {
        stateToRender.name = 'application';
        outletState = { render: stateToRender, outlets: {} };
      }

      _ember['default'].run(function () {
        toplevelView.setOutletState(outletState);
      });

      if (!hasRendered) {
        _ember['default'].run(module.component, 'appendTo', '#ember-testing');
        hasRendered = true;
      }

      // ensure the element is based on the wrapping toplevel view
      // Ember still wraps the main application template with a
      // normal tagged view
      context._element = element = document.querySelector('#ember-testing > .ember-view');
    };

    context.$ = function (selector) {
      // emulates Ember internal behavor of `this.$` in a component
      // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
      return selector ? _ember['default'].$(selector, element) : _ember['default'].$(element);
    };

    context.set = function (key, value) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].set(context, key, value);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].setProperties(context, hash);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return _ember['default'].get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return _ember['default'].getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error("integration testing template received unexpected action " + actionName);
      }
      hook.apply(module.context, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      _ember['default'].run(function () {
        toplevelView.setOutletState({
          render: {
            owner: module.container,
            into: undefined,
            outlet: 'main',
            name: 'application',
            controller: module.context,
            ViewClass: undefined,
            template: undefined
          },
          outlets: {}
        });
      });
    };
  }
});
define('ember-test-helpers/test-module-for-integration', ['exports', 'ember', 'ember-test-helpers/abstract-test-module', 'ember-test-helpers/test-resolver', 'ember-test-helpers/build-registry', 'ember-test-helpers/has-ember-version', 'ember-test-helpers/-legacy-overrides', 'ember-test-helpers/test-module-for-component'], function (exports, _ember, _emberTestHelpersAbstractTestModule, _emberTestHelpersTestResolver, _emberTestHelpersBuildRegistry, _emberTestHelpersHasEmberVersion, _emberTestHelpersLegacyOverrides, _emberTestHelpersTestModuleForComponent) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var isPreGlimmer = !(0, _emberTestHelpersHasEmberVersion['default'])(1, 13);

  var _default = (function (_AbstractTestModule) {
    _inherits(_default, _AbstractTestModule);

    function _default() {
      _classCallCheck(this, _default);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).apply(this, arguments);
      this.resolver = this.callbacks.resolver || (0, _emberTestHelpersTestResolver.getResolver)();
    }

    _createClass(_default, [{
      key: 'initSetupSteps',
      value: function initSetupSteps() {
        this.setupSteps = [];
        this.contextualizedSetupSteps = [];

        if (this.callbacks.beforeSetup) {
          this.setupSteps.push(this.callbacks.beforeSetup);
          delete this.callbacks.beforeSetup;
        }

        this.setupSteps.push(this.setupContainer);
        this.setupSteps.push(this.setupContext);
        this.setupSteps.push(this.setupTestElements);
        this.setupSteps.push(this.setupAJAXListeners);
        this.setupSteps.push(this.setupComponentIntegrationTest);

        if (_ember['default'].View && _ember['default'].View.views) {
          this.setupSteps.push(this._aliasViewRegistry);
        }

        if (this.callbacks.setup) {
          this.contextualizedSetupSteps.push(this.callbacks.setup);
          delete this.callbacks.setup;
        }
      }
    }, {
      key: 'initTeardownSteps',
      value: function initTeardownSteps() {
        this.teardownSteps = [];
        this.contextualizedTeardownSteps = [];

        if (this.callbacks.teardown) {
          this.contextualizedTeardownSteps.push(this.callbacks.teardown);
          delete this.callbacks.teardown;
        }

        this.teardownSteps.push(this.teardownContainer);
        this.teardownSteps.push(this.teardownContext);
        this.teardownSteps.push(this.teardownAJAXListeners);
        this.teardownSteps.push(this.teardownComponent);

        if (_ember['default'].View && _ember['default'].View.views) {
          this.teardownSteps.push(this._resetViewRegistry);
        }

        this.teardownSteps.push(this.teardownTestElements);

        if (this.callbacks.afterTeardown) {
          this.teardownSteps.push(this.callbacks.afterTeardown);
          delete this.callbacks.afterTeardown;
        }
      }
    }, {
      key: 'setupContainer',
      value: function setupContainer() {
        var resolver = this.resolver;
        var items = (0, _emberTestHelpersBuildRegistry['default'])(resolver);

        this.container = items.container;
        this.registry = items.registry;

        if ((0, _emberTestHelpersHasEmberVersion['default'])(1, 13)) {
          var thingToRegisterWith = this.registry || this.container;
          var router = resolver.resolve('router:main');
          router = router || _ember['default'].Router.extend();
          thingToRegisterWith.register('router:main', router);
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext() {
        var subjectName = this.subjectName;
        var container = this.container;

        var factory = function factory() {
          return container.factoryFor ? container.factoryFor(subjectName) : container.lookupFactory(subjectName);
        };

        _get(Object.getPrototypeOf(_default.prototype), 'setupContext', this).call(this, {
          container: this.container,
          registry: this.registry,
          factory: factory,
          register: function register() {
            var target = this.registry || this.container;
            return target.register.apply(target, arguments);
          }
        });

        var context = this.context;

        if (_ember['default'].setOwner) {
          _ember['default'].setOwner(context, this.container.owner);
        }

        if (_ember['default'].inject) {
          var keys = (Object.keys || _ember['default'].keys)(_ember['default'].inject);
          keys.forEach(function (typeName) {
            context.inject[typeName] = function (name, opts) {
              var alias = opts && opts.as || name;
              _ember['default'].run(function () {
                _ember['default'].set(context, alias, context.container.lookup(typeName + ':' + name));
              });
            };
          });
        }

        // only setup the injection if we are running against a version
        // of Ember that has `-view-registry:main` (Ember >= 1.12)
        if (this.container.factoryFor ? this.container.factoryFor('-view-registry:main') : this.container.lookupFactory('-view-registry:main')) {
          (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
        }
      }
    }, {
      key: 'setupComponentIntegrationTest',
      value: function setupComponentIntegrationTest() {
        if (isPreGlimmer) {
          return _emberTestHelpersLegacyOverrides.preGlimmerSetupIntegrationForComponent.apply(this, arguments);
        } else {
          return _emberTestHelpersTestModuleForComponent.setupComponentIntegrationTest.apply(this, arguments);
        }
      }
    }, {
      key: 'teardownComponent',
      value: function teardownComponent() {
        var component = this.component;
        if (component) {
          _ember['default'].run(function () {
            component.destroy();
          });
        }
      }
    }, {
      key: 'teardownContainer',
      value: function teardownContainer() {
        var container = this.container;
        _ember['default'].run(function () {
          container.destroy();
        });
      }

      // allow arbitrary named factories, like rspec let
    }, {
      key: 'contextualizeCallbacks',
      value: function contextualizeCallbacks() {
        var callbacks = this.callbacks;
        var context = this.context;

        this.cache = this.cache || {};
        this.cachedCalls = this.cachedCalls || {};

        var keys = (Object.keys || _ember['default'].keys)(callbacks);
        var keysLength = keys.length;

        if (keysLength) {
          for (var i = 0; i < keysLength; i++) {
            this._contextualizeCallback(context, keys[i], context);
          }
        }
      }
    }, {
      key: '_contextualizeCallback',
      value: function _contextualizeCallback(context, key, callbackContext) {
        var _this = this;
        var callbacks = this.callbacks;
        var factory = context.factory;

        context[key] = function (options) {
          if (_this.cachedCalls[key]) {
            return _this.cache[key];
          }

          var result = callbacks[key].call(callbackContext, options, factory());

          _this.cache[key] = result;
          _this.cachedCalls[key] = true;

          return result;
        };
      }
    }, {
      key: '_aliasViewRegistry',
      value: function _aliasViewRegistry() {
        this._originalGlobalViewRegistry = _ember['default'].View.views;
        var viewRegistry = this.container.lookup('-view-registry:main');

        if (viewRegistry) {
          _ember['default'].View.views = viewRegistry;
        }
      }
    }, {
      key: '_resetViewRegistry',
      value: function _resetViewRegistry() {
        _ember['default'].View.views = this._originalGlobalViewRegistry;
      }
    }]);

    return _default;
  })(_emberTestHelpersAbstractTestModule['default']);

  exports['default'] = _default;
});
define('ember-test-helpers/test-module-for-model', ['exports', 'require', 'ember-test-helpers/test-module', 'ember'], function (exports, _require, _emberTestHelpersTestModule, _ember) {
  /* global DS, requirejs */ // added here to prevent an import from erroring when ED is not present

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _default = (function (_TestModule) {
    _inherits(_default, _TestModule);

    function _default(modelName, description, callbacks) {
      _classCallCheck(this, _default);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, 'model:' + modelName, description, callbacks);

      this.modelName = modelName;

      this.setupSteps.push(this.setupModel);
    }

    _createClass(_default, [{
      key: 'setupModel',
      value: function setupModel() {
        var container = this.container;
        var defaultSubject = this.defaultSubject;
        var callbacks = this.callbacks;
        var modelName = this.modelName;

        var adapterFactory = container.factoryFor ? container.factoryFor('adapter:application') : container.lookupFactory('adapter:application');
        if (!adapterFactory) {
          if (requirejs.entries['ember-data/adapters/json-api']) {
            adapterFactory = (0, _require['default'])('ember-data/adapters/json-api')['default'];
          }

          // when ember-data/adapters/json-api is provided via ember-cli shims
          // using Ember Data 1.x the actual JSONAPIAdapter isn't found, but the
          // above require statement returns a bizzaro object with only a `default`
          // property (circular reference actually)
          if (!adapterFactory || !adapterFactory.create) {
            adapterFactory = DS.JSONAPIAdapter || DS.FixtureAdapter;
          }

          var thingToRegisterWith = this.registry || this.container;
          thingToRegisterWith.register('adapter:application', adapterFactory);
        }

        callbacks.store = function () {
          var container = this.container;
          return container.lookup('service:store') || container.lookup('store:main');
        };

        if (callbacks.subject === defaultSubject) {
          callbacks.subject = function (options) {
            var container = this.container;

            return _ember['default'].run(function () {
              var store = container.lookup('service:store') || container.lookup('store:main');
              return store.createRecord(modelName, options);
            });
          };
        }
      }
    }]);

    return _default;
  })(_emberTestHelpersTestModule['default']);

  exports['default'] = _default;
});
define('ember-test-helpers/test-module', ['exports', 'ember', 'ember-test-helpers/abstract-test-module', 'ember-test-helpers/test-resolver', 'ember-test-helpers/build-registry', 'ember-test-helpers/has-ember-version'], function (exports, _ember, _emberTestHelpersAbstractTestModule, _emberTestHelpersTestResolver, _emberTestHelpersBuildRegistry, _emberTestHelpersHasEmberVersion) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _default = (function (_AbstractTestModule) {
    _inherits(_default, _AbstractTestModule);

    function _default(subjectName, description, callbacks) {
      _classCallCheck(this, _default);

      // Allow `description` to be omitted, in which case it should
      // default to `subjectName`
      if (!callbacks && typeof description === 'object') {
        callbacks = description;
        description = subjectName;
      }

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, description || subjectName, callbacks);

      this.subjectName = subjectName;
      this.description = description || subjectName;
      this.resolver = this.callbacks.resolver || (0, _emberTestHelpersTestResolver.getResolver)();

      if (this.callbacks.integration && this.callbacks.needs) {
        throw new Error("cannot declare 'integration: true' and 'needs' in the same module");
      }

      if (this.callbacks.integration) {
        this.initIntegration(callbacks);
        delete callbacks.integration;
      }

      this.initSubject();
      this.initNeeds();
    }

    _createClass(_default, [{
      key: 'initIntegration',
      value: function initIntegration(options) {
        if (options.integration === 'legacy') {
          throw new Error('`integration: \'legacy\'` is only valid for component tests.');
        }
        this.isIntegration = true;
      }
    }, {
      key: 'initSubject',
      value: function initSubject() {
        this.callbacks.subject = this.callbacks.subject || this.defaultSubject;
      }
    }, {
      key: 'initNeeds',
      value: function initNeeds() {
        this.needs = [this.subjectName];
        if (this.callbacks.needs) {
          this.needs = this.needs.concat(this.callbacks.needs);
          delete this.callbacks.needs;
        }
      }
    }, {
      key: 'initSetupSteps',
      value: function initSetupSteps() {
        this.setupSteps = [];
        this.contextualizedSetupSteps = [];

        if (this.callbacks.beforeSetup) {
          this.setupSteps.push(this.callbacks.beforeSetup);
          delete this.callbacks.beforeSetup;
        }

        this.setupSteps.push(this.setupContainer);
        this.setupSteps.push(this.setupContext);
        this.setupSteps.push(this.setupTestElements);
        this.setupSteps.push(this.setupAJAXListeners);

        if (this.callbacks.setup) {
          this.contextualizedSetupSteps.push(this.callbacks.setup);
          delete this.callbacks.setup;
        }
      }
    }, {
      key: 'initTeardownSteps',
      value: function initTeardownSteps() {
        this.teardownSteps = [];
        this.contextualizedTeardownSteps = [];

        if (this.callbacks.teardown) {
          this.contextualizedTeardownSteps.push(this.callbacks.teardown);
          delete this.callbacks.teardown;
        }

        this.teardownSteps.push(this.teardownSubject);
        this.teardownSteps.push(this.teardownContainer);
        this.teardownSteps.push(this.teardownContext);
        this.teardownSteps.push(this.teardownTestElements);
        this.teardownSteps.push(this.teardownAJAXListeners);

        if (this.callbacks.afterTeardown) {
          this.teardownSteps.push(this.callbacks.afterTeardown);
          delete this.callbacks.afterTeardown;
        }
      }
    }, {
      key: 'setupContainer',
      value: function setupContainer() {
        if (this.isIntegration || this.isLegacy) {
          this._setupIntegratedContainer();
        } else {
          this._setupIsolatedContainer();
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext() {
        var subjectName = this.subjectName;
        var container = this.container;

        var factory = function factory() {
          return container.factoryFor ? container.factoryFor(subjectName) : container.lookupFactory(subjectName);
        };

        _get(Object.getPrototypeOf(_default.prototype), 'setupContext', this).call(this, {
          container: this.container,
          registry: this.registry,
          factory: factory,
          register: function register() {
            var target = this.registry || this.container;
            return target.register.apply(target, arguments);
          }
        });

        if (_ember['default'].setOwner) {
          _ember['default'].setOwner(this.context, this.container.owner);
        }

        this.setupInject();
      }
    }, {
      key: 'setupInject',
      value: function setupInject() {
        var module = this;
        var context = this.context;

        if (_ember['default'].inject) {
          var keys = (Object.keys || _ember['default'].keys)(_ember['default'].inject);

          keys.forEach(function (typeName) {
            context.inject[typeName] = function (name, opts) {
              var alias = opts && opts.as || name;
              _ember['default'].run(function () {
                _ember['default'].set(context, alias, module.container.lookup(typeName + ':' + name));
              });
            };
          });
        }
      }
    }, {
      key: 'teardownSubject',
      value: function teardownSubject() {
        var subject = this.cache.subject;

        if (subject) {
          _ember['default'].run(function () {
            _ember['default'].tryInvoke(subject, 'destroy');
          });
        }
      }
    }, {
      key: 'teardownContainer',
      value: function teardownContainer() {
        var container = this.container;
        _ember['default'].run(function () {
          container.destroy();
        });
      }
    }, {
      key: 'defaultSubject',
      value: function defaultSubject(options, factory) {
        return factory.create(options);
      }

      // allow arbitrary named factories, like rspec let
    }, {
      key: 'contextualizeCallbacks',
      value: function contextualizeCallbacks() {
        var callbacks = this.callbacks;
        var context = this.context;

        this.cache = this.cache || {};
        this.cachedCalls = this.cachedCalls || {};

        var keys = (Object.keys || _ember['default'].keys)(callbacks);
        var keysLength = keys.length;

        if (keysLength) {
          var deprecatedContext = this._buildDeprecatedContext(this, context);
          for (var i = 0; i < keysLength; i++) {
            this._contextualizeCallback(context, keys[i], deprecatedContext);
          }
        }
      }
    }, {
      key: '_contextualizeCallback',
      value: function _contextualizeCallback(context, key, callbackContext) {
        var _this = this;
        var callbacks = this.callbacks;
        var factory = context.factory;

        context[key] = function (options) {
          if (_this.cachedCalls[key]) {
            return _this.cache[key];
          }

          var result = callbacks[key].call(callbackContext, options, factory());

          _this.cache[key] = result;
          _this.cachedCalls[key] = true;

          return result;
        };
      }

      /*
        Builds a version of the passed in context that contains deprecation warnings
        for accessing properties that exist on the module.
      */
    }, {
      key: '_buildDeprecatedContext',
      value: function _buildDeprecatedContext(module, context) {
        var deprecatedContext = Object.create(context);

        var keysForDeprecation = Object.keys(module);

        for (var i = 0, l = keysForDeprecation.length; i < l; i++) {
          this._proxyDeprecation(module, deprecatedContext, keysForDeprecation[i]);
        }

        return deprecatedContext;
      }

      /*
        Defines a key on an object to act as a proxy for deprecating the original.
      */
    }, {
      key: '_proxyDeprecation',
      value: function _proxyDeprecation(obj, proxy, key) {
        if (typeof proxy[key] === 'undefined') {
          Object.defineProperty(proxy, key, {
            get: function get() {
              _ember['default'].deprecate('Accessing the test module property "' + key + '" from a callback is deprecated.', false, { id: 'ember-test-helpers.test-module.callback-context', until: '0.6.0' });
              return obj[key];
            }
          });
        }
      }
    }, {
      key: '_setupContainer',
      value: function _setupContainer(isolated) {
        var resolver = this.resolver;

        var items = (0, _emberTestHelpersBuildRegistry['default'])(!isolated ? resolver : Object.create(resolver, {
          resolve: {
            value: function value() {}
          }
        }));

        this.container = items.container;
        this.registry = items.registry;

        if ((0, _emberTestHelpersHasEmberVersion['default'])(1, 13)) {
          var thingToRegisterWith = this.registry || this.container;
          var router = resolver.resolve('router:main');
          router = router || _ember['default'].Router.extend();
          thingToRegisterWith.register('router:main', router);
        }
      }
    }, {
      key: '_setupIsolatedContainer',
      value: function _setupIsolatedContainer() {
        var resolver = this.resolver;
        this._setupContainer(true);

        var thingToRegisterWith = this.registry || this.container;

        for (var i = this.needs.length; i > 0; i--) {
          var fullName = this.needs[i - 1];
          var normalizedFullName = resolver.normalize(fullName);
          thingToRegisterWith.register(fullName, resolver.resolve(normalizedFullName));
        }

        if (!this.registry) {
          this.container.resolver = function () {};
        }
      }
    }, {
      key: '_setupIntegratedContainer',
      value: function _setupIntegratedContainer() {
        this._setupContainer();
      }
    }]);

    return _default;
  })(_emberTestHelpersAbstractTestModule['default']);

  exports['default'] = _default;
});
define('ember-test-helpers/test-resolver', ['exports'], function (exports) {
  'use strict';

  exports.setResolver = setResolver;
  exports.getResolver = getResolver;
  var __resolver__;

  function setResolver(resolver) {
    __resolver__ = resolver;
  }

  function getResolver() {
    if (__resolver__ == null) {
      throw new Error('you must set a resolver with `testResolver.set(resolver)`');
    }

    return __resolver__;
  }
});
define('ember-test-helpers/wait', ['exports', 'ember'], function (exports, _ember) {
  /* globals self */

  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports._teardownAJAXHooks = _teardownAJAXHooks;
  exports._setupAJAXHooks = _setupAJAXHooks;
  exports['default'] = wait;

  var jQuery = _ember['default'].$;

  var requests;
  function incrementAjaxPendingRequests(_, xhr) {
    requests.push(xhr);
  }

  function decrementAjaxPendingRequests(_, xhr) {
    for (var i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
      }
    }
  }

  function _teardownAJAXHooks() {
    if (!jQuery) {
      return;
    }

    jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
  }

  function _setupAJAXHooks() {
    requests = [];

    if (!jQuery) {
      return;
    }

    jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
  }

  var _internalCheckWaiters;
  if (_ember['default'].__loader.registry['ember-testing/test/waiters']) {
    _internalCheckWaiters = _ember['default'].__loader.require('ember-testing/test/waiters').checkWaiters;
  }

  function checkWaiters() {
    if (_internalCheckWaiters) {
      return _internalCheckWaiters();
    } else if (_ember['default'].Test.waiters) {
      if (_ember['default'].Test.waiters.any(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var context = _ref2[0];
        var callback = _ref2[1];
        return !callback.call(context);
      })) {
        return true;
      }
    }

    return false;
  }

  function wait(_options) {
    var options = _options || {};
    var waitForTimers = options.hasOwnProperty('waitForTimers') ? options.waitForTimers : true;
    var waitForAJAX = options.hasOwnProperty('waitForAJAX') ? options.waitForAJAX : true;
    var waitForWaiters = options.hasOwnProperty('waitForWaiters') ? options.waitForWaiters : true;

    return new _ember['default'].RSVP.Promise(function (resolve) {
      var watcher = self.setInterval(function () {
        if (waitForTimers && (_ember['default'].run.hasScheduledTimers() || _ember['default'].run.currentRunLoop)) {
          return;
        }

        if (waitForAJAX && requests && requests.length > 0) {
          return;
        }

        if (waitForWaiters && checkWaiters()) {
          return;
        }

        // Stop polling
        self.clearInterval(watcher);

        // Synchronously resolve the promise
        _ember['default'].run(null, resolve);
      }, 10);
    });
  }
});
define("qunit", ["exports"], function (exports) {
  /* globals QUnit */

  "use strict";

  var _module = QUnit.module;
  exports.module = _module;
  var test = QUnit.test;
  exports.test = test;
  var skip = QUnit.skip;
  exports.skip = skip;
  var only = QUnit.only;
  exports.only = only;
  var todo = QUnit.todo;

  exports.todo = todo;
  exports["default"] = QUnit;
});
/* jshint ignore:start */

runningTests = true;

if (window.Testem) {
  window.Testem.hookIntoTestFramework();
}



/* jshint ignore:end */
//# sourceMappingURL=test-support.map
