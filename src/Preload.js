// Quick'n'dirty loader for additional .html content
ThreeBox.preload = function (files, callback) {
  // Only callback passed.
  if (files instanceof Function) {
    callback = files;
    files = [];
  }

  // Allow single file.
  files = typeof files == 'string' ? [files] : files;

  // Completion counter
  var remaining = files.length;
  var accumulate = {};
  var ping = function (data) {
    // Collect objects
    _.extend(accumulate, data || {});

    // Call callback if done.
    if (--remaining == 0) {
      callback(accumulate);
    };
  }

  // Prepare extensions
  var l = ThreeBox.preload;
  var regexps = {},
      exts = {
        'html': l.html,
        'jpg': l.image,
        'png': l.image,
        'gif': l.image,
      };
  _.each(exts, function (handler, ext) {
    regexps[ext] = new RegExp('\\.' + ext + '$');
  });

  // Load individual file
  _.each(files, function (file) {
    // Use appropriate handler based on extension
    _.each(exts, function (handler, ext) {
      if (file.match(regexps[ext])) {
        handler(file, ping);
      }
    });
  });
};

ThreeBox.preload.html = function (file, callback) {
  new microAjax(file, function (res) {
    var match;

    // Insert javascript directly
    if (match = res.match(/^<script[^>]*type=['"]text\/javascript['"][^>]*>([\s\S]+?)<\/script>$/m)) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = match[1];
      document.body.appendChild(script);
    }
    // Insert HTML via div
    else {
      var div = document.createElement('div');
      div.innerHTML = res;
      document.body.appendChild(div);
    }

    console.log('Loaded HTML ', file);
    callback();
  });
};

ThreeBox.preload.image = function (file, callback) {
  var path = file.split(/\//g);
  var name = path.pop().replace(/\.(jpg|png|gif)$/, '');
  THREE.ImageUtils.loadTexture(file, null, function (texture) {
    var ret = {};
    ret[name] = texture;

    console.log('Loaded texture ', file);
    callback(ret);
  });
};
