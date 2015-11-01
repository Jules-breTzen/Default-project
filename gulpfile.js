var gulp = require('gulp');
var sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	livereload = require('gulp-livereload'),
	injectReload = require('gulp-inject-reload'),
	rimraf = require('rimraf'),
	autoprefixer = require('gulp-autoprefixer'),
	cssmin = require('gulp-cssmin'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	plumber = require('gulp-plumber'),
	zip = require('gulp-zip'),
	runSequence = require('run-sequence'),
	htmlreplace = require('gulp-html-replace')
	;

gulp.task('default', function(){
	

});


gulp.task('sass', function(){
	console.log("styles task");
	return gulp.src([
			'./dev/sass/app.scss'
		])
	.pipe(plumber())
	.pipe(autoprefixer({
            browsers: ['> 5%', 'last 2 versions']
        }))
	.pipe(sass({
		includePaths: [
			'./bower_components/foundation/scss', 
			'./bower_components/bootstrap-sass/stylesheets',
			'./bower_components/materialize/sass'
		]
	}).on('error', sass.logError))
	.pipe(concat('app.css'))
	.pipe(plumber.stop())
	.pipe(gulp.dest('./dev/css'))
	.pipe(livereload());

});

gulp.task('scripts', function(){
	gulp.src([
		'./bower_components/foundation/js/foundation.js',
		'./dev/scripts/app.js'
		])
	.pipe(plumber())
	.pipe(concat('app.js'))
	.pipe(plumber.stop())
	.pipe(gulp.dest('./dev/js'))
	.pipe(livereload());

	return gulp.src([
		'./bower_components/modernizr/modernizr.js',
		'./bower_components/jquery/dist/jquery.js'
		])
		.pipe(gulp.dest('./dev/js'));

});

 gulp.task('injectReload', function(){
        gulp.src('index.html')
            .pipe(injectReload({
            		port: 357555,
            		script: 'livereload.js',
                    host: 'http://localhost'
                }))
            .pipe(gulp.dest('build'));
    });

gulp.task('watch', ['injectReload'], function(){
	livereload.listen();
	
	gulp.watch('./dev/sass/**/*.scss', ['sass']).on('change', function(event){
		console.log(event.path + ' has been changed');
	});
	gulp.watch('./dev/scripts/**/*.js', ['scripts']).on('change', function(event){
		console.log(event.path + ' has been changed');
	});
});

gulp.task('rimraf', function(cb) {
	 rimraf('./dist/', cb);
});

gulp.task('htmlreplace',function(){
	return gulp.src('./dev/index.html')
	.pipe(htmlreplace({
		'appJs': 'js/app.min.js',
		'appCss' : 'css/app.min.css',
		'js' : ['js/modernizr.min.js', 'js/jquery.min.js']
	}))
	.pipe(gulp.dest('./dist'));
})

gulp.task('compressCss', function(){
	return gulp.src('./dev/css/*.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css'));
})

gulp.task('compressImg', function(){
	return gulp.src('./dev/img/*.*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./dist/img'));
})

gulp.task('compressJs', function(){
	return gulp.src('./dev/js/*.js')
    	.pipe(uglify())
    	.pipe(rename({suffix: '.min'}))
   	 	.pipe(gulp.dest('./dist/js'));
})
gulp.task('compress', function(){
	gulp.src('./dist/**/*')
        .pipe(zip('site.zip'))
        .pipe(gulp.dest('./dist'));
})

gulp.task('final',function(callback){
	runSequence('rimraf', 'htmlreplace', 'compressCss', 'compressImg', 'compressJs', 'compress', callback);
	console.log("Votre fichier a ete minifie et compresse dans le dossier dist!");
})

