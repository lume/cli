const gulp = require('gulp')
const babel = require('gulp-babel')
// const cached = require('gulp-cached')
const typescript = require('gulp-typescript')
const merge = require('merge-stream')
const babelConfig = require('./babel.config')
const tsConfig = require('./tsconfig.json')
const sourcemaps = require('gulp-sourcemaps')

function transpile() {
	return merge()
}

function watch(task) {
	return gulp.watch(
		['src/**/*.{js,jsx,ts,tsx}', '!src/**/*test.{js,jsx,ts,tsx}'],
		{ ignoreInitial: false },
		gulp.parallel(task)
	)
}

gulp.task('build-cjs', () => {
	const jsPipe = gulp
		.src(['src/**/*.{js,jsx}', '!src/**/*test.{js,jsx}'])
		// .pipe(cached('js')) // in watch mode, prevents rebuilding all files
		.pipe(sourcemaps.init())
		.pipe(babel(babelConfig))

		.pipe(
			babel({
				plugins: [
					'@babel/plugin-transform-modules-commonjs',
					'babel-plugin-add-module-exports',
				],
			})
		)

		// TODO source maps
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./'))

	const tsPipe = gulp
		.src(['src/**/*.{ts,tsx}', '!src/**/*test.{ts,tsx}'])
		// .pipe(cached('ts')) // in watch mode, prevents rebuilding all files
		.pipe(sourcemaps.init())
		.pipe(typescript(tsConfig.compilerOptions))
		.pipe(babel(babelConfig))

		.pipe(
			babel({
				plugins: [
					'@babel/plugin-transform-modules-commonjs',
					'babel-plugin-add-module-exports',
				],
			})
		)

		// TODO source maps
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./'))

	return merge(jsPipe, tsPipe)
})
gulp.task('watch-cjs', () => watch('build-cjs'))

gulp.task('build-amd', () =>
	transpile()
		.pipe(
			babel({
				plugins: ['@babel/plugin-transform-modules-amd'],
			})
		)
		// TODO source maps
		.pipe(gulp.dest('./'))
)
gulp.task('watch-amd', () => watch('build-amd'))

gulp.task('build-umd', () =>
	transpile()
		.pipe(
			babel({
				plugins: [
					// opposite order from build-cjs
					'babel-plugin-add-module-exports',
					'@babel/plugin-transform-modules-umd',
				],
			})
		)
		// TODO source maps
		.pipe(gulp.dest('./'))
)
gulp.task('watch-umd', () => watch('build-umd'))
