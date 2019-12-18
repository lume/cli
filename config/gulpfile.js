const gulp = require('gulp')
const babel = require('gulp-babel')
const cached = require('gulp-cached')
const typescript = require('gulp-typescript')
const mergeStream = require('merge-stream')
const babelConfig = require('./babel.config')
const tsConfig = require('./tsconfig.json')

function transpile() {
	const tsStreams = gulp
		.src(['src/**/*.{ts,tsx}', '!src/**/*test.{ts,tsx}'])
		// in watch mode, prevents rebuilding all files
		.pipe(cached('ts'))
		.pipe(typescript(tsConfig.compilerOptions))

	const jsStream = gulp
		.src(['src/**/*.{js,jsx}', '!src/**/*test.{js,jsx}'])
		// in watch mode, prevents rebuilding all files
		.pipe(cached('js'))

	return {
		js: mergeStream(jsStream, tsStreams.js).pipe(babel(babelConfig)),
		dts: tsStreams.dts,
	}
}

function watch(task) {
	return gulp.watch(
		['src/**/*.{js,jsx,ts,tsx}', '!src/**/*test.{js,jsx,ts,tsx}'],
		{ignoreInitial: false},
		gulp.parallel(task),
	)
}

gulp.task('build-es', () => {
	const streams = transpile()

	return mergeStream(
		// TODO source maps
		streams.js,
		streams.dts,
	).pipe(gulp.dest('./'))
})

gulp.task('watch-es', () => watch('build-es'))
