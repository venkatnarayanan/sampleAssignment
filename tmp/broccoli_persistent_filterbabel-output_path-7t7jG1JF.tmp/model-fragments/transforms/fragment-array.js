define('model-fragments/transforms/fragment-array', ['exports', 'model-fragments/transforms/fragment', 'model-fragments/util/map'], function (exports, _modelFragmentsTransformsFragment, _modelFragmentsUtilMap) {
  'use strict';

  /**
    @module ember-data-model-fragments
  */

  /**
    Transform for `MF.fragmentArray` fragment attribute which delegates work to
    the fragment type's serializer
  
    @class FragmentArrayTransform
    @namespace MF
    @extends DS.Transform
  */
  var FragmentArrayTransform = _modelFragmentsTransformsFragment['default'].extend({
    deserialize: function deserializeFragmentArray(data) {
      if (data == null) {
        return null;
      }

      return (0, _modelFragmentsUtilMap['default'])(data, function (datum) {
        return this.deserializeSingle(datum);
      }, this);
    },

    serialize: function serializeFragmentArray(snapshots) {
      if (!snapshots) {
        return null;
      }

      var store = this.store;

      return (0, _modelFragmentsUtilMap['default'])(snapshots, function (snapshot) {
        var serializer = store.serializerFor(snapshot.modelName);

        return serializer.serialize(snapshot);
      });
    }
  });

  exports['default'] = FragmentArrayTransform;
});