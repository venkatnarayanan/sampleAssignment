import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  editable: attr('boolean'),
  label: attr('string'),
  hint: attr('string'),
  value: attr('string'),
  icon: attr('string'),
  row: belongsTo('row', {
    async: false
  }),
});