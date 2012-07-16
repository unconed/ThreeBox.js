/**
 * ThreeBox.js. More flexible tQuery boilerplate.
 */

// Math!
var π = Math.PI,
    τ = π * 2;

// Check dependencies.
(function (deps) {
  for (i in deps) {
    if (!window[i]) throw "Error: ThreeBox requires " + deps[i];
  }
})({
  'THREE': 'Three.js',
  'tQuery': 'tQuery.js (bundle)'//,
});

// Namespace.
window.ThreeBox = {};

// Shortcut static call.
window.threeBox = function (element, worldOptions, boxOptions) {
  // Omit element (use body)
  if (element && !(element instanceof Node)) {
    boxOptions = worldOptions;
    worldOptions = boxOptions;
    element = null;
  }

  return tQuery.createWorld(worldOptions).threeBox(element, boxOptions);
};

// Make microevent methods nicer.
if (tQuery.MicroeventMixin) {
  ThreeBox.MicroeventMixin = function (obj) {
    obj = obj.prototype;
    tQuery.MicroeventMixin(obj);
    obj.on = obj.addEventListener;
    obj.emit = obj.dispatchEvent;
  }
}
