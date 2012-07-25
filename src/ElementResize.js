/**
 * Update renderer and camera when the element is resized
 * 
 * @param {Object} renderer The renderer to update
 * @param {Object} camera The camera to update
 * @param {Object} element The DOM element to size to
 *
 * Based on THREEx.WindowResize.
 */
ThreeBox.ElementResize = function (renderer, camera, domElement, scale) {
  this.scale = scale || 1;

  var callback = this.callback = function () {
    var width = Math.floor(domElement.offsetWidth),
        height = Math.floor(domElement.offsetHeight);

    // Size renderer appropriately.
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.width = width + "px";
    renderer.domElement.style.height = height + "px";

    // Scale
    var ws = Math.floor(width/this.scale),
        hs = Math.floor(height/this.scale);

    // Notify the renderer of the size change.
    renderer.setSize(ws, hs);

    // Update the camera aspect
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Notify of change.
    this.emit('resize', ws, hs);
  }.bind(this);

  // Bind the resize event on the window and element.
  window.addEventListener('resize', callback, false);
  domElement.addEventListener('resize', callback, false);

  // Update size immediately.
  setTimeout(callback, 0);
}

ThreeBox.ElementResize.bind  = function (renderer, camera, element, scale) {
  return new ThreeBox.ElementResize(renderer, camera, element, scale);
}

/**
 * Change resize scale.
 */
ThreeBox.ElementResize.prototype.scale = function (scale) {
  this.scale = scale;
}

/**
 * Stop watching window resize
 */
ThreeBox.ElementResize.prototype.unbind = function () {
  window.removeEventListener('resize', callback);
  domElement.removeEventListener('resize', callback);
}

MicroEvent.mixin(ThreeBox.ElementResize);