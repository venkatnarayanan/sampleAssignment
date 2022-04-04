define('model-fragments/array/stateful', ['exports', 'ember', 'model-fragments/states'], function (exports, _ember, _modelFragmentsStates) {
  'use strict';

  /**
    @module ember-data-model-fragments
  */

  var get = _ember['default'].get;
  var set = _ember['default'].set;
  var computed = _ember['default'].computed;
  var _copy = _ember['default'].copy;
  var makeArray = _ember['default'].makeArray;

  /**
    A state-aware array that is tied to an attribute of a `DS.Model` instance.
  
    @class StatefulArray
    @namespace MF
    @extends Ember.ArrayProxy
  */
  var StatefulArray = _ember['default'].ArrayProxy.extend(_ember['default'].Copyable, {
    /**
      A reference to the array's owner record.
       @property owner
      @type {DS.Model}
    */
    owner: null,

    /**
      The array's property name on the owner record.
       @property name
      @private
      @type {String}
    */
    name: null,

    init: function init() {
      this._super();
      this._pendingData = undefined;
      set(this, '_originalState', []);
    },

    content: computed(function () {
      return _ember['default'].A();
    }),

    /**
      Copies the array by calling copy on each of its members.
       @method copy
      @return {array} a new array
    */
    copy: function copy() {
      return this.map(_copy);
    },

    /**
      @method setupData
      @private
      @param {Object} data
    */
    setupData: function setupData(data) {
      // Since replacing the contents of the array can trigger changes to fragment
      // array properties, this method can get invoked recursively with the same
      // data, so short circuit here once it's been setup the first time
      if (this._pendingData === data) {
        return;
      }

      this._pendingData = data;

      var processedData = this._normalizeData(makeArray(data));
      var content = get(this, 'content');

      // This data is canonical, so create rollback point
      set(this, '_originalState', processedData);

      // Completely replace the contents with the new data
      content.replace(0, get(content, 'length'), processedData);

      this._pendingData = undefined;
    },

    /**
      @method _normalizeData
      @private
      @param {Object} data
    */
    _normalizeData: function _normalizeData(data) {
      return data;
    },

    /**
      @method _createSnapshot
      @private
    */
    _createSnapshot: function _createSnapshot() {
      // Since elements are not models, a snapshot is simply a mapping of raw values
      return this.toArray();
    },

    /**
      @method _flushChangedAttributes
    */
    _flushChangedAttributes: function _flushChangedAttributes() {},

    /**
      @method _adapterDidCommit
      @private
    */
    _adapterDidCommit: function _adapterDidCommit(data) {
      if (data) {
        this.setupData(data);
      } else {
        // Fragment array has been persisted; use the current state as the original state
        set(this, '_originalState', this.toArray());
      }
    },

    _adapterDidError: function _adapterDidError() /*error*/{
      // No-Op
    },

    /**
      If this property is `true` the contents of the array do not match its
      original state. The array has local changes that have not yet been saved by
      the adapter. This includes additions, removals, and reordering of elements.
       Example
       ```javascript
      array.toArray(); // [ 'Tom', 'Yehuda' ]
      array.get('isDirty'); // false
      array.popObject(); // 'Yehuda'
      array.get('isDirty'); // true
      ```
       @property hasDirtyAttributes
      @type {Boolean}
      @readOnly
    */
    hasDirtyAttributes: computed('[]', '_originalState', function () {
      return _ember['default'].compare(this.toArray(), get(this, '_originalState')) !== 0;
    }),

    /**
      This method reverts local changes of the array's contents to its original
      state.
       Example
       ```javascript
      array.toArray(); // [ 'Tom', 'Yehuda' ]
      array.popObject(); // 'Yehuda'
      array.toArray(); // [ 'Tom' ]
      array.rollbackAttributes();
      array.toArray(); // [ 'Tom', 'Yehuda' ]
      ```
       @method rollbackAttributes
    */
    rollbackAttributes: function rollbackAttributes() {
      this.setObjects(get(this, '_originalState'));
    },

    /**
      Method alias for `toArray`.
       @method serialize
      @return {Array}
    */
    serialize: function serialize() {
      return this.toArray();
    },

    arrayContentDidChange: function arrayContentDidChange() {
      this._super.apply(this, arguments);

      var record = get(this, 'owner');
      var key = get(this, 'name');

      // Any change to the size of the fragment array means a potential state change
      if (get(this, 'hasDirtyAttributes')) {
        (0, _modelFragmentsStates.fragmentDidDirty)(record, key, this);
      } else {
        (0, _modelFragmentsStates.fragmentDidReset)(record, key);
      }
    },

    toStringExtension: function toStringExtension() {
      return 'owner(' + get(this, 'owner.id') + ')';
    }
  });

  exports['default'] = StatefulArray;
});