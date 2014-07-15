var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('watch', function() {
  var bundler = watchify('./src/main.js');

  function rebundle () {
    return bundler.bundle()
      // log errors if they happen
      .on('error', function(e) {
        gutil.log('Browserify Error', e);
      })
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('./dist'));
  }

  // bundler.transform('brfs');
  bundler.on('update', rebundle);

  return rebundle();
});
