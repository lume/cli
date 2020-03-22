// @ts-check
const path = require('path')
const jsSource = 'src/**/*.{js,jsx}'

exports.build = build
async function build() {
	const userConfig = require('../config/getUserConfig')

	await Promise.all([clean(), showName()])

	await buildTs()
	if (!userConfig.skipGlobal) await buildGlobal()
}

exports.clean = clean
async function clean() {
	const rmrf = require('rimraf')
	const {promisify} = require('util')

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
	await spawnWithEnv(`webpack --color --config ${path.resolve(__dirname, '..', 'config', 'webpack.config.js')}`)
}

exports.buildGlobalWatch = buildGlobalWatch
async function buildGlobalWatch() {
	await spawnWithEnv(
		`webpack --color --config ${path.resolve(__dirname, '..', 'config', 'webpack.config.js')} --watch`,
	)
}

exports.test = test
async function test() {
	// we don't need to build the global for testing, so it isn't being ran here. TODO Maybe we should test that too?
	await Promise.all([buildTs(), showName()])
	await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'))
}

exports.testDebug = testDebug
async function testDebug() {
	await Promise.all([buildTs(), showName()])
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
	await spawnWithEnv('./node_modules/@lume/cli/scripts/version.sh')
}

exports.postVersionHook = postVersionHook
async function postVersionHook() {
	await spawnWithEnv('./node_modules/@lume/cli/scripts/postversion.sh')
}

const prettierConfig = '--config ./node_modules/@lume/cli/.prettierrc.js'
const prettierIgnore = '--ignore-path ./node_modules/@lume/cli/.prettierignore'
const prettierFiles = './**/*.{js,json,ts,tsx,md}'

exports.prettier = prettier
async function prettier() {
	const command = `prettier ${prettierConfig} ${prettierIgnore} --write ${prettierFiles}`
	// TODO debug output in verbose mode
	// console.log(`Running '${command}'`)
	// console.log('')
	await spawnWithEnv(command)
}

exports.prettierCheck = prettierCheck
async function prettierCheck() {
	const command = `prettier ${prettierConfig} ${prettierIgnore} --check ${prettierFiles}`
	// TODO debug output in verbose mode
	// console.log(`Running '${command}'`)
	// console.log('')
	await spawnWithEnv(command)
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
	const {spawn} = require('child_process')

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
