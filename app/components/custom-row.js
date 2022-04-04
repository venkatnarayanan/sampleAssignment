import Ember from 'ember';
const {
  isPresent,
  computed,
  set
} = Ember;
export default Ember.Component.extend({
  tagName: 'td',
  classNames: ['td'],
  showHover: computed.or('model.editable', 'model.hint'),
  isDisabled: computed.not('model.editable'),
  isEditing: false,
  actions: {
    onDoubleClick(model) {
      if(isPresent(model.editable) && model.editable == true) {
        set(this, 'isEditing', true);
      }
    },
    onBlur(model) {
      if(isPresent(model.editable) && model.editable == true) {
        set(this, 'isEditing', false);
      }
    }
  }
});
