ThreeBox.js
==========

![ThreeBox.js](https://raw.github.com/unconed/ThreeBox.js/master/misc/ThreeBox.png)


ThreeBox is a plug-in for tQuery/Three.js which provides an improved boilerplate set up.

It lets you easily embed Three.js scenes as elements in a web page, rather than just as a full-screen render. User-friendly mouse controls are also included.

* * *

Build:
 * ThreeBox.js: tQuery plug-in

Depends on: tQuery (Jerome Etienne et al.), Three.js (Ricardo Cabello et al.)

Usage
-----

Create a tQuery world and call the threeBox method. You may use a shorthand syntax.
```
var worldOptions = { /*...*/ }; // tQuery World options
var boxOptions = { /*...*/ };   // ThreeBox options (see below)

// Fill the entire body.
var world = tQuery.createWorld(worldOptions).threeBox(boxOptions);

// or shorthand:
var world = threeBox(worldOptions, boxOptions);

// Fill a particular DOM element.
var world = tQuery.createWorld(worldOptions).threeBox(element, boxOptions);

// or shorthand:
var world = threeBox(element, worldOptions, boxOptions);
```

All arguments are optional. The following `boxOptions` are available:

* cameraControls: true
  Whether to allow mouse control of the camera.
* cursor: true
  Whether to show the mouse cursor when hovering over the scene. Set to false to auto-hide.
* elementResize:  true,
  Whether to track resizing of the containing element.
* controlClass:   ThreeBox.OrbitControls
  Override the class to use for mouse controls.
* fullscreen:     true,
  Enable fullscreen mode with 'f'
* scaleFactor: 1
  Render at smaller resolutions than native and scale up. e.g. 2 = half width/height.
* screenshot:     true,
  Enable screenshot taking with 'p'
* stats:          true,
  Show FPS stats in the corner.
});

* * *

Steven Wittens - http://acko.net/
