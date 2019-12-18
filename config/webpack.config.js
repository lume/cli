const CWD = process.cwd()
const camelcase = require('camelcase')
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const r = require('regexr').default
const babelConfig = require('./babel.config')
const pkg = require(path.resolve(CWD, 'package.json'))
const foo = 123
const builderConfig = fs.existsSync(CWD + '/builder.config.js') ? require(CWD + '/builder.config.js') : {}

// split by '/' in case a name is scoped, f.e. `@awaitbox/document-ready`
const pkgNameParts = pkg.name.split('/')
const lastPkgNamePart = pkgNameParts[pkgNameParts.length - 1]
const globalName = builderConfig.globalName
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

const alsoResolveRelativeToArchetype = () => [
	// when the ARCHETYPE is `npm link`ed, or in older versions of NPM, loaders
	// will be found in the ARCHETYPE's node_modules.
	path.relative(CWD, path.join(path.dirname(require.resolve('builder-js-package')), 'node_modules')),

	// otherwise, loaders can also be found in the app's node_modules when deps
	// are flattened (f.e. when the ARCHETYPE is not `npm link`ed and using NPM v3+).
	'node_modules',
]

const allExceptModulesToCompile = builderConfig.nodeModulesToCompile
	? builderConfig.nodeModulesToCompile.map(mod => r`/node_modules(?!\/${r.escape(mod)}\/)/`)
	: []

module.exports = {
	entry: './src/index',
	output: {
		path: CWD,
		filename: 'global.js',
		library: NAME,
		libraryTarget: 'var', // alternative: "window"
	},
	resolve: {
		modules: alsoResolveRelativeToArchetype(),
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
	},
	resolveLoader: {
		modules: alsoResolveRelativeToArchetype(),
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				use: [
					{
						loader: 'babel-loader',
						options: babelConfig,
					},
				],
				include: [path.resolve(CWD, 'src')],
				exclude: allExceptModulesToCompile,
			},
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'babel-loader',
						options: babelConfig,
					},
					{
						loader: 'ts-loader',
					},
				],
				include: [path.resolve(CWD, 'src')],
				exclude: allExceptModulesToCompile,
			},
		],
	},
	plugins: [
		// by default, Webpack uses this plugin in production mode. By
		// specifying it here, we can force it to be used in both dev and prod
		// modes, so that we can ensure consistency and catch errors while in
		// dev that we otherwise may not catch if the prod environment is too
		// different.
		new webpack.optimize.ModuleConcatenationPlugin(),
	],
	devtool: DEV ? 'source-map' : 'source-map',
	// mode: DEV ? 'development' : 'production',
	mode: 'production',
	optimization: {
		// minimize: DEV ? false : true
		minimize: false,
	},
	stats: {
		assets: false, // shows all output assets
	},
}
