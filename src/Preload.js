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

  // Load individual file and add to DOM
  _.each(files, function (file) {
    // Load file and insert into DOM.
    new microAjax(file, function (res) {
      var div = document.createElement('div');
      div.innerHTML = res;
      document.body.appendChild(div);

      // Call callback if done.
      if (--remaining == 0) {
        callback();
      };
    });
  });
}