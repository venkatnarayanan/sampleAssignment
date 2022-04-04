define('sample-project/models/cell', ['exports', 'ember-data/model', 'ember-data/attr', 'ember-data/relationships'], function (exports, _emberDataModel, _emberDataAttr, _emberDataRelationships) {
  exports['default'] = _emberDataModel['default'].extend({
    editable: (0, _emberDataAttr['default'])('boolean'),
    label: (0, _emberDataAttr['default'])('string'),
    hint: (0, _emberDataAttr['default'])('string'),
    value: (0, _emberDataAttr['default'])('string'),
    icon: (0, _emberDataAttr['default'])('string'),
    row: (0, _emberDataRelationships.belongsTo)('row', {
      async: false
    })
  });
});