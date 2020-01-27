// @ts-check
const CWD = process.cwd()

const camelcase = require('camelcase')
const path = require('path')
const webpack = require('webpack')

const pkg = require(path.join(CWD, 'package.json'))
const builderConfig = require('./getBuilderConfig')

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

module.exports = {
	entry: `.${path.sep}dist${path.sep}index`,
	output: {
		path: path.join(CWD, 'dist'),
		filename: 'global.js',
		library: NAME,
		libraryTarget: 'var', // alternative: "window"
	},
	resolve: {
		modules: alsoResolveRelativeToArchetype(),

		// for now only bundle JS files
		// TODO add a separate step for Babel after TypeScript (f.e. for JSX
		// files). TS can handle only React-form of JSX, but we'll need Babel in
		// order to compile Solid JSX.
		extensions: ['.js'],
	},
	resolveLoader: {
		modules: alsoResolveRelativeToArchetype(),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: ['source-map-loader'],
				enforce: 'pre',
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
		minimize: DEV ? false : true,
	},
	stats: {
		assets: false, // shows all output assets
	},
}
