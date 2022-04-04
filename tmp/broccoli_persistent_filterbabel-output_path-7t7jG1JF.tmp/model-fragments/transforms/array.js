define('model-fragments/transforms/array', ['exports', 'ember', 'ember-data/transform', 'model-fragments/util/map'], function (exports, _ember, _emberDataTransform, _modelFragmentsUtilMap) {
  'use strict';

  /**
    @module ember-data-model-fragments
  */

  var get = _ember['default'].get;
  var makeArray = _ember['default'].makeArray;
  var computed = _ember['default'].computed;
  var getOwner = _ember['default'].getOwner;

  /**
    Transform for `MF.array` that transforms array data with the given transform
    type.
  
    @class ArrayTransform
    @namespace MF
    @extends DS.Transform
  */
  var ArrayTransform = _emberDataTransform['default'].extend({
    store: null,
    type: null,

    deserialize: function deserializeArray(data) {
      if (data == null) {
        return null;
      }

      var transform = get(this, 'transform');

      data = makeArray(data);

      if (!transform) {
        return data;
      }

      return (0, _modelFragmentsUtilMap['default'])(data, transform.deserialize, transform);
    },

    serialize: function serializeArray(array) {
      if (array == null) {
        return null;
      }

      var transform = get(this, 'transform');

      array = array.toArray ? array.toArray() : array;

      if (!transform) {
        return array;
      }

      return (0, _modelFragmentsUtilMap['default'])(array, transform.serialize, transform);
    },

    transform: computed('type', function () {
      var attributeType = this.get('type');

      if (!attributeType) {
        return null;
      }

      var transform = getOwner(this).lookup('transform:' + attributeType);
      _ember['default'].assert("Unable to find transform for '" + attributeType + "'", !!transform);

      return transform;
    })
  });

  exports['default'] = ArrayTransform;
});