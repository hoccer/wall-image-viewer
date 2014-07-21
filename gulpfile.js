'use strict';

var browserify = require('browserify');
var connect = require('gulp-connect');
var fs = require('fs');
var gulp = require('gulp');
var less = require('gulp-less');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

var argv = require('yargs')
  .default('environment', 'testing')
  .argv;

gulp.task('configure', function() {
  var environment = argv.environment;
  var config = require('./configurations.json')[environment];

  if (!config) {
    throw 'Missing configuration for environment "' + environment + '"';
  }

  fs.writeFileSync('config.json', JSON.stringify(config));
});

gulp.task('browserify', ['configure'], function() {
  return browserify('./js/main.js')
    .bundle({ debug: true })
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
