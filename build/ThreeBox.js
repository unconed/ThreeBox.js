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
/**
 * World.threeBox() – Create a renderer inside a DOM element.
 *
 * Based on tQuery boilerplate.
 */
tQuery.World.register('threeBox', function (element, options) {

  // Shorthand, options only.
  if (element && !(element instanceof Node)) {
    options = element;
    element = null;
  }

  // Use body by default
  element = element || document.body;

  // Place renderer in element.
  var domElement  = element;

  if (element == document.body) {
    // Remove margins/padding on body.
    domElement.style.margin   = 0;
    domElement.style.padding  = 0;
    domElement.style.overflow = 'hidden';
  }
  else {
    // Ensure container acts as a reference frame for children.
    var style = getComputedStyle(element);
    if (element.position == 'static') {
      element.position = 'relative';
    }
  }

  // Insert into DOM.
  this.appendTo(domElement);

  // Set up ThreeBox
  this.addThreeBox(element, options || {});

  // Chained API
  return this;
});

/**
 * World.addThreeBox – Set up threebox.
 */
tQuery.World.register('addThreeBox', function (element, options) {
  var that  = this;

  // Sanity check
  console.assert(this.hasThreeBox() !== true);

  // Handle parameters  
  options  = tQuery.extend(options, {
    cameraControls: true,
    cursor:         true,
    controlClass:   ThreeBox.OrbitControls,
    elementResize:  true,
    fullscreen:     true,
    scaleFactor:    1,
    screenshot:     true,
    stats:          true//,
  });

  // Make tRenderer.domElement style "display: block" - by default it is inline-block
  // - so it is affected by line-height and create a white line at the bottom
  this.tRenderer().domElement.style.display = "block"

  // Create the context
  var ctx  = {};
  tQuery.data(this, '_threeBoxContext', ctx);

  // Get some variables
  var tCamera  = this.tCamera();
  var tRenderer  = this.tRenderer();

  // Add Stats.js.
  if (options.stats) {
    ctx.stats  = new Stats();
    ctx.stats.domElement.style.position = 'absolute';
    ctx.stats.domElement.style.left     = '10px';
    ctx.stats.domElement.style.top      = '10px';
    element && element.appendChild(ctx.stats.domElement);
    ctx.loopStats  = function () {
      ctx.stats.update();
    };
    this.loop().hook(ctx.loopStats);
  }

  // Create camera controls.
  if (options.cameraControls) {
    var loop = this.loop(), render = this.render.bind(this);

    ctx.cameraControls = ThreeBox.OrbitControls
      .bind(tCamera, element, options)
      .on('change', function () {
        // If not looping, ensure view is updated on interaction.
        if (!loop._timerId) {
          render();
        }
      });
    this.setCameraControls(ctx.cameraControls);
  }

  // Track element / window resizes.
  if (options.elementResize) {
    ctx.elementResize = ThreeBox.ElementResize.bind(tRenderer, tCamera, element, options.scaleFactor);
  }

  // Contextual mouse cursor
  if (options.cursor !== null) {
    ctx.cursor = ThreeBox.Cursor.bind(element, options);
  }

  // Allow 'p' to make screenshot.
  if (options.screenshot) {
    ctx.screenshot = THREEx.Screenshot.bindKey(tRenderer);
  }

  // Allow 'f' to go fullscreen where this feature is supported.
  if (options.fullscreen && THREEx.FullScreen.available()) {
    ctx.fullscreen  = THREEx.FullScreen.bindKey();
  }

  // Bind 'destroy' event on tQuery.world.
  ctx._$onDestroy  = this.bind('destroy', function(){
    if( this.hasThreeBox() === false )  return;
    this.removeThreeBox();
  });

  // Chained API
  return this;
});

tQuery.World.register('hasThreeBox', function(){
  // get the context
  var ctx  = tQuery.data(this, "_threeBoxContext")
  // return true if ctx if defined, false otherwise
  return ctx === undefined ? false : true;
});

tQuery.World.register('removeThreeBox', function(){
  // get context
  var ctx  = tQuery.data(this, '_threeBoxContext');
  // if not present, return now
  if( ctx === undefined )  return  this;
  // remove the context from this
  tQuery.removeData(this, '_threeBoxContext');

  // unbind 'destroy' for tQuery.World
  this.unbind('destroy', this._$onDestroy);

  // remove stats.js
  if (ctx.stats) {
    document.body.removeChild(ctx.stats.domElement);
    this.loop().unhook(ctx.loopStats);
  }

  // Remove camera controls.
  ctx.cameraControls && this.removeCameraControls()
                     && ctx.cameraControls.stop();

  // Stop elementResize.
  ctx.elementResize  && ctx.elementResize.unbind();

  // Stop cursor tracking.
  ctx.cursor         && ctx.cursor.unbind();

  // Unbind screenshot
  ctx.screenshot     && ctx.screenshot.unbind();

  // Unbind fullscreen
  ctx.fullscreen     && ctx.fullscreen.unbind();
});
/**
 * Update renderer and camera when the element is resized
 * 
 * @param {Object} renderer The renderer to update
 * @param {Object} camera The camera to update
 * @param {Object} element The DOM element to size to
 * @param {Number} scaleFactor Scaling factor for the rendering buffer
 *                             (2 = half width/height, 4 = quarter width/height).
 *
 * Based on THREEx.WindowResize.
 */
ThreeBox.ElementResize  = function (renderer, camera, domElement, scaleFactor) {
  scaleFactor = scaleFactor || 1;

  var callback  = function () {
    var width = domElement.offsetWidth,
        height = domElement.offsetHeight,
        widthS = Math.floor(width / scaleFactor),
        heightS = Math.floor(height / scaleFactor);

    // Size renderer appropriately.
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.width = width + "px";
    renderer.domElement.style.height = height + "px";

    // Notify the renderer of the size change.
    renderer.setSize(widthS, heightS);

    // Update the camera aspect
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // Bind the resize event on the window and element.
  window.addEventListener('resize', callback, false);
  domElement.addEventListener('resize', callback, false);

  // Update size immediately.
  callback();

  // Return .unbind() the function to stop watching window resize.
  return {
    /**
     * Stop watching window resize
     */
    unbind: function () {
      window.removeEventListener('resize', callback);
      domElement.removeEventListener('resize', callback);
    }
  };
}

ThreeBox.ElementResize.bind  = function (renderer, camera, element) {
  return ThreeBox.ElementResize(renderer, camera, element);
}
/**
 * Click-and-drag mouse controls with Euler angles, yaw and pitch.
 */
ThreeBox.OrbitControls = function (camera, domElement, options) {
  this.element = domElement;
  this.camera = camera;

  this.options = tQuery.extend(options, {
    phi: τ/4,
    theta: 0,
    orbit: 2,
    lookAt: [0, 0, 0],
    speed: 2//,
  });

  this.init();
  this.start();
  this.update();
};

ThreeBox.OrbitControls.prototype = {

  init: function () {
    this.width = this.element.offsetWidth,
    this.height = this.element.offsetHeight;
    this.phi = this.options.phi;
    this.theta = this.options.theta;
    this.orbit = this.options.orbit;
    this.speed = this.options.speed;

    this.lookAt = new THREE.Vector3();
    this.lookAt.set.apply(this.lookAt, this.options.lookAt || []);
  },

  start: function () {
    var that = this;

    this._mouseDown = (function (event) {
      this.drag = true;
      this.lastHover = this.origin = { x: event.pageX, y: event.pageY };

      event.preventDefault();
    }).bind(this);

    this._mouseUp = (function () {
      this.drag = false;
    }).bind(this);

    this._mouseMove = (function () {
      if (that.drag) {
        var relative = { x: event.pageX - that.origin.x, y: event.pageY - that.origin.y },
            delta = { x: event.pageX - that.lastHover.x, y: event.pageY - that.lastHover.y };
        that.lastHover = { x: event.pageX, y: event.pageY };
        that.moved(that.origin, relative, delta);
      }
    }).bind(this);

    this.element.addEventListener('mousedown', this._mouseDown, false);
    document.addEventListener('mouseup', this._mouseUp, false);
    document.addEventListener('mousemove', this._mouseMove, false);
  },

  stop: function () {
    this.element.removeEventListener('mousedown', this._mouseDown);
    document.removeEventListener('mouseup', this._mouseUp);
    document.removeEventListener('mousemove', this._mouseMove);
  },

  moved: function (origin, relative, delta) {
    this.phi = this.phi + delta.x * this.speed / this.width;
    this.theta = Math.min(π/2, Math.max(-π/2, this.theta + delta.y * this.speed / this.height));

    this.emit('change');
  },

  update: function () {
    this.camera.position.x = Math.cos(this.phi) * Math.cos(this.theta) * this.orbit;
    this.camera.position.y = Math.sin(this.theta) * this.orbit;
    this.camera.position.z = Math.sin(this.phi) * Math.cos(this.theta) * this.orbit;

    this.camera.position.addSelf(this.lookAt);
    this.camera.lookAt(this.lookAt);
  }//,

};

ThreeBox.MicroeventMixin(ThreeBox.OrbitControls);

ThreeBox.OrbitControls.bind  = function (camera, domElement, options) {
  return new ThreeBox.OrbitControls(camera, domElement, options);
}
/**
 * Set cursor shape and auto-hide with timer.
 * 
 * @param {Object} element DOM element to track mouse movement on.
 * @param {Object} options Options for ThreeBox.
 */
ThreeBox.Cursor = function (element, options) {
  // Use move cursor if controls are active.
  var cursor = options.cameraControls ? 'move' : 'default';

  // Timer state
  var timer = null, ignore = false, delay = 2000;

  // Cursor auto-hiding
  function moved() {
    ignore || show();
    clearTimeout(timer);
    ignore = false;

    timer = setTimeout(function () {
      ignore = true;
      hide();
    }, delay);
  }

  function show() { element.style.cursor = cursor; }
  function hide() { element.style.cursor = 'none'; }

  // Update cursor on mouse move
  if (!options.cursor) {
    element.addEventListener('mousemove', moved);
    hide();
  }
  else {
    show();
  }

  // Return .unbind() the function to stop watching window resize.
  return {
    /**
     * Stop watching window resize
     */
    unbind: function () {
      element.removeEventListener('mousemove', moved);
    }
  };
}

ThreeBox.Cursor.bind  = function (element, options) {
  return ThreeBox.Cursor(element, options);
}
