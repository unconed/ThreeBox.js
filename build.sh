#!/bin/bash
SRC="
src/Common.js
src/World.js
src/ElementResize.js
src/OrbitControls.js
src/Cursor.js
src/Preload.js
"

VENDOR="
vendor/microajax.js
"

cat $VENDOR $SRC > build/ThreeBox.js

curl --data-urlencode "js_code@build/ThreeBox.js" 	\
	-d "output_format=text&output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS" \
	http://closure-compiler.appspot.com/compile	\
	> build/ThreeBox.min.js
