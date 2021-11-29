var gulp = require('gulp')
var browserify = require('browserify');
var source = require('vinyl-source-stream')

gulp.task('lib-js', function () {
  return gulp.src([
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/jquery/dist/jquery.slim.js'
  ]).pipe(gulp.dest('./lib/js'))
})

gulp.task('lib-css', function () {
  return gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.min.css', './src/css/*'])
    .pipe(gulp.dest('./lib/css'))
})

gulp.task('browserify', function () {
  return browserify([
    './src/js/index.js',
    './src/js/preference.js',
    './src/js/preset.js',
    './src/js/lib/Camera.js',
  ]).bundle()
    .pipe(source('index_bundle.js'))
    .pipe(gulp.dest('./lib/js'))
})

gulp.task('default', gulp.series('lib-js', 'lib-css', 'browserify'));