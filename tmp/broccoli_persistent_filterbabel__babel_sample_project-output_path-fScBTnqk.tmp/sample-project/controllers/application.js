define('sample-project/controllers/application', ['exports', 'ember'], function (exports, _ember) {
  var Controller = _ember['default'].Controller;
  exports['default'] = Controller.extend({
    init: function init() {
      this._super.apply(this, arguments);
    }
  });
});