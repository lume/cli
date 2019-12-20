// @ts-check
const {src, dest, watch} = require('gulp')
const babel = require('gulp-babel')
const cached = require('gulp-cached')
const babelConfig = require('./babel.config')

const jsSource = 'src/**/*.{js,jsx}'

function buildJs() {
	return (
		src(jsSource, {sourcemaps: true})
			// in watch mode, prevents rebuilding all files
			.pipe(cached('js'))
			.pipe(babel(babelConfig))
			.pipe(dest('dist', {sourcemaps: '.'}))
	)
}

exports.buildJs = buildJs

function watchJs() {
	return watch(jsSource, {ignoreInitial: false}, buildJs)
}

exports.watchJs = watchJs
