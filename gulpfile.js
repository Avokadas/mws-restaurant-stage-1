var gulp = require('gulp');
var browserSync = require('browser-sync');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
const imagemin = require('gulp-imagemin');
const inlineCss = require('gulp-inline-css');
var uglify = require('gulp-uglify');
const webp = require('gulp-webp');

function compile(watch) {
    var bundler = watchify(browserify('./js/main.js', { debug: true }).transform("babelify", {presets: ["env"]}));
    var bundler2 = watchify(browserify('./js/restaurant_info.js', { debug: true }).transform("babelify", {presets: ["env"]}));
    var bundler3 = watchify(browserify('./sw.js', { debug: true }).transform("babelify", {presets: ["env"]}));
  
    function rebundle() {
      bundler.bundle()
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(source('build.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
      
      bundler2.bundle()
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(source('build_restaurant.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
        
      bundler3.bundle()
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(source('build_sw.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'));
    }
  
    if (watch) {
      bundler.on('update', function() {
        console.log('-> bundling...');
        rebundle();
      });
      
      bundler2.on('update', function() {
        console.log('-> bundling...');
        rebundle();
      });
      
      bundler3.on('update', function() {
        console.log('-> bundling...');
        rebundle();
      });
    }
  
    rebundle();

    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
  }
  
  function watch() {
    return compile(true);
  };
  
  gulp.task('build', () => { return compile(); });
  gulp.task('watch', () => { return watch(); });
  gulp.task('images', () => {
    gulp.src('img/*')
      .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng(),
        imagemin.svgo([{removeViewBox: false}, {minifyStyles: false}])
      ], {verbose: true}))
      .pipe(webp())
      .pipe(gulp.dest('dist/images'))
  })
  
  gulp.task('default', ['watch']);