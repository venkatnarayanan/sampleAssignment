define("ember-cli-app-version/utils/regexp", ["exports"], function (exports) {
  "use strict";

  var versionRegExp = /\d[.]\d[.]\d/;
  exports.versionRegExp = versionRegExp;
  var shaRegExp = /[a-z\d]{8}/;
  exports.shaRegExp = shaRegExp;
});