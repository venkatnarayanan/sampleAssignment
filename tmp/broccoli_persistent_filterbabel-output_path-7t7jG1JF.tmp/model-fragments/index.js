define('model-fragments/index', ['exports', 'ember', 'model-fragments/version', 'model-fragments/fragment', 'model-fragments/array/fragment', 'model-fragments/transforms/fragment', 'model-fragments/transforms/fragment-array', 'model-fragments/transforms/array', 'model-fragments/attributes'], function (exports, _ember, _modelFragmentsVersion, _modelFragmentsFragment, _modelFragmentsArrayFragment, _modelFragmentsTransformsFragment, _modelFragmentsTransformsFragmentArray, _modelFragmentsTransformsArray, _modelFragmentsAttributes) {
  'use strict';

  /**
    Ember Data Model Fragments
  
    @module ember-data-model-fragments
    @main ember-data-model-fragments
  */
  var MF = _ember['default'].Namespace.create({
    VERSION: _modelFragmentsVersion['default'],
    Fragment: _modelFragmentsFragment['default'],
    FragmentArray: _modelFragmentsArrayFragment['default'],
    FragmentTransform: _modelFragmentsTransformsFragment['default'],
    FragmentArrayTransform: _modelFragmentsTransformsFragmentArray['default'],
    ArrayTransform: _modelFragmentsTransformsArray['default'],
    fragment: _modelFragmentsAttributes.fragment,
    fragmentArray: _modelFragmentsAttributes.fragmentArray,
    array: _modelFragmentsAttributes.array,
    fragmentOwner: _modelFragmentsAttributes.fragmentOwner
  });

  if (_ember['default'].libraries) {
    _ember['default'].libraries.register('Model Fragments', MF.VERSION);
  }

  exports['default'] = MF;
});