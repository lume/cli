// @ts-check

// We use Webpack only to bundle the global scripts.
// Source files are built using the buildTs command in commands.js.

const camelcase = require('camelcase')
const path = require('path')
const utils = require('./utils')

const CWD = process.cwd()
const pkg = require(path.join(CWD, 'package.json'))
const userLumeConfig = require('./getUserConfig')

const {globalEntrypoints, skipGlobal, globalName} = userLumeConfig

// split by '/' in case a name is scoped, f.e. `@awaitbox/document-ready`
const pkgNameParts = pkg.name.split('/')
const lastPkgNamePart = pkgNameParts[pkgNameParts.length - 1]
const NAME = globalName === false || globalName === '' ? '' : globalName || camelcase(lastPkgNamePart)
// ^ Note, and empty string means no global variable will be assigned for the
// library (as per Webpack's output.library option).

let DEV = false

// --watch option means dev mode
if (
	process.argv.includes('--watch') ||
	process.argv.includes('--dev') ||
	(process.env.NODE_ENV && process.env.NODE_ENV.startsWith('dev'))
) {
	DEV = true
}

/** @type {import('webpack').Configuration} */
const baseConfig = {
	output: {
		library: NAME
			? {
					name: NAME,
					type: 'assign-properties',
			  }
			: {
					name: '__IGNORE_THIS_PLACEHOLDER_VARIABLE__',
					type: 'var',
			  },

		// Leaving the default hash function in Webpack 5 causes Webpack to crash with Node 17+.
		hashFunction: 'xxhash64',
	},
	resolve: {
		modules: utils.alsoResolveRelativeToThisPackage(),

		alias: {
			'solid-js': path.join(CWD, 'node_modules', 'solid-js'),
		},

		// for now only bundle JS files
		// TODO add a separate step for Babel after TypeScript (f.e. for JSX
		// files). TS can handle only React-form of JSX, but we'll need Babel in
		// order to compile Solid JSX.
		extensions: ['.js'],
	},
	resolveLoader: {
		modules: utils.alsoResolveRelativeToThisPackage(),
	},
	module: {
		rules: [
			// TODO seems source maps aren't feeding to Karma correctly, so
			// errors in test files don't always point to src files but to lines
			// in the webpack bundle.
			{
				test: /\.js$/,
				use: ['source-map-loader'],
				enforce: 'pre',
			},
		],
	},
	devtool: DEV ? 'source-map' : 'source-map',
	mode: DEV ? 'development' : 'production',
	optimization: {
		// default is false in dev, true in prod, but let's keep them the same
		// so we can detect the same errors in both environments because module
		// concantenation can change code meaning sometimes.
		concatenateModules: true,
	},
	stats: {
		assets: false, // shows all output assets
	},
}

if (skipGlobal && !(globalEntrypoints && globalEntrypoints.length)) {
	console.log('No global scripts to build, skipping.')
	process.exit(0)
}

/** @type {import('webpack').Configuration[]} */
const configs = []

// Keep backwards compat with the old global build based on src/index.ts.
if (!skipGlobal) {
	configs.push({
		...baseConfig,
		// TODO skip this global build if there's no dist/index
		entry: `./dist/index`,
		output: {
			...baseConfig.output,
			// TODO in a breaking change, also output this to dist/global
			path: path.join(CWD, 'dist'),
			filename: 'global.js',
		},
	})
}

// This is the new way: the cli user specifies one or more entry points.
if (globalEntrypoints && globalEntrypoints.length) {
	globalEntrypoints.forEach(fileNameWithoutExtension => {
		configs.push({
			...baseConfig,
			entry: `./dist/${fileNameWithoutExtension}`,
			output: {
				...baseConfig.output,
				path: path.join(CWD, 'dist', 'global'),
				filename: fileNameWithoutExtension + '.js',
			},
		})
	})
}

if (!configs.length) {
	console.log('No global scripts to build, skipping.')
	process.exit(0)
}

userLumeConfig.webpackConfigs?.(configs)

module.exports = configs
