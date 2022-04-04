define('sample-project/models/row', ['exports', 'ember-data/model', 'ember-data/relationships'], function (exports, _emberDataModel, _emberDataRelationships) {
  exports['default'] = _emberDataModel['default'].extend({
    cells: (0, _emberDataRelationships.hasMany)('cell', {
      async: false
    })
  });
});