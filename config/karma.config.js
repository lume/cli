// @ts-check
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const babelConfig = require('./babel.config.base')

const {skipGlobal, globalEntrypoints} = require('./getUserConfig')
const CWD = process.cwd()
const debugMode = !!(process.env.KARMA_DEBUG && process.env.KARMA_DEBUG !== 'false')
const skipGlobalBuild = skipGlobal && !(globalEntrypoints && globalEntrypoints.length)
const testGlobals = !!(process.env.TEST_GLOBALS && process.env.TEST_GLOBALS !== 'false' && !skipGlobalBuild)

// TODO, once Electron supports native Node ES Modules, then we should remove
// all the Webpack stuff from here and loade ES Modules natively.

module.exports = function (config) {
	config.set({
		frameworks: ['jasmine', 'stacktrace'],
		reporters: ['spec'],
		port: 9876, // karma web server port
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		singleRun: debugMode ? false : true,
		concurrency: Infinity,
		// Exit with exit code zero if there are no tests to run. Makes testing opt-in.
		failOnEmptyTestSuite: false,

		basePath: CWD,

		// Set up a "CustomElectron" launcher that extends karma-electron's
		// default "Electron" launcher, so that we can control options
		// (docs: // https://github.com/twolfson/karma-electron/tree/5.1.1#launcher-configuration)
		browsers: ['CustomElectron'],
		customLaunchers: {
			CustomElectron: {
				base: 'Electron',

				flags: debugMode
					? [
							// If in debug mode, this makes the electron window visible
							// so that we can step through tests using Chromium devtools
							//
							// TODO, when we upgrade to a newer version of
							// karma-electron, we'll need to use the "show"
							// option in browserWindowOptions instead.
							'--show',

							// Alternatively to the --show option, we can use this
							// option, then open chrome://inspect in Google Chrome and
							// inspect from there.
							// '--remote-debugging-port=9222',
					  ]
					: [],

				// TODO, When we upgrade to a newer version of karma-electron,
				// we'll need to explicitly enable Node integration with these options.
				// browserWindowOptions: {
				// 	nodeIntegration: true,
				// 	nodeIntegrationInWorker: true,
				// 	nodeIntegrationInSubFrames: true,
				// },
			},
		},

		// We need Webpack support because the code running through Karma uses
		// ES Module syntax. Once native ES Modules are released in Electron,
		// then karma-webpack will no longer be a requirement and test code will
		// run as-is without any bundling needed.
		webpack: {
			// Make it FAST with development mode, for testing purposes. We
			// don't need to compile test code in production mode with
			// minification or other features that will slow tests down. All we
			// want is to bundle each test's dependencies (unit tests should
			// have minimal dependencies, and not import the entire library
			// being tested, only import specific parts being tested) and send
			// it to the browser.
			mode: 'development',

			// Note, the source map must be inline for karma-sourcemap-loader to
			// pick it up from karma-webpack.
			//
			// If we don't specify this, the default is a devtool that uses
			// eval(), which can be a difficult to debug with (but faster to
			// build). A non-eval option, like 'inline-source-map' option makes
			// the debugging experience better.
			devtool: 'inline-source-map',

			resolve: {
				modules: utils.alsoResolveRelativeToThisPackage(),
				extensions: ['.js', '.jsx'],
			},
			resolveLoader: {
				modules: utils.alsoResolveRelativeToThisPackage(),
			},

			output: {
				// This ensures that any modules listed in externals are
				// imported using CommonJS require calls.
				libraryTarget: 'commonjs2',
			},

			externals: [
				// Ignore Node libs that don't need to be bundled, as well as
				// anything in node_modules, because they'll be require'd. We want
				// to bundle only our code.
				// TODO Set this if user config option "node" is true.
				...require('module').builtinModules,

				// XXX We only mark builtin modules as external. karma-webpack
				// will otherwise bundle code for each test file.

				// TODO Once Electron supports native Node ESM and
				// karma-electron catches up to that, we should ideally be able
				// to remove karma-webpack and run all tests without a build
				// step.
			],

			module: {
				// TODO Add rule to compile Solid JSX with Babel.
				rules: [
					{
						// The source-map-loader tells Webpack to load source
						// maps for any input files. This way the output that
						// Karma will read has source maps that map back to our
						// original source files. Karma-sourcemap-loader will
						// finally read the source maps so that error messages
						// and stack traces from test code shows the correct
						// line numbers.
						test: /\.jsx?$/,
						use: ['source-map-loader'],
						enforce: 'pre',
					},
					{
						test: /\.jsx?$/,
						use: [{loader: 'babel-loader', options: babelConfig}],
					},
					{
						test: /\.(png|jpe?g|gif|svg|obj|mtl|gltf|ya?ml)$/,
						use: [{loader: 'file-loader'}],
					},
				],
			},

			// do not shim node globals like 'process', otherwise the result of
			// things like `process.cwd()` will be '/' instead of the actual
			// working directory.
			// TODO set this to 'false' only if a new user config option "node"
			// is set to true. We may have to see how this works once we upgrade
			// to native ESM when Electron supports that.
			node: false,

			plugins: [
				new webpack.DefinePlugin({
					...(process.env.DECORATOR_CAUSES_NONWRITABLE_ERROR !== undefined
						? {
								DECORATOR_CAUSES_NONWRITABLE_ERROR: 'true',
						  }
						: {}),
				}),
			],
		},

		// The order of items in this array matters!
		files: [
			// Include the augment-node-path.js file first, which includes a
			// snippet of code that forces NODE_PATH to include the project's
			// node_modules folder even when karma-eletron in symlinked into the
			// project. See
			// https://github.com/twolfson/karma-electron/issues/44.
			path.resolve(__dirname, 'karma-augment-node-path.js'),

			// Include all the test files *after* augment-node-path.js.
			...(testGlobals
				? [
						{pattern: 'dist/global*.js', watched: false},
						{pattern: 'dist/global/*.js', watched: false},
				  ]
				: [
						{pattern: 'dist/**/*.test.js', watched: false},
						{pattern: 'dist/**/*.test.jsx', watched: false},
				  ]),
		],

		exclude: testGlobals ? [] : ['dist/global.test.js', 'dist/global/*.test.js'],

		// The augment-node-path.js file does not need to be included here,
		// because it imports only the built-in 'module' module, and otherwise
		// does not benefit from the electron or webpack preprocessors.
		preprocessors: {
			'dist/**/*.test.js': ['electron', 'webpack', 'sourcemap'],
		},

		client: debugMode
			? {}
			: {
					// Prevent a "require is not defined" error in
					// karma-electron
					useIframe: false,
					loadScriptsViaRequire: true,
			  },
	})
}
