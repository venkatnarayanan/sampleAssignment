define('sample-project/components/custom-table', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'table',
    classNames: ['table']
  });
});