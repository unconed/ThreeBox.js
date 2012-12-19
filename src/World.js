/**
 * World.threeBox() – Create a renderer inside a DOM element.
 *
 * Based on tQuery boilerplate.
 */
tQuery.World.registerInstance('threeBox', function (element, options) {

  // Shorthand, omit element.
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
tQuery.World.registerInstance('addThreeBox', function (element, options) {
  // Sanity check
  console.assert(this.hasThreeBox() !== true);

  // Handle parameters  
  options  = tQuery.extend(options, {
    cameraControls: false,
    cursor:         true,
    controlClass:   ThreeBox.OrbitControls,
    elementResize:  true,
    fullscreen:     true,
    screenshot:     true,
    stats:          true,
    scale:          1//,
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

    ctx.cameraControls = new options.controlClass(tCamera, element, options);
    if (ctx.cameraControls.on) {
      ctx.cameraControls.on('change', function () {
        // If not looping, ensure view is updated on interaction.
        if (!loop._timerId) {
          render();
        }
      });
    }
    this.setCameraControls(ctx.cameraControls);
  }

  // Track element / window resizes.
  if (options.elementResize) {
    ctx.elementResize = ThreeBox.ElementResize.bind(tRenderer, tCamera, element, options)
                        .on('resize', function (width, height) {
                          // Update tQuery world dimensions.
                          this._opts.renderW = width;
                          this._opts.renderH = height;

                          // Forward resize events to world.
                          this.emit('resize', width, height);
                        }.bind(this));
  }

  // Contextual mouse cursor
  if (options.cursor !== null) {
    ctx.cursor = ThreeBox.Cursor.bind(element, options);
  }

  // Allow 'p' to make screenshot.
  if (THREEx && THREEx.Screenshot && options.screenshot) {
    ctx.screenshot = THREEx.Screenshot.bindKey(tRenderer);
  }

  // Allow 'f' to go fullscreen where this feature is supported.
  if (THREEx && THREEx.FullScreen && options.fullscreen && THREEx.FullScreen.available()) {
    ctx.fullscreen = THREEx.FullScreen.bindKey();
  }

  // Bind 'destroy' event on tQuery.world.
  ctx._$onDestroy = this.bind('destroy', function () {
    if (this.hasThreeBox() === false) return;
    this.removeThreeBox();
  });

  // Chained API
  return this;
});

tQuery.World.registerInstance('hasThreeBox', function () {
  // Get threeBox context.
  var ctx  = tQuery.data(this, "_threeBoxContext")
  return ctx === undefined ? false : true;
});

tQuery.World.registerInstance('removeThreeBox', function () {
  // Get threeBox context.
  var ctx  = tQuery.data(this, '_threeBoxContext');
  if (ctx === undefined) return this;

  // Remove the context from the world.
  tQuery.removeData(this, '_threeBoxContext');

  // Unbind 'destroy' for tQuery.World
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
