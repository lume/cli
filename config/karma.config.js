// @ts-check
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const babelConfig = require('./babel.config.base')

const {skipGlobal, globalEntrypoints, testSpecFormat = 'jasmine'} = require('./getUserConfig')
const CWD = process.cwd()
const isDebugMode = !!(process.env.KARMA_DEBUG && process.env.KARMA_DEBUG !== 'false')
const skipGlobalBuild = skipGlobal && !(globalEntrypoints && globalEntrypoints.length)
const testGlobals = !!(!skipGlobalBuild && process.env.TEST_GLOBALS && process.env.TEST_GLOBALS !== 'false')

// 1 week, which still fits in an i32 as needed for setTimeout's second arg
// Note, if the value is larger than fits in an i32, Jasmine will prematurely
// timeout on async tests as if the timeout is 0.
// https://github.com/jasmine/jasmine/issues/1930
const debugAsyncTestTimeout = 1210000000

// TODO, once Electron supports native Node ES Modules, then we should remove
// all the Webpack stuff from here and loade ES Modules natively.
//
// Another idea is maybe we can rely on the browser inside of Electron (Chrome)
// for native ES Modules? What would need to happen is our test code would be
// loaded as browser ESM, but we still need to externalize Node dependencies to
// be imported using require() until Node ESM is supported (if ever).

module.exports = function (config) {
	config.set({
		frameworks: [
			...(testSpecFormat === 'jasmine' ? ['jasmine'] : ['mocha', 'chai']),

			// TODO stacktrace doesn't work with latest Karma, but without it
			// stack traces can be harder to debug.
			// https://github.com/sergei-startsev/karma-stacktrace/issues/10
			// 'stacktrace',

			'webpack',
		],

		...(testSpecFormat === 'jasmine'
			? {
					reporters: ['spec'],
			  }
			: {
					reporters: ['mocha'],
					mochaReporter: {showDiff: true},
			  }),

		port: 9876, // karma web server port
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		singleRun: isDebugMode ? false : true,
		concurrency: Infinity,
		// Exit with exit code zero if there are no tests to run. Makes testing opt-in.
		failOnEmptyTestSuite: false,

		basePath: CWD,

		// The order of items in this array matters!
		files: [
			// Include the augment-node-path.js file first, which includes a
			// snippet of code that forces NODE_PATH to include the project's
			// node_modules folder even when karma-eletron in symlinked into the
			// project. See
			// https://github.com/twolfson/karma-electron/issues/44.
			path.resolve(__dirname, 'karma-augment-node-path.js'),

			// Polyfill for `globalThis`
			path.resolve(__dirname, 'karma-globalThis.js'),

			// When in mocha+chai mode, this proxies jasmine expect syntax
			// (f.e. expect().toBe()) to chai expect syntax (f.e.
			// expect().to.be()).
			...(testSpecFormat === 'jasmine' ? [] : [require.resolve('chai-jasmine/chai-jasmine.js')]),

			// Finally include all the test files after all of the above.
			// They should all have watched:false while we are using karma-webpack.
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

		client: {
			...(testSpecFormat === 'jasmine'
				? {
						jasmine: {
							// During debug mode, set the async test timeout to something
							// high, otherwise if a timeout happens while debugging
							// then before/after hooks can fire mid-test and cause
							// confusion.
							timeoutInterval: debugAsyncTestTimeout,
						},
				  }
				: {
						mocha: {
							// Similar to the timeoutInterval for Jasmine.
							timeout: debugAsyncTestTimeout,
						},
				  }),

			useIframe: false,

			// This is a karma-electron option.
			loadScriptsViaRequire: true,
		},

		// Set up a "CustomElectron" launcher that extends karma-electron's
		// default "Electron" launcher, so that we can control options
		// (docs: // https://github.com/twolfson/karma-electron/tree/5.1.1#launcher-configuration)
		browsers: ['CustomElectron'],
		customLaunchers: {
			CustomElectron: {
				base: 'Electron',

				flags: isDebugMode
					? [
							// Alternatively to the `browserWindowOptions.show` option, we can use this
							// option, then open chrome://inspect in Google Chrome and
							// inspect from there.
							// '--remote-debugging-port=9222',
					  ]
					: [],

				browserWindowOptions: {
					// Open the window for debugging with devtools in debug mode.
					show: isDebugMode ? true : false,

					webPreferences: {
						nodeIntegration: true,
						nodeIntegrationInWorker: true,
						nodeIntegrationInSubFrames: true,
						contextIsolation: false,
					},
				},
			},
		},

		// We need Webpack support because the code running through Karma uses
		// ES Module syntax. Once native ES Modules are released in Electron,
		// then karma-webpack will no longer be a requirement and test code will
		// run as-is without any bundling needed.
		webpack: webpackConfig,
	})
}

const webpackConfig = {
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

		// Leaving the default hash function in Webpack 5 causes Webpack to crash with Node 17+.
		hashFunction: 'xxhash64',
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
		// step, and without having to externalize Node builtin modules as
		// they'll be imported via ESM.
	],

	module: {
		// TODO Add a rule to compile Solid JSX with Babel. Until then,
		// lume/cli consumers use Solid's html template tag only.
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

	// Do not shim Node globals like '__dirname' or `__filename`. Use
	// import.meta instead, which is standard in both web and Node.
	node: false,

	plugins: [
		new webpack.DefinePlugin({
			...(process.env.DECORATOR_CAUSES_NONWRITABLE_ERROR !== undefined
				? {
						DECORATOR_CAUSES_NONWRITABLE_ERROR: 'true',
				  }
				: {}),
		}),

		// This is needed because if Webpack fails to build test code,
		// Karma still keeps running, and exits with code 0 instead of
		// non-zero, making it seem that everything passed.
		// https://github.com/ryanclark/karma-webpack/issues/66
		new (class ExitOnErrorWebpackPlugin {
			apply(compiler) {
				compiler.hooks.done.tap('ExitOnErrorWebpackPlugin', stats => {
					if (stats && stats.hasErrors()) {
						// Exit in the next microtask, so that Webpack
						// has a chance to write error output to stderr.
						Promise.resolve().then(() => process.exit(1))
					}
				})
			}
		})(),
	],
}
