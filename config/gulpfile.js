// @ts-check
const {src, dest, watch} = require('gulp')
const babel = require('gulp-babel')
const cached = require('gulp-cached')
const babelConfig = require('./babel.config')
const rmrf = require('rimraf')
const {spawn} = require('child_process')
const path = require('path')
const {promisify} = require('util')

const jsSource = 'src/**/*.{js,jsx}'

exports.build = build
async function build() {
	await Promise.all([clean(), showName()])

	await buildTs()
	await buildGlobal()
}

exports.clean = clean
async function clean() {
	await promisify(rmrf)('dist')
}

const {showName} = require('../scripts/name.js')
exports.showName = showName

exports.buildTs = buildTs
async function buildTs() {
	await spawnWithEnv('tsc -p ./tsconfig.json')
}

exports.watchTs = watchTs
async function watchTs() {
	await spawnWithEnv('tsc -p ./tsconfig.json --watch')
}

exports.typecheck = typecheck
async function typecheck() {
	console.log('running typecheck')
	await spawnWithEnv('tsc -p ./tsconfig.json --noEmit')
}

exports.typecheckWatch = typecheckWatch
async function typecheckWatch() {
	console.log('running typecheckWatch')
	await spawnWithEnv('tsc -p ./tsconfig.json --noEmit --watch')
}

exports.buildGlobal = buildGlobal
async function buildGlobal() {
	await spawnWithEnv(`webpack --color --config ${path.resolve(__dirname, 'webpack.config.js')}`)
}

exports.watchGlobal = watchGlobal
async function watchGlobal() {
	await spawnWithEnv(`webpack --color --config ${path.resolve(__dirname, 'webpack.config.js')} --watch`)
}

exports.dev = dev
async function dev() {
	await build()
	await Promise.all([watchTs(), watchGlobal()])
}

exports.buildJs = buildJs
async function buildJs() {
	await new Promise((resolve, reject) => {
		const stream = src(jsSource, {sourcemaps: true})
			// in watch mode, prevents rebuilding all files
			.pipe(cached('js'))
			.pipe(babel(babelConfig))
			.pipe(dest('dist', {sourcemaps: '.'}))

		stream.on('end', resolve)
		stream.on('error', e => reject(e))
	})
}

exports.watchJs = watchJs
async function watchJs() {
	await new Promise((resolve, reject) => {
		const watcher = watch(jsSource, {ignoreInitial: false}, buildJs)
		watcher.on('close', resolve)
		watcher.on('error', e => reject(e))
	})
}

exports.releasePre = releasePre
async function releasePre() {
	await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'release:pre.sh'))
}

exports.releasePatch = releasePatch
async function releasePatch() {
	await releasePre()
	await spawnWithEnv('npm version patch -m v%s')
}

exports.releaseMinor = releaseMinor
async function releaseMinor() {
	await releasePre()
	await spawnWithEnv('npm version minor -m v%s')
}

exports.releaseMajor = releaseMajor
async function releaseMajor() {
	await releasePre()
	await spawnWithEnv('npm version major -m v%s')
}

const execOptions = {
	env: {
		...process.env,

		PATH: [
			// project node_modules
			path.resolve(process.cwd(), 'node_modules', '.bin'),
			// local node_modules wherever this package is installed
			path.resolve(__dirname, '..', 'node_modules', '.bin'),
			process.env.PATH,
		].join(':'),
	},
}

/** @param {string} cmd */
async function spawnWithEnv(cmd) {
	let parts = cmd.trim().split(/\s+/)
	const bin = parts.shift()

	await new Promise(resolve => {
		const child = spawn(bin, parts, execOptions)

		child.stdout.on('data', data => {
			console.log(data.toString())
		})

		child.stderr.on('data', data => {
			console.error(data.toString())
		})

		child.on('close', exitCode => {
			if (exitCode > 0) process.exit(exitCode)
			resolve()
		})

		process.on('exit', () => child.kill())
	})
}
