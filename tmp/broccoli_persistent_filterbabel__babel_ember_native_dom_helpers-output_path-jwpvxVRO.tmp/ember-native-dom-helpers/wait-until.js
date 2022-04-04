

export function waitUntil(callback) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === undefined ? 1000 : _ref$timeout;

  return new Ember.RSVP.Promise(function (resolve, reject) {
    var value = Ember.run(callback);
    if (value) {
      resolve(value);
      return;
    }
    var time = 0;
    var tick = function tick() {
      time += 10;
      var value = Ember.run(callback);
      if (value) {
        resolve(value);
      } else if (time < timeout) {
        setTimeout(tick, 10);
      } else {
        reject('waitUntil timed out');
      }
    };
    setTimeout(tick, 10);
  });
}