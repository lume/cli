const gulp = require('gulp')
const babel = require('gulp-babel')
const buble = require('gulp-buble')
const cached = require('gulp-cached')
const babelConfig = require('./babel.config')
const bubleConfig = require('./buble.config')

function transpile() {
    return gulp.src(['src/**/*.js', '!src/**/*test.js'])
        .pipe(cached('js')) // in watch mode, prevents rebuilding all files
        .pipe(babel(babelConfig))
        .pipe(buble(bubleConfig))
}

function watch(task) {
    return gulp.watch('src/**/*.js', {ignoreInitial: false}, gulp.parallel(task))
}

gulp.task('build-cjs', () =>
    transpile()
        .pipe(babel({
            plugins: [
                '@babel/plugin-transform-modules-commonjs',
                'babel-plugin-add-module-exports',
            ],
        }))
        // TODO source maps
        .pipe(gulp.dest('./'))
)
gulp.task('watch-cjs', () => watch('build-cjs'))

gulp.task('build-amd', () =>
    transpile()
        .pipe(babel({
            plugins: [ '@babel/plugin-transform-modules-amd' ],
        }))
        // TODO source maps
        .pipe(gulp.dest('./'))
)
gulp.task('watch-amd', () => watch('build-amd'))

gulp.task('build-umd', () =>
    transpile()
        .pipe(babel({
            plugins: [
                // opposite order from build-cjs
                'babel-plugin-add-module-exports',
                '@babel/plugin-transform-modules-umd',
            ],
        }))
        // TODO source maps
        .pipe(gulp.dest('./'))
)
gulp.task('watch-umd', () => watch('build-umd'))
