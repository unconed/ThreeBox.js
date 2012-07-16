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

    // Notify of change.
    this.emit('resize', width, height);
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

ThreeBox.MicroeventMixin(ThreeBox.ElementResize);