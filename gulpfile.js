var gulp = require('gulp');
var watch = require('gulp-watch');
var shell = require('gulp-shell')
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var sass = require('gulp-sass');

var paths = {
	'src': ['./models/**/*.js','./routes/**/*.js', 'keystone.js', 'package.json'],
	'style': {
		all: ['./src/styles/**/*.scss'],
		output: './public/styles/'
	},
	'js': {
		all: ['./src/js/**/*.js'],
		output: './public/js/'
	}
};


// JavaScript
gulp.task('watch:js', function() {
	gulp.watch(paths.js.all, ['combinejs']);
});
gulp.task('combinejs', function() {
	return gulp.src(paths.js.all)
		.pipe(concat('build.js'))
		.pipe(gulp.dest(paths.js.output));
});

gulp.task('compressjs', function() {
  gulp.src(paths.js.all)
  	.pipe(concat('build.js'))
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        }
    }))
    .pipe(gulp.dest(paths.js.output))
});

// CSS
gulp.task('watch:sass', function() {
	gulp.watch(paths.style.all, ['sass']);
});

gulp.task('sass', function(){
	gulp.src(paths.style.all)
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(gulp.dest(paths.style.output));
});


// Watch
gulp.task('watch', [
  'watch:sass',
  'watch:js',
]);

// Development
gulp.task('build-dev', [
  'sass',
  'combinejs',
]);

// Production
gulp.task('build-prod', [
	'sass',
	'compressjs'
]);

// Default
gulp.task('default', ['watch', 'runKeystone']);
