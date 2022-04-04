define('model-fragments/ext', ['exports', 'ember', 'ember-data/store', 'ember-data/model', 'ember-data/-private/system/model/internal-model', 'ember-data/serializers/json', 'model-fragments/states', 'model-fragments/fragment', 'model-fragments/array/fragment'], function (exports, _ember, _emberDataStore, _emberDataModel, _emberDataPrivateSystemModelInternalModel, _emberDataSerializersJson, _modelFragmentsStates, _modelFragmentsFragment, _modelFragmentsArrayFragment) {
  'use strict';

  /**
    @module ember-data-model-fragments
  */

  var keys = Object.keys || _ember['default'].keys;
  var create = Object.create || _ember['default'].create;
  var getOwner = _ember['default'].getOwner;

  /**
    @class Store
    @namespace DS
  */
  _emberDataStore['default'].reopen({
    /**
      Create a new fragment that does not yet have an owner record.
      The properties passed to this method are set on the newly created
      fragment.
       To create a new instance of the `name` fragment:
       ```js
      store.createFragment('name', {
        first: "Alex",
        last: "Routé"
      });
      ```
       @method createRecord
      @param {String} type
      @param {Object} properties a hash of properties to set on the
        newly created fragment.
      @return {MF.Fragment} fragment
    */
    createFragment: function createFragment(modelName, props) {
      var type = this.modelFor(modelName);

      _ember['default'].assert("The '" + type + "' model must be a subclass of MF.Fragment", _modelFragmentsFragment['default'].detect(type));

      var internalModel = new _emberDataPrivateSystemModelInternalModel['default'](type, null, this, getOwner(this).container);

      // Re-wire the internal model to use the fragment state machine
      internalModel.currentState = _modelFragmentsStates['default'].empty;

      internalModel._name = null;
      internalModel._owner = null;

      internalModel.loadedData();

      var fragment = internalModel.getRecord();

      if (props) {
        fragment.setProperties(props);
      }

      // Add brand to reduce usages of `instanceof`
      fragment._isFragment = true;

      return fragment;
    },

    /**
      Changes serializer fallbacks for fragments to use `serializer:-fragment`
      if registered, then uses the default serializer.
       @method serializerFor
      @private
      @param {String} modelName the record to serialize
      @return {DS.Serializer}
    */
    serializerFor: function serializerFor(modelOrClass) {
      var modelName;

      if (typeof modelOrClass === 'string') {
        modelName = modelOrClass;
      } else {
        modelName = modelOrClass.modelName;
      }

      // Don't fail on non-model lookups ('application', '-default', etc.)
      var type = this.modelFactoryFor(modelName);

      // For fragments, don't use the application serializer or adapter default
      // as a fallbacks
      if (type && _modelFragmentsFragment['default'].detect(type)) {
        var fallbacks = ['-fragment', '-default'];

        return this.lookupSerializer(modelName, fallbacks);
      }

      return this._super(modelOrClass);
    }
  });

  /**
    @class Model
    @namespace DS
    */
  _emberDataModel['default'].reopen({
    /**
      Returns an object, whose keys are changed properties, and value is
      an [oldProp, newProp] array. When the model has fragments that have
      changed, the property value is simply `true`.
       Example
       ```javascript
      App.Mascot = DS.Model.extend({
        type: DS.attr('string'),
        name: MF.fragment('name')
      });
       App.Name = DS.Model.extend({
        first : DS.attr('string'),
        last  : DS.attr('string')
      });
       var person = store.createRecord('person');
      person.changedAttributes(); // {}
      person.get('name').set('first', 'Tomster');
      person.set('type', 'Hamster');
      person.changedAttributes(); // { name: true, type: [undefined, 'Hamster'] }
      ```
       @method changedAttributes
      @return {Object} an object, whose keys are changed properties,
        and value is an [oldProp, newProp] array.
    */
    changedAttributes: function changedAttributes() {
      var diffData = this._super();
      var internalModel = (0, _modelFragmentsFragment.internalModelFor)(this);

      keys(internalModel._fragments).forEach(function (name) {
        // An actual diff of the fragment or fragment array is outside the scope
        // of this method, so just indicate that there is a change instead
        if (name in internalModel._attributes) {
          diffData[name] = true;
        }
      }, this);

      return diffData;
    },

    willDestroy: function willDestroy() {
      this._super.apply(this, arguments);

      var internalModel = (0, _modelFragmentsFragment.internalModelFor)(this);
      var key, fragment;

      // destroy the current state
      for (key in internalModel._fragments) {
        if (fragment = internalModel._fragments[key]) {
          fragment.destroy();
        }
      }

      // destroy the original state
      for (key in internalModel._data) {
        if (fragment = internalModel._data[key]) {
          if (fragment instanceof _modelFragmentsFragment['default'] || fragment instanceof _modelFragmentsArrayFragment['default']) {
            fragment.destroy();
          }
        }
      }
    }
  });

  // Replace a method on an object with a new one that calls the original and then
  // invokes a function with the result
  function decorateMethod(obj, name, fn) {
    var originalFn = obj[name];

    obj[name] = function () {
      var value = originalFn.apply(this, arguments);

      return fn.call(this, value, arguments);
    };
  }

  var InternalModelPrototype = _emberDataPrivateSystemModelInternalModel['default'].prototype;

  /**
    Override parent method to snapshot fragment attributes before they are
    passed to the `DS.Model#serialize`.
  
    @method _createSnapshot
    @private
  */
  decorateMethod(InternalModelPrototype, 'createSnapshot', function createFragmentSnapshot(snapshot) {
    var attrs = snapshot._attributes;

    keys(attrs).forEach(function (key) {
      var attr = attrs[key];

      // If the attribute has a `_createSnapshot` method, invoke it before the
      // snapshot gets passed to the serializer
      if (attr && typeof attr._createSnapshot === 'function') {
        attrs[key] = attr._createSnapshot();
      }
    });

    return snapshot;
  });

  /**
    If the model `hasDirtyAttributes` this function will discard any unsaved
    changes, recursively doing the same for all fragment properties.
  
    Example
  
    ```javascript
    record.get('name'); // 'Untitled Document'
    record.set('name', 'Doc 1');
    record.get('name'); // 'Doc 1'
    record.rollbackAttributes();
    record.get('name'); // 'Untitled Document'
    ```
  
    @method rollbackAttributes
  */
  decorateMethod(InternalModelPrototype, 'rollbackAttributes', function rollbackFragments() {
    for (var key in this._fragments) {
      if (this._fragments[key]) {
        this._fragments[key].rollbackAttributes();
      }
    }
  });

  /**
    Before saving a record, its attributes must be moved to in-flight, which must
    happen for all fragments as well
  
    @method flushChangedAttributes
  */
  decorateMethod(InternalModelPrototype, 'flushChangedAttributes', function flushChangedAttributesFragments() {
    var fragment;

    // Notify fragments that the record was committed
    for (var key in this._fragments) {
      if (fragment = this._fragments[key]) {
        fragment._flushChangedAttributes();
      }
    }
  });

  /**
    If the adapter did not return a hash in response to a commit,
    merge the changed attributes and relationships into the existing
    saved data and notify all fragments of the commit.
  
    @method adapterDidCommit
  */
  decorateMethod(InternalModelPrototype, 'adapterDidCommit', function adapterDidCommitFragments(returnValue, args) {
    var attributes = args[0] && args[0].attributes || create(null);
    var fragment;

    // Notify fragments that the record was committed
    for (var key in this._fragments) {
      if (fragment = this._fragments[key]) {
        fragment._adapterDidCommit(attributes[key]);
      }
    }
  });

  decorateMethod(InternalModelPrototype, 'adapterDidError', function adapterDidErrorFragments(returnValue, args) {
    var error = args[0] || create(null);
    var fragment;

    // Notify fragments that the record was committed
    for (var key in this._fragments) {
      if (fragment = this._fragments[key]) {
        fragment._adapterDidError(error);
      }
    }
  });

  /**
    @class JSONSerializer
    @namespace DS
  */
  _emberDataSerializersJson['default'].reopen({
    /**
      Enables fragment properties to have custom transforms based on the fragment
      type, so that deserialization does not have to happen on the fly
       @method transformFor
      @private
    */
    transformFor: function transformFor(attributeType) {
      if (attributeType.indexOf('-mf-') === 0) {
        return getFragmentTransform(getOwner(this), this.store, attributeType);
      }

      return this._super.apply(this, arguments);
    }
  });

  // Retrieve or create a transform for the specific fragment type
  function getFragmentTransform(owner, store, attributeType) {
    var containerKey = 'transform:' + attributeType;
    var match = attributeType.match(/^-mf-(fragment|fragment-array|array)(?:\$([^$]+))?(?:\$(.+))?$/);
    var transformName = match[1];
    var transformType = match[2];
    var polymorphicTypeProp = match[3];

    if (!owner.hasRegistration(containerKey)) {
      var transformClass = owner._lookupFactory('transform:' + transformName);

      owner.register(containerKey, transformClass.extend({
        store: store,
        type: transformType,
        polymorphicTypeProp: polymorphicTypeProp
      }));
    }

    return owner.lookup(containerKey);
  }

  exports.Store = _emberDataStore['default'];
  exports.Model = _emberDataModel['default'];
  exports.JSONSerializer = _emberDataSerializersJson['default'];
});