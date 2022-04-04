var classify = Ember.String.classify,
    libraries = Ember.libraries;


export default function initializerFactory(name, version) {
  var registered = false;

  return function () {
    if (!registered && name && version) {
      var appName = classify(name);
      libraries.register(appName, version);
      registered = true;
    }
  };
}