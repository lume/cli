// @ts-check
const {src, dest, watch} = require('gulp')
const babel = require('gulp-babel')
const cached = require('gulp-cached')
const _prettier = require('prettier')
const babelConfig = require('./babel.config')
const rmrf = require('rimraf')
const {spawn} = require('child_process')
const path = require('path')
const {promisify} = require('util')
const builderConfig = require('./getBuilderConfig')

const jsSource = 'src/**/*.{js,jsx}'

exports.build = build
async function build() {
	await Promise.all([clean(), showName()])

	await buildTs()
	if (!builderConfig.skipGlobal) await buildGlobal()
}

exports.clean = clean
async function clean() {
	await promisify(rmrf)('dist')
}

exports.dev = dev
async function dev() {
	await build()
	await Promise.all([watchTs(), buildGlobalWatch()])
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

exports.buildGlobalWatch = buildGlobalWatch
async function buildGlobalWatch() {
	await spawnWithEnv(`webpack --color --config ${path.resolve(__dirname, 'webpack.config.js')} --watch`)
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
		stream.on('error', reject)
	})
}

exports.buildJsWatch = buildJsWatch
async function buildJsWatch() {
	await new Promise((resolve, reject) => {
		const watcher = watch(jsSource, {ignoreInitial: false}, buildJs)
		watcher.on('close', resolve)
		watcher.on('error', reject)
	})
}

exports.test = test
async function test() {
	await build()
	await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'))
}

exports.testDebug = testDebug
async function testDebug() {
	await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'), {
		KARMA_DEBUG: 'true',
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

exports.versionHook = versionHook
async function versionHook() {
	await spawnWithEnv('./node_modules/builder-js-package/scripts/version.sh')
}

exports.postVersionHook = postVersionHook
async function postVersionHook() {
	await spawnWithEnv('./node_modules/builder-js-package/scripts/postversion.sh')
}

const prettierConfig = '--config ./node_modules/builder-js-package/.prettierrc.js'
const prettierIgnore = '--ignore-path ./node_modules/builder-js-package/.prettierignore'
const prettierFiles = './**/*.{js,json,ts,tsx,md}'

exports.prettier = prettier
async function prettier() {
	await spawnWithEnv(`prettier ${prettierConfig} ${prettierIgnore} --write ${prettierFiles}`)
}

exports.prettierList = prettierList
async function prettierList() {
	await spawnWithEnv(`prettier ${prettierConfig} ${prettierIgnore} --list-different ${prettierFiles}`)
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

/**
 * @param {string} cmd
 * @param {{[k:string]: string}} [env]
 */
async function spawnWithEnv(cmd, env) {
	let parts = cmd.trim().split(/\s+/)
	const bin = parts.shift()

	await new Promise(resolve => {
		const child = spawn(bin, parts, {...execOptions, env: {...execOptions.env, ...env}})

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
