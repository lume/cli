const gulp = require('gulp')
const babel = require('gulp-babel')
const cached = require('gulp-cached')
const typescript = require('gulp-typescript')
const mergeStream = require('merge-stream')
const babelConfig = require('./babel.config')
const tsConfig = require('./tsconfig.json')

function transpile() {
	const tsStream = gulp
		.src(['src/**/*.{ts,tsx}', '!src/**/*test.{ts,tsx}'])
		.pipe(cached('ts')) // in watch mode, prevents rebuilding all files
		.pipe(typescript(tsConfig.compilerOptions))

	return {
		js: mergeStream(
			gulp
				.src(['src/**/*.{js,jsx}', '!src/**/*test.{js,jsx}'])
				.pipe(cached('js')) // in watch mode, prevents rebuilding all files
				.pipe(babel(babelConfig)),
			tsStream.js.pipe(babel(babelConfig)),
		),
		dts: tsStream.dts,
	}
}

function watch(task) {
	return gulp.watch(
		['src/**/*.{js,jsx,ts,tsx}', '!src/**/*test.{js,jsx,ts,tsx}'],
		{ignoreInitial: false},
		gulp.parallel(task),
	)
}

gulp.task('build-cjs', () => {
	const streams = transpile()

	return mergeStream(
		streams.js.pipe(
			babel({
				plugins: ['@babel/plugin-transform-modules-commonjs', 'babel-plugin-add-module-exports'],
			}),
		),
		// TODO source maps

		streams.dts,
	).pipe(gulp.dest('./'))
})
gulp.task('watch-cjs', () => watch('build-cjs'))

gulp.task('build-amd', () => {
	const streams = transpile()

	return mergeStream(
		streams.js.pipe(
			babel({
				plugins: ['@babel/plugin-transform-modules-amd'],
			}),
		),
		// TODO source maps

		streams.dts,
	).pipe(gulp.dest('./'))
})
gulp.task('watch-amd', () => watch('build-amd'))

gulp.task('build-umd', () => {
	const streams = transpile()

	return mergeStream(
		streams.js.pipe(
			babel({
				plugins: [
					// opposite order from build-cjs
					'babel-plugin-add-module-exports',
					'@babel/plugin-transform-modules-umd',
				],
			}),
		),
		// TODO source maps

		streams.dts,
	).pipe(gulp.dest('./'))
})
gulp.task('watch-umd', () => watch('build-umd'))
