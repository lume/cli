// TODO: Karma is deprecated. Switch to web-test-runner.

// @ts-check
const path = require('path')
const utils = require('./utils')
const babelConfig = require('./babel.config.base')

const {testSpecFormat = 'jasmine'} = require('./getUserConfig')
const CWD = process.cwd()
const isDebugMode = !!(process.env.KARMA_DEBUG && process.env.KARMA_DEBUG !== 'false')

// 1 week, which still fits in an i32 as needed for setTimeout's second arg
// Note, if the value is larger than fits in an i32, Jasmine will prematurely
// timeout on async tests as if the timeout is 0.
// https://github.com/jasmine/jasmine/issues/1930
const debugAsyncTestTimeout = 1210000000

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
			// When in mocha+chai mode, this proxies jasmine expect syntax
			// (f.e. expect().toBe()) to chai expect syntax (f.e.
			// expect().to.be()).
			...(testSpecFormat === 'jasmine' ? [] : [require.resolve('chai-jasmine/chai-jasmine.js')]),

			// Finally include all the test files after all of the above.
			// They should all have watched:false while we are using karma-webpack.
			...[
				{pattern: 'dist/**/*.test.js', watched: false},
				{pattern: 'dist/**/*.test.jsx', watched: false},
			],
		],

		exclude: [],

		preprocessors: {
			'dist/**/*.test.js': ['webpack', 'sourcemap'],
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
		},

		browsers: ['Chrome'],

		// We use Webpack support for ES Modules. We'll be switching to
		// web-test-runner soon though.
		webpack: webpackConfig,
	})
}

/** @type {import('webpack').Configuration} */
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

		// Prevent duplicates of solid-js or reactivity can break in various
		// ways (f.e. untrack from one solid-js not untracking inside the
		// createEffect of another solid-js).
		alias: {
			'solid-js': path.resolve(process.cwd(), 'node_modules', 'solid-js'),
		},
	},
	resolveLoader: {
		modules: utils.alsoResolveRelativeToThisPackage(),
	},

	output: {
		libraryTarget: 'umd2',

		// Leaving the default hash function in Webpack 5 causes Webpack to crash with Node 17+.
		hashFunction: 'xxhash64',
	},

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
