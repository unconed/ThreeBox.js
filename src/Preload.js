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
        'mp3': l.audio,
      };
  _.each(exts, function (handler, ext) {
    regexps[ext] = new RegExp('\\.' + ext + '$');
  });

  // Load individual file
  _.each(files, function (file) {
    // Use appropriate handler based on extension
    _.each(exts, function (handler, ext) {
      if (file.match(regexps[ext])) {
        var path = file.split(/\//g);
        var name = path.pop().replace(/\.[A-Za-z0-9]+$/, '');

        handler(file, name, ping);
      }
    });
  });
};

ThreeBox.preload.html = function (file, name, callback) {
  new microAjax(file, function (res) {
    var match;

    // Insert javascript directly
    while (match = res.match(/^(<script\s*>|<script[^>]*type=['"]text\/javascript['"][^>]*>)([\s\S]+?)<\/script>$/m)) {
      try {
        /*
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = match[2];
        document.body.appendChild(script);
        */
        eval('(function () {' + match[2] + '})()');
      }
      catch (e) {
        console.error(e);
        console.error('While evaluating: ' + match[2]);
      }

      res = res.replace(match[0], '');
    }

    // Insert HTML via div
    if (res.replace(/\s*/g) != '') {
      var div = document.createElement('div');
      div.innerHTML = res;
      document.body.appendChild(div);
    }

    console.log('Loaded HTML ', file);
    callback();
  });
};

ThreeBox.preload.image = function (file, name, callback) {
  THREE.ImageUtils.loadTexture(file, null, function (texture) {
    var ret = {};
    ret[name] = texture;

    console.log('Loaded texture ', file);
    callback(ret);
  });
};

ThreeBox.preload.audio = function (file, name, callback) {
  // Load binary file via AJAX
  var request = new XMLHttpRequest();
  request.open("GET", file, true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    var ret = {};
    ret[name] = request.response;

    console.log('Loaded audio ', file);
    callback(ret);
  };

  request.send();
}
