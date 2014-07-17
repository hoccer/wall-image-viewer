'use strict';

var browserify = require('browserify');
var connect = require('gulp-connect');
var gulp = require('gulp');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

gulp.task('browserify', function() {
  return browserify('./src/main.js')
    .transform(reactify)
    .bundle({ debug: true })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('server', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('watch', ['server'], function() {
  gulp.watch('./src/**/*.js', ['browserify']);
});

gulp.task('default', ['browserify']);
