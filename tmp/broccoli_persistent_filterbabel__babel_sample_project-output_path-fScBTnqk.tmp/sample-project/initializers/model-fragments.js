define('sample-project/initializers/model-fragments', ['exports', 'model-fragments', 'model-fragments/transforms/fragment', 'model-fragments/transforms/fragment-array', 'model-fragments/transforms/array'], function (exports, _modelFragments, _modelFragmentsTransformsFragment, _modelFragmentsTransformsFragmentArray, _modelFragmentsTransformsArray) {
  exports['default'] = {
    name: "fragmentTransform",
    before: "ember-data",

    initialize: function initialize(application) {
      application.register('transform:fragment', _modelFragmentsTransformsFragment['default']);
      application.register('transform:fragment-array', _modelFragmentsTransformsFragmentArray['default']);
      application.register('transform:array', _modelFragmentsTransformsArray['default']);
    }
  };
});
// Import the full module to ensure monkey-patchs are applied before any store
// instances are created. Sad face for side-effects :(