Note: This project has been abandoned and rewritten into [threestrap](https://github.com/unconed/threestrap), which doesn't use tQuery.
---

ThreeBox.js
==========

![ThreeBox.js](https://raw.github.com/unconed/ThreeBox.js/master/misc/ThreeBox.png)


ThreeBox is a plug-in for tQuery/Three.js which provides an improved boilerplate set up.

It lets you easily embed Three.js scenes as elements in a web page, rather than just as a full-screen render. User-friendly mouse controls are also included.

* * *

Build:
 * ThreeBox.js: tQuery plug-in + dependencies
 * ThreeBox-core.js: tQuery plug-in only

Depends on: tQuery (Jerome Etienne et al.), Three.js (Ricardo Cabello et al.)

Usage
-----

Create a tQuery world and call the threeBox method. You may use a shorthand syntax.
```javascript
var options = { /* .. */ };     // Combined options object

// Fill the entire body.
var world = tQuery.createWorld(options).threeBox(options);

// or shorthand:
var world = threeBox(options);

// Fill a particular DOM element.
var world = tQuery.createWorld(options).threeBox(element, options);

// or shorthand:
var world = threeBox(element, options);
```

All arguments are optional. The following `options` are available for ThreeBox in addition to the normal tQuery world options:

* cameraControls: true,  
  Whether to allow mouse control of the camera.
* controlClass:   ThreeBox.OrbitControls,  
  Override the class to use for mouse controls.
* cursor: true,  
  Whether to show the mouse cursor. When set to false, the cursor auto-hides after a short delay.
* elementResize:  true,  
  Whether to track resizing of the containing element.
* fullscreen:     true,  
  Enable fullscreen mode with 'f'
* scale:          1,  
  Render at scaled resolution, e.g. scale 2 is half the width/height. Fractional values allowed.
* screenshot:     true,
  Enable screenshot taking with 'p'
* stats:          true,
  Show FPS stats in the corner.


* * *

Steven Wittens - http://acko.net/
