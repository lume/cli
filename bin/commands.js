// @ts-check
const path = require('path')
const fs = require('fs')
const {showName} = require('../scripts/name.js')
const config = require('../config/getUserConfig.js')

// TODO read CLI options from a project's lume.config too.

let cli
module.exports.setCli = function (_cli) {
	cli = _cli
}

let opts
module.exports.setOpts = function (options) {
	opts = options
}

exports.showName = showName

exports.build = build
async function build({skipClean = false, noFailOnError = opts.noFail} = {}) {
	if (opts.verbose) console.log(`===> Running the "build" command.\n`)

	await Promise.all([
		showName(),
		copyAssets(),
		(async function () {
			if (!skipClean) await clean()

			const builtTs = await buildTs({noFailOnError})

			if (!builtTs) {
				console.log('No sources to build.')
				return
			}

			await buildGlobal({noFailOnError})
		})(),
	])

	if (opts.verbose) console.log(`===> Done running the "build" command.\n`)
}

exports.clean = clean
async function clean() {
	if (opts.verbose) console.log(`===> Running the "clean" command.\n`)

	const rmrf = require('rimraf')
	const {promisify} = require('util')

	await exec('tsc --build --clean')

	await Promise.all([promisify(rmrf)('dist'), promisify(rmrf)('tsconfig.tsbuildinfo')])

	if (opts.verbose) console.log(`===> Done running the "clean" command.\n`)
}

exports.dev = dev
async function dev() {
	if (opts.verbose) console.log(`===> Running the "dev" command.\n`)

	// Skip cleaning in dev mode, makes things easier like not breaking an
	// active type check process or webpack build.
	await build({skipClean: true, noFailOnError: true})

	const promises = []

	promises.push(watchTs())
	promises.push(buildGlobalWatch())

	await Promise.all(promises)

	if (opts.verbose) console.log(`===> Done running the "dev" command.\n`)
}

exports.copyAssets = copyAssets
async function copyAssets() {
	if (opts.verbose) console.log(`===> Running the "copyAssets" command.\n`)
	await exec(`gulp --cwd ${process.cwd()} --gulpfile ./node_modules/@lume/cli/config/gulpfile.js copyAssets`)
	if (opts.verbose) console.log(`===> Done running the "copyAssets" command.\n`)
}

exports.buildTs = buildTs
async function buildTs({babelConfig = undefined, tsConfig2 = undefined, noFailOnError = opts.noFail} = {}) {
	if (opts.verbose) console.log(`===> Running the "buildTs" command.\n`)

	const start = performance.now()
	const fs = require('fs')

	// If babelConfig is not undefined, it means we're building using babel for testing decorator configs.
	// TODO we need to use babel to compile JSX expressions.
	if (!babelConfig) {
		try {
			// TODO If there's no user tsconfig fall back to cli's tsconfig. We
			// might need to temporarily write it to the project root.
			await fs.promises.access(path.resolve(process.cwd(), 'tsconfig.json'))
		} catch (e) {
			console.log('No tsconfig file found. Skipping TypeScript build.')

			if (opts.verbose) console.log(`===> Done running the "buildTs" command.\n`)

			// Don't try to run TypeScript build if no tsconfig.json file is present.
			return false
		}

		const {tsProjectReferenceMode} = require('../config/getUserConfig')

		// The use of tsConfig2 here is namely to test @lume/element and
		// @lume/variable decorators with TypeScript useDefineForClassFields
		// true and false to ensure they work in both cases.
		let file = 'tsconfig.json'
		if (tsConfig2) file = 'tsconfig2.json'

		const tsCliOptions = cli.rawArgs.join(' ').split(' -- ')[1]
		const command = `tsc ${tsProjectReferenceMode ? '--build --incremental' : '-p'} ./${file} ${tsCliOptions ?? ''} ${
			noFailOnError ? '|| true' : ''
		}`

		if (opts.verbose) console.log(`=====> Running \`${command}\`.\n`)
		await exec(command)
	} else {
		const command = `babel --config-file ${babelConfig} --extensions .ts,.tsx src --out-dir ./dist`

		if (opts.verbose) console.log(`=====> Running \`${command}\`.\n`)

		// This is used while testing with all the possible Babel decorator
		// configs (namely for @lume/element and @lume/variable).
		await exec(command)
	}

	const end = performance.now()

	if (opts.verbose) console.log(`===> Done running the "buildTs" command. (${Math.round(end - start)}ms) \n`)

	return true
}

// TODO Project Reference mode for watch mode?
exports.watchTs = watchTs
async function watchTs() {
	const tsCliOptions = cli.rawArgs.join(' ').split(' -- ')[1]
	const command = `tsc -p ./tsconfig.json --watch ${tsCliOptions ?? ''}`

	if (opts.verbose) {
		console.log(`===> Running the "watchTs" command.\n`)
		console.log(`=====> Running \`${command}\`.\n`)
	}

	await exec(command)

	if (opts.verbose) console.log(`===> Done running the "watchTs" command.\n`)
}

// TODO Project Reference mode while type checking?
exports.typecheck = typecheck
async function typecheck() {
	const tsCliOptions = cli.rawArgs.join(' ').split(' -- ')[1]
	const command = 'tsc -p ./tsconfig.json --noEmit ' + (tsCliOptions ?? '')

	if (opts.verbose) {
		console.log(`===> Running the "typecheck" command.\n`)
		console.log(`=====> Running \`${command}\`\n`)
	}

	await exec(command)

	if (opts.verbose) console.log(`===> Done running the "typecheck" command.\n`)
}

// TODO Project Reference mode while type checking in watch mode?
exports.typecheckWatch = typecheckWatch
async function typecheckWatch() {
	const tsCliOptions = cli.rawArgs.join(' ').split(' -- ')[1]
	const command = 'tsc -p ./tsconfig.json --noEmit --watch ' + (tsCliOptions ?? '')

	if (opts.verbose) {
		console.log(`===> Running the "typecheckWatch" command.\n`)
		console.log(`=====> Running \`${command}\`\n`)
	}

	await exec(command)

	if (opts.verbose) console.log(`===> Done running the "typecheckWatch" command.\n`)
}

exports.buildGlobal = buildGlobal
async function buildGlobal({noFailOnError = opts.noFail}) {
	const command = `webpack --color --config ${path.resolve(__dirname, '..', 'config', 'webpack.config.js')} ${
		noFailOnError ? '|| true' : ''
	}`

	if (opts.verbose) {
		console.log(`===> Running the "buildGlobal" command.\n`)
		console.log(`=====> Running \`${command}\`\n`)
	}

	await exec(command)

	if (opts.verbose) console.log(`===> Done running the "buildGlobal" command.\n`)
}

exports.buildGlobalWatch = buildGlobalWatch
async function buildGlobalWatch() {
	const command = `webpack --color --config ${path.resolve(__dirname, '..', 'config', 'webpack.config.js')} --watch`

	if (opts.verbose) {
		console.log(`===> Running the "buildGlobalWatch" command.\n`)
		console.log(`=====> Running \`${command}\`\n`)
	}

	await exec(command)

	if (opts.verbose) console.log(`===> Done running the "buildGlobalWatch" command.\n`)
}

exports.test = test
async function test() {
	if (opts.verbose) console.log(`===> Running the "test" command.\n`)

	// This option was made mainly with @lume/variable and @lume/element, to
	// test the code with all TypeScript and Babel decorator configs.
	const {testWithAllTSAndBabelDecoratorBuildConfigurations} = require('../config/getUserConfig')

	// FIXME This is a mess, but it works: the build() step here runs
	// buildTs(), but then we also redundantly run buildTs() here after.

	await Promise.all([build(), prettierCheck()])

	const karmaCommand = path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh')

	if (testWithAllTSAndBabelDecoratorBuildConfigurations) {
		let builtTs = false

		console.log(`=====> Running the permutations of decorator test builds.\n`)

		builtTs = await buildTs({babelConfig: './node_modules/@lume/cli/config/babel.decorator-config.1.js'})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await exec(karmaCommand, {env: {DECORATOR_CAUSES_NONWRITABLE_ERROR: 'true'}})

		builtTs = await buildTs({babelConfig: './node_modules/@lume/cli/config/babel.decorator-config.2.js'})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await exec(karmaCommand, {env: {DECORATOR_CAUSES_NONWRITABLE_ERROR: 'true'}})

		builtTs = await buildTs({babelConfig: './node_modules/@lume/cli/config/babel.decorator-config.3.js'})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await exec(karmaCommand)

		builtTs = await buildTs({babelConfig: './node_modules/@lume/cli/config/babel.decorator-config.4.js'})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await exec(karmaCommand)

		// TODO The tsConfig2 option here requires the dependent app to have a
		// tsconfig2.json file. The CLI should not require any tsconfig files,
		// they should be optional. We should look for those files, and fall
		// back to files here in the CLI.
		builtTs = await buildTs({tsConfig2: true})
		if (!builtTs) return console.log('No sources found, skipping tests.')
		await exec(karmaCommand)
	}

	const builtTs = await buildTs()

	// TODO if sources found, but no test files, also skip instead of error.
	if (!builtTs) return console.log('No sources found, skipping tests.')

	await exec(karmaCommand)

	if (opts.verbose) console.log(`===> Done running the "test" command.\n`)
}

exports.testDebug = testDebug
async function testDebug() {
	if (opts.verbose) console.log(`===> Running the "testDebug" command.\n`)

	const [builtTs] = await Promise.all([buildTs(), showName()])

	// TODO if sources found, but no tests files, also skip instead of error.
	if (!builtTs) return console.log('No sources found, skipping tests.')

	const karmaCommand = path.resolve(__dirname, '..', 'scripts', 'run-karma-tests.sh')

	await exec(karmaCommand, {env: {KARMA_DEBUG: 'true'}})

	if (opts.verbose) console.log(`===> Done running the "testDebug" command.\n`)
}

exports.releasePre = releasePre
async function releasePre() {
	if (opts.verbose) console.log(`===> Running the "releasePre" command.\n`)
	const command = path.resolve(__dirname, '..', 'scripts', 'release-pre.sh')
	if (opts.verbose) console.log(`=====> Running \`${command}\`.\n`)
	await exec(command)
	if (opts.verbose) console.log(`===> Done running the "releasePre" command.\n`)
}

exports.releasePatch = releasePatch
async function releasePatch() {
	if (opts.verbose) console.log(`===> Running the "releasePatch" command.\n`)
	await releasePre()
	await exec('npm version patch -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releasePatch" command.\n`)
}

exports.releaseMinor = releaseMinor
async function releaseMinor() {
	if (opts.verbose) console.log(`===> Running the "releaseMinor" command.\n`)
	await releasePre()
	await exec('npm version minor -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseMinor" command.\n`)
}

exports.releaseMajor = releaseMajor
async function releaseMajor() {
	if (opts.verbose) console.log(`===> Running the "releaseMajor" command.\n`)
	await releasePre()
	await exec('npm version major -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseMajor" command.\n`)
}

exports.releaseAlphaMajor = releaseAlphaMajor
async function releaseAlphaMajor() {
	if (opts.verbose) console.log(`===> Running the "releaseAlphaMajor" command.\n`)
	await releasePre()
	await exec('npm version premajor --preid alpha -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseAlphaMajor" command.\n`)
}

exports.releaseAlphaMinor = releaseAlphaMinor
async function releaseAlphaMinor() {
	if (opts.verbose) console.log(`===> Running the "releaseAlphaMinor" command.\n`)
	await releasePre()
	await exec('npm version preminor --preid alpha -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseAlphaMinor" command.\n`)
}

exports.releaseAlphaPatch = releaseAlphaPatch
async function releaseAlphaPatch() {
	if (opts.verbose) console.log(`===> Running the "releaseAlphaPatch" command.\n`)
	await releasePre()
	await exec('npm version prepatch --preid alpha -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseAlphaPatch" command.\n`)
}

exports.releaseBetaMajor = releaseBetaMajor
async function releaseBetaMajor() {
	if (opts.verbose) console.log(`===> Running the "releaseBetaMajor" command.\n`)
	await releasePre()
	await exec('npm version premajor --preid beta -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseBetaMajor" command.\n`)
}

exports.releaseBetaMinor = releaseBetaMinor
async function releaseBetaMinor() {
	if (opts.verbose) console.log(`===> Running the "releaseBetaMinor" command.\n`)
	await releasePre()
	await exec('npm version preminor --preid beta -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseBetaMinor" command.\n`)
}

exports.releaseBetaPatch = releaseBetaPatch
async function releaseBetaPatch() {
	if (opts.verbose) console.log(`===> Running the "releaseBetaPatch" command.\n`)
	await releasePre()
	await exec('npm version prepatch --preid beta -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseBetaPatch" command.\n`)
}

exports.releaseAlpha = releaseAlpha
async function releaseAlpha() {
	if (opts.verbose) console.log(`===> Running the "releaseAlpha" command.\n`)
	await releasePre()
	await exec('npm version prerelease --preid alpha -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseAlpha" command.\n`)
}

exports.releaseBeta = releaseBeta
async function releaseBeta() {
	if (opts.verbose) console.log(`===> Running the "releaseBeta" command.\n`)
	await releasePre()
	await exec('npm version prerelease --preid beta -m v%s')
	if (opts.verbose) console.log(`===> Done running the "releaseBeta" command.\n`)
}

exports.versionHook = versionHook
async function versionHook() {
	if (opts.verbose) console.log(`===> Running the "versionHook" command.\n`)
	await exec('./node_modules/@lume/cli/scripts/version.sh')
	if (opts.verbose) console.log(`===> Done running the "versionHook" command.\n`)
}

exports.postVersionHook = postVersionHook
async function postVersionHook() {
	if (opts.verbose) console.log(`===> Running the "postVersionHook" command.\n`)
	await exec('./node_modules/@lume/cli/scripts/postversion.sh')
	if (opts.verbose) console.log(`===> Done running the "postVersionHook" command.\n`)
}

const prettierConfig =
	'--config ' +
	(fs.existsSync('.prettierrc.js')
		? '.prettierrc.js'
		: fs.existsSync('.prettierrc.cjs')
		? '.prettierrc.cjs'
		: './node_modules/@lume/cli/.prettierrc.js')

const prettierIgnore =
	'--ignore-path ' +
	(config.prettierIgnorePath ??
		(fs.existsSync('.prettierignore') ? '.prettierignore' : './node_modules/@lume/cli/.prettierignore'))

// Check formatting of all supported file types in the project.
const prettierFiles = process.cwd()

exports.prettier = prettier
async function prettier() {
	if (opts.verbose) console.log(`===> Running the "prettier" command.\n`)
	const command = `prettier ${prettierConfig} ${prettierIgnore} --write ${prettierFiles}`
	if (opts.verbose) console.log(`=====> Running \`${command}\`\n`)
	await exec(command)
	if (opts.verbose) console.log(`===> Done running the "prettier" command.\n`)
}

exports.prettierCheck = prettierCheck
async function prettierCheck() {
	if (opts.verbose) console.log(`===> Running the "prettierCheck" command.\n`)
	const command = `prettier ${prettierConfig} ${prettierIgnore} --check ${prettierFiles}`
	if (opts.verbose) console.log(`=====> Running \`${command}\`\n`)
	await exec(command)
	if (opts.verbose) console.log(`===> Done running the "prettierCheck" command.\n`)
}

/** @type {import('child_process').SpawnOptions | undefined} */
let execSpawnOptions

/**
 * @param {string} cmd
 * @param {{exitOnFail?: boolean, env?: {[k:string]: string}} | undefined} options - Options. If
 * .exitOnFail is not true (true is default), then the process that called
 * exec will exit if the spawned child process exits non-zero.
 */
async function exec(cmd, options = {}) {
	if (!execSpawnOptions) {
		execSpawnOptions = {
			shell: true,
			stdio: 'inherit',
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
	}

	const {exitOnFail = true, env = {}} = options

	let parts = cmd.trim().split(/\s+/)
	const bin = parts.shift()
	const {spawn} = require('child_process')

	await new Promise((resolve, reject) => {
		const child = spawn(bin, parts, {...execSpawnOptions, env: {...execSpawnOptions.env, ...env}})

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
