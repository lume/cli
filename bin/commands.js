// @ts-check
const path = require('path')

exports.build = build
async function build({skipClean = false} = {}) {
	await Promise.all([
		showName(),
		copyAssets(),
		(async function () {
			if (!skipClean) await clean()

			const builtTs = await buildTs()

			if (!builtTs) {
				console.log('No sources to build.')
				return
			}

			await buildGlobal()
		})(),
	])
}

exports.clean = clean
async function clean() {
	const rmrf = require('rimraf')
	const {promisify} = require('util')

	await spawnWithEnv('tsc --build --clean')

	await Promise.all([promisify(rmrf)('dist'), promisify(rmrf)('tsconfig.tsbuildinfo')])
}

exports.dev = dev
async function dev() {
	// Skip cleaning in dev mode, makes things easier like not breaking an
	// active type check process or webpack build.
	await build({skipClean: true})

	const promises = []

	promises.push(watchTs())
	promises.push(buildGlobalWatch())

	await Promise.all(promises)
}

const {showName} = require('../scripts/name.js')
exports.showName = showName

exports.copyAssets = copyAssets
async function copyAssets() {
	await spawnWithEnv(`gulp --cwd ${process.cwd()} --gulpfile ./node_modules/@lume/cli/config/gulpfile.js copyAssets`)
}

exports.buildTs = buildTs
async function buildTs({babelConfig = undefined, tsConfig2 = undefined} = {}) {
	const fs = require('fs')

	if (!babelConfig) {
		try {
			// TODO If there's no user tsconfig fall back to cli's tsconfig. We
			// might need to temporarily write it to the project root.
			await fs.promises.access(path.resolve(process.cwd(), 'tsconfig.json'))
		} catch (e) {
			// Don't try to run TypeScript build if no tsconfig.json file is present.
			return false
		}

		const {tsProjectReferenceMode} = require('../config/getUserConfig')

		// The use of tsConfig2 here is namely to test @lume/element and
		// @lume/variable decorators with TypeScript useDefineForClassFields
		// true and false to ensure they work in both cases.
		let file = 'tsconfig.json'
		if (tsConfig2) file = 'tsconfig2.json'

		if (tsProjectReferenceMode) await spawnWithEnv('tsc --build --incremental ' + file)
		else await spawnWithEnv('tsc -p ./' + file)
	} else {
		// This is used while testing with all the possible Babel decorator
		// configs (namely for @lume/element and @lume/variable).
		await spawnWithEnv(`babel --config-file ${babelConfig} --extensions .ts,.tsx src --out-dir ./dist`)
	}

	return true
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
	await spawnWithEnv(`webpack --color --config ${path.resolve(__dirname, '..', 'config', 'webpack.config.js')} --watch`)
}

exports.test = test
async function test() {
	// This option was made mainly with @lume/variable and @lume/element, to
	// test the code with all TypeScript and Babel decorator configs.
	const {testWithAllTSAndBabelDecoratorBuildConfigurations} = require('../config/getUserConfig')

	await Promise.all([build(), prettierCheck()])

	if (testWithAllTSAndBabelDecoratorBuildConfigurations) {
		let builtTs = false

		builtTs = await buildTs({babelConfig: './node_modules/@lume/cli/config/babel.decorator-config.1.js'})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'), {
			DECORATOR_CAUSES_NONWRITABLE_ERROR: 'true',
		})

		builtTs = await buildTs({babelConfig: './node_modules/@lume/cli/config/babel.decorator-config.2.js'})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'), {
			DECORATOR_CAUSES_NONWRITABLE_ERROR: 'true',
		})

		builtTs = await buildTs({babelConfig: './node_modules/@lume/cli/config/babel.decorator-config.3.js'})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'))

		builtTs = await buildTs({babelConfig: './node_modules/@lume/cli/config/babel.decorator-config.4.js'})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'))

		// TODO The tsConfig2 option here requires the dependent app to have a
		// tsconfig2.json file. The CLI should not require any tsconfig files,
		// they should be optional. We should look for those files, and fall
		// back to files here in the CLI.
		builtTs = await buildTs({tsConfig2: true})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'))
	}

	// we don't need to build the global for testing, so it isn't being ran here. TODO Maybe we should test that too?
	const builtTs = await buildTs()

	// TODO if sources found, but no test files, also skip instead of error.
	if (!builtTs) return console.log('No sources found, skipping tests.')

	await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'))
}

exports.testDebug = testDebug
async function testDebug() {
	const [builtTs] = await Promise.all([buildTs(), showName()])

	// TODO if sources found, but no tests files, also skip instead of error.
	if (!builtTs) return console.log('No sources found, skipping tests.')

	await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh'), {
		KARMA_DEBUG: 'true',
	})
}

exports.releasePre = releasePre
async function releasePre() {
	await spawnWithEnv(path.resolve(__dirname, '..', 'scripts', 'release-pre.sh'))
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

exports.releaseAlphaMajor = releaseAlphaMajor
async function releaseAlphaMajor() {
	await releasePre()
	await spawnWithEnv('npm version premajor --preid alpha -m v%s')
}

exports.releaseAlphaMinor = releaseAlphaMinor
async function releaseAlphaMinor() {
	await releasePre()
	await spawnWithEnv('npm version preminor --preid alpha -m v%s')
}

exports.releaseAlphaPatch = releaseAlphaPatch
async function releaseAlphaPatch() {
	await releasePre()
	await spawnWithEnv('npm version prepatch --preid alpha -m v%s')
}

exports.releaseBetaMajor = releaseBetaMajor
async function releaseBetaMajor() {
	await releasePre()
	await spawnWithEnv('npm version premajor --preid beta -m v%s')
}

exports.releaseBetaMinor = releaseBetaMinor
async function releaseBetaMinor() {
	await releasePre()
	await spawnWithEnv('npm version preminor --preid beta -m v%s')
}

exports.releaseBetaPatch = releaseBetaPatch
async function releaseBetaPatch() {
	await releasePre()
	await spawnWithEnv('npm version prepatch --preid beta -m v%s')
}

exports.versionHook = versionHook
async function versionHook() {
	await spawnWithEnv('./node_modules/@lume/cli/scripts/version.sh')
}

exports.postVersionHook = postVersionHook
async function postVersionHook() {
	await spawnWithEnv('./node_modules/@lume/cli/scripts/postversion.sh')
}

// TODO Prefer the user's .prettierignore if it is present.
const prettierConfig = '--config ./node_modules/@lume/cli/.prettierrc.js'
// TODO Prefer the user's .prettierignore if it is present.
const prettierIgnore = '--ignore-path ./node_modules/@lume/cli/.prettierignore'
// Check formatting of all supported file types in the project.
// TODO allow user to override this.
const prettierFiles = process.cwd()

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
	shell: true,
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
 * @param {{[k:string]: string} | undefined} env - Variables to set in the child process env.
 * @param {{exitOnFail?: boolean} | undefined} options - Options. If
 * .exitOnFail is not true (true is default), then the process that called
 * spawnWithEnv will exit if the spawned child process exits non-zero.
 */
async function spawnWithEnv(cmd, env = {}, options = {}) {
	const {exitOnFail = true} = options

	let parts = cmd.trim().split(/\s+/)
	const bin = parts.shift()
	const {spawn} = require('child_process')

	await new Promise((resolve, reject) => {
		const child = spawn(bin, parts, {...execOptions, env: {...execOptions.env, ...env}})

		child.stdout.on('data', data => {
			console.log(data.toString())
		})

		child.stderr.on('data', data => {
			console.error(data.toString())
		})

		child.on('close', exitCode => {
			if (exitCode !== 0) {
				if (exitOnFail) process.exit(exitCode)
				else reject(exitCode)
			}
			resolve()
		})

		process.on('exit', () => child.kill())
	})
}
