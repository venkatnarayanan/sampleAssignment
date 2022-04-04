define('sample-project/components/custom-row', ['exports', 'ember'], function (exports, _ember) {
  var isPresent = _ember['default'].isPresent;
  var computed = _ember['default'].computed;
  var set = _ember['default'].set;
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'td',
    classNames: ['td'],
    showHover: computed.or('model.editable', 'model.hint'),
    isDisabled: computed.not('model.editable'),
    isEditing: false,
    actions: {
      onDoubleClick: function onDoubleClick(model) {
        if (isPresent(model.editable) && model.editable == true) {
          set(this, 'isEditing', true);
        }
      },
      onBlur: function onBlur(model) {
        if (isPresent(model.editable) && model.editable == true) {
          set(this, 'isEditing', false);
        }
      }
    }
  });
});