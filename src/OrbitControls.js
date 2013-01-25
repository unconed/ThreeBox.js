/**
 * Click-and-drag mouse controls with Euler angles, yaw and pitch.
 */
ThreeBox.OrbitControls = function (camera, domElement, options) {
  this.element = domElement;
  this.camera = camera;

  this.options = tQuery.extend(options, {
    phi: τ/4,
    theta: 0.3,
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
    this.width = this.element && this.element.offsetWidth,
    this.height = this.element && this.element.offsetHeight;
    this.phi = this.options.phi;
    this.theta = this.options.theta;
    this.orbit = this.options.orbit;
    this.speed = this.options.speed;

    this.lookAt = new THREE.Vector3();
    this.lookAt.set.apply(this.lookAt, this.options.lookAt || []);
  },

  start: function () {
    var that = this;

    this._mouseDown = function (event) {
      that.width = that.element && that.element.offsetWidth,
      that.height = that.element && that.element.offsetHeight;

      that.drag = true;
      that.lastHover = that.origin = { x: event.pageX, y: event.pageY };

      event.preventDefault();
    };

    this._mouseUp = function () {
      that.drag = false;
    };

    this._mouseMove = function (event) {
      if (that.drag) {
        var relative = { x: event.pageX - that.origin.x, y: event.pageY - that.origin.y },
            delta = { x: event.pageX - that.lastHover.x, y: event.pageY - that.lastHover.y };
        that.lastHover = { x: event.pageX, y: event.pageY };
        that.moved(that.origin, relative, delta);
      }
    };

    if (this.element) {
      this.element.addEventListener('mousedown', this._mouseDown, false);
      document.addEventListener('mouseup', this._mouseUp, false);
      document.addEventListener('mousemove', this._mouseMove, false);
    }
  },

  stop: function () {
    if (this.element) {
      this.element.removeEventListener('mousedown', this._mouseDown);
      document.removeEventListener('mouseup', this._mouseUp);
      document.removeEventListener('mousemove', this._mouseMove);
    }
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

ThreeBox.OrbitControls.bind  = function (camera, domElement, options) {
  return new ThreeBox.OrbitControls(camera, domElement, options);
}

MicroEvent.mixin(ThreeBox.OrbitControls);
