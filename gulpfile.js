'use strict';

var browserify = require('browserify');
var connect = require('gulp-connect');
var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

var distFolder = './dist';

gulp.task('browserify', function() {
  var sourceMap = 'bundle.map.json';

  return browserify({debug: true})
    .add('./js/main.js')
    .plugin('minifyify', {
      output: path.join(distFolder, sourceMap),
      map: sourceMap
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(distFolder))
    .pipe(connect.reload());
});

gulp.task('less', function() {
  gulp.src('./less/main.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(distFolder))
    .pipe(connect.reload());
});

gulp.task('server', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('watch', ['default', 'server'], function() {
  gulp.watch('./js/**/*.js', ['browserify']);
  gulp.watch('./less/**/*.less', ['less']);
});

gulp.task('default', ['browserify', 'less']);
