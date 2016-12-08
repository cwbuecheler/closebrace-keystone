var gulp = require('gulp');
var watch = require('gulp-watch');
var shell = require('gulp-shell')
var concat = require('gulp-concat');

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

gulp.task('watch:js', function() {
	gulp.watch(paths.js.all, ['combinejs']);
});
gulp.task('combinejs', function() {
	return gulp.src(paths.js.all)
		.pipe(concat('build.js'))
		.pipe(gulp.dest(paths.js.output));
});


gulp.task('watch:sass', function() {
	gulp.watch(paths.style.all, ['sass']);
});

gulp.task('sass', function(){
	gulp.src(paths.style.all)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(paths.style.output));
});


gulp.task('runKeystone', shell.task('node keystone.js'));
gulp.task('watch', [
  'watch:sass',
  'watch:js',
]);

gulp.task('default', ['watch', 'runKeystone']);
