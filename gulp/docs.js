const gulp = require('gulp');

//HTML
const fileInclude = require('gulp-file-include');
const htmlclean = require('gulp-htmlclean');

//SASS
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
// const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');

const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const groupMedia = require('gulp-group-css-media-queries');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
// const changed = require('gulp-changed');


gulp.task('clean:docs', function (done) {
    if (fs.existsSync('./docs/')) {
        return gulp
            .src('./docs/', { read: false })
            .pipe(clean({ force: true }));
    }

    done();
});

const fileIncludeSettings = {
    prefix: '@@',
    basepath: '@file',
}

const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
        }),
    };
}

gulp.task('html:docs', function () {
    return gulp
        .src(['./src/html/**/*.html', '!./src/html/partials/*.html'])
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(htmlclean())
        .pipe(gulp.dest('./docs/'))
});

gulp.task('sass:docs', function () {
    return gulp
        .src('./src/scss/*.scss')
        .pipe(plumber(plumberNotify('SCSS')))
        .pipe(sourceMaps.init())
        // .pipe(autoprefixer())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(csso())
        .pipe(groupMedia())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./docs/css/'))
});

gulp.task('images:docs', function () {
    return gulp
        .src('./src/img/**/*')
        // .pipe(changed('./docs/img/'))
        .pipe(imagemin({ verbose: true }))
        .pipe(gulp.dest('./docs/img/'))
});

gulp.task('fonts:docs', function () {
    return gulp
        .src('./src/fonts/**/*')
        .pipe(gulp.dest('./docs/fonts/'))
});

gulp.task('js:docs', async function () {
    const gulpChanged = await import('gulp-changed');
    return gulp
        .src('./src/js/*.js')
        .pipe(plumber(plumberNotify('JS')))
        .pipe(gulpChanged.default('./docs/js'))
        .pipe(babel())
        .pipe(webpack(require('../webpack.config.js')))
        .pipe(gulp.dest('./docs/js'))
});

const serverOptions = {
    livereload: true,
    open: true
}

gulp.task('server:docs', function () {
    return gulp.src('./docs/')
        .pipe(server(serverOptions))
});



