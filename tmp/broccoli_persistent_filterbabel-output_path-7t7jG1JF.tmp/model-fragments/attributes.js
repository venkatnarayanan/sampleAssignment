define('model-fragments/attributes', ['exports', 'ember', 'model-fragments/array/stateful', 'model-fragments/array/fragment', 'model-fragments/states', 'model-fragments/fragment', 'model-fragments/util/instance-of-type'], function (exports, _ember, _modelFragmentsArrayStateful, _modelFragmentsArrayFragment, _modelFragmentsStates, _modelFragmentsFragment, _modelFragmentsUtilInstanceOfType) {
  'use strict';

  /**
    @module ember-data-model-fragments
  */

  var get = _ember['default'].get;
  var setProperties = _ember['default'].setProperties;
  var isArray = _ember['default'].isArray;
  var typeOf = _ember['default'].typeOf;
  var copy = _ember['default'].copy;
  var computed = _ember['default'].computed;

  // Create a unique type string for the combination of fragment property type,
  // transform type (or fragment model), and polymorphic type key
  function metaTypeFor(name, type, options) {
    var metaType = '-mf-' + name;

    if (type) {
      metaType += '$' + type;
    }

    if (options && options.polymorphic) {
      metaType += '$' + (options.typeKey || 'type');
    }

    return metaType;
  }

  /**
    `MF.fragment` defines an attribute on a `DS.Model` or `MF.Fragment`. Much
    like `DS.belongsTo`, it creates a property that returns a single fragment of
    the given type.
  
    It takes an optional hash as a second parameter, currently supported options
    are:
  
    - `defaultValue`: An object literal or a function to be called to set the
      attribute to a default value if none is supplied. Values are deep copied
      before being used. Note that default values will be passed through the
      fragment's serializer when creating the fragment. Defaults to `null`.
    - `polymorphic`: Whether or not the fragments in the array can be child
      classes of the given type.
    - `typeKey`: If `polymorphic` is true, the property to use as the fragment
      type in the normalized data. Defaults to `type`.
  
    Example
  
    ```javascript
    App.Person = DS.Model.extend({
      name: MF.fragment('name', { defaultValue: {} })
    });
  
    App.Name = MF.Fragment.extend({
      first: DS.attr('string'),
      last: DS.attr('string')
    });
    ```
  
    @namespace MF
    @method fragment
    @param {String} type the fragment type
    @param {Object} options a hash of options
    @return {Attribute}
  */
  function fragment(declaredModelName, options) {
    options = options || {};

    var metaType = metaTypeFor('fragment', declaredModelName, options);

    function setupFragment(store, record, key) {
      var internalModel = (0, _modelFragmentsFragment.internalModelFor)(record);
      var data = getWithDefault(internalModel, key, options, 'object');
      var fragment = internalModel._fragments[key];

      // Regardless of whether being called as a setter or getter, the fragment
      // may not be initialized yet, in which case the data will contain a
      // raw response or a stashed away fragment

      // If we already have a processed fragment in _data and our current fragment is
      // null simply reuse the one from data. We can be in this state after a rollback
      // for example
      if (!fragment && (0, _modelFragmentsFragment.isFragment)(data)) {
        fragment = data;
        // Else initialize the fragment
      } else if (data && data !== fragment) {
          if (fragment) {
            (0, _modelFragmentsFragment.setFragmentData)(fragment, data);
          } else {
            fragment = (0, _modelFragmentsFragment.createFragment)(store, declaredModelName, record, key, options, data);
          }

          internalModel._data[key] = fragment;
        } else {
          // Handle the adapter setting the fragment to null
          fragment = data;
        }

      return fragment;
    }

    function setFragmentValue(record, key, fragment, value) {
      var store = record.store;
      var internalModel = (0, _modelFragmentsFragment.internalModelFor)(record);

      _ember['default'].assert("You can only assign `null`, an object literal or a '" + declaredModelName + "' fragment instance to this property", value === null || typeOf(value) === 'object' || (0, _modelFragmentsUtilInstanceOfType['default'])(store.modelFor(declaredModelName), value));

      if (!value) {
        fragment = null;
      } else if ((0, _modelFragmentsFragment.isFragment)(value)) {
        // A fragment instance was given, so just replace the existing value
        fragment = (0, _modelFragmentsFragment.setFragmentOwner)(value, record, key);
      } else if (!fragment) {
        // A property hash was given but the property was null, so create a new
        // fragment with the data
        fragment = (0, _modelFragmentsFragment.createFragment)(store, declaredModelName, record, key, options, value);
      } else {
        // The fragment already exists and a property hash is given, so just set
        // its values and let the state machine take care of the dirtiness
        setProperties(fragment, value);

        return fragment;
      }

      if (internalModel._data[key] !== fragment) {
        (0, _modelFragmentsStates.fragmentDidDirty)(record, key, fragment);
      } else {
        (0, _modelFragmentsStates.fragmentDidReset)(record, key);
      }

      return fragment;
    }

    return fragmentProperty(metaType, options, setupFragment, setFragmentValue);
  }

  /**
    `MF.fragmentArray` defines an attribute on a `DS.Model` or `MF.Fragment`.
    Much like `DS.hasMany`, it creates a property that returns an array of
    fragments of the given type. The array is aware of its original state and so
    has a `hasDirtyAttributes` property and a `rollback` method.
  
    It takes an optional hash as a second parameter, currently supported options
    are:
  
    - `defaultValue`: An array literal or a function to be called to set the
      attribute to a default value if none is supplied. Values are deep copied
      before being used. Note that default values will be passed through the
      fragment's serializer when creating the fragment. Defaults to an empty
      array.
    - `polymorphic`: Whether or not the fragments in the array can be child
      classes of the given type.
    - `typeKey`: If `polymorphic` is true, the property to use as the fragment
      type in the normalized data. Defaults to `type`.
  
    Example
  
    ```javascript
    App.Person = DS.Model.extend({
      addresses: MF.fragmentArray('address')
    });
  
    App.Address = MF.Fragment.extend({
      street: DS.attr('string'),
      city: DS.attr('string'),
      region: DS.attr('string'),
      country: DS.attr('string')
    });
    ```
  
    @namespace MF
    @method fragmentArray
    @param {String} type the fragment type (optional)
    @param {Object} options a hash of options
    @return {Attribute}
  */
  function fragmentArray(modelName, options) {
    options || (options = {});

    var metaType = metaTypeFor('fragment-array', modelName, options);

    return fragmentArrayProperty(metaType, options, function createFragmentArray(record, key) {
      return _modelFragmentsArrayFragment['default'].create({
        type: modelName,
        options: options,
        name: key,
        owner: record
      });
    });
  }

  /**
    `MF.array` defines an attribute on a `DS.Model` or `MF.Fragment`. It creates a
    property that returns an array of values of the given primitive type. The
    array is aware of its original state and so has a `hasDirtyAttributes`
    property and a `rollback` method.
  
    It takes an optional hash as a second parameter, currently supported options
    are:
  
    - `defaultValue`: An array literal or a function to be called to set the
      attribute to a default value if none is supplied. Values are deep copied
      before being used. Note that default values will be passed through the
      fragment's serializer when creating the fragment.
  
    Example
  
    ```javascript
    App.Person = DS.Model.extend({
      aliases: MF.array('string')
    });
    ```
  
    @namespace MF
    @method array
    @param {String} type the type of value contained in the array
    @param {Object} options a hash of options
    @return {Attribute}
  */
  function array(type, options) {
    if (typeof type === 'object') {
      options = type;
      type = undefined;
    } else {
      options || (options = {});
    }

    var metaType = metaTypeFor('array', type);

    return fragmentArrayProperty(metaType, options, function createStatefulArray(record, key) {
      return _modelFragmentsArrayStateful['default'].create({
        options: options,
        name: key,
        owner: record
      });
    });
  }

  function fragmentProperty(type, options, setupFragment, setFragmentValue) {
    options = options || {};

    var meta = {
      type: type,
      isAttribute: true,
      isFragment: true,
      options: options
    };

    return computed({
      get: function get(key) {
        var internalModel = (0, _modelFragmentsFragment.internalModelFor)(this);
        var fragment = setupFragment(this.store, this, key);

        return internalModel._fragments[key] = fragment;
      },
      set: function set(key, value) {
        var internalModel = (0, _modelFragmentsFragment.internalModelFor)(this);
        var fragment = setupFragment(this.store, this, key);

        fragment = setFragmentValue(this, key, fragment, value);

        return internalModel._fragments[key] = fragment;
      }
    }).meta(meta);
  }

  function fragmentArrayProperty(metaType, options, createArray) {
    function setupFragmentArray(store, record, key) {
      var internalModel = (0, _modelFragmentsFragment.internalModelFor)(record);
      var data = getWithDefault(internalModel, key, options, 'array');
      var fragments = internalModel._fragments[key] || null;

      // If we already have a processed fragment in _data and our current fragment is
      // null simply reuse the one from data. We can be in this state after a rollback
      // for example
      if (data instanceof _modelFragmentsArrayStateful['default'] && !fragments) {
        fragments = data;
        // Create a fragment array and initialize with data
      } else if (data && data !== fragments) {
          fragments || (fragments = createArray(record, key));
          internalModel._data[key] = fragments;
          fragments.setupData(data);
        } else {
          // Handle the adapter setting the fragment array to null
          fragments = data;
        }

      return fragments;
    }

    function setFragmentValue(record, key, fragments, value) {
      var internalModel = (0, _modelFragmentsFragment.internalModelFor)(record);

      if (isArray(value)) {
        fragments || (fragments = createArray(record, key));
        fragments.setObjects(value);
      } else if (value === null) {
        fragments = null;
      } else {
        _ember['default'].assert("A fragment array property can only be assigned an array or null");
      }

      if (internalModel._data[key] !== fragments || get(fragments, 'hasDirtyAttributes')) {
        (0, _modelFragmentsStates.fragmentDidDirty)(record, key, fragments);
      } else {
        (0, _modelFragmentsStates.fragmentDidReset)(record, key);
      }

      return fragments;
    }

    return fragmentProperty(metaType, options, setupFragmentArray, setFragmentValue);
  }

  /**
    `MF.fragmentOwner` defines a read-only attribute on a `MF.Fragment`
    instance. The attribute returns a reference to the fragment's owner
    record.
  
    Example
  
    ```javascript
    App.Person = DS.Model.extend({
      name: MF.fragment('name')
    });
  
    App.Name = MF.Fragment.extend({
      first: DS.attr('string'),
      last: DS.attr('string'),
      person: MF.fragmentOwner()
    });
    ```
  
    @namespace MF
    @method fragmentOwner
    @return {Attribute}
  */
  function fragmentOwner() {
    return computed(function () {
      _ember['default'].assert("Fragment owner properties can only be used on fragments.", (0, _modelFragmentsFragment.isFragment)(this));

      return (0, _modelFragmentsFragment.internalModelFor)(this)._owner;
    }).meta({
      isFragmentOwner: true
    }).readOnly();
  }

  // The default value of a fragment is either an array or an object,
  // which should automatically get deep copied
  function getDefaultValue(record, options, type) {
    var value;

    if (typeof options.defaultValue === 'function') {
      value = options.defaultValue();
    } else if ('defaultValue' in options) {
      value = options.defaultValue;
    } else if (type === 'array') {
      value = [];
    } else {
      return null;
    }

    _ember['default'].assert("The fragment's default value must be an " + type, typeOf(value) == type || value === null);

    // Create a deep copy of the resulting value to avoid shared reference errors
    return copy(value, true);
  }

  // Returns the value of the property or the default propery
  function getWithDefault(internalModel, key, options, type) {
    if (key in internalModel._data) {
      return internalModel._data[key];
    } else {
      return getDefaultValue(internalModel, options, type);
    }
  }

  exports.fragment = fragment;
  exports.fragmentArray = fragmentArray;
  exports.array = array;
  exports.fragmentOwner = fragmentOwner;
});