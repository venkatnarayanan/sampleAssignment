define('model-fragments/transforms/fragment', ['exports', 'ember', 'ember-data/transform', 'ember-data/serializers/json-api'], function (exports, _ember, _emberDataTransform, _emberDataSerializersJsonApi) {
  'use strict';

  /**
    @module ember-data-model-fragments
  */

  var get = _ember['default'].get;

  /**
    Transform for `MF.fragment` fragment attribute which delegates work to
    the fragment type's serializer
  
    @class FragmentTransform
    @namespace MF
    @extends DS.Transform
  */
  var FragmentTransform = _emberDataTransform['default'].extend({
    store: null,
    type: null,
    polymorphicTypeProp: null,

    deserialize: function deserializeFragment(data) {
      if (data == null) {
        return null;
      }

      return this.deserializeSingle(data);
    },

    serialize: function serializeFragment(snapshot) {
      if (!snapshot) {
        return null;
      }

      var store = this.store;
      var serializer = store.serializerFor(snapshot.modelName);

      return serializer.serialize(snapshot);
    },

    modelNameFor: function modelNameFor(data) {
      var modelName = get(this, 'type');
      var polymorphicTypeProp = get(this, 'polymorphicTypeProp');

      if (data && polymorphicTypeProp && data[polymorphicTypeProp]) {
        modelName = data[polymorphicTypeProp];
      }

      return modelName;
    },

    deserializeSingle: function deserializeSingle(data) {
      var store = this.store;
      var modelName = this.modelNameFor(data);
      var serializer = store.serializerFor(modelName);

      _ember['default'].assert("The `JSONAPISerializer` is not suitable for model fragments, please use `JSONSerializer`", !(serializer instanceof _emberDataSerializersJsonApi['default']));

      var typeClass = store.modelFor(modelName);
      var serialized = serializer.normalize(typeClass, data);

      // `JSONSerializer#normalize` returns a full JSON API document, but we only
      // need the attributes hash
      return get(serialized, 'data.attributes');
    }
  });

  exports['default'] = FragmentTransform;
});