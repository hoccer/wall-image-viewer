'use strict';

var browserify = require('browserify');
var connect = require('gulp-connect');
var gulp = require('gulp');
var less = require('gulp-less');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('browserify', function() {
  return browserify({debug: true})
    .add('./js/main.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('less', function() {
  gulp.src('./less/main.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist'))
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
